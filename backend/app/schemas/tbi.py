from pydantic import BaseModel, Field
from typing import Optional
from app.schemas.common import CommonInfo

class TBIData(BaseModel):
    """TBI specific treatment data."""
    prescription_dose: float = Field(..., description="Total prescription dose in Gy", gt=0)
    fractions: int = Field(..., description="Number of fractions", ge=1)
    setup: str = Field(..., description="Beam setup: 'AP/PA' or 'Lateral'")
    lung_blocks: str = Field(..., description="Lung block thickness: 'none', '1 HVL', '2 HVL', or '3 HVL'")
    energy: str = Field(default="6 MV", description="Beam energy")
    dose_rate_range: str = Field(default="10 - 15 cGy/min", description="Dose delivery rate range")
    machine_dose_rate: str = Field(default="200 MU/min", description="Machine dose rate")

class TBIGenerateRequest(BaseModel):
    """Request model for generating TBI write-up."""
    common_info: CommonInfo
    tbi_data: TBIData

class TBIGenerateResponse(BaseModel):
    """Response model for TBI write-up generation."""
    writeup: str = Field(..., description="Generated TBI consultation write-up")

