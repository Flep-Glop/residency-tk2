from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any

from app.schemas.hdr_schemas import HDRGenerateRequest, HDRGenerateResponse
from app.services.hdr_service import HDRService

router = APIRouter()

# Dependency to get HDR service
def get_hdr_service():
    return HDRService()

@router.get("/applicators", response_model=List[str])
async def get_applicators(hdr_service: HDRService = Depends(get_hdr_service)):
    """Get available HDR applicator types."""
    return hdr_service.get_applicators()

@router.get("/applicator-info/{applicator_type}", response_model=Dict[str, Any])
async def get_applicator_info(
    applicator_type: str,
    hdr_service: HDRService = Depends(get_hdr_service)
):
    """Get default information for a specific applicator type."""
    return hdr_service.get_applicator_info(applicator_type)

@router.post("/generate", response_model=HDRGenerateResponse)
async def generate_hdr_writeup(
    request: HDRGenerateRequest,
    hdr_service: HDRService = Depends(get_hdr_service)
):
    """Generate an HDR brachytherapy write-up based on the provided data."""
    try:
        return hdr_service.generate_hdr_writeup(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

