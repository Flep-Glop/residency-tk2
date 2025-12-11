from app.schemas.pacemaker_schemas import (
    PacemakerGenerateRequest, PacemakerGenerateResponse,
    PacemakerRiskAssessmentRequest, PacemakerRiskAssessmentResponse,
    DeviceInfo, TreatmentSiteInfo
)
from typing import List, Dict, Any

class PacemakerService:
    """Service class for pacemaker/CIED management functionality."""
    
    def __init__(self):
        """Initialize the pacemaker service with data from the original module."""
        
        # Treatment sites from original module
        self.treatment_sites = [
            "brain", "head and neck", "thorax", "breast", "lung", 
            "liver", "pancreas", "abdomen", "pelvis", "prostate", 
            "endometrium", "cervix", "rectum", "spine", "extremity"
        ]
        
        # Device vendors from original module
        self.device_vendors = [
            "Medtronic", "Boston Scientific", "Abbott/St. Jude Medical", 
            "Biotronik", "MicroPort", "ZOLL"
        ]
        
        # Device models by vendor from original module
        self.device_models = {
            "Medtronic": ["Advisa", "Azure", "Consulta", "Ensura", "Evera", "Micra", "Percepta", "Visia"],
            "Boston Scientific": ["Essentio", "Formio", "Ingenio", "Momentum", "Resonate", "Valitude", "Vigilant"],
            "Abbott/St. Jude Medical": ["Accent", "Allure", "Assurity", "Ellipse", "Endurity", "Fortify", "Quadra"],
            "Biotronik": ["Acticor", "Edora", "Enitra", "Evia", "Ilesto", "Iperia", "Rivacor"],
            "MicroPort": ["Eno", "Esprit", "Philos", "Phymos", "Placed", "Rapido"],
            "ZOLL": ["ZOLL LifeVest", "ZOLL CRM"]
        }
        
        # Distance options from original module
        self.distance_options = [
            "More than 10 cm from treatment field edge",
            "Less than 10 cm from field edge but not in direct field",
            "Within 3 cm of field edge",
            "CIED in direct beam"
        ]
    
    def get_treatment_sites(self) -> List[str]:
        """Get available treatment sites for pacemaker cases."""
        return sorted(self.treatment_sites)
    
    def get_device_info(self) -> DeviceInfo:
        """Get device vendor and model information."""
        return DeviceInfo(
            vendors=self.device_vendors,
            models_by_vendor=self.device_models
        )
    
    def get_treatment_site_info(self) -> TreatmentSiteInfo:
        """Get treatment site and distance option information."""
        return TreatmentSiteInfo(
            treatment_sites=sorted(self.treatment_sites),
            distance_options=self.distance_options
        )
    
    def calculate_risk_assessment(self, request: PacemakerRiskAssessmentRequest) -> PacemakerRiskAssessmentResponse:
        """
        Calculate risk level based on TG-203 guidelines.
        
        This implements the risk assessment algorithm from the original module.
        """
        pacing_dependent = request.pacing_dependent.lower() == "yes"
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
            elif "direct beam" in request.field_distance:
                estimated_max_dose = 7.0  # Estimated > 5 Gy
        
        # Determine dose category
        if estimated_max_dose < 2.0:
            dose_category = "< 2 Gy"
        elif 2.0 <= estimated_max_dose <= 5.0:
            dose_category = "2-5 Gy"
        else:
            dose_category = "> 5 Gy"
        
        # Calculate risk level based on TG-203 algorithm
        risk_level = self._calculate_risk_level(pacing_dependent, dose_category, neutron_producing)
        
        # Generate recommendations based on risk level
        recommendations = self._get_recommendations(risk_level)
        
        return PacemakerRiskAssessmentResponse(
            risk_level=risk_level,
            dose_category=dose_category,
            recommendations=recommendations,
            is_high_risk_warning=(risk_level == "High")
        )
    
    def _calculate_risk_level(self, is_pacing_dependent: bool, dose_category: str, neutron_producing: bool) -> str:
        """
        Calculate the risk level based on the TG-203 algorithm.
        
        Per TG-203 AAPM Report 203:
        - HIGH RISK: Dose > 5 Gy (regardless of pacing status) OR neutron-producing therapy
        - MEDIUM RISK: Dose 2-5 Gy OR pacing-dependent with dose < 2 Gy
        - LOW RISK: Pacing-independent AND dose < 2 Gy
        """
        # HIGH RISK: Dose > 5 Gy is always high risk (critical correction)
        if dose_category == "> 5 Gy":
            return "High"
        
        # HIGH RISK: Neutron-producing therapy
        if neutron_producing:
            return "High"
        
        # For doses 0-5 Gy, non-neutron therapy:
        # LOW RISK: Pacing-independent AND dose < 2 Gy
        if not is_pacing_dependent and dose_category == "< 2 Gy":
            return "Low"
        
        # MEDIUM RISK: Everything else in 0-5 Gy range
        # - Dose 2-5 Gy (any pacing status)
        # - Pacing-dependent with dose < 2 Gy
        return "Medium"
    
    def _get_recommendations(self, risk_level: str) -> List[str]:
        """Get clinical recommendations based on risk level."""
        base_recommendations = [
            "Defibrillator available during treatment",
            "Heart rate monitor during treatment"
        ]
        
        if risk_level == "Low":
            return base_recommendations + [
                "Device interrogation before treatment"
            ]
        elif risk_level == "Medium":
            return base_recommendations + [
                "Device interrogation before, during, and after treatment"
            ]
        else:  # High risk
            return base_recommendations + [
                "Device interrogation before and after each fraction",
                "Cardiologist on standby during treatment",
                "Consider treatment modification to reduce risk"
            ]
    
    def generate_pacemaker_writeup(self, request: PacemakerGenerateRequest) -> PacemakerGenerateResponse:
        """
        Generate a pacemaker write-up based on the provided data.
        
        This ports the write-up generation logic from the original module.
        """
        common_info = request.common_info
        pacemaker_data = request.pacemaker_data
        
        # Extract common information
        physician = common_info.physician.name
        physicist = common_info.physicist.name
        
        # Extract pacemaker data
        treatment_site = pacemaker_data.treatment_site
        dose = pacemaker_data.dose
        fractions = pacemaker_data.fractions
        device_vendor = pacemaker_data.device_vendor
        device_model = pacemaker_data.device_model
        device_serial = pacemaker_data.device_serial
        pacing_dependent = pacemaker_data.pacing_dependent
        tps_max_dose = pacemaker_data.tps_max_dose
        osld_mean_dose = pacemaker_data.osld_mean_dose
        
        # Calculate risk level if not provided (critical for accurate writeup)
        if pacemaker_data.risk_level:
            risk_level = pacemaker_data.risk_level
        else:
            # Calculate risk using TG-203 algorithm
            from app.schemas.pacemaker_schemas import PacemakerRiskAssessmentRequest
            risk_request = PacemakerRiskAssessmentRequest(
                pacing_dependent=pacing_dependent,
                field_distance=pacemaker_data.field_distance,
                neutron_producing=pacemaker_data.neutron_producing,
                tps_max_dose=tps_max_dose
            )
            risk_assessment = self.calculate_risk_assessment(risk_request)
            risk_level = risk_assessment.risk_level
        
        # Format device information
        if device_model:
            model_text = f"model number {device_model}"
            model_unknown = False
        else:
            model_text = "implanted cardiac device"
            model_unknown = True
        
        serial_text = f"serial number {device_serial}" if device_serial else ""
        if model_text and serial_text:
            device_info = f"{model_text}, {serial_text},"
        elif model_text:
            device_info = f"{model_text},"
        elif serial_text:
            device_info = f"{serial_text},"
        else:
            device_info = ""
        
        # Determine correct article (a vs an) based on device_info
        article = "an" if device_info.startswith("implanted") else "a"
        
        # Format pacing dependent information
        if pacing_dependent == "Yes":
            pacing_text = "It is noted that they are pacing dependent."
        elif pacing_dependent == "No":
            pacing_text = "It is noted that they are not pacing dependent."
        else:
            pacing_text = ""
        
        # Use the clinical template structure
        write_up = f"Dr. {physician} requested a medical physics consultation for ---. The patient is undergoing radiation treatment to their {treatment_site} at a dose of {dose} Gy in {fractions} fractions. "
        write_up += f"The patient has {article} {device_info} from {device_vendor}. {pacing_text}\n\n"
        
        write_up += "Our treatment plan follows the guidelines of the manufacturer for radiation therapy. "
        
        # Field intercept statement - conditional based on field distance (CRITICAL SAFETY)
        field_distance = pacemaker_data.field_distance
        if "direct beam" in field_distance.lower():
            write_up += "The CIED is located within the direct treatment beam. "
        else:
            write_up += "No primary radiation fields intercept the pacemaker. "
        
        write_up += "The device was contoured in the treatment planning system. "
        write_up += f"The maximum dose to the device was {tps_max_dose} Gy"
        
        # Conditional dose comparison based on actual dose value
        if tps_max_dose < 2.0:
            write_up += ", which is well below the AAPM recommended total dose of 2 Gy. "
        elif tps_max_dose == 2.0:
            write_up += ", which meets the AAPM recommended total dose limit of 2 Gy. "
        else:
            write_up += ", which exceeds the AAPM recommended total dose of 2 Gy. "
        
        # Unknown model documentation (TG-203 recommendation)
        if model_unknown:
            write_up += "The specific device model was not available at the time of planning. "
            write_up += "Manufacturer-specific recommendations could not be fully assessed. "
        else:
            write_up += "It is noted that no specific dose tolerance was provided by the manufacturer. "
        
        write_up += "\n\n"
        
        write_up += "One potential complication with any pacemaker is that radiation could induce an increased sensor rate. "
        
        # Risk-level specific content with TG-203 interrogation timing
        if risk_level == "Low":
            write_up += f"However, our dosimetry analysis puts this patient at a {risk_level.lower()} risk for any radiation induced cardiac complications. "
            write_up += "A defibrillator is always available during treatment in case of emergency. "
            write_up += "A heart rate monitor is then used to monitor for events that would require the defibrillator. "
            write_up += "The patient had their device interrogated before the start of treatment. "
            write_up += "Per TG-203 guidelines, a follow-up device interrogation will be performed within 6 months after treatment completion."
        elif risk_level == "Medium":
            write_up += f"However, our dosimetry analysis puts this patient at a {risk_level.lower()} risk for any radiation induced cardiac complications. "
            write_up += "A defibrillator is always available during treatment in case of emergency. "
            write_up += "A heart rate monitor is then used to monitor for events that would require the defibrillator. "
            write_up += "The patient had their device interrogated before the start of treatment. "
            write_up += "Per TG-203 guidelines, the device will be interrogated at mid-treatment and again after completion, "
            write_up += "with a follow-up interrogation within 1 month of treatment end."
        elif risk_level == "High":
            write_up += f"However, our dosimetry analysis puts this patient at a {risk_level.lower()} risk for any radiation induced cardiac complications. "
            write_up += "A defibrillator is always available during treatment in case of emergency. "
            write_up += "A heart rate monitor is then used to monitor for events that would require the defibrillator. "
            write_up += "Per TG-203 guidelines for high-risk cases, the device will be interrogated before each fraction "
            write_up += "and immediately after each treatment delivery. "
            write_up += "Due to the high risk nature of this case, a cardiologist will be on standby during treatment."
        
        # Diode measurements (replaced OSLD per clinical practice)
        if osld_mean_dose > 0:
            write_up += "\n\nDiode measurements were taken to record "
            write_up += f"the radiation dose to the device. The average dose received by these measurements was {osld_mean_dose} Gy, "
            total_dose = osld_mean_dose * fractions
            write_up += f"resulting in a total dose of {total_dose:.2f} Gy from the {fractions}-fraction treatment."
        
        # Final approval - matches template exactly
        write_up += f"\n\nThis was reviewed by the prescribing radiation oncologist, Dr. {physician}, and the medical physicist, Dr. {physicist}."
        
        return PacemakerGenerateResponse(writeup=write_up)