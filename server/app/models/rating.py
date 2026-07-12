"""Pydantic models used by movie rating endpoints."""

from pydantic import BaseModel, Field


class RatingCreate(BaseModel):
    """A score submitted by a user for one TMDB movie."""

    movie_id: int = Field(gt=0, le=10_000_000, description="TMDB movie ID")
    rating: int = Field(ge=1, le=10, description="Rating from 1 to 10")
