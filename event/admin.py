from django.contrib import admin
from .models import User, Event, Registration, Notification

admin.site.register(User)
admin.site.register(Event)
admin.site.register(Registration)
admin.site.register(Notification)

# Register your models here.
