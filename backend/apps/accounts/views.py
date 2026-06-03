"""
Authentication views and endpoints.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView as SimpleJWTTokenRefreshView
from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import User
from apps.accounts.serializers import (
    BakeryTokenObtainPairSerializer,
    MeSerializer,
    UserSerializer,
)


class BakeryTokenObtainPairView(TokenObtainPairView):
    """
    Obtain JWT token pair (access + refresh).
    
    POST /api/auth/login
    {
        "email": "user@example.com",
        "password": "password123"
    }
    """
    serializer_class = BakeryTokenObtainPairSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        """Override to wrap auth responses and return consistent error codes."""
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as exc:
            return Response(
                {
                    'success': False,
                    'error': {
                        'message': str(exc.detail),
                        'code': 'authentication_failed',
                    },
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        data = serializer.validated_data
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            user.last_login = timezone.now()
            user.update_last_login_display()
        except User.DoesNotExist:
            pass

        return Response(
            {
                'success': True,
                'data': data,
            },
            status=status.HTTP_200_OK,
        )


class BakeryTokenRefreshView(SimpleJWTTokenRefreshView):
    """
    Refresh JWT access token.
    
    POST /api/auth/refresh
    {
        "refresh": "refresh_token"
    }
    """

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        return Response(
            {
                'success': True,
                'data': response.data,
            },
            status=response.status_code,
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Logout and invalidate refresh token.
    
    POST /api/auth/logout
    """
    try:
        user = request.user
        user.last_logout = timezone.now()
        user.save()
        
        # Optional: Blacklist the refresh token
        # If you implement token blacklist
        
        return Response(
            {
                'success': True,
                'message': 'Successfully logged out.',
            },
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response(
            {
                'success': False,
                'error': {
                    'message': str(e),
                    'code': 'LogoutError',
                },
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """
    Get current authenticated user info.
    
    GET /api/auth/me
    """
    serializer = MeSerializer(request.user)
    return Response(
        {
            'success': True,
            'data': serializer.data,
        },
        status=status.HTTP_200_OK,
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def health_check_view(request):
    """
    Health check endpoint.
    
    POST /api/auth/health/
    """
    return Response(
        {
            'success': True,
            'message': 'API is healthy',
            'timestamp': timezone.now(),
        },
        status=status.HTTP_200_OK,
    )
