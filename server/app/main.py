"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.security import validate_security_settings
from app.db import close_mongo_connection, connect_to_mongo
from app.routes.auth import router as auth_router
from app.routes.movies import router as movies_router
from app.routes.recommend import router as recommend_router
from app.routes.ratings import router as ratings_router
from app.routes.user import router as user_router
from app.routes.watchlist import router as watchlist_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Open shared resources at startup and release them at shutdown."""
    validate_security_settings()
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(title=settings.project_name, lifespan=lifespan)

# Development defaults are local-only; production requires FRONTEND_ORIGINS.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# All authentication endpoints are grouped under /api/auth.
app.include_router(auth_router, prefix=f"{settings.api_prefix}/auth")
# Movie browsing data is public, so these endpoints do not require a JWT.
app.include_router(movies_router, prefix=f"{settings.api_prefix}/movies")
# Filter-based recommendations are public movie-discovery data.
app.include_router(recommend_router, prefix=f"{settings.api_prefix}/recommend")
# Rating endpoints use get_current_user, so every request requires a Bearer JWT.
app.include_router(ratings_router, prefix=f"{settings.api_prefix}/ratings")
# User profile and saved watchlist endpoints are protected by their own routers.
app.include_router(user_router, prefix=f"{settings.api_prefix}/user")
app.include_router(watchlist_router, prefix=f"{settings.api_prefix}/watchlist")


@app.get("/", tags=["Health"])
async def root():
    """Small endpoint to confirm that the API is running."""
    return {"message": "Movie Recommendation API is running"}


@app.get("/health", tags=["Health"])
async def health_check():
    """Health endpoint for local checks and future Render deployment."""
    return {"status": "ok", "database": settings.mongodb_database}
