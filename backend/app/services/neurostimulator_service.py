from app.schemas.neurostimulator_schemas import (
    NeurostimulatorGenerateRequest, NeurostimulatorGenerateResponse,
    NeurostimulatorRiskAssessmentRequest, NeurostimulatorRiskAssessmentResponse,
    NeurostimulatorDeviceInfo, NeurostimulatorTreatmentSiteInfo
)
from typing import List, Dict, Any

class NeurostimulatorService:
    """Service class for neurostimulator management functionality."""
    
    def __init__(self):
        """Initialize the neurostimulator service with device and treatment data."""
        
        # Treatment sites - same as pacemaker since these devices can be near any treatment
        self.treatment_sites = [
            "brain", "head and neck", "thorax", "breast", "lung", 
            "liver", "pancreas", "abdomen", "pelvis", "prostate", 
            "endometrium", "cervix", "rectum", "spine", "extremity"
        ]
        
        # Neurostimulator device types
        self.device_types = [
            "Spinal Cord Stimulator (SCS)",
            "Deep Brain Stimulator (DBS)",
            "Vagus Nerve Stimulator (VNS)",
            "Sacral Nerve Stimulator (SNS)",
            "Peripheral Nerve Stimulator (PNS)",
            "Occipital Nerve Stimulator (ONS)",
            "Gastric Electrical Stimulator (GES)",
            "Other Neurostimulator"
        ]
        
        # Device vendors for neurostimulators
        self.device_vendors = [
            "Medtronic Neuromodulation",
            "Boston Scientific Neuromodulation", 
            "Abbott Neuromodulation",
            "Nevro",
            "Nuvectra",
            "Stimwave",
            "Axonics"
        ]
        
        # Device models by vendor
        self.device_models = {
            "Medtronic Neuromodulation": [
                "Intellis", "Vanta", "Percept PC", "Activa PC", "Activa RC", 
                "InterStim II", "InterStim Micro", "Enterra II"
            ],
            "Boston Scientific Neuromodulation": [
                "WaveWriter Alpha", "Spectra WaveWriter", "Precision Montage", 
                "Precision Spectra", "Vercise Genus"
            ],
            "Abbott Neuromodulation": [
                "Proclaim XR", "Proclaim Plus", "Infinity", "Prodigy", 
                "Eon Mini", "Brio"
            ],
            "Nevro": [
                "Senza", "Senza II", "Senza Omnia"
            ],
            "Nuvectra": [
                "Algovita"
            ],
            "Stimwave": [
                "Freedom SCS", "Freedom-4A"
            ],
            "Axonics": [
                "Axonics r-SNM", "Axonics F15"
            ]
        }
        
        # Distance options - similar to pacemaker but with neurostimulator terminology
        self.distance_options = [
            "More than 10 cm from treatment field edge",
            "Less than 10 cm from field edge but not in direct field",
            "Within 3 cm of field edge",
            "Neurostimulator in direct beam"
        ]
    
    def get_treatment_sites(self) -> List[str]:
        """Get available treatment sites for neurostimulator cases."""
        return sorted(self.treatment_sites)
    
    def get_device_types(self) -> List[str]:
        """Get available neurostimulator device types."""
        return self.device_types
    
    def get_device_info(self) -> NeurostimulatorDeviceInfo:
        """Get device vendor and model information."""
        return NeurostimulatorDeviceInfo(
            vendors=self.device_vendors,
            models_by_vendor=self.device_models,
            device_types=self.device_types
        )
    
    def get_treatment_site_info(self) -> NeurostimulatorTreatmentSiteInfo:
        """Get treatment site and distance option information."""
        return NeurostimulatorTreatmentSiteInfo(
            treatment_sites=sorted(self.treatment_sites),
            distance_options=self.distance_options
        )
    
    def calculate_risk_assessment(self, request: NeurostimulatorRiskAssessmentRequest) -> NeurostimulatorRiskAssessmentResponse:
        """
        Calculate risk level for neurostimulator devices.
        
        Unlike cardiac devices (TG-203), neurostimulators don't have pacing dependency concerns.
        Risk is primarily based on dose to the device and neutron-producing therapy.
        
        Risk stratification for neurostimulators:
        - HIGH RISK: Dose > 5 Gy (device damage threshold) OR neutron-producing therapy
        - MEDIUM RISK: Dose 2-5 Gy (potential programming reset)
        - LOW RISK: Dose < 2 Gy
        """
        neutron_producing = request.neutron_producing.lower() == "yes"
        tps_max_dose = request.tps_max_dose
        
        # Calculate estimated max dose based on field distance if TPS dose is 0
        estimated_max_dose = tps_max_dose
        if tps_max_dose == 0.0:
            if "More than 10 cm" in request.field_distance:
                estimated_max_dose = 0.5  # Estimated < 2 Gy
            elif "Less than 10 cm" in request.field_distance:
                estimated_max_dose = 1.5  # Estimated < 2 Gy
            elif "Within 3 cm" in request.field_distance:
                estimated_max_dose = 3.0  # Estimated 2-5 Gy
            elif "direct beam" in request.field_distance.lower():
                estimated_max_dose = 7.0  # Estimated > 5 Gy
        
        # Determine dose category
        if estimated_max_dose < 2.0:
            dose_category = "< 2 Gy"
        elif 2.0 <= estimated_max_dose <= 5.0:
            dose_category = "2-5 Gy"
        else:
            dose_category = "> 5 Gy"
        
        # Calculate risk level
        risk_level = self._calculate_risk_level(dose_category, neutron_producing)
        
        # Generate recommendations based on risk level
        recommendations = self._get_recommendations(risk_level)
        
        return NeurostimulatorRiskAssessmentResponse(
            risk_level=risk_level,
            dose_category=dose_category,
            recommendations=recommendations,
            is_high_risk_warning=(risk_level == "High")
        )
    
    def _calculate_risk_level(self, dose_category: str, neutron_producing: bool) -> str:
        """
        Calculate the risk level for neurostimulator devices.
        
        Neurostimulator risk assessment is simpler than CIED (no pacing dependency):
        - HIGH RISK: Dose > 5 Gy OR neutron-producing therapy
        - MEDIUM RISK: Dose 2-5 Gy
        - LOW RISK: Dose < 2 Gy
        """
        # HIGH RISK: Dose > 5 Gy is always high risk
        if dose_category == "> 5 Gy":
            return "High"
        
        # HIGH RISK: Neutron-producing therapy (can cause permanent device damage)
        if neutron_producing:
            return "High"
        
        # MEDIUM RISK: Dose 2-5 Gy (potential programming issues)
        if dose_category == "2-5 Gy":
            return "Medium"
        
        # LOW RISK: Dose < 2 Gy
        return "Low"
    
    def _get_recommendations(self, risk_level: str) -> List[str]:
        """Get clinical recommendations based on risk level."""
        base_recommendations = [
            "Device interrogation before treatment",
            "Patient should have device programmer contact information available"
        ]
        
        if risk_level == "Low":
            return base_recommendations + [
                "Device interrogation after completion of treatment course"
            ]
        elif risk_level == "Medium":
            return base_recommendations + [
                "Device interrogation at mid-treatment and after completion",
                "Patient should monitor for changes in stimulation sensation",
                "Notify device manufacturer of radiation treatment"
            ]
        else:  # High risk
            return base_recommendations + [
                "Device interrogation before and after each fraction",
                "Notify device manufacturer and neurology team",
                "Consider treatment modification to reduce dose to device",
                "Patient should monitor for changes in stimulation or device function"
            ]
    
    def generate_neurostimulator_writeup(self, request: NeurostimulatorGenerateRequest) -> NeurostimulatorGenerateResponse:
        """
        Generate a neurostimulator write-up based on the provided data.
        """
        common_info = request.common_info
        neurostim_data = request.neurostimulator_data
        
        # Extract common information
        physician = common_info.physician.name
        physicist = common_info.physicist.name
        
        # Extract neurostimulator data
        treatment_site = neurostim_data.treatment_site
        dose = neurostim_data.dose
        fractions = neurostim_data.fractions
        device_vendor = neurostim_data.device_vendor
        device_model = neurostim_data.device_model
        device_type = neurostim_data.device_type
        tps_max_dose = neurostim_data.tps_max_dose
        osld_mean_dose = neurostim_data.osld_mean_dose
        
        # Calculate risk level
        risk_request = NeurostimulatorRiskAssessmentRequest(
            field_distance=neurostim_data.field_distance,
            neutron_producing=neurostim_data.neutron_producing,
            tps_max_dose=tps_max_dose
        )
        risk_assessment = self.calculate_risk_assessment(risk_request)
        risk_level = risk_assessment.risk_level
        
        # Block high risk cases from generating writeup
        if risk_level == "High":
            raise ValueError("HIGH RISK case detected. Consult with neurology and device manufacturer before proceeding. No writeup will be generated for high risk cases.")
        
        # Format device information
        if device_model:
            device_description = f"{device_vendor} {device_model} {device_type.lower()}"
        else:
            device_description = f"{device_vendor} {device_type.lower()}"
        
        # Build the write-up
        write_up = f"Dr. {physician} requested a medical physics consultation for ---. The patient is undergoing radiation treatment to their {treatment_site} at a dose of {dose} Gy in {fractions} fractions. "
        write_up += f"The patient has an implanted {device_description}.\n\n"
        
        write_up += "The treatment plan was designed with consideration for the presence of the neurostimulator device. "
        
        # Field intercept statement - conditional based on field distance
        field_distance = neurostim_data.field_distance
        if "direct beam" in field_distance.lower():
            write_up += "The neurostimulator is located within the direct treatment beam. "
        else:
            write_up += "No primary radiation fields intercept the neurostimulator. "
        
        write_up += "The device was contoured in the treatment planning system. "
        write_up += f"The maximum dose to the device was {tps_max_dose} Gy"
        
        # Conditional dose comparison
        if tps_max_dose < 2.0:
            write_up += ", which is below the threshold for neurostimulator programming concerns (2 Gy). "
        elif tps_max_dose <= 5.0:
            write_up += ", which is within the range where programming changes may occur (2-5 Gy). "
        else:
            write_up += ", which exceeds the safe dose threshold for neurostimulator devices (5 Gy). "
        
        write_up += "\n\n"
        
        write_up += "Radiation exposure to neurostimulator devices can potentially cause programming changes or device malfunction. "
        
        # Risk-level specific content
        if risk_level == "Low":
            write_up += f"Our dosimetry analysis puts this patient at a {risk_level.lower()} risk for any radiation-induced device complications. "
            write_up += "The patient had their device interrogated before the start of treatment. "
            write_up += "A follow-up device interrogation will be performed after completion of the treatment course."
        elif risk_level == "Medium":
            write_up += f"Our dosimetry analysis puts this patient at a {risk_level.lower()} risk for radiation-induced device complications. "
            write_up += "The patient had their device interrogated before the start of treatment. "
            write_up += "The device will be interrogated at mid-treatment and again after completion of the course. "
            write_up += "The patient has been instructed to monitor for any changes in stimulation sensation and report them immediately."
        
        # Diode measurements
        if osld_mean_dose > 0:
            write_up += "\n\nDiode measurements were taken to record "
            write_up += f"the radiation dose to the device. The average dose received by these measurements was {osld_mean_dose} Gy, "
            total_dose = osld_mean_dose * fractions
            write_up += f"resulting in a total dose of {total_dose:.2f} Gy from the {fractions}-fraction treatment."
        
        # Final approval
        write_up += f"\n\nThis was reviewed by the prescribing radiation oncologist, Dr. {physician}, and the medical physicist, Dr. {physicist}."
        
        return NeurostimulatorGenerateResponse(writeup=write_up)

