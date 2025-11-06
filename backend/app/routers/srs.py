from fastapi import APIRouter, Depends, HTTPException
from typing import List

from app.schemas.srs_schemas import SRSGenerateRequest, SRSGenerateResponse
from app.services.srs_service import SRSService

router = APIRouter()

# Dependency to get SRS service
def get_srs_service():
    return SRSService()

@router.get("/brain-regions", response_model=List[str])
async def get_brain_regions(srs_service: SRSService = Depends(get_srs_service)):
    """Get available brain regions for SRS/SRT."""
    return srs_service.get_brain_regions()

@router.post("/generate", response_model=SRSGenerateResponse)
async def generate_srs_writeup(
    request: SRSGenerateRequest,
    srs_service: SRSService = Depends(get_srs_service)
):
    """Generate an SRS/SRT write-up based on the provided data."""
    try:
        return srs_service.generate_srs_writeup(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

