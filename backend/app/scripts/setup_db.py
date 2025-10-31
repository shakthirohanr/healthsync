#!/usr/bin/env python3
"""
Database setup script for HealthSync.

This script can be run independently to:
1. Create the database if it doesn't exist
2. Create all tables based on SQLAlchemy models
3. Verify database connection

Usage:
    python -m app.scripts.setup_db
    or
    python app/scripts/setup_db.py
"""

import sys
import asyncio
from pathlib import Path

# Add parent directory to path to allow imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.db.init_db import setup_database


async def main():
    """Main function to run database setup."""
    print("\n🏥 HealthSync Database Setup Tool\n")
    
    success = await setup_database()
    
    if success:
        print("\n✅ Database setup completed successfully!")
        print("\nYou can now:")
        print("  1. Start the FastAPI server: uvicorn main:app --reload")
        print("  2. Run migrations (if using Alembic)")
        print("  3. Seed the database with initial data")
        return 0
    else:
        print("\n❌ Database setup failed!")
        print("\nPlease check:")
        print("  1. PostgreSQL is running")
        print("  2. DATABASE_URL in .env is correct")
        print("  3. Database user has sufficient permissions")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
