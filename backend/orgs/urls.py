from django.urls import path
from .views import list_orgs, current_org

urlpatterns = [
    path("orgs/", list_orgs, name="list_orgs"),
    path("orgs/current/", current_org, name="current_org"),
]
