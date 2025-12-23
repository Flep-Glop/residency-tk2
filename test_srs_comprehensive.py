#!/usr/bin/env python3
"""
Comprehensive QA Test Script for SRS/SRT Module

Following established patterns from:
- test_tbi_comprehensive.py (Entry #39)
- test_hdr_comprehensive.py (Entry #43)
- test_pacemaker_comprehensive.py (Entry #47)
- test_prior_dose_comprehensive.py (Entry #52)

Test Suites:
1. Single Lesion SRS - All dose presets
2. Single Lesion SRT - All fractionation schemes
3. Multiple Lesions - Various configurations
4. Mixed SRS/SRT - Combined treatment types
5. Edge Cases - Unusual configurations

Quality Checks:
- No patient demographics (removed in Entry #21)
- Proper Dr. prefix for physician/physicist
- Correct fraction grammar (singular/plural)
- SRS-specific content (MRI fusion, ExacTrac, BrainLAB, immobilization)
"""

import requests
import json
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000/api"

def create_srs_payload(physician, physicist, lesions):
    """Create standardized SRS/SRT API payload."""
    return {
        "common_info": {
            "physician": {"name": physician, "role": "physician"},
            "physicist": {"name": physicist, "role": "physicist"}
        },
        "srs_data": {
            "lesions": lesions,
            "mri_sequence": "T1-weighted, post Gd contrast",
            "planning_system": "BrainLAB Elements",
            "accelerator": "Versa HD",
            "tracking_system": "ExacTrac",
            "immobilization_device": "rigid aquaplast head mask",
            "ct_slice_thickness": 1.25,
            "ct_localization": True
        }
    }

def create_lesion(site, volume, treatment_type, dose, fractions,
                  prescription_isodose=80, ptv_coverage=98,
                  conformity_index=1.2, gradient_index=3.0, max_dose=125):
    """Create a standardized lesion configuration."""
    return {
        "site": site,
        "volume": volume,
        "treatment_type": treatment_type,
        "dose": dose,
        "fractions": fractions,
        "prescription_isodose": prescription_isodose,
        "ptv_coverage": ptv_coverage,
        "conformity_index": conformity_index,
        "gradient_index": gradient_index,
        "max_dose": max_dose
    }

def generate_writeup(payload):
    """Call the SRS generate endpoint and return writeup."""
    response = requests.post(f"{BASE_URL}/srs/generate", json=payload)
    response.raise_for_status()
    return response.json()["writeup"]

# ============================================================================
# QUALITY CHECK FUNCTIONS
# ============================================================================

def check_no_demographics(writeup):
    """Verify no patient demographics are present (Entry #21)."""
    import re
    demographics = [
        r'\b\d+[\s-]?year[\s-]?old\b',  # Age patterns
        r'\b(male|female)\b',            # Gender (standalone words)
        r'\bhe\s+is\b',                  # Pronouns in sentences
        r'\bshe\s+is\b',
        r'\bhis\b',
        r'\bher\b',
    ]
    
    found = []
    for pattern in demographics:
        if re.search(pattern, writeup, re.IGNORECASE):
            # Filter out false positives
            if pattern == r'\bhis\b':
                # Check if it's actually the word "this"
                if re.search(r'\bthis\b', writeup, re.IGNORECASE):
                    continue
            if pattern == r'\bher\b':
                # Check if it's in "whether", "other", etc.
                if re.search(r'\b(whether|other)\b', writeup, re.IGNORECASE):
                    continue
            found.append(pattern)
    
    return len(found) == 0, found

def check_physician_prefix(writeup, physician):
    """Verify physician name has Dr. prefix."""
    return f"Dr. {physician}" in writeup

def check_physicist_prefix(writeup, physicist):
    """Verify physicist name has Dr. prefix."""
    return f"Dr. {physicist}" in writeup

