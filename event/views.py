# pyrefly: ignore [missing-import]
from django.shortcuts import render
from django.http import HttpResponse
from .permissions import IsAdmin, IsAttendeeOrReadOnly,IsSuperAdmin
from rest_framework.permissions import IsAuthenticated,AllowAny,IsAuthenticatedOrReadOnly
from rest_framework.filters import SearchFilter
from rest_framework import viewsets
from .models import Event,User,Registration,Notification
from .serializers import EventSerializer,UserSerializer,RegistrationSerializer,NotificationSerializer
from rest_framework.decorators import action
import csv
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'report']:
            if self.request.user.is_authenticated and self.request.user.role == 'superadmin':
                return [IsSuperAdmin()]
            return [IsAdmin()]
        return [IsAuthenticatedOrReadOnly()]
    
    def get_queryset(self):
        user = self.request.user

        if user.is_authenticated and user.role == 'admin':
            return Event.objects.filter(created_by=user)

        return Event.objects.all()
    
    filter_backends = [SearchFilter]
    search_fields = ['title', 'category', 'venue']

    @action(detail=True, methods=['get'])
    def report(self, request, pk=None):
        event = self.get_object()
        registrations = Registration.objects.filter(event=event)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{event.title}_report.csv"'

        writer = csv.writer(response)
        writer.writerow(['Username', 'Email', 'Status', 'Registered At'])

        for reg in registrations:
            writer.writerow([reg.user.username, reg.user.email, reg.status, reg.registered_at])

        return response

    

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user.username)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    filter_backends = [SearchFilter]
    search_fields=['username','email','id']

    def get_permissions(self):
        if self.action == 'create':  # register endpoint - anyone can sign up
            return [AllowAny()]
        return [IsSuperAdmin()] 

    def perform_create(self,serializer):
        instance = serializer.save()
        if 'password' in serializer.validated_data:
            instance.set_password(serializer.validated_data['password'])
            instance.save()

class RegistrationViewSet(viewsets.ModelViewSet):
    queryset = Registration.objects.all()
    serializer_class = RegistrationSerializer
    permission_classes = [IsAttendeeOrReadOnly]

    def get_permissions(self):
        if self.request.user.is_authenticated and self.request.user.role == 'superadmin':
            return [IsSuperAdmin()]
        if self.action == 'create':
            return [IsAttendeeOrReadOnly()]
        return [IsAuthenticated()]

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.role == 'superadmin':
            return Registration.objects.all()
        return Registration.objects.filter(user=self.request.user)
    
    filter_backends = [SearchFilter]
    search_fields = [
        'user__username',
        'event__title'
    ]

    def perform_create(self, serializer):
        registration = serializer.save(user=self.request.user)
        Notification.objects.create(
            user=self.request.user,
            event=registration.event,
            type='registration_confirmed',
            message=f'{self.request.user.username} registration for {registration.event.title} is confirmed.'
        )

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Notification.objects.filter(event__created_by=user)
        return Notification.objects.filter(user=user)
    
class DashboardView(APIView):
    
    def get(self, request):
        user = request.user

        if user.role == 'superadmin':
            events = Event.objects.all()

            return Response({
                'total_events': events.count(),
                'total_registrations': Registration.objects.count(),
                'upcoming_events':
                    events.filter(
                        date__gt=timezone.now()
                    ).count(),
                'total_users':
                    User.objects.count(),
                'total_admins':
                    User.objects.filter(
                        role='admin'
                    ).count(),
                'total_attendees':
                    User.objects.filter(
                        role='attendee'
                    ).count(),
            }, status=200)
            

        if user.role == 'admin':
            events = Event.objects.filter(created_by=user)
            event_stats = []
            for event in events:
                event_stats.append({
                    'event': event.title,
                    'capacity': event.capacity,
                    'registrations': Registration.objects.filter(event=event).count(),
                    'seats_remaining': event.seats_remaining(),
                })
            return Response({
                'total_events': events.count(),
                'total_registrations': Registration.objects.filter(event__created_by=user).count(),
                'upcoming_events': events.filter(date__gt=timezone.now()).count(),
                'event_stats': event_stats,
            },status=200)

        else:
            registrations = Registration.objects.filter(user=user)
            return Response({
                'total_events': Event.objects.count(),
                'total_registrations': registrations.count(),
                'upcoming_events': registrations.filter(event__date__gt=timezone.now()).count(),
            },status=200)


from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer