"""
API endpoints managing business logic for inventory and factory distribution logistics.
Fully supports full CRUD workflows (including editing product and batch records).
file: backend/apps/products/views.py
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from apps.products.models import Product, ProductCategory, ProductBatch, Outlet, DispatchRequest, Dispatch
from apps.products.serializers import (
    ProductSerializer, ProductCreateUpdateSerializer, ProductCategorySerializer,
    ProductStockUpdateSerializer, ProductBatchSerializer, OutletSerializer,
    DispatchRequestSerializer, DispatchSerializer
)


class ProductCategoryViewSet(viewsets.ModelViewSet):
    """
    Handles structural grouping categories.
    Natively supports full CRUD (Create, Read, Update, Delete).
    """
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    permission_classes = [IsAuthenticated]


class ProductBatchViewSet(viewsets.ModelViewSet):
    """
    Handles single baking manufacturing production runs.
    Natively supports full CRUD—including editing batch quantities, dates, or assignments via PUT/PATCH.
    """
    queryset = ProductBatch.objects.all()
    serializer_class = ProductBatchSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product']  # Handles frontend filter chains (?product=ID)


class OutletViewSet(viewsets.ModelViewSet):
    """
    Handles standalone retail storefront branch listings.
    Natively supports full CRUD.
    """
    queryset = Outlet.objects.filter(is_active=True)
    serializer_class = OutletSerializer
    permission_classes = [IsAuthenticated]


class DispatchRequestViewSet(viewsets.ModelViewSet):
    """
    Tracks request logs coming from storefronts into the central kitchen hub.
    Natively supports full CRUD.
    """
    queryset = DispatchRequest.objects.all()
    serializer_class = DispatchRequestSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def approve(self, request, pk=None):
        """POST /api/v1/products/dispatch_requests/{id}/approve/"""
        dispatch_req = self.get_object()
        dispatch_req.status = 'approved'
        dispatch_req.save()
        return Response(
            {'success': True, 'message': 'Request marked as Approved inside factory registries.'}, 
            status=status.HTTP_200_OK
        )


class DispatchViewSet(viewsets.ModelViewSet):
    """
    Monitors transit and driver distribution logistics records.
    Natively supports full CRUD.
    """
    queryset = Dispatch.objects.all()
    serializer_class = DispatchSerializer
    permission_classes = [IsAuthenticated]


class ProductViewSet(viewsets.ModelViewSet):
    """
    Tracks the primary master inventory catalog blueprint profiles.
    Natively supports full CRUD—including editing base details like price, title, or shelf constants.
    """
    queryset = Product.objects.filter(is_active=True)
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'is_active']
    search_fields = ['name', 'sku', 'barcode']

    def get_serializer_class(self):
        """
        Dynamically routes read operations to detailed schemas, 
        and routes write/edit adjustments to input schemas.
        """
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductSerializer

    @action(detail=True, methods=['put'], permission_classes=[IsAuthenticated])
    def update_stock(self, request, pk=None):
        """PUT /api/v1/products/{id}/update_stock/"""
        product = self.get_object()
        serializer = ProductStockUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        old_stock = product.stock
        product.stock = serializer.validated_data['stock']
        product.save()
        return Response(
            {'success': True, 'data': {'old_stock': old_stock, 'new_stock': product.stock}}, 
            status=status.HTTP_200_OK
        )