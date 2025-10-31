from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    role: UserRole = UserRole.PATIENT
    phoneNumber: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phoneNumber: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None


class UserPasswordUpdate(BaseModel):
    currentPassword: str
    newPassword: str


class UserInDB(UserBase):
    id: str
    emailVerified: Optional[datetime] = None
    image: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime
    
    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: str
    name: Optional[str]
    email: str
    role: UserRole
    image: Optional[str] = None
    phoneNumber: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    
    class Config:
        from_attributes = True
