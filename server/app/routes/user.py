"""Authenticated user profile endpoints."""

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.db import get_database
from app.models.user import UserOut, UserProfileUpdate
from app.routes.auth import get_current_user, user_to_response


router = APIRouter(tags=["User"])


@router.patch("/profile")
async def update_profile(
    profile: UserProfileUpdate,
    current_user: UserOut = Depends(get_current_user),
):
    """Update the current user's editable profile fields."""
    updates = profile.model_dump(exclude_unset=True)
    if "name" in updates:
        updates["name"] = updates["name"].strip()
        if not updates["name"]:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Name cannot be blank",
            )
    if "phone" in updates and updates["phone"] is not None:
        updates["phone"] = updates["phone"].strip() or None
    if "profile_picture_url" in updates and updates["profile_picture_url"] is not None:
        updates["profile_picture_url"] = updates["profile_picture_url"].strip() or None

    if updates:
        await get_database().users.update_one(
            {"_id": ObjectId(current_user.id)}, {"$set": updates}
        )

    user = await get_database().users.find_one({"_id": ObjectId(current_user.id)})
    return user_to_response(user)
