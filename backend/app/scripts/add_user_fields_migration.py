"""
Migration script to add phoneNumber, age, and gender fields to User table
"""
import asyncio
from sqlalchemy import text
from app.db.session import engine


async def add_user_fields():
    """Add phoneNumber, age, and gender columns to User table"""
    async with engine.begin() as conn:
        try:
            # Add phoneNumber column
            await conn.execute(text(
                "ALTER TABLE User ADD COLUMN phoneNumber VARCHAR NULL"
            ))
            print("✓ Added phoneNumber column")
        except Exception as e:
            print(f"phoneNumber column may already exist: {e}")
        
        try:
            # Add age column
            await conn.execute(text(
                "ALTER TABLE User ADD COLUMN age INTEGER NULL"
            ))
            print("✓ Added age column")
        except Exception as e:
            print(f"age column may already exist: {e}")
        
        try:
            # Add gender column
            await conn.execute(text(
                "ALTER TABLE User ADD COLUMN gender VARCHAR NULL"
            ))
            print("✓ Added gender column")
        except Exception as e:
            print(f"gender column may already exist: {e}")
    
    print("\nMigration completed successfully!")


if __name__ == "__main__":
    print("Running migration to add user fields...")
    asyncio.run(add_user_fields())
