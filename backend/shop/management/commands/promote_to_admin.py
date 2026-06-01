"""
Management command to promote a user to admin role by email.
Usage: python manage.py promote_to_admin --email=user@example.com
"""
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from shop.models import UserProfile


class Command(BaseCommand):
    help = 'Promote a user to admin role by email address'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            required=True,
            help='Email address of the user to promote',
        )

    def handle(self, *args, **kwargs):
        email = kwargs['email'].strip()

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise CommandError(f'No user found with email "{email}".')

        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={'role': 'admin'},
        )

        if not created and profile.role == 'admin':
            self.stdout.write(
                self.style.WARNING(f'User "{email}" is already an admin.')
            )
            return

        profile.role = 'admin'
        profile.save(update_fields=['role'])

        # Keep is_staff in sync for backward compatibility
        if not user.is_staff:
            user.is_staff = True
            user.save(update_fields=['is_staff'])

        self.stdout.write(
            self.style.SUCCESS(f'Successfully promoted "{email}" to admin.')
        )
