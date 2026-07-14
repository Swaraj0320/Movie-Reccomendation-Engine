"""Hidden administrator-only reporting endpoints."""

import asyncio
from collections import Counter

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import settings
from app.db import get_database
from app.models.user import UserOut
from app.routes.auth import get_current_admin
from app.routes.movies import tmdb_get


router = APIRouter(tags=["Admin"])


async def movie_genres(movie_id: int) -> list[str]:
    """Resolve displayable genre names without making one failed movie hide users."""
    try:
        movie = await tmdb_get(f"/movie/{movie_id}")
    except HTTPException:
        return []
    return [genre.get("name", "") for genre in movie.get("genres", []) if genre.get("name")]


@router.get("/users")
async def get_admin_users(current_user: UserOut = Depends(get_current_admin)):
    """List users with their top genre from ratings, or trailer history when unrated."""
    db = get_database()
    users = await db.users.find({}, {"password": 0}).to_list(length=None)
    user_ids = [str(user["_id"]) for user in users]
    ratings = await db.ratings.find({"user_id": {"$in": user_ids}}, {"_id": 0, "user_id": 1, "movie_id": 1}).to_list(length=None)
    histories = await db.watch_history.find({"user_id": {"$in": user_ids}}, {"_id": 0, "user_id": 1, "movie_id": 1}).to_list(length=None)

    rating_ids: dict[str, list[int]] = {user_id: [] for user_id in user_ids}
    history_ids: dict[str, list[int]] = {user_id: [] for user_id in user_ids}
    for rating in ratings:
        rating_ids.setdefault(rating["user_id"], []).append(rating["movie_id"])
    for history in histories:
        history_ids.setdefault(history["user_id"], []).append(history["movie_id"])

    all_movie_ids = {movie_id for ids in rating_ids.values() for movie_id in ids}
    all_movie_ids.update(movie_id for ids in history_ids.values() for movie_id in ids)
    resolved_genres = await asyncio.gather(*(movie_genres(movie_id) for movie_id in all_movie_ids))
    genres_by_movie = dict(zip(all_movie_ids, resolved_genres))

    response = []
    for user in users:
        user_id = str(user["_id"])
        movie_ids = rating_ids[user_id] or history_ids[user_id]
        genre_counts = Counter(
            genre for movie_id in movie_ids for genre in genres_by_movie.get(movie_id, [])
        )
        response.append({
            "id": user_id,
            "email": user["email"],
            "created_at": user.get("created_at") or user["_id"].generation_time,
            "top_genre": genre_counts.most_common(1)[0][0] if genre_counts else None,
            "profile_picture_url": user.get("profile_picture_url"),
        })
    return response


@router.delete("/users/{user_id}")
async def delete_admin_user(
    user_id: str,
    current_user: UserOut = Depends(get_current_admin),
):
    """Delete a user and all associated ratings, watchlist, and history data."""
    if user_id == settings.admin_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The administrator account cannot be deleted",
        )
    try:
        object_id = ObjectId(user_id)
    except Exception as error:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found") from error

    db = get_database()
    result = await db.users.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    await asyncio.gather(
        db.ratings.delete_many({"user_id": user_id}),
        db.watchlist.delete_many({"user_id": user_id}),
        db.watch_history.delete_many({"user_id": user_id}),
    )
    return {"message": "User deleted", "user_id": user_id}


@router.get("/stats")
async def get_admin_stats(current_user: UserOut = Depends(get_current_admin)):
    """Return lightweight collection totals for the administrator overview."""
    db = get_database()
    total_users, total_ratings, total_watchlist_entries = await asyncio.gather(
        db.users.count_documents({}),
        db.ratings.count_documents({}),
        db.watchlist.count_documents({}),
    )
    return {
        "total_users": total_users,
        "total_ratings": total_ratings,
        "total_watchlist_entries": total_watchlist_entries,
    }
