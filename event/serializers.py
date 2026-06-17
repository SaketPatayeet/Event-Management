from rest_framework import serializers
from .models import Event,User,Registration,Notification
from rest_framework.exceptions import ValidationError

class EventSerializer(serializers.ModelSerializer):
    seats_remaining = serializers.SerializerMethodField()

    def get_seats_remaining(self, obj):
        return obj.seats_remaining()

    class Meta:
        model = Event
        fields = '__all__'
        read_only_fields = ['created_by', 'created_at', 'updated_at']

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'password'] #not all fields to not to expose everything
        extra_kwargs = {
            'password': {'write_only': True}
        }

class RegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Registration
        fields = '__all__'
        read_only_fields = ['user', 'registered_at']

    def validate(self, data):
        user = self.context['request'].user
        event = data['event']
        if Registration.objects.filter(user=user, event=event).exists():
            raise ValidationError("You are already registered for this event.")
        return data


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields='__all__'
        read_only_fields = ['sent_at']


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['username'] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.role
        data['username'] = self.user.username
        return data