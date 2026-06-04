"""
Admin configurations for the products and supply chain tracking application.
Fully aligned with the upgraded models.py structure to prevent E108 errors.
file: backend/apps/products/admin.py
"""

from django.contrib import admin
from apps.products.models import (
    Product, 
    ProductCategory, 
    Outlet, 
    ProductBatch, 
    DispatchRequest, 
    Dispatch, 
    StockAdjustment
)


@admin.register(ProductCategory)
class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'display_order', 'created_at']
    search_fields = ['name']
    ordering = ['display_order', 'name']


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    # 🌟 Fixed: Contains only valid model fields and active model properties
    list_display = ['name', 'category', 'price', 'stock', 'min_stock', 'measurement_type', 'status', 'is_active']
    list_filter = ['category', 'is_active', 'created_at']
    search_fields = ['name', 'sku', 'barcode']
    ordering = ['category', 'name']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'category', 'description', 'sku', 'barcode', 'image_url')
        }),
        ('Pricing & Inventory Constraints', {
            'fields': ('price', 'stock', 'min_stock', 'max_stock_limit', 'measurement_type', 'shelf_life_days')
        }),
        ('Performance Metrics', {
            'fields': ('total_sold', 'total_wasted', 'last_stock_check'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['total_sold', 'total_wasted', 'last_stock_check', 'created_at', 'updated_at']


@admin.register(Outlet)
class OutletAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'location', 'is_active']
    search_fields = ['name', 'code']
    list_filter = ['is_active']


@admin.register(ProductBatch)
class ProductBatchAdmin(admin.ModelAdmin):
    list_display = ['batch_number', 'product', 'production_date', 'expiry_date', 'quantity_produced', 'current_quantity', 'outlet_assignment', 'is_active']
    list_filter = ['production_date', 'expiry_date', 'is_active', 'outlet_assignment']
    search_fields = ['batch_number', 'product__name']
    ordering = ['expiry_date']


@admin.register(DispatchRequest)
class DispatchRequestAdmin(admin.ModelAdmin):
    list_display = ['id', 'outlet', 'product', 'quantity_requested', 'status', 'created_at']
    list_filter = ['status', 'outlet']
    search_fields = ['product__name', 'notes']


@admin.register(Dispatch)
class DispatchAdmin(admin.ModelAdmin):
    list_display = ['id', 'outlet', 'batch', 'quantity_dispatched', 'driver_name', 'status', 'created_at']
    list_filter = ['status', 'driver_name']
    search_fields = ['batch__batch_number', 'driver_name']


@admin.register(StockAdjustment)
class StockAdjustmentAdmin(admin.ModelAdmin):
    list_display = ['product', 'quantity', 'reason', 'old_stock', 'new_stock', 'created_at']
    list_filter = ['reason', 'created_at']
    search_fields = ['product__name', 'notes']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']