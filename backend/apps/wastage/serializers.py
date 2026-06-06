"""
Serializers for wastage management.
"""

from rest_framework import serializers
from decimal import Decimal
from apps.wastage.models import Wastage
from apps.products.serializers import ProductSerializer
from apps.products.models import StockAdjustment
from rest_framework import serializers
from decimal import Decimal
from apps.wastage.models import Wastage
from apps.products.serializers import ProductSerializer
from apps.products.models import StockAdjustment

class WastageSerializer(serializers.ModelSerializer):
    """Serializer for wastage representation."""
    
    product_name = serializers.CharField(source='product.name', read_only=True)
    batch_number = serializers.CharField(source='batch.batch_number', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.name', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.name', read_only=True)
    product_details = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = Wastage
        fields = [
            'id', 'date', 'reference_number', 'product', 'product_name',
            'batch', 'batch_number', 'product_details', 'quantity',
            'reason', 'unit_cost', 'loss', 'recorded_by',
            'recorded_by_name', 'notes', 'is_approved', 'approved_by',
            'approved_by_name', 'approved_at', 'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'reference_number', 'loss', 'created_at', 'updated_at',
        ]


class WastageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Wastage
        fields = ['date', 'product', 'batch', 'quantity', 'reason', 'unit_cost', 'notes']

    def create(self, validated_data):
        user = self.context['request'].user
        quantity = validated_data.get('quantity', 0)
        unit_cost = validated_data.get('unit_cost', 0)
        
        # 1. Create instance with recorded_by
        wastage = Wastage(
            **validated_data,
            
            loss=Decimal(str(quantity)) * Decimal(str(unit_cost))
        )
        wastage.save()
        
        # 2. Adjust Inventory (Single batch/product logic)
        product = validated_data['product']
        batch = validated_data.get('batch')
        
        if batch:
            batch.current_quantity -= quantity
            batch.save()
            
        product.total_wasted += quantity
        product.stock -= quantity 
        product.save(update_fields=['total_wasted', 'stock'])
        
        # 3. Log Audit
        StockAdjustment.objects.create(
            product=product,
            quantity=-quantity,
            reason='wastage',
            old_stock=product.stock + quantity,
            new_stock=product.stock,
            notes=f"Wastage ID: {wastage.id} | User: {user}"
        )
        
        return wastage

def create(self, validated_data):
        from apps.products.models import StockAdjustment
        
        # 1. Manually extract the user from the context
        user = self.context['request'].user
        
        # 2. Calculate loss explicitly
        quantity = validated_data.get('quantity', 0)
        unit_cost = validated_data.get('unit_cost', 0)
        validated_data['loss'] = Decimal(str(quantity)) * Decimal(str(unit_cost))
        
        # 3. Create the instance, passing the user directly here
        wastage = Wastage(
            **validated_data,
            recorded_by=user  # Assigning here ensures it's available for the save() call
        )
        wastage.save()
        
        # 4. Inventory logic
        batch = validated_data.get('batch')
        product = validated_data['product']

        if batch:
            batch.current_quantity -= quantity
            batch.save()
            
        product.stock -= quantity 
        product.save(update_fields=['stock'])
        
        # 5. Log adjustment
        StockAdjustment.objects.create(
            product=product,
            quantity=-quantity,
            reason='wastage',
            old_stock=product.stock + quantity,
            new_stock=product.stock,
            notes=f"Wastage ID: {wastage.id} | User: {user}"
        )
        
        return wastage

class WastageApproveSerializer(serializers.Serializer):
    """Serializer for approving wastage records."""
    pass