def check_fraction_grammar(writeup, fractions):
    """Check for correct singular/plural fraction grammar."""
    if fractions == 1:
        # Should say "1 fraction" not "1 fractions"
        has_correct = "1 fraction" in writeup and "1 fractions" not in writeup
        return has_correct
    else:
        # Should say "N fractions"
        has_plural = f"{fractions} fractions" in writeup
        return has_plural

def check_mri_fusion_mentioned(writeup):
    """Verify MRI fusion is mentioned."""
    return "MRI" in writeup or "MR image" in writeup

def check_exactrac_mentioned(writeup):
    """Verify ExacTrac system is mentioned."""
    return "ExacTrac" in writeup

def check_brainlab_mentioned(writeup):
    """Verify BrainLAB planning system is mentioned."""
    return "BrainLAB" in writeup

def check_immobilization_mentioned(writeup):
    """Verify immobilization device is mentioned."""
    return "aquaplast" in writeup.lower() or "head mask" in writeup.lower()

def check_conformity_index_present(writeup):
    """Verify conformity index is in writeup."""
    return "Conformity Index" in writeup

def check_gradient_index_present(writeup):
    """Verify gradient index is in writeup."""
    return "Gradient Index" in writeup

def check_lesion_count(writeup, expected_count):
    """Verify correct number of lesions mentioned in multi-lesion cases."""
    if expected_count == 1:
        return True  # Single lesion doesn't need count verification
    return f"{expected_count} brain lesions" in writeup or f"Lesion {expected_count}" in writeup

# ============================================================================
# TEST SUITES
# ============================================================================

