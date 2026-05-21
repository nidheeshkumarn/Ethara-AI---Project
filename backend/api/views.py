from rest_framework import viewsets, generics, permissions
from .models import User, Task
from .serializers import UserSerializer, TaskSerializer

# Feature 1: Signup API
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny] # Anyone can sign up

# Feature 2 & 3: Task Management & RBAC
class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # RBAC: Admins get everything. Members get only their assigned tasks.
        if user.role == 'admin':
            return Task.objects.all()
        return Task.objects.filter(assignee=user)

    def perform_create(self, serializer):
        # Optional: You could force the assigner here, but usually Admins pick the assignee
        serializer.save()