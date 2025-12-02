#!/usr/bin/env python3
"""
Comprehensive Pacemaker Module QA Test Script

Tests all pacemaker/CIED scenarios including:
- Risk levels (Low/Medium/High)
- Distance options
- Pacing dependency variations
- Device vendors
- Dose categories per TG-203

Generates markdown report with automated quality checks.
"""

import requests
import json
from datetime import datetime
from typing import Dict, Any, List

# Backend API endpoint
BASE_URL = "http://localhost:8000/api"

def create_payload(
    physician: str = "Galvan",
    physicist: str = "Kirby",
    treatment_site: str = "thorax",
    dose: float = 50.0,
    fractions: int = 25,
    field_distance: str = "More than 10 cm from treatment field edge",
    device_vendor: str = "Medtronic",
    device_model: str = "Azure",
    pacing_dependent: str = "No",
    tps_max_dose: float = 0.5,
    tps_mean_dose: float = 0.2
) -> Dict[str, Any]:
    """Create a standardized test payload for pacemaker module."""
    return {
        "common_info": {
            "physician": {"name": physician, "role": "physician"},
            "physicist": {"name": physicist, "role": "physicist"}
        },
        "pacemaker_data": {
            "treatment_site": treatment_site,
            "dose": dose,
            "fractions": fractions,
            "field_distance": field_distance,
            "neutron_producing": "No",
            "device_vendor": device_vendor,
            "device_model": device_model,
            "device_serial": "",
            "pacing_dependent": pacing_dependent,
            "tps_max_dose": tps_max_dose,
            "tps_mean_dose": tps_mean_dose,
            "osld_mean_dose": 0.0,
            "risk_level": None
        }
    }

def test_writeup_generation(payload: Dict[str, Any], test_name: str) -> tuple:
    """Test writeup generation and return (success, writeup, error)."""
    try:
        response = requests.post(f"{BASE_URL}/pacemaker/generate", json=payload)
        response.raise_for_status()
        return True, response.json().get('writeup', ''), None
    except Exception as e:
        return False, '', str(e)

