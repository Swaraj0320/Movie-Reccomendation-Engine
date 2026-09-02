"""Pydantic models used by movie rating endpoints."""

from pydantic import BaseModel, Field, field_validator


class RatingCreate(BaseModel):
    """A score submitted by a user for one TMDB movie."""

    movie_id: int = Field(gt=0, le=10_000_000, description="TMDB movie ID")
    rating: int = Field(ge=1, le=10, description="Rating from 1 to 10")

    @field_validator("rating", mode="before")
    @classmethod
    def validate_rating_type_and_value(cls, value):
        """Ensure rating is an integer (not float/decimal) and within valid range."""
        # Reject None
        if value is None:
            raise ValueError("Rating is required")
        
        # Reject any float type (including 5.0)
        if isinstance(value, float):
            raise ValueError("Rating must be a whole number (integer) between 1 and 10")
        
        # If it's a string, try to convert but reject if it contains decimal point
        if isinstance(value, str):
            if "." in value or "," in value:
                raise ValueError("Rating must be a whole number between 1 and 10")
            try:
                value = int(value)
            except (ValueError, TypeError):
                raise ValueError("Rating must be a valid integer between 1 and 10")
        
        # Ensure it's an int at this point
        if not isinstance(value, int):
            raise ValueError("Rating must be a valid integer between 1 and 10")
        
        # Range check (though Pydantic will also check with ge=1, le=10)
        if value < 1 or value > 10:
            raise ValueError("Rating must be between 1 and 10")
        
        return value
