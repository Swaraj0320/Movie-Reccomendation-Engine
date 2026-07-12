"""Pydantic models used by watchlist endpoints."""

from pydantic import BaseModel, Field


class WatchlistCreate(BaseModel):
    """A TMDB movie selected for a user's watchlist."""

    movie_id: int = Field(gt=0, description="TMDB movie ID")
