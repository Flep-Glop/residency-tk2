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

@router.get("/suggested-constraints")
async def get_suggested_constraints(
    sites: str,
    dose_calc_method: str = "Raw Dose",
    current_dose: float = None,
    current_fractions: int = None,
    prior_dose_service: PriorDoseService = Depends(get_prior_dose_service)
):
    """Get suggested dose constraints based on treatment sites and fractionation.
    
    The constraint set is selected based on:
    1. If dose_calc_method contains "EQD2" → Use QUANTEC constraints (EQD2₂ values)
    2. If dose_calc_method is "Raw Dose" → Detect regime from fractionation:
       - SRS: Single fraction ≥10 Gy
       - SBRT_3fx: 2-3 fractions, ≥5 Gy/fx
       - SBRT_5fx: 4-8 fractions, ≥5 Gy/fx
       - CONVENTIONAL: ~2 Gy/fx → Use QUANTEC
    
    Args:
        sites: Comma-separated list of treatment sites (e.g., "lung,thorax,spine")
        dose_calc_method: "Raw Dose" or "EQD2" - determines constraint set selection
        current_dose: Current treatment total dose in Gy (for regime detection)
        current_fractions: Current treatment number of fractions (for regime detection)
    
    Returns:
        Deduplicated list of constraint dictionaries with structure, constraint, 
        source, unit, limit, and endpoint. If multiple sites share the same 
        constraint, it only appears once.
    """
    # Split comma-separated sites into list
    site_list = [s.strip() for s in sites.split(",") if s.strip()]
    constraints = prior_dose_service.get_constraints_for_sites(
        sites=site_list,
        dose_calc_method=dose_calc_method,
        current_dose=current_dose,
        current_fractions=current_fractions
    )
    return constraints

@router.get("/fractionation-regime")
async def get_fractionation_regime(
    dose: float,
    fractions: int,
    prior_dose_service: PriorDoseService = Depends(get_prior_dose_service)
):
    """Detect the fractionation regime for a given dose/fractionation.
    
    Args:
        dose: Total dose in Gy
        fractions: Number of fractions
    
    Returns:
        Regime name and recommended constraint source
    """
    regime = prior_dose_service.detect_fractionation_regime(dose, fractions)
    
    regime_info = {
        "SRS": {
            "name": "SRS (Single Fraction)",
            "description": "Single-fraction stereotactic radiosurgery",
            "constraint_source": "TG-101/HyTEC SRS limits"
        },
        "SBRT_3fx": {
            "name": "SBRT (3 fractions)",
            "description": "Stereotactic body radiation therapy, 3-fraction regimen",
            "constraint_source": "Timmerman/TG-101 3fx limits"
        },
        "SBRT_5fx": {
            "name": "SBRT (5 fractions)",
            "description": "Stereotactic body radiation therapy, 5-fraction regimen",
            "constraint_source": "Timmerman/TG-101 5fx limits"
        },
        "MODERATE_HYPOFX": {
            "name": "Moderate Hypofractionation",
            "description": "Moderately hypofractionated treatment (2.5-5 Gy/fraction)",
            "constraint_source": "QUANTEC limits"
        },
        "CONVENTIONAL": {
            "name": "Conventional Fractionation",
            "description": "Standard fractionation (<2.5 Gy/fraction)",
            "constraint_source": "QUANTEC limits"
        }
    }
    
    return {
        "regime": regime,
        "dose_per_fraction": dose / fractions if fractions > 0 else 0,
        **regime_info.get(regime, regime_info["CONVENTIONAL"])
    }

@router.get("/alpha-beta")
async def get_alpha_beta_ratios(
    prior_dose_service: PriorDoseService = Depends(get_prior_dose_service)
):
    """Get the α/β ratio reference values for all structures.
    
    Returns:
        Dictionary of structure names to α/β ratios in Gy
    """
    return prior_dose_service.alpha_beta_ratios