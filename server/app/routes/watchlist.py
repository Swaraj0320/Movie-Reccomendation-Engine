"""Protected endpoints for a user's saved watchlist movies."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Path, status
from pymongo.errors import DuplicateKeyError

from app.db import get_database
from app.models.user import UserOut
from app.models.watchlist import WatchlistCreate
from app.routes.auth import get_current_user
from app.routes.movies import tmdb_get


router = APIRouter(tags=["Watchlist"])


def watchlist_movie(movie: dict) -> dict:
    """Keep the card fields needed to render a saved movie without later TMDB calls."""
    return {
        "id": movie["id"],
        "title": movie.get("title", ""),
        "poster_path": movie.get("poster_path"),
        "overview": movie.get("overview", ""),
        "vote_average": movie.get("vote_average", 0),
        "release_date": movie.get("release_date"),
    }


@router.post("/", status_code=status.HTTP_201_CREATED)
async def add_to_watchlist(
    item: WatchlistCreate,
    current_user: UserOut = Depends(get_current_user),
):
    """Save a movie once per user, including basic TMDB data for the watchlist grid."""
    watchlist = get_database().watchlist
    existing = await watchlist.find_one({"user_id": current_user.id, "movie_id": item.movie_id})
    if existing:
        return {"message": "Movie is already in watchlist", "movie": watchlist_movie(existing)}

    movie = await tmdb_get(f"/movie/{item.movie_id}")
    saved_movie = watchlist_movie(movie)
    document = {
        "user_id": current_user.id,
        "movie_id": item.movie_id,
        **saved_movie,
        "created_at": datetime.now(timezone.utc),
    }
    try:
        await watchlist.insert_one(document)
    except DuplicateKeyError:
        # A concurrent request may have saved the same movie after the first check.
        existing = await watchlist.find_one(
            {"user_id": current_user.id, "movie_id": item.movie_id}
        )
        return {"message": "Movie is already in watchlist", "movie": watchlist_movie(existing)}
    return {"message": "Movie added to watchlist", "movie": saved_movie}


@router.get("/")
async def get_watchlist(current_user: UserOut = Depends(get_current_user)):
    """Return the authenticated user's saved movie cards, newest first."""
    cursor = get_database().watchlist.find({"user_id": current_user.id}, {"_id": 0, "user_id": 0}).sort("created_at", -1)
    return await cursor.to_list(length=200)


@router.delete("/{movie_id}")
async def remove_from_watchlist(
    movie_id: int = Path(gt=0, le=10_000_000),
    current_user: UserOut = Depends(get_current_user),
):
    """Remove one movie from the authenticated user's watchlist."""
    result = await get_database().watchlist.delete_one({"user_id": current_user.id, "movie_id": movie_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Movie is not in your watchlist")
    return {"message": "Movie removed from watchlist", "movie_id": movie_id}
