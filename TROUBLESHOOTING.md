# Printsy Troubleshooting Guide

## Issue: ModuleNotFoundError for `telegram` Package

### Error Description
When implementing the Telegram bot integration for order notifications, the Django development server crashed with the following error:

```
Exception in thread django-main-thread:
Traceback (most recent call last):
  File ".../shop/signals.py", line 4, in <module>
    from .telegram import telegram_service
  File ".../shop/telegram.py", line 6, in <module>
    from telegram import Bot
ModuleNotFoundError: No module named 'telegram'
```

### Root Cause
The `python-telegram-bot` package was not properly installed in the Python environment, or the import statement was placed at the module level, causing the entire Django application to fail on startup.

### Changes Made to Fix This Issue

#### 1. Modified `backend/shop/telegram.py`

**Problem:** Top-level imports caused immediate failure on startup.

**Solution:** Implemented lazy imports within the class constructor to gracefully handle missing packages:

```python
class TelegramNotificationService:
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
```

#### 2. Fixed Duplicate Docstring

**Problem:** The `_send_message_async` method had a duplicate docstring due to previous edits.

**Solution:** Removed the duplicate docstring and fixed the method signature:

```python
async def _send_message_async(self, message, parse_mode=None):
    """Send message asynchronously."""
    if parse_mode is None and self._bot_available:
        parse_mode = self.ParseMode.HTML
    if not self.is_configured():
        logger.warning("Telegram not configured, message not sent")
        return False
    # ... rest of method
```

#### 3. Added Missing Import

**Problem:** `async_to_sync` was being used but not imported at the top level.

**Solution:** Added the import:

```python
from asgiref.sync import async_to_sync
```

### Prevention Measures

1. **Always use lazy imports** for optional third-party packages
2. **Test imports** in a try-except block during initialization
3. **Log warnings** instead of crashing when optional features are unavailable
4. **Check for missing imports** before using them in the codebase

### How to Verify the Fix

1. Start the Django development server:
   ```bash
   cd backend
   python manage.py runserver
   ```

2. Check that the server starts without errors

3. Verify products load on the frontend (http://localhost:3001)

4. Test admin login (http://localhost:8000/admin)

### Related Files Modified

- `backend/shop/admin.py` - Fixed bulk actions skipping signals
- `frontend/app/checkout/page.tsx` - Integrated real backend order creation

## Issue: Admin Actions Skipping Audit Logs/Notifications

### Error Description
When using the "Mark as Paid" or "Mark as Shipped" bulk actions in the Django Admin, no Audit Log entries were created and no Telegram notifications were sent, even though the order status was updated.

### Root Cause
The actions were using `queryset.update(status='...')`, which is a direct SQL operation that bypasses the model's `.save()` method and consequently skips `pre_save` and `post_save` signals.

### Solution
Modified the admin actions to iterate over the objects and call `.save()` on each instance:
```python
for order in queryset:
    order.status = 'paid'
    order.save()
```

## Issue: Checkout Not Saving to Database

### Error Description
The checkout process appeared to complete successfully on the frontend, but no orders were visible in the backend Admin panel.

### Root Cause
The `handlePlaceOrder` function in `checkout/page.tsx` was only simulating success (clearing the cart) and hadn't been connected to the `createOrder` API.

### Solution
Integrated the `createOrder` API call and mapped the frontend cart items to the backend `Order` structure. Added error handling to notify the user if the server is unreachable.

