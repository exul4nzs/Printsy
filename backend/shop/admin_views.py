"""
Custom admin dashboard views for Printsy.
"""
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import Order, Product, AuditLog


#@staff_member_required
def admin_dashboard(request):
    """
    Custom admin dashboard with transaction overview.
    """
    # Order statistics
    total_orders = Order.objects.count()
    
    # Status breakdown
    status_counts = Order.objects.values('status').annotate(count=Count('id'))
    status_data = {item['status']: item['count'] for item in status_counts}
    
    pending_orders = status_data.get('pending', 0)
    paid_orders = status_data.get('paid', 0)
    processing_orders = status_data.get('processing', 0)
    shipped_orders = status_data.get('shipped', 0)
    delivered_orders = status_data.get('delivered', 0)
    cancelled_orders = status_data.get('cancelled', 0)
    
    # Revenue statistics
    total_revenue = Order.objects.filter(
        status__in=['paid', 'processing', 'shipped', 'delivered']
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    pending_revenue = Order.objects.filter(
        status='pending'
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    # Today's orders
    today = timezone.now().date()
    today_orders = Order.objects.filter(
        created_at__date=today
    ).count()
    
    today_revenue = Order.objects.filter(
        created_at__date=today,
        status__in=['paid', 'processing', 'shipped', 'delivered']
    ).aggregate(total=Sum('total_amount'))['total'] or 0
    
    # Recent orders (last 10)
    recent_orders = Order.objects.order_by('-created_at')[:10]
    
    # Recent audit logs (last 20)
    recent_logs = AuditLog.objects.select_related('order').order_by('-created_at')[:20]
    
    # Product count
    product_count = Product.objects.filter(is_active=True).count()
    
    # Weekly trend (last 7 days)
    week_ago = today - timedelta(days=7)
    weekly_orders = Order.objects.filter(
        created_at__date__gte=week_ago
    ).values('created_at__date').annotate(count=Count('id')).order_by('created_at__date')
    
    context = {
        'title': 'Printsy Dashboard',
        'stats': {
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'paid_orders': paid_orders,
            'processing_orders': processing_orders,
            'shipped_orders': shipped_orders,
            'delivered_orders': delivered_orders,
            'cancelled_orders': cancelled_orders,
            'total_revenue': total_revenue,
            'pending_revenue': pending_revenue,
            'today_orders': today_orders,
            'today_revenue': today_revenue,
            'product_count': product_count,
        },
        'recent_orders': recent_orders,
        'recent_logs': recent_logs,
        'weekly_orders': weekly_orders,
    }
    
    return render(request, 'admin/shop/dashboard.html', context)


@staff_member_required
def transaction_lobby(request):
    """
    Transaction lobby - focused view for managing orders.
    """
    # Filter by status if provided
    status_filter = request.GET.get('status', '')
    
    orders = Order.objects.all()
    if status_filter:
        orders = orders.filter(status=status_filter)
    
    # Order statistics for the lobby
    lobby_stats = {
        'urgent': Order.objects.filter(status='pending').count(),
        'processing': Order.objects.filter(status__in=['paid', 'processing']).count(),
        'shipping': Order.objects.filter(status='shipped').count(),
        'completed': Order.objects.filter(status='delivered').count(),
    }
    
    # Pagination
    from django.core.paginator import Paginator
    paginator = Paginator(orders.order_by('-created_at'), 20)
    page_number = request.GET.get('page', 1)
    page_obj = paginator.get_page(page_number)
    
    context = {
        'title': 'Transaction Lobby',
        'orders': page_obj,
        'lobby_stats': lobby_stats,
        'status_filter': status_filter,
        'page_obj': page_obj,
        'paginator': paginator,
    }
    
    return render(request, 'admin/shop/transaction_lobby.html', context)
