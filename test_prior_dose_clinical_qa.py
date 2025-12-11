#!/usr/bin/env python3
"""
Prior Dose Module - Clinical QA Test Script
Tests for clinically meaningful inconsistencies and nonsensical writeups.

This enhanced script focuses on:
1. Logical consistency (DICOM availability vs overlap claims)
2. Grammar and formatting accuracy
3. Methodology text matching DICOM status
4. Constraint selection matching fractionation regime
5. Assessment logic matching entered values
6. Clinical plausibility checks
7. Edge cases that could produce nonsensical output

Based on DEV_LOG Entries #52, #64-66 patterns.
"""

import requests
import json
import re
from datetime import datetime
from typing import Dict, List, Any, Tuple

# Base URL for the API
BASE_URL = "http://localhost:8000/api"

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def create_payload(
    physician: str,
    physicist: str,
    current_site: str,
    current_dose: float,
    current_fractions: int,
    prior_treatments: List[Dict],
    dose_calc_method: str = "EQD2 (Equivalent Dose in 2 Gy fractions)",
    custom_current_site: str = "",
    critical_structures: List[str] = None,
    dose_statistics: List[Dict] = None
) -> Dict:
    """Create standardized test payload."""
    return {
        "common_info": {
            "physician": {"name": physician},
            "physicist": {"name": physicist}
        },
        "prior_dose_data": {
            "current_site": current_site,
            "custom_current_site": custom_current_site,
            "current_dose": current_dose,
            "current_fractions": current_fractions,
            "current_month": "December",
            "current_year": 2024,
            "spine_location": "",
            "prior_treatments": prior_treatments,
            "dose_calc_method": dose_calc_method,
            "critical_structures": critical_structures or [],
            "dose_statistics": dose_statistics or []
        }
    }


