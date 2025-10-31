from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from sqlalchemy.orm import selectinload
from datetime import datetime, date, timezone

from app.db.session import get_db
from app.models.user import User
from app.models.patient_profile import PatientProfile
from app.models.doctor_profile import DoctorProfile
from app.models.appointment import Appointment, AppointmentStatus
from app.models.prescription import Prescription
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get dashboard data for current user (patient or doctor)"""
    
    if current_user.role == "PATIENT":
        return await get_patient_dashboard(current_user, db)
    elif current_user.role == "DOCTOR":
        return await get_doctor_dashboard(current_user, db)
    else:
        raise HTTPException(status_code=400, detail="Invalid user role")


async def get_patient_dashboard(user: User, db: AsyncSession):
    """Get dashboard data for patient"""
    
    # Get patient profile with relationships
    result = await db.execute(
        select(PatientProfile)
        .options(
            selectinload(PatientProfile.appointments).selectinload(Appointment.doctor).selectinload(DoctorProfile.user),
            selectinload(PatientProfile.prescriptions).selectinload(Prescription.doctor).selectinload(DoctorProfile.user)
        )
        .where(PatientProfile.userId == user.id)
    )
    patient = result.scalar_one_or_none()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")
    
    # Get current time in UTC (naive datetime for comparison with database timestamps)
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    
    # Get upcoming appointments (including all future appointments regardless of status)
    upcoming_appointments = [
        {
            "id": appt.id,
            "appointmentDate": appt.appointmentDate.isoformat(),
            "status": appt.status,
            "reasonForVisit": appt.reasonForVisit,
            "doctor": {
                "id": appt.doctor.id,
                "specialty": appt.doctor.specialty,
                "credentials": appt.doctor.credentials,
                "user": {
                    "id": appt.doctor.user.id,
                    "name": appt.doctor.user.name,
                    "email": appt.doctor.user.email
                }
            }
        }
        for appt in patient.appointments
        if appt.appointmentDate >= now
    ]
    
    # Sort by date
    upcoming_appointments.sort(key=lambda x: x["appointmentDate"])
    
    # Get recent visits (past appointments)
    recent_visits = [
        {
            "id": appt.id,
            "appointmentDate": appt.appointmentDate.isoformat(),
            "status": appt.status,
            "reasonForVisit": appt.reasonForVisit,
            "doctor": {
                "id": appt.doctor.id,
                "specialty": appt.doctor.specialty,
                "credentials": appt.doctor.credentials,
                "user": {
                    "id": appt.doctor.user.id,
                    "name": appt.doctor.user.name,
                    "email": appt.doctor.user.email
                }
            }
        }
        for appt in patient.appointments
        if appt.appointmentDate < now
    ]
    
    # Sort by date (most recent first)
    recent_visits.sort(key=lambda x: x["appointmentDate"], reverse=True)
    recent_visits = recent_visits[:5]  # Limit to 5 most recent
    
    # Get active prescriptions
    active_prescriptions = [
        {
            "id": pres.id,
            "medication": pres.medication,
            "dosage": pres.dosage,
            "frequency": pres.frequency,
            "startDate": pres.startDate.isoformat() if pres.startDate else None,
            "endDate": pres.endDate.isoformat() if pres.endDate else None,
            "refillsAvailable": pres.refillsAvailable,
            "createdAt": pres.createdAt.isoformat(),
            "doctor": {
                "id": pres.doctor.id,
                "specialty": pres.doctor.specialty,
                "user": {
                    "id": pres.doctor.user.id,
                    "name": pres.doctor.user.name
                }
            }
        }
        for pres in patient.prescriptions
        if pres.endDate is None or pres.endDate >= date.today()
    ]
    
    # Sort by created date (most recent first)
    active_prescriptions.sort(key=lambda x: x["createdAt"], reverse=True)
    
    # Get ALL appointments for debugging
    all_appointments_list = [
        {
            "id": appt.id,
            "appointmentDate": appt.appointmentDate.isoformat(),
            "status": appt.status,
            "reasonForVisit": appt.reasonForVisit,
            "doctor": {
                "id": appt.doctor.id,
                "specialty": appt.doctor.specialty,
                "user": {
                    "id": appt.doctor.user.id,
                    "name": appt.doctor.user.name
                }
            }
        }
        for appt in patient.appointments
    ]
    all_appointments_list.sort(key=lambda x: x["appointmentDate"], reverse=True)
    
    return {
        "upcomingAppointments": upcoming_appointments[:3],  # Limit to 3 for dashboard
        "recentVisits": recent_visits[:3],  # Limit to 3 for dashboard
        "activePrescriptions": active_prescriptions[:5],  # Limit to 5 for dashboard
        "allAppointments": all_appointments_list,  # ALL appointments for debugging and appointments page
        "allVisits": recent_visits,  # Full list for records page
        "allPrescriptions": active_prescriptions  # Full list for records page
    }


async def get_doctor_dashboard(user: User, db: AsyncSession):
    """Get dashboard data for doctor"""
    
    # Get doctor profile with relationships
    result = await db.execute(
        select(DoctorProfile)
        .options(
            selectinload(DoctorProfile.appointments).selectinload(Appointment.patient).selectinload(PatientProfile.user),
            selectinload(DoctorProfile.prescriptions)
        )
        .where(DoctorProfile.userId == user.id)
    )
    doctor = result.scalar_one_or_none()
    
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")
    
    # Get current time in UTC (naive datetime for comparison with database timestamps)
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    
    # Get today's schedule
    today = date.today()
    today_schedule = [
        {
            "id": appt.id,
            "appointmentDate": appt.appointmentDate.isoformat(),
            "status": appt.status,
            "reasonForVisit": appt.reasonForVisit,
            "patient": {
                "id": appt.patient.id,
                "dateOfBirth": appt.patient.dateOfBirth.isoformat() if appt.patient.dateOfBirth else None,
                "address": appt.patient.address,
                "user": {
                    "id": appt.patient.user.id,
                    "name": appt.patient.user.name,
                    "email": appt.patient.user.email
                }
            }
        }
        for appt in doctor.appointments
        if appt.appointmentDate.date() == today
    ]
    
    # Sort by time
    today_schedule.sort(key=lambda x: x["appointmentDate"])
    
    # Get all patients (unique)
    patient_ids = set()
    patients = []
    for appt in doctor.appointments:
        if appt.patient.id not in patient_ids:
            patient_ids.add(appt.patient.id)
            patients.append({
                "id": appt.patient.id,
                "dateOfBirth": appt.patient.dateOfBirth.isoformat() if appt.patient.dateOfBirth else None,
                "address": appt.patient.address,
                "user": {
                    "id": appt.patient.user.id,
                    "name": appt.patient.user.name,
                    "email": appt.patient.user.email
                }
            })
    
    # Get upcoming appointments (all future appointments regardless of status)
    upcoming_appointments = [
        {
            "id": appt.id,
            "appointmentDate": appt.appointmentDate.isoformat(),
            "status": appt.status,
            "reasonForVisit": appt.reasonForVisit,
            "patient": {
                "id": appt.patient.id,
                "dateOfBirth": appt.patient.dateOfBirth.isoformat() if appt.patient.dateOfBirth else None,
                "address": appt.patient.address,
                "user": {
                    "id": appt.patient.user.id,
                    "name": appt.patient.user.name,
                    "email": appt.patient.user.email
                }
            }
        }
        for appt in doctor.appointments
        if appt.appointmentDate >= now
    ]
    
    # Sort by date
    upcoming_appointments.sort(key=lambda x: x["appointmentDate"])
    
    # Get ALL appointments for debugging/appointments page
    all_appointments_list = [
        {
            "id": appt.id,
            "appointmentDate": appt.appointmentDate.isoformat(),
            "status": appt.status,
            "reasonForVisit": appt.reasonForVisit,
            "patient": {
                "id": appt.patient.id,
                "dateOfBirth": appt.patient.dateOfBirth.isoformat() if appt.patient.dateOfBirth else None,
                "address": appt.patient.address,
                "user": {
                    "id": appt.patient.user.id,
                    "name": appt.patient.user.name,
                    "email": appt.patient.user.email
                }
            }
        }
        for appt in doctor.appointments
    ]
    all_appointments_list.sort(key=lambda x: x["appointmentDate"], reverse=True)
    
    # Calculate stats
    total_patients_today = len(today_schedule)
    pending_lab_results = 0  # Placeholder - would need lab results model
    records_to_review = len([appt for appt in doctor.appointments if appt.status == AppointmentStatus.PENDING])
    
    return {
        "todaySchedule": today_schedule,
        "upcomingAppointments": upcoming_appointments[:5],  # Limit to 5 for dashboard
        "patients": patients,
        "allAppointments": all_appointments_list,  # ALL appointments for debugging and appointments page
        "stats": {
            "totalPatientsToday": total_patients_today,
            "pendingLabResults": pending_lab_results,
            "recordsToReview": records_to_review
        }
    }
