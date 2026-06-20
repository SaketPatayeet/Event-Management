from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    ROLE_CHOICES = [
    ('admin', 'Admin'),
    ('attendee', 'Attendee'),
    ('superadmin', 'Superadmin'),
]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='attendee')

    def __str__(self):
        return f"{self.username} ({self.role})"


class Event(models.Model):
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=200)
    date = models.DateTimeField()
    venue = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    capacity = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def seats_remaining(self):
        return self.capacity - self.registrations.filter(status='confirmed').count()

    def __str__(self):
        return self.title


class Registration(models.Model):
    STATUS_CHOICES = [
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='registrations')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='registrations')
    registered_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'event')  # prevents duplicate registrations

    def __str__(self):
        return f"{self.user.username} → {self.event.title}"


class Notification(models.Model):
    TYPE_CHOICES = [
        ('registration_confirmed', 'Registration Confirmed'),
        ('event_updated', 'Event Updated'),
        ('event_cancelled', 'Event Cancelled'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    sent_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.type} → {self.user.username}"
# Create your models here.
