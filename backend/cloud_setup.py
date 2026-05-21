import os
import django

# 1. Force the Railway Database URL directly in the code
os.environ['DATABASE_URL'] = 'postgresql://postgres:bQPQLKIbCSIXlOytMZWImNNWpLWJofFG@kodama.proxy.rlwy.net:53101/railway'
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# 2. Boot up Django's engine
django.setup()

# 3. Inject the users into the live database
from api.models import User

print("Connecting to Railway Cloud Database...")

# Setup Admin
admin, created = User.objects.get_or_create(username='admin_user')
admin.set_password('password123')
admin.role = 'admin'
admin.save()
print("✅ Admin account verified in the cloud!")

# Setup Member
member, created = User.objects.get_or_create(username='member_user')
member.set_password('password123')
member.role = 'member'
member.save()
print("✅ Member account verified in the cloud!")

print("🚀 SUCCESS: You can now log in on your live website!")