from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import fusion, dibh, sbrt, pacemaker
from app.database import engine, Base
from app.middleware import add_error_handling, ErrorHandlerMiddleware
import logging
import os

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Medical Physics Toolkit API",
    description="Backend API for the Medical Physics Residency Toolkit",
    version="1.0.0"
)

# Get allowed origins from environment or use default list
allowed_origins = [
    "https://residency-tk2.vercel.app",  # Production frontend
    "http://localhost:3000",            # Local frontend
    "http://localhost:8000",            # Local backend
    "*"                                 # For development only
]

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add error handling middleware
app.add_middleware(ErrorHandlerMiddleware)
add_error_handling(app)

# Include routers
app.include_router(fusion.router, prefix="/api/fusion", tags=["Fusion"])
app.include_router(dibh.router, prefix="/api/dibh", tags=["DIBH"])
app.include_router(sbrt.router, prefix="/api/sbrt", tags=["SBRT"])
app.include_router(pacemaker.router, prefix="/api/pacemaker", tags=["Pacemaker"])

@app.get("/")
async def root():
    return {"message": "Medical Physics Toolkit API is running"}

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}

@app.on_event("startup")
async def startup():
    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created")

@app.on_event("shutdown")
async def shutdown():
    # Close database connection
    await engine.dispose()
    logger.info("Database connection closed") 