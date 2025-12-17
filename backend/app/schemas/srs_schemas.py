from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Literal
from app.schemas.common import CommonInfo


class SRSLesionData(BaseModel):
    """Data for a single SRS/SRT lesion."""
    site: str = Field(..., description="Brain region location (e.g., 'left frontal lobe', 'cerebellum')")
    volume: float = Field(..., description="Target volume in cc", gt=0)
    treatment_type: Literal["SRS", "SRT"] = Field(..., description="'SRS' for single fraction or 'SRT' for multiple fractions")
    dose: float = Field(..., description="Prescription dose in Gy", gt=0)
    fractions: int = Field(..., description="Number of fractions (1 for SRS, >=2 for SRT)", ge=1)
    prescription_isodose: float = Field(default=80.0, description="Prescription isodose level (%)", ge=50, le=100)
    ptv_coverage: float = Field(default=98.0, description="PTV coverage (%)", ge=80, le=100)
    conformity_index: float = Field(default=1.2, description="Conformity Index (CI)", ge=0.01, le=10.0)
    gradient_index: float = Field(default=3.0, description="Gradient Index (GI)", ge=0.01, le=20.0)
    max_dose: float = Field(default=125.0, description="Maximum dose (%)", ge=100, le=200)
    
    # Computed deviation fields (optional, set by service)
    ci_deviation: Optional[Literal["none", "minor", "major"]] = Field(default=None, description="CI deviation category")
    gi_deviation: Optional[Literal["none", "minor", "major"]] = Field(default=None, description="GI deviation category")
    
    def calculate_deviations(self) -> tuple[str, str]:
        """Calculate CI and GI deviations based on volume thresholds.
        
        Conformity Index thresholds:
        - Vol < 3cc: None if CI < 2, Minor if CI < 2.5, else Major
        - Vol 3-30cc: None if CI < 1.5, Minor if CI < 1.8, else Major
        - Vol > 30cc: None if CI < 1.2, Minor if CI < 1.5, else Major
        
        Gradient Index thresholds:
        - Vol < 2cc: None if GI < 5, Minor if GI < 7, else Major
        - Vol 2-10cc: None if GI < 3.5, Minor if GI < 5, else Major
        - Vol > 10cc: None if GI < 3, Minor if GI < 4, else Major
        """
        # CI deviation based on volume
        if self.volume < 3:
            if self.conformity_index < 2:
                ci_dev = "none"
            elif self.conformity_index < 2.5:
                ci_dev = "minor"
            else:
                ci_dev = "major"
        elif self.volume <= 30:
            if self.conformity_index < 1.5:
                ci_dev = "none"
            elif self.conformity_index < 1.8:
                ci_dev = "minor"
            else:
                ci_dev = "major"
        else:  # volume > 30cc
            if self.conformity_index < 1.2:
                ci_dev = "none"
            elif self.conformity_index < 1.5:
                ci_dev = "minor"
            else:
                ci_dev = "major"
        
        # GI deviation based on volume
        if self.volume < 2:
            if self.gradient_index < 5:
                gi_dev = "none"
            elif self.gradient_index < 7:
                gi_dev = "minor"
            else:
                gi_dev = "major"
        elif self.volume <= 10:
            if self.gradient_index < 3.5:
                gi_dev = "none"
            elif self.gradient_index < 5:
                gi_dev = "minor"
            else:
                gi_dev = "major"
        else:  # volume > 10cc
            if self.gradient_index < 3:
                gi_dev = "none"
            elif self.gradient_index < 4:
                gi_dev = "minor"
            else:
                gi_dev = "major"
        
        return ci_dev, gi_dev

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

