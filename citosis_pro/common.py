from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Any

from django.db import models


class RoleChoices(models.TextChoices):
    ADMIN = 'Admin', 'Admin'
    MANAGER = 'Manager', 'Manager'
    ENCODER = 'Encoder', 'Encoder'
    STAFF = 'Staff', 'Staff'


class UserStatusChoices(models.TextChoices):
    ACTIVE = 'Active', 'Active'
    INACTIVE = 'Inactive', 'Inactive'


class RecordCategoryChoices(models.TextChoices):
    BEACH = 'Beach', 'Beach'
    MOUNTAIN = 'Mountain', 'Mountain'
    HERITAGE = 'Heritage', 'Heritage'
    NATURE = 'Nature', 'Nature'
    PARK = 'Park', 'Park'
    EVENT = 'Event', 'Event'
    OTHER = 'Other', 'Other'


class VisitorStatusChoices(models.TextChoices):
    CHECKED_IN = 'Checked In', 'Checked In'
    CHECKED_OUT = 'Checked Out', 'Checked Out'


class RecycleItemTypeChoices(models.TextChoices):
    RECORD = 'record', 'Record'
    VISITOR = 'visitor', 'Visitor'
    USER = 'user', 'User'


class SoftDeleteQuerySet(models.QuerySet):
    def alive(self):
        return self.filter(deleted_at__isnull=True)

    def deleted(self):
        return self.filter(deleted_at__isnull=False)


class ActiveManager(models.Manager):
    def get_queryset(self):
        return SoftDeleteQuerySet(self.model, using=self._db).alive()


class TimestampedSoftDeleteModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = ActiveManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True


def serialize_instance(instance: models.Model) -> dict[str, Any]:
    payload: dict[str, Any] = {}
    for field in instance._meta.fields:
        value = getattr(instance, field.attname)
        if isinstance(value, datetime):
            payload[field.attname] = value.isoformat()
        elif isinstance(value, date):
            payload[field.attname] = value.isoformat()
        elif isinstance(value, Decimal):
            payload[field.attname] = str(value)
        elif hasattr(value, 'name'):
            payload[field.attname] = value.name or None
        else:
            payload[field.attname] = value
    return payload