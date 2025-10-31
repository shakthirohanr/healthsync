from sqlalchemy import Column, String, DateTime, Integer, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.base import Base


class AppointmentStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    COMPLETED = "COMPLETED"
    CANCELED = "CANCELED"  # Fixed: was CANCELLED, should be CANCELED to match Prisma
    PENDING = "PENDING"


class Appointment(Base):
    __tablename__ = "Appointment"
    
    id = Column(String, primary_key=True, index=True)
    appointmentDate = Column(DateTime, nullable=False)
    duration = Column(Integer, default=30, nullable=False)
    reasonForVisit = Column(String, nullable=False)
    notes = Column(String, nullable=True)
    status = Column(SQLEnum(AppointmentStatus, name='AppointmentStatus'), default=AppointmentStatus.PENDING, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    patientId = Column(String, ForeignKey("PatientProfile.id"), nullable=False)
    doctorId = Column(String, ForeignKey("DoctorProfile.id"), nullable=False)
    
    # Relationships
    patient = relationship("PatientProfile", back_populates="appointments")
    doctor = relationship("DoctorProfile", back_populates="appointments")
