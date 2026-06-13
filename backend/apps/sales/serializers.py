"""
Serializers for immediate retail sales, advanced custom orders, and payments.
file: backend/apps/sales/serializers.py
"""

from rest_framework import serializers
from decimal import Decimal
from apps.sales.models import Sale, SaleItem, Order, Payment


class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    batch_number = serializers.CharField(source='batch.batch_number', read_only=True)

    class Meta:
        model = SaleItem
        fields = ['id', 'product', 'product_name', 'batch', 'batch_number', 'quantity', 'unit_price', 'discount_amount', 'line_total']


class SaleItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleItem
        fields = ['product', 'batch', 'quantity', 'unit_price', 'discount_amount']


class SaleSerializer(serializers.ModelSerializer):
    cashier_name = serializers.CharField(source='cashier.name', read_only=True)
    items = SaleItemSerializer(many=True, read_only=True)

    class Meta:
        model = Sale
        fields = ['id', 'date', 'reference_number', 'cashier', 'cashier_name', 'subtotal', 'tax_amount', 'discount_amount', 'total', 'payment_method', 'items', 'is_void', 'notes', 'created_at']
        read_only_fields = ['id', 'reference_number', 'subtotal', 'created_at']


class SaleCreateSerializer(serializers.Serializer):
    date = serializers.DateField(required=True)
    payment_method = serializers.CharField(default='cash', max_length=50)
    tax_amount = serializers.DecimalField(max_digits=12, decimal_places=2, default=0)
    discount_amount = serializers.DecimalField(max_digits=12, decimal_places=2, default=0)
    items = SaleItemCreateSerializer(many=True)
    notes = serializers.CharField(required=False, allow_blank=True, max_length=500)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('At least one item is required to check out.')
        return value

    def create(self, validated_data):
        from apps.sales.models import Sale, SaleItem
        from apps.products.models import StockAdjustment
        
        items_data = validated_data.pop('items')
        subtotal = sum(Decimal(item['quantity']) * item['unit_price'] - item.get('discount_amount', 0) for item in items_data)
        total = subtotal + validated_data.get('tax_amount', 0) - validated_data.get('discount_amount', 0)
        
        sale = Sale.objects.create(subtotal=subtotal, total=total, **validated_data, cashier=self.context['request'].user)
        
        for item_data in items_data:
            product = item_data['product']
            batch = item_data.get('batch')
            quantity = item_data['quantity']
            
            if batch:
                if batch.current_quantity < quantity:
                    raise serializers.ValidationError(f"Insufficient stock in Batch #{batch.batch_number} for {product.name}.")
                batch.current_quantity -= quantity
                batch.save()
            else:
                if product.stock < quantity:
                    raise serializers.ValidationError(f"Insufficient stock total for {product.name}.")
            
            product.stock -= quantity
            product.total_sold += quantity
            product.save()
            
            SaleItem.objects.create(
                sale=sale,
                line_total=Decimal(quantity) * item_data['unit_price'] - item_data.get('discount_amount', 0),
                **item_data,
            )
            
            StockAdjustment.objects.create(
                product=product, quantity=-quantity, reason='sale',
                old_stock=product.stock + quantity, new_stock=product.stock, sale=sale,
                adjusted_by=self.context['request'].user
            )
        return sale


class SaleVoidSerializer(serializers.Serializer):
    reason = serializers.CharField(max_length=500)


# 🌟 NEW: Serializers to support Advanced Custom Orders and Payment workflows
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'order', 'amount', 'payment_method', 'reference_number', 'created_at']


class OrderSerializer(serializers.ModelSerializer):
    payments = PaymentSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'reference_number', 'customer_name', 'customer_email', 'customer_phone', 'pickup_date', 'status', 'total', 'notes', 'payments', 'created_at']
        read_only_fields = ['id', 'reference_number', 'created_at']