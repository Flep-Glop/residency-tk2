from app.schemas.fusion import FusionRequest, FusionResponse, Registration
from typing import List, Dict

class FusionService:
    """Service for generating fusion write-ups."""
    
    def __init__(self):
        """Initialize the Fusion service."""
        # Mapping of lesions to anatomical regions
        self.lesion_to_region = {
            "oropharynx": "head and neck",
            "brain": "brain",
            "prostate": "pelvic",
            "endometrium": "pelvic",
            "thymus": "thoracic",
            "thorax": "thoracic",
            "brainstem": "brain",
            "orbital": "head and neck",
            "parotid": "head and neck",
            "renal": "abdominal",
            "nasal cavity": "head and neck",
            "liver": "abdominal",
            "lung": "thoracic",
            "breast": "thoracic",
            "diaphragm": "thoracic",
            "rib": "thoracic",
            "groin": "pelvic",
            "larynx": "head and neck",
            "pelvis": "pelvic"
        }
    
    def get_anatomical_region(self, lesion: str) -> str:
        """Get the anatomical region based on lesion name."""
        return self.lesion_to_region.get(lesion.lower(), "")
    
    def generate_fusion_writeup(self, request: FusionRequest) -> FusionResponse:
        """Generate a fusion write-up based on the request data."""
        common_info = request.common_info
        fusion_data = request.fusion_data
        
        physician = common_info.physician.name
        physicist = common_info.physicist.name
        patient_details = common_info.patient.get_description()
        
        # Use custom lesion if provided, otherwise use the standard lesion
        lesion_description = fusion_data.custom_lesion if fusion_data.custom_lesion else fusion_data.lesion
        anatomical_region = fusion_data.anatomical_region
        registrations = fusion_data.registrations
        
        # Generate fusion description text based on the registrations
        fusion_type_text = self._generate_fusion_text(registrations, anatomical_region, lesion_description)
        
        # Generate the write-up
        write_up = f"Dr. {physician} requested a medical physics consultation for --- to perform a multimodality image fusion. "
        write_up += f"The patient is {patient_details} with a {lesion_description} lesion. "
        write_up += "The patient was scanned in our CT simulator in the treatment position. "
        write_up += "The CT study was then exported to the Velocity imaging registration software.\n\n"
        
        write_up += f"{fusion_type_text}\n\n"
        
        write_up += f"The fusion of the image sets was reviewed and approved by both the prescribing radiation oncologist, "
        write_up += f"Dr. {physician}, and the medical physicist, Dr. {physicist}."
        
        return FusionResponse(writeup=write_up)
    
    def _generate_fusion_text(self, registrations: List[Registration], anatomical_region: str, lesion: str) -> str:
        """Generate the fusion description text based on the configured registrations."""
        # Count registrations by modality for summary
        modality_counts = {}
        for reg in registrations:
            secondary = reg.secondary
            if secondary in modality_counts:
                modality_counts[secondary] += 1
            else:
                modality_counts[secondary] = 1
        
        # Introduction text varies based on the number and type of registrations
        intro_text = ""
        if len(registrations) == 1:
            # Single registration
            reg = registrations[0]
            secondary = reg.secondary
            method = reg.method.lower()
            
            if secondary == "CT":
                intro_text = f"Another {secondary} image study that was previously acquired was imported into the Velocity software. "
            else:
                intro_text = f"A {secondary} image study that was previously acquired was imported into the Velocity software. "
                
            intro_text += f"A fusion study was created between the planning CT and the {secondary} image set. "
            
        else:
            # Multiple registrations
            modality_list = ", ".join([f"{count} {mod}" for mod, count in modality_counts.items()])
            intro_text = f"Multiple image studies including {modality_list} were imported into the Velocity software. "
            intro_text += "Fusion studies were created between the planning CT and each of the other modality image sets. "
        
        # Registration process description
        reg_text = ""
        for i, reg in enumerate(registrations):
            if i > 0:
                reg_text += "\n\n"
            
            secondary = reg.secondary
            method = reg.method
            
            if method == "Rigid":
                reg_text += f"The CT and {secondary} image sets were first registered using a rigid registration algorithm based on the {anatomical_region} anatomy and then refined manually. "
            else:  # Deformable
                reg_text += f"The CT and {secondary} image sets were initially aligned using a rigid registration algorithm based on the {anatomical_region} anatomy. A deformable image registration was then performed to improve registration results. "
                
            reg_text += f"The resulting registration of the fused images was verified for accuracy using anatomical landmarks such as the {lesion}."
        
        # Conclusion text
        conclusion_text = " The fused images were used to improve the identification of critical structures and targets and to accurately contour them for treatment planning."
        
        return intro_text + reg_text + conclusion_text 