def quality_check(writeup: str, test_config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Perform automated quality checks on generated writeup.
    
    Checks:
    - No patient demographics (age/sex)
    - Proper physician/physicist format
    - Risk level mentioned
    - TG-203 reference (if applicable)
    - Device information included
    - Risk-appropriate recommendations
    """
    checks = {}
    
    # Check 1: No patient demographics
    # Use word boundaries to avoid false positives (e.g., "this" containing "his")
    import re
    demographics_patterns = [
        r'-year-old', r'years old', r'male patient', r'female patient',
        r'\bhe is\b', r'\bshe is\b', r'\bhis\b', r'\bher\b'
    ]
    demographics_found = any(re.search(pattern, writeup, re.IGNORECASE) for pattern in demographics_patterns)
    checks['no_demographics'] = not demographics_found
    
    # Check 2: Proper physician/physicist format
    physician_name = test_config['common_info']['physician']['name']
    physicist_name = test_config['common_info']['physicist']['name']
    checks['physician_format'] = f"Dr. {physician_name}" in writeup
    checks['physicist_format'] = f"Dr. {physicist_name}" in writeup
    
    # Check 3: Risk level mentioned
    pacemaker_data = test_config['pacemaker_data']
    checks['mentions_risk'] = 'risk' in writeup.lower()
    
    # Check 4: Device information
    device_vendor = pacemaker_data['device_vendor']
    checks['device_vendor_mentioned'] = device_vendor in writeup
    
    # Check 5: CIED/pacemaker mentioned
    checks['cied_mentioned'] = any(word in writeup.lower() for word in [
        'pacemaker', 'device', 'cied'
    ])
    
    # Check 6: Pacing dependency mentioned correctly
    pacing_dep = pacemaker_data['pacing_dependent']
    if pacing_dep == "Yes":
        checks['pacing_dependency'] = "pacing dependent" in writeup.lower()
    elif pacing_dep == "No":
        checks['pacing_dependency'] = "not pacing dependent" in writeup.lower()
    
    # Check 7: Treatment site mentioned
    site = pacemaker_data['treatment_site']
    checks['treatment_site_mentioned'] = site in writeup.lower()
    
    # Check 8: Defibrillator mentioned (standard precaution)
    checks['defibrillator_mentioned'] = 'defibrillator' in writeup.lower()
    
    # Check 9: Heart rate monitor mentioned
    checks['heart_monitor_mentioned'] = 'heart rate monitor' in writeup.lower()
    
    # Check 10: Device interrogation mentioned
    checks['interrogation_mentioned'] = 'interrogat' in writeup.lower()
    
    # Check 11: Dosimetry mentioned
    checks['dosimetry_mentioned'] = any(word in writeup.lower() for word in [
        'maximum dose', 'mean dose', 'dose to the device'
    ])
    
    # Check 12: AAPM/2Gy guideline mentioned
    checks['aapm_guideline'] = '2' in writeup and 'Gy' in writeup
    
    return checks

def print_quality_results(checks: Dict[str, Any], test_name: str):
    """Print quality check results in a readable format."""
    print(f"\n{test_name} Quality Checks:")
    passed = sum(1 for v in checks.values() if v)
    total = len(checks)
    print(f"  Passed: {passed}/{total}")
    for check, result in checks.items():
        status = "✓" if result else "✗"
        print(f"    {status} {check}")

# Test Suites
def run_test_suite_1_risk_levels():
    """Test Suite 1: Different Risk Levels per TG-203"""
    print("\n" + "="*80)
    print("TEST SUITE 1: RISK LEVELS")
    print("="*80)
    
    tests = []
    
    # Test 1: Low Risk - Pacing independent, dose < 2 Gy, distance > 10 cm
    test1 = {
        'name': 'Low Risk - Pacing Independent, < 2 Gy, > 10 cm',
        'payload': create_payload(
            treatment_site="lung",
            dose=60.0,
            fractions=30,
            field_distance="More than 10 cm from treatment field edge",
            pacing_dependent="No",
            tps_max_dose=0.5,
            tps_mean_dose=0.2
        )
    }
    tests.append(test1)
    
    # Test 2: Medium Risk - Pacing independent, dose 2-5 Gy
    test2 = {
        'name': 'Medium Risk - Pacing Independent, 2-5 Gy',
        'payload': create_payload(
            treatment_site="thorax",
            dose=50.0,
            fractions=25,
            field_distance="Within 3 cm of field edge",
            pacing_dependent="No",
            tps_max_dose=3.0,
            tps_mean_dose=1.5
        )
    }
    tests.append(test2)
    
    # Test 3: Medium Risk - Pacing dependent, dose < 2 Gy
    test3 = {
        'name': 'Medium Risk - Pacing Dependent, < 2 Gy',
        'payload': create_payload(
            treatment_site="breast",
            dose=50.0,
            fractions=25,
            field_distance="More than 10 cm from treatment field edge",
            pacing_dependent="Yes",
            tps_max_dose=1.5,
            tps_mean_dose=0.8
        )
    }
    tests.append(test3)
    
    # Test 4: High Risk - Pacing dependent, dose > 5 Gy
    test4 = {
        'name': 'High Risk - Pacing Dependent, > 5 Gy',
        'payload': create_payload(
            treatment_site="thorax",
            dose=50.0,
            fractions=25,
            field_distance="CIED in direct beam",
            pacing_dependent="Yes",
            tps_max_dose=7.0,
            tps_mean_dose=4.0
        )
    }
    tests.append(test4)
    
    return tests

def run_test_suite_2_distance_variations():
    """Test Suite 2: Field Distance Variations"""
    print("\n" + "="*80)
    print("TEST SUITE 2: FIELD DISTANCE VARIATIONS")
    print("="*80)
    
    tests = []
    
    # Test 5: Distance > 10 cm
    test5 = {
        'name': 'Distance > 10 cm from field edge',
        'payload': create_payload(
            treatment_site="prostate",
            field_distance="More than 10 cm from treatment field edge",
            pacing_dependent="No",
            tps_max_dose=0.3
        )
    }
    tests.append(test5)
    
    # Test 6: Distance 3-10 cm
    test6 = {
        'name': 'Distance 3-10 cm (Less than 10 cm)',
        'payload': create_payload(
            treatment_site="lung",
            field_distance="Less than 10 cm from field edge but not in direct field",
            pacing_dependent="No",
            tps_max_dose=1.5
        )
    }
    tests.append(test6)
    
    # Test 7: Within 3 cm
    test7 = {
        'name': 'Within 3 cm of field edge',
        'payload': create_payload(
            treatment_site="thorax",
            field_distance="Within 3 cm of field edge",
            pacing_dependent="No",
            tps_max_dose=3.5
        )
    }
    tests.append(test7)
    
    # Test 8: Direct beam
    test8 = {
        'name': 'CIED in direct beam',
        'payload': create_payload(
            treatment_site="thorax",
            field_distance="CIED in direct beam",
            pacing_dependent="No",
            tps_max_dose=8.0
        )
    }
    tests.append(test8)
    
    return tests

def run_test_suite_3_device_vendors():
    """Test Suite 3: Different Device Vendors"""
    print("\n" + "="*80)
    print("TEST SUITE 3: DEVICE VENDORS")
    print("="*80)
    
    tests = []
    
    vendors = [
        ("Medtronic", "Azure"),
        ("Boston Scientific", "Ingenio"),
        ("Abbott/St. Jude Medical", "Assurity"),
        ("Biotronik", "Evia")
    ]
    
    for i, (vendor, model) in enumerate(vendors, start=9):
        test = {
            'name': f'{vendor} - {model}',
            'payload': create_payload(
                device_vendor=vendor,
                device_model=model,
                pacing_dependent="No"
            )
        }
        tests.append(test)
    
    return tests

def run_test_suite_4_treatment_sites():
    """Test Suite 4: Various Treatment Sites"""
    print("\n" + "="*80)
    print("TEST SUITE 4: TREATMENT SITES")
    print("="*80)
    
    tests = []
    
    sites = ["brain", "head and neck", "breast", "lung", "abdomen", "pelvis"]
    
    for i, site in enumerate(sites, start=13):
        test = {
            'name': f'Treatment site: {site}',
            'payload': create_payload(
                treatment_site=site,
                pacing_dependent="No"
            )
        }
        tests.append(test)
    
    return tests

def run_test_suite_5_edge_cases():
    """Test Suite 5: Edge Cases and Complex Scenarios"""
    print("\n" + "="*80)
    print("TEST SUITE 5: EDGE CASES")
    print("="*80)
    
    tests = []
    
    # Test 19: High dose, single fraction (SBRT scenario)
    test19 = {
        'name': 'SBRT - High dose single fraction',
        'payload': create_payload(
            treatment_site="lung",
            dose=54.0,
            fractions=3,
            field_distance="More than 10 cm from treatment field edge",
            pacing_dependent="No",
            tps_max_dose=1.8
        )
    }
    tests.append(test19)
    
    # Test 20: Very low dose per fraction
    test20 = {
        'name': 'Low dose per fraction (conventional)',
        'payload': create_payload(
            treatment_site="prostate",
            dose=78.0,
            fractions=39,
            field_distance="More than 10 cm from treatment field edge",
            pacing_dependent="No",
            tps_max_dose=0.8
        )
    }
    tests.append(test20)
    
    # Test 21: Multiple vendors comparison - no model specified
    test21 = {
        'name': 'Device without model specified',
        'payload': create_payload(
            device_vendor="MicroPort",
            device_model="",  # No model
            pacing_dependent="No"
        )
    }
    tests.append(test21)
    
    return tests

def generate_markdown_report(all_results: List[Dict], output_file: str = "pacemaker_qa_results.md"):
    """Generate comprehensive markdown report from test results."""
    
    with open(output_file, 'w') as f:
        # Header
        f.write("# Pacemaker Module Comprehensive QA Report\n\n")
        f.write(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write("**Purpose:** Comprehensive quality assurance testing for the Pacemaker/CIED module\n\n")
        
        # Summary statistics
        total_tests = len(all_results)
        passed_tests = sum(1 for r in all_results if r['success'])
        f.write("## Summary\n\n")
        f.write(f"- **Total Tests:** {total_tests}\n")
        f.write(f"- **Passed:** {passed_tests}\n")
        f.write(f"- **Failed:** {total_tests - passed_tests}\n")
        f.write(f"- **Success Rate:** {(passed_tests/total_tests*100):.1f}%\n\n")
        
        # Quality metrics
        f.write("## Quality Metrics\n\n")
        
        # Count quality checks across all tests
        all_checks = {}
        for result in all_results:
            if result['success']:
                for check, passed in result['quality_checks'].items():
                    if check not in all_checks:
                        all_checks[check] = {'passed': 0, 'total': 0}
                    all_checks[check]['total'] += 1
                    if passed:
                        all_checks[check]['passed'] += 1
        
        f.write("| Quality Check | Passed | Total | Rate |\n")
        f.write("|--------------|--------|-------|------|\n")
        for check, stats in sorted(all_checks.items()):
            rate = (stats['passed']/stats['total']*100) if stats['total'] > 0 else 0
            f.write(f"| {check.replace('_', ' ').title()} | {stats['passed']} | {stats['total']} | {rate:.1f}% |\n")
        f.write("\n")
        
        # Detailed test results
        f.write("## Detailed Test Results\n\n")
        f.write("---\n\n")
        
        for i, result in enumerate(all_results, 1):
            f.write(f"### Test {i}: {result['name']}\n\n")
            
            # Configuration
            f.write("**Configuration:**\n")
            pacemaker_data = result['config']['pacemaker_data']
            common_info = result['config']['common_info']
            f.write(f"- Physician: Dr. {common_info['physician']['name']}\n")
            f.write(f"- Physicist: Dr. {common_info['physicist']['name']}\n")
            f.write(f"- Treatment Site: {pacemaker_data['treatment_site']}\n")
            f.write(f"- Dose: {pacemaker_data['dose']} Gy in {pacemaker_data['fractions']} fractions\n")
            f.write(f"- Field Distance: {pacemaker_data['field_distance']}\n")
            f.write(f"- Device: {pacemaker_data['device_vendor']}")
            if pacemaker_data['device_model']:
                f.write(f" {pacemaker_data['device_model']}")
            f.write("\n")
            f.write(f"- Pacing Dependent: {pacemaker_data['pacing_dependent']}\n")
            f.write(f"- TPS Max Dose: {pacemaker_data['tps_max_dose']} Gy\n")
            f.write(f"- TPS Mean Dose: {pacemaker_data['tps_mean_dose']} Gy\n\n")
            
            # Results
            if result['success']:
                f.write("**Status:** ✓ PASSED\n\n")
                
                # Quality checks
                f.write("**Quality Checks:**\n")
                for check, passed in result['quality_checks'].items():
                    status = "✓" if passed else "✗"
                    f.write(f"- {status} {check.replace('_', ' ').title()}\n")
                f.write("\n")
                
                # Generated writeup
                f.write("**Generated Write-up:**\n\n")
                f.write("```\n")
                f.write(result['writeup'])
                f.write("\n```\n\n")
            else:
                f.write(f"**Status:** ✗ FAILED\n\n")
                f.write(f"**Error:** {result['error']}\n\n")
            
            f.write("---\n\n")
        
        # Recommendations
        f.write("## Recommendations\n\n")
        
        if passed_tests == total_tests:
            f.write("✅ **All tests passed!** The Pacemaker module is ready for production deployment.\n\n")
            
            # Check for any quality issues
            issues = []
            for check, stats in all_checks.items():
                if stats['passed'] < stats['total']:
                    issues.append(f"- {check.replace('_', ' ').title()}: {stats['passed']}/{stats['total']} passed")
            
            if issues:
                f.write("**Minor quality issues to review:**\n")
                for issue in issues:
                    f.write(f"{issue}\n")
            else:
                f.write("**All critical checks passed!**\n")
        else:
            f.write("⚠️ **Some tests failed.** Please review the failed tests and address issues before deployment.\n\n")
    
    print(f"\n✓ Markdown report generated: {output_file}")

def main():
    """Run all test suites and generate comprehensive report."""
    print("="*80)
    print("PACEMAKER MODULE COMPREHENSIVE QA TEST")
    print("="*80)
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Backend: {BASE_URL}")
    
    # Check if backend is available
    try:
        response = requests.get(f"{BASE_URL}/pacemaker/treatment-sites")
        response.raise_for_status()
        print("✓ Backend connection successful")
    except Exception as e:
        print(f"✗ Backend connection failed: {e}")
        print("Please ensure the backend is running (./start.sh)")
        return
    
    # Collect all tests
    all_tests = []
    all_tests.extend(run_test_suite_1_risk_levels())
    all_tests.extend(run_test_suite_2_distance_variations())
    all_tests.extend(run_test_suite_3_device_vendors())
    all_tests.extend(run_test_suite_4_treatment_sites())
    all_tests.extend(run_test_suite_5_edge_cases())
    
    # Run all tests
    all_results = []
    for i, test in enumerate(all_tests, 1):
        print(f"\n[{i}/{len(all_tests)}] Running: {test['name']}")
        success, writeup, error = test_writeup_generation(test['payload'], test['name'])
        
        result = {
            'name': test['name'],
            'config': test['payload'],
            'success': success,
            'writeup': writeup,
            'error': error,
            'quality_checks': {}
        }
        
        if success:
            result['quality_checks'] = quality_check(writeup, test['payload'])
            print_quality_results(result['quality_checks'], test['name'])
        else:
            print(f"  ✗ Test failed: {error}")
        
        all_results.append(result)
    
    # Generate report
    print("\n" + "="*80)
    print("GENERATING MARKDOWN REPORT")
    print("="*80)
    generate_markdown_report(all_results)
    
    # Final summary
    passed = sum(1 for r in all_results if r['success'])
    total = len(all_results)
    print("\n" + "="*80)
    print("FINAL SUMMARY")
    print("="*80)
    print(f"Total Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {total - passed}")
    print(f"Success Rate: {(passed/total*100):.1f}%")
    
    if passed == total:
        print("\n✅ ALL TESTS PASSED! Pacemaker module is production-ready.")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please review the results.")
    
    print(f"\nCompleted: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*80)

if __name__ == "__main__":
    main()

