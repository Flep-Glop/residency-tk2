import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.routers import fusion, dibh, sbrt, pacemaker, prior_dose, srs, tbi, hdr, settings
from app.database import engine, Base, AsyncSessionLocal, _is_sqlite
from app.models.settings import (
    ClinicProfile,
    DEFAULT_VISIBLE_MODULES,
    DEFAULT_FACILITY_DEFAULTS,
    DEFAULT_MODULE_PRESETS,
)
from app.middleware import add_error_handling, ErrorHandlerMiddleware
import logging

logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

_env = os.getenv("ENV", "development")

app = FastAPI(
    title="Medical Physics Toolkit API",
    description="Backend API for the Medical Physics Residency Toolkit",
    version="2.5.0",
    docs_url="/docs" if _env == "development" else None,
    redoc_url="/redoc" if _env == "development" else None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, lambda req, exc: JSONResponse(
    status_code=429,
    content={"detail": "Too many requests. Please slow down."},
))

_production_origins = [
    "https://residency-tk2.vercel.app",
]
_dev_origins = [
    "http://localhost:3000",
    "http://localhost:8000",
]
allowed_origins = (
    _production_origins + _dev_origins
    if _env == "development"
    else _production_origins
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(ErrorHandlerMiddleware)
add_error_handling(app)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    logger.error(f"Validation error on {request.url.path}: {errors}")
    return JSONResponse(
        status_code=422,
        content={"detail": errors}
    )

# Include routers
app.include_router(fusion.router, prefix="/api/fusion", tags=["Fusion"])
app.include_router(dibh.router, prefix="/api/dibh", tags=["DIBH"])
app.include_router(sbrt.router, prefix="/api/sbrt", tags=["SBRT"])
app.include_router(srs.router, prefix="/api/srs", tags=["SRS"])
app.include_router(pacemaker.router, prefix="/api/pacemaker", tags=["Pacemaker"])
app.include_router(prior_dose.router, prefix="/api/prior-dose", tags=["Prior Dose"])
app.include_router(tbi.router, prefix="/api/tbi", tags=["TBI"])
app.include_router(hdr.router, prefix="/api/hdr", tags=["HDR"])
app.include_router(settings.router, prefix="/api/settings", tags=["Settings"])

@app.get("/")
async def root():
    return {"message": "Medical Physics Toolkit API is running"}

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}

SYSTEM_PROFILE_NAME = os.getenv("SYSTEM_PROFILE_NAME", "Default Clinic")

_physicians_csv = os.getenv("SYSTEM_PHYSICIANS", "")
_physicists_csv = os.getenv("SYSTEM_PHYSICISTS", "")

SYSTEM_DEFAULT_PROFILE = {
    "name": SYSTEM_PROFILE_NAME,
    "physicians": [p.strip() for p in _physicians_csv.split(",") if p.strip()],
    "physicists": [p.strip() for p in _physicists_csv.split(",") if p.strip()],
    "visible_modules": DEFAULT_VISIBLE_MODULES.copy(),
    "facility_defaults": DEFAULT_FACILITY_DEFAULTS.copy(),
    "module_presets": DEFAULT_MODULE_PRESETS.copy(),
}


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        if _is_sqlite:
            from sqlalchemy import text, inspect as sa_inspect
            def _migrate(connection):
                inspector = sa_inspect(connection)
                existing_cols = {c["name"] for c in inspector.get_columns("clinic_profiles")}
                new_cols = {
                    "visible_modules": "JSON",
                    "facility_defaults": "JSON",
                    "module_presets": "JSON",
                    "icon": "TEXT",
                    "is_system": "BOOLEAN DEFAULT 0",
                    "edit_code_hash": "VARCHAR",
                }
                for col_name, col_type in new_cols.items():
                    if col_name not in existing_cols:
                        connection.execute(text(
                            f"ALTER TABLE clinic_profiles ADD COLUMN {col_name} {col_type}"
                        ))
            await conn.run_sync(_migrate)
    logger.info("Database tables created")

    async with AsyncSessionLocal() as session:
        from sqlalchemy import select
        result = await session.execute(
            select(ClinicProfile).where(ClinicProfile.is_system == True)  # noqa: E712
        )
        existing = result.scalar_one_or_none()
        if not existing:
            # Also check for legacy "Mays Cancer Center" profile to upgrade
            legacy = await session.execute(
                select(ClinicProfile).where(ClinicProfile.name == "Mays Cancer Center")
            )
            legacy_profile = legacy.scalar_one_or_none()
            if legacy_profile:
                legacy_profile.is_system = True
                for field in ("visible_modules", "facility_defaults", "module_presets"):
                    if not getattr(legacy_profile, field, None):
                        setattr(legacy_profile, field, SYSTEM_DEFAULT_PROFILE[field])
                await session.commit()
                logger.info("Upgraded legacy profile to system profile")
            else:
                session.add(ClinicProfile(
                    **SYSTEM_DEFAULT_PROFILE,
                    is_active=True,
                    is_system=True,
                ))
                await session.commit()
                logger.info("Seeded default system profile")
        else:
            updated = False
            for field in ("visible_modules", "facility_defaults", "module_presets"):
                if not getattr(existing, field, None):
                    setattr(existing, field, SYSTEM_DEFAULT_PROFILE[field])
                    updated = True
            if updated:
                await session.commit()
                logger.info("Backfilled system profile with default settings")

@app.on_event("shutdown")
async def shutdown():
    # Close database connection
    await engine.dispose()
    logger.info("Database connection closed") 