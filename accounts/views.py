from django.contrib.auth import authenticate
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.shortcuts import render
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.views import View
from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.permissions import IsActiveSystemUser, IsAdminOnly, IsAdminOrManager
from accounts.serializers import LoginSerializer, UserSerializer
from audit.services import log_action, soft_delete_to_recycle
from citosis_pro.common import RecycleItemTypeChoices, UserStatusChoices


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        login_value = serializer.validated_data['username']
        password = serializer.validated_data['password']
        user = authenticate(request, username=login_value, password=password)
        if not user:
            return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_400_BAD_REQUEST)
        token, _ = Token.objects.get_or_create(user=user)
        log_action(user, 'User login', f'{user.username} signed in.', request)
        return Response({'token': token.key, 'user': UserSerializer(user, context={'request': request}).data})


class LogoutView(APIView):
    permission_classes = [IsActiveSystemUser]

    def post(self, request):
        if request.auth:
            request.auth.delete()
        log_action(request.user, 'User logout', f'{request.user.username} signed out.', request)
        return Response({'detail': 'Logged out successfully.'})


class MeView(APIView):
    permission_classes = [IsActiveSystemUser]

    def get(self, request):
        return Response(UserSerializer(request.user, context={'request': request}).data)


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all().order_by('-updated_at')

    def get_permissions(self):
        if self.action in {'create', 'update', 'partial_update', 'destroy'}:
            permission_classes = [IsAdminOnly]
        else:
            permission_classes = [IsAdminOrManager]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = User.objects.all().order_by('-updated_at')
        search = self.request.query_params.get('search', '').strip()
        role = self.request.query_params.get('role', '').strip()
        status_value = self.request.query_params.get('status', '').strip()
        if search:
            queryset = queryset.filter(name__icontains=search) | queryset.filter(username__icontains=search) | queryset.filter(email__icontains=search) | queryset.filter(office__icontains=search)
        if role:
            queryset = queryset.filter(role=role)
        if status_value:
            queryset = queryset.filter(status=status_value)
        return queryset.distinct()

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.pk == request.user.pk:
            return Response({'detail': 'You cannot delete your own account.'}, status=status.HTTP_400_BAD_REQUEST)
        soft_delete_to_recycle(instance, RecycleItemTypeChoices.USER, request.user, request=request)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminOnly])
    def reset_password(self, request, pk=None):
        user = self.get_object()
        new_password = request.data.get('password') or 'changeme123'
        user.set_password(new_password)
        user.save(update_fields=['password', 'updated_at', 'is_active', 'is_staff'])
        log_action(request.user, 'Password reset', f'Reset password for user #{user.pk}.', request)
        return Response({'detail': 'Password reset successfully.'})


class SetPasswordView(View):
    template_name = 'citosis/set_password.html'
    token_generator = PasswordResetTokenGenerator()

    def get_user(self, uidb64):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
        except (TypeError, ValueError, OverflowError):
            return None
        return User.all_objects.filter(pk=uid).first()

    def get(self, request, uidb64, token):
        user = self.get_user(uidb64)
        if not user or not self.token_generator.check_token(user, token):
            return render(request, self.template_name, {'error': 'This password setup link is invalid or expired.'})
        return render(request, self.template_name, {'error': None})

    def post(self, request, uidb64, token):
        user = self.get_user(uidb64)
        if not user or not self.token_generator.check_token(user, token):
            return render(request, self.template_name, {'error': 'This password setup link is invalid or expired.'})

        password1 = request.POST.get('password1', '')
        password2 = request.POST.get('password2', '')
        if not password1 or not password2:
            return render(request, self.template_name, {'error': 'Please enter and confirm your new password.'})
        if password1 != password2:
            return render(request, self.template_name, {'error': 'Passwords do not match.'})

        user.set_password(password1)
        user.status = UserStatusChoices.ACTIVE
        user.is_active = True
        user.deleted_at = None
        user.save(update_fields=['password', 'status', 'is_active', 'deleted_at', 'updated_at'])
        log_action(user, 'Set password', 'Completed initial password setup.', request)
        return render(request, self.template_name, {'success': 'Password updated successfully. You can now log in.'})
