from app.schemas.sbrt_schemas import SBRTGenerateRequest, SBRTGenerateResponse, SBRTValidateRequest, SBRTValidateResponse
from typing import List, Dict, Any

class SBRTService:
    def __init__(self):
        self.treatment_sites = [
            "Lung", 
            "Spine", 
            "Liver", 
            "Pancreas", 
            "Adrenal", 
            "Prostate", 
            "Lymph node"
        ]
        
        self.dose_constraints = {
            "Spine": {
                "spinal_cord_max": "< 23Gy in 3 fx", 
                "vertebral_body_max": "< 30Gy in 3 fx",
                "esophagus_max": "< 30Gy in 3 fx",
                "brachial_plexus_max": "< 24Gy in 3 fx"
            },
            "Lung": {
                "lung_v20": "< 30%", 
                "lung_v12.5_cc": "< 1500cc", 
                "chest_wall_max": "< 50Gy in 5 fx",
                "heart_mean": "< 8Gy in 5 fx",
                "esophagus_max": "< 40Gy in 5 fx",
                "brachial_plexus_max": "< 32Gy in 5 fx"
            },
            "Liver": {
                "normal_liver_mean": "< 15Gy in 3 fx",
                "liver_v15": "≥ 700cc",
                "stomach_max": "< 30Gy in 5 fx",
                "duodenum_max": "< 30Gy in 5 fx"
            },
            "Pancreas": {
                "duodenum_max": "< 33Gy in 5 fx",
                "stomach_max": "< 33Gy in 5 fx",
                "bowel_max": "< 30Gy in 5 fx",
                "kidney_v12": "< 25%"
            },
            "Adrenal": {
                "kidney_v12": "< 25%",
                "spinal_cord_max": "< 30Gy in 5 fx",
                "stomach_max": "< 33Gy in 5 fx"
            },
            "Prostate": {
                "urethra_max": "< 42Gy in 5 fx",
                "bladder_v37": "< 5cc",
                "rectum_v30": "< 1cc",
                "femoral_heads_max": "< 30Gy in 5 fx"
            },
            "Lymph node": {
                "bowel_max": "< 30Gy in 5 fx",
                "spinal_cord_max": "< 30Gy in 5 fx"
            }
        }
        
        self.fractionation_schemes = {
            "Spine": [
                {"dose": 24, "fractions": 3, "description": "Standard dose"},
                {"dose": 27, "fractions": 3, "description": "High dose"},
                {"dose": 30, "fractions": 5, "description": "Moderate dose/5fx"}
            ],
            "Lung": [
                {"dose": 50, "fractions": 5, "description": "Standard dose"},
                {"dose": 54, "fractions": 3, "description": "High dose/3fx"},
                {"dose": 60, "fractions": 8, "description": "Moderate dose/8fx"}
            ],
            "Liver": [
                {"dose": 45, "fractions": 3, "description": "Standard dose"},
                {"dose": 50, "fractions": 5, "description": "Alternative (5fx)"}
            ],
            "Pancreas": [
                {"dose": 33, "fractions": 5, "description": "Standard dose"},
                {"dose": 36, "fractions": 3, "description": "High dose/3fx"}
            ],
            "Adrenal": [
                {"dose": 40, "fractions": 5, "description": "Standard dose"},
                {"dose": 60, "fractions": 8, "description": "Alternative (8fx)"}
            ],
            "Prostate": [
                {"dose": 36.25, "fractions": 5, "description": "Standard dose"}
            ],
            "Lymph node": [
                {"dose": 30, "fractions": 5, "description": "Standard dose"},
                {"dose": 24, "fractions": 3, "description": "Alternative (3fx)"}
            ]
        }

    def get_treatment_sites(self) -> List[str]:
        return self.treatment_sites

    def get_dose_constraints(self, site: str) -> Dict[str, Any]:
        constraints = self.dose_constraints.get(site)
        if not constraints:
            return {"error": f"No dose constraints found for site: {site}. Ensure site is one of {self.treatment_sites}"}
        return constraints

    def get_fractionation_schemes(self, site: str) -> List[Dict[str, Any]]:
        schemes = self.fractionation_schemes.get(site)
        if not schemes:
            return [{"error": f"No fractionation schemes found for site: {site}. Ensure site is one of {self.treatment_sites}"}]
        return schemes

    def generate_sbrt_writeup(self, request: SBRTGenerateRequest) -> SBRTGenerateResponse:
        physician = request.common_info.physician.name
        physicist = request.common_info.physicist.name
        patient_age = request.common_info.patient.age
        patient_sex = request.common_info.patient.sex
        
        treatment_site = request.sbrt_data.treatment_site
        dose = request.sbrt_data.dose
        fractions = request.sbrt_data.fractions
        lesion_size = request.sbrt_data.lesion_size or "unspecified size"
        motion_management = request.sbrt_data.motion_management or "standard immobilization"
        
        is_custom_lesion = request.sbrt_data.is_custom_lesion
        custom_lesion_description = request.sbrt_data.custom_lesion_description
        
        dose_per_fraction = dose / fractions
        
        lesion_description_text = f"a {lesion_size} lesion located in the {treatment_site}"
        if is_custom_lesion and custom_lesion_description:
            lesion_description_text = f"a {lesion_size} {custom_lesion_description}"
        elif is_custom_lesion:
            lesion_description_text = f"a {lesion_size} lesion at a custom-specified site within the {treatment_site}"

        writeup = f"Dr. {physician} requested a medical physics consultation for stereotactic body radiation therapy (SBRT) treatment planning. "
        writeup += f"The patient is a {patient_age}-year-old {patient_sex} with {lesion_description_text}. "
        
        site_intro_text = treatment_site
        if is_custom_lesion and custom_lesion_description:
            site_intro_text = custom_lesion_description
        elif is_custom_lesion:
            site_intro_text = f"the custom-specified lesion within the {treatment_site}"

        if treatment_site.lower() == "lung":
            writeup += f"Dr. {physician} has elected to treat this {site_intro_text} with SBRT using {motion_management} for respiratory motion management. "
        elif treatment_site.lower() == "spine":
            writeup += f"Dr. {physician} has elected to treat this {site_intro_text} with SBRT using {motion_management} for precise target localization. "
        else:
            writeup += f"Dr. {physician} has elected to treat this {site_intro_text} with SBRT using {motion_management}. "
        
        writeup += "\n\nA high quality CT simulation was performed with thin slices (1-2mm) through the region of interest. "
        needs_4dct = False
        if treatment_site.lower() in ["lung", "liver", "pancreas"]:
            needs_4dct = True
        if is_custom_lesion and custom_lesion_description and any(keyword in custom_lesion_description.lower() for keyword in ["lung", "liver", "pancreas"]):
             needs_4dct = True
        if needs_4dct:
            writeup += "A 4D-CT was also acquired to assess respiratory motion and determine the internal target volume (ITV). "

        writeup += f"The gross tumor volume (GTV) was contoured by Dr. {physician} and expanded appropriately to create the planning target volume (PTV). "
        writeup += f"A radiation treatment plan was developed to deliver a prescribed dose of {dose} Gy in {fractions} fractions ({dose_per_fraction:.2f} Gy per fraction) "
        writeup += f"to the PTV encompassing the {site_intro_text}. "
        
        if request.sbrt_data.dose_constraints_met:
            writeup += f"All dose constraints to nearby critical structures for the {treatment_site} region were met according to the protocol guidelines. "
        else:
            writeup += f"Dose constraints for the {treatment_site} region were reviewed with Dr. {physician}. "
        if is_custom_lesion:
            writeup += "For this custom-specified lesion, specific constraints and considerations are determined on a case-by-case basis by the treating physician. "
        
        writeup += "\n\nPatient-specific quality assurance measurements were performed prior to treatment. "
        writeup += "Daily pre-treatment cone-beam CT imaging will be used for precise target localization. "
        
        writeup += f"\n\nThe treatment plan calculations and delivery procedures were reviewed and approved by the prescribing radiation oncologist, Dr. {physician}, "
        writeup += f"and the radiation oncology physicist, Dr. {physicist}."
        
        return SBRTGenerateResponse(writeup=writeup)

    def validate_dose_fractionation(self, request: SBRTValidateRequest) -> SBRTValidateResponse:
        site = request.site
        dose = request.dose
        fractions = request.fractions
        
        is_valid = True
        message = f"Validation for {site} ({dose}Gy in {fractions}fx) successful."
        constraints_met = []
        constraints_violated = []
        
        if site not in self.fractionation_schemes:
            is_valid = False
            message = f"Site '{site}' not found in standard fractionation schemes. Please select a valid site."
            constraints_violated.append({"constraint": "Site Definition", "detail": message})
            return SBRTValidateResponse(
                is_valid=is_valid, message=message,
                constraints_met=constraints_met, constraints_violated=constraints_violated
            )
        
        standard_schemes = self.fractionation_schemes.get(site, [])
        if not standard_schemes:
            is_valid = False
            message = f"No standard fractionation schemes defined for site '{site}'."
            constraints_violated.append({"constraint": "Scheme Availability", "detail": message})
            return SBRTValidateResponse(
                is_valid=is_valid, message=message,
                constraints_met=constraints_met, constraints_violated=constraints_violated
            )

        scheme_match = False
        for scheme in standard_schemes:
            if scheme.get("dose") == dose and scheme.get("fractions") == fractions:
                scheme_match = True
                constraints_met.append({"constraint": "Standard Protocol", "detail": f"Matches {scheme.get('description', 'standard regimen')}"})
                break
        
        if not scheme_match:
            alpha_beta = 10.0
            bed = dose * (1 + dose / (float(fractions) * alpha_beta))
            
            closest_scheme = None
            min_diff = float('inf')
            
            for scheme in standard_schemes:
                scheme_dose = scheme.get("dose")
                scheme_fractions = scheme.get("fractions")
                if scheme_dose is None or scheme_fractions is None or scheme_fractions == 0:
                    continue
                
                scheme_bed = scheme_dose * (1 + scheme_dose / (float(scheme_fractions) * alpha_beta))
                diff = abs(bed - scheme_bed)
                if diff < min_diff:
                    min_diff = diff
                    closest_scheme = scheme
            
            if closest_scheme:
                cs_dose = closest_scheme.get("dose")
                cs_fractions = closest_scheme.get("fractions")
                cs_desc = closest_scheme.get("description", "standard regimen")

                if cs_dose is None or cs_fractions is None or cs_fractions == 0:
                    is_valid = False
                    message = f"Error comparing to standard schemes for {site}. Data for closest scheme is incomplete."
                    constraints_violated.append({"constraint": "Data Integrity", "detail": "Closest standard scheme data incomplete."})
                else:
                    closest_scheme_bed = cs_dose * (1 + cs_dose / (float(cs_fractions) * alpha_beta))
                    if closest_scheme_bed == 0:
                        is_valid = False
                        message = f"Non-standard regimen for {site}. BED comparison issue with {cs_desc}."
                        constraints_violated.append({"constraint": "BED Comparison", "detail": f"Proposed BED={bed:.2f}Gy. Cannot reliably compare to {cs_desc} (BED: {closest_scheme_bed:.2f}Gy)."})
                    elif abs(bed - closest_scheme_bed) / closest_scheme_bed <= 0.1:
                        constraints_met.append({"constraint": "BED Equivalence", "detail": f"BED = {bed:.2f} Gy, within 10% of {cs_desc} (BED: {closest_scheme_bed:.2f} Gy)"})
                        message += f" BED is within 10% of {cs_desc}."
                    else:
                        is_valid = False
                        message = f"Non-standard regimen for {site}. BED ({bed:.2f} Gy) differs >10% from {cs_desc} (BED: {closest_scheme_bed:.2f} Gy)."
                        constraints_violated.append({
                            "constraint": "Non-Standard Regimen (BED >10%)", 
                            "detail": f"Proposed BED ({bed:.2f} Gy) differs by >10% from {cs_desc} ({closest_scheme_bed:.2f} Gy). Recommended: {cs_dose} Gy in {cs_fractions} fx."
                        })
            else:
                is_valid = False
                message = f"No comparable standard fractionation schemes found for {site} to evaluate BED."
                constraints_violated.append({"constraint": "Scheme Comparability", "detail": message})

        return SBRTValidateResponse(
            is_valid=is_valid,
            message=message,
            constraints_met=constraints_met,
            constraints_violated=constraints_violated
        ) 