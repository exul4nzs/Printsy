from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from .firebase_auth import serialize_user

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Minimal Authentication Endpoint.
    Validates credentials and returns an auth token.
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({'error': 'Please provide both username and password'}, status=status.HTTP_400_BAD_REQUEST)
        
    user = authenticate(username=username, password=password)
    
    if not user:
        return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
    token, _ = Token.objects.get_or_create(user=user)
    
    return Response({
        'token': token.key,
        'user': serialize_user(user),
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile_view(request):
    """
    Returns the authenticated user's profile info.
    """
    return Response(serialize_user(request.user))
