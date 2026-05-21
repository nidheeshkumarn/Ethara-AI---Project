from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Project, Task
from .serializers import ProjectSerializer, TaskSerializer

# Custom Permission: Only Admins can Create/Delete
class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS: # GET requests are safe
            return True
        return request.user.role == 'admin'

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

    def perform_create(self, serializer):
        # Automatically set 'created_by' to the logged-in admin
        serializer.save(created_by=self.request.user)

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Role-Based Data Fetching
    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Task.objects.all() # Admins see all tasks
        return Task.objects.filter(assigned_to=user) # Members see only theirs

    # Members can only update the status, Admins can do anything
    def perform_update(self, serializer):
        user = self.request.user
        if user.role == 'member':
            # Check if they are trying to change anything other than status
            if 'title' in self.request.data or 'due_date' in self.request.data:
                raise PermissionDenied("Members can only update task status.")
        serializer.save()