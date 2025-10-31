from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.v1.api import api_router
from app.db.session import engine
from app.db.init_db import setup_database

# Import this to register all models with SQLAlchemy before any DB operations
import app.db.init_models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting up HealthSync API...")
    
    # Initialize database (create tables if they don't exist)
    try:
        await setup_database()
    except Exception as e:
        print(f"Warning: Database initialization failed: {e}")
        print("Application will continue, but database operations may fail.")
    
    yield
    # Shutdown
    print("Shutting down HealthSync API...")
    await engine.dispose()


app = FastAPI(
    title="HealthSync API",
    description="Healthcare Management System API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {"message": "HealthSync API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