def run_tests():
    """Run all comprehensive SRS/SRT tests."""
    results = []
    
    # Standard physician/physicist for all tests
    physician = "Galvan"
    physicist = "Kirby"
    
    # ========================================================================
    # Suite 1: Single Lesion SRS (All dose presets)
    # ========================================================================
    print("\n" + "="*60)
    print("Suite 1: Single Lesion SRS Tests")
    print("="*60)
    
    srs_doses = [16, 18, 20, 21]
    for dose in srs_doses:
        test_name = f"SRS {dose} Gy Single Lesion"
        print(f"\nTest: {test_name}")
        
        lesion = create_lesion(
            site="left frontal lobe",
            volume=2.5,
            treatment_type="SRS",
            dose=dose,
            fractions=1
        )
        
        payload = create_srs_payload(physician, physicist, [lesion])
        
        try:
            writeup = generate_writeup(payload)
            
            # Quality checks
            checks = {
                "no_demographics": check_no_demographics(writeup)[0],
                "physician_prefix": check_physician_prefix(writeup, physician),
                "physicist_prefix": check_physicist_prefix(writeup, physicist),
                "fraction_grammar": check_fraction_grammar(writeup, 1),
                "mri_fusion": check_mri_fusion_mentioned(writeup),
                "exactrac": check_exactrac_mentioned(writeup),
                "brainlab": check_brainlab_mentioned(writeup),
                "immobilization": check_immobilization_mentioned(writeup),
                "conformity_index": check_conformity_index_present(writeup),
                "gradient_index": check_gradient_index_present(writeup)
            }
            
            all_passed = all(checks.values())
            status = "PASSED" if all_passed else "FAILED"
            print(f"  Status: {status}")
            
            results.append({
                "suite": "Single Lesion SRS",
                "test": test_name,
                "status": status,
                "checks": checks,
                "writeup": writeup,
                "payload": payload
            })
            
        except Exception as e:
            print(f"  Status: ERROR - {str(e)}")
            results.append({
                "suite": "Single Lesion SRS",
                "test": test_name,
                "status": "ERROR",
                "error": str(e),
                "payload": payload
            })
    
    # ========================================================================
    # Suite 2: Single Lesion SRT (All fractionation schemes)
    # ========================================================================
    print("\n" + "="*60)
    print("Suite 2: Single Lesion SRT Tests")
    print("="*60)
    
    srt_regimens = [
        (25, 5),   # 25 Gy in 5 fractions
        (27, 3),   # 27 Gy in 3 fractions
        (30, 5),   # 30 Gy in 5 fractions
        (35, 5),   # 35 Gy in 5 fractions
    ]
    
    for dose, fractions in srt_regimens:
        test_name = f"SRT {dose} Gy / {fractions} fx Single Lesion"
        print(f"\nTest: {test_name}")
        
        lesion = create_lesion(
            site="right parietal lobe",
            volume=3.2,
            treatment_type="SRT",
            dose=dose,
            fractions=fractions
        )
        
        payload = create_srs_payload(physician, physicist, [lesion])
        
        try:
            writeup = generate_writeup(payload)
            
            checks = {
                "no_demographics": check_no_demographics(writeup)[0],
                "physician_prefix": check_physician_prefix(writeup, physician),
                "physicist_prefix": check_physicist_prefix(writeup, physicist),
                "fraction_grammar": check_fraction_grammar(writeup, fractions),
                "mri_fusion": check_mri_fusion_mentioned(writeup),
                "exactrac": check_exactrac_mentioned(writeup),
                "brainlab": check_brainlab_mentioned(writeup),
                "immobilization": check_immobilization_mentioned(writeup),
            }
            
            all_passed = all(checks.values())
            status = "PASSED" if all_passed else "FAILED"
            print(f"  Status: {status}")
            
            results.append({
                "suite": "Single Lesion SRT",
                "test": test_name,
                "status": status,
                "checks": checks,
                "writeup": writeup,
                "payload": payload
            })
            
        except Exception as e:
            print(f"  Status: ERROR - {str(e)}")
            results.append({
                "suite": "Single Lesion SRT",
                "test": test_name,
                "status": "ERROR",
                "error": str(e),
                "payload": payload
            })
    
    # ========================================================================
    # Suite 3: Multiple Lesions (Same Treatment Type)
    # ========================================================================
    print("\n" + "="*60)
    print("Suite 3: Multiple Lesion Tests")
    print("="*60)
    
    # Test: Two SRS lesions
    test_name = "Two SRS Lesions (18 Gy each)"
    print(f"\nTest: {test_name}")
    
    lesions = [
        create_lesion(site="left frontal lobe", volume=1.8, treatment_type="SRS", dose=18, fractions=1),
        create_lesion(site="right parietal lobe", volume=2.2, treatment_type="SRS", dose=18, fractions=1)
    ]
    
    payload = create_srs_payload(physician, physicist, lesions)
    
    try:
        writeup = generate_writeup(payload)
        
        checks = {
            "no_demographics": check_no_demographics(writeup)[0],
            "physician_prefix": check_physician_prefix(writeup, physician),
            "lesion_count": check_lesion_count(writeup, 2),
            "mri_fusion": check_mri_fusion_mentioned(writeup),
            "conformity_index": check_conformity_index_present(writeup),
        }
        
        all_passed = all(checks.values())
        status = "PASSED" if all_passed else "FAILED"
        print(f"  Status: {status}")
        
        results.append({
            "suite": "Multiple Lesions",
            "test": test_name,
            "status": status,
            "checks": checks,
            "writeup": writeup,
            "payload": payload
        })
        
    except Exception as e:
        print(f"  Status: ERROR - {str(e)}")
        results.append({
            "suite": "Multiple Lesions",
            "test": test_name,
            "status": "ERROR",
            "error": str(e),
            "payload": payload
        })
    
    # Test: Three SRT lesions
    test_name = "Three SRT Lesions (30 Gy / 5 fx each)"
    print(f"\nTest: {test_name}")
    
    lesions = [
        create_lesion(site="left temporal lobe", volume=1.5, treatment_type="SRT", dose=30, fractions=5),
        create_lesion(site="right occipital lobe", volume=2.0, treatment_type="SRT", dose=30, fractions=5),
        create_lesion(site="cerebellum", volume=1.8, treatment_type="SRT", dose=30, fractions=5)
    ]
    
    payload = create_srs_payload(physician, physicist, lesions)
    
    try:
        writeup = generate_writeup(payload)
        
        checks = {
            "no_demographics": check_no_demographics(writeup)[0],
            "physician_prefix": check_physician_prefix(writeup, physician),
            "lesion_count": check_lesion_count(writeup, 3),
            "fraction_grammar": check_fraction_grammar(writeup, 5),
        }
        
        all_passed = all(checks.values())
        status = "PASSED" if all_passed else "FAILED"
        print(f"  Status: {status}")
        
        results.append({
            "suite": "Multiple Lesions",
            "test": test_name,
            "status": status,
            "checks": checks,
            "writeup": writeup,
            "payload": payload
        })
        
    except Exception as e:
        print(f"  Status: ERROR - {str(e)}")
        results.append({
            "suite": "Multiple Lesions",
            "test": test_name,
            "status": "ERROR",
            "error": str(e),
            "payload": payload
        })
    
    # ========================================================================
    # Suite 4: Mixed SRS/SRT (Different Treatment Types)
    # ========================================================================
    print("\n" + "="*60)
    print("Suite 4: Mixed SRS/SRT Tests")
    print("="*60)
    
    test_name = "Mixed SRS + SRT (2 lesions)"
    print(f"\nTest: {test_name}")
    
    lesions = [
        create_lesion(site="left frontal lobe", volume=1.2, treatment_type="SRS", dose=20, fractions=1),
        create_lesion(site="brainstem", volume=2.8, treatment_type="SRT", dose=25, fractions=5)
    ]
    
    payload = create_srs_payload(physician, physicist, lesions)
    
    try:
        writeup = generate_writeup(payload)
        
        checks = {
            "no_demographics": check_no_demographics(writeup)[0],
            "physician_prefix": check_physician_prefix(writeup, physician),
            "lesion_count": check_lesion_count(writeup, 2),
            "mixed_mentioned": "mixed" in writeup.lower() or ("SRS" in writeup and "SRT" in writeup),
            "mri_fusion": check_mri_fusion_mentioned(writeup),
        }
        
        all_passed = all(checks.values())
        status = "PASSED" if all_passed else "FAILED"
        print(f"  Status: {status}")
        
        results.append({
            "suite": "Mixed SRS/SRT",
            "test": test_name,
            "status": status,
            "checks": checks,
            "writeup": writeup,
            "payload": payload
        })
        
    except Exception as e:
        print(f"  Status: ERROR - {str(e)}")
        results.append({
            "suite": "Mixed SRS/SRT",
            "test": test_name,
            "status": "ERROR",
            "error": str(e),
            "payload": payload
        })
    
    test_name = "Mixed SRS + SRT (3 lesions, 2 SRS + 1 SRT)"
    print(f"\nTest: {test_name}")
    
    lesions = [
        create_lesion(site="left frontal lobe", volume=1.0, treatment_type="SRS", dose=21, fractions=1),
        create_lesion(site="right parietal lobe", volume=1.5, treatment_type="SRS", dose=18, fractions=1),
        create_lesion(site="thalamus", volume=3.5, treatment_type="SRT", dose=27, fractions=3)
    ]
    
    payload = create_srs_payload(physician, physicist, lesions)
    
    try:
        writeup = generate_writeup(payload)
        
        checks = {
            "no_demographics": check_no_demographics(writeup)[0],
            "lesion_count": check_lesion_count(writeup, 3),
            "individual_schedules": "individual fractionation" in writeup.lower(),
        }
        
        all_passed = all(checks.values())
        status = "PASSED" if all_passed else "FAILED"
        print(f"  Status: {status}")
        
        results.append({
            "suite": "Mixed SRS/SRT",
            "test": test_name,
            "status": status,
            "checks": checks,
            "writeup": writeup,
            "payload": payload
        })
        
    except Exception as e:
        print(f"  Status: ERROR - {str(e)}")
        results.append({
            "suite": "Mixed SRS/SRT",
            "test": test_name,
            "status": "ERROR",
            "error": str(e),
            "payload": payload
        })
    
    # ========================================================================
    # Suite 5: Edge Cases
    # ========================================================================
    print("\n" + "="*60)
    print("Suite 5: Edge Case Tests")
    print("="*60)
    
    # Small lesion volume
    test_name = "Small Lesion (0.5 cc)"
    print(f"\nTest: {test_name}")
    
    lesion = create_lesion(
        site="pineal region",
        volume=0.5,
        treatment_type="SRS",
        dose=16,
        fractions=1
    )
    
    payload = create_srs_payload(physician, physicist, [lesion])
    
    try:
        writeup = generate_writeup(payload)
        
        checks = {
            "no_demographics": check_no_demographics(writeup)[0],
            "physician_prefix": check_physician_prefix(writeup, physician),
            "small_volume_mentioned": "0.5 cc" in writeup,
        }
        
        all_passed = all(checks.values())
        status = "PASSED" if all_passed else "FAILED"
        print(f"  Status: {status}")
        
        results.append({
            "suite": "Edge Cases",
            "test": test_name,
            "status": status,
            "checks": checks,
            "writeup": writeup,
            "payload": payload
        })
        
    except Exception as e:
        print(f"  Status: ERROR - {str(e)}")
        results.append({
            "suite": "Edge Cases",
            "test": test_name,
            "status": "ERROR",
            "error": str(e),
            "payload": payload
        })
    
    # Large lesion volume
    test_name = "Large Lesion (15 cc) - Requires SRT"
    print(f"\nTest: {test_name}")
    
    lesion = create_lesion(
        site="right temporal lobe",
        volume=15.0,
        treatment_type="SRT",
        dose=35,
        fractions=5
    )
    
    payload = create_srs_payload(physician, physicist, [lesion])
    
    try:
        writeup = generate_writeup(payload)
        
        checks = {
            "no_demographics": check_no_demographics(writeup)[0],
            "large_volume_mentioned": "15 cc" in writeup,
            "srt_mentioned": "stereotactic radiotherapy" in writeup.lower(),
        }
        
        all_passed = all(checks.values())
        status = "PASSED" if all_passed else "FAILED"
        print(f"  Status: {status}")
        
        results.append({
            "suite": "Edge Cases",
            "test": test_name,
            "status": status,
            "checks": checks,
            "writeup": writeup,
            "payload": payload
        })
        
    except Exception as e:
        print(f"  Status: ERROR - {str(e)}")
        results.append({
            "suite": "Edge Cases",
            "test": test_name,
            "status": "ERROR",
            "error": str(e),
            "payload": payload
        })
    
    # Many lesions (5)
    test_name = "Many Lesions (5 SRS)"
    print(f"\nTest: {test_name}")
    
    regions = ["left frontal lobe", "right parietal lobe", "left temporal lobe", 
               "right occipital lobe", "cerebellum"]
    lesions = [
        create_lesion(site=region, volume=1.0 + i*0.3, treatment_type="SRS", dose=18, fractions=1)
        for i, region in enumerate(regions)
    ]
    
    payload = create_srs_payload(physician, physicist, lesions)
    
    try:
        writeup = generate_writeup(payload)
        
        checks = {
            "no_demographics": check_no_demographics(writeup)[0],
            "lesion_count": check_lesion_count(writeup, 5),
            "all_lesions_listed": "Lesion 5" in writeup,
        }
        
        all_passed = all(checks.values())
        status = "PASSED" if all_passed else "FAILED"
        print(f"  Status: {status}")
        
        results.append({
            "suite": "Edge Cases",
            "test": test_name,
            "status": status,
            "checks": checks,
            "writeup": writeup,
            "payload": payload
        })
        
    except Exception as e:
        print(f"  Status: ERROR - {str(e)}")
        results.append({
            "suite": "Edge Cases",
            "test": test_name,
            "status": "ERROR",
            "error": str(e),
            "payload": payload
        })
    
    return results

