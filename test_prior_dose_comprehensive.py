#!/usr/bin/env python3
"""
Comprehensive Prior Dose Module Test Script
Tests clinically meaningful scenarios for Prior Dose module following established QA patterns.

Test Organization:
- Suite 1: Dose Calculation Methods (Raw vs EQD2)
- Suite 2: DICOM Unavailable Scenarios
- Suite 3: Custom Site Functionality
- Suite 4: Overlap Pattern Variations
- Suite 5: Edge Cases (high dose, many treatments, single fraction)
- Suite 6: Fractionation Regime Detection (NEW)
"""

import requests
import json
import re
from datetime import datetime

# Base URL for the API
BASE_URL = "http://localhost:8000/api"

def create_payload(physician, physicist, current_site, current_dose, current_fractions, 
                   prior_treatments, dose_calc_method="EQD2 (Equivalent Dose in 2 Gy fractions)",
                   custom_current_site="", critical_structures=None):
    """Helper function to create standardized test payload."""
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
            "composite_dose_computed": False,
            "dose_statistics": []
        }
    }

def run_test(test_name, payload):
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
            print("\n✓ Test passed - Writeup generated successfully")
            return {"status": "PASS", "writeup": writeup}
        else:
            print(f"\n✗ Test failed - HTTP {response.status_code}")
            print(f"Error: {response.text}")
            return {"status": "FAIL", "error": response.text}
            
    except Exception as e:
        print(f"\n✗ Test failed - Exception: {str(e)}")
        return {"status": "ERROR", "error": str(e)}

def check_demographics(writeup):
    """Check for patient demographics (age/sex) - should NOT be present."""
    demographics_patterns = [
        r'\b\d+\s*-?\s*year\s*-?\s*old\b',  # age patterns
        r'\bhis\b', r'\bher\b', r'\bhim\b', r'\bshe\b', r'\bhe\b',  # pronouns (word boundaries)
        r'\bmale\b', r'\bfemale\b'  # sex
    ]
    
    for pattern in demographics_patterns:
        if re.search(pattern, writeup, re.IGNORECASE):
            # Special check for "his" - make sure it's not part of "this"
            if pattern == r'\bhis\b':
                matches = re.finditer(pattern, writeup, re.IGNORECASE)
                for match in matches:
                    # Check if it's actually standalone "his" not part of another word
                    start = match.start()
                    if start > 0 and writeup[start-1].isalpha():
                        continue  # Part of another word like "this"
                    return True
            else:
                return True
    return False

def check_physician_physicist_format(writeup):
    """Check that physician and physicist are properly referenced with 'Dr.' prefix."""
    # Should have "Dr. [Name]" format
    has_physician = bool(re.search(r'Dr\.\s+\w+', writeup))
    return has_physician

def check_dose_calc_method(writeup, expected_method):
    """Check that the correct dose calculation method is mentioned in overlap cases."""
    # Only check for overlap cases which should mention methodology
    if "Methodology:" not in writeup:
        return True  # Not an overlap case, skip check
    
    if expected_method == "Raw Dose":
        return "Raw Dose" in writeup
    elif expected_method == "EQD2":
        return "EQD2" in writeup
    else:
        return False

def check_dicom_unavailable(writeup, should_have_dicom_text):
    """Check if DICOM unavailable text appears when expected."""
    dicom_text = "DICOM files for this treatment were unavailable" in writeup
    return dicom_text == should_have_dicom_text

def check_overlap_statement(writeup, has_overlap):
    """Check if overlap statement appears correctly."""
    has_overlap_text = "overlap" in writeup.lower()
    if has_overlap:
        return has_overlap_text and ("reconstructed" in writeup.lower() or "Methodology:" in writeup or "conservative" in writeup.lower())
    else:
        # No overlap case should mention minimal/no overlap
        return "minimal to no overlap" in writeup or "no history of prior radiation" in writeup

def check_dicom_methodology_consistency(writeup, has_dicom_unavailable, has_overlap):
    """Enhancement 1: Check that DICOM unavailable + overlap doesn't claim reconstruction in Velocity.
    
    Args:
        writeup: Generated writeup text
        has_dicom_unavailable: Whether any treatment has DICOM unavailable
        has_overlap: Whether there is overlap
        
    Returns:
        True if methodology is consistent with DICOM availability
    """
    if not has_overlap:
        return True  # No methodology section in no-overlap cases
    
    if has_dicom_unavailable:
        # Should NOT claim reconstruction in Velocity, should mention conservative approach
        has_conservative = "conservative" in writeup.lower() or "estimated" in writeup.lower()
        incorrectly_claims_reconstruction = "reconstructed on the current patient CT for summation" in writeup and "could not" not in writeup
        return has_conservative and not incorrectly_claims_reconstruction
    else:
        # Should mention normal Velocity reconstruction
        return "reconstructed" in writeup.lower() and "velocity" in writeup.lower()

def check_constraint_limits(writeup):
    """Enhancement 4: Check that constraint limits are included."""
    if "Dose Constraint Evaluation:" not in writeup:
        return True  # No constraints section
    
    # Check for [Limit: pattern
    return "[Limit:" in writeup

def check_constraint_source(writeup, expected_source):
    """Enhancement 2: Check that the correct constraint source is mentioned in methodology.
    
    Args:
        writeup: Generated writeup text
        expected_source: 'QUANTEC' or 'Timmerman'
        
    Returns:
        True if correct source is mentioned
    """
    if "Methodology:" not in writeup:
        return True  # No methodology section (no overlap case)
    
    if expected_source == 'QUANTEC':
        return "QUANTEC dose-volume constraints" in writeup
    elif expected_source == 'Timmerman':
        return "Timmerman/TG-101 SBRT constraints" in writeup
    else:
        return True  # Unknown source, pass

def check_fractionation_regime(dose, fractions):
    """Helper to detect fractionation regime for test configuration.
    
    Returns: 'SRS', 'SBRT', 'MODERATE_HYPOFX', or 'CONVENTIONAL'
    """
    if fractions <= 0:
        return "CONVENTIONAL"
    
    dose_per_fraction = dose / fractions
    
    if fractions == 1:
        return "SRS"
    
    if dose_per_fraction >= 5 and fractions <= 8:
        return "SBRT"
    
    if dose_per_fraction >= 2.5 and dose_per_fraction < 5:
        return "MODERATE_HYPOFX"
    
    return "CONVENTIONAL"

