"""
Tests for dispatch request and dispatch workflows.
"""

from datetime import timedelta
from types import SimpleNamespace

from django.test import TestCase
from django.utils import timezone

from apps.accounts.models import User
from apps.products.models import (
    ProductCategory,
    Product,
    ProductBatch,
    Outlet,
    DispatchRequest,
    Dispatch,
)
from apps.products.serializers import DispatchRequestSerializer, DispatchSerializer


class DispatchWorkflowTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='dispatch_tester@example.com',
            name='Dispatch Tester',
            password='Password123!',
            role='manager',
        )

        self.category = ProductCategory.objects.create(name='Dispatch Category')
        self.product = Product.objects.create(
            name='Dispatch Product',
            category=self.category,
            price='20.00',
            stock=0,
            min_stock=1,
            sku='DISP-001',
        )
        self.outlet = Outlet.objects.create(
            name='Dispatch Outlet',
        )
        self.batch = ProductBatch.objects.create(
            product=self.product,
            batch_number='DISP-BATCH-001',
            production_date=timezone.now().date() - timedelta(days=1),
            expiry_date=timezone.now().date() + timedelta(days=5),
            quantity_produced=20,
            current_quantity=20,
        )

    def test_dispatch_request_serializer_create_sets_pending_status(self):
        payload = {
            'outlet': self.outlet.id,
            'product': self.product.id,
            'quantity_requested': 5,
            'notes': 'Dispatch request test',
        }

        serializer = DispatchRequestSerializer(data=payload, context={'request': SimpleNamespace(user=self.user)})
        self.assertTrue(serializer.is_valid(), serializer.errors)

        dispatch_request = serializer.save()
        self.assertEqual(dispatch_request.status, 'pending')

    def test_dispatch_request_approve_updates_status(self):
        dispatch_request = DispatchRequest.objects.create(
            outlet=self.outlet,
            product=self.product,
            quantity_requested=5,
        )

        self.assertEqual(dispatch_request.status, 'pending')
        dispatch_request.status = 'approved'
        dispatch_request.save()
        self.assertEqual(dispatch_request.status, 'approved')

    def test_dispatch_save_decrements_batch_and_updates_product_stock(self):
        dispatch_request = DispatchRequest.objects.create(
            outlet=self.outlet,
            product=self.product,
            quantity_requested=5,
            status='approved',
        )

        payload = {
            'request': dispatch_request.id,
            'batch': self.batch.id,
            'quantity_dispatched': 5,
        }

        serializer = DispatchSerializer(data=payload)
        self.assertTrue(serializer.is_valid(), serializer.errors)

        dispatch = serializer.save()

        self.batch.refresh_from_db()
        self.product.refresh_from_db()

        self.assertEqual(dispatch.quantity_dispatched, 5)
        self.assertEqual(self.batch.current_quantity, 15)
        self.assertEqual(self.product.stock, 15)
        self.assertEqual(dispatch.request, dispatch_request)

    def test_dispatch_serializer_rejects_unapproved_request_and_mismatched_batch(self):
        unapproved_request = DispatchRequest.objects.create(
            outlet=self.outlet,
            product=self.product,
            quantity_requested=5,
        )
        another_product = Product.objects.create(
            name='Other Product',
            category=self.category,
            price='5.00',
            stock=0,
            min_stock=1,
            sku='DISP-002',
        )
        mismatched_batch = ProductBatch.objects.create(
            product=another_product,
            batch_number='DISP-BATCH-002',
            production_date=timezone.now().date() - timedelta(days=1),
            expiry_date=timezone.now().date() + timedelta(days=5),
            quantity_produced=10,
            current_quantity=10,
        )

        invalid_payload = {
            'request': unapproved_request.id,
            'batch': self.batch.id,
            'quantity_dispatched': 5,
        }
        invalid_serializer = DispatchSerializer(data=invalid_payload)
        self.assertFalse(invalid_serializer.is_valid())
        self.assertIn('non_field_errors', invalid_serializer.errors)

        payload_mismatch = {
            'request': unapproved_request.id,
            'batch': mismatched_batch.id,
            'quantity_dispatched': 5,
        }
        mismatch_serializer = DispatchSerializer(data=payload_mismatch)
        self.assertFalse(mismatch_serializer.is_valid())
        self.assertIn('non_field_errors', mismatch_serializer.errors)
