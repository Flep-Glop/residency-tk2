from app.schemas.srs_schemas import SRSGenerateRequest, SRSGenerateResponse
from typing import List, Dict, Any

class SRSService:
    def __init__(self):
        self.brain_regions = [
            "left frontal lobe", "right frontal lobe",
            "left parietal lobe", "right parietal lobe",
            "left temporal lobe", "right temporal lobe",
            "left occipital lobe", "right occipital lobe",
            "cerebellum", "brainstem", "thalamus", "basal ganglia",
            "corpus callosum", "pineal region", "midbrain", "pons",
            "medulla", "left cerebellar hemisphere", "right cerebellar hemisphere",
            "left hippocampus", "right hippocampus", "optic chiasm", "sellar region"
        ]
        
        # Typical SRS dose schemes (single fraction)
        self.srs_schemes = [
            {"dose": 16.0, "fractions": 1, "description": "16 Gy in 1 fraction"},
            {"dose": 18.0, "fractions": 1, "description": "18 Gy in 1 fraction"},
            {"dose": 20.0, "fractions": 1, "description": "20 Gy in 1 fraction"},
            {"dose": 21.0, "fractions": 1, "description": "21 Gy in 1 fraction"}
        ]
        
        # Typical SRT dose schemes (multiple fractions)
        self.srt_schemes = [
            {"dose": 25.0, "fractions": 5, "description": "25 Gy in 5 fractions"},
            {"dose": 27.0, "fractions": 3, "description": "27 Gy in 3 fractions"},
            {"dose": 30.0, "fractions": 5, "description": "30 Gy in 5 fractions"},
            {"dose": 35.0, "fractions": 5, "description": "35 Gy in 5 fractions"}
        ]

    def get_brain_regions(self) -> List[str]:
        """Return list of available brain regions."""
        return sorted(self.brain_regions)

    def _format_fractions(self, count: int) -> str:
        """Return 'fraction' for count=1, 'fractions' for count>1."""
        return "fraction" if count == 1 else "fractions"

    def _format_number(self, value, decimal_places=1):
        """Format number removing unnecessary trailing zeros."""
        if isinstance(value, (int, float)):
            formatted = f"{value:.{decimal_places}f}".rstrip('0').rstrip('.')
            if '.' not in formatted:
                return formatted
            return formatted
        return str(value)

    def generate_srs_writeup(self, request: SRSGenerateRequest) -> SRSGenerateResponse:
        """Generate SRS/SRT write-up using frontend form data."""
        # Extract common info
        physician = request.common_info.physician.name
        physicist = request.common_info.physicist.name
        
        # Extract SRS data
        data = request.srs_data
        lesions = data.lesions
        
        # Create lesion summary
        if len(lesions) == 1:
            lesion_details = f"a {self._format_number(lesions[0].volume)} cc lesion located in the {lesions[0].site}"
        else:
            # Create detailed list of each lesion
            lesion_details = f"{len(lesions)} brain lesions: "
            lesion_list = []
            
            for lesion in lesions:
                lesion_list.append(f"a {self._format_number(lesion.volume)} cc lesion in the {lesion.site}")
            
            # Join lesion descriptions with commas and 'and' for the last one
            if len(lesion_list) > 1:
                lesion_details += ", ".join(lesion_list[:-1]) + f", and {lesion_list[-1]}"
            else:
                lesion_details += lesion_list[0]
        
        # Check if we have mixed treatment types
        treatment_types_set = set(lesion.treatment_type for lesion in lesions)
        
        if len(treatment_types_set) == 1:
            # Single treatment type for all lesions
            if "SRS" in treatment_types_set:
                treatment_type_text = "stereotactic radiosurgery (SRS)"
            else:  # SRT
                treatment_type_text = "stereotactic radiotherapy (SRT)"
        else:
            # Mixed treatment types
            treatment_type_text = "mixed SRS/SRT treatment"
        
        # Generate the write-up
        writeup = self._generate_intro_paragraph(
            physician, lesion_details, treatment_type_text,
            data.planning_system, data.accelerator, data.tracking_system
        )
        
        writeup += "\n\n"
        writeup += self._generate_simulation_paragraph(
            physician, physicist, data.immobilization_device,
            data.ct_slice_thickness, data.mri_sequence,
            data.planning_system, data.ct_localization
        )
        
        writeup += "\n\n"
        writeup += self._generate_planning_paragraph(lesions)
        
        writeup += "\n\n"
        writeup += self._generate_closing_paragraph(physician, physicist)
        
        return SRSGenerateResponse(writeup=writeup)

    def _generate_intro_paragraph(self, physician: str, lesion_details: str,
                                   treatment_type: str, planning_system: str,
                                   accelerator: str, tracking_system: str) -> str:
        """Generate introduction paragraph."""
        text = f"Dr. {physician} requested a medical physics consultation for --- for an MRI image fusion and {treatment_type}. "
        text += f"The patient has {lesion_details}. "
        text += f"Dr. {physician} has elected to treat with a {treatment_type} technique "
        text += f"by means of the {planning_system} treatment planning system in conjunction with the "
        text += f"{accelerator} linear accelerator equipped with the {tracking_system} system."
        return text

    def _generate_simulation_paragraph(self, physician: str, physicist: str,
                                       immobilization_device: str, ct_slice_thickness: float,
                                       mri_sequence: str, planning_system: str,
                                       ct_localization: bool) -> str:
        """Generate simulation and imaging paragraph."""
        text = f"Days before radiation delivery, a {immobilization_device} was constructed of the patient and was then "
        text += f"fixated onto a stereotactic carbon fiber frame base. Dr. {physician} was present to verify correct "
        text += f"construction of the head mask. A high resolution CT scan ({self._format_number(ct_slice_thickness)}mm slice thickness) was then acquired. "
        
        # MRI fusion paragraph
        text += f"In addition, a previous high resolution MR image set ({mri_sequence} scan) was acquired. "
        text += f"The MR images and CT images were fused within the {planning_system} treatment planning system platform "
        text += f"where a rigid body fusion was performed. The fusion was validated using nearby anatomical landmarks. "
        
        # CT localization (if included)
        if ct_localization:
            text += f"CT images were also localized in {planning_system}. "
        
        # Approval statement
        text += f"Fusion and structure segmentation were reviewed by Dr. {physician} and Dr. {physicist}."
        
        return text

    def _format_deviation(self, deviation: str) -> str:
        """Format deviation text for display."""
        if deviation == "none":
            return ""
        elif deviation == "minor":
            return " [Minor Deviation]"
        else:  # major
            return " [MAJOR DEVIATION]"

    def _generate_planning_paragraph(self, lesions: List) -> str:
        """Generate treatment planning paragraph with metrics and deviations."""
        # Calculate deviations for all lesions
        all_deviations = []
        for lesion in lesions:
            ci_dev, gi_dev = lesion.calculate_deviations()
            all_deviations.append((ci_dev, gi_dev))
        
        if len(lesions) == 1:
            # Single lesion case
            lesion = lesions[0]
            ci_dev, gi_dev = all_deviations[0]
            
            text = f"A radiotherapy treatment plan was developed to deliver the prescribed dose to the periphery of the lesion. "
            text += f"The treatment plan was optimized such that the prescription isodose volume geometrically matched "
            text += f"the planning target volume (PTV) and that the lower isodose volumes spared the healthy brain tissue. "
            text += f"The following summarizes the plan parameters:\n\n"
            
            # Get fraction text specific to this lesion using helper
            fraction_word = self._format_fractions(lesion.fractions)
            
            # Plain text metrics with deviation annotations
            text += f"• Rx Dose: {self._format_number(lesion.dose)} Gy in {lesion.fractions} {fraction_word}\n"
            text += f"• Target Volume: {self._format_number(lesion.volume)} cc\n"
            text += f"• Location: {lesion.site}\n"
            text += f"• Rx Isodose: {self._format_number(lesion.prescription_isodose)}%\n"
            text += f"• PTV Coverage: {self._format_number(lesion.ptv_coverage)}%\n"
            text += f"• Conformity Index: {self._format_number(lesion.conformity_index, 2)}{self._format_deviation(ci_dev)}\n"
            text += f"• Gradient Index: {self._format_number(lesion.gradient_index, 2)}{self._format_deviation(gi_dev)}\n"
            text += f"• Maximum Dose: {self._format_number(lesion.max_dose)}%"
            
            # Add deviation summary if any deviations exist
            if ci_dev != "none" or gi_dev != "none":
                text += "\n\n"
                text += self._generate_deviation_summary([(lesion, ci_dev, gi_dev)])
        else:
            # Multiple lesion case
            text = f"A radiotherapy treatment plan was developed to deliver the prescribed doses to the periphery of each lesion. "
            text += f"The treatment plan was optimized such that each prescription isodose volume geometrically matched "
            text += f"the corresponding planning target volume (PTV) and that the lower isodose volumes spared the healthy brain tissue. "
            text += f"The following summarizes the plan parameters for each lesion:\n\n"
            
            # Collect deviations for summary
            deviation_data = []
            
            # Add row for each lesion
            for i, lesion in enumerate(lesions):
                ci_dev, gi_dev = all_deviations[i]
                deviation_data.append((lesion, ci_dev, gi_dev))
                
                fraction_word = self._format_fractions(lesion.fractions)
                text += f"Lesion {i+1}: {lesion.site}\n"
                text += f"• Volume: {self._format_number(lesion.volume)} cc\n"
                text += f"• Dose: {self._format_number(lesion.dose)} Gy in {lesion.fractions} {fraction_word}\n"
                text += f"• Rx Isodose: {self._format_number(lesion.prescription_isodose)}%\n"
                text += f"• PTV Coverage: {self._format_number(lesion.ptv_coverage)}%\n"
                text += f"• Conformity Index: {self._format_number(lesion.conformity_index, 2)}{self._format_deviation(ci_dev)}\n"
                text += f"• Gradient Index: {self._format_number(lesion.gradient_index, 2)}{self._format_deviation(gi_dev)}\n"
                text += f"• Maximum Dose: {self._format_number(lesion.max_dose)}%\n"
                if i < len(lesions) - 1:
                    text += "\n"
            
            # Check if all fractions are the same
            fractions_set = set(lesion.fractions for lesion in lesions)
            treatment_types_set = set(lesion.treatment_type for lesion in lesions)
            
            if len(fractions_set) == 1 and len(treatment_types_set) == 1:
                # All lesions have the same fractionation
                fraction_word = self._format_fractions(lesions[0].fractions)
                if lesions[0].treatment_type == "SRS":
                    text += f"\nAll lesions will be treated in a single {fraction_word}."
                else:
                    text += f"\nAll lesions will be treated in {lesions[0].fractions} {fraction_word}."
            else:
                # Mixed fractionation
                text += f"\nLesions will be treated according to their individual fractionation schedules as shown above."
            
            # Add deviation summary if any deviations exist
            has_deviations = any(ci != "none" or gi != "none" for _, ci, gi in deviation_data)
            if has_deviations:
                text += "\n\n"
                text += self._generate_deviation_summary(deviation_data)
        
        return text

    def _generate_deviation_summary(self, deviation_data: List) -> str:
        """Generate a summary of plan deviations with clinical context."""
        minor_deviations = []
        major_deviations = []
        
        for lesion, ci_dev, gi_dev in deviation_data:
            if ci_dev == "minor":
                minor_deviations.append(f"CI for {lesion.site} ({self._format_number(lesion.conformity_index, 2)})")
            elif ci_dev == "major":
                major_deviations.append(f"CI for {lesion.site} ({self._format_number(lesion.conformity_index, 2)})")
            
            if gi_dev == "minor":
                minor_deviations.append(f"GI for {lesion.site} ({self._format_number(lesion.gradient_index, 2)})")
            elif gi_dev == "major":
                major_deviations.append(f"GI for {lesion.site} ({self._format_number(lesion.gradient_index, 2)})")
        
        text = "Plan Quality Assessment:\n"
        
        if not minor_deviations and not major_deviations:
            text += "All plan metrics are within acceptable limits."
        else:
            if major_deviations:
                text += f"MAJOR DEVIATIONS: {', '.join(major_deviations)}. "
                text += "These values exceed protocol limits and may require clinical justification.\n"
            
            if minor_deviations:
                text += f"Minor Deviations: {', '.join(minor_deviations)}. "
                text += "These values are within acceptable clinical variation."
        
        return text

    def _generate_closing_paragraph(self, physician: str, physicist: str) -> str:
        """Generate closing paragraph."""
        text = f"Calculations and data analysis were reviewed and approved by both the prescribing radiation oncologist, "
        text += f"Dr. {physician}, and the radiation oncology physicist, Dr. {physicist}."
        return text
