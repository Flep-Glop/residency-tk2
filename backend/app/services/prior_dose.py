from app.schemas.prior_dose import PriorDoseRequest, PriorDoseResponse, PriorTreatment
from typing import List
from datetime import datetime

class PriorDoseService:
    """Service for generating prior dose write-ups."""
    
    def __init__(self):
        """Initialize the Prior Dose service."""
        # Common treatment sites (matching the old prior_dose.py)
        self.treatment_sites = [
            "brain", "head and neck", "thorax", "breast", "lung", 
            "liver", "pancreas", "abdomen", "pelvis", "prostate", 
            "endometrium", "cervix", "rectum", "spine", "extremity"
        ]
        
        # QUANTEC/Timmerman constraint mapping
        # Key format: (current_site, prior_site) -> list of constraint dicts
        self.constraint_map = {
            # Lung/thoracic treatments
            ("lung", "lung"): [
                {"structure": "Spinal Cord", "constraint": "Max dose (0.03cc)", "source": "Timmerman"},
                {"structure": "Bilateral Lungs", "constraint": "V20Gy", "source": "QUANTEC"},
                {"structure": "Bilateral Lungs", "constraint": "Mean Lung Dose", "source": "QUANTEC"}
            ],
            ("lung", "thorax"): [
                {"structure": "Spinal Cord", "constraint": "Max dose (0.03cc)", "source": "Timmerman"},
                {"structure": "Bilateral Lungs", "constraint": "V20Gy", "source": "QUANTEC"},
                {"structure": "Bilateral Lungs", "constraint": "Mean Lung Dose", "source": "QUANTEC"}
            ],
            ("thorax", "lung"): [
                {"structure": "Spinal Cord", "constraint": "Max dose (0.03cc)", "source": "Timmerman"},
                {"structure": "Bilateral Lungs", "constraint": "V20Gy", "source": "QUANTEC"},
                {"structure": "Esophagus", "constraint": "Mean dose", "source": "QUANTEC"}
            ],
            ("thorax", "thorax"): [
                {"structure": "Spinal Cord", "constraint": "Max dose (0.03cc)", "source": "Timmerman"},
                {"structure": "Bilateral Lungs", "constraint": "V20Gy", "source": "QUANTEC"},
                {"structure": "Heart", "constraint": "Mean dose", "source": "QUANTEC"}
            ],
            # Head and neck / brain treatments
            ("head and neck", "brain"): [
                {"structure": "Brainstem", "constraint": "Max dose (0.03cc)", "source": "QUANTEC"},
                {"structure": "Optic Chiasm", "constraint": "Max dose", "source": "QUANTEC"},
                {"structure": "Spinal Cord", "constraint": "Max dose (0.03cc)", "source": "Timmerman"}
            ],
            ("brain", "head and neck"): [
                {"structure": "Brainstem", "constraint": "Max dose (0.03cc)", "source": "QUANTEC"},
                {"structure": "Optic Chiasm", "constraint": "Max dose", "source": "QUANTEC"},
                {"structure": "Optic Nerves", "constraint": "Max dose", "source": "QUANTEC"}
            ],
            ("brain", "brain"): [
                {"structure": "Brainstem", "constraint": "Max dose (0.03cc)", "source": "QUANTEC"},
                {"structure": "Optic Chiasm", "constraint": "Max dose", "source": "QUANTEC"},
                {"structure": "Optic Nerves", "constraint": "Max dose", "source": "QUANTEC"}
            ],
            # Abdominal/pelvic treatments
            ("abdomen", "abdomen"): [
                {"structure": "Spinal Cord", "constraint": "Max dose (0.03cc)", "source": "Timmerman"},
                {"structure": "Liver", "constraint": "Mean dose", "source": "QUANTEC"},
                {"structure": "Kidneys", "constraint": "Mean dose (bilateral)", "source": "QUANTEC"}
            ],
            ("liver", "abdomen"): [
                {"structure": "Spinal Cord", "constraint": "Max dose (0.03cc)", "source": "Timmerman"},
                {"structure": "Liver", "constraint": "Mean dose", "source": "QUANTEC"},
                {"structure": "Stomach", "constraint": "Max dose (0.03cc)", "source": "Timmerman"}
            ],
            ("pelvis", "pelvis"): [
                {"structure": "Rectum", "constraint": "V50Gy", "source": "QUANTEC"},
                {"structure": "Bladder", "constraint": "V65Gy", "source": "QUANTEC"},
                {"structure": "Femoral Heads", "constraint": "V50Gy (bilateral)", "source": "QUANTEC"}
            ],
            # Spine treatments
            ("spine", "spine"): [
                {"structure": "Spinal Cord", "constraint": "Max dose (0.03cc)", "source": "Timmerman"},
                {"structure": "Cauda Equina", "constraint": "Max dose (0.03cc)", "source": "Timmerman"},
                {"structure": "Esophagus", "constraint": "Max dose (0.03cc)", "source": "Timmerman"}
            ]
        }

    def _get_relevant_constraints(self, current_site: str, prior_site: str) -> List[dict]:
        """Get relevant dose constraints based on current and prior treatment sites.
        
        Args:
            current_site: Current treatment site
            prior_site: Prior treatment site
            
        Returns:
            List of constraint dictionaries with structure, constraint, and source
        """
        # Direct lookup
        key = (current_site, prior_site)
        if key in self.constraint_map:
            return self.constraint_map[key]
        
        # Try reverse lookup (if not found, prior/current order might work)
        reverse_key = (prior_site, current_site)
        if reverse_key in self.constraint_map:
            return self.constraint_map[reverse_key]
        
        # No specific mapping found - return generic spinal cord constraint if applicable
        if current_site != "extremity" and prior_site != "extremity":
            return [
                {"structure": "Spinal Cord", "constraint": "Max dose (0.03cc)", "source": "Timmerman"},
                {"structure": "Adjacent critical structures", "constraint": "Per QUANTEC", "source": "QUANTEC"},
                {"structure": "Overlapping normal tissue", "constraint": "Composite dose evaluation", "source": "Clinical judgment"}
            ]
        
        return []
    
    def _format_constraint_section(self, constraints: List[dict]) -> str:
        """Format constraint section for writeup with blank spaces for physicist to fill in.
        
        Args:
            constraints: List of constraint dictionaries
            
        Returns:
            Formatted constraint text with blanks
        """
        if not constraints:
            return ""
        
        section = "\n\nDose Constraint Evaluation:\n"
        for constraint in constraints:
            section += f"• {constraint['structure']} - {constraint['constraint']}: _______ ({constraint['source']})\n"
        
        return section
    
    def generate_prior_dose_writeup(self, request: PriorDoseRequest) -> PriorDoseResponse:
        """Generate a prior dose write-up based on the request data."""
        # DEBUG: Log the incoming request data
        print(f"\nDEBUG: generate_prior_dose_writeup called!")
        print(f"DEBUG: Physician: {request.common_info.physician.name}")
        print(f"DEBUG: Current site: {request.prior_dose_data.current_site}")
        print(f"DEBUG: Current dose: {request.prior_dose_data.current_dose} Gy in {request.prior_dose_data.current_fractions} fractions")
        print(f"DEBUG: Prior treatments ({len(request.prior_dose_data.prior_treatments)}):")
        for i, treatment in enumerate(request.prior_dose_data.prior_treatments):
            overlap_status = "OVERLAP" if treatment.has_overlap else "no overlap"
            print(f"  [{i+1}] {treatment.site}: {treatment.dose} Gy in {treatment.fractions} fx ({treatment.month} {treatment.year}) - {overlap_status}")
        print(f"DEBUG: Dose calc method: {request.prior_dose_data.dose_calc_method}")
        
        common_info = request.common_info
        prior_dose_data = request.prior_dose_data
        
        # Generate write-up using the same pattern detection logic as fusion
        writeup = self._generate_prior_dose_text(common_info, prior_dose_data)
        
        return PriorDoseResponse(writeup=writeup)
    
    def _generate_prior_dose_text(self, common_info, prior_dose_data) -> str:
        """Generate the prior dose text following fusion's pattern-based approach."""
        
        physician = common_info.physician.name
        physicist = common_info.physicist.name
        
        current_site = prior_dose_data.current_site
        current_dose = prior_dose_data.current_dose
        current_fractions = prior_dose_data.current_fractions
        spine_location = prior_dose_data.spine_location or ""
        prior_treatments = prior_dose_data.prior_treatments
        dose_calc_method = prior_dose_data.dose_calc_method
        critical_structures = prior_dose_data.critical_structures
        
        # DETECTION LOGIC (following fusion pattern)
        num_prior_treatments = len(prior_treatments)
        has_spine_location = current_site == "spine" and spine_location
        
        # Check if ANY prior treatment has overlap
        any_overlap = any(t.has_overlap for t in prior_treatments)
        
        print(f"DEBUG: Detection - Prior treatments: {num_prior_treatments}, Any overlap: {any_overlap}")
        
        if num_prior_treatments == 0:
            print("DEBUG: NO PRIOR TREATMENTS DETECTED!")
            return self._generate_no_prior_text(physician, physicist, current_site, current_dose, current_fractions, spine_location)
        elif num_prior_treatments == 1:
            print("DEBUG: SINGLE PRIOR TREATMENT DETECTED!")
            return self._generate_single_prior_text(physician, physicist, current_site, current_dose, current_fractions, spine_location, prior_treatments[0], dose_calc_method, critical_structures, prior_dose_data)
        else:
            print("DEBUG: MULTIPLE PRIOR TREATMENTS DETECTED!")
            return self._generate_multiple_prior_text(physician, physicist, current_site, current_dose, current_fractions, spine_location, prior_treatments, dose_calc_method, critical_structures, prior_dose_data)
    
    def _generate_no_prior_text(self, physician: str, physicist: str, current_site: str, current_dose: float, current_fractions: int, spine_location: str) -> str:
        """Generate text for no prior treatments (basic case)."""
        
        # Format site with spine location if applicable
        current_site_display = current_site
        if current_site == "spine" and spine_location:
            current_site_display = f"{spine_location} spine"
        
        # Clean up integers
        current_dose_display = int(current_dose) if current_dose == int(current_dose) else current_dose
        current_fractions_display = int(current_fractions)
        
        # Format treatment
        current_treatment = f"{current_dose_display} Gy in {current_fractions_display} fractions"
        
        writeup = f"Dr. {physician} requested a medical physics consultation for --- for prior dose assessment. "
        writeup += f"The patient is currently being planned for {current_treatment} to the {current_site_display}.\n\n"
        
        writeup += "The patient has no history of prior radiation treatments.\n\n"
        
        writeup += f"The proposed treatment of {current_treatment} to the {current_site_display} can proceed as planned with standard toxicity monitoring. "
        writeup += f"This evaluation was reviewed and approved by the radiation oncologist, Dr. {physician}, and the medical physicist, Dr. {physicist}."
        
        return writeup
    
    def _generate_single_prior_text(self, physician: str, physicist: str, current_site: str, current_dose: float, current_fractions: int, spine_location: str, prior_treatment: PriorTreatment, dose_calc_method: str, critical_structures: List[str], prior_dose_data) -> str:
        """Generate text for single prior treatment."""
        
        # Format current site
        current_site_display = current_site
        if current_site == "spine" and spine_location:
            current_site_display = f"{spine_location} spine"
        
        # Clean up current treatment integers
        current_dose_display = int(current_dose) if current_dose == int(current_dose) else current_dose
        current_fractions_display = int(current_fractions)
        current_treatment = f"{current_dose_display} Gy in {current_fractions_display} fractions"
        
        # Format prior treatment
        prior_dose_display = int(prior_treatment.dose) if prior_treatment.dose == int(prior_treatment.dose) else prior_treatment.dose
        prior_fractions_display = int(prior_treatment.fractions)
        
        prior_site_display = prior_treatment.site
        if prior_treatment.site == "spine" and prior_treatment.spine_location:
            prior_site_display = f"{prior_treatment.spine_location} spine"
        
        # Get method abbreviation
        if dose_calc_method.startswith("BED"):
            method_abbreviation = "BED"
        elif dose_calc_method.startswith("EQD2"):
            method_abbreviation = "EQD2"
        else:
            method_abbreviation = "Raw Dose"
        
        if prior_treatment.has_overlap:
            # STRUCTURED FORMAT FOR OVERLAP CASES
            writeup = f"Dr. {physician} requested a medical physics consultation for prior dose assessment. This consultation provides dosimetric analysis and planning guidance for composite dose evaluation.\n\n"
            
            # PATIENT INFORMATION
            writeup += f"Patient Information:\n"
            writeup += f"Patient with {current_site_display} lesion, currently planned for {current_dose_display} Gy in {current_fractions_display} fractions to the {current_site_display}.\n\n"
            
            # PRIOR RADIATION HISTORY
            writeup += f"Prior Radiation History:\n"
            writeup += f"In {prior_treatment.month} {prior_treatment.year}, the patient received external beam radiotherapy of {prior_dose_display} Gy in {prior_fractions_display} fractions to the {prior_site_display}. "
            writeup += f"The current course of treatment has overlap with the previous treatment"
            if critical_structures:
                writeup += f" on the {', '.join(critical_structures)}"
            writeup += f".\n\n"
            
            # METHODOLOGY
            writeup += f"Methodology:\n"
            writeup += f"The previous treatment was reconstructed on the current patient CT for summation with the current plan in Velocity. "
            writeup += f"Dose constraints are evaluated using {method_abbreviation} with an alpha/beta ratio of 2 for spinal cord and 3 for all other organs at risk.\n"
            
            # DOSE CONSTRAINT EVALUATION
            constraints = self._get_relevant_constraints(current_site, prior_treatment.site)
            dose_statistics = prior_dose_data.dose_statistics if hasattr(prior_dose_data, 'dose_statistics') else []
            
            if constraints:
                writeup += f"\nDose Constraint Evaluation:\n"
                for constraint in constraints:
                    # Check if we have a dose statistic for this constraint
                    stat_value = "_______"
                    for stat in dose_statistics:
                        if stat.structure == constraint['structure'] and stat.constraint_type == constraint['constraint']:
                            stat_value = stat.value if stat.value else "_______"
                            break
                    
                    writeup += f"• {constraint['structure']} - {constraint['constraint']}: {stat_value} ({constraint['source']})\n"
            
            # ASSESSMENT
            writeup += f"\nAssessment:\n"
            writeup += f"[IF ALL CONSTRAINTS MET:]\n"
            writeup += f"Composite dose analysis demonstrates acceptable normal tissue doses within institutional constraints.\n\n"
            writeup += f"[IF ANY CONSTRAINT EXCEEDED - auto-populate structure name and value:]\n"
            writeup += f"[Structure] [constraint type] of [value] exceeds [reference] guidelines. However, given prior radiation exposure and overlap with current treatment volume, the elevated dose was reviewed and deemed acceptable by the treating physicians.\n\n"
            writeup += f"The composite dose distribution and DVH are shown below. The findings were reviewed and approved by Dr. {physician} and Dr. {physicist}.\n\n"
            writeup += f"[Figures]"
        else:
            # NO OVERLAP CASE - simpler format
            writeup = f"Dr. {physician} requested a medical physics consultation for prior dose assessment.\n\n"
            
            writeup += f"Patient Information:\n"
            writeup += f"Patient with {current_site_display} lesion, currently planned for {current_dose_display} Gy in {current_fractions_display} fractions to the {current_site_display}.\n\n"
            
            writeup += f"Prior Radiation History:\n"
            writeup += f"In {prior_treatment.month} {prior_treatment.year}, the patient received external beam radiotherapy of {prior_dose_display} Gy in {prior_fractions_display} fractions to the {prior_site_display}.\n\n"
            
            writeup += f"Assessment:\n"
            writeup += f"Review of the prior treatment fields and current treatment plan indicates minimal to no overlap between treatment volumes. "
            writeup += f"The distance between field edges is sufficient to ensure that critical structures will not receive excessive cumulative dose. "
            writeup += f"The proposed treatment can proceed as planned with standard toxicity monitoring. "
            writeup += f"This evaluation was reviewed and approved by Dr. {physician} and Dr. {physicist}."
        
        return writeup
    
    def _generate_multiple_prior_text(self, physician: str, physicist: str, current_site: str, current_dose: float, current_fractions: int, spine_location: str, prior_treatments: List[PriorTreatment], dose_calc_method: str, critical_structures: List[str], prior_dose_data) -> str:
        """Generate text for multiple prior treatments."""
        
        # Format current site
        current_site_display = current_site
        if current_site == "spine" and spine_location:
            current_site_display = f"{spine_location} spine"
        
        # Clean up current treatment integers
        current_dose_display = int(current_dose) if current_dose == int(current_dose) else current_dose
        current_fractions_display = int(current_fractions)
        current_treatment = f"{current_dose_display} Gy in {current_fractions_display} fractions"
        
        # Check if ANY treatment has overlap
        overlapping_treatments = [t for t in prior_treatments if t.has_overlap]
        
        # Get method abbreviation
        if dose_calc_method.startswith("BED"):
            method_abbreviation = "BED"
        elif dose_calc_method.startswith("EQD2"):
            method_abbreviation = "EQD2"
        else:
            method_abbreviation = "Raw Dose"
        
        if overlapping_treatments:
            # STRUCTURED FORMAT FOR OVERLAP CASES
            writeup = f"Dr. {physician} requested a medical physics consultation for prior dose assessment. This consultation provides dosimetric analysis and planning guidance for composite dose evaluation.\n\n"
            
            # PATIENT INFORMATION
            writeup += f"Patient Information:\n"
            writeup += f"Patient with {current_site_display} lesion, currently planned for {current_dose_display} Gy in {current_fractions_display} fractions to the {current_site_display}.\n\n"
            
            # PRIOR RADIATION HISTORY
            writeup += f"Prior Radiation History:\n"
            for i, treatment in enumerate(prior_treatments):
                prior_dose_display = int(treatment.dose) if treatment.dose == int(treatment.dose) else treatment.dose
                prior_fractions_display = int(treatment.fractions)
                
                prior_site_display = treatment.site
                if treatment.site == "spine" and treatment.spine_location:
                    prior_site_display = f"{treatment.spine_location} spine"
                
                writeup += f"In {treatment.month} {treatment.year}, the patient received external beam radiotherapy of {prior_dose_display} Gy in {prior_fractions_display} fractions to the {prior_site_display}.\n"
            
            # Add overlap statement
            writeup += f"The current course of treatment has overlap with "
            if len(overlapping_treatments) == 1:
                writeup += f"one of the previous treatments"
            else:
                writeup += f"{len(overlapping_treatments)} of the previous treatments"
            
            if critical_structures:
                writeup += f" on the {', '.join(critical_structures)}"
            writeup += f".\n\n"
            
            # METHODOLOGY
            writeup += f"Methodology:\n"
            writeup += f"The previous treatment(s) were reconstructed on the current patient CT for summation with the current plan in Velocity. "
            writeup += f"Dose constraints are evaluated using {method_abbreviation} with an alpha/beta ratio of 2 for spinal cord and 3 for all other organs at risk.\n"
            
            # DOSE CONSTRAINT EVALUATION
            # Collect unique constraints from all overlapping treatments
            all_constraints = {}
            for treatment in overlapping_treatments:
                constraints = self._get_relevant_constraints(current_site, treatment.site)
                for constraint in constraints:
                    # Use structure name as key to avoid duplicates
                    key = f"{constraint['structure']}_{constraint['constraint']}"
                    if key not in all_constraints:
                        all_constraints[key] = constraint
            
            dose_statistics = prior_dose_data.dose_statistics if hasattr(prior_dose_data, 'dose_statistics') else []
            
            if all_constraints:
                writeup += f"\nDose Constraint Evaluation:\n"
                for constraint in all_constraints.values():
                    # Check if we have a dose statistic for this constraint
                    stat_value = "_______"
                    for stat in dose_statistics:
                        if stat.structure == constraint['structure'] and stat.constraint_type == constraint['constraint']:
                            stat_value = stat.value if stat.value else "_______"
                            break
                    
                    writeup += f"• {constraint['structure']} - {constraint['constraint']}: {stat_value} ({constraint['source']})\n"
            
            # ASSESSMENT
            writeup += f"\nAssessment:\n"
            writeup += f"[IF ALL CONSTRAINTS MET:]\n"
            writeup += f"Composite dose analysis demonstrates acceptable normal tissue doses within institutional constraints.\n\n"
            writeup += f"[IF ANY CONSTRAINT EXCEEDED - auto-populate structure name and value:]\n"
            writeup += f"[Structure] [constraint type] of [value] exceeds [reference] guidelines. However, given prior radiation exposure and overlap with current treatment volume, the elevated dose was reviewed and deemed acceptable by the treating physicians.\n\n"
            writeup += f"The composite dose distribution and DVH are shown below. The findings were reviewed and approved by Dr. {physician} and Dr. {physicist}.\n\n"
            writeup += f"[Figures]"
        else:
            # NO OVERLAP CASE - simpler format
            writeup = f"Dr. {physician} requested a medical physics consultation for prior dose assessment.\n\n"
            
            writeup += f"Patient Information:\n"
            writeup += f"Patient with {current_site_display} lesion, currently planned for {current_dose_display} Gy in {current_fractions_display} fractions to the {current_site_display}.\n\n"
            
            writeup += f"Prior Radiation History:\n"
            for i, treatment in enumerate(prior_treatments):
                prior_dose_display = int(treatment.dose) if treatment.dose == int(treatment.dose) else treatment.dose
                prior_fractions_display = int(treatment.fractions)
                
                prior_site_display = treatment.site
                if treatment.site == "spine" and treatment.spine_location:
                    prior_site_display = f"{treatment.spine_location} spine"
                
                writeup += f"In {treatment.month} {treatment.year}, the patient received external beam radiotherapy of {prior_dose_display} Gy in {prior_fractions_display} fractions to the {prior_site_display}.\n"
            
            writeup += f"\nAssessment:\n"
            writeup += f"Review of the prior treatment fields and current treatment plan indicates minimal to no overlap between treatment volumes. "
            writeup += f"The distance between field edges is sufficient to ensure that critical structures will not receive excessive cumulative dose. "
            writeup += f"The proposed treatment can proceed as planned with standard toxicity monitoring. "
            writeup += f"This evaluation was reviewed and approved by Dr. {physician} and Dr. {physicist}."
        
        return writeup