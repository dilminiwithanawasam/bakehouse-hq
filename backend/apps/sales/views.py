"""
Views for handling Point-of-Sale logs, advanced custom order workflows, and payments.
file: backend/apps/sales/views.py
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.db.models import Sum, Count
from django.utils import timezone

from apps.sales.models import Sale, Order, Payment
from apps.sales.serializers import (
    SaleSerializer, SaleCreateSerializer, SaleVoidSerializer,
    OrderSerializer, PaymentSerializer
)


class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.select_related('cashier').prefetch_related('items').order_by('-date')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['date', 'cashier', 'payment_method', 'is_void']
    search_fields = ['reference_number', 'notes']

    def get_queryset(self):
        queryset = Sale.objects.select_related('cashier').prefetch_related('items').order_by('-date')
        params = self.request.query_params

        product_id = params.get('product')
        category_id = params.get('category')
        batch_id = params.get('batch')
        salesperson_id = params.get('salesperson')

        if product_id:
            queryset = queryset.filter(items__product_id=product_id)
        if category_id:
            queryset = queryset.filter(items__product__category_id=category_id)
        if batch_id:
            queryset = queryset.filter(items__batch_id=batch_id)
        if salesperson_id:
            queryset = queryset.filter(cashier_id=salesperson_id)

        return queryset.distinct()

    def get_serializer_class(self):
        if self.action == 'create':
            return SaleCreateSerializer
        return SaleSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        try:
            sale = serializer.save()
            return Response({'success': True, 'message': 'Sale recorded successfully', 'data': SaleSerializer(sale).data}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'success': False, 'error': {'message': str(e)}}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def void(self, request, pk=None):
        sale = self.get_object()
        sale.void_sale(request.user, request.data.get('reason', 'Not specified'))
        return Response({'success': True, 'data': SaleSerializer(sale).data}, status=status.HTTP_200_OK)


# 🌟 NEW: ViewSet handling Advanced Orders Management (SRS 4.5)
class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().prefetch_related('payments')
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['status', 'pickup_date']
    search_fields = ['customer_name', 'reference_number']


# 🌟 NEW: ViewSet tracking payment logs against orders
class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['order']