from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class DoctorProfile(Base):
    __tablename__ = "DoctorProfile"
    
    id = Column(String, primary_key=True, index=True)
    userId = Column(String, ForeignKey("User.id"), unique=True, nullable=False)
    specialty = Column(String, nullable=True)
    credentials = Column(String, nullable=True)
    officeAddress = Column(String, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="doctor_profile")
    appointments = relationship("Appointment", back_populates="doctor")
    prescriptions = relationship("Prescription", back_populates="doctor")
