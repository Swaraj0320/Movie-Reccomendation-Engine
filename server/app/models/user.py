"""Pydantic models used by authentication endpoints."""

from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    """Data accepted when a new account is registered."""

    name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=6, max_length=128)


class UserLogin(BaseModel):
    """Data accepted when an existing user signs in."""

    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=128)


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
