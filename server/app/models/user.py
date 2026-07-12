"""Pydantic models used by authentication endpoints."""

import re
from urllib.parse import urlparse

from pydantic import BaseModel, Field, field_validator


EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
PHONE_PATTERN = re.compile(r"^[0-9+()\-\s]{7,30}$")


def normalize_name(value: str) -> str:
    value = value.strip()
    if not value:
        raise ValueError("Name cannot be blank")
    return value


def normalize_email(value: str) -> str:
    value = value.strip().lower()
    if not EMAIL_PATTERN.fullmatch(value):
        raise ValueError("Enter a valid email address")
    return value


class UserCreate(BaseModel):
    """Data accepted when a new account is registered."""

    name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        return normalize_name(value)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return normalize_email(value)

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not all((any(char.islower() for char in value), any(char.isupper() for char in value), any(char.isdigit() for char in value))):
            raise ValueError("Password must include upper-case, lower-case, and numeric characters")
        return value


class UserLogin(BaseModel):
    """Data accepted when an existing user signs in."""

    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        return normalize_email(value)


class UserOut(BaseModel):
    """Safe user data returned to the client (password is never included)."""

    id: str
    name: str
    email: str
    preferences: list[int] = Field(default_factory=list)
    phone: str | None = None
    profile_picture_url: str | None = None


class UserProfileUpdate(BaseModel):
    """Editable fields for a user's profile."""

    name: str | None = Field(default=None, min_length=1, max_length=100)
    phone: str | None = Field(default=None, max_length=30)
    profile_picture_url: str | None = Field(default=None, max_length=2048)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str | None) -> str | None:
        return normalize_name(value) if value is not None else value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str | None) -> str | None:
        if value is None or not value.strip():
            return None
        value = value.strip()
        if not PHONE_PATTERN.fullmatch(value):
            raise ValueError("Phone number contains invalid characters")
        return value

    @field_validator("profile_picture_url")
    @classmethod
    def validate_profile_picture_url(cls, value: str | None) -> str | None:
        if value is None or not value.strip():
            return None
        value = value.strip()
        parsed_url = urlparse(value)
        if parsed_url.scheme not in {"http", "https"} or not parsed_url.netloc:
            raise ValueError("Profile picture URL must use http or https")
        return value
