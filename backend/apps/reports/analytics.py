"""
Analytics and reporting logic.
"""

from django.db.models import Sum, Count, Avg, F, DecimalField, Value
from django.db.models.functions import TruncDate, Coalesce
from django.utils import timezone
from decimal import Decimal
from datetime import timedelta
from apps.sales.models import Sale
from apps.wastage.models import Wastage
from apps.products.models import Product, ProductCategory


class DashboardAnalytics:
    """Analytics for dashboard KPIs."""

    @staticmethod
    def _apply_product_category_filters(queryset, product_id=None, category_id=None):
        if product_id:
            queryset = queryset.filter(items__product_id=product_id)
        if category_id:
            try:
                category_id_int = int(category_id)
            except (TypeError, ValueError):
                category_id_int = ProductCategory.objects.filter(name__iexact=str(category_id)).values_list('id', flat=True).first()
            if category_id_int is None:
                return queryset.none()
            queryset = queryset.filter(items__product__category_id=category_id_int)
        return queryset

    @staticmethod
    def _apply_wastage_filters(queryset, product_id=None, category_id=None):
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        if category_id:
            try:
                category_id_int = int(category_id)
            except (TypeError, ValueError):
                category_id_int = ProductCategory.objects.filter(name__iexact=str(category_id)).values_list('id', flat=True).first()
            if category_id_int is None:
                return queryset.none()
            queryset = queryset.filter(product__category_id=category_id_int)
        return queryset

    @staticmethod
    def get_today_stats(start_date=None, end_date=None, product_id=None, category_id=None):
        """Get today's key statistics."""
        if start_date and end_date:
            start = start_date
            end = end_date
        else:
            today = timezone.now().date()
            start = today
            end = today

        sales_queryset = Sale.objects.filter(date__gte=start, date__lte=end, is_void=False)
        sales_queryset = DashboardAnalytics._apply_product_category_filters(sales_queryset, product_id=product_id, category_id=category_id)
        total_sales = sales_queryset.aggregate(
            total=Sum('total'),
            count=Count('id'),
        )

        wastage_queryset = Wastage.objects.filter(date__gte=start, date__lte=end)
        wastage_queryset = DashboardAnalytics._apply_wastage_filters(wastage_queryset, product_id=product_id, category_id=category_id)
        total_wastage = wastage_queryset.aggregate(
            loss=Sum('loss'),
            items=Sum('quantity'),
        )

        low_stock = Product.objects.filter(stock__lte=F('min_stock'), is_active=True).count()
        out_of_stock = Product.objects.filter(stock=0, is_active=True).count()

        return {
            'sales': {
                'total_revenue': float(total_sales.get('total') or 0),
                'transaction_count': total_sales.get('count') or 0,
            },
            'wastage': {
                'total_loss': float(total_wastage.get('loss') or 0),
                'total_items': total_wastage.get('items') or 0,
            },
            'stock': {
                'low_stock_count': low_stock,
                'out_of_stock_count': out_of_stock,
            },
        }

    @staticmethod
    def get_period_comparison(days=1, start_date=None, end_date=None, product_id=None, category_id=None):
        """
        Get period-over-period comparison.
        
        Args:
            days: Number of days to compare
        """
        today = timezone.now().date()
        current_start = today - timedelta(days=days - 1)
        current_end = today

        if start_date and end_date:
            current_start = start_date
            current_end = end_date

        prev_start = current_start - timedelta(days=days)
        prev_end = current_start - timedelta(days=1)

        current_sales_queryset = Sale.objects.filter(
            date__gte=current_start,
            date__lte=current_end,
            is_void=False,
        )
        current_sales_queryset = DashboardAnalytics._apply_product_category_filters(current_sales_queryset, product_id=product_id, category_id=category_id)
        current_sales = current_sales_queryset.aggregate(total=Sum('total'), count=Count('id'))

        prev_sales_queryset = Sale.objects.filter(
            date__gte=prev_start,
            date__lte=prev_end,
            is_void=False,
        )
        prev_sales_queryset = DashboardAnalytics._apply_product_category_filters(prev_sales_queryset, product_id=product_id, category_id=category_id)
        prev_sales = prev_sales_queryset.aggregate(total=Sum('total'), count=Count('id'))
        
        current_total = float(current_sales.get('total') or 0)
        prev_total = float(prev_sales.get('total') or 0)
        
        # Calculate change
        if prev_total == 0:
            change_percent = 0 if current_total == 0 else 100
        else:
            change_percent = ((current_total - prev_total) / prev_total) * 100

        # Calculate Daily Trend (dates) for the last 14 days
        十四days_ago = today - timedelta(days=13)
        daily_sales_queryset = Sale.objects.filter(
            date__gte=十四days_ago,
            date__lte=today,
            is_void=False,
        )
        daily_sales_queryset = DashboardAnalytics._apply_product_category_filters(daily_sales_queryset, product_id=product_id, category_id=category_id)
        daily_sales = daily_sales_queryset.values('date').annotate(
            revenue=Sum('total')
        ).order_by('date')
        
        revenue_by_date = {}
        for s in daily_sales:
            d_key = s['date'].isoformat() if hasattr(s['date'], 'isoformat') else str(s['date'])
            revenue_by_date[d_key] = float(s['revenue'] or 0)
            
        dates_list = []
        for i in range(14):
            d = 十四days_ago + timedelta(days=i)
            d_str = d.isoformat()
            dates_list.append({
                'date': d.strftime('%b %d'),
                'revenue': revenue_by_date.get(d_str, 0.0)
            })

        # Calculate Category mix (categories) for today (or fallback 14 days if today is empty)
        from apps.sales.models import SaleItem
        cat_sales_queryset = SaleItem.objects.filter(
            sale__date__gte=current_start,
            sale__date__lte=current_end,
            sale__is_void=False,
        )
        if product_id:
            cat_sales_queryset = cat_sales_queryset.filter(product_id=product_id)
        if category_id:
            try:
                category_id_int = int(category_id)
            except (TypeError, ValueError):
                category_id_int = ProductCategory.objects.filter(name__iexact=str(category_id)).values_list('id', flat=True).first()
            if category_id_int is None:
                cat_sales_queryset = cat_sales_queryset.none()
            else:
                cat_sales_queryset = cat_sales_queryset.filter(product__category_id=category_id_int)
        cat_sales = cat_sales_queryset.values('product__category__name').annotate(
            total=Sum('line_total')
        ).order_by('-total')
        
        categories_list = []
        for cs in cat_sales:
            name = cs['product__category__name'] or "Uncategorized"
            categories_list.append({
                'name': name,
                'total': float(cs['total'] or 0)
            })
            
        if not categories_list:
            cat_sales_14_queryset = SaleItem.objects.filter(
                sale__date__gte=十四days_ago,
                sale__date__lte=today,
                sale__is_void=False,
            )
            if product_id:
                cat_sales_14_queryset = cat_sales_14_queryset.filter(product_id=product_id)
            if category_id:
                try:
                    category_id_int = int(category_id)
                except (TypeError, ValueError):
                    category_id_int = ProductCategory.objects.filter(name__iexact=str(category_id)).values_list('id', flat=True).first()
                if category_id_int is None:
                    cat_sales_14_queryset = cat_sales_14_queryset.none()
                else:
                    cat_sales_14_queryset = cat_sales_14_queryset.filter(product__category_id=category_id_int)
            cat_sales_14 = cat_sales_14_queryset.values('product__category__name').annotate(
                total=Sum('line_total')
            ).order_by('-total')
            for cs in cat_sales_14:
                name = cs['product__category__name'] or "Uncategorized"
                categories_list.append({
                    'name': name,
                    'total': float(cs['total'] or 0)
                })

        # Calculate Hourly sales today (hourly)
        today_sales_hourly_queryset = Sale.objects.filter(
            date=today,
            is_void=False,
        )
        today_sales_hourly_queryset = DashboardAnalytics._apply_product_category_filters(today_sales_hourly_queryset, product_id=product_id, category_id=category_id)
        today_sales_hourly = today_sales_hourly_queryset
        hourly_map = {h: 0.0 for h in range(6, 22)} # 6 AM to 9 PM
        for sale in today_sales_hourly:
            local_time = timezone.localtime(sale.created_at)
            hour = local_time.hour
            if hour in hourly_map:
                hourly_map[hour] += float(sale.total or 0)
                
        hourly_list = []
        for h in range(6, 22):
            am_pm = "AM" if h < 12 else "PM"
            display_hour = h if h <= 12 else h - 12
            if display_hour == 0:
                display_hour = 12
            hourly_list.append({
                'hour': f"{display_hour} {am_pm}",
                'sales': hourly_map[h]
            })
        
        return {
            'current_period': {
                'start_date': current_start.isoformat(),
                'end_date': current_end.isoformat(),
                'total': current_total,
                'transactions': current_sales.get('count') or 0,
                'dates': dates_list,
                'categories': categories_list,
                'hourly': hourly_list
            },
            'previous_period': {
                'start_date': prev_start.isoformat(),
                'end_date': prev_end.isoformat(),
                'total': prev_total,
                'transactions': prev_sales.get('count') or 0,
            },
            'change_percent': round(change_percent, 2),
        }

    @staticmethod
    def get_top_products(limit=10, start_date=None, end_date=None, product_id=None, category_id=None):
        """Get top selling products."""
        from apps.sales.models import SaleItem

        queryset = SaleItem.objects.filter(sale__is_void=False).select_related('product')

        if start_date:
            queryset = queryset.filter(sale__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(sale__date__lte=end_date)
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        if category_id:
            try:
                category_id_int = int(category_id)
            except (TypeError, ValueError):
                category_id_int = ProductCategory.objects.filter(name__iexact=str(category_id)).values_list('id', flat=True).first()
            if category_id_int is None:
                return []
            queryset = queryset.filter(product__category_id=category_id_int)

        top_products = queryset.values('product__id', 'product__name').annotate(
            total_qty=Sum('quantity'),
            total_revenue=Sum('line_total'),
        ).order_by('-total_qty')[:limit]

        return list(top_products)

    @staticmethod
    def get_low_stock_alert():
        """Get low stock products for alerting."""
        low_stock = Product.objects.filter(
            stock__lte=F('min_stock'),
            is_active=True
        ).select_related('category').values(
            'id', 'name', 'stock', 'min_stock', 'category__name'
        ).order_by('stock')
        
        return list(low_stock)

    @staticmethod
    def get_wastage_breakdown(start_date=None, end_date=None, product_id=None, category_id=None):
        """Get wastage breakdown by reason."""
        queryset = Wastage.objects.all()

        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        queryset = DashboardAnalytics._apply_wastage_filters(queryset, product_id=product_id, category_id=category_id)

        breakdown = queryset.values('reason').annotate(
            count=Count('id'),
            total_quantity=Sum('quantity'),
            total_loss=Sum('loss'),
        ).order_by('-total_loss')

        return list(breakdown)


class SalesAnalytics:
    """Detailed sales analytics."""

    @staticmethod
    def _apply_product_category_filters(queryset, product_id=None, category_id=None):
        if product_id:
            queryset = queryset.filter(items__product_id=product_id)
        if category_id:
            try:
                category_id_int = int(category_id)
            except (TypeError, ValueError):
                category_id_int = ProductCategory.objects.filter(name__iexact=str(category_id)).values_list('id', flat=True).first()
            if category_id_int is None:
                return queryset.none()
            queryset = queryset.filter(items__product__category_id=category_id_int)
        return queryset

    @staticmethod
    def get_sales_by_date(start_date, end_date, product_id=None, category_id=None):
        """Get sales aggregated by date."""
        sales = Sale.objects.filter(
            date__gte=start_date,
            date__lte=end_date,
            is_void=False,
        )
        sales = SalesAnalytics._apply_product_category_filters(sales, product_id=product_id, category_id=category_id)
        sales = sales.values('date').annotate(
            total_revenue=Sum('total'),
            transaction_count=Count('id', distinct=True),
            average_transaction=Avg('total'),
        ).order_by('date')

        return list(sales)

    @staticmethod
    def get_sales_by_payment_method(start_date, end_date, product_id=None, category_id=None):
        """Get sales breakdown by payment method."""
        sales = Sale.objects.filter(
            date__gte=start_date,
            date__lte=end_date,
            is_void=False,
        )
        sales = SalesAnalytics._apply_product_category_filters(sales, product_id=product_id, category_id=category_id)
        sales = sales.values('payment_method').annotate(
            total_revenue=Sum('total'),
            transaction_count=Count('id', distinct=True),
        ).order_by('-total_revenue')

        return list(sales)

    @staticmethod
    def get_sales_by_category(start_date, end_date, product_id=None, category_id=None):
        """Get sales breakdown by product category."""
        from apps.sales.models import SaleItem

        sales = SaleItem.objects.filter(
            sale__date__gte=start_date,
            sale__date__lte=end_date,
            sale__is_void=False,
        )
        if product_id:
            sales = sales.filter(product_id=product_id)
        if category_id:
            try:
                category_id_int = int(category_id)
            except (TypeError, ValueError):
                category_id_int = ProductCategory.objects.filter(name__iexact=str(category_id)).values_list('id', flat=True).first()
            if category_id_int is None:
                return []
            sales = sales.filter(product__category_id=category_id_int)
        sales = sales.values('product__category__name').annotate(
            total_qty=Sum('quantity'),
            total_revenue=Sum('line_total'),
        ).order_by('-total_revenue')

        return list(sales)


class WastageAnalytics:
    """Detailed wastage analytics."""

    @staticmethod
    def _apply_product_category_filters(queryset, product_id=None, category_id=None):
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        if category_id:
            try:
                category_id_int = int(category_id)
            except (TypeError, ValueError):
                category_id_int = ProductCategory.objects.filter(name__iexact=str(category_id)).values_list('id', flat=True).first()
            if category_id_int is None:
                return queryset.none()
            queryset = queryset.filter(product__category_id=category_id_int)
        return queryset

    @staticmethod
    def get_wastage_breakdown(start_date=None, end_date=None, product_id=None, category_id=None):
        """Get wastage breakdown by reason."""
        queryset = Wastage.objects.all()

        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        queryset = WastageAnalytics._apply_product_category_filters(queryset, product_id=product_id, category_id=category_id)

        breakdown = queryset.values('reason').annotate(
            count=Count('id'),
            total_quantity=Sum('quantity'),
            total_loss=Sum('loss'),
        ).order_by('-total_loss')

        return list(breakdown)

    @staticmethod
    def get_wastage_trend(start_date, end_date, product_id=None, category_id=None):
        """Get wastage trend by date."""
        wastage = Wastage.objects.filter(
            date__gte=start_date,
            date__lte=end_date,
        )
        wastage = WastageAnalytics._apply_product_category_filters(wastage, product_id=product_id, category_id=category_id)
        wastage = wastage.values('date').annotate(
            total_loss=Sum('loss'),
            total_items=Sum('quantity'),
            record_count=Count('id'),
        ).order_by('date')

        return list(wastage)

    @staticmethod
    def get_wastage_by_product(start_date, end_date, limit=10, product_id=None, category_id=None):
        """Get products with highest wastage."""
        wastage = Wastage.objects.filter(
            date__gte=start_date,
            date__lte=end_date,
        )
        wastage = WastageAnalytics._apply_product_category_filters(wastage, product_id=product_id, category_id=category_id)
        wastage = wastage.values('product__id', 'product__name').annotate(
            total_qty=Sum('quantity'),
            total_loss=Sum('loss'),
        ).order_by('-total_loss')[:limit]

        return list(wastage)