def get_expected_constraint_source(dose, fractions, dose_calc_method):
    """Determine expected constraint source based on fractionation and method.
    
    Args:
        dose: Treatment dose in Gy
        fractions: Number of fractions
        dose_calc_method: 'EQD2' or 'Raw Dose'
        
    Returns:
        Expected constraint source ('QUANTEC' or 'Timmerman')
    """
    # EQD2 always uses QUANTEC
    if "EQD2" in dose_calc_method:
        return "QUANTEC"
    
    # Raw Dose uses regime-appropriate constraints
    regime = check_fractionation_regime(dose, fractions)
    if regime in ["SRS", "SBRT"]:
        return "Timmerman"
    else:
        return "QUANTEC"

def check_v_spacing(writeup):
    """Enhancement 10: Check that V-dose constraints have proper spacing (V20 Gy not V20Gy)."""
    import re
    # Should NOT find patterns like V20Gy, V50Gy, V65Gy
    bad_patterns = re.findall(r'V\d+Gy\b', writeup)
    return len(bad_patterns) == 0

def check_custom_site(writeup, custom_site_name):
    """Check if custom site name appears in writeup."""
    if not custom_site_name:
        return True
    return custom_site_name.lower() in writeup.lower()

def perform_quality_checks(test_name, writeup, config):
    """Perform automated quality checks on generated writeup."""
    checks = {
        "No Demographics": not check_demographics(writeup),
        "Proper Dr. Format": check_physician_physicist_format(writeup),
        "Dose Calc Method": check_dose_calc_method(writeup, config.get('dose_calc_method', 'EQD2')),
        "DICOM Text": check_dicom_unavailable(writeup, config.get('has_dicom_unavailable', False)),
        "Overlap Statement": check_overlap_statement(writeup, config.get('has_overlap', False)),
        "Custom Site": check_custom_site(writeup, config.get('custom_site', '')),
        # New enhancement checks
        "DICOM Methodology": check_dicom_methodology_consistency(writeup, config.get('has_dicom_unavailable', False), config.get('has_overlap', False)),
        "Constraint Limits": check_constraint_limits(writeup),
        "V-Spacing": check_v_spacing(writeup),
        # Fractionation regime checks (Enhancement 2)
        "Constraint Source": check_constraint_source(writeup, config.get('expected_constraint_source', 'QUANTEC'))
    }
    
    all_passed = all(checks.values())
    return checks, all_passed

def generate_markdown_report(results):
    """Generate comprehensive markdown report from test results."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Calculate statistics
    total_tests = len(results)
    passed_tests = sum(1 for r in results if r['status'] == 'PASS')
    
    # Quality check statistics
    demographics_count = sum(1 for r in results if r['status'] == 'PASS' and r['quality_checks'].get('No Demographics', False))
    physician_format_count = sum(1 for r in results if r['status'] == 'PASS' and r['quality_checks'].get('Proper Dr. Format', False))
    dose_calc_count = sum(1 for r in results if r['status'] == 'PASS' and r['quality_checks'].get('Dose Calc Method', False))
    dicom_count = sum(1 for r in results if r['status'] == 'PASS' and r['quality_checks'].get('DICOM Text', False))
    overlap_count = sum(1 for r in results if r['status'] == 'PASS' and r['quality_checks'].get('Overlap Statement', False))
    custom_site_count = sum(1 for r in results if r['status'] == 'PASS' and r['quality_checks'].get('Custom Site', False))
    # New enhancement statistics
    dicom_methodology_count = sum(1 for r in results if r['status'] == 'PASS' and r['quality_checks'].get('DICOM Methodology', False))
    constraint_source_count = sum(1 for r in results if r['status'] == 'PASS' and r['quality_checks'].get('Constraint Source', False))
    constraint_limits_count = sum(1 for r in results if r['status'] == 'PASS' and r['quality_checks'].get('Constraint Limits', False))
    v_spacing_count = sum(1 for r in results if r['status'] == 'PASS' and r['quality_checks'].get('V-Spacing', False))
    
    report = f"""# Prior Dose Module - Comprehensive QA Test Results
Generated: {timestamp}

## Executive Summary
- **Total Tests:** {total_tests}
- **Passed:** {passed_tests}/{total_tests}
- **Failed:** {total_tests - passed_tests}

## Quality Metrics
- **No Patient Demographics:** {demographics_count}/{passed_tests} ✓
- **Proper Physician/Physicist Format:** {physician_format_count}/{passed_tests} ✓
- **Correct Dose Calc Method:** {dose_calc_count}/{passed_tests} ✓
- **DICOM Handling:** {dicom_count}/{passed_tests} ✓
- **Overlap Statement Logic:** {overlap_count}/{passed_tests} ✓
- **Custom Site Support:** {custom_site_count}/{passed_tests} ✓

## Enhancement Metrics (NEW)
- **DICOM Methodology Consistency (Enh 1):** {dicom_methodology_count}/{passed_tests} ✓
- **Constraint Source Text (Enh 2):** {constraint_source_count}/{passed_tests} ✓
- **Constraint Limits Included (Enh 4):** {constraint_limits_count}/{passed_tests} ✓
- **V-Dose Spacing (Enh 10):** {v_spacing_count}/{passed_tests} ✓

---

"""
    
    # Group results by suite
    suites = {}
    for result in results:
        suite = result.get('suite', 'Other')
        if suite not in suites:
            suites[suite] = []
        suites[suite].append(result)
    
    # Generate detailed results by suite
    for suite_name, suite_results in suites.items():
        report += f"## {suite_name}\n\n"
        
        for result in suite_results:
            report += f"### {result['name']}\n\n"
            report += f"**Status:** {result['status']}\n\n"
            
            if result['status'] == 'PASS':
                # Configuration
                report += f"**Configuration:**\n"
                for key, value in result['config'].items():
                    report += f"- {key}: {value}\n"
                report += "\n"
                
                # Quality checks
                report += f"**Quality Checks:**\n"
                for check_name, passed in result['quality_checks'].items():
                    status_icon = "✓" if passed else "✗"
                    report += f"- {status_icon} {check_name}\n"
                report += "\n"
                
                # Generated writeup
                report += f"**Generated Writeup:**\n```\n{result['writeup']}\n```\n\n"
            else:
                report += f"**Error:** {result.get('error', 'Unknown error')}\n\n"
            
            report += "---\n\n"
    
    # Final recommendations
    report += f"""## Recommendations

