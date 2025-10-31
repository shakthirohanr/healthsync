from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.session import get_db
from app.models.user import User, UserRole
from app.schemas.user import UserResponse

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
async def get_doctors(
    db: AsyncSession = Depends(get_db)
):
    """Get all doctors"""
    result = await db.execute(
        select(User).where(User.role == UserRole.DOCTOR)
    )
    doctors = result.scalars().all()
    return doctors
