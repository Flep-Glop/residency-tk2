from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class PersonInfo(BaseModel):
    name: str = Field(..., example="Smith")
    role: str = Field(..., example="physician")

class PatientInfo(BaseModel):
    age: str = Field(..., example="65")
    sex: str = Field(..., example="male")

class CommonInfo(BaseModel):
    physician: PersonInfo
    physicist: PersonInfo
    patient: PatientInfo

class SBRTData(BaseModel):
    treatment_site: str = Field(..., example="Lung")
    dose: float = Field(..., example=50.0)
    fractions: int = Field(..., example=5)
    lesion_size: Optional[str] = Field(None, example="2.5 cm")
    is_custom_lesion: Optional[bool] = Field(default=False)
    custom_lesion_description: Optional[str] = Field(None, example="soft tissue sarcoma, right thigh, anterior compartment")
    motion_management: Optional[str] = Field(None, example="abdominal compression")
    dose_constraints_met: Optional[bool] = Field(True, example=True)

class SBRTGenerateRequest(BaseModel):
    common_info: CommonInfo
    sbrt_data: SBRTData
    additional_data: Dict[str, Any] = Field(default_factory=dict)

class SBRTGenerateResponse(BaseModel):
    writeup: str = Field(..., example="This is a generated SBRT write-up...")

class SBRTValidateRequest(BaseModel):
    site: str = Field(..., example="Spine")
    dose: float = Field(..., example=30.0)
    fractions: int = Field(..., example=3)

class SBRTValidateResponse(BaseModel):
    is_valid: bool = Field(..., example=True)
    message: str = Field(default="Validation successful")
    constraints_met: List[str] = Field(default_factory=list)
    constraints_violated: List[Dict[str, Any]] = Field(default_factory=list)

# Placeholder for treatment site details if needed later
# class SBRTTreatmentSiteInfo(BaseModel):
#     name: str
#     available_fx_schemes: List[Dict[str, Any]]
#     dose_constraints: Dict[str, Any]

# You might also want schemas for what /treatment-sites, /dose-constraints, 
# and /fractionation-schemes return if they are more complex than simple lists/dicts.
# For now, assuming they return List[str] or Dict[str, Any] which FastAPI can handle. 