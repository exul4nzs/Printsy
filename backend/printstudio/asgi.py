"""
ASGI config for printstudio project.
"""
import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'printstudio.settings')

application = get_asgi_application()
