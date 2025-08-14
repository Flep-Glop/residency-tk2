from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional
from .common import CommonInfo

class CalculatedMetrics(BaseModel):
    """Schema for calculated plan quality metrics from frontend."""
    coverage: str = Field(..., description="Coverage percentage as string")
    conformityIndex: str = Field(..., description="Conformity Index as string") 
    r50: str = Field(..., description="R50 ratio as string")
    gradientMeasure: str = Field(..., description="Gradient Measure as string")
    maxDose2cmRingPercent: str = Field(..., description="Max dose in 2cm ring percentage as string")
    homogeneityIndex: str = Field(..., description="Homogeneity Index as string")
    conformityDeviation: str = Field(..., description="Conformity deviation status")
    r50Deviation: str = Field(..., description="R50 deviation status")  
    maxDose2cmDeviation: str = Field(..., description="Max dose 2cm deviation status")
    toleranceRow: Dict[str, Any] = Field(..., description="Tolerance table row used for calculations")

class SBRTData(BaseModel):
    """Schema matching frontend form structure exactly."""
    # Basic treatment parameters (match frontend form field names)
    treatment_site: str = Field(..., example="lung")
    anatomical_clarification: Optional[str] = Field("", description="Anatomical clarification for spine/bone sites (e.g., T11-L1, Humerus)")
    dose: float = Field(..., example=50.0)
    fractions: int = Field(..., example=5)
    breathing_technique: str = Field(..., example="freebreathe", description="freebreathe, 4DCT, or DIBH")
    oligomet_location: Optional[str] = Field("", description="Location for oligometastasis cases")
    
    # Target and plan information (match frontend form field names)
    target_name: str = Field(..., example="PTV_50", description="Target/lesion name")
    ptv_volume: str = Field(..., example="25.1", description="PTV volume in cc as string from form")
    vol_ptv_receiving_rx: str = Field(..., example="95.0", description="Volume of PTV receiving Rx as string")
    vol_100_rx_isodose: str = Field(..., example="27.6", description="100% isodose volume as string")
    vol_50_rx_isodose: str = Field(..., example="125.0", description="50% isodose volume as string") 
    max_dose_2cm_ring: str = Field(..., example="52.5", description="Max dose in 2cm ring as string")
    max_dose_in_target: str = Field(..., example="55.0", description="Max dose in target as string")
    sib_comment: str = Field("", description="SIB comment")
    
    # Calculated metrics and additional data from frontend
    calculated_metrics: Optional[CalculatedMetrics] = Field(None, description="Real-time calculated metrics")
    is_sib: bool = Field(default=False, description="SIB case flag")

    @validator('fractions')
    def fractions_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Fractions must be a positive integer')
        return v

class SBRTGenerateRequest(BaseModel):
    common_info: CommonInfo
    sbrt_data: SBRTData
    additional_data: Dict[str, Any] = Field(default_factory=dict)

class SBRTGenerateResponse(BaseModel):
    writeup: str = Field(..., example="This is a generated SBRT write-up...")

class SBRTValidateRequest(BaseModel):
    site: str = Field(..., example="Spine")
    dose: float = Field(..., example=30.0)
    fractions: int = Field(..., example=3)

    @validator('fractions')
    def validate_fractions_positive(cls, v):
        if v <= 0:
            raise ValueError('Fractions must be a positive integer')
        return v

class SBRTValidateResponse(BaseModel):
    is_valid: bool = Field(..., example=True)
    message: str = Field(default="Validation successful")
    constraints_met: List[Dict[str, Any]] = Field(default_factory=list)
    constraints_violated: List[Dict[str, Any]] = Field(default_factory=list)

# Placeholder for treatment site details if needed later
# class SBRTTreatmentSiteInfo(BaseModel):
#     name: str
#     available_fx_schemes: List[Dict[str, Any]]
#     dose_constraints: Dict[str, Any]

# You might also want schemas for what /treatment-sites, /dose-constraints, 
# and /fractionation-schemes return if they are more complex than simple lists/dicts.
# For now, assuming they return List[str] or Dict[str, Any] which FastAPI can handle. 