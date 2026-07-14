"""Pydantic models used by watch history endpoints."""

from pydantic import BaseModel, Field


class HistoryCreate(BaseModel):
    """Movie metadata saved when the authenticated user opens a trailer."""

    movie_id: int = Field(gt=0, le=10_000_000, description="TMDB movie ID")
    movie_title: str = Field(min_length=1, max_length=500)
    poster_path: str | None = Field(default=None, max_length=500)
