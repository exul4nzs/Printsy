"""
Custom DRF permission classes for role-based access control.
"""
from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    """
    DRF permission that grants access only to users whose
    UserProfile.role is 'admin'.
    """

    message = 'Admin role is required to access this resource.'

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        role = getattr(getattr(user, 'profile', None), 'role', None)
        return role == 'admin'
