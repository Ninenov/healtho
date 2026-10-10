from django.contrib.auth import get_user_model

User = get_user_model()


class PhoneBackend:

    def authenticate(
        self,
        request,
        username=None,
        password=None,
        phone=None,
        **kwargs
    ):
        login_phone = phone or username

        if not login_phone or not password:
            return None

        try:
            user = User.objects.get(phone=login_phone)
        except User.DoesNotExist:
            return None

        if user.check_password(password) and user.is_active:
            return user

        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None