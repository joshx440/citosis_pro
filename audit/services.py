from __future__ import annotations

import json
from datetime import datetime
from typing import Any

from django.db import models
from django.db.models import DateTimeField, Field
from django.utils import timezone
from django.utils.dateparse import parse_datetime

from accounts.models import User
from audit.models import ActivityLog, RecycleBin
from citosis_pro.common import RecycleItemTypeChoices, UserStatusChoices, serialize_instance
from tourism.models import TourismRecord, Visitor


def get_request_meta(request):
    if not request:
        return None, None
    forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded_for:
        ip_address = forwarded_for.split(',')[0].strip()
    else:
        ip_address = request.META.get('REMOTE_ADDR')
    user_agent = request.META.get('HTTP_USER_AGENT')
    return ip_address, user_agent


def log_action(user, action, details='', request=None):
    ip_address, user_agent = get_request_meta(request)
    return ActivityLog.objects.create(
        user=user if getattr(user, 'is_authenticated', False) else None,
        action=action,
        details=details,
        ip_address=ip_address,
        user_agent=user_agent,
    )


def soft_delete_to_recycle(instance: models.Model, item_type: str, deleted_by, request=None):
    if getattr(instance, 'deleted_at', None):
        return instance

    snapshot = serialize_instance(instance)
    RecycleBin.objects.create(
        item_type=item_type,
        item_id=str(instance.pk),
        item_data=snapshot,
        deleted_by=deleted_by,
    )
    instance.deleted_at = timezone.now()
    if isinstance(instance, User):
        instance.status = UserStatusChoices.INACTIVE
        instance.is_active = False
    instance.save()
    log_action(deleted_by, f'Deleted {item_type}', f'Soft deleted {item_type} #{instance.pk}.', request)
    return instance


def get_model_for_item_type(item_type: str):
    mapping = {
        RecycleItemTypeChoices.RECORD: TourismRecord,
        RecycleItemTypeChoices.VISITOR: Visitor,
        RecycleItemTypeChoices.USER: User,
    }
    return mapping[item_type]


def restore_recycle_entry(entry: RecycleBin, restored_by, request=None):
    model = get_model_for_item_type(entry.item_type)
    instance = model.all_objects.filter(pk=entry.item_id).first()
    if instance:
        instance.deleted_at = None
        if isinstance(instance, User):
            instance.status = UserStatusChoices.ACTIVE
            instance.is_active = True
        instance.save()
    entry.restored_at = timezone.now()
    entry.restored_by = restored_by
    entry.save(update_fields=['restored_at', 'restored_by'])
    log_action(restored_by, f'Restored {entry.item_type}', f'Restored {entry.item_type} #{entry.item_id}.', request)
    return entry


def purge_recycle_entry(entry: RecycleBin, purged_by, request=None):
    model = get_model_for_item_type(entry.item_type)
    instance = model.all_objects.filter(pk=entry.item_id).first()
    if instance and getattr(instance, 'deleted_at', None):
        instance.delete()
    item_id = entry.item_id
    item_type = entry.item_type
    entry.delete()
    log_action(purged_by, f'Purged {item_type}', f'Permanently removed {item_type} #{item_id}.', request)


def coerce_value(field: Field, value: Any):
    if value in ['', None]:
        return None
    if isinstance(field, DateTimeField) and isinstance(value, str):
        parsed = parse_datetime(value)
        if parsed is None:
            return value
        if timezone.is_naive(parsed):
            return timezone.make_aware(parsed, timezone.get_current_timezone())
        return parsed
    return value


def build_import_defaults(model, row: dict[str, Any]):
    defaults = {}
    for field in model._meta.fields:
        if field.primary_key:
            continue
        key = field.attname
        if key in row:
            defaults[key] = coerce_value(field, row.get(key))
    return defaults


def serialize_backup_payload():
    return {
        'users': [serialize_instance(item) for item in User.all_objects.order_by('id')],
        'records': [serialize_instance(item) for item in TourismRecord.all_objects.order_by('id')],
        'visitors': [serialize_instance(item) for item in Visitor.all_objects.order_by('id')],
        'activity_logs': [serialize_instance(item) for item in ActivityLog.objects.order_by('id')],
        'recycle_bin': [serialize_instance(item) for item in RecycleBin.objects.order_by('id')],
        'exported_at': timezone.now().isoformat(),
    }


def import_backup_payload(payload: dict[str, Any], actor=None, request=None):
    users = payload.get('users', [])
    records = payload.get('records', [])
    visitors = payload.get('visitors', [])
    logs = payload.get('activity_logs', [])
    recycle_entries = payload.get('recycle_bin', [])

    for row in users:
        user_id = row.get('id')
        if not user_id:
            continue
        defaults = build_import_defaults(User, row)
        User.all_objects.update_or_create(id=user_id, defaults=defaults)

    for row in records:
        row_id = row.get('id')
        if not row_id:
            continue
        defaults = build_import_defaults(TourismRecord, row)
        TourismRecord.all_objects.update_or_create(id=row_id, defaults=defaults)

    for row in visitors:
        row_id = row.get('id')
        if not row_id:
            continue
        defaults = build_import_defaults(Visitor, row)
        Visitor.all_objects.update_or_create(id=row_id, defaults=defaults)

    for row in logs:
        row_id = row.get('id')
        if not row_id:
            continue
        defaults = build_import_defaults(ActivityLog, row)
        ActivityLog.objects.update_or_create(id=row_id, defaults=defaults)

    for row in recycle_entries:
        row_id = row.get('id')
        if not row_id:
            continue
        defaults = build_import_defaults(RecycleBin, row)
        RecycleBin.objects.update_or_create(id=row_id, defaults=defaults)

    if actor:
        log_action(actor, 'Imported backup', 'Imported backup payload into the system.', request)