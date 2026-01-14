from django.contrib import admin
from .models import Organization, Membership
from .models import Organization, Membership, Project
admin.site.register(Project)

admin.site.register(Organization)
admin.site.register(Membership)
