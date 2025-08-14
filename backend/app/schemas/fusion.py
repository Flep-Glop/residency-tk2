from pydantic import BaseModel, Field
from typing import List, Optional
from .common import CommonInfo

class Registration(BaseModel):
    """Schema for an image registration pair."""
    primary: str = Field(..., description="Primary image modality (usually CT)")
    secondary: str = Field(..., description="Secondary image modality")
    method: str = Field(..., description="Registration method (Rigid or Deformable)")

class FusionData(BaseModel):
    """Schema for fusion module-specific data."""
    lesion: str = Field(..., description="The type of lesion or anatomical structure")
    custom_lesion: Optional[str] = Field(None, description="Custom lesion name if not using a predefined lesion")
    anatomical_region: str = Field(..., description="The anatomical region (e.g., head and neck, brain, thoracic)")
    registrations: List[Registration] = Field(default=[], description="List of image registrations")
    is_bladder_filling_study: bool = Field(default=False, description="Whether this is a full/empty bladder study")
    immobilization_device: Optional[str] = Field(None, description="Immobilization device used for bladder filling study")

class FusionRequest(BaseModel):
    """Schema for fusion write-up request."""
    common_info: CommonInfo
    fusion_data: FusionData
    
class FusionResponse(BaseModel):
    """Schema for fusion write-up response."""
    writeup: str = Field(..., description="Generated fusion write-up text") 