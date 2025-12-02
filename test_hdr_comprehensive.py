#!/usr/bin/env python3
"""
Comprehensive HDR QA Test Script
Following the pattern from TBI (Entry #39), DIBH (Entry #30), and Fusion (Entry #27) testing.

Tests all applicator types, channel variations, edge cases,
and generates markdown report for clinical review.
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api"
OUTPUT_FILE = "hdr_qa_results.md"

# Standard physicians and physicists for consistency
PHYSICIAN = "Galvan"
PHYSICIST = "Kirby"

def generate_writeup(test_name, payload):
    """Generate an HDR writeup and return result."""
    try:
        response = requests.post(f"{BASE_URL}/hdr/generate", json=payload)
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

def create_payload(applicator_type, treatment_site, channels):
    """Create a standard payload for HDR testing."""
    return {
        "common_info": {
            "physician": {"name": PHYSICIAN, "role": "physician"},
            "physicist": {"name": PHYSICIST, "role": "physicist"}
        },
        "hdr_data": {
            "applicator_type": applicator_type,
            "treatment_site": treatment_site,
            "number_of_channels": channels
        }
    }

# =============================================================================
# TEST SUITE 1: Standard Applicator Types
# =============================================================================
def test_suite_1_standard_applicators():
    """Test all 6 standard applicator types with default configurations."""
    print("\n" + "="*80)
    print("TEST SUITE 1: Standard Applicator Types - Default Configurations")
    print("="*80)
    
    tests = []
    
    # Test 1: Single channel vaginal cylinder (VC)
    tests.append(generate_writeup(
        "Vaginal Cylinder (VC) - 1 channel",
        create_payload("VC", "gynecological", 1)
    ))
    
    # Test 2: Tandem & Ovoid (T&O) - 3 channels
    tests.append(generate_writeup(
        "Tandem & Ovoid (T&O) - 3 channels",
        create_payload("T&O", "gynecological", 3)
    ))
    
    # Test 3: Utrecht applicator - 15 channels
    tests.append(generate_writeup(
        "Utrecht Applicator - 15 channels",
        create_payload("Utrecht", "gynecological", 15)
    ))
    
    # Test 4: GENEVA applicator - 3 channels
    tests.append(generate_writeup(
        "GENEVA Applicator - 3 channels",
        create_payload("GENEVA", "gynecological", 3)
    ))
    
    # Test 5: SYED Gynecological - 18 channels
    tests.append(generate_writeup(
        "SYED Gynecological - 18 channels",
        create_payload("SYED-Gyn", "gynecological", 18)
    ))
    
    # Test 6: SYED Prostate - 18 channels
    tests.append(generate_writeup(
        "SYED Prostate - 18 channels",
        create_payload("SYED-Prostate", "prostate", 18)
    ))
    
    return tests

# =============================================================================
# TEST SUITE 2: Channel Variations (Grammar Testing)
# =============================================================================
def test_suite_2_channel_variations():
    """Test different channel counts to verify grammar handling."""
    print("\n" + "="*80)
    print("TEST SUITE 2: Channel Variations - Grammar Testing")
    print("="*80)
    
    tests = []
    
    # Test 7: Single channel (should say "one channel")
    tests.append(generate_writeup(
        "VC - 1 channel (grammar: 'one channel')",
        create_payload("VC", "gynecological", 1)
    ))
    
    # Test 8: Two channels (should say "two channels")
    tests.append(generate_writeup(
        "Custom - 2 channels (grammar: 'two channels')",
        create_payload("T&O", "gynecological", 2)
    ))
    
    # Test 9: Three channels (should say "three channels")
    tests.append(generate_writeup(
        "T&O - 3 channels (grammar: 'three channels')",
        create_payload("T&O", "gynecological", 3)
    ))
    
    # Test 10: Four+ channels (should say "4 channels")
    tests.append(generate_writeup(
        "Custom - 4 channels (grammar: '4 channels')",
        create_payload("GENEVA", "gynecological", 4)
    ))
    
    # Test 11: Large channel count
    tests.append(generate_writeup(
        "Utrecht - 15 channels (grammar: '15 channels')",
        create_payload("Utrecht", "gynecological", 15)
    ))
    
    return tests

# =============================================================================
# TEST SUITE 3: Treatment Site Variations
# =============================================================================
def test_suite_3_treatment_sites():
    """Test gynecological vs prostate treatment sites."""
    print("\n" + "="*80)
    print("TEST SUITE 3: Treatment Site Variations")
    print("="*80)
    
    tests = []
    
    # Test 12: Gynecological - Single channel
    tests.append(generate_writeup(
        "Gynecological - VC Single Channel",
        create_payload("VC", "gynecological", 1)
    ))
    
    # Test 13: Gynecological - Multi-channel
    tests.append(generate_writeup(
        "Gynecological - Utrecht Multi-channel",
        create_payload("Utrecht", "gynecological", 15)
    ))
    
    # Test 14: Prostate - SYED applicator
    tests.append(generate_writeup(
        "Prostate - SYED 18 channels",
        create_payload("SYED-Prostate", "prostate", 18)
    ))
    
    return tests

# =============================================================================
# TEST SUITE 4: Edge Cases and Custom Configurations
# =============================================================================
def test_suite_4_edge_cases():
    """Test edge cases and unusual configurations."""
    print("\n" + "="*80)
    print("TEST SUITE 4: Edge Cases and Custom Configurations")
    print("="*80)
    
    tests = []
    
    # Test 15: Very high channel count
    tests.append(generate_writeup(
        "Edge Case - High Channel Count (25 channels)",
        create_payload("Utrecht", "gynecological", 25)
    ))
    
    # Test 16: Minimum configuration (1 channel)
    tests.append(generate_writeup(
        "Edge Case - Minimum Configuration (1 channel)",
        create_payload("VC", "gynecological", 1)
    ))
    
    # Test 17: Standard T&O with modified channels
    tests.append(generate_writeup(
        "Edge Case - T&O with 5 channels (custom)",
        create_payload("T&O", "gynecological", 5)
    ))
    
    # Test 18: GENEVA with non-standard channel count
    tests.append(generate_writeup(
        "Edge Case - GENEVA with 7 channels (custom)",
        create_payload("GENEVA", "gynecological", 7)
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
        f.write("# HDR Module Comprehensive QA Report\n\n")
        f.write(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write(f"**Total Tests:** {len(all_results)}\n")
        f.write(f"**Successful:** {sum(1 for r in all_results if r['success'])}\n")
        f.write(f"**Failed:** {sum(1 for r in all_results if not r['success'])}\n\n")
        
        f.write("---\n\n")
        
        # Test results grouped by suite
        suites = [
            ("Suite 1: Standard Applicator Types", list(range(0, 6))),
            ("Suite 2: Channel Variations - Grammar Testing", list(range(6, 11))),
            ("Suite 3: Treatment Site Variations", list(range(11, 14))),
            ("Suite 4: Edge Cases and Custom Configurations", list(range(14, 18)))
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
                    hdr_data = result['payload']['hdr_data']
                    f.write(f"- Applicator Type: {hdr_data['applicator_type']}\n")
                    f.write(f"- Treatment Site: {hdr_data['treatment_site']}\n")
                    f.write(f"- Number of Channels: {hdr_data['number_of_channels']}\n")
                    
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
                    
                    # Check for proper physician name format (Dr. prefix)
                    has_dr_physician = f"Dr. {PHYSICIAN}" in writeup
                    f.write(f"- Physician Format (Dr. {PHYSICIAN}): {'✅ Yes' if has_dr_physician else '❌ No'}\n")
                    
                    # Check for proper physicist name format (Dr. prefix)
                    has_dr_physicist = f"Dr. {PHYSICIST}" in writeup
                    f.write(f"- Physicist Format (Dr. {PHYSICIST}): {'✅ Yes' if has_dr_physicist else '❌ No'}\n")
                    
                    # Check for proper channel grammar
                    channels = hdr_data['number_of_channels']
                    if channels == 1:
                        has_correct_grammar = "one channel" in writeup
                        f.write(f"- Channel Grammar (one channel): {'✅ Yes' if has_correct_grammar else '❌ No'}\n")
                    elif channels == 2:
                        has_correct_grammar = "two channels" in writeup
                        f.write(f"- Channel Grammar (two channels): {'✅ Yes' if has_correct_grammar else '❌ No'}\n")
                    elif channels == 3:
                        has_correct_grammar = "three channels" in writeup
                        f.write(f"- Channel Grammar (three channels): {'✅ Yes' if has_correct_grammar else '❌ No'}\n")
                    else:
                        has_correct_grammar = f"{channels} channels" in writeup
                        f.write(f"- Channel Grammar ({channels} channels): {'✅ Yes' if has_correct_grammar else '❌ No'}\n")
                    
                    # Check for HDR specific content
                    has_hdr = "HDR implant" in writeup
                    f.write(f"- HDR Implant Mentioned: {'✅ Yes' if has_hdr else '❌ No'}\n")
                    
                    # Check for applicator mention
                    applicator_keywords = ["vaginal cylinder", "tandem and ovoid", "utrecht", "geneva", "syed"]
                    has_applicator = any(keyword in writeup.lower() for keyword in applicator_keywords)
                    f.write(f"- Applicator Description Present: {'✅ Yes' if has_applicator else '❌ No'}\n")
                    
                    # Check for Ir-192 source mention
                    has_ir192 = "Ir-192" in writeup
                    f.write(f"- Ir-192 Source Mentioned: {'✅ Yes' if has_ir192 else '❌ No'}\n")
                    
                    # Check for patient position
                    has_position = "lithotomy" in writeup.lower()
                    f.write(f"- Patient Position (lithotomy): {'✅ Yes' if has_position else '❌ No'}\n")
                    
                    # Check for CT scan mention
                    has_ct = "CT scan" in writeup
                    f.write(f"- CT Scan Mentioned: {'✅ Yes' if has_ct else '❌ No'}\n")
                    
                    # Check for critical structures
                    critical_structures = ["bladder", "rectum", "intestines", "sigmoid"]
                    structures_found = sum(1 for struct in critical_structures if struct in writeup.lower())
                    f.write(f"- Critical Structures Mentioned: {structures_found}/{len(critical_structures)} ")
                    f.write("✅\n" if structures_found >= 3 else "⚠️ (should mention most critical structures)\n")
                    
                    # Check for planning system
                    has_planning = "Oncentra" in writeup
                    f.write(f"- Planning System (Oncentra): {'✅ Yes' if has_planning else '❌ No'}\n")
                    
                    # Check for digitization mention
                    has_digitization = "digitized" in writeup.lower()
                    f.write(f"- Applicator Digitization: {'✅ Yes' if has_digitization else '❌ No'}\n")
                    
                    # Check for radiation survey
                    has_survey = "survey" in writeup.lower()
                    f.write(f"- Radiation Survey Mentioned: {'✅ Yes' if has_survey else '❌ No'}\n")
                    
                    # Check for survey reading
                    has_reading = "0.2 mR/hr" in writeup
                    f.write(f"- Survey Reading (0.2 mR/hr): {'✅ Yes' if has_reading else '❌ No'}\n")
                    
                    # Check for proper article usage (a vs an)
                    # This is harder to test automatically, but we can look for obvious errors
                    has_an_vaginal = "an vaginal" in writeup.lower()
                    has_a_utrecht = "a Utrecht" in writeup or "a utrecht" in writeup.lower()
                    has_article_error = has_an_vaginal or False  # an vaginal is wrong, should be 'a vaginal'
                    f.write(f"- Proper Article Usage (a/an): {'❌ Error detected' if has_article_error else '✅ Appears correct'}\n")
                    
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
        
        # Dr. prefix checks
        physician_prefix_count = sum(1 for r in successful_results if f"Dr. {PHYSICIAN}" in r['writeup'])
        f.write(f"- **Physician Format (Dr. prefix):** {physician_prefix_count}/{len(successful_results)} tests correct ")
        f.write("✅ PASS\n" if physician_prefix_count == len(successful_results) else "❌ FAIL\n")
        
        physicist_prefix_count = sum(1 for r in successful_results if f"Dr. {PHYSICIST}" in r['writeup'])
        f.write(f"- **Physicist Format (Dr. prefix):** {physicist_prefix_count}/{len(successful_results)} tests correct ")
        f.write("✅ PASS\n" if physicist_prefix_count == len(successful_results) else "❌ FAIL\n")
        
        # Channel grammar check
        grammar_count = sum(1 for r in successful_results 
                           if ((r['payload']['hdr_data']['number_of_channels'] == 1 and "one channel" in r['writeup']) or
                               (r['payload']['hdr_data']['number_of_channels'] == 2 and "two channels" in r['writeup']) or
                               (r['payload']['hdr_data']['number_of_channels'] == 3 and "three channels" in r['writeup']) or
                               (r['payload']['hdr_data']['number_of_channels'] > 3 and 
                                f"{r['payload']['hdr_data']['number_of_channels']} channels" in r['writeup'])))
        f.write(f"- **Channel Grammar:** {grammar_count}/{len(successful_results)} tests correct ")
        f.write("✅ PASS\n" if grammar_count == len(successful_results) else "❌ FAIL\n")
        
        # HDR implant mention
        hdr_count = sum(1 for r in successful_results if "HDR implant" in r['writeup'])
        f.write(f"- **HDR Implant Mentioned:** {hdr_count}/{len(successful_results)} tests ")
        f.write("✅ PASS\n" if hdr_count == len(successful_results) else "⚠️ Check\n")
        
        # Ir-192 source mention
        ir192_count = sum(1 for r in successful_results if "Ir-192" in r['writeup'])
        f.write(f"- **Ir-192 Source Mentioned:** {ir192_count}/{len(successful_results)} tests ")
        f.write("✅ PASS\n" if ir192_count == len(successful_results) else "⚠️ Check\n")
        
        # Radiation survey mention
        survey_count = sum(1 for r in successful_results if "survey" in r['writeup'].lower())
        f.write(f"- **Radiation Survey Mentioned:** {survey_count}/{len(successful_results)} tests ")
        f.write("✅ PASS\n" if survey_count == len(successful_results) else "❌ FAIL\n")
        
        f.write("\n### Recommendations\n\n")
        if demographics_count > 0:
            f.write("- ❌ **CRITICAL:** Patient demographics found in writeups. Must be removed.\n")
        if physician_prefix_count < len(successful_results):
            f.write("- ❌ **FORMAT:** Some writeups missing 'Dr.' prefix for physician names.\n")
        if physicist_prefix_count < len(successful_results):
            f.write("- ❌ **FORMAT:** Some writeups missing 'Dr.' prefix for physicist names.\n")
        if grammar_count < len(successful_results):
            f.write("- ❌ **GRAMMAR:** Some writeups have incorrect channel grammar (one/two/three/N channels).\n")
        if survey_count < len(successful_results):
            f.write("- ❌ **CONTENT:** Some writeups missing radiation survey paragraph.\n")
        if (demographics_count == 0 and 
            physician_prefix_count == len(successful_results) and
            physicist_prefix_count == len(successful_results) and 
            grammar_count == len(successful_results) and
            survey_count == len(successful_results)):
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
    print("HDR MODULE COMPREHENSIVE QA TEST SUITE")
    print("Following TBI/DIBH/Fusion QA Pattern (DEV_LOG Entries #27, #30, #39)")
    print("="*80)
    print(f"Backend: {BASE_URL}")
    print(f"Output: {OUTPUT_FILE}")
    
    all_results = []
    
    # Run all test suites
    all_results.extend(test_suite_1_standard_applicators())
    all_results.extend(test_suite_2_channel_variations())
    all_results.extend(test_suite_3_treatment_sites())
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

