from rest_framework import serializers
from .models import User, Project, Task

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'role']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            role=validated_data.get('role', 'member')
        )
        return user

class ProjectSerializer(serializers.ModelSerializer):
    creator_name = serializers.ReadOnlyField(source='created_by.username')
    
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'created_by', 'creator_name', 'created_at']
        read_only_fields = ['created_by']

class TaskSerializer(serializers.ModelSerializer):
    assignee_name = serializers.ReadOnlyField(source='assignee.username')
    project_name = serializers.ReadOnlyField(source='project.name')

    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status', 'project', 'project_name', 'assignee', 'assignee_name', 'due_date', 'created_at']