from django.urls import path
from .views import list_orgs, current_org
from .views import list_orgs, current_org, invite_member
from .views import list_orgs, current_org, invite_member, projects


urlpatterns = [
    path("orgs/", list_orgs, name="list_orgs"),
    path("orgs/current/", current_org, name="current_org"),
    path("orgs/invite/", invite_member, name="invite_member"),
    path("projects/", projects, name="projects"),
]