def generate_report(results):
    """Generate markdown report from test results."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    report = []
    report.append("# SRS/SRT Module Comprehensive QA Report")
    report.append(f"\n**Generated:** {timestamp}")
    report.append(f"**Total Tests:** {len(results)}")
    
    passed = sum(1 for r in results if r["status"] == "PASSED")
    failed = sum(1 for r in results if r["status"] == "FAILED")
    errors = sum(1 for r in results if r["status"] == "ERROR")
    
    report.append(f"**Results:** {passed} Passed, {failed} Failed, {errors} Errors")
    
    # Executive Summary
    report.append("\n## Executive Summary")
    report.append(f"\n- **Pass Rate:** {passed}/{len(results)} ({100*passed/len(results):.1f}%)")
    
    # Quality Metrics
    report.append("\n## Quality Metrics")
    
    # Collect aggregate check results
    all_checks = {}
    for r in results:
        if "checks" in r:
            for check_name, check_result in r["checks"].items():
                if check_name not in all_checks:
                    all_checks[check_name] = {"passed": 0, "total": 0}
                all_checks[check_name]["total"] += 1
                if check_result:
                    all_checks[check_name]["passed"] += 1
    
    report.append("\n| Check | Passed | Total | Rate |")
    report.append("|-------|--------|-------|------|")
    for check_name, counts in sorted(all_checks.items()):
        rate = 100 * counts["passed"] / counts["total"] if counts["total"] > 0 else 0
        status = "PASS" if counts["passed"] == counts["total"] else "FAIL"
        report.append(f"| {check_name} | {counts['passed']} | {counts['total']} | {rate:.0f}% {status} |")
    
    # Detailed Results by Suite
    report.append("\n## Detailed Results")
    
    suites = {}
    for r in results:
        suite = r.get("suite", "Unknown")
        if suite not in suites:
            suites[suite] = []
        suites[suite].append(r)
    
    for suite_name, suite_results in suites.items():
        report.append(f"\n### {suite_name}")
        
        for r in suite_results:
            test_name = r.get("test", "Unknown Test")
            status = r.get("status", "UNKNOWN")
            status_emoji = "PASS" if status == "PASSED" else "FAIL" if status == "FAILED" else "ERROR"
            
            report.append(f"\n#### {test_name}")
            report.append(f"**Status:** {status_emoji}")
            
            if "checks" in r:
                report.append("\n**Quality Checks:**")
                for check_name, check_result in r["checks"].items():
                    check_emoji = "PASS" if check_result else "FAIL"
                    report.append(f"- {check_name}: {check_emoji}")
            
            if "writeup" in r:
                report.append("\n**Generated Writeup:**")
                report.append("```")
                report.append(r["writeup"])
                report.append("```")
            
            if "error" in r:
                report.append(f"\n**Error:** {r['error']}")
    
    # Recommendations
    report.append("\n## Recommendations")
    
    if failed == 0 and errors == 0:
        report.append("\n**ALL TESTS PASSED** - SRS/SRT module is production-ready!")
    else:
        if failed > 0:
            report.append(f"\n- {failed} tests failed - review failing checks above")
        if errors > 0:
            report.append(f"\n- {errors} tests encountered errors - check backend connectivity")
    
    return "\n".join(report)

if __name__ == "__main__":
    print("=" * 60)
    print("SRS/SRT Module Comprehensive QA Test")
    print("=" * 60)
    
    # Run tests
    results = run_tests()
    
    # Generate report
    report = generate_report(results)
    
    # Save report
    report_file = "srs_qa_results.md"
    with open(report_file, "w") as f:
        f.write(report)
    
    print("\n" + "=" * 60)
    print(f"Report saved to: {report_file}")
    print("=" * 60)
    
    # Print summary
    passed = sum(1 for r in results if r["status"] == "PASSED")
    failed = sum(1 for r in results if r["status"] == "FAILED")
    errors = sum(1 for r in results if r["status"] == "ERROR")
    
    print(f"\nFinal Results: {passed}/{len(results)} passed")
    if failed > 0:
        print(f"  - {failed} failed")
    if errors > 0:
        print(f"  - {errors} errors")

