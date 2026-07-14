"""Protected endpoints for a user's trailer watch history."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Path, status
from pymongo.errors import DuplicateKeyError

from app.db import get_database
from app.models.history import HistoryCreate
from app.models.user import UserOut
from app.routes.auth import get_current_user


router = APIRouter(tags=["Watch history"])


@router.post("/", status_code=status.HTTP_200_OK)
async def log_watched_movie(
    history_data: HistoryCreate,
    current_user: UserOut = Depends(get_current_user),
):
    """Record a trailer opening, keeping one most-recent entry per user/movie."""
    now = datetime.now(timezone.utc)
    history = get_database().watch_history
    history_filter = {"user_id": current_user.id, "movie_id": history_data.movie_id}

    try:
        await history.update_one(
            history_filter,
            {
                "$set": {
                    "movie_title": history_data.movie_title,
                    "poster_path": history_data.poster_path,
                    "watched_at": now,
                },
                "$setOnInsert": history_filter,
            },
            upsert=True,
        )
    except DuplicateKeyError:
        # A simultaneous modal opening can race only on first insert; update safely.
        await history.update_one(
            history_filter,
            {
                "$set": {
                    "movie_title": history_data.movie_title,
                    "poster_path": history_data.poster_path,
                    "watched_at": now,
                }
            },
        )

    return {"message": "Watch history updated", "movie_id": history_data.movie_id, "watched_at": now}


@router.get("/")
async def get_watch_history(current_user: UserOut = Depends(get_current_user)):
    """Return the authenticated user's trailer history, newest first."""
    cursor = (
        get_database()
        .watch_history.find({"user_id": current_user.id}, {"_id": 0, "user_id": 0})
        .sort("watched_at", -1)
    )
    return await cursor.to_list(length=200)


@router.delete("/{movie_id}")
async def remove_history_entry(
    movie_id: int = Path(gt=0, le=10_000_000),
    current_user: UserOut = Depends(get_current_user),
):
    """Remove one movie from the authenticated user's history."""
    result = await get_database().watch_history.delete_one(
        {"user_id": current_user.id, "movie_id": movie_id}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Movie is not in your watch history")
    return {"message": "History entry removed", "movie_id": movie_id}


@router.delete("/")
async def clear_watch_history(current_user: UserOut = Depends(get_current_user)):
    """Remove every watch-history entry for the authenticated user."""
    result = await get_database().watch_history.delete_many({"user_id": current_user.id})
    return {"message": "Watch history cleared", "deleted_count": result.deleted_count}
