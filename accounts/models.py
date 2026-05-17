from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models

from accounts.managers import UserManager
from citosis_pro.common import RoleChoices, TimestampedSoftDeleteModel, UserStatusChoices


class User(TimestampedSoftDeleteModel, AbstractBaseUser, PermissionsMixin):
    id = models.BigAutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    office = models.CharField(max_length=255, blank=True)
    role = models.CharField(max_length=20, choices=RoleChoices.choices, default=RoleChoices.STAFF)
    status = models.CharField(max_length=20, choices=UserStatusChoices.choices, default=UserStatusChoices.ACTIVE)
    remember_token = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserManager()
    all_objects = models.Manager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'name']

    class Meta:
        ordering = ['name', 'email']
        db_table = 'users'

    def __str__(self):
        return self.name or self.email

    def save(self, *args, **kwargs):
        self.is_active = self.deleted_at is None and self.status == UserStatusChoices.ACTIVE
        if self.is_superuser:
            self.is_staff = True
        elif self.role in {RoleChoices.ADMIN, RoleChoices.MANAGER}:
            self.is_staff = True
        super().save(*args, **kwargs)