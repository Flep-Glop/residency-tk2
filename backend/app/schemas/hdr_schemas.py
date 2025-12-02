from pydantic import BaseModel, Field
from app.schemas.common import CommonInfo

class HDRData(BaseModel):
    """HDR brachytherapy specific treatment data."""
    applicator_type: str = Field(..., description="Type of HDR applicator used")
    treatment_site: str = Field(default="gynecological", description="Treatment site (gynecological or prostate)")
    number_of_channels: int = Field(..., description="Number of treatment channels", ge=1)

class HDRGenerateRequest(BaseModel):
    """Request model for generating HDR write-up."""
    common_info: CommonInfo
    hdr_data: HDRData

class HDRGenerateResponse(BaseModel):
    """Response model for HDR write-up generation."""
    writeup: str = Field(..., description="Generated HDR consultation write-up")

