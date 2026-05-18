from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .firebase_auth import get_or_create_user_from_firebase, verify_firebase_token


class FirebaseAuthentication(BaseAuthentication):
    keyword = 'Bearer'

    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if not auth_header.startswith(f'{self.keyword} '):
            return None

        token = auth_header[len(self.keyword) + 1 :].strip()
        if not token:
            return None

        try:
            decoded = verify_firebase_token(token)
        except Exception as exc:
            raise AuthenticationFailed('Invalid or expired Firebase token.') from exc

        user = get_or_create_user_from_firebase(decoded)
        return (user, decoded)
