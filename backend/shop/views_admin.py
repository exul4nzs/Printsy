"""
Admin API endpoints for the Printsy dashboard.
All views require IsAdminRole permission.
"""
import logging
from datetime import datetime
from decimal import Decimal

from django.db.models import Count, Q, Sum
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Order
from .permissions import IsAdminRole
from .serializers import AdminOrderSerializer

logger = logging.getLogger(__name__)

REVENUE_STATUSES = ['paid', 'processing', 'ready', 'shipped', 'completed']


# ──────────────────────────────────────────────
# GET /api/admin/orders/
# ──────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAdminRole])
def admin_orders_list(request):
    """
    List all orders with optional filters.

    Query params:
      - status    : filter by status (pending, paid, processing, ready, shipped, completed, cancelled)
      - search    : search by order_number, customer_name, customer_email
      - date_from : filter from date (YYYY-MM-DD)
      - date_to   : filter to date (YYYY-MM-DD)
      - size      : filter by print size inside items JSON
      - page      : page number (default 1)
      - page_size : items per page (default 20, max 100)
    """
    queryset = Order.objects.all()

    # Status filter
    status_param = request.query_params.get('status')
    if status_param:
        queryset = queryset.filter(status=status_param)

    # Search filter
    search = request.query_params.get('search')
    if search:
        queryset = queryset.filter(
            Q(order_number__icontains=search)
            | Q(customer_name__icontains=search)
            | Q(customer_email__icontains=search)
        )

    # Date range filter
    date_from = request.query_params.get('date_from')
    if date_from:
        try:
            df = datetime.strptime(date_from, '%Y-%m-%d').date()
            queryset = queryset.filter(created_at__date__gte=df)
        except ValueError:
            pass

    date_to = request.query_params.get('date_to')
    if date_to:
        try:
            dt = datetime.strptime(date_to, '%Y-%m-%d').date()
            queryset = queryset.filter(created_at__date__lte=dt)
        except ValueError:
            pass

    # Size filter (searches inside items JSON)
    size_param = request.query_params.get('size')
    if size_param:
        queryset = queryset.filter(items__icontains=size_param)

    # Ordering: newest first
    queryset = queryset.order_by('-created_at')

    # Pagination
    page_size = min(int(request.query_params.get('page_size', 20)), 100)
    page = int(request.query_params.get('page', 1))
    total_count = queryset.count()
    start = (page - 1) * page_size
    end = start + page_size
    orders = queryset[start:end]

    serializer = AdminOrderSerializer(orders, many=True)

    return Response({
        'results': serializer.data,
        'count': total_count,
        'page': page,
        'page_size': page_size,
        'total_pages': (total_count + page_size - 1) // page_size,
    })


# ──────────────────────────────────────────────
# PATCH /api/admin/orders/<id>/
# ──────────────────────────────────────────────

@api_view(['PATCH'])
@permission_classes([IsAdminRole])
def admin_order_update(request, pk):
    """
    Update an order's status.

    Payload: { "status": "processing" }
    """
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    new_status = request.data.get('status')
    valid_statuses = [s[0] for s in Order.STATUS_CHOICES]

    if not new_status:
        return Response(
            {'error': '"status" field is required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if new_status not in valid_statuses:
        return Response(
            {'error': f'Invalid status. Choose from: {", ".join(valid_statuses)}'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    order.status = new_status
    order.save(update_fields=['status', 'updated_at'])

    serializer = AdminOrderSerializer(order)
    return Response(serializer.data)


# ──────────────────────────────────────────────
# GET /api/admin/stats/
# ──────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAdminRole])
def admin_stats(request):
    """
    Return dashboard statistics:
    - total_orders
    - total_revenue (sum of paid/processing/ready/shipped/completed orders)
    - by_status (count per status)
    - recent_orders (last 5)
    """
    total_orders = Order.objects.count()

    # Revenue from non-cancelled, non-pending orders
    total_revenue = Order.objects.filter(
        status__in=REVENUE_STATUSES
    ).aggregate(total=Sum('total_amount'))['total'] or Decimal('0')

    # Count by status
    status_counts = Order.objects.values('status').annotate(count=Count('id'))
    by_status = {item['status']: item['count'] for item in status_counts}

    # Ensure all statuses appear (even if 0)
    for s, _ in Order.STATUS_CHOICES:
        by_status.setdefault(s, 0)

    # Recent 5 orders
    recent_orders = Order.objects.order_by('-created_at')[:5]
    recent_serializer = AdminOrderSerializer(recent_orders, many=True)

    return Response({
        'total_orders': total_orders,
        'total_revenue': float(total_revenue),
        'by_status': by_status,
        'recent_orders': recent_serializer.data,
    })
