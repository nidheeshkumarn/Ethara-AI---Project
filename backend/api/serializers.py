from rest_framework import serializers
from .models import User, Project, Task

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']

class TaskSerializer(serializers.ModelSerializer):
    # This makes the API return the full user info, not just the user ID
    assigned_to_details = UserSerializer(source='assigned_to', read_only=True)
    
    class Meta:
        model = Task
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ['created_by']