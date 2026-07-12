"""Password hashing and JWT helpers for user authentication."""

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings


ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

# bcrypt hashes passwords securely; the original password is never stored.
password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Return a bcrypt hash for a plain-text password."""
    return password_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Check a plain-text password against its stored bcrypt hash."""
    return password_context.verify(plain_password, hashed_password)


def _get_secret_key() -> str:
    """Fail safely if the deployment forgot to configure its JWT secret."""
    if len(settings.secret_key) < 32:
        raise RuntimeError("SECRET_KEY must be a private random value of at least 32 characters.")
    return settings.secret_key


def validate_security_settings() -> None:
    """Validate security-critical configuration during application startup."""
    _get_secret_key()


def create_access_token(data: dict) -> str:
    """Create a signed JWT that expires seven days from now."""
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + timedelta(
        days=ACCESS_TOKEN_EXPIRE_DAYS
    )
    return jwt.encode(payload, _get_secret_key(), algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    """Verify a JWT and return its payload, or None when it is invalid/expired."""
    try:
        return jwt.decode(token, _get_secret_key(), algorithms=[ALGORITHM])
    except JWTError:
        return None
