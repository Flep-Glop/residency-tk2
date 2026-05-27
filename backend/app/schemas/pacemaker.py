from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional
from .common import CommonInfo

class PacemakerData(BaseModel):
    """Schema for pacemaker module data matching frontend form structure."""
    # Treatment information
    treatment_site: str = Field(..., example="thorax", description="Treatment site")
    dose: float = Field(..., example=45.0, description="Prescription dose in Gy")
    fractions: int = Field(..., example=15, description="Number of fractions")
    field_distance: str = Field(..., example="More than 10 cm from treatment field edge", description="Distance from treatment field to CIED")
    neutron_producing: str = Field(..., example="No", description="Is this a neutron-producing therapy? (Yes/No)")
    
    # Device information
    device_vendor: str = Field(..., example="Medtronic", description="Device vendor/manufacturer")
    device_model: str = Field("", example="Azure", description="Device model")
    device_serial: str = Field("", example="ABC123456", description="Device serial number")
    pacing_dependent: str = Field(..., example="No", description="Is patient pacing dependent? (Yes/No/Unknown)")
    
    # Dosimetry information
    tps_max_dose: float = Field(..., example=0.5, description="TPS calculated maximum dose to device in Gy")
    osld_mean_dose: float = Field(0.0, example=0.15, description="Diode measured mean dose in Gy")
    
    # Risk assessment (calculated by frontend/backend)
    risk_level: Optional[str] = Field(None, example="Low", description="Calculated risk level (Low/Medium/High)")

    @validator('fractions')
    def fractions_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Fractions must be a positive integer')
        return v
    
    @validator('dose')
    def dose_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('Dose must be positive')
        return v
    
    @validator('tps_max_dose')
    def tps_max_dose_must_be_non_negative(cls, v):
        if v < 0:
            raise ValueError('TPS max dose must be non-negative')
        return v
    
    @validator('osld_mean_dose')
    def osld_mean_dose_must_be_non_negative(cls, v):
        if v < 0:
            raise ValueError('OSLD mean dose must be non-negative')
        return v

class PacemakerGenerateRequest(BaseModel):
    """Request schema for generating pacemaker write-up."""
    common_info: CommonInfo
    pacemaker_data: PacemakerData
    additional_data: Dict[str, Any] = Field(default_factory=dict)

class PacemakerGenerateResponse(BaseModel):
    """Response schema for pacemaker write-up generation."""
    writeup: str = Field(..., example="Dr. Smith requested a medical physics consultation...")

class PacemakerRiskAssessmentRequest(BaseModel):
    """Request schema for risk assessment calculation."""
    pacing_dependent: str = Field(..., example="No", description="Is patient pacing dependent? (Yes/No/Unknown)")
    field_distance: str = Field(..., example="More than 10 cm from treatment field edge", description="Distance from field to CIED")
    neutron_producing: str = Field(..., example="No", description="Is this neutron-producing therapy? (Yes/No)")
    tps_max_dose: float = Field(..., example=0.5, description="TPS maximum dose to device in Gy")

    @validator('tps_max_dose')
    def tps_max_dose_must_be_non_negative(cls, v):
        if v < 0:
            raise ValueError('TPS max dose must be non-negative')
        return v

class PacemakerRiskAssessmentResponse(BaseModel):
    """Response schema for risk assessment."""
    risk_level: str = Field(..., example="Low", description="Calculated risk level")
    dose_category: str = Field(..., example="< 2 Gy", description="Dose category")
    recommendations: List[str] = Field(..., example=["Defibrillator available during treatment"], description="Clinical recommendations")
    is_high_risk_warning: bool = Field(..., example=False, description="Whether this requires special attention")

class DeviceInfo(BaseModel):
    """Device information for dropdowns and validation."""
    vendors: List[str] = Field(..., description="Available device vendors")
    models_by_vendor: Dict[str, List[str]] = Field(..., description="Device models organized by vendor")

class TreatmentSiteInfo(BaseModel):
    """Treatment site information."""
    treatment_sites: List[str] = Field(..., description="Available treatment sites")
    distance_options: List[str] = Field(..., description="Available distance options")