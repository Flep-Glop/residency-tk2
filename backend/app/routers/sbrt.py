from fastapi import APIRouter, Depends, HTTPException, Path
from typing import List, Dict, Any

from app.schemas.sbrt_schemas import (
    SBRTGenerateRequest, SBRTGenerateResponse,
    SBRTValidateRequest, SBRTValidateResponse
)
from app.services.sbrt_service import SBRTService

router = APIRouter()

# Dependency to get SBRT service
def get_sbrt_service():
    return SBRTService()

@router.get("/treatment-sites", response_model=List[str])
async def get_sbrt_treatment_sites(sbrt_service: SBRTService = Depends(get_sbrt_service)):
    """Get available treatment sites for SBRT."""
    return sbrt_service.get_treatment_sites()

@router.get("/dose-constraints/{site}", response_model=Dict[str, Any])
async def get_sbrt_dose_constraints(
    site: str = Path(..., title="Treatment Site", description="The specific treatment site, e.g., Spine"),
    sbrt_service: SBRTService = Depends(get_sbrt_service)
):
    """Get dose constraints for a specific SBRT treatment site."""
    constraints = sbrt_service.get_dose_constraints(site)
    if "error" in constraints:
        raise HTTPException(status_code=404, detail=constraints["error"])
    return constraints

@router.get("/fractionation-schemes/{site}", response_model=List[Dict[str, Any]])
async def get_sbrt_fractionation_schemes(
    site: str = Path(..., title="Treatment Site", description="The specific treatment site, e.g., Lung"),
    sbrt_service: SBRTService = Depends(get_sbrt_service)
):
    """Get available fractionation schemes for a specific SBRT treatment site."""
    schemes = sbrt_service.get_fractionation_schemes(site)
    if schemes and isinstance(schemes[0], dict) and "error" in schemes[0]:
        raise HTTPException(status_code=404, detail=schemes[0]["error"])
    return schemes

@router.post("/generate", response_model=SBRTGenerateResponse)
async def generate_sbrt_writeup(
    request: SBRTGenerateRequest,
    sbrt_service: SBRTService = Depends(get_sbrt_service)
):
    """Generate an SBRT write-up based on the provided data."""
    try:
        return sbrt_service.generate_sbrt_writeup(request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e: # Catch other potential errors from service
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/validate")
async def validate_sbrt_dose_fractionation(
    request: dict,
    sbrt_service: SBRTService = Depends(get_sbrt_service)
):
    """Validate dose and fractionation for a specific SBRT site."""
    try:
        # Convert the simple dict to our SBRTValidateRequest
        validate_request = SBRTValidateRequest(
            site=request.get("site", ""),
            dose=request.get("dose", 0),
            fractions=request.get("fractions", 0)
        )
        return sbrt_service.validate_dose_fractionation(validate_request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Updated method to include /treatment-sites/info endpoint if needed in the future
# Uncomment and implement if needed
# @router.get("/treatment-sites/info", response_model=Dict[str, Any])
# async def get_sbrt_treatment_sites_info(
#     sbrt_service: SBRTService = Depends(get_sbrt_service)
# ):
#     """Get detailed information about all treatment sites."""
#     result = {}
#     for site in sbrt_service.treatment_sites:
#         result[site] = {
#             "fractionation_schemes": sbrt_service.get_fractionation_schemes(site),
#             "dose_constraints": sbrt_service.get_dose_constraints(site)
#         }
#     return result 