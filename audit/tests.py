from django.test import RequestFactory, TestCase
from rest_framework.test import APITestCase

from accounts.models import User
from audit.models import ActivityLog, RecycleBin
from audit.services import log_action, purge_recycle_entry, restore_recycle_entry, soft_delete_to_recycle
from citosis_pro.common import RecycleItemTypeChoices, RoleChoices, UserStatusChoices


def create_user(email, username, role=RoleChoices.STAFF, status=UserStatusChoices.ACTIVE):
    return User.objects.create_user(
        email=email,
        password='pass1234',
        username=username,
        name='Test User',
        role=role,
        status=status,
    )


class AuditServiceTests(TestCase):
    def setUp(self):
        self.actor = create_user('admin@example.com', 'admin', role=RoleChoices.ADMIN)

    def test_log_action_captures_request_meta(self):
        request = RequestFactory().get('/', HTTP_X_FORWARDED_FOR='10.0.0.1', HTTP_USER_AGENT='AuditTestAgent')
        log_action(self.actor, 'Test action', 'Did a thing.', request)

        log_entry = ActivityLog.objects.get()
        self.assertEqual(log_entry.user, self.actor)
        self.assertEqual(log_entry.action, 'Test action')
        self.assertEqual(log_entry.details, 'Did a thing.')
        self.assertEqual(log_entry.ip_address, '10.0.0.1')
        self.assertEqual(log_entry.user_agent, 'AuditTestAgent')

    def test_soft_delete_to_recycle_marks_user_inactive_and_creates_entry(self):
        user = create_user('user@example.com', 'user')
        soft_delete_to_recycle(user, RecycleItemTypeChoices.USER, self.actor)

        user.refresh_from_db()
        self.assertIsNotNone(user.deleted_at)
        self.assertEqual(user.status, UserStatusChoices.INACTIVE)
        self.assertFalse(user.is_active)

        entry = RecycleBin.objects.get(item_id=str(user.pk))
        self.assertEqual(entry.item_type, RecycleItemTypeChoices.USER)
        self.assertEqual(entry.deleted_by, self.actor)

    def test_restore_recycle_entry_reactivates_user(self):
        user = create_user('restore@example.com', 'restore')
        entry = soft_delete_to_recycle(user, RecycleItemTypeChoices.USER, self.actor)

        restore_recycle_entry(entry, self.actor)

        user = User.all_objects.get(pk=user.pk)
        self.assertIsNone(user.deleted_at)
        self.assertEqual(user.status, UserStatusChoices.ACTIVE)
        self.assertTrue(user.is_active)

        entry.refresh_from_db()
        self.assertIsNotNone(entry.restored_at)
        self.assertEqual(entry.restored_by, self.actor)

    def test_purge_recycle_entry_deletes_soft_deleted_instance(self):
        user = create_user('purge@example.com', 'purge')
        entry = soft_delete_to_recycle(user, RecycleItemTypeChoices.USER, self.actor)

        purge_recycle_entry(entry, self.actor)

        self.assertFalse(RecycleBin.objects.filter(pk=entry.pk).exists())
        self.assertFalse(User.all_objects.filter(pk=user.pk).exists())


class AuditApiTests(APITestCase):
    def setUp(self):
        self.admin = create_user('apiadmin@example.com', 'apiadmin', role=RoleChoices.ADMIN)
        self.staff = create_user('apistaff@example.com', 'apistaff', role=RoleChoices.STAFF)

    def test_dashboard_overview_returns_payload(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/dashboard/overview/')

        self.assertEqual(response.status_code, 200)
        self.assertIn('stats', response.data)
        self.assertIn('destination_popularity', response.data)
        self.assertIn('recent_activity', response.data)
        self.assertIn('recent_records', response.data)
        self.assertIn('summary', response.data)
        self.assertIn('records', response.data['stats'])

    def test_recycle_bin_list_requires_admin_or_manager(self):
        self.client.force_authenticate(user=self.staff)
        response = self.client.get('/api/recycle-bin/')

        self.assertEqual(response.status_code, 403)
