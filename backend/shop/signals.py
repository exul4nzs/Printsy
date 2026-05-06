from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import Order, AuditLog
from .telegram import telegram_service

# ==========================================
# OBSERVER PATTERN: Event-driven architecture
# ==========================================

@receiver(pre_save, sender=Order)
def track_order_status_change(sender, instance, **kwargs):
    """
    Observer that listens for Order status changes before saving.
    If the status has changed, it attaches the old status to the instance 
    so we can log the transition in the post_save signal.
    """
    if instance.pk:
        try:
            old_order = Order.objects.get(pk=instance.pk)
            if old_order.status != instance.status:
                instance._status_changed = True
                instance._old_status = old_order.status
        except Order.DoesNotExist:
            pass

@receiver(post_save, sender=Order)
def create_audit_log_on_change(sender, instance, created, **kwargs):
    """
    Observer that creates an AuditLog entry when an order is created or updated.
    Also sends Telegram notifications for important events.
    """
    if created:
        # Log order creation
        AuditLog.objects.create(
            order=instance,
            action="Order Created",
            details=f"Order {instance.id.hex[:8]} created with status '{instance.status}' and total amount {instance.total_amount}."
        )
        
        # Send Telegram notification for new order
        telegram_service.send_order_notification(instance, action="🛍️ New Order")
        
    elif getattr(instance, '_status_changed', False):
        old_status = instance._old_status
        new_status = instance.status
        
        # Log status change
        AuditLog.objects.create(
            order=instance,
            action="Status Updated",
            details=f"Order status changed from '{old_status}' to '{new_status}'."
        )
        
        # Send Telegram notification for status update
        telegram_service.send_status_update(instance, old_status, new_status)
        
        # Additional logging for specific statuses
        if new_status == 'paid':
            AuditLog.objects.create(
                order=instance,
                action="Payment Confirmed",
                details=f"Payment received for Order {instance.id.hex[:8]}. Starting processing."
            )
        elif new_status == 'shipped':
            AuditLog.objects.create(
                order=instance,
                action="Order Shipped",
                details=f"Order {instance.id.hex[:8]} has been shipped. Tracking: {instance.tracking_number or 'N/A'}"
            )
