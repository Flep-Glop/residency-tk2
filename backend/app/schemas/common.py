from pydantic import BaseModel, Field
from typing import Optional, List, Dict

class PersonInfo(BaseModel):
    """Schema for representing a staff member."""
    name: str = Field(..., description="The name of the person")
    role: str = Field("", description="The role of the person (e.g., physician, physicist)")

class PatientInfo(BaseModel):
    """Schema for representing patient information."""
    age: int = Field(..., gt=0, lt=120, description="Patient age (1-120)")
    sex: str = Field(..., description="Patient sex")
    details: Optional[str] = Field(None, description="Additional patient details")
    
    def get_description(self) -> str:
        """Generate a standardized patient description string."""
        return f"a {self.age}-year-old {self.sex}"

class CommonInfo(BaseModel):
    """Schema for common information shared across all write-up types."""
    physician: PersonInfo
    physicist: PersonInfo
    patient: PatientInfo 