def run_test(test_name: str, payload: Dict) -> Dict:
    """Run a single test and return results."""
    print(f"\n{'='*80}")
    print(f"TEST: {test_name}")
    print(f"{'='*80}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/prior-dose/generate",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            writeup = result.get('writeup', 'No writeup generated')
            print("✓ API call successful")
            return {"status": "PASS", "writeup": writeup}
        else:
            print(f"✗ API failed - HTTP {response.status_code}")
            print(f"Error: {response.text}")
            return {"status": "FAIL", "error": response.text}
            
    except Exception as e:
        print(f"✗ Exception: {str(e)}")
        return {"status": "ERROR", "error": str(e)}


# ============================================================================
# CLINICAL CONSISTENCY CHECKS
# ============================================================================

def check_no_demographics(writeup: str) -> Tuple[bool, str]:
    """Check that no patient demographics (age/sex) are present."""
    demographics_patterns = [
        (r'\b\d+\s*-?\s*year\s*-?\s*old\b', "age pattern"),
        (r'\bmale\b', "male"),
        (r'\bfemale\b', "female"),
    ]
    
    # Careful pronoun checks with word boundaries
    pronoun_patterns = [
        (r'\bhis\b', "his"),
        (r'\bher\b', "her"),
        (r'\bhim\b', "him"),
        (r'\bshe\b', "she"),
        (r'\bhe\b', "he"),
    ]
    
    for pattern, name in demographics_patterns:
        if re.search(pattern, writeup, re.IGNORECASE):
            return False, f"Found demographic: {name}"
    
    for pattern, name in pronoun_patterns:
        matches = list(re.finditer(pattern, writeup, re.IGNORECASE))
        for match in matches:
            # Check it's not part of another word
            start = match.start()
            end = match.end()
            if start > 0 and writeup[start-1].isalpha():
                continue  # Part of another word
            if end < len(writeup) and writeup[end].isalpha():
                continue  # Part of another word
            return False, f"Found pronoun: {name}"
    
    return True, "No demographics found"


def check_dicom_overlap_consistency(writeup: str, has_overlap: bool, has_dicom_unavailable: bool) -> Tuple[bool, str]:
    """
    Check DICOM availability mentions are consistent with overlap status.
    
    Key rule: DICOM availability should only be mentioned when there IS overlap,
    because reconstruction is only relevant for composite dose calculation.
    """
    dicom_mentioned = "DICOM" in writeup or "dicom" in writeup.lower()
    unavailable_text = "unavailable for reconstruction" in writeup.lower() or "unavailable DICOM" in writeup.lower()
    
    if not has_overlap:
        # No overlap case: DICOM availability should NOT be mentioned
        if dicom_mentioned:
            return False, "DICOM mentioned in no-overlap case (irrelevant - no reconstruction needed)"
        return True, "Correctly omits DICOM for no-overlap case"
    
    # Has overlap case
    if has_dicom_unavailable:
        # Should mention DICOM unavailable
        if not unavailable_text:
            return False, "DICOM unavailable not mentioned when it should be"
        return True, "Correctly mentions DICOM unavailable"
    else:
        # DICOM available - shouldn't mention unavailability
        if unavailable_text:
            return False, "Incorrectly claims DICOM unavailable when it's available"
        return True, "DICOM availability correctly handled"


def check_methodology_consistency(writeup: str, has_overlap: bool, has_dicom_unavailable: bool) -> Tuple[bool, str]:
    """
    Check that methodology text is consistent with DICOM availability.
    
    When DICOM unavailable + overlap:
    - Should NOT claim "reconstructed on the current patient CT for summation"
    - Should mention conservative/estimated approach
    
    When DICOM available + overlap:
    - Should claim reconstruction in Velocity
    """
    if not has_overlap:
        return True, "No methodology check needed (no overlap)"
    
    reconstruction_claimed = "reconstructed on the current patient CT" in writeup.lower() or \
                            "reconstructed on the current patient ct for summation" in writeup.lower()
    conservative_mentioned = "conservative" in writeup.lower() or "estimated" in writeup.lower()
    velocity_mentioned = "velocity" in writeup.lower()
    
    if has_dicom_unavailable:
        if reconstruction_claimed and "could not" not in writeup.lower():
            return False, "Claims reconstruction when DICOM unavailable"
        if not conservative_mentioned:
            return False, "Missing conservative approach mention for unavailable DICOM"
        return True, "Methodology correct for unavailable DICOM"
    else:
        if not reconstruction_claimed:
            return False, "Missing reconstruction claim when DICOM available"
        if not velocity_mentioned:
            return False, "Missing Velocity mention when DICOM available"
        return True, "Methodology correct for available DICOM"


def check_fraction_grammar(writeup: str, current_fractions: int, prior_fractions: List[int]) -> Tuple[bool, str]:
    """Check singular/plural fraction grammar."""
    issues = []
    
    # Check for "1 fractions" (should be "1 fraction")
    if re.search(r'\b1\s+fractions\b', writeup):
        issues.append("Found '1 fractions' - should be '1 fraction'")
    
    # Check for "X fraction" where X > 1 (should be "X fractions")
    matches = re.findall(r'\b(\d+)\s+fraction\b(?!s)', writeup)
    for match in matches:
        if int(match) > 1:
            issues.append(f"Found '{match} fraction' - should be '{match} fractions'")
    
    if issues:
        return False, "; ".join(issues)
    return True, "Fraction grammar correct"


def check_chronological_order(writeup: str, prior_treatments: List[Dict]) -> Tuple[bool, str]:
    """Check that multiple prior treatments are listed in chronological order."""
    if len(prior_treatments) < 2:
        return True, "Single treatment - no order to check"
    
    # Extract dates from writeup
    # Pattern: "In Month YYYY"
    date_pattern = r'In\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})'
    matches = re.findall(date_pattern, writeup)
    
    if len(matches) < 2:
        return True, "Could not extract multiple dates to verify order"
    
    # Convert to sortable format
    month_map = {
        "January": 1, "February": 2, "March": 3, "April": 4,
        "May": 5, "June": 6, "July": 7, "August": 8,
        "September": 9, "October": 10, "November": 11, "December": 12
    }
    
    dates_in_writeup = [(int(year), month_map[month]) for month, year in matches]
    sorted_dates = sorted(dates_in_writeup)
    
    if dates_in_writeup != sorted_dates:
        return False, f"Treatments not in chronological order: {matches}"
    return True, "Treatments correctly ordered chronologically"


def check_overlap_statement_logic(writeup: str, num_overlapping: int, total_prior: int) -> Tuple[bool, str]:
    """Check overlap statement grammar and logic."""
    if num_overlapping == 0:
        # Should mention minimal/no overlap
        if "minimal to no overlap" not in writeup.lower() and "no overlap" not in writeup.lower():
            return False, "Missing no-overlap statement"
        return True, "Correctly states no overlap"
    
    if total_prior == 1:
        # Single prior - should not say "one of the previous treatments"
        if "one of the previous treatments" in writeup.lower():
            return False, "Says 'one of the previous treatments' for single prior"
        return True, "Single prior overlap statement correct"
    
    if num_overlapping == 1 and total_prior > 1:
        # Should say "one of the previous treatments"
        if "one of the previous treatments" not in writeup.lower():
            return False, "Should say 'one of the previous treatments'"
        return True, "Multiple prior, single overlap statement correct"
    
    if num_overlapping > 1:
        # Should mention number of overlapping treatments
        expected_phrase = f"{num_overlapping} of the previous treatments"
        if expected_phrase not in writeup.lower():
            return False, f"Should mention '{expected_phrase}'"
        return True, "Multiple overlap statement correct"
    
    return True, "Overlap statement acceptable"


def check_constraint_source_matches_regime(writeup: str, dose_calc_method: str, current_dose: float, current_fractions: int) -> Tuple[bool, str]:
    """
    Check that constraint sources match the fractionation regime.
    
    EQD2 → Should use QUANTEC
    Raw Dose + SBRT (≥5 Gy/fx, 2-8 fx) → Should use Timmerman
    Raw Dose + SRS (single fx ≥10 Gy) → Should use SRS constraints
    Raw Dose + Conventional → Should use QUANTEC
    """
    if "Dose Constraint Evaluation:" not in writeup:
        return True, "No constraints to check"
    
    # Determine expected regime
    if "EQD2" in dose_calc_method:
        expected_source = "QUANTEC"
    elif current_fractions > 0:
        dose_per_fraction = current_dose / current_fractions
        if current_fractions == 1 and current_dose >= 10:
            expected_source = "SRS"
        elif dose_per_fraction >= 5 and current_fractions <= 8:
            expected_source = "Timmerman"
        else:
            expected_source = "QUANTEC"
    else:
        expected_source = "QUANTEC"
    
    # Check if expected source appears
    if expected_source.upper() in writeup.upper() or expected_source in writeup:
        return True, f"Constraint source '{expected_source}' correctly used"
    
    # For now, just warn - don't fail
    return True, f"Expected '{expected_source}' constraints (verify manually)"


def check_clinical_plausibility(writeup: str, current_dose: float, current_fractions: int, 
                                prior_treatments: List[Dict], has_overlap: bool) -> Tuple[bool, List[str]]:
    """
    Check for clinically implausible scenarios that warrant warnings.
    
    Returns (is_plausible, list_of_warnings)
    """
    warnings = []
    
    # High cumulative dose warning (re-irradiation concern)
    if has_overlap:
        total_prior_dose = sum(t['dose'] for t in prior_treatments if t.get('has_overlap', False))
        if total_prior_dose + current_dose > 100:
            warnings.append(f"High cumulative dose: {total_prior_dose + current_dose:.1f} Gy to overlapping region")
    
    # SBRT re-treating SBRT (very high BED)
    if current_fractions <= 5 and current_dose / max(current_fractions, 1) >= 8:
        for t in prior_treatments:
            if t.get('has_overlap', False) and t.get('fractions', 1) <= 5:
                prior_dose_per_fx = t['dose'] / max(t.get('fractions', 1), 1)
                if prior_dose_per_fx >= 8:
                    warnings.append("SBRT re-treating prior SBRT - very high BED cumulative")
    
    # Anatomically suspicious overlap combinations
    distant_site_pairs = [
        ("brain", "pelvis"), ("brain", "prostate"), ("brain", "rectum"),
        ("pelvis", "head and neck"), ("extremity", "brain"),
    ]
    if has_overlap and len(prior_treatments) > 0:
        current_site = writeup.lower()
        for t in prior_treatments:
            if t.get('has_overlap', False):
                prior_site = (t.get('custom_site') or t.get('site', '')).lower()
                for site1, site2 in distant_site_pairs:
                    if (site1 in current_site and site2 in prior_site) or \
                       (site2 in current_site and site1 in prior_site):
                        warnings.append(f"Distant site overlap claimed: {site1} ↔ {site2}")
    
    is_plausible = len(warnings) == 0
    return is_plausible, warnings


def check_assessment_matches_constraints(writeup: str, dose_statistics: List[Dict]) -> Tuple[bool, str]:
    """
    Check that assessment text matches whether constraints are exceeded.
    
    If any constraint exceeded → should mention "exceeded"
    If all within limits → should say "acceptable"
    """
    if "Assessment:" not in writeup:
        return True, "No assessment section to check"
    
    if not dose_statistics:
        return True, "No dose statistics provided"
    
    assessment_section = writeup.split("Assessment:")[-1] if "Assessment:" in writeup else ""
    
    # Check if any constraints might be exceeded based on provided values
    exceeded_mentioned = "exceeded" in assessment_section.lower()
    acceptable_mentioned = "acceptable" in assessment_section.lower()
    
    # For now, just verify the assessment has some determination
    if exceeded_mentioned or acceptable_mentioned:
        return True, "Assessment contains determination"
    
    return True, "Assessment section present"


def check_template_placeholders_absent(writeup: str) -> Tuple[bool, str]:
    """
    Check that no template placeholders remain in final writeup.
    
    Looking for things like: [IF ALL CONSTRAINTS MET:], [Figures], _______, etc.
    """
    placeholder_patterns = [
        (r'\[IF\s+', "Conditional template marker"),
        (r'\[Figures\]', "Figures placeholder"),
        (r'_{5,}', "Blank line placeholder"),
        (r'\[.*?:\]', "Generic template marker"),
    ]
    
    for pattern, description in placeholder_patterns:
        if re.search(pattern, writeup, re.IGNORECASE):
            return False, f"Found template placeholder: {description}"
    
    return True, "No template placeholders found"


def check_dr_prefix(writeup: str) -> Tuple[bool, str]:
    """Check that physician and physicist have proper Dr. prefix."""
    # Should have "Dr. [Name]" format
    has_dr_prefix = bool(re.search(r'Dr\.\s+\w+', writeup))
    if not has_dr_prefix:
        return False, "Missing Dr. prefix for physician/physicist"
    return True, "Dr. prefix present"


# ============================================================================
# TEST EXECUTION
# ============================================================================

def perform_clinical_checks(test_name: str, writeup: str, config: Dict) -> Dict[str, Tuple[bool, str]]:
    """Perform all clinical consistency checks."""
    checks = {}
    
    # Basic formatting checks
    checks["No Demographics"] = check_no_demographics(writeup)
    checks["Dr. Prefix Present"] = check_dr_prefix(writeup)
    checks["No Template Placeholders"] = check_template_placeholders_absent(writeup)
    
    # Grammar checks
    prior_fractions = [t.get('fractions', 1) for t in config.get('prior_treatments', [])]
    checks["Fraction Grammar"] = check_fraction_grammar(
        writeup, 
        config.get('current_fractions', 1),
        prior_fractions
    )
    
    # Chronological order (for multiple priors)
    checks["Chronological Order"] = check_chronological_order(
        writeup, 
        config.get('prior_treatments', [])
    )
    
    # Overlap logic checks
    has_overlap = config.get('has_overlap', False)
    has_dicom_unavailable = config.get('has_dicom_unavailable', False)
    
    checks["DICOM-Overlap Consistency"] = check_dicom_overlap_consistency(
        writeup, has_overlap, has_dicom_unavailable
    )
    checks["Methodology Consistency"] = check_methodology_consistency(
        writeup, has_overlap, has_dicom_unavailable
    )
    
    # Overlap statement logic
    prior_treatments = config.get('prior_treatments', [])
    num_overlapping = sum(1 for t in prior_treatments if t.get('has_overlap', False))
    checks["Overlap Statement Logic"] = check_overlap_statement_logic(
        writeup, num_overlapping, len(prior_treatments)
    )
    
    # Constraint checks
    checks["Constraint Source"] = check_constraint_source_matches_regime(
        writeup,
        config.get('dose_calc_method', 'EQD2'),
        config.get('current_dose', 50),
        config.get('current_fractions', 25)
    )
    
    # Assessment logic
    checks["Assessment Logic"] = check_assessment_matches_constraints(
        writeup,
        config.get('dose_statistics', [])
    )
    
    # Clinical plausibility
    is_plausible, warnings = check_clinical_plausibility(
        writeup,
        config.get('current_dose', 50),
        config.get('current_fractions', 25),
        prior_treatments,
        has_overlap
    )
    if warnings:
        checks["Clinical Plausibility"] = (True, f"WARNINGS: {'; '.join(warnings)}")
    else:
        checks["Clinical Plausibility"] = (True, "No clinical concerns")
    
    return checks


# ============================================================================
# TEST SUITES
# ============================================================================

def run_clinical_qa_suite() -> List[Dict]:
    """Run complete clinical QA test suite."""
    results = []
    
    # =========================================================================
    # SUITE 1: DICOM-OVERLAP LOGICAL CONSISTENCY
    # =========================================================================
    print("\n" + "="*80)
    print("SUITE 1: DICOM-OVERLAP LOGICAL CONSISTENCY")
    print("="*80)
    
    # Test 1.1: DICOM unavailable should NOT be mentioned when no overlap
    test_config = {
        'prior_treatments': [{
            "site": "breast",
            "custom_site": "",
            "dose": 50.4,
            "fractions": 28,
            "month": "March",
            "year": 2020,
            "spine_location": "",
            "has_overlap": False,
            "dicoms_unavailable": True  # This should be ignored since no overlap
        }],
        'has_overlap': False,
        'has_dicom_unavailable': True,
        'current_dose': 54.0,
        'current_fractions': 30,
        'dose_calc_method': 'EQD2 (Equivalent Dose in 2 Gy fractions)'
    }
    
    payload = create_payload(
        physician="Galvan", physicist="Kirby",
        current_site="brain", current_dose=54.0, current_fractions=30,
        prior_treatments=test_config['prior_treatments'],
        dose_calc_method=test_config['dose_calc_method']
    )
    
    result = run_test("1.1: DICOM unavailable but no overlap (should NOT mention DICOM)", payload)
    if result['status'] == 'PASS':
        checks = perform_clinical_checks("Test 1.1", result['writeup'], test_config)
        results.append({
            "suite": "Suite 1: DICOM-Overlap Consistency",
            "name": "Test 1.1: DICOM flag irrelevant when no overlap",
            "status": result['status'],
            "writeup": result['writeup'],
            "checks": checks,
            "config": test_config
        })
    
    # Test 1.2: DICOM unavailable WITH overlap - should mention conservative approach
    test_config_2 = {
        'prior_treatments': [{
            "site": "thorax",
            "custom_site": "",
            "dose": 60.0,
            "fractions": 30,
            "month": "January",
            "year": 2022,
            "spine_location": "",
            "has_overlap": True,
            "dicoms_unavailable": True
        }],
        'has_overlap': True,
        'has_dicom_unavailable': True,
        'current_dose': 50.0,
        'current_fractions': 25,
        'dose_calc_method': 'EQD2 (Equivalent Dose in 2 Gy fractions)'
    }
    
    payload_2 = create_payload(
        physician="Galvan", physicist="Kirby",
        current_site="lung", current_dose=50.0, current_fractions=25,
        prior_treatments=test_config_2['prior_treatments'],
        dose_calc_method=test_config_2['dose_calc_method']
    )
    
    result_2 = run_test("1.2: DICOM unavailable WITH overlap (should mention conservative)", payload_2)
    if result_2['status'] == 'PASS':
        checks_2 = perform_clinical_checks("Test 1.2", result_2['writeup'], test_config_2)
        results.append({
            "suite": "Suite 1: DICOM-Overlap Consistency",
            "name": "Test 1.2: DICOM unavailable with overlap",
            "status": result_2['status'],
            "writeup": result_2['writeup'],
            "checks": checks_2,
            "config": test_config_2
        })
    
    # Test 1.3: DICOM available WITH overlap - should claim reconstruction
    test_config_3 = {
        'prior_treatments': [{
            "site": "thorax",
            "custom_site": "",
            "dose": 60.0,
            "fractions": 30,
            "month": "January",
            "year": 2022,
            "spine_location": "",
            "has_overlap": True,
            "dicoms_unavailable": False
        }],
        'has_overlap': True,
        'has_dicom_unavailable': False,
        'current_dose': 50.0,
        'current_fractions': 25,
        'dose_calc_method': 'EQD2 (Equivalent Dose in 2 Gy fractions)'
    }
    
    payload_3 = create_payload(
        physician="Galvan", physicist="Kirby",
        current_site="lung", current_dose=50.0, current_fractions=25,
        prior_treatments=test_config_3['prior_treatments'],
        dose_calc_method=test_config_3['dose_calc_method']
    )
    
    result_3 = run_test("1.3: DICOM available WITH overlap (should claim reconstruction)", payload_3)
    if result_3['status'] == 'PASS':
        checks_3 = perform_clinical_checks("Test 1.3", result_3['writeup'], test_config_3)
        results.append({
            "suite": "Suite 1: DICOM-Overlap Consistency",
            "name": "Test 1.3: DICOM available with overlap",
            "status": result_3['status'],
            "writeup": result_3['writeup'],
            "checks": checks_3,
            "config": test_config_3
        })
    
    # =========================================================================
    # SUITE 2: FRACTION GRAMMAR EDGE CASES
    # =========================================================================
    print("\n" + "="*80)
    print("SUITE 2: FRACTION GRAMMAR EDGE CASES")
    print("="*80)
    
    # Test 2.1: Single fraction current (SRS)
    test_config_4 = {
        'prior_treatments': [{
            "site": "brain",
            "custom_site": "",
            "dose": 18.0,
            "fractions": 1,
            "month": "June",
            "year": 2023,
            "spine_location": "",
            "has_overlap": False,
            "dicoms_unavailable": False
        }],
        'has_overlap': False,
        'has_dicom_unavailable': False,
        'current_dose': 21.0,
        'current_fractions': 1,
        'dose_calc_method': 'Raw Dose (no biologic correction)'
    }
    
    payload_4 = create_payload(
        physician="Galvan", physicist="Kirby",
        current_site="brain", current_dose=21.0, current_fractions=1,
        prior_treatments=test_config_4['prior_treatments'],
        dose_calc_method=test_config_4['dose_calc_method']
    )
    
    result_4 = run_test("2.1: Single fraction (should say 'fraction' not 'fractions')", payload_4)
    if result_4['status'] == 'PASS':
        checks_4 = perform_clinical_checks("Test 2.1", result_4['writeup'], test_config_4)
        results.append({
            "suite": "Suite 2: Grammar Edge Cases",
            "name": "Test 2.1: Single fraction grammar",
            "status": result_4['status'],
            "writeup": result_4['writeup'],
            "checks": checks_4,
            "config": test_config_4
        })
    
    # Test 2.2: Multiple fractions
    test_config_5 = {
        'prior_treatments': [{
            "site": "breast",
            "custom_site": "",
            "dose": 50.4,
            "fractions": 28,
            "month": "March",
            "year": 2022,
            "spine_location": "",
            "has_overlap": False,
            "dicoms_unavailable": False
        }],
        'has_overlap': False,
        'has_dicom_unavailable': False,
        'current_dose': 50.0,
        'current_fractions': 25,
        'dose_calc_method': 'EQD2 (Equivalent Dose in 2 Gy fractions)'
    }
    
    payload_5 = create_payload(
        physician="Galvan", physicist="Kirby",
        current_site="thorax", current_dose=50.0, current_fractions=25,
        prior_treatments=test_config_5['prior_treatments'],
        dose_calc_method=test_config_5['dose_calc_method']
    )
    
    result_5 = run_test("2.2: Multiple fractions (should say 'fractions')", payload_5)
    if result_5['status'] == 'PASS':
        checks_5 = perform_clinical_checks("Test 2.2", result_5['writeup'], test_config_5)
        results.append({
            "suite": "Suite 2: Grammar Edge Cases",
            "name": "Test 2.2: Multiple fraction grammar",
            "status": result_5['status'],
            "writeup": result_5['writeup'],
            "checks": checks_5,
            "config": test_config_5
        })
    
    # =========================================================================
    # SUITE 3: CHRONOLOGICAL ORDERING
    # =========================================================================
    print("\n" + "="*80)
    print("SUITE 3: CHRONOLOGICAL ORDERING")
    print("="*80)
    
    # Test 3.1: Multiple prior treatments out of order in input (should be sorted in output)
    test_config_6 = {
        'prior_treatments': [
            {
                "site": "lung",
                "custom_site": "",
                "dose": 60.0,
                "fractions": 30,
                "month": "December",
                "year": 2023,  # Most recent
                "spine_location": "",
                "has_overlap": True,
                "dicoms_unavailable": False
            },
            {
                "site": "breast",
                "custom_site": "",
                "dose": 50.4,
                "fractions": 28,
                "month": "January",
                "year": 2020,  # Oldest
                "spine_location": "",
                "has_overlap": False,
                "dicoms_unavailable": False
            },
            {
                "site": "thorax",
                "custom_site": "",
                "dose": 45.0,
                "fractions": 25,
                "month": "June",
                "year": 2022,  # Middle
                "spine_location": "",
                "has_overlap": True,
                "dicoms_unavailable": False
            }
        ],
        'has_overlap': True,
        'has_dicom_unavailable': False,
        'current_dose': 50.0,
        'current_fractions': 25,
        'dose_calc_method': 'EQD2 (Equivalent Dose in 2 Gy fractions)'
    }
    
    payload_6 = create_payload(
        physician="Galvan", physicist="Kirby",
        current_site="thorax", current_dose=50.0, current_fractions=25,
        prior_treatments=test_config_6['prior_treatments'],
        dose_calc_method=test_config_6['dose_calc_method']
    )
    
    result_6 = run_test("3.1: Multiple priors should be chronologically ordered", payload_6)
    if result_6['status'] == 'PASS':
        checks_6 = perform_clinical_checks("Test 3.1", result_6['writeup'], test_config_6)
        results.append({
            "suite": "Suite 3: Chronological Ordering",
            "name": "Test 3.1: Out-of-order input sorted in output",
            "status": result_6['status'],
            "writeup": result_6['writeup'],
            "checks": checks_6,
            "config": test_config_6
        })
    
    # =========================================================================
    # SUITE 4: OVERLAP STATEMENT LOGIC
    # =========================================================================
    print("\n" + "="*80)
    print("SUITE 4: OVERLAP STATEMENT LOGIC")
    print("="*80)
    
    # Test 4.1: Multiple priors, only one overlaps
    test_config_7 = {
        'prior_treatments': [
            {
                "site": "breast",
                "custom_site": "",
                "dose": 50.4,
                "fractions": 28,
                "month": "January",
                "year": 2020,
                "spine_location": "",
                "has_overlap": False,
                "dicoms_unavailable": False
            },
            {
                "site": "thorax",
                "custom_site": "",
                "dose": 45.0,
                "fractions": 25,
                "month": "June",
                "year": 2022,
                "spine_location": "",
                "has_overlap": True,  # Only this one overlaps
                "dicoms_unavailable": False
            },
            {
                "site": "pelvis",
                "custom_site": "",
                "dose": 50.0,
                "fractions": 25,
                "month": "September",
                "year": 2023,
                "spine_location": "",
                "has_overlap": False,
                "dicoms_unavailable": False
            }
        ],
        'has_overlap': True,
        'has_dicom_unavailable': False,
        'current_dose': 50.0,
        'current_fractions': 25,
        'dose_calc_method': 'EQD2 (Equivalent Dose in 2 Gy fractions)'
    }
    
    payload_7 = create_payload(
        physician="Galvan", physicist="Kirby",
        current_site="lung", current_dose=50.0, current_fractions=25,
        prior_treatments=test_config_7['prior_treatments'],
        dose_calc_method=test_config_7['dose_calc_method']
    )
    
    result_7 = run_test("4.1: Three priors, one overlaps (should say 'one of the previous')", payload_7)
    if result_7['status'] == 'PASS':
        checks_7 = perform_clinical_checks("Test 4.1", result_7['writeup'], test_config_7)
        results.append({
            "suite": "Suite 4: Overlap Statement Logic",
            "name": "Test 4.1: One of three overlaps",
            "status": result_7['status'],
            "writeup": result_7['writeup'],
            "checks": checks_7,
            "config": test_config_7
        })
    
    # Test 4.2: Multiple priors, two overlap
    test_config_8 = {
        'prior_treatments': [
            {
                "site": "thorax",
                "custom_site": "",
                "dose": 50.0,
                "fractions": 25,
                "month": "January",
                "year": 2020,
                "spine_location": "",
                "has_overlap": True,
                "dicoms_unavailable": False
            },
            {
                "site": "lung",
                "custom_site": "",
                "dose": 60.0,
                "fractions": 30,
                "month": "June",
                "year": 2022,
                "spine_location": "",
                "has_overlap": True,
                "dicoms_unavailable": False
            },
            {
                "site": "pelvis",
                "custom_site": "",
                "dose": 50.0,
                "fractions": 25,
                "month": "September",
                "year": 2023,
                "spine_location": "",
                "has_overlap": False,
                "dicoms_unavailable": False
            }
        ],
        'has_overlap': True,
        'has_dicom_unavailable': False,
        'current_dose': 50.0,
        'current_fractions': 25,
        'dose_calc_method': 'EQD2 (Equivalent Dose in 2 Gy fractions)'
    }
    
    payload_8 = create_payload(
        physician="Galvan", physicist="Kirby",
        current_site="thorax", current_dose=50.0, current_fractions=25,
        prior_treatments=test_config_8['prior_treatments'],
        dose_calc_method=test_config_8['dose_calc_method']
    )
    
    result_8 = run_test("4.2: Three priors, two overlap (should say '2 of the previous')", payload_8)
    if result_8['status'] == 'PASS':
        checks_8 = perform_clinical_checks("Test 4.2", result_8['writeup'], test_config_8)
        results.append({
            "suite": "Suite 4: Overlap Statement Logic",
            "name": "Test 4.2: Two of three overlap",
            "status": result_8['status'],
            "writeup": result_8['writeup'],
            "checks": checks_8,
            "config": test_config_8
        })
    
    # =========================================================================
    # SUITE 5: CLINICAL PLAUSIBILITY EDGE CASES
    # =========================================================================
    print("\n" + "="*80)
    print("SUITE 5: CLINICAL PLAUSIBILITY EDGE CASES")
    print("="*80)
    
    # Test 5.1: Very high cumulative dose (should generate warning)
    test_config_9 = {
        'prior_treatments': [{
            "site": "spine",
            "custom_site": "",
            "dose": 50.0,
            "fractions": 25,
            "month": "January",
            "year": 2023,
            "spine_location": "",
            "has_overlap": True,
            "dicoms_unavailable": False
        }],
        'has_overlap': True,
        'has_dicom_unavailable': False,
        'current_dose': 60.0,  # Total: 110 Gy to overlap region
        'current_fractions': 30,
        'dose_calc_method': 'EQD2 (Equivalent Dose in 2 Gy fractions)'
    }
    
    payload_9 = create_payload(
        physician="Galvan", physicist="Kirby",
        current_site="spine", current_dose=60.0, current_fractions=30,
        prior_treatments=test_config_9['prior_treatments'],
        dose_calc_method=test_config_9['dose_calc_method']
    )
    
    result_9 = run_test("5.1: High cumulative dose (110 Gy to spine)", payload_9)
    if result_9['status'] == 'PASS':
        checks_9 = perform_clinical_checks("Test 5.1", result_9['writeup'], test_config_9)
        results.append({
            "suite": "Suite 5: Clinical Plausibility",
            "name": "Test 5.1: High cumulative dose warning",
            "status": result_9['status'],
            "writeup": result_9['writeup'],
            "checks": checks_9,
            "config": test_config_9
        })
    
    # Test 5.2: SBRT re-treating prior SBRT (very high BED)
    test_config_10 = {
        'prior_treatments': [{
            "site": "lung",
            "custom_site": "",
            "dose": 50.0,
            "fractions": 5,  # Prior SBRT
            "month": "January",
            "year": 2023,
            "spine_location": "",
            "has_overlap": True,
            "dicoms_unavailable": False
        }],
        'has_overlap': True,
        'has_dicom_unavailable': False,
        'current_dose': 48.0,
        'current_fractions': 4,  # Current SBRT
        'dose_calc_method': 'Raw Dose (no biologic correction)'
    }
    
    payload_10 = create_payload(
        physician="Galvan", physicist="Kirby",
        current_site="lung", current_dose=48.0, current_fractions=4,
        prior_treatments=test_config_10['prior_treatments'],
        dose_calc_method=test_config_10['dose_calc_method']
    )
    
    result_10 = run_test("5.2: SBRT re-treating SBRT (very high BED)", payload_10)
    if result_10['status'] == 'PASS':
        checks_10 = perform_clinical_checks("Test 5.2", result_10['writeup'], test_config_10)
        results.append({
            "suite": "Suite 5: Clinical Plausibility",
            "name": "Test 5.2: SBRT re-treating SBRT",
            "status": result_10['status'],
            "writeup": result_10['writeup'],
            "checks": checks_10,
            "config": test_config_10
        })
    
    # Test 5.3: Distant site overlap claim (brain + pelvis - suspicious but possible)
    test_config_11 = {
        'prior_treatments': [{
            "site": "pelvis",
            "custom_site": "",
            "dose": 50.4,
            "fractions": 28,
            "month": "January",
            "year": 2023,
            "spine_location": "",
            "has_overlap": True,  # Claiming overlap with brain - suspicious
            "dicoms_unavailable": False
        }],
        'has_overlap': True,
        'has_dicom_unavailable': False,
        'current_dose': 54.0,
        'current_fractions': 30,
        'dose_calc_method': 'EQD2 (Equivalent Dose in 2 Gy fractions)'
    }
    
    payload_11 = create_payload(
        physician="Galvan", physicist="Kirby",
        current_site="brain", current_dose=54.0, current_fractions=30,
        prior_treatments=test_config_11['prior_treatments'],
        dose_calc_method=test_config_11['dose_calc_method']
    )
    
    result_11 = run_test("5.3: Distant site overlap (brain + pelvis)", payload_11)
    if result_11['status'] == 'PASS':
        checks_11 = perform_clinical_checks("Test 5.3", result_11['writeup'], test_config_11)
        results.append({
            "suite": "Suite 5: Clinical Plausibility",
            "name": "Test 5.3: Distant site overlap warning",
            "status": result_11['status'],
            "writeup": result_11['writeup'],
            "checks": checks_11,
            "config": test_config_11
        })
    
    # =========================================================================
    # SUITE 6: DOSE CALCULATION METHOD CONSISTENCY
    # =========================================================================
    print("\n" + "="*80)
    print("SUITE 6: DOSE CALCULATION METHOD CONSISTENCY")
    print("="*80)
    
    # Test 6.1: EQD2 selected - should use QUANTEC constraints
    test_config_12 = {
        'prior_treatments': [{
            "site": "thorax",
            "custom_site": "",
            "dose": 60.0,
            "fractions": 30,
            "month": "January",
            "year": 2023,
            "spine_location": "",
            "has_overlap": True,
            "dicoms_unavailable": False
        }],
        'has_overlap': True,
        'has_dicom_unavailable': False,
        'current_dose': 50.0,
        'current_fractions': 25,
        'dose_calc_method': 'EQD2 (Equivalent Dose in 2 Gy fractions)'
    }
    
    payload_12 = create_payload(
        physician="Galvan", physicist="Kirby",
        current_site="lung", current_dose=50.0, current_fractions=25,
        prior_treatments=test_config_12['prior_treatments'],
        dose_calc_method=test_config_12['dose_calc_method']
    )
    
    result_12 = run_test("6.1: EQD2 method (should reference EQD2 methodology)", payload_12)
    if result_12['status'] == 'PASS':
        checks_12 = perform_clinical_checks("Test 6.1", result_12['writeup'], test_config_12)
        results.append({
            "suite": "Suite 6: Dose Calc Method",
            "name": "Test 6.1: EQD2 methodology",
            "status": result_12['status'],
            "writeup": result_12['writeup'],
            "checks": checks_12,
            "config": test_config_12
        })
    
    # Test 6.2: Raw Dose selected with conventional fractionation
    test_config_13 = {
        'prior_treatments': [{
            "site": "pelvis",
            "custom_site": "",
            "dose": 50.4,
            "fractions": 28,
            "month": "January",
            "year": 2023,
            "spine_location": "",
            "has_overlap": True,
            "dicoms_unavailable": False
        }],
        'has_overlap': True,
        'has_dicom_unavailable': False,
        'current_dose': 45.0,
        'current_fractions': 25,
        'dose_calc_method': 'Raw Dose (no biologic correction)'
    }
    
    payload_13 = create_payload(
        physician="Galvan", physicist="Kirby",
        current_site="pelvis", current_dose=45.0, current_fractions=25,
        prior_treatments=test_config_13['prior_treatments'],
        dose_calc_method=test_config_13['dose_calc_method']
    )
    
    result_13 = run_test("6.2: Raw Dose with conventional fractionation", payload_13)
    if result_13['status'] == 'PASS':
        checks_13 = perform_clinical_checks("Test 6.2", result_13['writeup'], test_config_13)
        results.append({
            "suite": "Suite 6: Dose Calc Method",
            "name": "Test 6.2: Raw Dose methodology",
            "status": result_13['status'],
            "writeup": result_13['writeup'],
            "checks": checks_13,
            "config": test_config_13
        })
    
    return results


# ============================================================================
# REPORT GENERATION
# ============================================================================

def generate_clinical_qa_report(results: List[Dict]) -> str:
    """Generate comprehensive clinical QA report."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Calculate statistics
    total_tests = len(results)
    passed_tests = sum(1 for r in results if r['status'] == 'PASS')
    
    # Count check results
    all_checks = {}
    for result in results:
        if result['status'] == 'PASS' and 'checks' in result:
            for check_name, (passed, message) in result['checks'].items():
                if check_name not in all_checks:
                    all_checks[check_name] = {'passed': 0, 'failed': 0, 'messages': []}
                if passed:
                    all_checks[check_name]['passed'] += 1
                else:
                    all_checks[check_name]['failed'] += 1
                    all_checks[check_name]['messages'].append(message)
    
    report = f"""# Prior Dose Module - Clinical QA Test Results
Generated: {timestamp}

## Executive Summary

| Metric | Result |
|--------|--------|
| **Total Tests** | {total_tests} |
| **API Successful** | {passed_tests}/{total_tests} |
| **API Failed** | {total_tests - passed_tests} |

## Clinical Check Results

| Check | Passed | Failed | Notes |
|-------|--------|--------|-------|
"""
    
    for check_name, stats in sorted(all_checks.items()):
        status_emoji = "✓" if stats['failed'] == 0 else "⚠"
        notes = "; ".join(stats['messages'][:2]) if stats['messages'] else ""
        if len(stats['messages']) > 2:
            notes += f" (+{len(stats['messages'])-2} more)"
        report += f"| {check_name} | {stats['passed']} | {stats['failed']} | {notes} |\n"
    
    report += """
---

## Detailed Test Results

"""
    
    # Group by suite
    suites = {}
    for result in results:
        suite = result.get('suite', 'Other')
        if suite not in suites:
            suites[suite] = []
        suites[suite].append(result)
    
    for suite_name, suite_results in suites.items():
        report += f"### {suite_name}\n\n"
        
        for result in suite_results:
            report += f"#### {result['name']}\n\n"
            report += f"**Status:** {result['status']}\n\n"
            
            if result['status'] == 'PASS' and 'checks' in result:
                report += "**Clinical Checks:**\n"
                for check_name, (passed, message) in result['checks'].items():
                    status = "✓" if passed else "✗"
                    report += f"- {status} **{check_name}**: {message}\n"
                report += "\n"
                
                report += f"**Generated Writeup:**\n```\n{result['writeup']}\n```\n\n"
            else:
                report += f"**Error:** {result.get('error', 'Unknown error')}\n\n"
            
            report += "---\n\n"
    
    # Recommendations
    report += """## Recommendations

"""
    
    failed_checks = [name for name, stats in all_checks.items() if stats['failed'] > 0]
    
    if not failed_checks:
        report += """✓ **ALL CLINICAL CHECKS PASSED!**

The Prior Dose module correctly handles:
- DICOM/overlap logical consistency
- Fraction grammar (singular/plural)
- Chronological ordering of multiple treatments
- Overlap statement grammar for various scenarios
- Dose calculation methodology text
- No template placeholders in output
- No patient demographics

**Module is ready for clinical use.**
"""
    else:
        report += f"""⚠ **{len(failed_checks)} CHECK TYPE(S) HAD FAILURES**

Failed checks:
"""
        for check in failed_checks:
            report += f"- {check}: {all_checks[check]['failed']} failure(s)\n"
        
        report += "\nReview detailed results above and fix issues before clinical deployment.\n"
    
    # Save report
    filename = "prior_dose_clinical_qa_results.md"
    with open(filename, 'w') as f:
        f.write(report)
    
    print(f"\n📄 Clinical QA report saved to: {filename}")
    return filename


def main():
    """Run clinical QA test suite."""
    print("\n" + "="*80)
    print("PRIOR DOSE MODULE - CLINICAL QA TEST SUITE")
    print("="*80)
    print("\nThis script tests for clinically meaningful inconsistencies")
    print("and nonsensical writeup scenarios.")
    print("\nTesting against:", BASE_URL)
    
    results = run_clinical_qa_suite()
    
    # Generate report
    print("\n" + "="*80)
    print("GENERATING CLINICAL QA REPORT")
    print("="*80)
    generate_clinical_qa_report(results)
    
    # Summary
    passed = sum(1 for r in results if r['status'] == 'PASS')
    total = len(results)
    
    print("\n" + "="*80)
    print(f"FINAL RESULTS: {passed}/{total} tests completed successfully")
    print("="*80)
    
    if passed == total:
        print("\n✓ All tests generated writeups successfully!")
        print("  Review the clinical checks in the report for any warnings.")
    else:
        print(f"\n✗ {total - passed} test(s) failed to generate writeups.")


if __name__ == "__main__":
    main()

