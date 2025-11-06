from pydantic import BaseModel, Field
from typing import Optional, List
from app.schemas.common import CommonInfo

class HDRData(BaseModel):
    """HDR brachytherapy specific treatment data."""
    applicator_type: str = Field(..., description="Type of HDR applicator used")
    treatment_site: str = Field(default="gynecological", description="Treatment site (gynecological or prostate)")
    patient_position: str = Field(..., description="Patient positioning during implant")
    implant_date: str = Field(..., description="Date of applicator implant (e.g., 'October 17' or 'XXXX')")
    ct_slice_thickness: float = Field(default=2.5, description="CT slice thickness in mm")
    number_of_channels: int = Field(..., description="Number of treatment channels", ge=1)
    afterloader: str = Field(default="ELEKTA Ir-192 remote afterloader", description="HDR afterloader unit")
    source_type: str = Field(default="Ir-192", description="Radioactive source type")
    planning_system: str = Field(default="Oncentra", description="Treatment planning system")
    critical_structures: List[str] = Field(
        default=["bladder", "rectum", "intestines", "sigmoid"],
        description="Critical structures contoured"
    )
    survey_reading: str = Field(default="0.2", description="Radiation survey reading threshold (mR/hr)")

class HDRGenerateRequest(BaseModel):
    """Request model for generating HDR write-up."""
    common_info: CommonInfo
    hdr_data: HDRData

class HDRGenerateResponse(BaseModel):
    """Response model for HDR write-up generation."""
    writeup: str = Field(..., description="Generated HDR consultation write-up")

