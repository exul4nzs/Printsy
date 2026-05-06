"""
Telegram bot service for order notifications.
"""
import os
import logging
from asgiref.sync import async_to_sync

logger = logging.getLogger(__name__)


class TelegramNotificationService:
    """Service for sending order notifications via Telegram."""
    
    def __init__(self):
        self.bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        self.chat_id = os.getenv('TELEGRAM_ADMIN_CHAT_ID')
        self.enabled = os.getenv('TELEGRAM_NOTIFICATIONS_ENABLED', 'True').lower() == 'true'
        self.bot = None
        self._bot_available = False
        
        # Lazy import to prevent startup errors
        try:
            from telegram import Bot
            from telegram.constants import ParseMode
            self.Bot = Bot
            self.ParseMode = ParseMode
            self._bot_available = True
        except ImportError:
            logger.warning("python-telegram-bot not installed. Telegram notifications disabled.")
            self._bot_available = False
            return
        
        if self.bot_token and self.enabled and self._bot_available:
            try:
                self.bot = Bot(token=self.bot_token)
                logger.info("Telegram bot initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Telegram bot: {e}")
    
    def is_configured(self):
        """Check if Telegram is properly configured."""
        return self.enabled and self.bot_token and self.chat_id and self.bot
    
    async def _send_message_async(self, message, parse_mode=None):
        """Send message asynchronously."""
        if parse_mode is None and self._bot_available:
            parse_mode = self.ParseMode.HTML
        if not self.is_configured():
            logger.warning("Telegram not configured, message not sent")
            return False
        
        try:
            await self.bot.send_message(
                chat_id=self.chat_id,
                text=message,
                parse_mode=parse_mode,
                disable_web_page_preview=False
            )
            return True
        except Exception as e:
            logger.error(f"Failed to send Telegram message: {e}")
            return False
    
    def send_message(self, message):
        """Send message synchronously."""
        if not self.is_configured():
            return False
        
        try:
            return async_to_sync(self._send_message_async)(message)
        except Exception as e:
            logger.error(f"Error in send_message: {e}")
            return False
    
    def format_order_notification(self, order, action="New Order"):
        """Format order notification message."""
        order_id = order.id.hex[:8].upper()
        
        # Format items
        items_text = ""
        total_photos = 0
        if order.items:
            for item in order.items:
                product_type = item.get('product_type', 'Unknown')
                quantity = item.get('quantity', 0)
                total_price = item.get('total_price', 0)
                items_text += f"\n• {product_type} x{quantity} - ₱{total_price}"
                photos = item.get('customer_photos', [])
                total_photos += len(photos)
        
        # Build message
        message = f"""
🛍️ <b>{action} #{order_id}</b>

👤 <b>Customer:</b> {order.customer_name or 'N/A'}
📞 <b>Phone:</b> {order.customer_phone or 'N/A'}
📧 <b>Email:</b> {order.customer_email or 'N/A'}
📍 <b>Address:</b> {order.shipping_address or 'N/A'}

💰 <b>Total:</b> ₱{order.total_amount}
📦 <b>Status:</b> {order.status.upper()}
💳 <b>Payment:</b> {order.payment_status.upper()}

<b>Items:</b>{items_text}

📸 <b>Photos:</b> {total_photos} attached {"(view in Admin panel)" if total_photos > 0 else ""}
🔗 <b>Reference:</b> PRINTSY-{order_id}
"""
        return message.strip()
    
    def format_status_update(self, order, old_status, new_status):
        """Format status update notification."""
        order_id = order.id.hex[:8].upper()
        
        emoji_map = {
            'pending': '⏳',
            'paid': '💰',
            'processing': '⚙️',
            'shipped': '🚚',
            'delivered': '✅',
            'cancelled': '❌'
        }
        
        old_emoji = emoji_map.get(old_status, '📝')
        new_emoji = emoji_map.get(new_status, '📝')
        
        message = f"""
{new_emoji} <b>Order #{order_id} Updated</b>

{old_emoji} <b>Old Status:</b> {old_status.title()}
{new_emoji} <b>New Status:</b> {new_status.title()}

👤 <b>Customer:</b> {order.customer_name or 'N/A'}
💰 <b>Total:</b> ₱{order.total_amount}
"""
        
        # Add tracking info if shipped
        if new_status == 'shipped' and order.tracking_number:
            message += f"\n🚚 <b>Tracking:</b> {order.tracking_number}"
        
        return message.strip()
    
    def send_order_notification(self, order, action="New Order"):
        """Send new order notification."""
        message = self.format_order_notification(order, action)
        return self.send_message(message)
    
    def send_status_update(self, order, old_status, new_status):
        """Send status update notification."""
        message = self.format_status_update(order, old_status, new_status)
        return self.send_message(message)
    
    def test_connection(self):
        """Test Telegram connection."""
        if not self.is_configured():
            return False, "Telegram not configured. Check TELEGRAM_BOT_TOKEN and TELEGRAM_ADMIN_CHAT_ID"
        
        try:
            async_to_sync(self._send_message_async)(
                "✅ <b>Printsy Test Message</b>\n\nYour Telegram notifications are working correctly!"
            )
            return True, "Test message sent successfully"
        except Exception as e:
            return False, f"Failed to send test message: {e}"


# Global instance
telegram_service = TelegramNotificationService()
