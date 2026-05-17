from django.core.management.base import BaseCommand

from accounts.models import User
from citosis_pro.common import RoleChoices, UserStatusChoices


class Command(BaseCommand):
    help = 'Create or update the demo admin account.'

    def handle(self, *args, **options):
        user, created = User.all_objects.get_or_create(
            email='admin@example.com',
            defaults={
                'username': 'admin',
                'name': 'System Administrator',
                'office': 'Tourism Office',
                'role': RoleChoices.ADMIN,
                'status': UserStatusChoices.ACTIVE,
                'is_staff': True,
                'is_superuser': True,
                'deleted_at': None,
            },
        )
        user.username = 'admin'
        user.name = 'System Administrator'
        user.office = 'Tourism Office'
        user.role = RoleChoices.ADMIN
        user.status = UserStatusChoices.ACTIVE
        user.is_staff = True
        user.is_superuser = True
        user.deleted_at = None
        user.set_password('admin')
        user.save()

        if created:
            self.stdout.write(self.style.SUCCESS('Demo admin account created: admin / admin'))
        else:
            self.stdout.write(self.style.SUCCESS('Demo admin account updated: admin / admin'))