"""Read-only movie data endpoints backed by The Movie Database (TMDB) API."""

import asyncio
import logging

import httpx
from fastapi import APIRouter, HTTPException, Path, Query, status

from app.core.config import settings


router = APIRouter(tags=["Movies"])
TMDB_BASE_URL = "https://api.themoviedb.org/3"
logger = logging.getLogger(__name__)


async def tmdb_get(path: str, params: dict | None = None) -> dict:
    """Make one TMDB GET request without exposing TMDB's raw errors to clients."""
    if not settings.tmdb_api_key:
        logger.error("TMDB_API_KEY is missing from server configuration")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Movie service is unavailable",
        )

    query_params = {"api_key": settings.tmdb_api_key, **(params or {})}
    url = f"{TMDB_BASE_URL}{path}"

    try:
        # httpx is fully async, so this request does not block FastAPI's event loop.
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                url,
                params=query_params,
                headers={"Accept": "application/json"},
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPStatusError as error:
        # logger.exception includes the complete underlying traceback in server logs.
        # Do not log the full URL because it contains the private TMDB API key.
        logger.exception(
            "TMDB returned HTTP %s for endpoint %s",
            error.response.status_code,
            path,
        )
        if error.response.status_code == 404:
            raise HTTPException(status_code=404, detail="Movie not found") from error
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="TMDB API request failed",
        ) from error
    except (httpx.RequestError, ValueError) as error:
        # This exposes the real network, SSL, or JSON error in the Uvicorn console.
        logger.exception("TMDB connection or response failure for endpoint %s", path)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="TMDB service is currently unavailable",
        ) from error


def movie_summary(movie: dict) -> dict:
    """Select the compact movie fields used on list and search screens."""
    return {
        "id": movie["id"],
        "title": movie.get("title", ""),
        "poster_path": movie.get("poster_path"),
        "backdrop_path": movie.get("backdrop_path"),
        "overview": movie.get("overview", ""),
        "vote_average": movie.get("vote_average", 0),
        "genre_ids": movie.get("genre_ids", []),
        "release_date": movie.get("release_date"),
    }


@router.get("/trending")
async def get_trending_movies():
    """Return a broad, India-aware mix of Hindi and global trending movies.

    TMDB's trending endpoint has no region parameter. Two popular Hindi discover
    pages (restricted to India) are therefore interleaved with two global
    trending pages, then de-duplicated by TMDB ID.
    """
    global_first, global_second, hindi_first, hindi_second = await asyncio.gather(
        tmdb_get("/trending/movie/week", {"page": 1}),
        tmdb_get("/trending/movie/week", {"page": 2}),
        tmdb_get(
            "/discover/movie",
            {
                "with_original_language": "hi",
                "region": "IN",
                "sort_by": "popularity.desc",
                "page": 1,
            },
        ),
        tmdb_get(
            "/discover/movie",
            {
                "with_original_language": "hi",
                "region": "IN",
                "sort_by": "popularity.desc",
                "page": 2,
            },
        ),
    )
    global_movies = global_first.get("results", []) + global_second.get("results", [])
    hindi_movies = hindi_first.get("results", []) + hindi_second.get("results", [])

    mixed_movies = []
    for index in range(max(len(hindi_movies), len(global_movies))):
        # Lead each group with Hindi content while retaining a varied global mix.
        if index < len(hindi_movies):
            mixed_movies.append(hindi_movies[index])
        if index < len(global_movies):
            mixed_movies.append(global_movies[index])

    unique_movies = []
    seen_ids = set()
    for movie in mixed_movies:
        if movie["id"] not in seen_ids:
            seen_ids.add(movie["id"])
            unique_movies.append(movie_summary(movie))

    return unique_movies[:40]


@router.get("/search")
async def search_movies(
    query: str | None = Query(default=None, max_length=100, description="Movie title to search for"),
    genre: int | None = Query(default=None, gt=0, le=100_000, description="TMDB genre ID to filter by"),
):
    """Search by title, or use a genre ID to discover movies in that genre.

    When both parameters are supplied, genre takes priority as requested.
    """
    if genre is not None:
        data = await tmdb_get("/discover/movie", {"with_genres": genre})
    elif query and query.strip():
        data = await tmdb_get("/search/movie", {"query": query.strip()})
    else:
        raise HTTPException(
            status_code=400,
            detail="Provide a movie query or genre ID",
        )

    return [movie_summary(movie) for movie in data.get("results", [])]


@router.get("/genres")
async def get_movie_genres():
    """Return TMDB movie genres for filters and onboarding checkboxes."""
    data = await tmdb_get("/genre/movie/list")
    return [
        {"id": genre["id"], "name": genre["name"]}
        for genre in data.get("genres", [])
    ]


@router.get("/{movie_id}/trailer")
async def get_movie_trailer(movie_id: int = Path(gt=0, le=10_000_000)):
    """Return the first available YouTube trailer key for iframe embedding."""
    data = await tmdb_get(f"/movie/{movie_id}/videos")
    trailer = next(
        (
            video
            for video in data.get("results", [])
            if video.get("type") == "Trailer" and video.get("site") == "YouTube"
        ),
        None,
    )
    return {"key": trailer.get("key") if trailer else None}


@router.get("/{movie_id}")
async def get_movie_details(movie_id: int = Path(gt=0, le=10_000_000)):
    """Return the specific fields needed for the movie details page."""
    movie = await tmdb_get(f"/movie/{movie_id}")
    return {
        "id": movie["id"],
        "title": movie.get("title", ""),
        "genres": [
            {"id": genre["id"], "name": genre["name"]}
            for genre in movie.get("genres", [])
        ],
        "runtime": movie.get("runtime"),
        "release_date": movie.get("release_date"),
        "overview": movie.get("overview", ""),
        "vote_average": movie.get("vote_average", 0),
        "poster_path": movie.get("poster_path"),
        "backdrop_path": movie.get("backdrop_path"),
    }
