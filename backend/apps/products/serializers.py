"""
Serializers for mapping product models into lightweight frontend JSON streams.
file: backend/apps/products/serializers.py
"""

from rest_framework import serializers
from apps.products.models import Product, ProductCategory, ProductBatch, Outlet, DispatchRequest, Dispatch


class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = ['id', 'name', 'description', 'display_order', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    status = serializers.CharField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'category', 'category_name', 'price', 'stock', 
            'min_stock', 'status', 'sku', 'barcode', 'description', 
            'image_url', 'is_active', 'total_sold', 'total_wasted', 'created_at'
        ]


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ['name', 'category', 'price', 'stock', 'min_stock', 'sku', 'barcode', 'description', 'image_url', 'is_active']


class ProductStockUpdateSerializer(serializers.Serializer):
    stock = serializers.IntegerField(min_value=0)
    reason = serializers.CharField(max_length=50, default='manual_adjustment')
    notes = serializers.CharField(required=False, allow_blank=True, max_length=500)


class ProductBatchSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    outlet_name = serializers.CharField(source='outlet_assignment.name', read_only=True)

    class Meta:
        model = ProductBatch
        fields = ['id', 'product', 'product_name', 'batch_number', 'production_date', 'expiry_date', 'quantity_produced', 'current_quantity', 'outlet_assignment', 'outlet_name', 'is_active']


class OutletSerializer(serializers.ModelSerializer):
    class Meta:
        model = Outlet
        fields = ['id', 'name', 'code', 'location', 'is_active']


class DispatchRequestSerializer(serializers.ModelSerializer):
    outlet_name = serializers.CharField(source='outlet.name', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = DispatchRequest
        fields = ['id', 'outlet', 'outlet_name', 'product', 'product_name', 'quantity_requested', 'status', 'notes', 'created_at']


class DispatchSerializer(serializers.ModelSerializer):
    outlet_name = serializers.CharField(source='outlet.name', read_only=True)
    product_name = serializers.CharField(source='batch.product.name', read_only=True)
    batch_number = serializers.CharField(source='batch.batch_number', read_only=True)

    class Meta:
        model = Dispatch
        fields = ['id', 'request', 'outlet', 'outlet_name', 'batch', 'batch_number', 'product_name', 'quantity_dispatched', 'driver_name', 'status', 'created_at']

    def validate(self, attrs):
        request = attrs.get('request')
        batch = attrs.get('batch')
        if request and request.status != 'approved':
            raise serializers.ValidationError("Cannot dispatch for an unapproved request.")
        if request and batch and batch.product != request.product:
            raise serializers.ValidationError("Selected batch product does not match requested product.")
        return attrs