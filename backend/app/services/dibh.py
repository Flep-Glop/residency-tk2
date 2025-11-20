from app.schemas.dibh import DIBHRequest, DIBHResponse

class DIBHService:
    """Service for generating DIBH write-ups."""
    
    def __init__(self):
        """Initialize the DIBH service."""
        # Available treatment sites for DIBH
        self.treatment_sites = [
            "left breast", 
            "right breast", 
            "diaphragm", 
            "chest wall"
        ]
        
        # Available immobilization devices
        self.immobilization_devices = [
            "breast board", 
            "wing board"
        ]
        
        # Default fractionation schemes by treatment site
        self.fractionation_schemes = {
            "left breast": [
                {"dose": 40, "fractions": 15, "description": "Hypofractionated"},
                {"dose": 50, "fractions": 25, "description": "Conventional"}
            ],
            "right breast": [
                {"dose": 40, "fractions": 15, "description": "Hypofractionated"},
                {"dose": 50, "fractions": 25, "description": "Conventional"}
            ],
            "diaphragm": [
                {"dose": 45, "fractions": 15, "description": "Standard"}
            ],
            "chest wall": [
                {"dose": 40, "fractions": 15, "description": "Hypofractionated"},
                {"dose": 50, "fractions": 25, "description": "Conventional"}
            ]
        }
    
    def generate_dibh_writeup(self, request: DIBHRequest) -> DIBHResponse:
        """Generate a DIBH write-up based on the request data."""
        common_info = request.common_info
        dibh_data = request.dibh_data
        
        physician = common_info.physician.name
        physicist = common_info.physicist.name
        
        # Use custom treatment site if provided, otherwise use the standard treatment site
        treatment_site = dibh_data.custom_treatment_site if dibh_data.custom_treatment_site else dibh_data.treatment_site
        dose = dibh_data.dose
        fractions = dibh_data.fractions
        has_boost = dibh_data.has_boost or False
        boost_dose = dibh_data.boost_dose or 0
        boost_fractions = dibh_data.boost_fractions or 0
        
        # Auto-assign immobilization device based on treatment site
        immobilization_device = "breast board" if treatment_site in ["left breast", "right breast"] else "wing board"
        
        # Calculate dose per fraction
        dose_per_fraction = dose / fractions
        boost_dose_per_fraction = boost_dose / boost_fractions if boost_fractions > 0 else 0
        fractionation_description = "hypofractionation" if dose_per_fraction > 2.0 else "conventional fractionation"
        
        # Helper function to format numbers without unnecessary decimals
        def format_number(num):
            return str(int(num)) if num % 1 == 0 else f"{num:.2f}"
        
        # Add specific details based on treatment site
        if treatment_site == "left breast":
            site_specific_text = "left breast using a DIBH technique to significantly reduce cardiac dose"
        elif treatment_site == "right breast":
            site_specific_text = "right breast using a DIBH technique to minimize breathing motion during radiation delivery"
        else:
            site_specific_text = f"{treatment_site} using a DIBH technique to minimize breathing motion during radiation delivery"
        
        # Default values for fixed parameters
        machine = "linear accelerator"
        scanning_system = "C-RAD"
        
        # Generate the write-up
        write_up = f"Dr. {physician} requested a medical physics consultation for --- for a gated, DIBH treatment. "
        write_up += f"Dr. {physician} has elected to treat the {site_specific_text} "
        write_up += f"with the C-RAD positioning and gating system in conjunction with the {machine}.\n\n"
        
        write_up += f"Days before the initial radiation delivery, the patient was simulated in the treatment "
        write_up += f"position using a {immobilization_device} to aid in immobilization "
        write_up += f"and localization. Instructions were provided and the patient was coached to reproducibly "
        write_up += f"hold their breath. Using the {scanning_system} surface scanning system, a free breathing "
        write_up += f"and breath hold signal trace was established. After reproducing the "
        write_up += f"breath hold pattern and establishing a consistent "
        write_up += f"breathing pattern, a gating baseline and gating window were created. Subsequently, a "
        write_up += f"DIBH CT simulation scan was acquired and approved "
        write_up += f"by the Radiation Oncologist, Dr. {physician}.\n\n"
        
        # Generate dose description based on whether there's a boost
        if has_boost and boost_dose > 0 and boost_fractions > 0:
            write_up += f"A radiation treatment plan was developed on the DIBH CT simulation to deliver a "
            write_up += f"prescribed dose of {format_number(dose)} Gy in {fractions} fractions ({format_number(dose_per_fraction)} Gy per fraction) "
            write_up += f"to the {treatment_site}, followed by a boost of {format_number(boost_dose)} Gy in {boost_fractions} fractions "
            write_up += f"({format_number(boost_dose_per_fraction)} Gy per fraction) for a total dose of {format_number(dose + boost_dose)} Gy "
            write_up += f"in {fractions + boost_fractions} fractions. "
        else:
            write_up += f"A radiation treatment plan was developed on the DIBH CT simulation to deliver a "
            write_up += f"prescribed dose of {format_number(dose)} Gy in {fractions} fractions ({format_number(dose_per_fraction)} Gy per fraction) "
            write_up += f"to the {treatment_site}. "
        
        write_up += f"The delivery of the DIBH gating technique on the linear accelerator will be performed "
        write_up += f"using the C-RAD CatalystHD. The CatalystHD will be used to position the patient, "
        write_up += f"monitor intra-fraction motion, and gate the beam delivery. Verification of the patient "
        write_up += f"position will be validated with a DIBH kV-CBCT. Treatment plan calculations and delivery "
        write_up += f"procedures were reviewed and approved by the prescribing radiation oncologist, Dr. {physician}, "
        write_up += f"and the radiation oncology physicist, Dr. {physicist}."
        
        return DIBHResponse(writeup=write_up) 