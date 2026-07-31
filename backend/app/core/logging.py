import logging
import time
from collections import deque
from datetime import datetime, timezone
from typing import Callable

from fastapi import Request, Response


logger = logging.getLogger("infra_learning")
recent_logs: deque[dict] = deque(maxlen=200)


def configure_logging(level: str) -> None:
    logging.basicConfig(
        level=getattr(logging, level.upper(), logging.INFO),
        format="%(message)s",
    )


async def request_logging_middleware(request: Request, call_next: Callable[[Request], Response]) -> Response:
    start = time.perf_counter()
    response: Response | None = None
    error_message = None
    mongo_status = "not-attempted"
    try:
        response = await call_next(request)
        if hasattr(request.state, "mongo_status"):
            mongo_status = request.state.mongo_status
        return response
    except Exception as exc:  # noqa: BLE001
        error_message = str(exc)
        raise
    finally:
        duration_ms = round((time.perf_counter() - start) * 1000, 2)
        status_code = response.status_code if response else 500
        logger.info(
            {
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S%z"),
                "method": request.method,
                "path": request.url.path,
                "duration_ms": duration_ms,
                "success": status_code < 400,
                "status_code": status_code,
                "mongo_response": mongo_status,
                "error": error_message,
            }
        )
        recent_logs.appendleft(
            {
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "method": request.method,
                "path": request.url.path,
                "duration_ms": duration_ms,
                "success": status_code < 400,
                "status_code": status_code,
                "mongo_response": mongo_status,
                "error": error_message,
            }
        )
