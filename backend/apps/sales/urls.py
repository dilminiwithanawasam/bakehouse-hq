"""
URL configurations mapping sales, custom orders, and payments endpoints.
file: backend/apps/sales/urls.py
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.sales.views import SaleViewSet, OrderViewSet, PaymentViewSet

app_name = 'sales'

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'payments', PaymentViewSet, basename='payment')
router.register(r'', SaleViewSet, basename='sale')

urlpatterns = [
    path('', include(router.urls)),
]