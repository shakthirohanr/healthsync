from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime
import uuid

from app.db.session import get_db
from app.models.user import User
from app.models.appointment import Appointment
from app.models.patient_profile import PatientProfile
from app.models.doctor_profile import DoctorProfile
from app.schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentResponse
from app.api.v1.endpoints.auth import get_current_user
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class DoctorAppointmentCreate(BaseModel):
    """Schema for doctors to create appointments for patients"""
    patientId: str
    appointmentDate: datetime
    duration: int = 30
    reasonForVisit: Optional[str] = None
    notes: Optional[str] = None


@router.get("/", response_model=List[AppointmentResponse])
async def get_appointments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all appointments for current user"""
    if current_user.role.value == "PATIENT":
        # Get patient profile
        result = await db.execute(
            select(PatientProfile).where(PatientProfile.userId == current_user.id)
        )
        patient = result.scalar_one_or_none()
        if not patient:
            raise HTTPException(status_code=404, detail="Patient profile not found")
        
        # Get appointments for this patient
        result = await db.execute(
            select(Appointment)
            .options(
                selectinload(Appointment.doctor).selectinload(DoctorProfile.user)
            )
            .where(Appointment.patientId == patient.id)
        )
    else:  # DOCTOR
        # Get doctor profile
        result = await db.execute(
            select(DoctorProfile).where(DoctorProfile.userId == current_user.id)
        )
        doctor = result.scalar_one_or_none()
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor profile not found")
        
        # Get appointments for this doctor
        result = await db.execute(
            select(Appointment)
            .options(
                selectinload(Appointment.patient).selectinload(PatientProfile.user)
            )
            .where(Appointment.doctorId == doctor.id)
        )
    
    appointments = result.scalars().all()
    return appointments


@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment(
    appointment_in: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new appointment (for patients)"""
    # Get patient profile
    result = await db.execute(
        select(PatientProfile).where(PatientProfile.userId == current_user.id)
    )
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    appointment = Appointment(
        id=str(uuid.uuid4()),
        patientId=patient.id,
        doctorId=appointment_in.doctorId,
        appointmentDate=appointment_in.appointmentDate,
        duration=appointment_in.duration,
        reasonForVisit=appointment_in.reasonForVisit,
        notes=appointment_in.notes
    )
    
    db.add(appointment)
    await db.commit()
    await db.refresh(appointment)
    
    return appointment


@router.post("/doctor/create", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
async def create_appointment_for_patient(
    appointment_in: DoctorAppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new appointment for a patient (doctors only)"""
    # Check if user is a doctor
    if current_user.role != "DOCTOR":
        raise HTTPException(status_code=403, detail="Only doctors can create appointments for patients")
    
    # Get doctor profile
    result = await db.execute(
        select(DoctorProfile).where(DoctorProfile.userId == current_user.id)
    )
    doctor = result.scalar_one_or_none()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    
    # Verify patient exists
    result = await db.execute(
        select(PatientProfile).where(PatientProfile.id == appointment_in.patientId)
    )
    patient = result.scalar_one_or_none()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    appointment = Appointment(
        id=str(uuid.uuid4()),
        patientId=appointment_in.patientId,
        doctorId=doctor.id,
        appointmentDate=appointment_in.appointmentDate,
        duration=appointment_in.duration,
        reasonForVisit=appointment_in.reasonForVisit,
        notes=appointment_in.notes
    )
    
    db.add(appointment)
    await db.commit()
    await db.refresh(appointment)
    
    return appointment


@router.patch("/{appointment_id}", response_model=AppointmentResponse)
async def update_appointment(
    appointment_id: str,
    appointment_update: AppointmentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update an appointment"""
    result = await db.execute(
        select(Appointment).where(Appointment.id == appointment_id)
    )
    appointment = result.scalar_one_or_none()
    
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    # Check authorization
    if current_user.role.value == "PATIENT":
        # Get patient profile
        result = await db.execute(
            select(PatientProfile).where(PatientProfile.userId == current_user.id)
        )
        patient = result.scalar_one_or_none()
        if not patient or appointment.patientId != patient.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this appointment"
            )
    
    # Update fields
    update_data = appointment_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(appointment, field, value)
    
    await db.commit()
    await db.refresh(appointment)
    
    return appointment
