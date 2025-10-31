"""
Database initialization and table creation.
Creates all tables based on SQLAlchemy models if they don't exist.
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.core.config import settings
from app.db.base import Base

# Import all models to ensure they're registered with Base.metadata
import app.db.init_models  # noqa: F401


async def create_database_if_not_exists():
    """
    Create the database if it doesn't exist.
    For SQLite, this is automatic when using file-based database.
    For PostgreSQL, this connects to the 'postgres' default database to create the target database.
    """
    # Parse the database URL to extract connection info
    db_url = settings.DATABASE_URL
    
    # SQLite - database file is created automatically
    if "sqlite" in db_url:
        print("Using SQLite database - file will be created automatically")
        return
    
    # For asyncpg, extract database name from URL
    if "postgresql+asyncpg://" in db_url:
        # Extract the database name from the URL
        parts = db_url.split("/")
        db_name = parts[-1].split("?")[0] if "?" in parts[-1] else parts[-1]
        
        # Create URL to connect to default 'postgres' database
        base_url = "/".join(parts[:-1]) + "/postgres"
        if "?" in db_url:
            base_url += "?" + db_url.split("?")[1]
        
        try:
            # Connect to default postgres database
            engine = create_async_engine(base_url, isolation_level="AUTOCOMMIT")
            
            async with engine.connect() as conn:
                # Check if database exists
                result = await conn.execute(
                    text(f"SELECT 1 FROM pg_database WHERE datname = '{db_name}'")
                )
                exists = result.scalar() is not None
                
                if not exists:
                    print(f"Database '{db_name}' does not exist. Creating...")
                    await conn.execute(text(f'CREATE DATABASE "{db_name}"'))
                    print(f"Database '{db_name}' created successfully!")
                else:
                    print(f"Database '{db_name}' already exists.")
            
            await engine.dispose()
        except Exception as e:
            print(f"Note: Could not create database automatically: {e}")
            print("Please ensure the database exists manually.")


async def init_db():
    """
    Initialize database by creating all tables.
    This is idempotent - it won't recreate tables that already exist.
    """
    from app.db.session import engine
    
    print("Initializing database tables...")
    
    try:
        async with engine.begin() as conn:
            # Create all tables defined in SQLAlchemy models
            await conn.run_sync(Base.metadata.create_all)
        
        print("Database tables initialized successfully!")
        
        # Print all registered tables
        print(f"Registered tables: {', '.join(Base.metadata.tables.keys())}")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        raise


async def check_db_connection():
    """Check if we can connect to the database."""
    from app.db.session import engine
    
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        print("Database connection successful!")
        return True
    except Exception as e:
        print(f"Database connection failed: {e}")
        return False


async def setup_database():
    """
    Complete database setup:
    1. Create database if it doesn't exist
    2. Create tables if they don't exist
    3. Verify connection
    """
    print("=" * 60)
    print("Database Setup")
    print("=" * 60)
    
    # Step 1: Create database if needed
    await create_database_if_not_exists()
    
    # Step 2: Check connection
    connected = await check_db_connection()
    
    if not connected:
        print("Failed to connect to database. Please check your DATABASE_URL.")
        return False
    
    # Step 3: Create tables
    await init_db()
    
    print("=" * 60)
    print("Database setup complete!")
    print("=" * 60)
    
    return True


if __name__ == "__main__":
    """Run this script directly to initialize the database."""
    asyncio.run(setup_database())
