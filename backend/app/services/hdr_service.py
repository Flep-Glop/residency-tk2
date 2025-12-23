from app.schemas.hdr_schemas import HDRGenerateRequest, HDRGenerateResponse
from typing import List, Dict, Any

class HDRService:
    def __init__(self):
        # Applicator types with their typical characteristics
        self.applicators = {
            "VC": {
                "position": "lithotomy",
                "channels": 1,
                "description": "vaginal cylinder"
            },
            "T&O": {
                "position": "lithotomy",
                "channels": 3,
                "description": "tandem and ovoid applicator"
            },
            "Hybrid T&O": {
                "position": "lithotomy",
                "channels": 13,
                "description": "hybrid T&O applicator"
            },
            "SYED-Gyn": {
                "position": "lithotomy",
                "channels": 55,
                "description": "SYED applicator"
            },
            "SYED-Prostate": {
                "position": "lithotomy",
                "channels": 19,
                "description": "SYED applicator"
            }
        }
        
        # Planning systems
        self.planning_systems = [
            "Oncentra",
            "Oncentra Brachy",
            "BrachyVision",
            "Sagiplan"
        ]
        
        # Afterloader units
        self.afterloaders = [
            "ELEKTA Ir-192 remote afterloader",
            "Varian GammaMed HDR",
            "Nucletron microSelectron"
        ]

    def get_applicators(self) -> List[str]:
        """Return list of available applicator types."""
        return sorted(self.applicators.keys())
    
    def get_applicator_info(self, applicator_type: str) -> Dict[str, Any]:
        """Get default information for a specific applicator type."""
        return self.applicators.get(applicator_type, {
            "position": "supine",
            "channels": 1,
            "description": applicator_type.lower()
        })

    def generate_hdr_writeup(self, request: HDRGenerateRequest) -> HDRGenerateResponse:
        """Generate HDR brachytherapy write-up using frontend form data."""
        # Extract common info
        physician = request.common_info.physician.name
        physicist = request.common_info.physicist.name
        
        # Extract HDR data
        data = request.hdr_data
        
        # Get applicator description
        applicator_info = self.get_applicator_info(data.applicator_type)
        applicator_description = applicator_info.get("description", data.applicator_type.lower())
        
        # Fixed values
        patient_position = "lithotomy"
        ct_slice_thickness = 3.0
        afterloader = "ELEKTA Ir-192 remote afterloader"
        planning_system = "Oncentra"
        critical_structures = ["bladder", "rectum", "intestines", "sigmoid"]
        survey_reading = "0.2"
        
        # Generate the write-up
        writeup = self._generate_intro_paragraph(
            physician, applicator_description, afterloader
        )
        
        writeup += "\n\n"
        writeup += self._generate_implant_paragraph(
            physician, patient_position,
            ct_slice_thickness, critical_structures,
            planning_system, data.number_of_channels,
            data.applicator_type
        )
        
        writeup += "\n\n"
        writeup += self._generate_survey_paragraph(
            survey_reading, physician, physicist
        )
        
        return HDRGenerateResponse(writeup=writeup)

    def _generate_intro_paragraph(self, physician: str, applicator_description: str,
                                   afterloader: str) -> str:
        """Generate introduction paragraph."""
        text = f"Dr. {physician} requested a medical physics consultation for ---. "
        
        # Handle article grammar (a vs an)
        # Utrecht starts with vowel letter but consonant sound (YOO-trekt), so uses "a"
        if applicator_description.lower().startswith("utrecht"):
            article = "a"
        else:
            article = "an" if applicator_description[0].lower() in ['a', 'e', 'i', 'o', 'u'] else "a"
        
        text += f"The patient elected to be treated with a temporary HDR implant using {article} "
        text += f"{applicator_description} connected to a remote afterloader containing Ir-192."
        
        return text

    def _generate_implant_paragraph(self, physician: str,
                                     patient_position: str, ct_slice_thickness: float,
                                     critical_structures: List[str],
                                     planning_system: str, num_channels: int,
                                     applicator_type: str = "") -> str:
        """Generate implant and planning paragraph."""
        # SYED applicators are implanted in OR, not our clinic
        if applicator_type in ["SYED-Gyn", "SYED-Prostate"]:
            text = f"The applicator was implanted with the patient "
        else:
            text = f"The applicator was implanted in our clinic with the patient "
        text += f"in the {patient_position} position. Once the applicator was implanted and fixed to the patient, "
        text += f"a CT scan of {self._format_number(ct_slice_thickness)} mm slice thickness was acquired. "
        
        # Critical structures
        structures_text = self._format_structure_list(critical_structures)
        text += f"This was used to contour critical structures ({structures_text}) and determine the treatment volume. "
        
        # Planning process
        text += f"The applicators were digitized in {planning_system} and customized dwell weightings of the "
        text += f"radioactive source were determined to optimally treat the target volume and reduce the dose to "
        text += f"the nearby normal tissues. Once the optimal plan was determined, a second calculation was performed "
        text += f"to verify the accuracy of the initial dose calculation and the patient was connected to the "
        text += f"afterloader unit using {self._format_channels(num_channels)} for treatment. "
        text += f"The treatment was delivered with the Radiation Oncologist and Medical Physicist present."
        
        return text

    def _generate_survey_paragraph(self, survey_reading: str, physician: str,
                                    physicist: str) -> str:
        """Generate radiation survey and approval paragraph."""
        text = f"The patient and the room were surveyed at the completion of the treatment. "
        text += f"The room, patient, and personnel were cleared from radiation safety that recorded readings "
        text += f"of less than {survey_reading} mR/hr in all surveyed areas. "
        text += f"The calculations and surveys were reviewed and approved by both the prescribing radiation oncologist, "
        text += f"Dr. {physician}, and the medical physicist, Dr. {physicist}."
        
        return text

    def _format_structure_list(self, structures: List[str]) -> str:
        """Format list of critical structures with proper grammar."""
        if len(structures) == 0:
            return ""
        elif len(structures) == 1:
            return structures[0]
        elif len(structures) == 2:
            return f"{structures[0]} and {structures[1]}"
        else:
            # Join all but last with commas, add 'and' before last
            return ", ".join(structures[:-1]) + f", and {structures[-1]}"
    
    def _format_channels(self, num_channels: int) -> str:
        """Format number of channels with proper grammar."""
        if num_channels == 1:
            return "one channel"
        elif num_channels == 2:
            return "two channels"
        elif num_channels == 3:
            return "three channels"
        else:
            return f"{num_channels} channels"
    
    def _format_number(self, value, decimal_places=1):
        """Format number removing unnecessary trailing zeros."""
        if isinstance(value, (int, float)):
            formatted = f"{value:.{decimal_places}f}".rstrip('0').rstrip('.')
            if '.' not in formatted:
                return formatted
            return formatted
        return str(value)

