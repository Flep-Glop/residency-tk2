#!/usr/bin/env python3
"""
Comprehensive DIBH QA Test Script
Following the pattern from Fusion module testing (Entry #27)

Tests all treatment sites, boost/no boost combinations,
and generates markdown report for clinical review.
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api"
OUTPUT_FILE = "dibh_qa_results.md"

# Standard physicians and physicists for consistency
PHYSICIAN = "Galvan"
PHYSICIST = "Kirby"

def generate_writeup(test_name, payload):
    """Generate a DIBH writeup and return result."""
    try:
        response = requests.post(f"{BASE_URL}/dibh/generate", json=payload)
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

def create_payload(treatment_site, dose, fractions, has_boost=False, boost_dose=0, boost_fractions=0, custom_site=None):
    """Create a standard payload for DIBH testing."""
    return {
        "common_info": {
            "physician": {"name": PHYSICIAN, "role": "physician"},
            "physicist": {"name": PHYSICIST, "role": "physicist"}
        },
        "dibh_data": {
            "treatment_site": treatment_site if not custom_site else "",
            "custom_treatment_site": custom_site,
            "dose": dose,
            "fractions": fractions,
            "has_boost": has_boost,
            "boost_dose": boost_dose,
            "boost_fractions": boost_fractions
        }
    }

# =============================================================================
# TEST SUITE 1: All Treatment Sites - No Boost
# =============================================================================
def test_suite_1_standard_sites():
    """Test all 4 standard treatment sites without boost."""
    print("\n" + "="*80)
    print("TEST SUITE 1: Standard Treatment Sites - No Boost")
    print("="*80)
    
    tests = []
    
    # Test 1: Left Breast - Hypofractionated
    tests.append(generate_writeup(
        "Left Breast - Hypofractionated (40 Gy / 15 fx)",
        create_payload("left breast", 40, 15)
    ))
    
    # Test 2: Left Breast - Conventional
    tests.append(generate_writeup(
        "Left Breast - Conventional (50 Gy / 25 fx)",
        create_payload("left breast", 50, 25)
    ))
    
    # Test 3: Right Breast - Hypofractionated
    tests.append(generate_writeup(
        "Right Breast - Hypofractionated (40 Gy / 15 fx)",
        create_payload("right breast", 40, 15)
    ))
    
    # Test 4: Right Breast - Conventional
    tests.append(generate_writeup(
        "Right Breast - Conventional (50 Gy / 25 fx)",
        create_payload("right breast", 50, 25)
    ))
    
    # Test 5: Diaphragm
    tests.append(generate_writeup(
        "Diaphragm (45 Gy / 15 fx)",
        create_payload("diaphragm", 45, 15)
    ))
    
    # Test 6: Chest Wall - Hypofractionated
    tests.append(generate_writeup(
        "Chest Wall - Hypofractionated (40 Gy / 15 fx)",
        create_payload("chest wall", 40, 15)
    ))
    
    # Test 7: Chest Wall - Conventional
    tests.append(generate_writeup(
        "Chest Wall - Conventional (50 Gy / 25 fx)",
        create_payload("chest wall", 50, 25)
    ))
    
    return tests

# =============================================================================
# TEST SUITE 2: Boost Combinations
# =============================================================================
def test_suite_2_boost_combinations():
    """Test various boost scenarios."""
    print("\n" + "="*80)
    print("TEST SUITE 2: Boost Combinations")
    print("="*80)
    
    tests = []
    
    # Test 8: Left Breast with Standard Boost
    tests.append(generate_writeup(
        "Left Breast - With Boost (50 Gy / 25 fx + 10 Gy / 4 fx)",
        create_payload("left breast", 50, 25, has_boost=True, boost_dose=10, boost_fractions=4)
    ))
    
    # Test 9: Right Breast with Standard Boost
    tests.append(generate_writeup(
        "Right Breast - With Boost (40 Gy / 15 fx + 10 Gy / 5 fx)",
        create_payload("right breast", 40, 15, has_boost=True, boost_dose=10, boost_fractions=5)
    ))
    
    # Test 10: Left Breast with Large Boost
    tests.append(generate_writeup(
        "Left Breast - With Large Boost (40 Gy / 15 fx + 16 Gy / 8 fx)",
        create_payload("left breast", 40, 15, has_boost=True, boost_dose=16, boost_fractions=8)
    ))
    
    # Test 11: Chest Wall with Boost
    tests.append(generate_writeup(
        "Chest Wall - With Boost (50 Gy / 25 fx + 10 Gy / 4 fx)",
        create_payload("chest wall", 50, 25, has_boost=True, boost_dose=10, boost_fractions=4)
    ))
    
    return tests

# =============================================================================
# TEST SUITE 3: Custom Treatment Sites
# =============================================================================
def test_suite_3_custom_sites():
    """Test custom treatment sites."""
    print("\n" + "="*80)
    print("TEST SUITE 3: Custom Treatment Sites")
    print("="*80)
    
    tests = []
    
    # Test 12: Custom Site - Lower Esophagus
    tests.append(generate_writeup(
        "Custom Site - Lower Esophagus (50 Gy / 25 fx)",
        create_payload("", 50, 25, custom_site="lower esophagus")
    ))
    
    # Test 13: Custom Site - Liver
    tests.append(generate_writeup(
        "Custom Site - Liver (60 Gy / 30 fx)",
        create_payload("", 60, 30, custom_site="liver")
    ))
    
    # Test 14: Custom Site - Pancreas
    tests.append(generate_writeup(
        "Custom Site - Pancreas (50.4 Gy / 28 fx)",
        create_payload("", 50.4, 28, custom_site="pancreas")
    ))
    
    return tests

# =============================================================================
# TEST SUITE 4: Edge Cases
# =============================================================================
def test_suite_4_edge_cases():
    """Test edge cases and unusual fractionation."""
    print("\n" + "="*80)
    print("TEST SUITE 4: Edge Cases")
    print("="*80)
    
    tests = []
    
    # Test 15: Single Fraction (SBRT-like)
    tests.append(generate_writeup(
        "Edge Case - Single Fraction (8 Gy / 1 fx)",
        create_payload("diaphragm", 8, 1)
    ))
    
    # Test 16: Very Hypofractionated
    tests.append(generate_writeup(
        "Edge Case - Very Hypofractionated (26 Gy / 5 fx)",
        create_payload("left breast", 26, 5)
    ))
    
    # Test 17: Unusual Fractionation
    tests.append(generate_writeup(
        "Edge Case - Unusual Fractionation (42.5 Gy / 17 fx)",
        create_payload("right breast", 42.5, 17)
    ))
    
    # Test 18: Decimal Dose
    tests.append(generate_writeup(
        "Edge Case - Decimal Dose (45.6 Gy / 19 fx)",
        create_payload("chest wall", 45.6, 19)
    ))
    
    # Test 19: High Total Dose
    tests.append(generate_writeup(
        "Edge Case - High Total Dose (66 Gy / 33 fx)",
        create_payload("chest wall", 66, 33)
    ))
    
    # Test 20: Boost with Unusual Fractionation
    tests.append(generate_writeup(
        "Edge Case - Boost with Unusual Fractionation (42 Gy / 14 fx + 12 Gy / 3 fx)",
        create_payload("left breast", 42, 14, has_boost=True, boost_dose=12, boost_fractions=3)
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
        f.write("# DIBH Module Comprehensive QA Report\n\n")
        f.write(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write(f"**Total Tests:** {len(all_results)}\n")
        f.write(f"**Successful:** {sum(1 for r in all_results if r['success'])}\n")
        f.write(f"**Failed:** {sum(1 for r in all_results if not r['success'])}\n\n")
        
        f.write("---\n\n")
        
        # Test results grouped by suite
        suites = [
            ("Suite 1: Standard Treatment Sites - No Boost", list(range(0, 7))),
            ("Suite 2: Boost Combinations", list(range(7, 11))),
            ("Suite 3: Custom Treatment Sites", list(range(11, 14))),
            ("Suite 4: Edge Cases", list(range(14, 20)))
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
                    dibh_data = result['payload']['dibh_data']
                    f.write(f"- Treatment Site: {dibh_data.get('custom_treatment_site') or dibh_data.get('treatment_site')}\n")
                    f.write(f"- Dose: {dibh_data['dose']} Gy / {dibh_data['fractions']} fractions\n")
                    f.write(f"- Dose/Fraction: {dibh_data['dose'] / dibh_data['fractions']:.2f} Gy\n")
                    
                    if dibh_data['has_boost']:
                        f.write(f"- Boost: {dibh_data['boost_dose']} Gy / {dibh_data['boost_fractions']} fractions\n")
                        f.write(f"- Boost Dose/Fraction: {dibh_data['boost_dose'] / dibh_data['boost_fractions']:.2f} Gy\n")
                        total_dose = dibh_data['dose'] + dibh_data['boost_dose']
                        total_fx = dibh_data['fractions'] + dibh_data['boost_fractions']
                        f.write(f"- **Total: {total_dose} Gy / {total_fx} fractions**\n")
                    
                    f.write("\n**Generated Writeup:**\n\n")
                    f.write("```\n")
                    f.write(result['writeup'])
                    f.write("\n```\n\n")
                    
                    # Grammar/Quality checks
                    f.write("**Quality Checks:**\n")
                    writeup = result['writeup']
                    
                    # Check for patient demographics
                    has_demographics = any(phrase in writeup.lower() for phrase in ["year-old", "male", "female"])
                    f.write(f"- Patient Demographics Present: {'❌ FOUND (ERROR)' if has_demographics else '✅ None (correct)'}\n")
                    
                    # Check for correct grammar
                    has_correct_grammar = "gating baseline and gating window were created" in writeup
                    f.write(f"- Correct Grammar ('were created'): {'✅ Yes' if has_correct_grammar else '❌ No'}\n")
                    
                    # Check for proper treatment site mention
                    site = dibh_data.get('custom_treatment_site') or dibh_data.get('treatment_site')
                    has_site = site in writeup.lower()
                    f.write(f"- Treatment Site Mentioned: {'✅ Yes' if has_site else '❌ No'}\n")
                    
                    # Check for proper boost formatting
                    if dibh_data['has_boost']:
                        has_boost_text = "followed by a boost" in writeup.lower()
                        f.write(f"- Boost Properly Formatted: {'✅ Yes' if has_boost_text else '❌ No'}\n")
                    
                    # Check for proper immobilization device
                    if site in ["left breast", "right breast"]:
                        has_breast_board = "breast board" in writeup.lower()
                        f.write(f"- Breast Board (breast sites): {'✅ Yes' if has_breast_board else '❌ No (should be breast board)'}\n")
                    elif site:
                        has_wing_board = "wing board" in writeup.lower()
                        f.write(f"- Wing Board (non-breast sites): {'✅ Yes' if has_wing_board else '❌ No (should be wing board)'}\n")
                    
                    # Check for cardiac dose mention (left breast only)
                    if site == "left breast":
                        has_cardiac = "cardiac dose" in writeup.lower()
                        f.write(f"- Cardiac Dose Mention (left breast): {'✅ Yes' if has_cardiac else '⚠️  No (should mention cardiac dose reduction)'}\n")
                    
                    f.write("\n---\n\n")
                else:
                    f.write(f"### Test {test_num}: {result['test_name']}\n\n")
                    f.write(f"**Status:** ❌ FAIL\n\n")
                    f.write(f"**Error:** {result['error']}\n\n")
                    f.write("---\n\n")
        
        # Summary section
        f.write("## QA Summary\n\n")
        f.write("### Critical Checks Across All Tests\n\n")
        
        successful_results = [r for r in all_results if r['success']]
        
        # Patient demographics check
        demographics_count = sum(1 for r in successful_results 
                                if any(phrase in r['writeup'].lower() 
                                      for phrase in ["year-old", "male", "female"]))
        f.write(f"- **Patient Demographics:** {demographics_count} tests with demographics (should be 0) ")
        f.write("✅ PASS\n" if demographics_count == 0 else "❌ FAIL\n")
        
        # Grammar check
        grammar_count = sum(1 for r in successful_results 
                           if "gating baseline and gating window were created" in r['writeup'])
        f.write(f"- **Grammar ('were created'):** {grammar_count}/{len(successful_results)} tests correct ")
        f.write("✅ PASS\n" if grammar_count == len(successful_results) else "❌ FAIL\n")
        
        # Boost formatting check
        boost_tests = [r for r in successful_results if r['payload']['dibh_data']['has_boost']]
        boost_correct = sum(1 for r in boost_tests if "followed by a boost" in r['writeup'].lower())
        if boost_tests:
            f.write(f"- **Boost Formatting:** {boost_correct}/{len(boost_tests)} tests correct ")
            f.write("✅ PASS\n" if boost_correct == len(boost_tests) else "❌ FAIL\n")
        
        f.write("\n### Recommendations\n\n")
        if demographics_count > 0:
            f.write("- ❌ **CRITICAL:** Patient demographics found in writeups. Must be removed.\n")
        if grammar_count < len(successful_results):
            f.write("- ❌ **GRAMMAR:** Some writeups use incorrect verb agreement ('was' instead of 'were').\n")
        if boost_tests and boost_correct < len(boost_tests):
            f.write("- ⚠️  **BOOST:** Some boost writeups may not follow standard format.\n")
        if demographics_count == 0 and grammar_count == len(successful_results):
            f.write("- ✅ **All critical checks passed!** Module appears ready for production.\n")
        
        f.write("\n---\n\n")
        f.write("*End of Report*\n")
    
    print(f"✅ Report generated: {OUTPUT_FILE}")
    print(f"   Total tests: {len(all_results)}")
    print(f"   Successful: {sum(1 for r in all_results if r['success'])}")
    print(f"   Failed: {sum(1 for r in all_results if not r['success'])}\n")

# =============================================================================
# MAIN EXECUTION
# =============================================================================
def main():
    """Run all test suites and generate report."""
    print("\n" + "="*80)
    print("DIBH MODULE COMPREHENSIVE QA TEST SUITE")
    print("Following Fusion QA Pattern (DEV_LOG Entry #27)")
    print("="*80)
    print(f"Backend: {BASE_URL}")
    print(f"Output: {OUTPUT_FILE}")
    
    all_results = []
    
    # Run all test suites
    all_results.extend(test_suite_1_standard_sites())
    all_results.extend(test_suite_2_boost_combinations())
    all_results.extend(test_suite_3_custom_sites())
    all_results.extend(test_suite_4_edge_cases())
    
    # Generate markdown report
    generate_markdown_report(all_results)
    
    print("\n" + "="*80)
    print("QA TEST SUITE COMPLETE")
    print("="*80)
    print(f"\n📄 Review the full report: {OUTPUT_FILE}")
    print("🔍 Look for ❌ FAIL markers and quality check failures")
    print("✅ All tests passed? Module is ready for production!\n")

if __name__ == "__main__":
    main()

