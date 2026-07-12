"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db import close_mongo_connection, connect_to_mongo


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Open shared resources at startup and release them at shutdown."""
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(title=settings.project_name, lifespan=lifespan)

# Vite normally runs on port 5173. Add the deployed Vercel URL here later.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
async def root():
    """Small endpoint to confirm that the API is running."""
    return {"message": "Movie Recommendation API is running"}


@app.get("/health", tags=["Health"])
async def health_check():
    """Health endpoint for local checks and future Render deployment."""
    return {"status": "ok", "database": settings.mongodb_database}
