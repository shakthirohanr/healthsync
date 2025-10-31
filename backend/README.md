# HealthSync Backend - Python FastAPI

A modern, async Python backend for the HealthSync healthcare management system.

## Features

- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy 2.0** - Async ORM for database operations
- **PostgreSQL** - Production-ready database
- **JWT Authentication** - Secure token-based auth
- **Pydantic** - Data validation using Python type annotations
- **Alembic** - Database migrations

## Setup

### 1. Install Python Dependencies

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate  # On Windows
# source venv/bin/activate  # On Unix/macOS

pip install -r requirements.txt
```

### 2. Environment Variables

Copy `.env.example` to `.env` and update with your database credentials:

```bash
cp .env.example .env
```

Update the `.env` file:
```
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/healthsync
SECRET_KEY=your-secret-key-generate-a-secure-one
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=http://localhost:3000
```

### 3. Run the Server

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### 4. API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get access token
- `GET /api/v1/auth/me` - Get current user info

### Users
- `PATCH /api/v1/users/profile` - Update user profile
- `PATCH /api/v1/users/password` - Update password

### Appointments
- `GET /api/v1/appointments/` - Get all appointments
- `POST /api/v1/appointments/` - Create appointment
- `PATCH /api/v1/appointments/{id}` - Update appointment

### Doctors
- `GET /api/v1/doctors/` - Get all doctors

## Database Schema

The backend uses the same Prisma schema structure with SQLAlchemy models:

- User
- PatientProfile
- DoctorProfile
- Appointment
- Prescription

## Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black .
isort .
```

### Type Checking
```bash
mypy .
```
