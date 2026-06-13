"""
Sales, Custom Orders, and Payment ledger models.
Fully guarded with flexible validation parameters to eliminate terminal prompts.
file: backend/apps/sales/models.py
"""

from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from decimal import Decimal
from apps.core.models import TimeStampedModel, AuditModel


class Sale(AuditModel):
    """Point of sale (POS) retail transaction model tracking general invoice details."""
    date = models.DateField(db_index=True)
    reference_number = models.CharField(max_length=50, unique=True, null=True, blank=True)
    cashier = models.ForeignKey(
        'accounts.User',
        on_delete=models.PROTECT,
        related_name='sales',
        help_text='User who recorded this sale',
    )
    
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)])
    total = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)], db_index=True)
    
    payment_method = models.CharField(
        max_length=50,
        default='cash',
        choices=[('cash', 'Cash'), ('card', 'Card'), ('check', 'Check'), ('online', 'Online')]
    )
    
    is_void = models.BooleanField(default=False)
    void_reason = models.TextField(null=True, blank=True)
    void_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='void_sales')
    void_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'sales_sale'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"Sale {self.reference_number or self.id} - {self.total}"

    def save(self, *args, **kwargs):
        if not self.reference_number:
            self.reference_number = f"SAL-{self.date.strftime('%Y%m%d')}-{self.id or int(timezone.now().timestamp())}"
        super().save(*args, **kwargs)


class SaleItem(TimeStampedModel):
    """Individual line items within an invoice, linked directly to their production batch run."""
    sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.PROTECT, related_name='sale_items')
    batch = models.ForeignKey('products.ProductBatch', on_delete=models.PROTECT, null=True, blank=True, related_name='sale_items')
    
    quantity = models.IntegerField(validators=[MinValueValidator(1)])
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    line_total = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, validators=[MinValueValidator(0)])

    class Meta:
        db_table = 'sales_item'
        ordering = ['created_at']

    def __str__(self):
        return f"{self.product.name} x{self.quantity}"

    def save(self, *args, **kwargs):
        self.line_total = (Decimal(self.quantity) * self.unit_price) - self.discount_amount
        super().save(*args, **kwargs)


class Order(TimeStampedModel):
    """Tracks custom, advanced online/walk-in cake and catering orders (SRS Section 4.5)."""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('packed', 'Packed'),
        ('ready', 'Ready for Pickup'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    ]
    reference_number = models.CharField(max_length=50, unique=True, null=True, blank=True)
    
    # 🌟 Guarded fields: null=True, blank=True attached to eliminate terminal prompt loops
    customer_name = models.CharField(max_length=255, null=True, blank=True)
    customer_email = models.EmailField(null=True, blank=True)
    customer_phone = models.CharField(max_length=50, null=True, blank=True)
    pickup_date = models.DateField(db_index=True, null=True, blank=True)
    
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, validators=[MinValueValidator(0)])
    notes = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'sales_order'
        ordering = ['-pickup_date', '-created_at']

    def __str__(self):
        return f"Order {self.reference_number or self.id} - {self.customer_name}"

    def save(self, *args, **kwargs):
        if not self.reference_number:
            self.reference_number = f"ORD-{timezone.now().strftime('%Y%m%d')}-{int(timezone.now().timestamp())}"
        super().save(*args, **kwargs)


class Payment(TimeStampedModel):
    """Tracks advance deposits and full balance payments against advanced orders."""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0.01)])
    payment_method = models.CharField(max_length=50, default='cash')
    reference_number = models.CharField(max_length=100, null=True, blank=True)

    class Meta:
        db_table = 'sales_payment'
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment of {self.amount} for Order #{self.order.id}"