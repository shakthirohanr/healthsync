from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserUpdate, UserPasswordUpdate, UserResponse
from app.api.v1.endpoints.auth import get_current_user
from app.core.security import verify_password, get_password_hash

router = APIRouter()


@router.patch("/profile", response_model=UserResponse)
async def update_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user profile"""
    # Check if email is being changed and if it's already in use
    if user_update.email and user_update.email != current_user.email:
        result = await db.execute(select(User).where(User.email == user_update.email))
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already in use"
            )
    
    # Update fields
    if user_update.name is not None:
        current_user.name = user_update.name
    if user_update.email is not None:
        current_user.email = user_update.email
    if user_update.phoneNumber is not None:
        current_user.phoneNumber = user_update.phoneNumber
    if user_update.age is not None:
        current_user.age = user_update.age
    if user_update.gender is not None:
        current_user.gender = user_update.gender
    
    await db.commit()
    await db.refresh(current_user)
    
    return current_user


@router.patch("/password")
async def update_password(
    password_update: UserPasswordUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user password"""
    # Verify current password
    if not current_user.password or not verify_password(
        password_update.currentPassword, current_user.password
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    current_user.password = get_password_hash(password_update.newPassword)
    
    await db.commit()
    
    return {"message": "Password updated successfully"}
