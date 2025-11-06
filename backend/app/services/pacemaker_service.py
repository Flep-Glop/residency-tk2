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
        
        According to TG-203 flowchart:
        1. If dose > 5 Gy OR neutron producing therapy:
           - If pacing-independent patient AND dose on CIED < 2 Gy: LOW-RISK
           - Otherwise: MEDIUM-RISK (if not pacing dependent) or HIGH-RISK (if pacing dependent or both conditions)
        2. If dose 0-5 Gy:
           - If pacing-independent patient: LOW-RISK  
           - If pacing-dependent: depends on dose level (LOW for <2Gy, MEDIUM for 2-5Gy)
        """
        # Step 1: High risk conditions - neutron producing AND dose > 5 Gy
        if neutron_producing and dose_category == "> 5 Gy":
            return "High"
        
        # Step 2: If neutron producing OR dose > 5 Gy (but not both)
        if neutron_producing or dose_category == "> 5 Gy":
            # For pacing-independent patients with dose < 2 Gy, it's still Low risk per TG-203
            if not is_pacing_dependent and dose_category == "< 2 Gy":
                return "Low"
            # For pacing-dependent patients, it becomes High risk
            elif is_pacing_dependent:
                return "High"
            # For pacing-independent with higher doses, it's Medium risk
            else:
                return "Medium"
        
        # Step 3: For doses 0-5 Gy without neutron producing therapy
        # Per TG-203: "Pacing-independent patient and Dose on CIED < 2 Gy"
        if not is_pacing_dependent and dose_category == "< 2 Gy":
            # YES branch: Pacing-independent AND dose < 2 Gy → LOW-RISK
            return "Low"
        else:
            # NO branch: Pacing-dependent OR dose ≥ 2 Gy → goes to MEDIUM-RISK box
            # The MEDIUM-RISK box has its own logic based on formal consultation needs
            if dose_category == "< 2 Gy":
                # Pacing-dependent with dose < 2 Gy → MEDIUM-RISK (per flowchart NO branch)
                return "Medium"
            elif dose_category == "2-5 Gy":
                return "Medium"
            else:
                # This shouldn't happen as > 5 Gy is handled above, but for safety
                return "High"
    
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
        risk_level = pacemaker_data.risk_level or "Low"
        tps_max_dose = pacemaker_data.tps_max_dose
        tps_mean_dose = pacemaker_data.tps_mean_dose
        osld_mean_dose = pacemaker_data.osld_mean_dose
        
        # Format device information
        model_text = f"model number {device_model}" if device_model else "implanted cardiac device"
        serial_text = f"serial number {device_serial}" if device_serial else ""
        if model_text and serial_text:
            device_info = f"{model_text}, {serial_text},"
        elif model_text:
            device_info = f"{model_text},"
        elif serial_text:
            device_info = f"{serial_text},"
        else:
            device_info = ""
        
        # Format pacing dependent information
        if pacing_dependent == "Yes":
            pacing_text = "It is noted that they are pacing dependent."
        elif pacing_dependent == "No":
            pacing_text = "It is noted that they are not pacing dependent."
        else:
            pacing_text = ""
        
        # Use the clinical template structure
        write_up = f"Dr. {physician} requested a medical physics consultation for ---. The patient is undergoing radiation treatment to their {treatment_site} for the dose of {dose} Gy in {fractions} fractions. "
        write_up += f"The patient has a {device_info} from {device_vendor}. {pacing_text}\n\n"
        
        write_up += "Our treatment plan follows the guidelines of the manufacturer for radiation therapy. "
        write_up += "No primary radiation fields intercept the pacemaker. The device was contoured in the treatment planning system. "
        write_up += f"The maximum dose to the device was {tps_max_dose} Gy, with a mean dose of {tps_mean_dose} Gy, "
        write_up += "which is well below the AAPM recommended total dose of 2Gy. "
        write_up += "It is noted that no specific dose tolerance was provided by the manufacturer.\n\n"
        
        write_up += "One potential complication with any pacemaker is that radiation could induce an increased sensor rate. "
        
        # Risk-level specific content
        if risk_level == "Low":
            write_up += f"However, our dosimetry analysis puts this patient at a {risk_level.lower()} risk for any radiation induced cardiac complications. "
            write_up += "A defibrillator is always available during treatment in case of emergency. "
            write_up += "A heart rate monitor is then used to monitor for events that would require the defibrillator. "
            write_up += "The patient had their device interrogated before the start of treatment."
        elif risk_level == "Medium":
            write_up += f"However, our dosimetry analysis puts this patient at a {risk_level.lower()} risk for any radiation induced cardiac complications. "
            write_up += "A defibrillator is always available during treatment in case of emergency. "
            write_up += "A heart rate monitor is then used to monitor for events that would require the defibrillator. "
            write_up += "The patient had their device interrogated before the start of treatment and will have it "
            write_up += "interrogated again in the middle of treatment and after the end of treatment."
        elif risk_level == "High":
            write_up += f"However, our dosimetry analysis puts this patient at a {risk_level.lower()} risk for any radiation induced cardiac complications. "
            write_up += "A defibrillator is always available during treatment in case of emergency. "
            write_up += "A heart rate monitor is then used to monitor for events that would require the defibrillator. "
            write_up += "The patient had their device interrogated before the start of treatment and will have it "
            write_up += "interrogated again in the middle of treatment and after the end of treatment. "
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