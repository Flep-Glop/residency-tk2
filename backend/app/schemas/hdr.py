from pydantic import BaseModel, Field
from app.schemas.common import CommonInfo

class HDRData(BaseModel):
    """HDR brachytherapy specific treatment data."""
    applicator_type: str = Field(..., description="Type of HDR applicator used")
    treatment_site: str = Field(default="gynecological", description="Treatment site (gynecological or prostate)")
    number_of_channels: int = Field(..., description="Number of treatment channels", ge=1)

    # Facility defaults (populated from clinic profile)
    afterloader: str = Field(default="ELEKTA Ir-192 remote afterloader", description="HDR afterloader unit")
    planning_system: str = Field(default="Oncentra", description="Brachytherapy planning system")
    ct_slice_thickness: float = Field(default=3.0, description="CT slice thickness in mm for HDR planning")

class HDRGenerateRequest(BaseModel):
    """Request model for generating HDR write-up."""
    common_info: CommonInfo
    hdr_data: HDRData

class HDRGenerateResponse(BaseModel):
    """Response model for HDR write-up generation."""
    writeup: str = Field(..., description="Generated HDR consultation write-up")

