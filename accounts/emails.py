from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode


def send_account_setup_email(user):
    if not user or not user.email:
        return

    app_url = getattr(settings, 'APP_URL', 'http://localhost:8000').rstrip('/')
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = PasswordResetTokenGenerator().make_token(user)
    setup_link = f'{app_url}/set-password/{uid}/{token}/'

    subject = 'Your CITOSIS PRO account'
    message = (
        f'Hello {user.name or user.username},\n\n'
        'Your CITOSIS PRO account has been created.\n'
        f'Username: {user.username}\n'
        f'Set your password here: {setup_link}\n\n'
        'If you did not expect this email, please contact your administrator.'
    )

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )
