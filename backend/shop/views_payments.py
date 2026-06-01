"""
Stripe payment views for Printsy.
- POST /api/payments/create-checkout/  → creates a Stripe Checkout Session
- POST /api/payments/webhook/          → handles Stripe webhook events
"""
import logging

import stripe
from django.conf import settings
from django.http import HttpResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Order
from .patterns import OrderFactory

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY

# Print size pricing in centavos (Philippine Peso)
SIZE_PRICES_CENTAVOS = {
    '2x3': 1500,
    '4R':  2500,
    '5R':  3500,
    '8R':  5500,
    'A4':  6500,
}

SIZE_LABELS = {
    '2x3': '2x3 (Wallet)',
    '4R':  '4R (4x6)',
    '5R':  '5R (5x7)',
    '8R':  '8R (8x10)',
    'A4':  'A4',
}


# ──────────────────────────────────────────────
# Checkout Session
# ──────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    """
    Create a Stripe Checkout Session for photo print orders.

    Expected payload:
    {
      "items": [
        {
          "size": "4R",
          "quantity": 2,
          "photo": "<base64 data URL or leave empty if design_id provided>",
          "design_id": "<optional, UUID of saved CustomDesign>"
        },
        ...
      ],
      "customer_name": "Juan Dela Cruz",
      "customer_email": "juan@example.com",
      "customer_phone": "09123456789",
      "shipping_address": "123 Main St, Surigao City"
    }

    Returns: { "checkout_url": "https://checkout.stripe.com/...", "session_id": "cs_..." }
    """
    data = request.data
    items = data.get('items', [])

    if not items:
        return Response(
            {'error': 'No items provided.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    customer_name = data.get('customer_name', '')
    customer_email = data.get('customer_email', '')
    customer_phone = data.get('customer_phone', '')
    shipping_address = data.get('shipping_address', '')

    if not customer_name:
        return Response(
            {'error': 'Customer name is required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Build order items and Stripe line items
    order_items = []
    stripe_line_items = []

    for idx, item in enumerate(items):
        size = item.get('size', '4R')
        quantity = int(item.get('quantity', 1))

        if quantity < 1 or quantity > 20:
            return Response(
                {'error': f'Quantity must be between 1 and 20 (item {idx + 1}).'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if size not in SIZE_PRICES_CENTAVOS:
            return Response(
                {'error': f'Invalid size "{size}". Choose from: {", ".join(SIZE_PRICES_CENTAVOS.keys())}.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        price_centos = SIZE_PRICES_CENTAVOS[size]
        design_id = item.get('design_id', '')

        order_items.append({
            'product_id': '',
            'product_type': 'photo_print',
            'variant_id': '',
            'design_id': design_id,
            'quantity': quantity,
            'unit_price': price_centos / 100,
            'total_price': (price_centos * quantity) / 100,
            'size': size,
        })

        stripe_line_items.append({
            'price_data': {
                'currency': 'php',
                'product_data': {
                    'name': f'Photo Print — {SIZE_LABELS[size]}',
                    'description': f'High-quality photo print, {SIZE_LABELS[size]}',
                },
                'unit_amount': price_centos,
            },
            'quantity': quantity,
        })

    # Create the order via Factory
    total_amount = sum(i['total_price'] for i in order_items)
    order = OrderFactory.create_order({
        'customer_name': customer_name,
        'customer_email': customer_email,
        'customer_phone': customer_phone,
        'shipping_address': shipping_address,
        'items': order_items,
        'total_amount': total_amount,
    })

    # Build success / cancel URLs
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000').rstrip('/')
    success_url = f'{frontend_url}/checkout/success?session_id={{CHECKOUT_SESSION_ID}}'
    cancel_url = f'{frontend_url}/checkout/cancel'

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card', 'gcash'],
            line_items=stripe_line_items,
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=customer_email or None,
            metadata={
                'order_id': str(order.id),
                'order_number': str(order.order_number or ''),
            },
        )
    except stripe.error.StripeError as exc:
        logger.error('Stripe checkout session creation failed: %s', exc)
        # Clean up the order we just created
        order.delete()
        return Response(
            {'error': f'Payment provider error: {exc.user_message or "Please try again."}'},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    # Save the checkout session ID on the order
    order.stripe_checkout_session_id = session.id
    order.save(update_fields=['stripe_checkout_session_id'])

    return Response({
        'checkout_url': session.url,
        'session_id': session.id,
    })


# ──────────────────────────────────────────────
# Webhook
# ──────────────────────────────────────────────

@method_decorator(csrf_exempt, name='dispatch')
class StripeWebhookView(View):
    """
    Handles Stripe webhook events.
    Verifies the signature and processes checkout.session.completed.
    """

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')
        webhook_secret = settings.STRIPE_WEBHOOK_SECRET

        if not webhook_secret:
            logger.warning('STRIPE_WEBHOOK_SECRET is not set — webhook verification skipped.')
            return HttpResponse(status=400)

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret,
            )
        except (ValueError, stripe.error.SignatureVerificationError) as exc:
            logger.warning('Stripe webhook signature verification failed: %s', exc)
            return HttpResponse(status=400)

        # Handle the event
        if event['type'] == 'checkout.session.completed':
            self._handle_checkout_completed(event['data']['object'])
        elif event['type'] == 'checkout.session.expired':
            self._handle_checkout_expired(event['data']['object'])
        else:
            logger.info('Unhandled Stripe webhook event type: %s', event['type'])

        return HttpResponse(status=200)

    @staticmethod
    def _handle_checkout_completed(session):
        """Mark the order as paid when Stripe confirms payment."""
        order_id = session.get('metadata', {}).get('order_id')
        if not order_id:
            logger.warning('Stripe session completed but no order_id in metadata: %s', session.get('id'))
            return

        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            logger.warning('Stripe session completed but order not found: %s', order_id)
            return

        if order.status == 'paid':
            logger.info('Order %s is already marked as paid — skipping.', order_id)
            return

        order.status = 'paid'
        order.payment_status = 'paid'
        order.stripe_payment_intent_id = session.get('payment_intent', '')
        order.save(update_fields=['status', 'payment_status', 'stripe_payment_intent_id'])
        logger.info('Order %s marked as paid via Stripe.', order_id)

    @staticmethod
    def _handle_checkout_expired(session):
        """Optionally handle expired checkout sessions."""
        order_id = session.get('metadata', {}).get('order_id')
        if not order_id:
            return
        logger.info('Stripe checkout session expired for order %s.', order_id)
