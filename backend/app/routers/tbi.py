from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict

from app.schemas.tbi_schemas import TBIGenerateRequest, TBIGenerateResponse
from app.services.tbi_service import TBIService

router = APIRouter()

# Dependency to get TBI service
def get_tbi_service():
    return TBIService()

@router.get("/fractionation-schemes", response_model=List[Dict])
async def get_fractionation_schemes(tbi_service: TBIService = Depends(get_tbi_service)):
    """Get available TBI fractionation schemes."""
    return tbi_service.get_fractionation_schemes()

@router.get("/setup-options", response_model=List[str])
async def get_setup_options(tbi_service: TBIService = Depends(get_tbi_service)):
    """Get available setup options."""
    return tbi_service.get_setup_options()

@router.post("/generate", response_model=TBIGenerateResponse)
async def generate_tbi_writeup(
    request: TBIGenerateRequest,
    tbi_service: TBIService = Depends(get_tbi_service)
):
    """Generate a TBI write-up based on the provided data."""
    try:
        return tbi_service.generate_tbi_writeup(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

