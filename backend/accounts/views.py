from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from orgs.models import Membership

User = get_user_model()

@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    email = request.data.get("email")
    password = request.data.get("password")
    username = request.data.get("username", email)

    if not email or not password:
        return Response({"detail": "email and password required"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({"detail": "email already exists"}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password)
    return Response({"id": user.id, "email": user.email}, status=status.HTTP_201_CREATED)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    memberships = Membership.objects.filter(user=request.user).select_related("org")
    orgs = [{"id": str(m.org.id), "name": m.org.name, "role": m.role} for m in memberships]
    default_org_id = orgs[0]["id"] if orgs else None

    return Response({
        "id": request.user.id,
        "email": request.user.email,
        "orgs": orgs,
        "default_org_id": default_org_id,
    })
