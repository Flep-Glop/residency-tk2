from pydantic import BaseModel, Field
from typing import List, Optional
from .common import CommonInfo

class PriorTreatment(BaseModel):
    """Schema for a prior radiation treatment."""
    site: str = Field(..., description="Treatment site (e.g., brain, prostate, thorax)")
    dose: float = Field(..., description="Dose in Gy")
    fractions: int = Field(..., description="Number of fractions")
    month: str = Field(..., description="Treatment month")
    year: int = Field(..., description="Treatment year")
    spine_location: Optional[str] = Field(None, description="Specific spine location if site is spine")
    has_overlap: bool = Field(default=False, description="Whether this prior treatment has overlap with current treatment")

class DoseStatistic(BaseModel):
    """Schema for a dose constraint statistic."""
    structure: str = Field(..., description="Anatomical structure name")
    constraint_type: str = Field(..., description="Type of constraint (e.g., Max dose, V20Gy)")
    value: str = Field(default="", description="Measured value with units")
    source: str = Field(..., description="Reference source (QUANTEC, Timmerman, etc.)")

class PriorDoseData(BaseModel):
    """Schema for prior dose module-specific data."""
    current_site: str = Field(..., description="Current treatment site")
    current_dose: float = Field(..., description="Current dose in Gy")
    current_fractions: int = Field(..., description="Current number of fractions")
    current_month: str = Field(..., description="Current treatment month")
    current_year: int = Field(..., description="Current treatment year")
    spine_location: Optional[str] = Field(None, description="Current spine location if applicable")
    prior_treatments: List[PriorTreatment] = Field(default=[], description="List of prior treatments")
    dose_calc_method: str = Field(default="EQD2 (Equivalent Dose in 2 Gy fractions)", description="Dose calculation method (Raw Dose, EQD2)")
    critical_structures: List[str] = Field(default=[], description="List of critical structures to evaluate")
    composite_dose_computed: bool = Field(default=False, description="Whether 3D composite dose was computed in Velocity")
    dose_statistics: List[DoseStatistic] = Field(default=[], description="List of dose constraint statistics")

class PriorDoseRequest(BaseModel):
    """Schema for prior dose write-up request."""
    common_info: CommonInfo
    prior_dose_data: PriorDoseData
    
class PriorDoseResponse(BaseModel):
    """Schema for prior dose write-up response."""
    writeup: str = Field(..., description="Generated prior dose write-up text")