from fastapi import APIRouter, HTTPException, Depends
from app.schemas.dibh import DIBHRequest, DIBHResponse
from app.services.dibh import DIBHService

router = APIRouter()

# Create a simple dependency to get the DIBH service
def get_dibh_service():
    return DIBHService()

@router.get("/")
async def get_dibh_info():
    """Get information about the DIBH module."""
    return {
        "name": "DIBH Module",
        "description": "Generate DIBH (Deep Inspiration Breath Hold) write-ups", 
        "endpoints": [
            "/api/dibh/generate",
            "/api/dibh/treatment-sites",
            "/api/dibh/immobilization-devices",
            "/api/dibh/fractionation-schemes"
        ]
    }

@router.post("/generate", response_model=DIBHResponse)
async def generate_dibh_writeup(request: DIBHRequest, 
                                dibh_service: DIBHService = Depends(get_dibh_service)):
    """Generate a DIBH write-up based on the provided data."""
    try:
        return dibh_service.generate_dibh_writeup(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/treatment-sites")
async def get_treatment_sites(dibh_service: DIBHService = Depends(get_dibh_service)):
    """Get available treatment sites for DIBH."""
    return dibh_service.treatment_sites

@router.get("/immobilization-devices")
async def get_immobilization_devices(dibh_service: DIBHService = Depends(get_dibh_service)):
    """Get available immobilization devices."""
    return dibh_service.immobilization_devices

@router.get("/fractionation-schemes")
async def get_fractionation_schemes(dibh_service: DIBHService = Depends(get_dibh_service)):
    """Get default fractionation schemes by treatment site."""
    return dibh_service.fractionation_schemes 