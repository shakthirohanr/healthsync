from sqlalchemy import Column, String, DateTime, Enum as SQLEnum, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.base import Base


class UserRole(str, enum.Enum):
    PATIENT = "PATIENT"
    DOCTOR = "DOCTOR"


class User(Base):
    __tablename__ = "User"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    emailVerified = Column(DateTime, nullable=True)
    image = Column(String, nullable=True)
    password = Column(String, nullable=True)
    role = Column(SQLEnum(UserRole, name='UserRole'), default=UserRole.PATIENT, nullable=False)
    phoneNumber = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    patient_profile = relationship("PatientProfile", back_populates="user", uselist=False)
    doctor_profile = relationship("DoctorProfile", back_populates="user", uselist=False)
