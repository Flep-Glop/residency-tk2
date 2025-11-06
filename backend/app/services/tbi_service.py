from app.schemas.tbi_schemas import TBIGenerateRequest, TBIGenerateResponse
from typing import List, Dict

class TBIService:
    def __init__(self):
        # Common TBI fractionation schemes
        self.fractionation_schemes = [
            {"dose": 12.0, "fractions": 6, "description": "12 Gy in 6 fractions"},
            {"dose": 12.0, "fractions": 8, "description": "12 Gy in 8 fractions (BID)"},
            {"dose": 2.0, "fractions": 1, "description": "2 Gy in 1 fraction"},
        ]
        
        self.setup_options = ["AP/PA", "Lateral"]

    def get_fractionation_schemes(self) -> List[Dict]:
        """Return list of common TBI fractionation schemes."""
        return self.fractionation_schemes

    def get_setup_options(self) -> List[str]:
        """Return list of setup options."""
        return self.setup_options

    def generate_tbi_writeup(self, request: TBIGenerateRequest) -> TBIGenerateResponse:
        """Generate TBI write-up based on the provided data."""
        # Extract common info
        physician = request.common_info.physician.name
        physicist = request.common_info.physicist.name
        
        # Extract TBI data
        data = request.tbi_data
        
        # Generate the write-up
        writeup = self._generate_intro_paragraph(
            physician, data.diagnosis, data.indication
        )
        
        writeup += "\n\n"
        writeup += self._generate_treatment_paragraph(
            data.setup, data.energy, data.prescription_dose,
            data.fractions, data.dose_rate_range, data.machine_dose_rate,
            data.lung_blocks
        )
        
        writeup += "\n\n"
        writeup += self._generate_closing_paragraph()
        
        return TBIGenerateResponse(writeup=writeup)

    def _generate_intro_paragraph(self, physician: str, diagnosis: str, indication: str) -> str:
        """Generate introduction paragraph."""
        text = f"Dr. {physician} requested a medical physics consultation for ---. "
        text += f"The patient has {diagnosis} and is now referred to us for consideration of TBI for {indication}."
        return text

    def _generate_treatment_paragraph(self, setup: str, energy: str,
                                      prescription_dose: float, fractions: int,
                                      dose_rate_range: str, machine_dose_rate: str,
                                      lung_blocks: bool) -> str:
        """Generate treatment description paragraph."""
        # Determine if single or multiple fractions
        if fractions == 1:
            fraction_text = "1 fraction"
        else:
            fraction_text = f"{fractions} fractions"
        
        # Format dose (remove trailing zeros)
        dose_str = self._format_number(prescription_dose)
        
        # Setup description
        if setup == "AP/PA":
            setup_text = "two AP/PA"
        elif setup == "Lateral":
            setup_text = "two lateral"
        else:
            setup_text = f"two {setup}"
        
        text = f"The patient will be treated using {setup_text} {energy} fields that will deliver "
        text += f"a prescribed dose of {dose_str} Gy to the patient's midline in {fraction_text}. "
        text += f"The dose delivery rate is between {dose_rate_range} using a machine dose rate of {machine_dose_rate}. "
        text += f"During simulation, patient measurements were made throughout the body ranging from the head to the feet"
        
        # Add lung blocks information if applicable
        if lung_blocks:
            text += ", and lung blocks were fabricated to reduce the dose to the lungs. "
            text += f"These measurements were used to create customized compensating aluminum filters to ensure that the intended dose to midline will be met. "
        else:
            text += " and were used to create customized compensating aluminum filters to ensure that the intended dose to midline will be met. "
        
        text += f"During treatment, diode dosimeters have been placed throughout the patient's body to verify the delivered dose."
        
        return text

    def _generate_closing_paragraph(self) -> str:
        """Generate closing paragraph."""
        text = "The plan, calculations and measurements were reviewed by the prescribing physician and the medical physicist."
        return text

    def _format_number(self, value, decimal_places=1):
        """Format number removing unnecessary trailing zeros."""
        if isinstance(value, (int, float)):
            formatted = f"{value:.{decimal_places}f}".rstrip('0').rstrip('.')
            if '.' not in formatted:
                return formatted
            return formatted
        return str(value)

