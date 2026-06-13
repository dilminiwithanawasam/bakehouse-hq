"""
URL configuration for reports endpoints.
"""

from django.urls import path
from apps.reports.views import (
    dashboard_view,
    sales_report_view,
    sales_report_pdf_view,
    wastage_report_view,
)

app_name = 'reports'

urlpatterns = [
    path('dashboard/', dashboard_view, name='dashboard'),
    path('sales/', sales_report_view, name='sales_report'),
    path('sales/pdf/', sales_report_pdf_view, name='sales_report_pdf'),
    path('wastage/', wastage_report_view, name='wastage_report'),
]
