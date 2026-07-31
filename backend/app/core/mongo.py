from datetime import datetime, timezone
from typing import Any

from pymongo import MongoClient
from pymongo.errors import PyMongoError

from app.core.settings import settings


class MongoService:
    def __init__(self) -> None:
        self.client = MongoClient(settings.mongo_uri, serverSelectionTimeoutMS=2000)
        self.database = self.client[settings.mongo_database]
        self.last_successful_connection: datetime | None = None
        self.last_failed_connection: datetime | None = None
        self.last_error: str | None = None

    def ping(self) -> tuple[bool, str]:
        try:
            self.client.admin.command("ping")
            self.last_successful_connection = datetime.now(timezone.utc)
            self.last_error = None
            return True, "ok"
        except PyMongoError as exc:
            self.last_failed_connection = datetime.now(timezone.utc)
            self.last_error = str(exc)
            return False, str(exc)

    def info(self) -> dict[str, Any]:
        healthy, message = self.ping()
        server_info = self.client.server_info() if healthy else {}
        build_info = server_info if isinstance(server_info, dict) else {}
        return {
            "database": settings.mongo_database,
            "uri": settings.mongo_uri,
            "healthy": healthy,
            "message": message,
            "version": build_info.get("version"),
            "host": self.client.address[0] if self.client.address else None,
            "last_successful_connection": self.last_successful_connection.isoformat() if self.last_successful_connection else None,
            "last_failed_connection": self.last_failed_connection.isoformat() if self.last_failed_connection else None,
            "current_error": self.last_error,
        }

    def stats(self) -> dict[str, Any]:
        return self.database.command("dbstats")


mongo_service = MongoService()

