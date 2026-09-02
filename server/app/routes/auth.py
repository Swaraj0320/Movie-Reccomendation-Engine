"""Registration, login, and current-user authentication dependency."""

from datetime import datetime, timezone
import secrets

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from pymongo.errors import DuplicateKeyError

from app.core.rate_limit import enforce_rate_limit
from app.core.config import settings
from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
    decode_access_token,
)
from app.db import get_database
from app.models.user import GoogleTokenLogin, UserCreate, UserLogin, UserOut


router = APIRouter(tags=["Authentication"])
bearer_scheme = HTTPBearer(auto_error=False)


def user_to_response(user: dict) -> UserOut:
    """Convert MongoDB's _id field into the client-friendly id field."""
    return UserOut(
        id=str(user["_id"]),
        name=user["name"],
        email=user["email"],
        preferences=user.get("preferences", []),
        phone=user.get("phone"),
        profile_picture_url=user.get("profile_picture_url"),
    )


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user: UserCreate, request: Request):
    """Create a user account and immediately issue a seven-day access token."""
    enforce_rate_limit(request, "register", max_attempts=5, window_seconds=3600)
    db = get_database()
    email = user.email.strip().lower()

    # One email address can only have one account.
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    user_document = {
        "name": user.name.strip(),
        "email": email,
        "password": hash_password(user.password),
        "preferences": [],
        "created_at": datetime.now(timezone.utc),
    }
    try:
        result = await db.users.insert_one(user_document)
    except DuplicateKeyError as error:
        raise HTTPException(status_code=400, detail="Email already registered") from error
    user_document["_id"] = result.inserted_id

    is_admin = email in settings.admin_emails
    token = create_access_token({"sub": str(result.inserted_id), "is_admin": is_admin})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_to_response(user_document),
        "is_admin": is_admin,
    }


@router.post("/login")
async def login(credentials: UserLogin, request: Request):
    """Verify credentials and return a fresh JWT when they are correct."""
    enforce_rate_limit(request, "login", max_attempts=10, window_seconds=900)
    email = credentials.email.strip().lower()

    # The administrator has a reserved MongoDB user record created at startup,
    # but still authenticates directly from environment credentials.
    if (
        settings.admin_email
        and settings.admin_password
        and email == settings.admin_email
        and credentials.password == settings.admin_password
    ):
        try:
            admin_oid = ObjectId(settings.admin_user_id)
        except Exception as error:
            raise HTTPException(status_code=503, detail="Administrator account is not properly configured") from error
        admin_user = await get_database().users.find_one(
            {"_id": admin_oid}
        )
        if not admin_user:
            raise HTTPException(status_code=503, detail="Administrator account is not ready")
        # Ensure sub is always a string in the token payload
        token = create_access_token({"sub": str(admin_oid), "is_admin": True})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user_to_response(admin_user),
            "is_admin": True,
        }

    db = get_database()
    user = await db.users.find_one({"email": email})

    if not user:
        raise HTTPException(status_code=401, detail="Email is not registered")
    if user.get("password_is_unusable") is True or not user.get("password"):
        raise HTTPException(status_code=401, detail="Password login is not available for this account")
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Password is incorrect")

    is_admin = email in settings.admin_emails
    token = create_access_token({"sub": str(user["_id"]), "is_admin": is_admin})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_to_response(user),
        "is_admin": is_admin,
    }


@router.post("/google")
async def google_login(credentials: GoogleTokenLogin, request: Request):
    """Verify a Google ID token, then log in or provision the matching user."""
    enforce_rate_limit(request, "google_login", max_attempts=10, window_seconds=900)
    if not settings.google_client_id:
        raise HTTPException(status_code=503, detail="Google sign-in is not configured")

    try:
        payload = id_token.verify_oauth2_token(
            credentials.credential,
            google_requests.Request(),
            settings.google_client_id,
        )
    except Exception as error:
        # Never accept an unverified email or expose token-verification internals.
        raise HTTPException(status_code=401, detail="Invalid Google sign-in token") from error

    email = payload.get("email", "").strip().lower()
    if not email or payload.get("email_verified") is not True:
        raise HTTPException(status_code=401, detail="Google account email could not be verified")

    db = get_database()
    is_primary_admin = bool(settings.admin_email and email == settings.admin_email)
    is_admin = email in settings.admin_emails
    if is_primary_admin:
        # Reuse the reserved administrator record so every protected route sees
        # the same identity as a password-based administrator login.
        user = await db.users.find_one({"_id": ObjectId(settings.admin_user_id)})
        if not user:
            raise HTTPException(status_code=503, detail="Administrator account is not ready")
    else:
        user = await db.users.find_one({"email": email})

    if not user:
        # Password login remains unsupported for Google-created accounts: this
        # random hash is intentionally unknown to everyone, including the user.
        google_name = str(payload.get("name") or "").strip()[:100]
        user_document = {
            "name": google_name or email.split("@", 1)[0],
            "email": email,
            "password": hash_password(secrets.token_urlsafe(48)),
            "password_is_unusable": True,
            "auth_provider": "google",
            "preferences": [],
            "created_at": datetime.now(timezone.utc),
        }
        try:
            result = await db.users.insert_one(user_document)
        except DuplicateKeyError:
            # A concurrent first Google login may have inserted this email.
            user = await db.users.find_one({"email": email})
            if not user:
                raise HTTPException(status_code=409, detail="Unable to create Google account")
        else:
            user_document["_id"] = result.inserted_id
            user = user_document

    token = create_access_token({"sub": str(user["_id"]), "is_admin": is_admin})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_to_response(user),
        "is_admin": is_admin,
    }


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> UserOut:
    """Read the Bearer JWT, then fetch the authenticated user from MongoDB.

    Other routers can add ``current_user: UserOut = Depends(get_current_user)``
    to require a logged-in user.
    """
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise unauthorized

    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise unauthorized
    
    user_id = payload.get("sub")
    if not user_id:
        raise unauthorized

    try:
        # user_id should always be a string (from JWT payload)
        object_id = ObjectId(str(user_id))
    except Exception:
        raise unauthorized

    user = await get_database().users.find_one({"_id": object_id})
    if not user:
        raise unauthorized

    return user_to_response(user)


@router.get("/me")
async def current_session(current_user: UserOut = Depends(get_current_user)):
    """Return the current user and calculate admin access from the allowlist."""
    return {
        "user": current_user,
        "is_admin": current_user.email in settings.admin_emails,
    }


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> UserOut:
    """Require a valid JWT issued for the configured hidden administrator."""
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise unauthorized

    current_user = await get_current_user(credentials)
    if current_user.email not in settings.admin_emails:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user
