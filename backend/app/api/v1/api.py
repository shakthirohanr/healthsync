from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, appointments, doctors, me, prescriptions

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["appointments"])
api_router.include_router(doctors.router, prefix="/doctors", tags=["doctors"])
api_router.include_router(me.router, prefix="/me", tags=["me"])
api_router.include_router(prescriptions.router, prefix="/prescriptions", tags=["prescriptions"])
