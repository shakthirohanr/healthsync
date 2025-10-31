from sqlalchemy import Column, String, DateTime, Integer, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base


class Prescription(Base):
    __tablename__ = "Prescription"
    
    id = Column(String, primary_key=True, index=True)
    medication = Column(String, nullable=False)
    dosage = Column(String, nullable=False)
    frequency = Column(String, nullable=False)
    startDate = Column(DateTime, nullable=False)
    endDate = Column(DateTime, nullable=True)
    refillsAvailable = Column(Integer, default=0, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    patientId = Column(String, ForeignKey("PatientProfile.id"), nullable=False)
    doctorId = Column(String, ForeignKey("DoctorProfile.id"), nullable=False)
    
    # Relationships
    patient = relationship("PatientProfile", back_populates="prescriptions")
    doctor = relationship("DoctorProfile", back_populates="prescriptions")
