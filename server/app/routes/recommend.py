"""Simple filter-based movie recommendations powered by TMDB Discover."""

from fastapi import APIRouter, HTTPException, Query

from app.routes.movies import tmdb_get


router = APIRouter(tags=["Recommendations"])

# These common options are enough for the first version of the filter UI.
COMMON_LANGUAGES = [
    {"code": "hi", "name": "Hindi"},
    {"code": "en", "name": "English"},
    {"code": "ta", "name": "Tamil"},
    {"code": "te", "name": "Telugu"},
    {"code": "ko", "name": "Korean"},
    {"code": "ja", "name": "Japanese"},
    {"code": "es", "name": "Spanish"},
]


def recommendation_movie(movie: dict) -> dict:
    """Keep only the movie fields used by a recommendation card."""
    return {
        "id": movie["id"],
        "title": movie.get("title", ""),
        "poster_path": movie.get("poster_path"),
        "overview": movie.get("overview", ""),
        "vote_average": movie.get("vote_average", 0),
        "release_date": movie.get("release_date"),
        "original_language": movie.get("original_language"),
        "genre_ids": movie.get("genre_ids", []),
    }


def clean_genres(genres: str | None) -> str | None:
    """Validate and normalize a comma-separated list of TMDB genre IDs."""
    if not genres or not genres.strip():
        return None

    genre_ids = [genre_id.strip() for genre_id in genres.split(",")]
    if not all(genre_id.isdigit() and int(genre_id) > 0 for genre_id in genre_ids):
        raise HTTPException(
            status_code=422,
            detail="genres must be comma-separated positive TMDB genre IDs",
        )
    return ",".join(genre_ids)


@router.get("/languages")
async def get_recommendation_languages():
    """Return language choices for the recommendation filter UI."""
    return COMMON_LANGUAGES


@router.get("")
async def get_recommendations(
    genres: str | None = Query(
        default=None,
        description="Comma-separated TMDB genre IDs, for example: 28,18,53",
    ),
    language: str | None = Query(
        default=None,
        min_length=2,
        max_length=2,
        description="ISO 639-1 language code, for example: hi or en",
    ),
    year: int | None = Query(default=None, ge=1888, description="Release year"),
):
    """Return popular TMDB movies matching the selected preferences.

    For the viva: the user picks genre, language, and/or year. We send those
    filters to TMDB Discover, sorted by popularity, so popular matching movies
    appear first. No machine-learning model is required for this version.
    """
    genre_filter = clean_genres(genres)
    language_filter = language.strip().lower() if language else None

    # Without a selected preference, the useful fallback is the usual weekly trend list.
    if not any([genre_filter, language_filter, year]):
        data = await tmdb_get("/trending/movie/week")
    else:
        discover_params = {"sort_by": "popularity.desc", "include_adult": "false"}
        if genre_filter:
            discover_params["with_genres"] = genre_filter
        if language_filter:
            discover_params["with_original_language"] = language_filter
        if year:
            discover_params["primary_release_year"] = year
        data = await tmdb_get("/discover/movie", discover_params)

    return [recommendation_movie(movie) for movie in data.get("results", [])]
