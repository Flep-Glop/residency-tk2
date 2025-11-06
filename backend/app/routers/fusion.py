from fastapi import APIRouter, HTTPException, Depends, Response
from app.schemas.fusion import FusionRequest, FusionResponse, Registration
from app.services.fusion import FusionService

router = APIRouter()

# Create a simple dependency to get the fusion service
def get_fusion_service():
    return FusionService()

@router.get("/")
async def get_fusion_info():
    """Get information about the fusion module."""
    return {
        "name": "Fusion Module",
        "description": "Generate fusion write-ups for medical physics procedures", 
        "endpoints": [
            "/api/fusion/generate",
            "/api/fusion/lesion-regions",
            "/api/fusion/modalities",
            "/api/fusion/registration-methods"
        ]
    }

@router.post("/generate", response_model=FusionResponse)
async def generate_fusion_writeup(request: FusionRequest, 
                                 response: Response,
                                 fusion_service: FusionService = Depends(get_fusion_service)):
    """Generate a fusion write-up based on the provided data."""
    try:
        # Add no-cache headers to prevent frontend caching issues
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        
        return fusion_service.generate_fusion_writeup(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/lesion-regions")
async def get_lesion_regions(fusion_service: FusionService = Depends(get_fusion_service)):
    """Get the mapping of lesions to anatomical regions."""
    return fusion_service.lesion_to_region

@router.get("/modalities")
async def get_modalities():
    """Get the available modalities for registrations."""
    return ["MRI", "PET/CT", "CT", "CBCT"]

@router.get("/registration-methods")
async def get_registration_methods():
    """Get the available registration methods."""
    return ["Rigid", "Deformable"] 