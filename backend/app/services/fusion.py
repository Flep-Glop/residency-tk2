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
        
        # Adjust conclusion based on number of registrations
        if len(registrations) == 1:
            write_up += f"The fusion for the image sets was reviewed and approved by both the prescribing radiation oncologist, "
        else:
            write_up += f"The fusions for all image sets were reviewed and approved by both the prescribing radiation oncologist, "
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
            # Single registration - improved flow
            reg = registrations[0]
            secondary = reg.secondary
            
            if secondary == "CT":
                intro_text = f"A {secondary} study was imported into the Velocity software. "
            else:
                intro_text = f"A {secondary} study was imported into the Velocity software. "
                
            intro_text += f"A fusion study was created between the planning CT and the imported image set. "
            
        else:
            # Multiple registrations - improved plural/singular handling
            modality_descriptions = []
            for modality, count in modality_counts.items():
                if count == 1:
                    modality_descriptions.append(f"one {modality} study")
                else:
                    # Convert number to word for better readability
                    number_words = {2: "two", 3: "three", 4: "four", 5: "five"}
                    count_word = number_words.get(count, str(count))
                    modality_descriptions.append(f"{count_word} {modality} studies")
            
            if len(modality_descriptions) == 1:
                # Single modality type but potentially multiple studies
                desc = modality_descriptions[0]
                if desc.startswith("one"):
                    intro_text = f"A {desc.replace('one ', '')} was imported into the Velocity software. "
                else:
                    # For plural like "two MRI studies"
                    parts = desc.split(' ', 2)  # Split into ["two", "MRI", "studies"]
                    intro_text = f"{parts[0].capitalize()} {parts[1]} {parts[2]} were imported into the Velocity software. "
            else:
                intro_text = f"Multiple image studies including {' and '.join(modality_descriptions)} were imported into the Velocity software. "
            intro_text += "Fusion studies were created between the planning CT and each of the imported image sets. "
        
        # Registration process description
        reg_text = ""
        
        # Group registrations by modality for better text flow
        mri_registrations = [reg for reg in registrations if reg.secondary == "MRI"]
        pet_registrations = [reg for reg in registrations if reg.secondary == "PET/CT"]
        ct_registrations = [reg for reg in registrations if reg.secondary == "CT"]
        
        if mri_registrations:
            if len(mri_registrations) == 1:
                reg_text += f"The CT and MRI image sets were initially aligned using a rigid registration algorithm based on the {anatomical_region} anatomy, then refined manually. The resulting fusion was verified for accuracy using anatomical landmarks such as the {lesion}."
            else:
                reg_text += f"The CT and MRI image sets were initially aligned using a rigid registration algorithm based on the {anatomical_region} anatomy, then refined manually. The resulting fusions were verified for accuracy using anatomical landmarks such as the {lesion}."
        
        if pet_registrations:
            if mri_registrations:
                reg_text += "\n\n"
            
            # Check if any PET/CT registrations use deformable method
            has_deformable_pet = any(reg.method.lower() != "rigid" for reg in pet_registrations)
            
            if has_deformable_pet:
                pet_text = f"The CT and PET/CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results."
            else:
                pet_text = f"The CT and PET/CT image sets were initially aligned using a rigid registration algorithm based on the {anatomical_region} anatomy, then refined manually."
            
            if len(registrations) == 1:  # Total registrations, not just PET
                pet_text += f" The accuracy of this fusion was validated using anatomical structures such as the {lesion}."
            else:
                pet_text += f" The accuracy of these fusions were validated using anatomical structures such as the {lesion}."
            
            if has_deformable_pet:
                pet_text += f" The fused images were subsequently used to improve the identification of critical structures and targets and to accurately contour them for treatment planning."
            
            reg_text += pet_text
        
        if ct_registrations:
            if mri_registrations or pet_registrations:
                reg_text += "\n\n"
            
            # Check if any CT registrations use deformable method
            has_deformable_ct = any(reg.method.lower() != "rigid" for reg in ct_registrations)
            
            if has_deformable_ct:
                ct_text = f"The CT and CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results."
            else:
                ct_text = f"The CT and CT image sets were initially aligned using a rigid registration algorithm based on the {anatomical_region} anatomy, then refined manually."
            
            if len(registrations) == 1:  # Total registrations, not just CT
                ct_text += f" The accuracy of this fusion was validated using anatomical structures such as the {lesion}."
            else:
                ct_text += f" The accuracy of these fusions were validated using anatomical structures such as the {lesion}."
            
            if has_deformable_ct:
                ct_text += f" The fused images were subsequently used to improve the identification of critical structures and targets and to accurately contour them for treatment planning."
            
            reg_text += ct_text
        
        # Conclusion text - adjust based on number of registrations
        if len(registrations) == 1:
            conclusion_text = " The fused images were subsequently used to improve the identification of critical structures and targets and to accurately contour them for treatment planning."
        else:
            conclusion_text = " The fused images were subsequently used to improve the identification of critical structures and targets and to accurately contour them for treatment planning."
        
        return intro_text + reg_text + conclusion_text 