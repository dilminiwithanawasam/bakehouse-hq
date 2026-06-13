"""
Product, Batch, Outlet, and Dispatch models for advanced supply chain tracking.
Aligns code with BakeryHUB SRS Chapter 4 (System Feature 2 & 4) and handles frontend integration.
file: backend/apps/products/models.py
"""

from django.db import models
from django.core.validators import MinValueValidator
from django.conf import settings
from apps.core.models import TimeStampedModel
from datetime import timedelta


class ProductCategory(TimeStampedModel):
    """Product categories for structural menu grouping."""
    name = models.CharField(max_length=100, unique=True, db_index=True)
    description = models.TextField(null=True, blank=True)
    display_order = models.IntegerField(default=0)

    class Meta:
        db_table = 'products_category'
        ordering = ['display_order', 'name']
        verbose_name = 'Product Category'
        verbose_name_plural = 'Product Categories'

    def __str__(self):
        return self.name


class Product(TimeStampedModel):
    """Represents static bakery item definitions and master shelf-life constants."""
    name = models.CharField(max_length=255, db_index=True)
    category = models.ForeignKey(ProductCategory, on_delete=models.PROTECT, related_name='products')
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    
    # Freshness Parameter (SRS Section 4.4)
    shelf_life_days = models.IntegerField(default=3, validators=[MinValueValidator(1)])
    
    # UI Layout Form Parameters (SRS UI 4 Layout)
    measurement_type = models.CharField(max_length=50, default="units")
    max_stock_limit = models.IntegerField(default=100, validators=[MinValueValidator(0)])
    
    stock = models.IntegerField(default=0, validators=[MinValueValidator(0)], db_index=True)
    min_stock = models.IntegerField(default=10, validators=[MinValueValidator(0)])
    sku = models.CharField(max_length=50, unique=True, null=True, blank=True)
    barcode = models.CharField(max_length=50, unique=True, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    image_url = models.URLField(null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)
    
    last_stock_check = models.DateTimeField(null=True, blank=True)
    total_sold = models.IntegerField(default=0)
    total_wasted = models.IntegerField(default=0)

    class Meta:
        db_table = 'products_product'
        ordering = ['category', 'name']
        verbose_name = 'Product'
        verbose_name_plural = 'Products'

    def __str__(self):
        return self.name

    def update_stock_from_batches(self):
        self.stock = sum(b.current_quantity or 0 for b in self.batches.filter(is_active=True))
        self.save()

    @property
    def status(self):
        if self.stock == 0:
            return 'out_of_stock'
        elif self.stock <= self.min_stock:
            return 'critical'
        elif self.stock <= self.min_stock * 1.5:
            return 'low'
        return 'healthy'


class Outlet(TimeStampedModel):
    """Represents a retail storefront branch instance (SRS Section 2.3 & 4.3)."""
    name = models.CharField(max_length=255, unique=True)
    code = models.CharField(max_length=50, unique=True,null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'products_outlet'
        ordering = ['name']

    def __str__(self):
        return self.name


class ProductBatch(TimeStampedModel):
    """Tracks standalone baking production runs to enable automated FIFO logic (SRS 4.4)."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='batches')
    batch_number = models.CharField(max_length=100, unique=True, db_index=True)
    
    # 🌟 UPDATED: Made nullable to pass local migration checks smoothly
    production_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(blank=True, null=True, db_index=True)
    
    # 🌟 UPDATED: Added null=True, blank=True to prevent the next fields from blocking you
    quantity_produced = models.IntegerField(validators=[MinValueValidator(0)], null=True, blank=True)
    current_quantity = models.IntegerField(validators=[MinValueValidator(0)], null=True, blank=True)
    
    outlet_assignment = models.ForeignKey(Outlet, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = 'products_batch'
        ordering = ['expiry_date', 'created_at'] # Enforces FIFO data loops

    def __str__(self):
        return f"{self.product.name} - Batch {self.batch_number}"

    def save(self, *args, **kwargs):
        """Automates expiration formula calculations: Mfg Date + Shelf Life (SRS 4.4)"""
        if not self.expiry_date and self.production_date and self.product:
            self.expiry_date = self.production_date + timedelta(days=self.product.shelf_life_days)
        super().save(*args, **kwargs)
        if self.product:
            self.product.update_stock_from_batches()


class DispatchRequest(TimeStampedModel):
    """Outlets requesting fresh batches digitally from the central factory kitchen (SRS 4.2)."""
    STATUS_CHOICES = [('pending', 'Pending'), ('approved', 'Approved'), ('completed', 'Completed')]
    outlet = models.ForeignKey(Outlet, on_delete=models.CASCADE, related_name='dispatch_requests')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity_requested = models.IntegerField(validators=[MinValueValidator(1)])
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'products_dispatch_request'
        ordering = ['-created_at']


class Dispatch(TimeStampedModel):
    """Tracks driver distribution and vehicle transit status metrics (SRS UI 1 Layout)."""
    STATUS_CHOICES = [('packed', 'Packed'), ('en_route', 'En Route'), ('delivered', 'Delivered')]
    request = models.ForeignKey(DispatchRequest, on_delete=models.SET_NULL, null=True, blank=True)
    outlet = models.ForeignKey(Outlet, on_delete=models.CASCADE,null=True, blank=True)
    batch = models.ForeignKey(ProductBatch, on_delete=models.CASCADE,null=True, blank=True)
    quantity_dispatched = models.IntegerField(validators=[MinValueValidator(1)])
    driver_name = models.CharField(max_length=255, default="Unassigned")
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='packed')

    class Meta:
        db_table = 'products_dispatch'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if is_new and self.batch and self.quantity_dispatched:
            if self.batch.current_quantity is not None:
                self.batch.current_quantity -= self.quantity_dispatched
                self.batch.save()
            if self.batch.product:
                self.batch.product.update_stock_from_batches()
        super().save(*args, **kwargs)


class StockAdjustment(TimeStampedModel):
    """Tracks data manipulation audits for inventory safety reporting."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='adjustments')
    quantity = models.IntegerField()
    reason = models.CharField(max_length=100)
    old_stock = models.IntegerField()
    new_stock = models.IntegerField()
    notes = models.TextField(null=True, blank=True)
    adjusted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    class Meta:
        db_table = 'products_stock_adjustment'
        ordering = ['-created_at']