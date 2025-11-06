from pydantic import BaseModel, Field
from typing import Optional, List, Dict

class PersonInfo(BaseModel):
    """Schema for representing a staff member."""
    name: str = Field(..., description="The name of the person")
    role: str = Field("", description="The role of the person (e.g., physician, physicist)")

class CommonInfo(BaseModel):
    """Schema for common information shared across all write-up types."""
    physician: PersonInfo
    physicist: PersonInfo 