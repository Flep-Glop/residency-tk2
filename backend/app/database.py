from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

_raw_url = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./toolkit.db")

# Railway provides postgres:// but SQLAlchemy needs postgresql+asyncpg://
if _raw_url.startswith("postgres://"):
    DATABASE_URL = _raw_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif _raw_url.startswith("postgresql://"):
    DATABASE_URL = _raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)
else:
    DATABASE_URL = _raw_url

_is_sqlite = DATABASE_URL.startswith("sqlite")

engine_kwargs = {"future": True}
if not _is_sqlite:
    engine_kwargs.update({"pool_size": 5, "max_overflow": 10, "pool_pre_ping": True})

engine = create_async_engine(DATABASE_URL, **engine_kwargs)

Base = declarative_base()

AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_session():
    async with AsyncSessionLocal() as session:
        yield session
