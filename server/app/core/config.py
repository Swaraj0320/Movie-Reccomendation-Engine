"""Application configuration loaded from environment variables.

Put local values in ``server/.env``. That file is intentionally ignored by Git,
so API keys and database credentials are never committed.
"""

from __future__ import annotations

import os
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parents[2]  # server/
ENV_FILE = BASE_DIR / ".env"


def load_env_file() -> None:
    """Load simple KEY=value entries from server/.env when they are not set.

    Environment variables already supplied by Render or the terminal always win.
    This small loader keeps the project dependency list minimal.
    """
    if not ENV_FILE.exists():
        return

    for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key, value = key.strip(), value.strip()
        # Allow the common quoted .env format.
        if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
            value = value[1:-1]
        os.environ.setdefault(key, value)


load_env_file()


class Settings:
    """Central settings object used throughout the backend."""

    project_name = "Movie Recommendation API"
    api_prefix = "/api"
    mongodb_url = os.getenv("MONGODB_URL", "")
    mongodb_database = os.getenv("MONGODB_DATABASE", "movie_recommendation")
    tmdb_api_key = os.getenv("TMDB_API_KEY", "")
    # Keep this long, random value private. It signs every user access token.
    secret_key = os.getenv("SECRET_KEY", "")


settings = Settings()
