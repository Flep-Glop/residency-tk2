#!/usr/bin/env python3
"""
Comprehensive SBRT QA Test Script
Following the pattern from DIBH comprehensive testing (Entry #30)

Tests all treatment sites, breathing techniques, edge cases,
and generates markdown report for clinical review.
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api"
OUTPUT_FILE = "sbrt_qa_results.md"

# Standard physicians and physicists for consistency
PHYSICIAN = "Galvan"
PHYSICIST = "Kirby"

def generate_writeup(test_name, payload):
    """Generate an SBRT writeup and return result."""
    try:
        response = requests.post(f"{BASE_URL}/sbrt/generate", json=payload)
        response.raise_for_status()
        result = response.json()
        return {
            "success": True,
            "test_name": test_name,
            "writeup": result['writeup'],
            "payload": payload
        }
    except Exception as e:
        return {
            "success": False,
            "test_name": test_name,
            "error": str(e),
            "payload": payload
        }

def create_payload(treatment_site, dose, fractions, breathing_technique, 
                   target_name, ptv_volume, anatomical_clarification="",
                   is_sib=False, sib_comment="", custom_site=None):
    """Create a standard payload for SBRT testing with realistic metrics."""
    # Calculate realistic metrics based on PTV volume
    vol_ptv_receiving_rx = ptv_volume * 0.95  # 95% coverage
    vol_100_rx_isodose = ptv_volume * 1.1     # Conformity index ~1.1
    vol_50_rx_isodose = ptv_volume * 5.0      # R50 ~5.0
    max_dose_2cm_ring = dose * 1.05           # 105% of prescription
    max_dose_in_target = dose * 1.1           # 110% of prescription
    
    # Calculate derived metrics
    coverage = (vol_ptv_receiving_rx / ptv_volume) * 100
    conformity_index = vol_100_rx_isodose / ptv_volume
    r50 = vol_50_rx_isodose / ptv_volume
    gradient_measure = 0.85
    max_dose_2cm_ring_percent = (max_dose_2cm_ring / dose) * 100
    homogeneity_index = max_dose_in_target / dose
    
    return {
        "common_info": {
            "physician": {"name": PHYSICIAN, "role": "physician"},
            "physicist": {"name": PHYSICIST, "role": "physicist"}
        },
        "sbrt_data": {
            "treatment_site": treatment_site if not custom_site else "",
            "custom_treatment_site": custom_site,
            "anatomical_clarification": anatomical_clarification,
            "dose": dose,
            "fractions": fractions,
            "breathing_technique": breathing_technique,
            "target_name": target_name,
            "ptv_volume": str(ptv_volume),
            "vol_ptv_receiving_rx": str(vol_ptv_receiving_rx),
            "vol_100_rx_isodose": str(vol_100_rx_isodose),
            "vol_50_rx_isodose": str(vol_50_rx_isodose),
            "max_dose_2cm_ring": str(max_dose_2cm_ring),
            "max_dose_in_target": str(max_dose_in_target),
            "sib_comment": sib_comment,
            "calculated_metrics": {
                "coverage": f"{coverage:.1f}",
                "conformityIndex": f"{conformity_index:.2f}",
                "r50": f"{r50:.2f}",
                "gradientMeasure": f"{gradient_measure:.2f}",
                "maxDose2cmRingPercent": f"{max_dose_2cm_ring_percent:.1f}",
                "homogeneityIndex": f"{homogeneity_index:.2f}",
                "conformityDeviation": "None",
                "r50Deviation": "None",
                "maxDose2cmDeviation": "None",
                "toleranceRow": {"ptvVol": ptv_volume, "conformityNone": 1.2}
            },
            "is_sib": is_sib
        }
    }

# =============================================================================
# TEST SUITE 1: All Treatment Sites - Standard Fractionation
# =============================================================================
def test_suite_1_standard_sites():
    """Test all 6 standard treatment sites with typical fractionation."""
    print("\n" + "="*80)
    print("TEST SUITE 1: Standard Treatment Sites")
    print("="*80)
    
    tests = []
    
    # Test 1: Lung - Standard (50 Gy / 5 fx)
    tests.append(generate_writeup(
        "Lung - Standard 50 Gy / 5 fx (4DCT)",
        create_payload("lung", 50, 5, "4DCT", "PTV_50", 25.1)
    ))
    
    # Test 2: Liver - Standard (45 Gy / 3 fx)
    tests.append(generate_writeup(
        "Liver - Standard 45 Gy / 3 fx (Free Breathing)",
        create_payload("liver", 45, 3, "freebreathe", "PTV_45", 32.5)
    ))
    
    # Test 3: Spine - Standard (24 Gy / 3 fx)
    tests.append(generate_writeup(
        "Spine - Standard 24 Gy / 3 fx with Clarification",
        create_payload("spine", 24, 3, "freebreathe", "PTV_24", 15.2, anatomical_clarification="T11-L1")
    ))
    
    # Test 4: Kidney - Standard (40 Gy / 5 fx)
    tests.append(generate_writeup(
        "Kidney - Standard 40 Gy / 5 fx (4DCT)",
        create_payload("kidney", 40, 5, "4DCT", "PTV_40", 18.3)
    ))
    
    # Test 5: Prostate - Standard (36.25 Gy / 5 fx)
    tests.append(generate_writeup(
        "Prostate - Standard 36.25 Gy / 5 fx",
        create_payload("prostate", 36.25, 5, "freebreathe", "PTV_Prostate", 45.8)
    ))
    
    # Test 6: Bone - Standard (30 Gy / 5 fx)
    tests.append(generate_writeup(
        "Bone - Standard 30 Gy / 5 fx with Clarification",
        create_payload("bone", 30, 5, "freebreathe", "PTV_30", 22.4, anatomical_clarification="Humerus")
    ))
    
    return tests

# =============================================================================
# TEST SUITE 2: Breathing Technique Variations
# =============================================================================
def test_suite_2_breathing_techniques():
    """Test all three breathing techniques."""
    print("\n" + "="*80)
    print("TEST SUITE 2: Breathing Technique Variations")
    print("="*80)
    
    tests = []
    
    # Test 7: 4DCT Technique
    tests.append(generate_writeup(
        "Lung - 4DCT Technique (54 Gy / 3 fx)",
        create_payload("lung", 54, 3, "4DCT", "PTV_54", 12.8)
    ))
    
    # Test 8: DIBH Technique
    tests.append(generate_writeup(
        "Lung - DIBH Technique (50 Gy / 5 fx)",
        create_payload("lung", 50, 5, "DIBH", "PTV_50_DIBH", 20.5)
    ))
    
    # Test 9: Free Breathing Technique
    tests.append(generate_writeup(
        "Liver - Free Breathing (50 Gy / 5 fx)",
        create_payload("liver", 50, 5, "freebreathe", "PTV_50", 28.7)
    ))
    
    return tests

# =============================================================================
# TEST SUITE 3: Edge Cases and Unusual Fractionation
# =============================================================================
def test_suite_3_edge_cases():
    """Test edge cases including single fraction, high fractionation, and unusual doses."""
    print("\n" + "="*80)
    print("TEST SUITE 3: Edge Cases")
    print("="*80)
    
    tests = []
    
    # Test 10: Single Fraction (grammar test - "1 fraction" not "1 fractions")
    tests.append(generate_writeup(
        "Lung - Single Fraction (34 Gy / 1 fx)",
        create_payload("lung", 34, 1, "freebreathe", "PTV_34", 8.5)
    ))
    
    # Test 11: High Fractionation
    tests.append(generate_writeup(
        "Lung - High Fractionation (60 Gy / 8 fx)",
        create_payload("lung", 60, 8, "4DCT", "PTV_60", 35.2)
    ))
    
    # Test 12: Decimal Dose
    tests.append(generate_writeup(
        "Spine - Decimal Dose (27.5 Gy / 5 fx)",
        create_payload("spine", 27.5, 5, "freebreathe", "PTV_27.5", 18.9, anatomical_clarification="L4-L5")
    ))
    
    # Test 13: Very Small PTV
    tests.append(generate_writeup(
        "Lung - Very Small PTV (50 Gy / 5 fx)",
        create_payload("lung", 50, 5, "4DCT", "PTV_50_small", 3.2)
    ))
    
    # Test 14: Large PTV
    tests.append(generate_writeup(
        "Liver - Large PTV (45 Gy / 3 fx)",
        create_payload("liver", 45, 3, "freebreathe", "PTV_45_large", 125.6)
    ))
    
    return tests

# =============================================================================
# TEST SUITE 4: SIB Cases and Custom Sites
# =============================================================================
def test_suite_4_sib_and_custom():
    """Test SIB cases and custom treatment sites."""
    print("\n" + "="*80)
    print("TEST SUITE 4: SIB Cases and Custom Sites")
    print("="*80)
    
    tests = []
    
    # Test 15: SIB Case with Comment
    tests.append(generate_writeup(
        "Prostate - SIB with Comment (36.25 Gy / 5 fx)",
        create_payload("prostate", 36.25, 5, "freebreathe", "PTV_Prostate_SIB", 52.3, 
                      is_sib=True, sib_comment="SIB 40/36.25 Gy to dominant intraprostatic lesion")
    ))
    
    # Test 16: SIB Case without Comment
    tests.append(generate_writeup(
        "Lung - SIB without Comment (50 Gy / 5 fx)",
        create_payload("lung", 50, 5, "4DCT", "PTV_50_SIB", 28.4, is_sib=True)
    ))
    
    # Test 17: Custom Site - Adrenal
    tests.append(generate_writeup(
        "Custom Site - Adrenal (50 Gy / 5 fx)",
        create_payload(None, 50, 5, "4DCT", "PTV_Adrenal", 15.7, custom_site="adrenal")
    ))
    
    # Test 18: Custom Site - Pancreas
    tests.append(generate_writeup(
        "Custom Site - Pancreas (33 Gy / 3 fx)",
        create_payload(None, 33, 3, "4DCT", "PTV_Pancreas", 42.1, custom_site="pancreas")
    ))
    
    return tests

# =============================================================================
# TEST SUITE 5: Deviation Testing
# =============================================================================
def test_suite_5_deviations():
    """Test cases with minor and major deviations."""
    print("\n" + "="*80)
    print("TEST SUITE 5: Deviation Cases")
    print("="*80)
    
    tests = []
    
    # Test 19: Minor Deviation (slightly elevated R50)
    payload = create_payload("lung", 50, 5, "freebreathe", "PTV_50_minor", 22.0)
    # Adjust metrics to create minor deviation
    payload["sbrt_data"]["vol_50_rx_isodose"] = str(22.0 * 5.2)  # R50 = 5.2 (minor)
    payload["sbrt_data"]["calculated_metrics"]["r50"] = "5.20"
    payload["sbrt_data"]["calculated_metrics"]["r50Deviation"] = "Minor"
    tests.append(generate_writeup(
        "Lung - Minor R50 Deviation (50 Gy / 5 fx)",
        payload
    ))
    
    # Test 20: Major Deviation (high conformity index and R50)
    payload = create_payload("liver", 45, 3, "freebreathe", "PTV_45_major", 34.0)
    # Adjust metrics to create major deviations
    payload["sbrt_data"]["vol_100_rx_isodose"] = str(34.0 * 1.6)  # CI = 1.6 (major)
    payload["sbrt_data"]["vol_50_rx_isodose"] = str(34.0 * 6.5)   # R50 = 6.5 (major)
    payload["sbrt_data"]["calculated_metrics"]["conformityIndex"] = "1.60"
    payload["sbrt_data"]["calculated_metrics"]["r50"] = "6.50"
    payload["sbrt_data"]["calculated_metrics"]["conformityDeviation"] = "Major"
    payload["sbrt_data"]["calculated_metrics"]["r50Deviation"] = "Major"
    tests.append(generate_writeup(
        "Liver - Major Deviations (45 Gy / 3 fx)",
        payload
    ))
    
    return tests

# =============================================================================
# MARKDOWN REPORT GENERATION
# =============================================================================
def generate_markdown_report(all_results):
    """Generate a comprehensive markdown report."""
    print(f"\n{'='*80}")
    print(f"Generating markdown report: {OUTPUT_FILE}")
    print(f"{'='*80}\n")
    
    with open(OUTPUT_FILE, 'w') as f:
        # Header
        f.write("# SBRT Module Comprehensive QA Report\n\n")
        f.write(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write(f"**Total Tests:** {len(all_results)}\n")
        f.write(f"**Successful:** {sum(1 for r in all_results if r['success'])}\n")
        f.write(f"**Failed:** {sum(1 for r in all_results if not r['success'])}\n\n")
        
        f.write("---\n\n")
        
        # Test results grouped by suite
        suites = [
            ("Suite 1: Standard Treatment Sites", list(range(0, 6))),
            ("Suite 2: Breathing Technique Variations", list(range(6, 9))),
            ("Suite 3: Edge Cases", list(range(9, 14))),
            ("Suite 4: SIB Cases and Custom Sites", list(range(14, 18))),
            ("Suite 5: Deviation Cases", list(range(18, 20)))
        ]
        
        for suite_name, indices in suites:
            f.write(f"## {suite_name}\n\n")
            
            for idx in indices:
                if idx >= len(all_results):
                    continue
                    
                result = all_results[idx]
                test_num = idx + 1
                
                if result['success']:
                    f.write(f"### Test {test_num}: {result['test_name']}\n\n")
                    f.write(f"**Status:** ✅ PASS\n\n")
                    
                    # Write configuration
                    f.write("**Configuration:**\n")
                    sbrt_data = result['payload']['sbrt_data']
                    site = sbrt_data.get('custom_treatment_site') or sbrt_data.get('treatment_site')
                    f.write(f"- Treatment Site: {site}\n")
                    if sbrt_data.get('anatomical_clarification'):
                        f.write(f"- Anatomical Clarification: {sbrt_data['anatomical_clarification']}\n")
                    f.write(f"- Dose: {sbrt_data['dose']} Gy / {sbrt_data['fractions']} fractions\n")
                    f.write(f"- Dose/Fraction: {sbrt_data['dose'] / sbrt_data['fractions']:.2f} Gy\n")
                    f.write(f"- Breathing Technique: {sbrt_data['breathing_technique']}\n")
                    f.write(f"- Target: {sbrt_data['target_name']}\n")
                    f.write(f"- PTV Volume: {sbrt_data['ptv_volume']} cc\n")
                    
                    if sbrt_data['is_sib']:
                        f.write(f"- **SIB Case**: {sbrt_data.get('sib_comment', 'No comment')}\n")
                    
                    f.write("\n**Generated Writeup:**\n\n")
                    f.write("```\n")
                    f.write(result['writeup'])
                    f.write("\n```\n\n")
                    
                    # Grammar/Quality checks
                    f.write("**Quality Checks:**\n")
                    writeup = result['writeup']
                    
                    # Check 1: Patient demographics (age/sex data, not just word "patient")
                    has_demographics = any(phrase in writeup.lower() for phrase in ["year-old", " male ", " female ", " age ", " sex "])
                    f.write(f"- Patient Demographics Present: {'❌ FOUND (ERROR)' if has_demographics else '✅ None (correct)'}\n")
                    
                    # Check 2: Proper fraction grammar
                    if sbrt_data['fractions'] == 1:
                        has_correct_grammar = "1 fraction" in writeup and "1 fractions" not in writeup
                        f.write(f"- Correct Grammar ('1 fraction' not '1 fractions'): {'✅ Yes' if has_correct_grammar else '❌ No'}\n")
                    else:
                        has_fractions = f"{sbrt_data['fractions']} fractions" in writeup
                        f.write(f"- Fractions Mentioned Correctly: {'✅ Yes' if has_fractions else '❌ No'}\n")
                    
                    # Check 3: Physician and physicist names
                    has_physician = PHYSICIAN in writeup
                    has_physicist = PHYSICIST in writeup
                    f.write(f"- Physician Name ({PHYSICIAN}): {'✅ Present' if has_physician else '❌ Missing'}\n")
                    f.write(f"- Physicist Name ({PHYSICIST}): {'✅ Present' if has_physicist else '❌ Missing'}\n")
                    
                    # Check 4: Dose accuracy
                    dose_str = str(sbrt_data['dose'])
                    has_dose = dose_str in writeup
                    f.write(f"- Dose ({dose_str} Gy): {'✅ Present' if has_dose else '❌ Missing'}\n")
                    
                    # Check 5: Breathing technique description
                    technique = sbrt_data['breathing_technique']
                    if technique == "4DCT":
                        has_technique = "4D CT" in writeup or "4DCT" in writeup
                        f.write(f"- Technique Description (4DCT): {'✅ Present' if has_technique else '❌ Missing'}\n")
                    elif technique == "DIBH":
                        has_technique = "DIBH" in writeup
                        f.write(f"- Technique Description (DIBH): {'✅ Present' if has_technique else '❌ Missing'}\n")
                    else:
                        # Free breathing doesn't have specific mention
                        f.write(f"- Technique (Free Breathing): ✅ Correct (no specific mention needed)\n")
                    
                    # Check 6: Metrics table presence
                    has_metrics = "Below are the plan statistics:" in writeup
                    f.write(f"- Metrics Table: {'✅ Present' if has_metrics else '❌ Missing'}\n")
                    
                    # Check 7: Deviation handling
                    metrics = sbrt_data.get('calculated_metrics', {})
                    has_major_dev = any(metrics.get(f"{key}Deviation") == "Major" 
                                       for key in ["conformity", "r50", "maxDose2cm"])
                    if has_major_dev:
                        has_deviation_text = "These deviations were evaluated and accepted during the treatment planning process" in writeup
                        f.write(f"- Major Deviation Handling: {'✅ Correct wording' if has_deviation_text else '❌ Incorrect/missing'}\n")
                    
                    # Check 8: SIB handling
                    if sbrt_data['is_sib']:
                        has_sib_text = "SIB" in writeup or "simultaneous integrated boost" in writeup.lower()
                        f.write(f"- SIB Case Handling: {'✅ Mentioned' if has_sib_text else '❌ Not mentioned'}\n")
                    
                    # Check 9: Anatomical clarification
                    if sbrt_data.get('anatomical_clarification'):
                        clarification = sbrt_data['anatomical_clarification']
                        has_clarification = clarification in writeup
                        f.write(f"- Anatomical Clarification ({clarification}): {'✅ Present' if has_clarification else '❌ Missing'}\n")
                    
                    # Check 10: HTML tags (should be none)
                    has_html = "<p>" in writeup or "</p>" in writeup or "<br>" in writeup
                    f.write(f"- HTML Tags Present: {'❌ FOUND (ERROR)' if has_html else '✅ None (correct)'}\n")
                    
                    f.write("\n---\n\n")
                else:
                    # Failed test
                    f.write(f"### Test {test_num}: {result['test_name']}\n\n")
                    f.write(f"**Status:** ❌ FAIL\n\n")
                    f.write(f"**Error:** {result['error']}\n\n")
                    f.write("---\n\n")
        
        # Summary statistics
        f.write("## Quality Check Summary\n\n")
        
        successful_results = [r for r in all_results if r['success']]
        
        if successful_results:
            # Demographics check (age/sex data, not just word "patient")
            demographics_count = sum(1 for r in successful_results 
                                    if any(phrase in r['writeup'].lower() 
                                          for phrase in ["year-old", " male ", " female ", " age ", " sex "]))
            f.write(f"- **Patient Demographics Found:** {demographics_count}/{len(successful_results)} ")
            f.write("✅ PASS\n" if demographics_count == 0 else "❌ FAIL\n")
            
            # Grammar check (fractions)
            grammar_correct = sum(1 for r in successful_results 
                                 if (r['payload']['sbrt_data']['fractions'] == 1 and 
                                    "1 fraction" in r['writeup'] and "1 fractions" not in r['writeup']) or
                                    r['payload']['sbrt_data']['fractions'] > 1)
            f.write(f"- **Correct Grammar (fractions):** {grammar_correct}/{len(successful_results)} ")
            f.write("✅ PASS\n" if grammar_correct == len(successful_results) else "❌ FAIL\n")
            
            # Names present
            names_present = sum(1 for r in successful_results 
                               if PHYSICIAN in r['writeup'] and PHYSICIST in r['writeup'])
            f.write(f"- **Physician/Physicist Names Present:** {names_present}/{len(successful_results)} ")
            f.write("✅ PASS\n" if names_present == len(successful_results) else "❌ FAIL\n")
            
            # HTML tags absent
            html_absent = sum(1 for r in successful_results 
                            if not any(tag in r['writeup'] for tag in ["<p>", "</p>", "<br>"]))
            f.write(f"- **No HTML Tags:** {html_absent}/{len(successful_results)} ")
            f.write("✅ PASS\n" if html_absent == len(successful_results) else "❌ FAIL\n")
        
        f.write("\n---\n\n")
        f.write("**End of Report**\n")
    
    print(f"✅ Report generated: {OUTPUT_FILE}")
    print(f"   Total: {len(all_results)} tests")
    print(f"   Passed: {sum(1 for r in all_results if r['success'])}")
    print(f"   Failed: {sum(1 for r in all_results if not r['success'])}")

# =============================================================================
# MAIN EXECUTION
# =============================================================================
def main():
    """Run all test suites and generate report."""
    print("="*80)
    print("SBRT COMPREHENSIVE QA TEST SUITE")
    print("="*80)
    print(f"Testing against: {BASE_URL}")
    print(f"Output file: {OUTPUT_FILE}")
    
    # Run all test suites
    all_results = []
    all_results.extend(test_suite_1_standard_sites())
    all_results.extend(test_suite_2_breathing_techniques())
    all_results.extend(test_suite_3_edge_cases())
    all_results.extend(test_suite_4_sib_and_custom())
    all_results.extend(test_suite_5_deviations())
    
    # Generate markdown report
    generate_markdown_report(all_results)
    
    # Print summary
    print(f"\n{'='*80}")
    print("TEST EXECUTION SUMMARY")
    print(f"{'='*80}")
    total = len(all_results)
    passed = sum(1 for r in all_results if r['success'])
    failed = total - passed
    
    print(f"Total Tests: {total}")
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    
    if failed == 0:
        print(f"\n🎉 All tests passed! Check {OUTPUT_FILE} for detailed results.")
    else:
        print(f"\n⚠️  Some tests failed. Check {OUTPUT_FILE} for details.")
    
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    exit(main())

