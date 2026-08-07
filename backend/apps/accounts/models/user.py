from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
)
from django.db import models

from apps.accounts.constants.user_roles import UserRole
from apps.accounts.managers import UserManager
from apps.common.models import BaseModel


class User(
    BaseModel,
    AbstractBaseUser,
    PermissionsMixin,
):
    phone = models.CharField(
        max_length=15,
        unique=True,
    )

    email = models.EmailField(
        unique=True,
        blank=True,
        null=True,
    )

    first_name = models.CharField(
        max_length=100,
    )

    last_name = models.CharField(
        max_length=100,
        blank=True,
    )

    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.PATIENT,
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "phone"

    REQUIRED_FIELDS = []

    def __str__(self):
        return self.phone