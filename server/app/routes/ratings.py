"""Protected endpoints for creating and reading user movie ratings."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Path, status
from pymongo.errors import DuplicateKeyError

from app.db import get_database
from app.models.rating import RatingCreate
from app.models.user import UserOut
from app.routes.auth import get_current_user


router = APIRouter(tags=["Ratings"])


@router.post("/", status_code=status.HTTP_200_OK)
async def save_rating(
    rating_data: RatingCreate,
    current_user: UserOut = Depends(get_current_user),
):
    """Create or update the current user's rating for one movie.

    ``upsert=True`` means MongoDB inserts a document when no matching user/movie
    rating exists, otherwise it updates the existing document instead of adding a
    duplicate.
    """
    now = datetime.now(timezone.utc)
    ratings = get_database().ratings
    rating_filter = {
        "user_id": current_user.id,
        "movie_id": rating_data.movie_id,
    }

    try:
        await ratings.update_one(
            rating_filter,
            {
                "$set": {"rating": rating_data.rating, "timestamp": now},
                "$setOnInsert": rating_filter,
            },
            upsert=True,
        )
    except DuplicateKeyError:
        # The compound unique index can only race when two first ratings arrive
        # simultaneously. The second request safely becomes an update.
        await ratings.update_one(
            rating_filter,
            {"$set": {"rating": rating_data.rating, "timestamp": now}},
        )

    return {
        "message": "Rating saved",
        "movie_id": rating_data.movie_id,
        "rating": rating_data.rating,
        "timestamp": now,
    }


@router.get("/user/all")
async def get_user_ratings(
    current_user: UserOut = Depends(get_current_user),
):
    """Return all ratings made by the authenticated user, newest first."""
    cursor = (
        get_database()
        .ratings.find({"user_id": current_user.id}, {"_id": 0})
        .sort("timestamp", -1)
    )
    return await cursor.to_list(length=200)


@router.get("/{movie_id}")
async def get_movie_rating(
    movie_id: int = Path(gt=0, le=10_000_000),
    current_user: UserOut = Depends(get_current_user),
):
    """Return this user's score and the all-user average for a movie."""
    ratings = get_database().ratings
    user_rating = await ratings.find_one(
        {"user_id": current_user.id, "movie_id": movie_id},
        {"_id": 0, "rating": 1},
    )

    # Aggregation calculates the average across every user's rating for this movie.
    average_rows = await ratings.aggregate(
        [
            {"$match": {"movie_id": movie_id}},
            {"$group": {"_id": None, "average_rating": {"$avg": "$rating"}}},
        ]
    ).to_list(length=1)
    average_rating = average_rows[0]["average_rating"] if average_rows else None

    return {
        "movie_id": movie_id,
        "user_rating": user_rating["rating"] if user_rating else None,
        "average_rating": round(average_rating, 1) if average_rating is not None else None,
    }
