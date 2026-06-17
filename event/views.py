# pyrefly: ignore [missing-import]
from django.shortcuts import render
from django.http import HttpResponse
from .permissions import IsAdmin, IsAttendeeOrReadOnly
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
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    filter_backends = [SearchFilter]
    search_fields = ['title', 'category', 'venue']

    @action(detail=True, methods=['get'],permission_classes=[IsAdmin])
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

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy','report']:
            return [IsAdmin()]
        return [IsAuthenticatedOrReadOnly()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'create':  # register endpoint - anyone can sign up
            return [AllowAny()]
        return [IsAdmin()] 

    def perform_create(self,serializer):
        instance = serializer.save()
        if 'password' in serializer.validated_data:
            instance.set_password(serializer.validated_data['password'])
            instance.save()

class RegistrationViewSet(viewsets.ModelViewSet):
    queryset = Registration.objects.all()
    serializer_class = RegistrationSerializer
    permission_classes = [IsAttendeeOrReadOnly]

    def get_queryset(self):
        return Registration.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        registration = serializer.save(user=self.request.user)
        Notification.objects.create(
            user=self.request.user,
            event=registration.event,
            type='registration_confirmed',
            message=f'Your registration for {registration.event.title} is confirmed.'
        )

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

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
            })

        else:
            registrations = Registration.objects.filter(user=user)
            return Response({
                'total_events': Event.objects.count(),
                'total_registrations': registrations.count(),
                'upcoming_events': registrations.filter(event__date__gt=timezone.now()).count(),
            })


from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer