"""
Import all models to register them with SQLAlchemy.
This must be imported after Base is created but before any database operations.
"""

# Import base first
from app.db.base import Base  # noqa: F401

# Import all models to register them with SQLAlchemy
from app.models.user import User  # noqa: F401
from app.models.patient_profile import PatientProfile  # noqa: F401
from app.models.doctor_profile import DoctorProfile  # noqa: F401
from app.models.appointment import Appointment  # noqa: F401
from app.models.prescription import Prescription  # noqa: F401
