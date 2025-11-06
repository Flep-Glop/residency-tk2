from app.schemas.sbrt_schemas import SBRTGenerateRequest, SBRTGenerateResponse, SBRTValidateRequest, SBRTValidateResponse
from typing import List, Dict, Any

class SBRTService:
    def __init__(self):
        self.treatment_sites = [
            "bone", "kidney", "liver", "lung", "prostate", "spine"
        ]
        
        self.dose_constraints = {
            "lung": {
                "Spinal Cord": "Dmax < 18 Gy",
                "Esophagus": "Dmax < 27 Gy",
                "Brachial Plexus": "Dmax < 24 Gy",
                "Heart": "Dmax < 30 Gy",
                "Trachea": "Dmax < 30 Gy",
                "Great vessels": "Dmax < 39 Gy"
            },
            "liver": {
                "Liver (normal)": "V15 < 700 cc",
                "Spinal Cord": "Dmax < 18 Gy",
                "Stomach": "Dmax < 30 Gy",
                "Duodenum": "Dmax < 24 Gy",
                "Kidney": "V12 < 25%",
                "Small Bowel": "Dmax < 27 Gy"
            },
            "spine": {
                "Spinal Cord": "Dmax < 14 Gy",
                "Cauda Equina": "Dmax < 16 Gy",
                "Esophagus": "Dmax < 15 Gy",
                "Kidney": "V12 < 25%"
            },

            "prostate": {
                "Rectum": "V36 < 1 cc",
                "Bladder": "V37 < 10 cc",
                "Urethra": "V37 < 0.5 cc",
                "Femoral Head": "V24 < 3 cc"
            },
            "kidney": {
                "Spinal Cord": "Dmax < 18 Gy",
                "Small Bowel": "Dmax < 27 Gy",
                "Contralateral Kidney": "V12 < 25%",
                "Liver": "V15 < 700 cc"
            },

            "bone": {
                "Spinal Cord": "Dmax < 18 Gy",
                "Small Bowel": "Dmax < 27 Gy",
                "Kidney": "V12 < 25%"
            }
        }
        
        self.fractionation_schemes = {
            "spine": [
                {"dose": 24, "fractions": 3, "description": "Standard dose"},
                {"dose": 27, "fractions": 3, "description": "High dose"},
                {"dose": 30, "fractions": 5, "description": "Moderate dose/5fx"}
            ],
            "lung": [
                {"dose": 50, "fractions": 5, "description": "Standard dose"},
                {"dose": 54, "fractions": 3, "description": "High dose/3fx"},
                {"dose": 60, "fractions": 8, "description": "Moderate dose/8fx"}
            ],
            "liver": [
                {"dose": 45, "fractions": 3, "description": "Standard dose"},
                {"dose": 50, "fractions": 5, "description": "Alternative (5fx)"}
            ],

            "prostate": [
                {"dose": 36.25, "fractions": 5, "description": "Standard dose"}
            ],

            "kidney": [
                {"dose": 40, "fractions": 5, "description": "Standard dose"},
                {"dose": 42, "fractions": 6, "description": "Alternative (6fx)"}
            ],
            "bone": [
                {"dose": 30, "fractions": 5, "description": "Standard dose"},
                {"dose": 24, "fractions": 3, "description": "High dose/3fx"}
            ],

        }

    def get_treatment_sites(self) -> List[str]:
        return self.treatment_sites

    def get_dose_constraints(self, site: str) -> Dict[str, Any]:
        return self._get_dose_constraints(site)
    
    def _get_dose_constraints(self, site: str) -> Dict[str, Any]:
        """Get dose constraints for a specific treatment site."""
        constraints = self.dose_constraints.get(site.lower())
        if not constraints:
            return {"error": f"No dose constraints found for site: {site}. Ensure site is one of {self.treatment_sites}"}
        return constraints

    def get_fractionation_schemes(self, site: str) -> List[Dict[str, Any]]:
        schemes = self.fractionation_schemes.get(site)
        if not schemes:
            return [{"error": f"No fractionation schemes found for site: {site}. Ensure site is one of {self.treatment_sites}"}]
        return schemes

    def generate_sbrt_writeup(self, request: SBRTGenerateRequest) -> SBRTGenerateResponse:
        """Generate SBRT write-up using frontend form data directly (like fusion system)."""
        # Extract common info
        physician = request.common_info.physician.name
        physicist = request.common_info.physicist.name
        
        # Extract SBRT data (using frontend field names directly)
        data = request.sbrt_data
        treatment_site = data.treatment_site
        dose = data.dose
        fractions = data.fractions
        breathing_technique = data.breathing_technique
        target_name = data.target_name
        oligomet_location = data.oligomet_location or ""
        
        # Convert string form values to numbers for calculations
        ptv_volume = float(data.ptv_volume) if data.ptv_volume else 0
        vol_ptv_receiving_rx = float(data.vol_ptv_receiving_rx) if data.vol_ptv_receiving_rx else 0
        vol_100_rx_isodose = float(data.vol_100_rx_isodose) if data.vol_100_rx_isodose else 0
        
        # Get calculated metrics from frontend
        calculated_metrics = data.calculated_metrics
        if calculated_metrics:
            coverage = float(calculated_metrics.coverage)
            conformity_index = float(calculated_metrics.conformityIndex)
            r50 = float(calculated_metrics.r50)
            gradient_measure = float(calculated_metrics.gradientMeasure)
            max_dose_2cm_ring = float(calculated_metrics.maxDose2cmRingPercent)
            homogeneity_index = float(calculated_metrics.homogeneityIndex)
        else:
            # Fallback values if no calculated metrics
            coverage = vol_ptv_receiving_rx
            conformity_index = vol_100_rx_isodose / ptv_volume if ptv_volume > 0 else 1.0
            r50 = 4.0  # Default reasonable value
            gradient_measure = 1.0
            max_dose_2cm_ring = 50.0
            homogeneity_index = 1.0
        
        # Handle anatomical clarification for spine/bone sites
        anatomical_clarification = data.anatomical_clarification if hasattr(data, 'anatomical_clarification') else ""
        lesion_description = treatment_site
        
        # Add anatomical clarification for spine and bone sites
        if (treatment_site in ["spine", "bone"]) and anatomical_clarification:
            lesion_description = f"{anatomical_clarification} {treatment_site}"
        
        # Get SIB data
        is_sib = data.is_sib if hasattr(data, 'is_sib') else False
        sib_comment = data.sib_comment if hasattr(data, 'sib_comment') else ""
        
        # Generate metrics table
        metrics_table = self._generate_metrics_table_simple(
            target_name, ptv_volume, dose, coverage, conformity_index, 
            r50, gradient_measure, max_dose_2cm_ring, homogeneity_index, calculated_metrics, is_sib, sib_comment
        )
        
        # Select template based on breathing technique (case insensitive)
        breathing_technique_lower = breathing_technique.lower()
        if breathing_technique_lower == "4dct":
            writeup = self._generate_4dct_template(
                physician, physicist, lesion_description,
                dose, fractions, target_name, coverage, conformity_index, r50, metrics_table
            )
        elif breathing_technique_lower == "dibh":
            writeup = self._generate_dibh_template(
                physician, physicist, lesion_description,
                dose, fractions, target_name, coverage, conformity_index, r50, metrics_table
            )
        else:  # freebreathe
            writeup = self._generate_freebreathe_template(
                physician, physicist, lesion_description,
                dose, fractions, target_name, coverage, conformity_index, r50, metrics_table
            )
        
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

    def _generate_metrics_table_simple(self, target_name, ptv_volume, dose, coverage, conformity_index, 
                                      r50, gradient_measure, max_dose_2cm_ring, homogeneity_index, calculated_metrics, is_sib=False, sib_comment="") -> str:
        """Generate simplified metrics list using frontend calculated values."""
        
        # Get deviation status from frontend calculations if available
        if calculated_metrics:
            conformity_deviation = calculated_metrics.conformityDeviation
            r50_deviation = calculated_metrics.r50Deviation  
            max_dose_2cm_deviation = calculated_metrics.maxDose2cmDeviation
        else:
            # Fallback to simple deviation calculation
            conformity_deviation = "None" if conformity_index <= 1.2 else "Minor" if conformity_index <= 1.5 else "Major"
            r50_deviation = "None" if r50 <= 4.5 else "Minor" if r50 <= 5.5 else "Major"
            max_dose_2cm_deviation = "None" if max_dose_2cm_ring <= 54.0 else "Minor" if max_dose_2cm_ring <= 63.0 else "Major"
        
        # Helper function to format numbers without unnecessary zeros
        def format_number(value, decimal_places=2):
            """Format number removing unnecessary trailing zeros."""
            if isinstance(value, (int, float)):
                # Round to specified decimal places, then remove trailing zeros
                formatted = f"{value:.{decimal_places}f}".rstrip('0').rstrip('.')
                # If it's a whole number, keep it as integer
                if '.' not in formatted:
                    return formatted
                return formatted
            return str(value)
        
        # Format all the numeric values cleanly
        ptv_vol_clean = format_number(ptv_volume, 2)
        dose_clean = format_number(dose, 1)
        coverage_clean = format_number(coverage, 1)
        conformity_clean = format_number(conformity_index, 2)
        r50_clean = format_number(r50, 2)
        gradient_clean = format_number(gradient_measure, 2)
        max_dose_clean = format_number(max_dose_2cm_ring, 1)
        homogeneity_clean = format_number(homogeneity_index, 2)
        
        # Generate plain text list of metrics with intro
        metrics_text = f"Below are the plan statistics:\n\n"
        metrics_text += f"• Target: {target_name}\n"
        metrics_text += f"• Target Volume: {ptv_vol_clean} cc\n"
        metrics_text += f"• Prescription Dose: {dose_clean} Gy\n"
        metrics_text += f"• Coverage: {coverage_clean}%\n"
        metrics_text += f"• Conformity Index (PITV): {conformity_clean}"
        if not is_sib:
            metrics_text += f" (Deviation: {conformity_deviation})"
        metrics_text += f"\n"
        metrics_text += f"• R50: {r50_clean}"
        if not is_sib:
            metrics_text += f" (Deviation: {r50_deviation})"
        metrics_text += f"\n"
        metrics_text += f"• Gradient Measure: {gradient_clean} cm\n"
        metrics_text += f"• Max Dose in 2cm Ring: {max_dose_clean}%"
        if not is_sib:
            metrics_text += f" (Deviation: {max_dose_2cm_deviation})"
        metrics_text += f"\n"
        metrics_text += f"• Homogeneity Index: {homogeneity_clean}\n"
        
        # Add summary based on deviations
        metrics_text += "\n"
        if is_sib:
            if sib_comment:
                metrics_text += f"This is an SIB case ({sib_comment}). Deviation analysis not applicable for simultaneous integrated boost treatments.\n"
            else:
                metrics_text += f"This is an SIB case. Deviation analysis not applicable for simultaneous integrated boost treatments.\n"
        else:
            # Check if there are any deviations
            deviations = []
            if conformity_deviation == "Major":
                deviations.append(("Conformity Index", conformity_clean, "indicates the prescription isodose volume significantly exceeds the target volume, suggesting poor conformality"))
            elif conformity_deviation == "Minor":
                deviations.append(("Conformity Index", conformity_clean, "shows acceptable conformality with minor deviation from ideal"))
            
            if r50_deviation == "Major":
                deviations.append(("R50", r50_clean, "indicates excessive dose spillage to normal tissue outside the target"))
            elif r50_deviation == "Minor":
                deviations.append(("R50", r50_clean, "shows acceptable dose falloff with minor deviation"))
            
            if max_dose_2cm_deviation == "Major":
                deviations.append(("Max Dose in 2cm Ring", f"{max_dose_clean}%", "indicates high intermediate dose spillage to adjacent normal tissue"))
            elif max_dose_2cm_deviation == "Minor":
                deviations.append(("Max Dose in 2cm Ring", f"{max_dose_clean}%", "shows acceptable intermediate dose with minor deviation"))
            
            if not deviations:
                metrics_text += "No deviations from institutional guidelines were observed. All metrics meet RTOG 0915 compliance criteria for SBRT plan quality.\n"
            else:
                if len(deviations) == 1 and any("Minor" in dev[2] for dev in deviations):
                    metrics_text += f"One minor deviation was noted: {deviations[0][0]} of {deviations[0][1]} {deviations[0][2]}. This deviation is clinically acceptable and does not compromise treatment quality.\n"
                elif all("Minor" in dev[2] for dev in deviations):
                    metrics_text += f"Minor deviations were noted in {len(deviations)} metrics: "
                    metrics_text += ", ".join([f"{dev[0]}" for dev in deviations])
                    metrics_text += ". These minor deviations are clinically acceptable and do not compromise treatment quality.\n"
                else:
                    metrics_text += f"The following deviation(s) were identified:\n"
                    for dev_name, dev_value, dev_explanation in deviations:
                        metrics_text += f"• {dev_name} of {dev_value} {dev_explanation}.\n"
                    metrics_text += "Clinical review and justification recommended before treatment delivery.\n"
        
        return metrics_text

    def _calculate_deviation_status(self, data) -> dict:
        """Calculate deviation status based on clinical tolerance table."""
        ptv_volume = data.ptv_volume
        conformity_index = data.conformity_index
        r50 = data.r50
        max_dose_2cm_ring = data.max_dose_2cm_ring
        
        # Tolerance table from the frontend (representative values)
        tolerance_table = [
            {"ptvVol": 1.8, "conformityNone": 1.2, "conformityMinor": 1.5, "r50None": 5.9, "r50Minor": 7.5, "maxDose2cmNone": 50.0, "maxDose2cmMinor": 57.0},
            {"ptvVol": 22.0, "conformityNone": 1.2, "conformityMinor": 1.5, "r50None": 4.5, "r50Minor": 5.5, "maxDose2cmNone": 54.0, "maxDose2cmMinor": 63.0},
            {"ptvVol": 50.0, "conformityNone": 1.2, "conformityMinor": 1.5, "r50None": 4.0, "r50Minor": 5.0, "maxDose2cmNone": 62.0, "maxDose2cmMinor": 77.0},
            {"ptvVol": 163.0, "conformityNone": 1.2, "conformityMinor": 1.5, "r50None": 2.9, "r50Minor": 3.7, "maxDose2cmNone": 77.0, "maxDose2cmMinor": 94.0}
        ]
        
        # Find closest tolerance values
        closest_tolerance = min(tolerance_table, key=lambda x: abs(x["ptvVol"] - ptv_volume))
        
        def get_deviation(value, none_limit, minor_limit, lower_is_better=True):
            if lower_is_better:
                if value <= none_limit:
                    return "None"
                elif value <= minor_limit:
                    return "Minor"
                else:
                    return "Major"
            else:
                if value >= none_limit:
                    return "None"
                elif value >= minor_limit:
                    return "Minor"
                else:
                    return "Major"
        
        return {
            "coverage": "None",  # Coverage is typically always acceptable if plan is approved
            "conformity": get_deviation(conformity_index, closest_tolerance["conformityNone"], closest_tolerance["conformityMinor"]),
            "r50": get_deviation(r50, closest_tolerance["r50None"], closest_tolerance["r50Minor"]),
            "max_dose_2cm": get_deviation(max_dose_2cm_ring, closest_tolerance["maxDose2cmNone"], closest_tolerance["maxDose2cmMinor"])
        }

    def _generate_4dct_template(self, physician, physicist, lesion_description, 
                               dose, fractions, target_name, coverage, conformity_index, r50, metrics_table) -> str:
        """Generate 4DCT template write-up."""
        return f"""<p>Dr. {physician} requested a medical physics consultation for --- for a 4D CT simulation study and SBRT delivery. Dr. {physician} has elected to treat with a stereotactic body radiotherapy (SBRT) technique by means of the Pinnacle treatment planning system in conjunction with the VersaHD linear accelerator equipped with the kV-CBCT system.</p>

<p>The patient was scanned in our CT simulator in the treatment position (head first supine orientation) with a customized immobilization device to limit motion during treatment and aid in inter-fractional repositioning. Both the prescribing radiation oncologist and radiation oncology physicist evaluated and approved the patient setup. A 4D kVCT simulation scan was performed with the patient immobilized and their breathing limited to reduce tumor motion. Using the 4D dataset, an AIP CT image set and 10 phase CT image sets were reconstructed by the radiation oncology physicist and fused together to regenerate an ITV in order to assess the motion envelope. Dr. {physician} segmented and approved both the PTVs and OARs.</p>

<p>In the treatment planning system, a VMAT treatment plan was developed to conformally deliver a prescribed dose of {dose} Gy in {fractions} fractions ({dose/fractions:.1f} Gy per fraction) to the planning target volume. The treatment plan was inversely optimized such that the prescription isodose volume exactly matched the target volume in all three spatial dimensions and that the dose fell sharply away from the target volume. Normal tissue dose constraints for critical organs associated with the treatment site were reviewed.</p>

{metrics_table}

<p>A quality assurance plan was developed that was subsequently delivered to a phantom geometry. Measurements within the phantom were obtained and compared against the calculated plan to verify the accuracy of the radiation treatment plan. The data analysis showed good agreement between the plan and measurements. Calculations and data analysis were reviewed and approved by both the prescribing radiation oncologist, Dr. {physician}, and the radiation oncology physicist, Dr. {physicist}.</p>"""

    def _generate_freebreathe_template(self, physician, physicist, lesion_description, 
                                     dose, fractions, target_name, coverage, conformity_index, r50, metrics_table) -> str:
        """Generate free breathing template write-up."""
        return f"""<p>Dr. {physician} requested a medical physics consultation for --- for SBRT delivery. Dr. {physician} has elected to treat with a stereotactic body radiotherapy (SBRT) technique by means of the Pinnacle treatment planning system in conjunction with the VersaHD linear accelerator equipped with the kV-CBCT system.</p>

<p>The patient was scanned in our CT simulator in the treatment position (head first supine orientation) with a customized immobilization device to limit motion during treatment and aid in inter-fractional repositioning. Both the prescribing radiation oncologist and radiation oncology physicist evaluated and approved the patient setup. Dr. {physician} segmented and approved both the PTVs and OARs.</p>

<p>In the treatment planning system, a VMAT treatment plan was developed to conformally deliver a prescribed dose of {dose} Gy in {fractions} fractions ({dose/fractions:.1f} Gy per fraction) to the planning target volume. The treatment plan was inversely optimized such that the prescription isodose volume exactly matched the target volume in all three spatial dimensions and that the dose fell sharply away from the target volume. Normal tissue dose constraints for critical organs associated with the treatment site were reviewed.</p>

{metrics_table}

<p>A quality assurance plan was developed that was subsequently delivered to a phantom geometry. Measurements within the phantom were obtained and compared against the calculated plan to verify the accuracy of the radiation treatment plan. The data analysis showed good agreement between the plan and measurements. Calculations and data analysis were reviewed and approved by both the prescribing radiation oncologist, Dr. {physician}, and the radiation oncology physicist, Dr. {physicist}.</p>"""

    def _generate_dibh_template(self, physician, physicist, lesion_description, 
                               dose, fractions, target_name, coverage, conformity_index, r50, metrics_table) -> str:
        """Generate DIBH template write-up."""
        return f"""<p>Dr. {physician} requested a medical physics consultation for --- for SBRT delivery with DIBH technique. Dr. {physician} has elected to treat the {lesion_description} using a DIBH technique to significantly reduce cardiac dose with the C-RAD positioning and gating system in conjunction with the linear accelerator. Dr. {physician} has elected to treat with a stereotactic body radiotherapy (SBRT) technique by means of the Pinnacle treatment planning system in conjunction with the VersaHD linear accelerator equipped with the kV-CBCT system.</p>

<p>Days before the initial radiation delivery, the patient was simulated in the treatment position using a wing board to aid in immobilization and localization. Instructions were provided and the patient was coached to reproducibly hold their breath. Using the C-RAD surface scanning system, a free breathing and breath hold signal trace was established. After reproducing the breath hold pattern and establishing a consistent breathing pattern, a gating baseline and gating window was created. Subsequently, a DIBH CT simulation scan was acquired and approved by the Radiation Oncologist, Dr. {physician}.</p>

<p>A radiation treatment plan was developed on the DIBH CT simulation to deliver a prescribed dose of {dose} Gy in {fractions} fractions ({dose/fractions:.1f} Gy per fraction) to the {target_name}. The delivery of the DIBH gating technique on the linear accelerator will be performed using the C-RAD CatalystHD. The CatalystHD will be used to position the patient, monitor intra-fraction motion, and gate the beam delivery. Verification of the patient position will be validated with a DIBH kV-CBCT. The treatment plan was inversely optimized such that the prescription isodose volume exactly matched the target volume in all three spatial dimensions and that the dose fell sharply away from the target volume. Normal tissue dose constraints for critical organs associated with the treatment site were reviewed.</p>

{metrics_table}

<p>A quality assurance plan was developed that was subsequently delivered to a phantom geometry. Measurements within the phantom were obtained and compared against the calculated plan to verify the accuracy of the radiation treatment plan. The data analysis showed good agreement between the plan and measurements.</p>

<p>These findings were reviewed and approved by both the prescribing radiation oncologist, Dr. {physician}, and the radiation oncology physicist, Dr. {physicist}.</p>""" 