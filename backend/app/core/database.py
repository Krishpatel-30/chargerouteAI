from pathlib import Path
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# Configure database URL: ensure relative SQLite databases consistently resolve to backend/voltplan.db
database_url = settings.DATABASE_URL
if database_url.startswith("sqlite+aiosqlite:///./"):
    backend_dir = Path(__file__).resolve().parent.parent.parent
    db_filename = database_url.replace("sqlite+aiosqlite:///./", "")
    abs_db_path = (backend_dir / db_filename).resolve()
    database_url = f"sqlite+aiosqlite:///{abs_db_path.as_posix()}"

# Configure engine arguments
engine_kwargs = {"echo": False}
if "sqlite" in database_url:
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_async_engine(database_url, **engine_kwargs)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)

Base = declarative_base()


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
