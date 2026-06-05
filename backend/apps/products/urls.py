"""
URL router directory mapping network requests to matching view configurations.
file: backend/apps/products/urls.py
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.products.views import (
    ProductViewSet, ProductCategoryViewSet, ProductBatchViewSet,
    OutletViewSet, DispatchRequestViewSet, DispatchViewSet
)

app_name = 'products'

router = DefaultRouter()
# Standalone sub-routes mapped explicitly ahead of base product configurations
router.register(r'categories', ProductCategoryViewSet, basename='category')
router.register(r'batches', ProductBatchViewSet, basename='batch')
router.register(r'outlets', OutletViewSet, basename='outlet')
router.register(r'dispatch_requests', DispatchRequestViewSet, basename='dispatch_request')
router.register(r'dispatches', DispatchViewSet, basename='dispatch')
router.register(r'', ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
]