from pydantic import BaseModel, Field
from typing import Optional
from .common import CommonInfo

class DIBHData(BaseModel):
    """Schema for DIBH module-specific data."""
    treatment_site: str = Field(..., description="The treatment site (e.g., left breast, right breast)")
    custom_treatment_site: Optional[str] = Field(None, description="Custom treatment site name if not using a predefined site")
    immobilization_device: Optional[str] = Field(None, description="The immobilization device used (auto-assigned based on treatment site)")
    dose: float = Field(..., gt=0, description="Prescription dose in Gy")
    fractions: int = Field(..., gt=0, description="Number of treatment fractions")
    dose_per_fraction: Optional[float] = Field(None, description="Calculated dose per fraction")

class DIBHRequest(BaseModel):
    """Schema for DIBH write-up request."""
    common_info: CommonInfo
    dibh_data: DIBHData
    
class DIBHResponse(BaseModel):
    """Schema for DIBH write-up response."""
    writeup: str = Field(..., description="Generated DIBH write-up text") 