"""
API endpoints managing business logic for inventory and factory distribution logistics.
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
    queryset = ProductCategory.objects.all()
    serializer_class = ProductCategorySerializer
    permission_classes = [IsAuthenticated]


class ProductBatchViewSet(viewsets.ModelViewSet):
    queryset = ProductBatch.objects.all()
    serializer_class = ProductBatchSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product'] # Direct match for frontend filter parameter strings (?product=ID)


class OutletViewSet(viewsets.ModelViewSet):
    queryset = Outlet.objects.filter(is_active=True)
    serializer_class = OutletSerializer
    permission_classes = [IsAuthenticated]


class DispatchRequestViewSet(viewsets.ModelViewSet):
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
        return Response({'success': True, 'message': 'Request marked as Approved inside factory registries.'}, status=status.HTTP_200_OK)


class DispatchViewSet(viewsets.ModelViewSet):
    queryset = Dispatch.objects.all()
    serializer_class = DispatchSerializer
    permission_classes = [IsAuthenticated]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.filter(is_active=True)
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'is_active']
    search_fields = ['name', 'sku', 'barcode']

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductSerializer

    @action(detail=True, methods=['put'], permission_classes=[IsAuthenticated])
    def update_stock(self, request, pk=None):
        product = self.get_object()
        serializer = ProductStockUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        old_stock = product.stock
        product.stock = serializer.validated_data['stock']
        product.save()
        return Response({'success': True, 'data': {'old_stock': old_stock, 'new_stock': product.stock}}, status=status.HTTP_200_OK)