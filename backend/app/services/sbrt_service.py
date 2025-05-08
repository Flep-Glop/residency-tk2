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
            "Lymph node",
            "Custom" # Added custom option
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
            },
            "Custom": {
                "note": "Custom lesion - constraints to be determined on case-by-case basis"
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
            ],
            "Custom": [
                {"dose": 30, "fractions": 5, "description": "Example regimen"},
                {"dose": 24, "fractions": 3, "description": "Example regimen"},
                {"dose": 36, "fractions": 3, "description": "Example regimen"}
            ]
        }

    def get_treatment_sites(self) -> List[str]:
        return self.treatment_sites

    def get_dose_constraints(self, site: str) -> Dict[str, Any]:
        constraints = self.dose_constraints.get(site)
        if not constraints:
            return {"error": f"No dose constraints found for site: {site}"}
        return constraints

    def get_fractionation_schemes(self, site: str) -> List[Dict[str, Any]]:
        schemes = self.fractionation_schemes.get(site)
        if not schemes:
            return [{"error": f"No fractionation schemes found for site: {site}"}]
        return schemes

    def generate_sbrt_writeup(self, request: SBRTGenerateRequest) -> SBRTGenerateResponse:
        # Extract data from request
        physician = request.common_info.physician.name
        physicist = request.common_info.physicist.name
        patient_age = request.common_info.patient.age
        patient_sex = request.common_info.patient.sex
        
        site = request.sbrt_data.treatment_site
        dose = request.sbrt_data.dose
        fractions = request.sbrt_data.fractions
        lesion_size = request.sbrt_data.lesion_size or "unspecified size"
        lesion_location = request.sbrt_data.lesion_location or f"in the {site}"
        custom_site_name = request.sbrt_data.custom_site_name
        motion_management = request.sbrt_data.motion_management or "standard immobilization"
        
        # Calculate dose per fraction
        dose_per_fraction = dose / fractions
        
        # Format the write-up
        writeup = f"Dr. {physician} requested a medical physics consultation for stereotactic body radiation therapy (SBRT) treatment planning. "
        
        # Handle patient description differently for custom sites
        if site.lower() == "custom" and custom_site_name:
            writeup += f"The patient is a {patient_age}-year-old {patient_sex} with {custom_site_name}, a {lesion_size} lesion {lesion_location}. "
        else:
            writeup += f"The patient is a {patient_age}-year-old {patient_sex} with a {lesion_size} lesion {lesion_location}. "
        
        # Site-specific introduction
        if site.lower() == "lung":
            writeup += f"Dr. {physician} has elected to treat this {site} lesion with SBRT using {motion_management} for respiratory motion management. "
        elif site.lower() == "spine":
            writeup += f"Dr. {physician} has elected to treat this {site} lesion with SBRT using {motion_management} for precise target localization. "
        elif site.lower() == "custom":
            # For custom lesions, use custom_site_name if available
            site_description = custom_site_name if custom_site_name else f"lesion in the {lesion_location}"
            writeup += f"Dr. {physician} has elected to treat this {site_description} with SBRT using {motion_management}. "
        else:
            writeup += f"Dr. {physician} has elected to treat this {site} lesion with SBRT using {motion_management}. "
        
        # Treatment planning
        writeup += "\n\nA high quality CT simulation was performed with thin slices (1-2mm) through the region of interest. "
        
        if site.lower() in ["lung", "liver", "pancreas"]:
            writeup += "A 4D-CT was also acquired to assess respiratory motion and determine the internal target volume (ITV). "
        
        writeup += f"The gross tumor volume (GTV) was contoured by Dr. {physician} and expanded appropriately to create the planning target volume (PTV). "
        writeup += f"A radiation treatment plan was developed to deliver a prescribed dose of {dose} Gy in {fractions} fractions ({dose_per_fraction:.2f} Gy per fraction) "
        
        # Adjust wording for custom lesions
        if site.lower() == "custom":
            writeup += f"to the lesion in the {lesion_location}. "
        else:
            writeup += f"to the {site} lesion. "
        
        # Dose constraints
        if request.sbrt_data.dose_constraints_met:
            writeup += "All dose constraints to nearby critical structures were met according to the protocol guidelines. "
        else:
            writeup += f"Some dose constraints required careful consideration and were reviewed with Dr. {physician}. "
        
        # Quality assurance and verification
        writeup += "\n\nPatient-specific quality assurance measurements were performed prior to treatment. "
        writeup += "Daily pre-treatment cone-beam CT imaging will be used for precise target localization. "
        
        # Final approval
        writeup += f"\n\nThe treatment plan calculations and delivery procedures were reviewed and approved by the prescribing radiation oncologist, Dr. {physician}, "
        writeup += f"and the radiation oncology physicist, Dr. {physicist}."
        
        return SBRTGenerateResponse(writeup=writeup)

    def validate_dose_fractionation(self, request: SBRTValidateRequest) -> SBRTValidateResponse:
        site = request.site
        dose = request.dose
        fractions = request.fractions
        
        is_valid = True
        message = f"Validation for {site} with {dose}Gy in {fractions}fx successful."
        constraints_met = []
        constraints_violated = []
        
        # Special case for Custom site - always valid with a note
        if site.lower() == "custom":
            return SBRTValidateResponse(
                is_valid=True,
                message="Custom treatment site - dose/fractionation validation is at clinician's discretion.",
                constraints_met=[{"constraint": "Custom site", "detail": "Manual validation required"}],
                constraints_violated=[]
            )
        
        # Check if site exists
        if site not in self.fractionation_schemes:
            is_valid = False
            message = f"Site '{site}' not found in standard schemes."
            constraints_violated.append({"constraint": "Site validation", "detail": message})
            return SBRTValidateResponse(
                is_valid=is_valid,
                message=message,
                constraints_met=constraints_met,
                constraints_violated=constraints_violated
            )
        
        # Get standard schemes for this site
        standard_schemes = self.fractionation_schemes.get(site, [])
        
        # Check if this dose/fractionation matches any standard scheme
        scheme_match = False
        for scheme in standard_schemes:
            if scheme["dose"] == dose and scheme["fractions"] == fractions:
                scheme_match = True
                constraints_met.append({"constraint": "Standard protocol", "detail": f"Matches {scheme['description']}"})
                break
        
        # If no match, check if it's within acceptable range
        if not scheme_match:
            # Get BED (α/β = 10 for tumors)
            alpha_beta = 10
            bed = dose * (1 + dose / (fractions * alpha_beta))
            
            # Find closest standard scheme for comparison
            closest_scheme = None
            min_diff = float('inf')
            
            for scheme in standard_schemes:
                scheme_bed = scheme["dose"] * (1 + scheme["dose"] / (scheme["fractions"] * alpha_beta))
                diff = abs(bed - scheme_bed)
                if diff < min_diff:
                    min_diff = diff
                    closest_scheme = scheme
            
            if closest_scheme:
                closest_bed = closest_scheme["dose"] * (1 + closest_scheme["dose"] / (closest_scheme["fractions"] * alpha_beta))
                
                # If BED is within 10% of a standard scheme, it's acceptable
                if abs(bed - closest_bed) / closest_bed <= 0.1:
                    constraints_met.append({"constraint": "BED equivalent", "detail": f"BED = {bed:.2f} Gy, similar to standard protocol"})
                else:
                    is_valid = False
                    constraints_violated.append({
                        "constraint": "Non-standard regimen", 
                        "detail": f"BED = {bed:.2f} Gy. Consider standard regimen: {closest_scheme['dose']} Gy in {closest_scheme['fractions']} fractions"
                    })
                    message = f"Non-standard regimen. Consider {closest_scheme['dose']} Gy in {closest_scheme['fractions']} fractions."
        
        return SBRTValidateResponse(
            is_valid=is_valid,
            message=message,
            constraints_met=constraints_met,
            constraints_violated=constraints_violated
        ) 