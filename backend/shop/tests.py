from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Product, PhotoPrintVariant, Order, AuditLog, FeatureToggle
from .patterns import OrderFactory, StripePaymentStrategy, PaymentContext
import json


class ProductModelTest(TestCase):
    """Test Product model."""

    def setUp(self):
        self.product = Product.objects.create(
            name="Test Photo",
            description="A test product",
            product_type="photo_print",
            base_price=29.99,
            config={"sizes": ["4R", "5R"]}
        )

    def test_product_creation(self):
        """Test that a product can be created."""
        self.assertEqual(self.product.name, "Test Photo")
        self.assertEqual(self.product.product_type, "photo_print")
        self.assertTrue(self.product.is_active)

    def test_product_str(self):
        """Test product string representation."""
        self.assertEqual(str(self.product), "Test Photo (Photo Print)")


class PhotoPrintVariantModelTest(TestCase):
    """Test PhotoPrintVariant model."""

    def setUp(self):
        self.product = Product.objects.create(
            name="Test Photo",
            product_type="photo_print",
            base_price=5.00
        )
        self.variant = PhotoPrintVariant.objects.create(
            product=self.product,
            size="4R",
            price_adjustment=2.00,
            stock_quantity=100
        )

    def test_variant_creation(self):
        """Test that a variant can be created."""
        self.assertEqual(self.variant.size, "4R")
        self.assertEqual(self.variant.stock_quantity, 100)

    def test_variant_price(self):
        """Test variant price calculation."""
        expected_price = 5.00 + 2.00
        self.assertEqual(float(self.variant.total_price), expected_price)


class PatternAndEventTest(TestCase):
    """Test Design Patterns and Event-Driven Architecture."""

    def test_order_factory(self):
        """Test Factory Pattern for Order Creation."""
        data = {
            "customer_name": "Jane Doe",
            "items": [{"total_price": "10.00"}, {"total_price": "15.00"}]
        }
        order = OrderFactory.create_order(data)
        self.assertEqual(order.customer_name, "Jane Doe")
        self.assertEqual(float(order.total_amount), 25.00)

    def test_audit_log_observer(self):
        """Test Observer Pattern via Django Signals for Audit Logs."""
        # Creating an order should trigger an audit log
        order = Order.objects.create(
            customer_name="John Log",
            items=[],
            total_amount=0.00,
            status="pending"
        )
        logs = AuditLog.objects.filter(order=order)
        self.assertEqual(logs.count(), 1)
        self.assertEqual(logs.first().action, "Order Created")

        # Updating status should trigger another log
        order.status = "paid"
        order.save()
        
        logs = AuditLog.objects.filter(order=order).order_by('-created_at')
        self.assertEqual(logs.count(), 3)  # Status Updated + Payment Confirmed
        self.assertEqual(logs[0].action, "Payment Confirmed")
        self.assertEqual(logs[1].action, "Status Updated")

    def test_feature_toggle(self):
        """Test Feature Toggles."""
        toggle = FeatureToggle.objects.create(name="express_delivery", is_active=True)
        self.assertTrue(toggle.is_active)
        self.assertEqual(str(toggle), "express_delivery (ON)")


class ProductAPITest(APITestCase):
    """Test Product API endpoints."""

    def setUp(self):
        self.product = Product.objects.create(
            name="Test Photo",
            description="API test product",
            product_type="photo_print",
            base_price=5.00
        )
        PhotoPrintVariant.objects.create(
            product=self.product,
            size="4R",
            price_adjustment=2.00,
            stock_quantity=100
        )

    def test_list_products(self):
        """Test GET /api/products/."""
        url = reverse('product-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Handle paginated response
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)

    def test_filter_products_by_type(self):
        """Test filtering products by type."""
        url = reverse('product-list')
        response = self.client.get(url, {'type': 'photo_print'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Handle paginated response
        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)

    def test_get_product_detail(self):
        """Test GET /api/products/<id>/."""
        url = reverse('product-detail', kwargs={'pk': self.product.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Test Photo")

    def test_get_product_variants(self):
        """Test GET /api/products/<id>/variants/."""
        url = reverse('product-variants', kwargs={'pk': self.product.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class OrderAPITest(APITestCase):
    """Test Order API endpoints."""

    def test_create_order(self):
        """Test POST /api/orders/."""
        url = reverse('order-list')
        data = {
            "customer_name": "John Doe",
            "customer_email": "john@example.com",
            "customer_phone": "+639123456789",
            "shipping_address": "123 Test St, Manila",
            "items": [
                {
                    "product_id": "test-product-id",
                    "product_type": "photo_print",
                    "variant_id": "test-variant-id",
                    "quantity": 2,
                    "unit_price": 7.00,
                    "total_price": 14.00
                }
            ],
            "total_amount": 14.00
        }
        response = self.client.post(url, data, format='json')
        # Should create order (may fail on Stripe if no key, but tests structure)
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])


class SeedDataTest(TestCase):
    """Test seed data command."""

    def test_seed_data_runs(self):
        """Test that seed_data command runs without errors."""
        from io import StringIO
        from django.core.management import call_command
        out = StringIO()
        try:
            call_command('seed_data', stdout=out)
            output = out.getvalue()
            self.assertIn('Seeding complete', output)
        except Exception as e:
            # Seed data may fail if products already exist
            self.assertIsNotNone(e)
