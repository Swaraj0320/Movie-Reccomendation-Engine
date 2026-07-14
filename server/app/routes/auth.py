"""Registration, login, and current-user authentication dependency."""

from datetime import datetime, timezone

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
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
from app.models.user import UserCreate, UserLogin, UserOut


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

    token = create_access_token({"sub": str(result.inserted_id)})
    return {"access_token": token, "token_type": "bearer", "user": user_to_response(user_document)}


@router.post("/login")
async def login(credentials: UserLogin, request: Request):
    """Verify credentials and return a fresh JWT when they are correct."""
    enforce_rate_limit(request, "login", max_attempts=10, window_seconds=900)
    email = credentials.email.strip().lower()

    # The administrator is configured outside MongoDB and intentionally has no
    # user document. Check it before normal database authentication.
    if (
        settings.admin_email
        and settings.admin_password
        and email == settings.admin_email
        and credentials.password == settings.admin_password
    ):
        admin_user = {
            "_id": "admin",
            "name": "Administrator",
            "email": settings.admin_email,
            "preferences": [],
        }
        token = create_access_token({"sub": "admin", "is_admin": True})
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": user_to_response(admin_user),
            "is_admin": True,
        }

    db = get_database()
    user = await db.users.find_one({"email": email})

    # Use the same message for a missing account and an incorrect password.
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": str(user["_id"]), "is_admin": False})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_to_response(user),
        "is_admin": False,
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
    user_id = payload.get("sub") if payload else None
    if not user_id:
        raise unauthorized

    try:
        object_id = ObjectId(user_id)
    except Exception:
        raise unauthorized

    user = await get_database().users.find_one({"_id": object_id})
    if not user:
        raise unauthorized

    return user_to_response(user)


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

    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise unauthorized
    if payload.get("is_admin") is not True or payload.get("sub") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return UserOut(id="admin", name="Administrator", email=settings.admin_email)
