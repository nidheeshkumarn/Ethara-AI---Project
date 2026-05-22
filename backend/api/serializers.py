from datetime import date

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User, Project, Task

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['username'] = user.username
        return token

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'role']
        extra_kwargs = {
            'password': {'write_only': True},
            'role': {'required': False}
        }

    def validate_role(self, value):
        valid_roles = [choice[0] for choice in User.ROLE_CHOICES]
        if value not in valid_roles:
            raise serializers.ValidationError('Invalid role.')
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            role=validated_data.get('role', 'member')
        )
        return user

class ProjectSerializer(serializers.ModelSerializer):
    creator_name = serializers.ReadOnlyField(source='created_by.username')
    task_count = serializers.IntegerField(source='tasks.count', read_only=True)
    
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'created_by', 'creator_name', 'created_at', 'task_count']
        read_only_fields = ['created_by']

class TaskSerializer(serializers.ModelSerializer):
    assignee_name = serializers.ReadOnlyField(source='assignee.username')
    project_name = serializers.ReadOnlyField(source='project.name')

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status', 'project', 'project_name', 'assignee', 'assignee_name', 'due_date', 'created_at']

    def validate_due_date(self, value):
        if value and value < date.today():
            raise serializers.ValidationError('Due date cannot be in the past.')
        return value