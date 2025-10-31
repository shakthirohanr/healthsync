"""
Script to add dummy data with Indian names and details
Creates 2 doctors and 3 patients
"""
import asyncio
import uuid
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.models.user import User, UserRole
from app.models.patient_profile import PatientProfile
from app.models.doctor_profile import DoctorProfile
from app.models.appointment import Appointment, AppointmentStatus
from app.core.security import get_password_hash

# Import all models to ensure they're registered
import app.db.init_models  # noqa: F401


async def create_dummy_data():
    """Create dummy doctors and patients with Indian names"""
    async with AsyncSessionLocal() as db:
        print("=" * 60)
        print("Creating dummy data for HealthSync")
        print("=" * 60)
        
        # Check if data already exists
        result = await db.execute(select(User))
        existing_users = result.scalars().all()
        
        if len(existing_users) > 0:
            print(f"\n⚠️  Found {len(existing_users)} existing users.")
            response = input("Do you want to continue adding more users? (yes/no): ")
            if response.lower() != 'yes':
                print("Aborted. No data was added.")
                return
        
        # Create Doctors
        doctors_data = [
            {
                "name": "Dr. Rajesh Kumar",
                "email": "rajesh.kumar@healthsync.in",
                "password": "doctor123",
                "phoneNumber": "+91 98765 43210",
                "age": 42,
                "gender": "Male",
                "specialty": "Cardiologist",
                "credentials": "MBBS, MD (Cardiology), FACC",
                "officeAddress": "Apollo Hospitals, Jubilee Hills, Hyderabad"
            },
            {
                "name": "Dr. Priya Sharma",
                "email": "priya.sharma@healthsync.in",
                "password": "doctor123",
                "phoneNumber": "+91 99887 76543",
                "age": 38,
                "gender": "Female",
                "specialty": "Pediatrician",
                "credentials": "MBBS, MD (Pediatrics), FIAP",
                "officeAddress": "Max Hospital, Saket, New Delhi"
            }
        ]
        
        # Create Patients
        patients_data = [
            {
                "name": "Amit Patel",
                "email": "amit.patel@example.in",
                "password": "patient123",
                "phoneNumber": "+91 98123 45678",
                "age": 35,
                "gender": "Male",
            },
            {
                "name": "Sneha Reddy",
                "email": "sneha.reddy@example.in",
                "password": "patient123",
                "phoneNumber": "+91 97234 56789",
                "age": 28,
                "gender": "Female",
            },
            {
                "name": "Arjun Mehta",
                "email": "arjun.mehta@example.in",
                "password": "patient123",
                "phoneNumber": "+91 96345 67890",
                "age": 45,
                "gender": "Male",
            }
        ]
        
        print("\n📋 Creating Doctors...")
        print("-" * 60)
        
        created_doctors = []
        for doctor_data in doctors_data:
            # Check if email already exists
            result = await db.execute(
                select(User).where(User.email == doctor_data["email"])
            )
            existing = result.scalar_one_or_none()
            
            if existing:
                print(f"⚠️  Doctor {doctor_data['name']} already exists. Skipping.")
                created_doctors.append(existing)
                continue
            
            # Create doctor user
            doctor_user = User(
                id=str(uuid.uuid4()),
                name=doctor_data["name"],
                email=doctor_data["email"],
                password=get_password_hash(doctor_data["password"]),
                role=UserRole.DOCTOR,
                phoneNumber=doctor_data["phoneNumber"],
                age=doctor_data["age"],
                gender=doctor_data["gender"],
                createdAt=datetime.utcnow(),
                updatedAt=datetime.utcnow()
            )
            db.add(doctor_user)
            await db.flush()
            
            # Create doctor profile
            doctor_profile = DoctorProfile(
                id=str(uuid.uuid4()),
                userId=doctor_user.id,
                specialty=doctor_data["specialty"],
                credentials=doctor_data["credentials"],
                officeAddress=doctor_data["officeAddress"]
            )
            db.add(doctor_profile)
            
            created_doctors.append(doctor_user)
            print(f"✓ Created doctor: {doctor_data['name']}")
            print(f"  Email: {doctor_data['email']}")
            print(f"  Password: {doctor_data['password']}")
            print(f"  Specialty: {doctor_data['specialty']}")
            print(f"  Phone: {doctor_data['phoneNumber']}")
            print()
        
        print("\n👥 Creating Patients...")
        print("-" * 60)
        
        created_patients = []
        for patient_data in patients_data:
            # Check if email already exists
            result = await db.execute(
                select(User).where(User.email == patient_data["email"])
            )
            existing = result.scalar_one_or_none()
            
            if existing:
                print(f"⚠️  Patient {patient_data['name']} already exists. Skipping.")
                created_patients.append(existing)
                continue
            
            # Create patient user
            patient_user = User(
                id=str(uuid.uuid4()),
                name=patient_data["name"],
                email=patient_data["email"],
                password=get_password_hash(patient_data["password"]),
                role=UserRole.PATIENT,
                phoneNumber=patient_data["phoneNumber"],
                age=patient_data["age"],
                gender=patient_data["gender"],
                createdAt=datetime.utcnow(),
                updatedAt=datetime.utcnow()
            )
            db.add(patient_user)
            await db.flush()
            
            # Create patient profile
            patient_profile = PatientProfile(
                id=str(uuid.uuid4()),
                userId=patient_user.id
            )
            db.add(patient_profile)
            
            created_patients.append(patient_user)
            print(f"✓ Created patient: {patient_data['name']}")
            print(f"  Email: {patient_data['email']}")
            print(f"  Password: {patient_data['password']}")
            print(f"  Phone: {patient_data['phoneNumber']}")
            print()
        
        # Create some sample appointments
        print("\n📅 Creating Sample Appointments...")
        print("-" * 60)
        
        if len(created_doctors) > 0 and len(created_patients) > 0:
            # Get doctor and patient profiles
            doctor1_result = await db.execute(
                select(DoctorProfile).where(DoctorProfile.userId == created_doctors[0].id)
            )
            doctor1_profile = doctor1_result.scalar_one_or_none()
            
            patient1_result = await db.execute(
                select(PatientProfile).where(PatientProfile.userId == created_patients[0].id)
            )
            patient1_profile = patient1_result.scalar_one_or_none()
            
            if doctor1_profile and patient1_profile:
                # Upcoming appointment (tomorrow at 10 AM)
                appointment1 = Appointment(
                    id=str(uuid.uuid4()),
                    patientId=patient1_profile.id,
                    doctorId=doctor1_profile.id,
                    appointmentDate=datetime.utcnow() + timedelta(days=1, hours=10),
                    status=AppointmentStatus.SCHEDULED,
                    reasonForVisit="Regular checkup",
                    createdAt=datetime.utcnow()
                )
                db.add(appointment1)
                print(f"✓ Created appointment: {created_patients[0].name} → {created_doctors[0].name}")
                print(f"  Date: Tomorrow at 10:00 AM")
                print(f"  Reason: Regular checkup")
                print()
            
            # Another upcoming appointment if we have more data
            if len(created_doctors) > 1 and len(created_patients) > 1:
                doctor2_result = await db.execute(
                    select(DoctorProfile).where(DoctorProfile.userId == created_doctors[1].id)
                )
                doctor2_profile = doctor2_result.scalar_one_or_none()
                
                patient2_result = await db.execute(
                    select(PatientProfile).where(PatientProfile.userId == created_patients[1].id)
                )
                patient2_profile = patient2_result.scalar_one_or_none()
                
                if doctor2_profile and patient2_profile:
                    # Upcoming appointment (3 days from now at 2 PM)
                    appointment2 = Appointment(
                        id=str(uuid.uuid4()),
                        patientId=patient2_profile.id,
                        doctorId=doctor2_profile.id,
                        appointmentDate=datetime.utcnow() + timedelta(days=3, hours=14),
                        status=AppointmentStatus.SCHEDULED,
                        reasonForVisit="Consultation for fever",
                        createdAt=datetime.utcnow()
                    )
                    db.add(appointment2)
                    print(f"✓ Created appointment: {created_patients[1].name} → {created_doctors[1].name}")
                    print(f"  Date: 3 days from now at 2:00 PM")
                    print(f"  Reason: Consultation for fever")
                    print()
        
        # Commit all changes
        await db.commit()
        
        print("\n" + "=" * 60)
        print("✅ Dummy data created successfully!")
        print("=" * 60)
        
        print("\n📝 Login Credentials:")
        print("-" * 60)
        print("\n🩺 DOCTORS:")
        for doctor_data in doctors_data:
            print(f"  Email: {doctor_data['email']}")
            print(f"  Password: {doctor_data['password']}")
            print()
        
        print("👤 PATIENTS:")
        for patient_data in patients_data:
            print(f"  Email: {patient_data['email']}")
            print(f"  Password: {patient_data['password']}")
            print()
        
        print("=" * 60)


if __name__ == "__main__":
    print("\n🏥 HealthSync Dummy Data Generator")
    print("This script will create 2 doctors and 3 patients with Indian names\n")
    asyncio.run(create_dummy_data())
