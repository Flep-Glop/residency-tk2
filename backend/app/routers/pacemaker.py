from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any

from app.schemas.pacemaker_schemas import (
    PacemakerGenerateRequest, PacemakerGenerateResponse,
    PacemakerRiskAssessmentRequest, PacemakerRiskAssessmentResponse,
    DeviceInfo, TreatmentSiteInfo
)
from app.services.pacemaker_service import PacemakerService

router = APIRouter()

# Dependency to get pacemaker service
def get_pacemaker_service():
    return PacemakerService()

@router.get("/treatment-sites", response_model=List[str])
async def get_pacemaker_treatment_sites(pacemaker_service: PacemakerService = Depends(get_pacemaker_service)):
    """Get available treatment sites for pacemaker cases."""
    return pacemaker_service.get_treatment_sites()

@router.get("/device-info", response_model=DeviceInfo)
async def get_device_info(pacemaker_service: PacemakerService = Depends(get_pacemaker_service)):
    """Get device vendor and model information."""
    return pacemaker_service.get_device_info()

@router.get("/treatment-site-info", response_model=TreatmentSiteInfo)
async def get_treatment_site_info(pacemaker_service: PacemakerService = Depends(get_pacemaker_service)):
    """Get treatment site and distance option information."""
    return pacemaker_service.get_treatment_site_info()

@router.post("/risk-assessment", response_model=PacemakerRiskAssessmentResponse)
async def calculate_risk_assessment(
    request: PacemakerRiskAssessmentRequest,
    pacemaker_service: PacemakerService = Depends(get_pacemaker_service)
):
    """Calculate risk level based on TG-203 guidelines."""
    try:
        return pacemaker_service.calculate_risk_assessment(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/generate", response_model=PacemakerGenerateResponse)
async def generate_pacemaker_writeup(
    request: PacemakerGenerateRequest,
    pacemaker_service: PacemakerService = Depends(get_pacemaker_service)
):
    """Generate a pacemaker write-up based on the provided data."""
    try:
        return pacemaker_service.generate_pacemaker_writeup(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")