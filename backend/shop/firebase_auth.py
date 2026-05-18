from django.contrib.auth.models import User

from .firebase_app import ensure_firebase_initialized


def verify_firebase_token(id_token: str) -> dict:
    from firebase_admin import auth

    ensure_firebase_initialized()
    return auth.verify_id_token(id_token)


def get_or_create_user_from_firebase(decoded_token: dict) -> User:
    uid = decoded_token['uid']
    email = decoded_token.get('email') or ''
    display_name = (decoded_token.get('name') or '').strip()
    first_name = ''
    last_name = ''
    if display_name:
        parts = display_name.split(' ', 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else ''

    user = User.objects.filter(username=uid).first()
    if user is None and email:
        user = User.objects.filter(email__iexact=email).first()

    if user is None:
        user = User.objects.create(
            username=uid,
            email=email,
            first_name=first_name,
            last_name=last_name,
        )
        user.set_unusable_password()
        user.save()
        return user

    updated = False
    if email and user.email != email:
        user.email = email
        updated = True
    if first_name and user.first_name != first_name:
        user.first_name = first_name
        updated = True
    if last_name and user.last_name != last_name:
        user.last_name = last_name
        updated = True
    if updated:
        user.save(update_fields=['email', 'first_name', 'last_name'])

    return user


def serialize_user(user: User) -> dict:
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_staff': user.is_staff,
    }
