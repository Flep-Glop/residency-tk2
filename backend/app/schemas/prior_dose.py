from pydantic import BaseModel, Field
from typing import List, Optional
from .common import CommonInfo

class PriorTreatment(BaseModel):
    """Schema for a prior radiation treatment."""
    site: str = Field(default="", description="Treatment site (e.g., brain, prostate, thorax)")
    custom_site: str = Field(default="", description="Custom treatment site name if not in standard list")
    dose: Optional[float] = Field(None, description="Dose in Gy (optional if dicoms_unavailable)")
    fractions: Optional[int] = Field(None, description="Number of fractions (optional if dicoms_unavailable)")
    month: Optional[str] = Field(None, description="Treatment month (optional if dicoms_unavailable)")
    year: Optional[int] = Field(None, description="Treatment year (optional if dicoms_unavailable)")
    spine_location: Optional[str] = Field(None, description="Specific spine location if site is spine")
    has_overlap: bool = Field(default=False, description="Whether this prior treatment has overlap with current treatment")
    dicoms_unavailable: bool = Field(default=False, description="Whether DICOM files are unavailable for this treatment")

class DoseStatistic(BaseModel):
    """Schema for a dose constraint statistic."""
    structure: str = Field(default="", description="Anatomical structure name")
    constraint_type: str = Field(default="", description="Type of constraint (e.g., Max dose, V20Gy)")
    value: str = Field(default="", description="Measured value with units")
    source: str = Field(default="", description="Reference source (QUANTEC, Timmerman, etc.)")
    unit: str = Field(default="", description="Unit of measurement (Gy, %, etc.)")
    limit: str = Field(default="", description="Constraint limit guideline")
    region: str = Field(default="", description="Anatomical region for grouping (Brain, Spine, Thorax, etc.)")

class PriorDoseData(BaseModel):
    """Schema for prior dose module-specific data."""
    current_site: str = Field(default="", description="Current treatment site")
    custom_current_site: str = Field(default="", description="Custom current treatment site name if not in standard list")
    current_dose: float = Field(..., description="Current dose in Gy")
    current_fractions: int = Field(..., description="Current number of fractions")
    current_month: str = Field(..., description="Current treatment month")
    current_year: int = Field(..., description="Current treatment year")
    spine_location: Optional[str] = Field(None, description="Current spine location if applicable")
    prior_treatments: List[PriorTreatment] = Field(default=[], description="List of prior treatments")
    dose_calc_method: Optional[str] = Field(default="EQD2 (Equivalent Dose in 2 Gy fractions)", description="Dose calculation method (optional if all priors lack DICOMs)")
    critical_structures: List[str] = Field(default=[], description="List of critical structures to evaluate")
    dose_statistics: List[DoseStatistic] = Field(default=[], description="List of dose constraint statistics")

class PriorDoseRequest(BaseModel):
    """Schema for prior dose write-up request."""
    common_info: CommonInfo
    prior_dose_data: PriorDoseData
    
class PriorDoseResponse(BaseModel):
    """Schema for prior dose write-up response."""
    writeup: str = Field(..., description="Generated prior dose write-up text")