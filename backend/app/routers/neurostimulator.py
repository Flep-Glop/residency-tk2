from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any

from app.schemas.neurostimulator_schemas import (
    NeurostimulatorGenerateRequest, NeurostimulatorGenerateResponse,
    NeurostimulatorRiskAssessmentRequest, NeurostimulatorRiskAssessmentResponse,
    NeurostimulatorDeviceInfo, NeurostimulatorTreatmentSiteInfo
)
from app.services.neurostimulator_service import NeurostimulatorService

router = APIRouter()

# Dependency to get neurostimulator service
def get_neurostimulator_service():
    return NeurostimulatorService()

@router.get("/treatment-sites", response_model=List[str])
async def get_neurostimulator_treatment_sites(service: NeurostimulatorService = Depends(get_neurostimulator_service)):
    """Get available treatment sites for neurostimulator cases."""
    return service.get_treatment_sites()

@router.get("/device-types", response_model=List[str])
async def get_device_types(service: NeurostimulatorService = Depends(get_neurostimulator_service)):
    """Get available neurostimulator device types."""
    return service.get_device_types()

@router.get("/device-info", response_model=NeurostimulatorDeviceInfo)
async def get_device_info(service: NeurostimulatorService = Depends(get_neurostimulator_service)):
    """Get device vendor and model information."""
    return service.get_device_info()

@router.get("/treatment-site-info", response_model=NeurostimulatorTreatmentSiteInfo)
async def get_treatment_site_info(service: NeurostimulatorService = Depends(get_neurostimulator_service)):
    """Get treatment site and distance option information."""
    return service.get_treatment_site_info()

@router.post("/risk-assessment", response_model=NeurostimulatorRiskAssessmentResponse)
async def calculate_risk_assessment(
    request: NeurostimulatorRiskAssessmentRequest,
    service: NeurostimulatorService = Depends(get_neurostimulator_service)
):
    """Calculate risk level for neurostimulator devices."""
    try:
        return service.calculate_risk_assessment(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/generate", response_model=NeurostimulatorGenerateResponse)
async def generate_neurostimulator_writeup(
    request: NeurostimulatorGenerateRequest,
    service: NeurostimulatorService = Depends(get_neurostimulator_service)
):
    """Generate a neurostimulator write-up based on the provided data."""
    try:
        return service.generate_neurostimulator_writeup(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

