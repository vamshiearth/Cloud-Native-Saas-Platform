from rest_framework.response import Response
from rest_framework import status
from .models import Membership

def get_membership(user, org_id):
    try:
        return Membership.objects.get(user=user, org_id=org_id)
    except Membership.DoesNotExist:
        return None

def require_role(request, org_id, allowed_roles):
    membership = get_membership(request.user, org_id)
    if not membership:
        return None, Response({"detail": "Not a member of this org"}, status=status.HTTP_403_FORBIDDEN)
    if membership.role not in allowed_roles:
        return None, Response({"detail": "Insufficient role"}, status=status.HTTP_403_FORBIDDEN)
    return membership, None
