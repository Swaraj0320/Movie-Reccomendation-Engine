"""Small in-memory limiter for sensitive authentication endpoints.

For a multi-instance production deployment this should be replaced with a
shared Redis-backed limiter. It is intentionally dependency-free for this
single-service academic project.
"""

from collections import defaultdict, deque
from time import monotonic

from fastapi import HTTPException, Request, status


_attempts: dict[str, deque[float]] = defaultdict(deque)


def enforce_rate_limit(
    request: Request,
    scope: str,
    max_attempts: int,
    window_seconds: int,
) -> None:
    """Limit requests by client IP and endpoint scope within a rolling window."""
    client_ip = request.client.host if request.client else "unknown"
    key = f"{scope}:{client_ip}"
    now = monotonic()
    attempts = _attempts[key]

    while attempts and now - attempts[0] >= window_seconds:
        attempts.popleft()

    if len(attempts) >= max_attempts:
        retry_after = max(1, int(window_seconds - (now - attempts[0])))
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many attempts. Please try again later.",
            headers={"Retry-After": str(retry_after)},
        )

    attempts.append(now)
