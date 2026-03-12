from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from .config import settings

# Render provides DATABASE_URL with postgres:// — asyncpg needs postgresql+asyncpg://
db_url = settings.database_url
if "asyncpg" not in db_url:
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

is_production = settings.ENVIRONMENT == "production"

engine = create_async_engine(
    db_url,
    echo=not is_production,
    pool_size=5 if is_production else 10,
    max_overflow=10,
)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
