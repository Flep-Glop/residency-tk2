from fastapi import APIRouter, HTTPException, Depends, Response
from app.schemas.prior_dose import PriorDoseRequest, PriorDoseResponse, PriorTreatment
from app.services.prior_dose import PriorDoseService

router = APIRouter()

# Create a simple dependency to get the prior dose service
def get_prior_dose_service():
    return PriorDoseService()

@router.get("/")
async def get_prior_dose_info():
    """Get information about the prior dose module."""
    return {
        "name": "Prior Dose Module",
        "description": "Generate prior dose write-ups for medical physics consultations", 
        "endpoints": [
            "/api/prior-dose/generate",
            "/api/prior-dose/treatment-sites",
            "/api/prior-dose/dose-calc-methods"
        ]
    }

@router.post("/generate", response_model=PriorDoseResponse)
async def generate_prior_dose_writeup(request: PriorDoseRequest, 
                                     response: Response,
                                     prior_dose_service: PriorDoseService = Depends(get_prior_dose_service)):
    """Generate a prior dose write-up based on the provided data."""
    try:
        # Add no-cache headers to prevent frontend caching issues
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        
        return prior_dose_service.generate_prior_dose_writeup(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/treatment-sites")
async def get_treatment_sites(prior_dose_service: PriorDoseService = Depends(get_prior_dose_service)):
    """Get the available treatment sites."""
    return prior_dose_service.treatment_sites

@router.get("/dose-calc-methods")
async def get_dose_calc_methods():
    """Get the available dose calculation methods."""
    return ["Raw Dose", "EQD2 (Equivalent Dose in 2 Gy fractions)"]