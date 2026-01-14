from uuid import UUID
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Organization, Membership

def _get_org_from_header(request):
    org_id = request.headers.get("X-Org-Id")
    if not org_id:
        return None, Response({"detail": "X-Org-Id header required"}, status=status.HTTP_400_BAD_REQUEST)
    try:
        org_uuid = UUID(org_id)
    except Exception:
        return None, Response({"detail": "Invalid X-Org-Id"}, status=status.HTTP_400_BAD_REQUEST)
    return org_uuid, None

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def list_orgs(request):
    if request.method == "GET":
        memberships = Membership.objects.filter(user=request.user).select_related("org")
        return Response([
            {"id": str(m.org.id), "name": m.org.name, "role": m.role}
            for m in memberships
        ])

    # POST create org (creator becomes owner)
    name = request.data.get("name")
    if not name:
        return Response({"detail": "name required"}, status=status.HTTP_400_BAD_REQUEST)

    org = Organization.objects.create(name=name)
    Membership.objects.create(user=request.user, org=org, role=Membership.ROLE_OWNER)
    return Response({"id": str(org.id), "name": org.name}, status=status.HTTP_201_CREATED)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_org(request):
    org_uuid, err = _get_org_from_header(request)
    if err:
        return err

    try:
        membership = Membership.objects.select_related("org").get(user=request.user, org_id=org_uuid)
    except Membership.DoesNotExist:
        return Response({"detail": "Not a member of this org"}, status=status.HTTP_403_FORBIDDEN)

    return Response({"id": str(membership.org.id), "name": membership.org.name, "role": membership.role})
