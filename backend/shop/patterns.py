from abc import ABC, abstractmethod
from django.conf import settings
from .models import Order

# ==========================================
# STRATEGY PATTERN: Payment Processing
# ==========================================
class PaymentStrategy(ABC):
    """
    Abstract strategy for processing payments.
    Adheres to Open/Closed Principle - new payment methods can be added
    without modifying existing code.
    """
    @abstractmethod
    def process_payment(self, amount: float, order_id: str = None) -> dict:
        pass

class GCashManualStrategy(PaymentStrategy):
    """
    Concrete strategy for manual GCash payments.
    Returns payment instructions for the customer to follow.
    """
    def process_payment(self, amount: float, order_id: str = None) -> dict:
        return {
            'success': True,
            'method': 'gcash',
            'gcash_number': settings.GCASH_NUMBER,
            'gcash_name': settings.GCASH_NAME,
            'amount': amount,
            'reference': f'PRINTSY-{order_id[:8].upper()}' if order_id else 'PRINTSY',
            'instructions': (
                f'Please send ₱{amount} to GCash number {settings.GCASH_NUMBER} '
                f'({settings.GCASH_NAME}). Use your Order ID as the reference message.'
            ),
        }

class ManualPaymentStrategy(PaymentStrategy):
    """
    Concrete strategy for manual payments (e.g., direct bank transfer or OTC).
    This simulates a payment flow that doesn't use an external gateway directly.
    """
    def process_payment(self, amount: float, order_id: str = None) -> dict:
        # In a real app, this might generate a reference number or instructions
        return {
            'success': True,
            'client_secret': f'manual_ref_{order_id}',
            'instructions': 'Please pay directly to our bank account using this reference.'
        }

class PaymentContext:
    """Context class that uses a PaymentStrategy."""
    def __init__(self, strategy: PaymentStrategy):
        self._strategy = strategy
        
    def set_strategy(self, strategy: PaymentStrategy):
        self._strategy = strategy
        
    def execute_payment(self, amount: float, order_id: str = None) -> dict:
        return self._strategy.process_payment(amount, order_id)

# ==========================================
# FACTORY PATTERN: Order Creation
# ==========================================
class OrderFactory:
    """
    Factory for creating complex Order objects.
    Encapsulates the logic of calculating totals and formatting items.
    """
    @staticmethod
    def create_order(validated_data: dict) -> Order:
        items = validated_data.get('items', [])
        
        # Convert Decimal values to float for JSON serialization
        serializable_items = []
        for item in items:
            clean_item = {}
            for key, value in item.items():
                from decimal import Decimal
                if isinstance(value, Decimal):
                    clean_item[key] = float(value)
                else:
                    clean_item[key] = value
            serializable_items.append(clean_item)
        
        # Centralized total calculation logic
        total = sum(
            float(item.get('total_price', 0))
            for item in serializable_items
        )
        
        order = Order.objects.create(
            customer_name=validated_data['customer_name'],
            customer_email=validated_data.get('customer_email', ''),
            customer_phone=validated_data.get('customer_phone', ''),
            shipping_address=validated_data.get('shipping_address', ''),
            items=serializable_items,
            total_amount=total
        )
        
        return order
