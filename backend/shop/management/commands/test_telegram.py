"""
Management command to test Telegram configuration.
"""
from django.core.management.base import BaseCommand
from shop.telegram import telegram_service


class Command(BaseCommand):
    help = 'Test Telegram bot configuration and connection'

    def handle(self, *args, **options):
        self.stdout.write("Testing Telegram configuration...")
        self.stdout.write("")
        
        # Check configuration
        if not telegram_service.is_configured():
            self.stdout.write(self.style.ERROR("❌ Telegram is not properly configured!"))
            self.stdout.write("")
            self.stdout.write("Make sure you have set these environment variables:")
            self.stdout.write("  - TELEGRAM_BOT_TOKEN")
            self.stdout.write("  - TELEGRAM_ADMIN_CHAT_ID")
            self.stdout.write("")
            self.stdout.write("To get these values:")
            self.stdout.write("  1. Message @BotFather on Telegram to create a bot")
            self.stdout.write("  2. Get the bot token from BotFather")
            self.stdout.write("  3. Message @userinfobot to get your chat ID")
            return
        
        self.stdout.write(self.style.SUCCESS("✅ Telegram is configured"))
        self.stdout.write("")
        
        # Test connection
        self.stdout.write("Sending test message to Telegram...")
        success, message = telegram_service.test_connection()
        
        if success:
            self.stdout.write(self.style.SUCCESS(f"✅ {message}"))
            self.stdout.write("")
            self.stdout.write("You should receive a test message in Telegram!")
        else:
            self.stdout.write(self.style.ERROR(f"❌ {message}"))
