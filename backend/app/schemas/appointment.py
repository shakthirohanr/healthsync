from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.appointment import AppointmentStatus


class AppointmentBase(BaseModel):
    appointmentDate: datetime
    duration: int = 30
    reasonForVisit: Optional[str] = None
    notes: Optional[str] = None


class AppointmentCreate(AppointmentBase):
    doctorId: str


class AppointmentUpdate(BaseModel):
    appointmentDate: Optional[datetime] = None
    duration: Optional[int] = None
    reasonForVisit: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[AppointmentStatus] = None


class AppointmentResponse(AppointmentBase):
    id: str
    status: AppointmentStatus
    createdAt: datetime
    patientId: str
    doctorId: str
    
    class Config:
        from_attributes = True
