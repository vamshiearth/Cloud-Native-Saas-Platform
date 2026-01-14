import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from orgs.models import Membership, Organization

User = get_user_model()


@pytest.mark.django_db
def test_register_login_and_create_org():
    c = APIClient()

    # register
    r = c.post("/api/auth/register/", {"email": "a@a.com", "password": "Pass1234!"}, format="json")
    assert r.status_code == 201

    # login
    r = c.post("/api/auth/login/", {"email": "a@a.com", "password": "Pass1234!"}, format="json")
    assert r.status_code == 200
    access = r.data["access"]
    c.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

    # create org
    r = c.post("/api/orgs/", {"name": "Acme"}, format="json")
    assert r.status_code == 201
    org_id = r.data["id"]

    # list orgs
    r = c.get("/api/orgs/")
    assert r.status_code == 200
    assert any(o["id"] == org_id for o in r.data)


@pytest.mark.django_db
def test_org_header_required_for_current_org():
    user = User.objects.create_user(username="u", email="u@u.com", password="Pass1234!")
    org = Organization.objects.create(name="Org1")
    Membership.objects.create(user=user, org=org, role=Membership.ROLE_OWNER)

    c = APIClient()
    r = c.post("/api/auth/login/", {"email": "u@u.com", "password": "Pass1234!"}, format="json")
    access = r.data["access"]
    c.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")

    r = c.get("/api/orgs/current/")
    assert r.status_code == 400
    assert "X-Org-Id" in r.data["detail"]


@pytest.mark.django_db
def test_invite_requires_owner_or_admin():
    owner = User.objects.create_user(username="o", email="o@o.com", password="Pass1234!")
    member = User.objects.create_user(username="m", email="m@m.com", password="Pass1234!")
    target = User.objects.create_user(username="t", email="t@t.com", password="Pass1234!")

    org = Organization.objects.create(name="OrgX")
    Membership.objects.create(user=owner, org=org, role=Membership.ROLE_OWNER)
    Membership.objects.create(user=member, org=org, role=Membership.ROLE_MEMBER)

    # member tries invite -> 403
    c = APIClient()
    r = c.post("/api/auth/login/", {"email": "m@m.com", "password": "Pass1234!"}, format="json")
    c.credentials(HTTP_AUTHORIZATION=f"Bearer {r.data['access']}", HTTP_X_ORG_ID=str(org.id))

    r = c.post("/api/orgs/invite/", {"email": "t@t.com", "role": "member"}, format="json")
    assert r.status_code == 403

    # owner invites -> 201/200
    c2 = APIClient()
    r = c2.post("/api/auth/login/", {"email": "o@o.com", "password": "Pass1234!"}, format="json")
    c2.credentials(HTTP_AUTHORIZATION=f"Bearer {r.data['access']}", HTTP_X_ORG_ID=str(org.id))

    r = c2.post("/api/orgs/invite/", {"email": "t@t.com", "role": "admin"}, format="json")
    assert r.status_code in (200, 201)
