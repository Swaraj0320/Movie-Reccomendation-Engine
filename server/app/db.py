"""MongoDB Atlas connection helpers."""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings


client: AsyncIOMotorClient | None = None
database: AsyncIOMotorDatabase | None = None


async def connect_to_mongo() -> None:
    """Create one shared Motor client and verify the Atlas connection."""
    global client, database

    if not settings.mongodb_url:
        raise RuntimeError(
            "MONGODB_URL is missing. Add it to server/.env before starting the API."
        )

    client = AsyncIOMotorClient(settings.mongodb_url)
    database = client[settings.mongodb_database]

    # A ping makes connection errors visible during startup, not on the first request.
    await client.admin.command("ping")
    # These constraints make concurrent writes safe as well as application-level checks.
    await database.users.create_index("email", unique=True)
    await database.ratings.create_index([("user_id", 1), ("movie_id", 1)], unique=True)
    await database.watchlist.create_index([("user_id", 1), ("movie_id", 1)], unique=True)


async def close_mongo_connection() -> None:
    """Close MongoDB cleanly when FastAPI shuts down."""
    global client, database

    if client is not None:
        client.close()
    client = None
    database = None


def get_database() -> AsyncIOMotorDatabase:
    """Return the current database after the application has started."""
    if database is None:
        raise RuntimeError("MongoDB is not connected.")
    return database
