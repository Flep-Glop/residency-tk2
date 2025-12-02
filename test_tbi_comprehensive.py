#!/usr/bin/env python3
"""
Comprehensive TBI QA Test Script
Following the pattern from DIBH (Entry #30) and Fusion (Entry #27) testing.

Tests all fractionation regimens, setup types, lung block options,
and generates markdown report for clinical review.
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api"
OUTPUT_FILE = "tbi_qa_results.md"

# Standard physicians and physicists for consistency
PHYSICIAN = "Galvan"
PHYSICIST = "Kirby"

def generate_writeup(test_name, payload):
    """Generate a TBI writeup and return result."""
    try:
        response = requests.post(f"{BASE_URL}/tbi/generate", json=payload)
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

def create_payload(dose, fractions, setup, lung_blocks):
    """Create a standard payload for TBI testing."""
    return {
        "common_info": {
            "physician": {"name": PHYSICIAN, "role": "physician"},
            "physicist": {"name": PHYSICIST, "role": "physicist"}
        },
        "tbi_data": {
            "prescription_dose": dose,
            "fractions": fractions,
            "setup": setup,
            "lung_blocks": lung_blocks,
            "energy": "6 MV",
            "dose_rate_range": "10 - 15 cGy/min",
            "machine_dose_rate": "200 MU/min"
        }
    }

# =============================================================================
# TEST SUITE 1: Standard Fractionation Regimens - AP/PA Setup
# =============================================================================
def test_suite_1_standard_regimens():
    """Test all 4 standard fractionation regimens with AP/PA setup."""
    print("\n" + "="*80)
    print("TEST SUITE 1: Standard Fractionation Regimens - AP/PA Setup")
    print("="*80)
    
    tests = []
    
    # Test 1: 2 Gy in 1 fraction - No lung blocks
    tests.append(generate_writeup(
        "2 Gy / 1 fx - AP/PA - No Lung Blocks",
        create_payload(2.0, 1, "AP/PA", "none")
    ))
    
    # Test 2: 4 Gy in 1 fraction - No lung blocks
    tests.append(generate_writeup(
        "4 Gy / 1 fx - AP/PA - No Lung Blocks",
        create_payload(4.0, 1, "AP/PA", "none")
    ))
    
    # Test 3: 12 Gy in 6 fractions (BID) - No lung blocks
    tests.append(generate_writeup(
        "12 Gy / 6 fx (BID) - AP/PA - No Lung Blocks",
        create_payload(12.0, 6, "AP/PA", "none")
    ))
    
    # Test 4: 13.2 Gy in 8 fractions (BID) - No lung blocks
    tests.append(generate_writeup(
        "13.2 Gy / 8 fx (BID) - AP/PA - No Lung Blocks",
        create_payload(13.2, 8, "AP/PA", "none")
    ))
    
    return tests

# =============================================================================
# TEST SUITE 2: Lung Block Variations - 12 Gy / 6 fx Regimen
# =============================================================================
def test_suite_2_lung_blocks():
    """Test all lung block options with standard 12 Gy regimen."""
    print("\n" + "="*80)
    print("TEST SUITE 2: Lung Block Variations - 12 Gy / 6 fx")
    print("="*80)
    
    tests = []
    
    # Test 5: 12 Gy / 6 fx - 1 HVL lung blocks
    tests.append(generate_writeup(
        "12 Gy / 6 fx - AP/PA - 1 HVL Lung Blocks",
        create_payload(12.0, 6, "AP/PA", "1 HVL")
    ))
    
    # Test 6: 12 Gy / 6 fx - 2 HVL lung blocks
    tests.append(generate_writeup(
        "12 Gy / 6 fx - AP/PA - 2 HVL Lung Blocks",
        create_payload(12.0, 6, "AP/PA", "2 HVL")
    ))
    
    # Test 7: 12 Gy / 6 fx - 3 HVL lung blocks
    tests.append(generate_writeup(
        "12 Gy / 6 fx - AP/PA - 3 HVL Lung Blocks",
        create_payload(12.0, 6, "AP/PA", "3 HVL")
    ))
    
    return tests

# =============================================================================
# TEST SUITE 3: Lateral Setup - Various Regimens
# =============================================================================
def test_suite_3_lateral_setup():
    """Test lateral setup with different regimens."""
    print("\n" + "="*80)
    print("TEST SUITE 3: Lateral Setup - Various Regimens")
    print("="*80)
    
    tests = []
    
    # Test 8: 2 Gy / 1 fx - Lateral - No lung blocks
    tests.append(generate_writeup(
        "2 Gy / 1 fx - Lateral - No Lung Blocks",
        create_payload(2.0, 1, "Lateral", "none")
    ))
    
    # Test 9: 12 Gy / 6 fx - Lateral - No lung blocks
    tests.append(generate_writeup(
        "12 Gy / 6 fx - Lateral - No Lung Blocks",
        create_payload(12.0, 6, "Lateral", "none")
    ))
    
    # Test 10: 13.2 Gy / 8 fx - Lateral - 2 HVL lung blocks
    tests.append(generate_writeup(
        "13.2 Gy / 8 fx - Lateral - 2 HVL Lung Blocks",
        create_payload(13.2, 8, "Lateral", "2 HVL")
    ))
    
    return tests

# =============================================================================
# TEST SUITE 4: Complex Combinations
# =============================================================================
def test_suite_4_combinations():
    """Test complex combinations of setup and lung blocks."""
    print("\n" + "="*80)
    print("TEST SUITE 4: Complex Combinations")
    print("="*80)
    
    tests = []
    
    # Test 11: Single fraction - Lateral - 1 HVL
    tests.append(generate_writeup(
        "4 Gy / 1 fx - Lateral - 1 HVL Lung Blocks",
        create_payload(4.0, 1, "Lateral", "1 HVL")
    ))
    
    # Test 12: Maximum lung blocks - AP/PA
    tests.append(generate_writeup(
        "13.2 Gy / 8 fx - AP/PA - 3 HVL Lung Blocks",
        create_payload(13.2, 8, "AP/PA", "3 HVL")
    ))
    
    # Test 13: BID regimen - Lateral - 3 HVL
    tests.append(generate_writeup(
        "12 Gy / 6 fx (BID) - Lateral - 3 HVL Lung Blocks",
        create_payload(12.0, 6, "Lateral", "3 HVL")
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
        f.write("# TBI Module Comprehensive QA Report\n\n")
        f.write(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write(f"**Total Tests:** {len(all_results)}\n")
        f.write(f"**Successful:** {sum(1 for r in all_results if r['success'])}\n")
        f.write(f"**Failed:** {sum(1 for r in all_results if not r['success'])}\n\n")
        
        f.write("---\n\n")
        
        # Test results grouped by suite
        suites = [
            ("Suite 1: Standard Fractionation Regimens - AP/PA Setup", list(range(0, 4))),
            ("Suite 2: Lung Block Variations - 12 Gy / 6 fx", list(range(4, 7))),
            ("Suite 3: Lateral Setup - Various Regimens", list(range(7, 10))),
            ("Suite 4: Complex Combinations", list(range(10, 13)))
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
                    tbi_data = result['payload']['tbi_data']
                    f.write(f"- Prescription Dose: {tbi_data['prescription_dose']} Gy\n")
                    f.write(f"- Fractions: {tbi_data['fractions']}\n")
                    f.write(f"- Dose/Fraction: {tbi_data['prescription_dose'] / tbi_data['fractions']:.2f} Gy\n")
                    f.write(f"- Setup: {tbi_data['setup']}\n")
                    f.write(f"- Lung Blocks: {tbi_data['lung_blocks']}\n")
                    f.write(f"- Energy: {tbi_data['energy']}\n")
                    f.write(f"- Dose Rate Range: {tbi_data['dose_rate_range']}\n")
                    f.write(f"- Machine Dose Rate: {tbi_data['machine_dose_rate']}\n")
                    
                    f.write("\n**Generated Writeup:**\n\n")
                    f.write("```\n")
                    f.write(result['writeup'])
                    f.write("\n```\n\n")
                    
                    # Grammar/Quality checks
                    f.write("**Quality Checks:**\n")
                    writeup = result['writeup']
                    
                    # Check for patient demographics
                    has_demographics = any(phrase in writeup.lower() for phrase in ["year-old", "male", "female", "age"])
                    f.write(f"- Patient Demographics Present: {'❌ FOUND (ERROR)' if has_demographics else '✅ None (correct)'}\n")
                    
                    # Check for diagnosis/indication
                    has_diagnosis = any(phrase in writeup.lower() for phrase in ["diagnosis", "indication", "leukemia", "lymphoma", "transplant"])
                    f.write(f"- Diagnosis/Indication Mentioned: {'❌ FOUND (ERROR)' if has_diagnosis else '✅ None (correct)'}\n")
                    
                    # Check for proper physician name format (Dr. prefix)
                    has_dr_prefix = f"Dr. {PHYSICIAN}" in writeup
                    f.write(f"- Physician Format (Dr. {PHYSICIAN}): {'✅ Yes' if has_dr_prefix else '❌ No'}\n")
                    
                    # Check for proper fraction grammar
                    if tbi_data['fractions'] == 1:
                        has_correct_grammar = "1 fraction" in writeup or "single fraction" in writeup
                        f.write(f"- Correct Grammar (singular fraction): {'✅ Yes' if has_correct_grammar else '❌ No'}\n")
                    else:
                        has_correct_grammar = f"{tbi_data['fractions']} fractions" in writeup
                        f.write(f"- Correct Grammar (plural fractions): {'✅ Yes' if has_correct_grammar else '❌ No'}\n")
                    
                    # Check for proper setup description
                    if tbi_data['setup'] == "AP/PA":
                        has_setup = "two AP/PA" in writeup
                        f.write(f"- Setup Description (two AP/PA): {'✅ Yes' if has_setup else '❌ No'}\n")
                    elif tbi_data['setup'] == "Lateral":
                        has_setup = "two lateral" in writeup
                        f.write(f"- Setup Description (two lateral): {'✅ Yes' if has_setup else '❌ No'}\n")
                    
                    # Check for proper lung blocks mention
                    if tbi_data['lung_blocks'] != 'none':
                        has_lung_blocks = tbi_data['lung_blocks'] in writeup
                        f.write(f"- Lung Blocks Specification ({tbi_data['lung_blocks']}): {'✅ Yes' if has_lung_blocks else '❌ No'}\n")
                        has_fabricated = "lung blocks were fabricated" in writeup.lower()
                        f.write(f"- Lung Blocks Text (fabricated): {'✅ Yes' if has_fabricated else '❌ No'}\n")
                    else:
                        has_no_lung_blocks = "lung blocks were fabricated" not in writeup.lower()
                        f.write(f"- No Lung Blocks Mentioned: {'✅ Correct' if has_no_lung_blocks else '❌ Incorrectly mentioned'}\n")
                    
                    # Check for aluminum filters
                    has_filters = "aluminum filters" in writeup.lower()
                    f.write(f"- Aluminum Filters Mentioned: {'✅ Yes' if has_filters else '❌ No'}\n")
                    
                    # Check for diode dosimeters
                    has_diodes = "diode dosimeters" in writeup.lower()
                    f.write(f"- Diode Dosimeters Mentioned: {'✅ Yes' if has_diodes else '❌ No'}\n")
                    
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
                                      for phrase in ["year-old", "male", "female", "age"]))
        f.write(f"- **Patient Demographics:** {demographics_count} tests with demographics (should be 0) ")
        f.write("✅ PASS\n" if demographics_count == 0 else "❌ FAIL\n")
        
        # Diagnosis/indication check
        diagnosis_count = sum(1 for r in successful_results 
                             if any(phrase in r['writeup'].lower() 
                                   for phrase in ["diagnosis", "indication", "leukemia", "lymphoma", "transplant"]))
        f.write(f"- **Diagnosis/Indication:** {diagnosis_count} tests with diagnosis/indication (should be 0) ")
        f.write("✅ PASS\n" if diagnosis_count == 0 else "❌ FAIL\n")
        
        # Dr. prefix check
        dr_prefix_count = sum(1 for r in successful_results if f"Dr. {PHYSICIAN}" in r['writeup'])
        f.write(f"- **Physician Format (Dr. prefix):** {dr_prefix_count}/{len(successful_results)} tests correct ")
        f.write("✅ PASS\n" if dr_prefix_count == len(successful_results) else "❌ FAIL\n")
        
        # Fraction grammar check
        grammar_count = sum(1 for r in successful_results 
                           if (r['payload']['tbi_data']['fractions'] == 1 and 
                               ("1 fraction" in r['writeup'] or "single fraction" in r['writeup'])) or
                              (r['payload']['tbi_data']['fractions'] > 1 and 
                               f"{r['payload']['tbi_data']['fractions']} fractions" in r['writeup']))
        f.write(f"- **Fraction Grammar:** {grammar_count}/{len(successful_results)} tests correct ")
        f.write("✅ PASS\n" if grammar_count == len(successful_results) else "❌ FAIL\n")
        
        # Lung blocks specification check
        lung_block_tests = [r for r in successful_results if r['payload']['tbi_data']['lung_blocks'] != 'none']
        lung_blocks_correct = sum(1 for r in lung_block_tests 
                                 if r['payload']['tbi_data']['lung_blocks'] in r['writeup'])
        if lung_block_tests:
            f.write(f"- **Lung Blocks HVL Specification:** {lung_blocks_correct}/{len(lung_block_tests)} tests correct ")
            f.write("✅ PASS\n" if lung_blocks_correct == len(lung_block_tests) else "❌ FAIL\n")
        
        # Setup description check
        setup_count = sum(1 for r in successful_results 
                         if (r['payload']['tbi_data']['setup'] == "AP/PA" and "two AP/PA" in r['writeup']) or
                            (r['payload']['tbi_data']['setup'] == "Lateral" and "two lateral" in r['writeup']))
        f.write(f"- **Setup Description:** {setup_count}/{len(successful_results)} tests correct ")
        f.write("✅ PASS\n" if setup_count == len(successful_results) else "❌ FAIL\n")
        
        f.write("\n### Recommendations\n\n")
        if demographics_count > 0:
            f.write("- ❌ **CRITICAL:** Patient demographics found in writeups. Must be removed.\n")
        if diagnosis_count > 0:
            f.write("- ❌ **CRITICAL:** Diagnosis/indication found in writeups. Should not be mentioned per institutional requirements.\n")
        if dr_prefix_count < len(successful_results):
            f.write("- ❌ **FORMAT:** Some writeups missing 'Dr.' prefix for physician names.\n")
        if grammar_count < len(successful_results):
            f.write("- ❌ **GRAMMAR:** Some writeups have incorrect fraction grammar (singular/plural).\n")
        if lung_block_tests and lung_blocks_correct < len(lung_block_tests):
            f.write("- ⚠️  **LUNG BLOCKS:** Some writeups missing HVL specification for lung blocks.\n")
        if setup_count < len(successful_results):
            f.write("- ❌ **SETUP:** Some writeups have incorrect setup description.\n")
        if (demographics_count == 0 and diagnosis_count == 0 and 
            dr_prefix_count == len(successful_results) and 
            grammar_count == len(successful_results) and
            setup_count == len(successful_results)):
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
    print("TBI MODULE COMPREHENSIVE QA TEST SUITE")
    print("Following DIBH/Fusion QA Pattern (DEV_LOG Entries #27, #30)")
    print("="*80)
    print(f"Backend: {BASE_URL}")
    print(f"Output: {OUTPUT_FILE}")
    
    all_results = []
    
    # Run all test suites
    all_results.extend(test_suite_1_standard_regimens())
    all_results.extend(test_suite_2_lung_blocks())
    all_results.extend(test_suite_3_lateral_setup())
    all_results.extend(test_suite_4_combinations())
    
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

