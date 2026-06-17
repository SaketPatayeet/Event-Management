from rest_framework.routers import DefaultRouter
from .views import (
    EventViewSet,
    RegistrationViewSet,
    NotificationViewSet,
    UserViewSet,
)
from .views import DashboardView
from django.urls import path

router = DefaultRouter()

router.register(r'events', EventViewSet, basename='event')
router.register(r'registrations', RegistrationViewSet, basename='registration')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'users', UserViewSet, basename='user')

urlpatterns = router.urls+ [
    path('dashboard/', DashboardView.as_view()),
]