#!/usr/bin/env python3
"""
Core Prior Dose Module Test Script
Tests the three most important clinical scenarios for Prior Dose module.

Test Cases:
1. Single prior treatment - NO overlap (basic case)
2. Single prior treatment - WITH overlap (most common clinical scenario)
3. Multiple prior treatments - mixed overlap (complex case)
"""

import requests
import json
from datetime import datetime

# Base URL for the API
BASE_URL = "http://localhost:8000/api"

def create_payload(physician, physicist, current_site, current_dose, current_fractions, 
                   prior_treatments, dose_calc_method="EQD2 (Equivalent Dose in 2 Gy fractions)"):
    """Helper function to create standardized test payload."""
    return {
        "common_info": {
            "physician": {"name": physician},
            "physicist": {"name": physicist}
        },
        "prior_dose_data": {
            "current_site": current_site,
            "custom_current_site": "",
            "current_dose": current_dose,
            "current_fractions": current_fractions,
            "current_month": "December",
            "current_year": 2024,
            "spine_location": "",
            "prior_treatments": prior_treatments,
            "dose_calc_method": dose_calc_method,
            "critical_structures": [],
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
            print("\n✓ Test passed - Writeup generated successfully\n")
            print("-" * 80)
            print(writeup)
            print("-" * 80)
            return {"status": "PASS", "writeup": writeup}
        else:
            print(f"\n✗ Test failed - HTTP {response.status_code}")
            print(f"Error: {response.text}")
            return {"status": "FAIL", "error": response.text}
            
    except Exception as e:
        print(f"\n✗ Test failed - Exception: {str(e)}")
        return {"status": "ERROR", "error": str(e)}

def generate_markdown_report(results):
    """Generate a markdown report from test results."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    report = f"""# Prior Dose Module - Core Test Results
Generated: {timestamp}

## Test Summary
Total Tests: {len(results)}
Passed: {sum(1 for r in results if r['status'] == 'PASS')}
Failed: {sum(1 for r in results if r['status'] != 'PASS')}

---

"""
    
    for result in results:
        report += f"## {result['name']}\n\n"
        report += f"**Status:** {result['status']}\n\n"
        
        if result['status'] == 'PASS':
            report += f"**Configuration:**\n"
            report += f"- Physician: {result['config']['physician']}\n"
            report += f"- Physicist: {result['config']['physicist']}\n"
            report += f"- Current: {result['config']['current_site']} - {result['config']['current_dose']} Gy / {result['config']['current_fractions']} fx\n"
            report += f"- Prior treatments: {result['config']['num_prior']}\n"
            report += f"- Dose calc method: {result['config']['dose_calc_method']}\n\n"
            
            report += f"**Generated Writeup:**\n```\n{result['writeup']}\n```\n\n"
        else:
            report += f"**Error:** {result.get('error', 'Unknown error')}\n\n"
        
        report += "---\n\n"
    
    # Save report
    filename = f"prior_dose_core_test_results.md"
    with open(filename, 'w') as f:
        f.write(report)
    
    print(f"\n📄 Report saved to: {filename}")
    return filename

def main():
    """Run all core test cases."""
    print("\n" + "="*80)
    print("PRIOR DOSE MODULE - CORE TEST SUITE")
    print("="*80)
    print("\nTesting against:", BASE_URL)
    
    results = []
    
    # =========================================================================
    # TEST 1: Single Prior Treatment - NO Overlap (Basic Case)
    # =========================================================================
    test1_payload = create_payload(
        physician="Galvan",
        physicist="Kirby",
        current_site="lung",
        current_dose=50.0,
        current_fractions=25,
        prior_treatments=[{
            "site": "breast",
            "custom_site": "",
            "dose": 50.4,
            "fractions": 28,
            "month": "March",
            "year": 2020,
            "spine_location": "",
            "has_overlap": False,
            "dicoms_unavailable": False
        }],
        dose_calc_method="EQD2 (Equivalent Dose in 2 Gy fractions)"
    )
    
    result1 = run_test("Single Prior Treatment - NO Overlap", test1_payload)
    results.append({
        "name": "Test 1: Single Prior - NO Overlap",
        "status": result1["status"],
        "writeup": result1.get("writeup", ""),
        "error": result1.get("error", ""),
        "config": {
            "physician": "Galvan",
            "physicist": "Kirby",
            "current_site": "lung",
            "current_dose": 50.0,
            "current_fractions": 25,
            "num_prior": 1,
            "dose_calc_method": "EQD2"
        }
    })
    
    # =========================================================================
    # TEST 2: Single Prior Treatment - WITH Overlap (Most Common Clinical Case)
    # =========================================================================
    test2_payload = create_payload(
        physician="Galvan",
        physicist="Kirby",
        current_site="lung",
        current_dose=50.0,
        current_fractions=25,
        prior_treatments=[{
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
        dose_calc_method="EQD2 (Equivalent Dose in 2 Gy fractions)"
    )
    
    result2 = run_test("Single Prior Treatment - WITH Overlap", test2_payload)
    results.append({
        "name": "Test 2: Single Prior - WITH Overlap",
        "status": result2["status"],
        "writeup": result2.get("writeup", ""),
        "error": result2.get("error", ""),
        "config": {
            "physician": "Galvan",
            "physicist": "Kirby",
            "current_site": "lung",
            "current_dose": 50.0,
            "current_fractions": 25,
            "num_prior": 1,
            "dose_calc_method": "EQD2"
        }
    })
    
    # =========================================================================
    # TEST 3: Multiple Prior Treatments - Mixed Overlap (Complex Case)
    # =========================================================================
    test3_payload = create_payload(
        physician="Galvan",
        physicist="Kirby",
        current_site="spine",
        current_dose=24.0,
        current_fractions=3,
        prior_treatments=[
            {
                "site": "thorax",
                "custom_site": "",
                "dose": 50.4,
                "fractions": 28,
                "month": "March",
                "year": 2019,
                "spine_location": "",
                "has_overlap": True,
                "dicoms_unavailable": False
            },
            {
                "site": "abdomen",
                "custom_site": "",
                "dose": 45.0,
                "fractions": 25,
                "month": "June",
                "year": 2021,
                "spine_location": "",
                "has_overlap": False,
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
        dose_calc_method="EQD2 (Equivalent Dose in 2 Gy fractions)"
    )
    
    result3 = run_test("Multiple Prior Treatments - Mixed Overlap", test3_payload)
    results.append({
        "name": "Test 3: Multiple Prior - Mixed Overlap",
        "status": result3["status"],
        "writeup": result3.get("writeup", ""),
        "error": result3.get("error", ""),
        "config": {
            "physician": "Galvan",
            "physicist": "Kirby",
            "current_site": "spine",
            "current_dose": 24.0,
            "current_fractions": 3,
            "num_prior": 3,
            "dose_calc_method": "EQD2"
        }
    })
    
    # Generate markdown report
    print("\n" + "="*80)
    print("GENERATING REPORT")
    print("="*80)
    generate_markdown_report(results)
    
    # Summary
    passed = sum(1 for r in results if r['status'] == 'PASS')
    total = len(results)
    
    print("\n" + "="*80)
    print(f"FINAL RESULTS: {passed}/{total} tests passed")
    print("="*80)
    
    if passed == total:
        print("\n✓ All core tests passed! Prior Dose module is working correctly.")
    else:
        print(f"\n✗ {total - passed} test(s) failed. Review the report for details.")

if __name__ == "__main__":
    main()

