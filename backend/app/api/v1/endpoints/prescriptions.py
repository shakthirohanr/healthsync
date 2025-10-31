from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User
from app.models.prescription import Prescription
from app.models.doctor_profile import DoctorProfile
from app.models.patient_profile import PatientProfile
from app.models.appointment import Appointment
from datetime import datetime
from pydantic import BaseModel
from typing import Optional
import uuid

router = APIRouter()


class PrescriptionCreate(BaseModel):
    appointmentId: str
    patientId: str
    medication: str
    dosage: str
    frequency: str
    startDate: datetime
    endDate: Optional[datetime] = None
    refillsAvailable: int = 0
    notes: Optional[str] = None


@router.post("/")
async def create_prescription(
    prescription_data: PrescriptionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new prescription (doctors only)"""
    
    # Check if user is a doctor
    if current_user.role != "DOCTOR":
        raise HTTPException(status_code=403, detail="Only doctors can create prescriptions")
    
    # Get doctor profile
    result = await db.execute(
        select(DoctorProfile).where(DoctorProfile.userId == current_user.id)
    )
    doctor = result.scalar_one_or_none()
    
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    
    # Verify the appointment exists and belongs to this doctor
    result = await db.execute(
        select(Appointment).where(
            Appointment.id == prescription_data.appointmentId,
            Appointment.doctorId == doctor.id
        )
    )
    appointment = result.scalar_one_or_none()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found or you don't have access")
    
    # Verify patient exists
    result = await db.execute(
        select(PatientProfile).where(PatientProfile.id == prescription_data.patientId)
    )
    patient = result.scalar_one_or_none()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Create prescription
    new_prescription = Prescription(
        id=str(uuid.uuid4()),
        medication=prescription_data.medication,
        dosage=prescription_data.dosage,
        frequency=prescription_data.frequency,
        startDate=prescription_data.startDate,
        endDate=prescription_data.endDate,
        refillsAvailable=prescription_data.refillsAvailable,
        patientId=prescription_data.patientId,
        doctorId=doctor.id,
        createdAt=datetime.utcnow()
    )
    
    db.add(new_prescription)
    
    # Update appointment notes if provided
    if prescription_data.notes:
        appointment.notes = prescription_data.notes
    
    await db.commit()
    await db.refresh(new_prescription)
    
    return {
        "id": new_prescription.id,
        "medication": new_prescription.medication,
        "dosage": new_prescription.dosage,
        "frequency": new_prescription.frequency,
        "startDate": new_prescription.startDate.isoformat(),
        "endDate": new_prescription.endDate.isoformat() if new_prescription.endDate else None,
        "refillsAvailable": new_prescription.refillsAvailable,
        "createdAt": new_prescription.createdAt.isoformat()
    }


@router.get("/appointment/{appointment_id}")
async def get_appointment_prescriptions(
    appointment_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all prescriptions for an appointment"""
    
    # Get the appointment
    result = await db.execute(
        select(Appointment).where(Appointment.id == appointment_id)
    )
    appointment = result.scalar_one_or_none()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Check access - either the doctor or the patient
    if current_user.role == "DOCTOR":
        result = await db.execute(
            select(DoctorProfile).where(DoctorProfile.userId == current_user.id)
        )
        doctor = result.scalar_one_or_none()
        if not doctor or appointment.doctorId != doctor.id:
            raise HTTPException(status_code=403, detail="Access denied")
    else:
        result = await db.execute(
            select(PatientProfile).where(PatientProfile.userId == current_user.id)
        )
        patient = result.scalar_one_or_none()
        if not patient or appointment.patientId != patient.id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    # Get prescriptions for this patient from this appointment's doctor
    result = await db.execute(
        select(Prescription).where(
            Prescription.patientId == appointment.patientId,
            Prescription.doctorId == appointment.doctorId
        )
    )
    prescriptions = result.scalars().all()
    
    return [
        {
            "id": p.id,
            "medication": p.medication,
            "dosage": p.dosage,
            "frequency": p.frequency,
            "startDate": p.startDate.isoformat(),
            "endDate": p.endDate.isoformat() if p.endDate else None,
            "refillsAvailable": p.refillsAvailable,
            "createdAt": p.createdAt.isoformat()
        }
        for p in prescriptions
    ]
