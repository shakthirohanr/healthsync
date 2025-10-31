from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class PatientProfile(Base):
    __tablename__ = "PatientProfile"
    
    id = Column(String, primary_key=True, index=True)
    userId = Column(String, ForeignKey("User.id"), unique=True, nullable=False)
    dateOfBirth = Column(DateTime, nullable=True)
    address = Column(String, nullable=True)
    emergencyContactName = Column(String, nullable=True)
    emergencyContactPhone = Column(String, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="patient_profile")
    appointments = relationship("Appointment", back_populates="patient")
    prescriptions = relationship("Prescription", back_populates="patient")