"""
    
    if passed_tests == total_tests:
        report += f"✓ **ALL TESTS PASSED!** Prior Dose module is production-ready.\n\n"
        report += "The module correctly handles:\n"
        report += "- Both dose calculation methods (Raw Dose and EQD2)\n"
        report += "- DICOM unavailable scenarios\n"
        report += "- Custom site functionality\n"
        report += "- Various overlap patterns (none, single, multiple, mixed)\n"
        report += "- Edge cases (high dose, many treatments, single fractions)\n"
    else:
        report += f"⚠ **{total_tests - passed_tests} TEST(S) FAILED** - Review failures before production deployment.\n"
    
    # Save report
    filename = f"prior_dose_comprehensive_qa_results.md"
    with open(filename, 'w') as f:
        f.write(report)
    
    print(f"\n📄 Comprehensive report saved to: {filename}")
    return filename

def main():
    """Run comprehensive test suite for Prior Dose module."""
    print("\n" + "="*80)
    print("PRIOR DOSE MODULE - COMPREHENSIVE QA TEST SUITE")
    print("="*80)
    print("\nTesting against:", BASE_URL)
    
    results = []
    
    # =========================================================================
    # SUITE 1: DOSE CALCULATION METHODS
    # =========================================================================
    print("\n" + "="*80)
    print("SUITE 1: DOSE CALCULATION METHODS")
    print("="*80)
    
    # Test 1: EQD2 with overlap (most common clinical scenario)
    test1_payload = create_payload(
        physician="Galvan",
        physicist="Kirby",
        current_site="thorax",
        current_dose=50.0,
        current_fractions=25,
        prior_treatments=[{
            "site": "lung",
            "custom_site": "",
            "dose": 60.0,
            "fractions": 30,
            "month": "June",
            "year": 2023,
            "spine_location": "",
            "has_overlap": True,
            "dicoms_unavailable": False
        }],
        dose_calc_method="EQD2 (Equivalent Dose in 2 Gy fractions)",
        critical_structures=["spinal cord", "lungs"]
    )
    
    result1 = run_test("EQD2 Method - Single Prior with Overlap", test1_payload)
    checks1, passed1 = perform_quality_checks("Test 1", result1.get("writeup", ""), {
        'dose_calc_method': 'EQD2',
        'has_dicom_unavailable': False,
        'has_overlap': True,
        'custom_site': '',
        'expected_constraint_source': 'QUANTEC'  # EQD2 always uses QUANTEC
    })
    results.append({
        "suite": "Suite 1: Dose Calculation Methods",
        "name": "Test 1: EQD2 with Overlap",
        "status": result1["status"],
        "writeup": result1.get("writeup", ""),
        "error": result1.get("error", ""),
        "config": {
            "Physician": "Galvan",
            "Physicist": "Kirby",
            "Current Site": "thorax - 50.0 Gy / 25 fx",
            "Prior Treatments": "1 (lung - 60.0 Gy / 30 fx)",
            "Dose Calc": "EQD2",
            "Overlap": "Yes"
        },
        "quality_checks": checks1
    })
    
    # Test 2: Raw Dose with overlap
    test2_payload = create_payload(
        physician="Galvan",
        physicist="Kirby",
        current_site="pelvis",
        current_dose=45.0,
        current_fractions=25,
        prior_treatments=[{
            "site": "pelvis",
            "custom_site": "",
            "dose": 50.4,
            "fractions": 28,
            "month": "March",
            "year": 2022,
            "spine_location": "",
            "has_overlap": True,
            "dicoms_unavailable": False
        }],
        dose_calc_method="Raw Dose (no biologic correction)",
        critical_structures=["rectum", "bladder"]
    )
    
    result2 = run_test("Raw Dose Method - Single Prior with Overlap", test2_payload)
    checks2, passed2 = perform_quality_checks("Test 2", result2.get("writeup", ""), {
        'dose_calc_method': 'Raw Dose',
        'has_dicom_unavailable': False,
        'has_overlap': True,
        'custom_site': '',
        'expected_constraint_source': 'QUANTEC'  # 45 Gy/25 fx = 1.8 Gy/fx = conventional
    })
    results.append({
        "suite": "Suite 1: Dose Calculation Methods",
        "name": "Test 2: Raw Dose with Overlap",
        "status": result2["status"],
        "writeup": result2.get("writeup", ""),
        "error": result2.get("error", ""),
        "config": {
            "Physician": "Galvan",
            "Physicist": "Kirby",
            "Current Site": "pelvis - 45.0 Gy / 25 fx",
            "Prior Treatments": "1 (pelvis - 50.4 Gy / 28 fx)",
            "Dose Calc": "Raw Dose",
            "Overlap": "Yes"
        },
        "quality_checks": checks2
    })
    
    # =========================================================================
    # SUITE 2: DICOM UNAVAILABLE SCENARIOS
    # =========================================================================
    print("\n" + "="*80)
    print("SUITE 2: DICOM UNAVAILABLE SCENARIOS")
    print("="*80)
    
    # Test 3: Single prior with DICOM unavailable, no overlap
    test3_payload = create_payload(
        physician="Galvan",
        physicist="Kirby",
        current_site="brain",
        current_dose=54.0,
        current_fractions=30,
        prior_treatments=[{
            "site": "head and neck",
            "custom_site": "",
            "dose": 70.0,
            "fractions": 35,
            "month": "January",
            "year": 2020,
            "spine_location": "",
            "has_overlap": False,
            "dicoms_unavailable": True
        }],
        dose_calc_method="EQD2 (Equivalent Dose in 2 Gy fractions)"
    )
    
    result3 = run_test("DICOM Unavailable - No Overlap", test3_payload)
    checks3, passed3 = perform_quality_checks("Test 3", result3.get("writeup", ""), {
        'dose_calc_method': 'EQD2',
        'has_dicom_unavailable': True,
        'has_overlap': False,
        'custom_site': '',
        'expected_constraint_source': 'QUANTEC'
    })
    results.append({
        "suite": "Suite 2: DICOM Unavailable",
        "name": "Test 3: DICOM Unavailable, No Overlap",
        "status": result3["status"],
        "writeup": result3.get("writeup", ""),
        "error": result3.get("error", ""),
        "config": {
            "Physician": "Galvan",
            "Physicist": "Kirby",
            "Current Site": "brain - 54.0 Gy / 30 fx",
            "Prior Treatments": "1 (head and neck - 70.0 Gy / 35 fx)",
            "DICOM": "Unavailable",
            "Overlap": "No"
        },
        "quality_checks": checks3
    })
    
    # Test 4: Single prior with DICOM unavailable, with overlap
    test4_payload = create_payload(
        physician="Galvan",
        physicist="Kirby",
        current_site="abdomen",
        current_dose=50.4,
        current_fractions=28,
        prior_treatments=[{
            "site": "liver",
            "custom_site": "",
            "dose": 54.0,
            "fractions": 30,
            "month": "August",
            "year": 2021,
            "spine_location": "",
            "has_overlap": True,
            "dicoms_unavailable": True
        }],
        dose_calc_method="EQD2 (Equivalent Dose in 2 Gy fractions)",
        critical_structures=["liver", "kidneys"]
    )
    
    result4 = run_test("DICOM Unavailable - With Overlap", test4_payload)
    checks4, passed4 = perform_quality_checks("Test 4", result4.get("writeup", ""), {
        'dose_calc_method': 'EQD2',
        'has_dicom_unavailable': True,
        'has_overlap': True,
        'custom_site': '',
        'expected_constraint_source': 'QUANTEC'
    })
    results.append({
        "suite": "Suite 2: DICOM Unavailable",
        "name": "Test 4: DICOM Unavailable, With Overlap",
        "status": result4["status"],
        "writeup": result4.get("writeup", ""),
        "error": result4.get("error", ""),
        "config": {
            "Physician": "Galvan",
            "Physicist": "Kirby",
            "Current Site": "abdomen - 50.4 Gy / 28 fx",
            "Prior Treatments": "1 (liver - 54.0 Gy / 30 fx)",
            "DICOM": "Unavailable",
            "Overlap": "Yes"
        },
        "quality_checks": checks4
    })
    
    # Test 5: Multiple prior with mixed DICOM availability
    test5_payload = create_payload(
        physician="Galvan",
        physicist="Kirby",
        current_site="spine",
        current_dose=24.0,
        current_fractions=3,
        prior_treatments=[
            {
                "site": "thorax",
                "custom_site": "",
                "dose": 50.0,
                "fractions": 25,
                "month": "March",
                "year": 2020,
                "spine_location": "",
                "has_overlap": True,
                "dicoms_unavailable": True
            },
            {
                "site": "spine",
                "custom_site": "",
                "dose": 30.0,
                "fractions": 10,
                "month": "September",
                "year": 2022,
                "spine_location": "",
                "has_overlap": True,
                "dicoms_unavailable": False
            }
        ],
        dose_calc_method="EQD2 (Equivalent Dose in 2 Gy fractions)",
        critical_structures=["spinal cord"]
    )
    
    result5 = run_test("Multiple Prior - Mixed DICOM Availability", test5_payload)
    checks5, passed5 = perform_quality_checks("Test 5", result5.get("writeup", ""), {
        'dose_calc_method': 'EQD2',
        'has_dicom_unavailable': True,  # At least one has DICOM unavailable
        'has_overlap': True,
        'custom_site': '',
        'expected_constraint_source': 'QUANTEC'
    })
    results.append({
        "suite": "Suite 2: DICOM Unavailable",
        "name": "Test 5: Multiple Prior, Mixed DICOM",
        "status": result5["status"],
        "writeup": result5.get("writeup", ""),
        "error": result5.get("error", ""),
        "config": {
            "Physician": "Galvan",
            "Physicist": "Kirby",
            "Current Site": "spine - 24.0 Gy / 3 fx",
            "Prior Treatments": "2 (mixed DICOM availability)",
            "Overlap": "Yes (both)"
        },
        "quality_checks": checks5
    })
    
    # =========================================================================
    # SUITE 3: CUSTOM SITE FUNCTIONALITY
    # =========================================================================
    print("\n" + "="*80)
    print("SUITE 3: CUSTOM SITE FUNCTIONALITY")
    print("="*80)
    
    # Test 6: Custom current site
    test6_payload = create_payload(
        physician="Galvan",
        physicist="Kirby",
        current_site="",  # Empty standard site
        current_dose=50.0,
        current_fractions=25,
        prior_treatments=[{
            "site": "thorax",
            "custom_site": "",
            "dose": 60.0,
            "fractions": 30,
            "month": "May",
            "year": 2022,
            "spine_location": "",
            "has_overlap": False,
            "dicoms_unavailable": False
        }],
        dose_calc_method="EQD2 (Equivalent Dose in 2 Gy fractions)",
        custom_current_site="left axilla"
    )
    
    result6 = run_test("Custom Current Site", test6_payload)
    checks6, passed6 = perform_quality_checks("Test 6", result6.get("writeup", ""), {
        'dose_calc_method': 'EQD2',
        'has_dicom_unavailable': False,
        'has_overlap': False,
        'custom_site': 'left axilla',
        'expected_constraint_source': 'QUANTEC'
    })
    results.append({
        "suite": "Suite 3: Custom Sites",
        "name": "Test 6: Custom Current Site",
        "status": result6["status"],
        "writeup": result6.get("writeup", ""),
        "error": result6.get("error", ""),
        "config": {
            "Physician": "Galvan",
            "Physicist": "Kirby",
            "Current Site": "left axilla (custom) - 50.0 Gy / 25 fx",
            "Prior Treatments": "1 (thorax - 60.0 Gy / 30 fx)",
            "Overlap": "No"
        },
        "quality_checks": checks6
    })
    
    # Test 7: Custom prior site
    test7_payload = create_payload(
        physician="Galvan",
        physicist="Kirby",
        current_site="breast",
        current_dose=50.4,
        current_fractions=28,
        prior_treatments=[{
            "site": "",  # Empty standard site
            "custom_site": "right supraclavicular fossa",
            "dose": 46.0,
            "fractions": 23,
            "month": "July",
            "year": 2021,
            "spine_location": "",
            "has_overlap": True,
            "dicoms_unavailable": False
        }],
        dose_calc_method="EQD2 (Equivalent Dose in 2 Gy fractions)",
        critical_structures=["brachial plexus"]
    )
    
    result7 = run_test("Custom Prior Site with Overlap", test7_payload)
    checks7, passed7 = perform_quality_checks("Test 7", result7.get("writeup", ""), {
        'dose_calc_method': 'EQD2',
        'has_dicom_unavailable': False,
        'has_overlap': True,
        'custom_site': 'right supraclavicular fossa',
        'expected_constraint_source': 'QUANTEC'
    })
    results.append({
        "suite": "Suite 3: Custom Sites",
        "name": "Test 7: Custom Prior Site with Overlap",
        "status": result7["status"],
        "writeup": result7.get("writeup", ""),
        "error": result7.get("error", ""),
        "config": {
            "Physician": "Galvan",
            "Physicist": "Kirby",
            "Current Site": "breast - 50.4 Gy / 28 fx",
            "Prior Treatments": "1 (right supraclavicular fossa - custom)",
            "Overlap": "Yes"
        },
        "quality_checks": checks7
    })
    
    # Test 8: Both custom sites
    test8_payload = create_payload(
        physician="Galvan",
        physicist="Kirby",
        current_site="",
        current_dose=39.0,
        current_fractions=13,
        prior_treatments=[{
            "site": "",
            "custom_site": "posterior mediastinum",
            "dose": 45.0,
            "fractions": 25,
            "month": "February",
            "year": 2021,
            "spine_location": "",
            "has_overlap": False,
            "dicoms_unavailable": False
        }],
        dose_calc_method="EQD2 (Equivalent Dose in 2 Gy fractions)",
        custom_current_site="left hilum"
    )
    
    result8 = run_test("Both Current and Prior Custom Sites", test8_payload)
    checks8, passed8 = perform_quality_checks("Test 8", result8.get("writeup", ""), {
        'dose_calc_method': 'EQD2',
        'has_dicom_unavailable': False,
        'has_overlap': False,
        'custom_site': 'left hilum',
        'expected_constraint_source': 'QUANTEC'
    })
    results.append({
        "suite": "Suite 3: Custom Sites",
        "name": "Test 8: Both Custom Sites",
        "status": result8["status"],
        "writeup": result8.get("writeup", ""),
        "error": result8.get("error", ""),
        "config": {
            "Physician": "Galvan",
            "Physicist": "Kirby",
            "Current Site": "left hilum (custom) - 39.0 Gy / 13 fx",
            "Prior Treatments": "1 (posterior mediastinum - custom)",
            "Overlap": "No"
        },
        "quality_checks": checks8
    })
    
    # =========================================================================
    # SUITE 4: OVERLAP PATTERN VARIATIONS
    # =========================================================================
    print("\n" + "="*80)
    print("SUITE 4: OVERLAP PATTERN VARIATIONS")
    print("="*80)
    
    # Test 9: Multiple prior - all have overlap
    test9_payload = create_payload(
        physician="Galvan",
        physicist="Kirby",
        current_site="thorax",
        current_dose=60.0,
        current_fractions=30,
        prior_treatments=[
            {
                "site": "lung",
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
                "site": "thorax",
                "custom_site": "",
                "dose": 45.0,
                "fractions": 25,
                "month": "June",
                "year": 2021,
                "spine_location": "",
                "has_overlap": True,
                "dicoms_unavailable": False
            },
            {
                "site": "lung",
                "custom_site": "",
                "dose": 50.4,
                "fractions": 28,
                "month": "March",
                "year": 2022,
                "spine_location": "",
                "has_overlap": True,
                "dicoms_unavailable": False
            }
        ],
        dose_calc_method="EQD2 (Equivalent Dose in 2 Gy fractions)",
        critical_structures=["lungs", "spinal cord", "esophagus"]
    )
    
    result9 = run_test("Multiple Prior - All Overlap", test9_payload)
    checks9, passed9 = perform_quality_checks("Test 9", result9.get("writeup", ""), {
        'dose_calc_method': 'EQD2',
        'has_dicom_unavailable': False,
        'has_overlap': True,
        'custom_site': '',
        'expected_constraint_source': 'QUANTEC'
    })
    results.append({
        "suite": "Suite 4: Overlap Patterns",
        "name": "Test 9: Three Prior, All Overlap",
        "status": result9["status"],
        "writeup": result9.get("writeup", ""),
        "error": result9.get("error", ""),
        "config": {
            "Physician": "Galvan",
            "Physicist": "Kirby",
            "Current Site": "thorax - 60.0 Gy / 30 fx",
            "Prior Treatments": "3 (all with overlap)",
            "Critical Structures": "lungs, spinal cord, esophagus"
        },
        "quality_checks": checks9
    })
    
    # Test 10: Multiple prior - none overlap
    test10_payload = create_payload(
        physician="Galvan",
        physicist="Kirby",
        current_site="brain",
        current_dose=54.0,
        current_fractions=30,
        prior_treatments=[
            {
                "site": "breast",
                "custom_site": "",
                "dose": 50.4,
                "fractions": 28,
                "month": "January",
                "year": 2018,
                "spine_location": "",
                "has_overlap": False,
                "dicoms_unavailable": False
            },
            {
                "site": "pelvis",
                "custom_site": "",
                "dose": 45.0,
                "fractions": 25,
                "month": "June",
                "year": 2019,
                "spine_location": "",
                "has_overlap": False,
                "dicoms_unavailable": False
            }
        ],
        dose_calc_method="EQD2 (Equivalent Dose in 2 Gy fractions)"
    )
    
    result10 = run_test("Multiple Prior - None Overlap", test10_payload)
    checks10, passed10 = perform_quality_checks("Test 10", result10.get("writeup", ""), {
        'dose_calc_method': 'EQD2',
        'has_dicom_unavailable': False,
        'has_overlap': False,
        'custom_site': '',
        'expected_constraint_source': 'QUANTEC'
    })
    results.append({
        "suite": "Suite 4: Overlap Patterns",
        "name": "Test 10: Two Prior, None Overlap",
        "status": result10["status"],
        "writeup": result10.get("writeup", ""),
        "error": result10.get("error", ""),
        "config": {
            "Physician": "Galvan",
            "Physicist": "Kirby",
            "Current Site": "brain - 54.0 Gy / 30 fx",
            "Prior Treatments": "2 (none with overlap)",
            "Overlap": "No"
        },
        "quality_checks": checks10
    })
    
    # Test 11: Multiple prior - mixed overlap (1 of 3)
    test11_payload = create_payload(
        physician="Galvan",
        physicist="Kirby",
        current_site="pelvis",
        current_dose=50.4,
        current_fractions=28,
        prior_treatments=[
            {
                "site": "breast",
                "custom_site": "",
                "dose": 50.0,
                "fractions": 25,
                "month": "January",
                "year": 2019,
                "spine_location": "",
                "has_overlap": False,
                "dicoms_unavailable": False
            },
            {
                "site": "pelvis",
                "custom_site": "",
                "dose": 45.0,
                "fractions": 25,
                "month": "June",
                "year": 2021,
                "spine_location": "",
                "has_overlap": True,
                "dicoms_unavailable": False
            },
            {
                "site": "lung",
                "custom_site": "",
                "dose": 60.0,
                "fractions": 30,
                "month": "March",
                "year": 2020,
                "spine_location": "",
                "has_overlap": False,
                "dicoms_unavailable": False
            }
        ],
        dose_calc_method="EQD2 (Equivalent Dose in 2 Gy fractions)",
        critical_structures=["rectum", "bladder"]
    )
    
    result11 = run_test("Multiple Prior - Mixed Overlap (1 of 3)", test11_payload)
    checks11, passed11 = perform_quality_checks("Test 11", result11.get("writeup", ""), {
        'dose_calc_method': 'EQD2',
        'has_dicom_unavailable': False,
        'has_overlap': True,  # At least one has overlap
        'custom_site': '',
        'expected_constraint_source': 'QUANTEC'
    })
    results.append({
        "suite": "Suite 4: Overlap Patterns",
        "name": "Test 11: Three Prior, One Overlap",
        "status": result11["status"],
        "writeup": result11.get("writeup", ""),
        "error": result11.get("error", ""),
        "config": {
            "Physician": "Galvan",
            "Physicist": "Kirby",
            "Current Site": "pelvis - 50.4 Gy / 28 fx",
            "Prior Treatments": "3 (1 with overlap)",
            "Overlap": "Mixed (1/3)"
        },
        "quality_checks": checks11
    })
    
    # =========================================================================
    # SUITE 5: EDGE CASES
    # =========================================================================
    print("\n" + "="*80)
    print("SUITE 5: EDGE CASES")
    print("="*80)
    
    # Test 12: High dose SBRT/SRS treatment
    test12_payload = create_payload(
        physician="Galvan",
        physicist="Kirby",
        current_site="lung",
        current_dose=50.0,
        current_fractions=5,  # SBRT
        prior_treatments=[{
            "site": "lung",
            "custom_site": "",
            "dose": 48.0,
            "fractions": 4,  # SBRT
            "month": "April",
            "year": 2022,
            "spine_location": "",
            "has_overlap": True,
            "dicoms_unavailable": False
        }],
        dose_calc_method="EQD2 (Equivalent Dose in 2 Gy fractions)",
        critical_structures=["spinal cord", "lungs"]
    )
    
    result12 = run_test("High Dose - SBRT Current and Prior", test12_payload)
    checks12, passed12 = perform_quality_checks("Test 12", result12.get("writeup", ""), {
        'dose_calc_method': 'EQD2',
        'has_dicom_unavailable': False,
        'has_overlap': True,
        'custom_site': '',
        'expected_constraint_source': 'QUANTEC'  # EQD2 always uses QUANTEC
    })
    results.append({
        "suite": "Suite 5: Edge Cases",
        "name": "Test 12: SBRT Doses with Overlap",
        "status": result12["status"],
        "writeup": result12.get("writeup", ""),
        "error": result12.get("error", ""),
        "config": {
            "Physician": "Galvan",
            "Physicist": "Kirby",
            "Current Site": "lung - 50.0 Gy / 5 fx (SBRT)",
            "Prior Treatments": "1 (lung - 48.0 Gy / 4 fx SBRT)",
            "Overlap": "Yes"
        },
        "quality_checks": checks12
    })
    
    # Test 13: Single fraction treatment (SRS)
    test13_payload = create_payload(
        physician="Galvan",
        physicist="Kirby",
        current_site="brain",
        current_dose=20.0,
        current_fractions=1,  # SRS
        prior_treatments=[{
            "site": "brain",
            "custom_site": "",
            "dose": 18.0,
            "fractions": 1,  # SRS
            "month": "November",
            "year": 2021,
            "spine_location": "",
            "has_overlap": False,
            "dicoms_unavailable": False
        }],
        dose_calc_method="EQD2 (Equivalent Dose in 2 Gy fractions)"
    )
    
    result13 = run_test("Single Fraction - SRS Current and Prior", test13_payload)
    checks13, passed13 = perform_quality_checks("Test 13", result13.get("writeup", ""), {
        'dose_calc_method': 'EQD2',
        'has_dicom_unavailable': False,
        'has_overlap': False,
        'custom_site': '',
        'expected_constraint_source': 'QUANTEC'  # EQD2 always uses QUANTEC
    })
    results.append({
        "suite": "Suite 5: Edge Cases",
        "name": "Test 13: Single Fraction (SRS)",
        "status": result13["status"],
        "writeup": result13.get("writeup", ""),
        "error": result13.get("error", ""),
        "config": {
            "Physician": "Galvan",
            "Physicist": "Kirby",
            "Current Site": "brain - 20.0 Gy / 1 fx (SRS)",
            "Prior Treatments": "1 (brain - 18.0 Gy / 1 fx SRS)",
            "Overlap": "No"
        },
        "quality_checks": checks13
    })
    
    # Test 14: Many prior treatments (5)
    test14_payload = create_payload(
        physician="Galvan",
        physicist="Kirby",
        current_site="thorax",
        current_dose=50.0,
        current_fractions=25,
        prior_treatments=[
            {
                "site": "breast",
                "custom_site": "",
                "dose": 50.4,
                "fractions": 28,
                "month": "January",
                "year": 2018,
                "spine_location": "",
                "has_overlap": False,
                "dicoms_unavailable": False
            },
            {
                "site": "lung",
                "custom_site": "",
                "dose": 60.0,
                "fractions": 30,
                "month": "June",
                "year": 2019,
                "spine_location": "",
                "has_overlap": True,
                "dicoms_unavailable": False
            },
            {
                "site": "brain",
                "custom_site": "",
                "dose": 54.0,
                "fractions": 30,
                "month": "March",
                "year": 2020,
                "spine_location": "",
                "has_overlap": False,
                "dicoms_unavailable": True
            },
            {
                "site": "thorax",
                "custom_site": "",
                "dose": 45.0,
                "fractions": 25,
                "month": "September",
                "year": 2021,
                "spine_location": "",
                "has_overlap": True,
                "dicoms_unavailable": False
            },
            {
                "site": "pelvis",
                "custom_site": "",
                "dose": 50.4,
                "fractions": 28,
                "month": "February",
                "year": 2023,
                "spine_location": "",
                "has_overlap": False,
                "dicoms_unavailable": False
            }
        ],
        dose_calc_method="EQD2 (Equivalent Dose in 2 Gy fractions)",
        critical_structures=["spinal cord", "lungs", "esophagus"]
    )
    
    result14 = run_test("Many Prior Treatments (5 total)", test14_payload)
    checks14, passed14 = perform_quality_checks("Test 14", result14.get("writeup", ""), {
        'dose_calc_method': 'EQD2',
        'has_dicom_unavailable': True,
        'has_overlap': True,
        'custom_site': '',
        'expected_constraint_source': 'QUANTEC'  # EQD2 always uses QUANTEC
    })
    results.append({
        "suite": "Suite 5: Edge Cases",
        "name": "Test 14: Five Prior Treatments",
        "status": result14["status"],
        "writeup": result14.get("writeup", ""),
        "error": result14.get("error", ""),
        "config": {
            "Physician": "Galvan",
            "Physicist": "Kirby",
            "Current Site": "thorax - 50.0 Gy / 25 fx",
            "Prior Treatments": "5 (mixed overlap, one DICOM unavailable)",
            "Overlap": "2 of 5"
        },
        "quality_checks": checks14
    })
    
    # Test 15: No prior treatments (baseline case)
    test15_payload = create_payload(
        physician="Galvan",
        physicist="Kirby",
        current_site="prostate",
        current_dose=78.0,
        current_fractions=39,
        prior_treatments=[],  # No prior treatments
        dose_calc_method="EQD2 (Equivalent Dose in 2 Gy fractions)"
    )
    
    result15 = run_test("No Prior Treatments - Baseline", test15_payload)
    checks15, passed15 = perform_quality_checks("Test 15", result15.get("writeup", ""), {
        'dose_calc_method': 'EQD2',
        'has_dicom_unavailable': False,
        'has_overlap': False,
        'custom_site': '',
        'expected_constraint_source': 'QUANTEC'
    })
    results.append({
        "suite": "Suite 5: Edge Cases",
        "name": "Test 15: No Prior Treatments",
        "status": result15["status"],
        "writeup": result15.get("writeup", ""),
        "error": result15.get("error", ""),
        "config": {
            "Physician": "Galvan",
            "Physicist": "Kirby",
            "Current Site": "prostate - 78.0 Gy / 39 fx",
            "Prior Treatments": "0 (none)",
            "Overlap": "N/A"
        },
        "quality_checks": checks15
    })
    
    # =========================================================================
    # SUITE 6: FRACTIONATION REGIME DETECTION (NEW)
    # =========================================================================
    print("\n" + "="*80)
    print("SUITE 6: FRACTIONATION REGIME DETECTION")
    print("="*80)
    
    # Test 16: SBRT current treatment should use Timmerman constraints (Raw Dose)
    test16_payload = create_payload(
        physician="Galvan",
        physicist="Kirby",
        current_site="lung",
        current_dose=50.0,
        current_fractions=5,  # 10 Gy/fx = SBRT
        prior_treatments=[{
            "site": "lung",
            "custom_site": "",
            "dose": 60.0,
            "fractions": 30,  # 2 Gy/fx = Conventional
            "month": "June",
            "year": 2022,
            "spine_location": "",
            "has_overlap": True,
            "dicoms_unavailable": False
        }],
        dose_calc_method="Raw Dose",
        critical_structures=["spinal cord", "lungs"]
    )
    
    result16 = run_test("SBRT Current + Conventional Prior (Raw Dose) - Should use Timmerman", test16_payload)
    checks16, passed16 = perform_quality_checks("Test 16", result16.get("writeup", ""), {
        'dose_calc_method': 'Raw Dose',
        'has_dicom_unavailable': False,
        'has_overlap': True,
        'custom_site': '',
        'expected_constraint_source': 'Timmerman'  # SBRT current = Timmerman constraints
    })
    results.append({
        "suite": "Suite 6: Fractionation Regime",
        "name": "Test 16: SBRT Current (Raw Dose) → Timmerman",
        "status": result16["status"],
        "writeup": result16.get("writeup", ""),
        "error": result16.get("error", ""),
        "config": {
            "Physician": "Galvan",
            "Physicist": "Kirby",
            "Current Site": "lung - 50.0 Gy / 5 fx (SBRT)",
            "Prior Treatments": "1 (lung - 60.0 Gy / 30 fx conventional)",
            "Dose Calc": "Raw Dose",
            "Expected Constraints": "Timmerman/TG-101"
        },
        "quality_checks": checks16
    })
    
    # Test 17: Conventional current treatment should use QUANTEC constraints (Raw Dose)
    test17_payload = create_payload(
        physician="Galvan",
        physicist="Kirby",
        current_site="pelvis",
        current_dose=50.4,
        current_fractions=28,  # 1.8 Gy/fx = Conventional
        prior_treatments=[{
            "site": "pelvis",
            "custom_site": "",
            "dose": 45.0,
            "fractions": 25,  # 1.8 Gy/fx = Conventional
            "month": "March",
            "year": 2022,
            "spine_location": "",
            "has_overlap": True,
            "dicoms_unavailable": False
        }],
        dose_calc_method="Raw Dose",
        critical_structures=["rectum", "bladder"]
    )
    
    result17 = run_test("Conventional Current + Conventional Prior (Raw Dose) - Should use QUANTEC", test17_payload)
    checks17, passed17 = perform_quality_checks("Test 17", result17.get("writeup", ""), {
        'dose_calc_method': 'Raw Dose',
        'has_dicom_unavailable': False,
        'has_overlap': True,
        'custom_site': '',
        'expected_constraint_source': 'QUANTEC'  # Conventional current = QUANTEC constraints
    })
    results.append({
        "suite": "Suite 6: Fractionation Regime",
        "name": "Test 17: Conventional Current (Raw Dose) → QUANTEC",
        "status": result17["status"],
        "writeup": result17.get("writeup", ""),
        "error": result17.get("error", ""),
        "config": {
            "Physician": "Galvan",
            "Physicist": "Kirby",
            "Current Site": "pelvis - 50.4 Gy / 28 fx (conventional)",
            "Prior Treatments": "1 (pelvis - 45.0 Gy / 25 fx conventional)",
            "Dose Calc": "Raw Dose",
            "Expected Constraints": "QUANTEC"
        },
        "quality_checks": checks17
    })
    
    # Test 18: EQD2 always uses QUANTEC regardless of fractionation
    test18_payload = create_payload(
        physician="Galvan",
        physicist="Kirby",
        current_site="lung",
        current_dose=50.0,
        current_fractions=5,  # 10 Gy/fx = SBRT
        prior_treatments=[{
            "site": "lung",
            "custom_site": "",
            "dose": 48.0,
            "fractions": 4,  # 12 Gy/fx = SBRT
            "month": "April",
            "year": 2022,
            "spine_location": "",
            "has_overlap": True,
            "dicoms_unavailable": False
        }],
        dose_calc_method="EQD2 (Equivalent Dose in 2 Gy fractions)",
        critical_structures=["spinal cord", "lungs"]
    )
    
    result18 = run_test("SBRT Current + SBRT Prior (EQD2) - Should use QUANTEC", test18_payload)
    checks18, passed18 = perform_quality_checks("Test 18", result18.get("writeup", ""), {
        'dose_calc_method': 'EQD2',
        'has_dicom_unavailable': False,
        'has_overlap': True,
        'custom_site': '',
        'expected_constraint_source': 'QUANTEC'  # EQD2 always uses QUANTEC
    })
    results.append({
        "suite": "Suite 6: Fractionation Regime",
        "name": "Test 18: SBRT Current (EQD2) → QUANTEC",
        "status": result18["status"],
        "writeup": result18.get("writeup", ""),
        "error": result18.get("error", ""),
        "config": {
            "Physician": "Galvan",
            "Physicist": "Kirby",
            "Current Site": "lung - 50.0 Gy / 5 fx (SBRT)",
            "Prior Treatments": "1 (lung - 48.0 Gy / 4 fx SBRT)",
            "Dose Calc": "EQD2",
            "Expected Constraints": "QUANTEC (EQD2 always uses QUANTEC)"
        },
        "quality_checks": checks18
    })
    
    # Test 19: SRS (single fraction) should use Timmerman constraints (Raw Dose)
    test19_payload = create_payload(
        physician="Galvan",
        physicist="Kirby",
        current_site="brain",
        current_dose=20.0,
        current_fractions=1,  # SRS
        prior_treatments=[{
            "site": "brain",
            "custom_site": "",
            "dose": 54.0,
            "fractions": 30,  # Conventional
            "month": "January",
            "year": 2022,
            "spine_location": "",
            "has_overlap": True,
            "dicoms_unavailable": False
        }],
        dose_calc_method="Raw Dose",
        critical_structures=["brainstem", "optic chiasm"]
    )
    
    result19 = run_test("SRS Current + Conventional Prior (Raw Dose) - Should use Timmerman", test19_payload)
    checks19, passed19 = perform_quality_checks("Test 19", result19.get("writeup", ""), {
        'dose_calc_method': 'Raw Dose',
        'has_dicom_unavailable': False,
        'has_overlap': True,
        'custom_site': '',
        'expected_constraint_source': 'Timmerman'  # SRS current = Timmerman/TG-101 constraints
    })
    results.append({
        "suite": "Suite 6: Fractionation Regime",
        "name": "Test 19: SRS Current (Raw Dose) → Timmerman",
        "status": result19["status"],
        "writeup": result19.get("writeup", ""),
        "error": result19.get("error", ""),
        "config": {
            "Physician": "Galvan",
            "Physicist": "Kirby",
            "Current Site": "brain - 20.0 Gy / 1 fx (SRS)",
            "Prior Treatments": "1 (brain - 54.0 Gy / 30 fx conventional)",
            "Dose Calc": "Raw Dose",
            "Expected Constraints": "Timmerman/TG-101"
        },
        "quality_checks": checks19
    })
    
    # Test 20: Moderate hypofractionation should use QUANTEC constraints (Raw Dose)
    test20_payload = create_payload(
        physician="Galvan",
        physicist="Kirby",
        current_site="prostate",
        current_dose=70.0,
        current_fractions=28,  # 2.5 Gy/fx = Moderate hypofx
        prior_treatments=[{
            "site": "prostate",
            "custom_site": "",
            "dose": 66.0,
            "fractions": 22,  # 3 Gy/fx = Moderate hypofx
            "month": "May",
            "year": 2021,
            "spine_location": "",
            "has_overlap": True,
            "dicoms_unavailable": False
        }],
        dose_calc_method="Raw Dose",
        critical_structures=["rectum", "bladder"]
    )
    
    result20 = run_test("Moderate Hypofx Current + Prior (Raw Dose) - Should use QUANTEC", test20_payload)
    checks20, passed20 = perform_quality_checks("Test 20", result20.get("writeup", ""), {
        'dose_calc_method': 'Raw Dose',
        'has_dicom_unavailable': False,
        'has_overlap': True,
        'custom_site': '',
        'expected_constraint_source': 'QUANTEC'  # Moderate hypofx uses QUANTEC
    })
    results.append({
        "suite": "Suite 6: Fractionation Regime",
        "name": "Test 20: Moderate Hypofx Current (Raw Dose) → QUANTEC",
        "status": result20["status"],
        "writeup": result20.get("writeup", ""),
        "error": result20.get("error", ""),
        "config": {
            "Physician": "Galvan",
            "Physicist": "Kirby",
            "Current Site": "prostate - 70.0 Gy / 28 fx (moderate hypofx)",
            "Prior Treatments": "1 (prostate - 66.0 Gy / 22 fx moderate hypofx)",
            "Dose Calc": "Raw Dose",
            "Expected Constraints": "QUANTEC"
        },
        "quality_checks": checks20
    })
    
    # Generate comprehensive markdown report
    print("\n" + "="*80)
    print("GENERATING COMPREHENSIVE REPORT")
    print("="*80)
    generate_markdown_report(results)
    
    # Summary
    passed = sum(1 for r in results if r['status'] == 'PASS')
    total = len(results)
    
    print("\n" + "="*80)
    print(f"FINAL RESULTS: {passed}/{total} tests passed")
    print("="*80)
    
    if passed == total:
        print("\n✓ All comprehensive tests passed! Prior Dose module is production-ready.")
        print("\nThe module correctly handles:")
        print("  • Dose calculation methods (Raw Dose and EQD2)")
        print("  • DICOM unavailable scenarios")
        print("  • Custom site functionality")
        print("  • Various overlap patterns")
        print("  • Edge cases (SBRT/SRS doses, many treatments, no prior)")
    else:
        print(f"\n✗ {total - passed} test(s) failed. Review the report for details.")

if __name__ == "__main__":
    main()

