from pydantic import BaseModel, Field
from typing import Optional, List
from app.schemas.common import CommonInfo

class SRSLesionData(BaseModel):
    """Data for a single SRS/SRT lesion."""
    site: str = Field(..., description="Brain region location (e.g., 'left frontal lobe', 'cerebellum')")
    volume: float = Field(..., description="Target volume in cc", gt=0)
    treatment_type: str = Field(..., description="'SRS' for single fraction or 'SRT' for multiple fractions")
    dose: float = Field(..., description="Prescription dose in Gy", gt=0)
    fractions: int = Field(..., description="Number of fractions (1 for SRS, >=2 for SRT)", ge=1)
    prescription_isodose: float = Field(..., description="Prescription isodose level (%)", ge=80, le=100)
    ptv_coverage: float = Field(..., description="PTV coverage (%)", ge=90, le=100)
    conformity_index: float = Field(..., description="Conformity Index (CI)", ge=0.01, le=3.0)
    gradient_index: float = Field(..., description="Gradient Index (GI)", ge=0.01, le=10.0)
    max_dose: int = Field(..., description="Maximum dose (%)", ge=110, le=150)

class SRSData(BaseModel):
    """SRS/SRT specific treatment data."""
    lesions: List[SRSLesionData] = Field(..., description="List of lesions to treat", min_items=1)
    mri_sequence: str = Field(default="T1-weighted, post Gd contrast", description="MRI sequence type")
    planning_system: str = Field(default="BrainLAB Elements", description="Treatment planning system")
    accelerator: str = Field(default="Versa HD", description="Linear accelerator")
    tracking_system: str = Field(default="ExacTrac", description="Patient tracking system")
    immobilization_device: str = Field(default="rigid aquaplast head mask", description="Immobilization device")
    ct_slice_thickness: float = Field(default=1.25, description="CT slice thickness in mm")
    ct_localization: bool = Field(default=True, description="Whether CT localization was performed")

class SRSGenerateRequest(BaseModel):
    """Request model for generating SRS write-up."""
    common_info: CommonInfo
    srs_data: SRSData

class SRSGenerateResponse(BaseModel):
    """Response model for SRS write-up generation."""
    writeup: str = Field(..., description="Generated SRS consultation write-up")

