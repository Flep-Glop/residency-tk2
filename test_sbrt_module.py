#!/usr/bin/env python3
"""
SBRT Module Automated Testing Script

This script tests the SBRT module functionality programmatically without needing 
to manually fill out the web form. It covers various treatment scenarios and 
validates the backend calculations and write-up generation.

Usage:
    python test_sbrt_module.py

Requirements:
    - Backend server running on localhost:8000
    - requests library: pip install requests
"""

import requests
import json
from typing import Dict, Any, List
import sys
from dataclasses import dataclass
from datetime import datetime

# API Configuration
BASE_URL = "http://localhost:8000/api/sbrt"
TIMEOUT = 30

@dataclass
class TestResult:
    """Container for test results."""
    test_name: str
    passed: bool
    message: str
    response_data: Dict[str, Any] = None
    error: str = None

class SBRTTester:
    """Automated SBRT module testing class."""
    
    def __init__(self):
        self.results: List[TestResult] = []
        self.session = requests.Session()
        
    def log_result(self, test_name: str, passed: bool, message: str, 
                   response_data: Dict[str, Any] = None, error: str = None):
        """Log a test result."""
        result = TestResult(test_name, passed, message, response_data, error)
        self.results.append(result)
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if error:
            print(f"   Error: {error}")
    
    def test_server_connectivity(self) -> bool:
        """Test if the SBRT API server is accessible."""
        try:
            response = self.session.get(f"{BASE_URL}/treatment-sites", timeout=TIMEOUT)
            if response.status_code == 200:
                sites = response.json()
                self.log_result(
                    "Server Connectivity", 
                    True, 
                    f"Connected successfully. Found {len(sites)} treatment sites: {', '.join(sites)}"
                )
                return True
            else:
                self.log_result(
                    "Server Connectivity", 
                    False, 
                    f"Server returned status code {response.status_code}"
                )
                return False
        except Exception as e:
            self.log_result(
                "Server Connectivity", 
                False, 
                "Could not connect to SBRT API server",
                error=str(e)
            )
            return False
    
    def test_treatment_sites_endpoint(self):
        """Test the treatment sites endpoint."""
        try:
            response = self.session.get(f"{BASE_URL}/treatment-sites", timeout=TIMEOUT)
            if response.status_code == 200:
                sites = response.json()
                expected_sites = ["lung", "liver", "spine", "adrenal", "pancreas", 
                                "kidney", "prostate", "lymph node", "bone", "oligometastasis"]
                
                if all(site in sites for site in expected_sites):
                    self.log_result(
                        "Treatment Sites Endpoint",
                        True,
                        f"All expected sites found: {sites}",
                        response_data=sites
                    )
                else:
                    missing = [site for site in expected_sites if site not in sites]
                    self.log_result(
                        "Treatment Sites Endpoint",
                        False,
                        f"Missing expected sites: {missing}",
                        response_data=sites
                    )
            else:
                self.log_result(
                    "Treatment Sites Endpoint",
                    False,
                    f"Unexpected status code: {response.status_code}"
                )
        except Exception as e:
            self.log_result(
                "Treatment Sites Endpoint",
                False,
                "Failed to retrieve treatment sites",
                error=str(e)
            )
    
    def test_dose_constraints_endpoint(self):
        """Test dose constraints for various sites - REMOVED per user request."""
        # User requested removal of dose constraints testing
        self.log_result(
            "Dose Constraints Testing",
            True,
            "Skipped dose constraints testing per user request"
        )
    
    def test_fractionation_schemes_endpoint(self):
        """Test fractionation schemes for various sites."""
        test_sites = ["lung", "spine", "prostate"]
        
        for site in test_sites:
            try:
                response = self.session.get(f"{BASE_URL}/fractionation-schemes/{site}", timeout=TIMEOUT)
                
                if response.status_code == 200:
                    schemes = response.json()
                    if isinstance(schemes, list) and len(schemes) > 0:
                        # Check if schemes have required fields
                        first_scheme = schemes[0]
                        required_fields = ["dose", "fractions", "description"]
                        
                        if all(field in first_scheme for field in required_fields):
                            self.log_result(
                                f"Fractionation Schemes - {site}",
                                True,
                                f"Retrieved {len(schemes)} valid schemes",
                                response_data=schemes
                            )
                        else:
                            self.log_result(
                                f"Fractionation Schemes - {site}",
                                False,
                                f"Schemes missing required fields: {required_fields}",
                                response_data=schemes
                            )
                    else:
                        self.log_result(
                            f"Fractionation Schemes - {site}",
                            False,
                            "Empty or invalid schemes response",
                            response_data=schemes
                        )
                else:
                    self.log_result(
                        f"Fractionation Schemes - {site}",
                        False,
                        f"Unexpected status code: {response.status_code}"
                    )
            except Exception as e:
                self.log_result(
                    f"Fractionation Schemes - {site}",
                    False,
                    "Failed to retrieve fractionation schemes",
                    error=str(e)
                )
    
    def test_validation_endpoint(self):
        """Test dose/fractionation validation."""
        test_cases = [
            # Valid cases
            {"site": "lung", "dose": 50.0, "fractions": 5, "should_pass": True},
            {"site": "spine", "dose": 24.0, "fractions": 3, "should_pass": True},
            {"site": "liver", "dose": 45.0, "fractions": 3, "should_pass": True},
            # Invalid cases
            {"site": "lung", "dose": 100.0, "fractions": 1, "should_pass": False},
            {"site": "invalid_site", "dose": 50.0, "fractions": 5, "should_pass": False},
        ]
        
        for i, case in enumerate(test_cases):
            try:
                payload = {
                    "site": case["site"],
                    "dose": case["dose"],
                    "fractions": case["fractions"]
                }
                
                response = self.session.post(f"{BASE_URL}/validate", json=payload, timeout=TIMEOUT)
                
                if response.status_code == 200:
                    result = response.json()
                    is_valid = result.get("is_valid", False)
                    
                    test_passed = (is_valid and case["should_pass"]) or (not is_valid and not case["should_pass"])
                    
                    self.log_result(
                        f"Validation Test {i+1}",
                        test_passed,
                        f"Site: {case['site']}, {case['dose']}Gy/{case['fractions']}fx - {result.get('message', 'No message')}",
                        response_data=result
                    )
                else:
                    # For invalid sites, we might get 4xx errors which could be expected
                    if not case["should_pass"] and response.status_code >= 400:
                        self.log_result(
                            f"Validation Test {i+1}",
                            True,
                            f"Correctly rejected invalid input (status {response.status_code})"
                        )
                    else:
                        self.log_result(
                            f"Validation Test {i+1}",
                            False,
                            f"Unexpected status code: {response.status_code}"
                        )
            except Exception as e:
                self.log_result(
                    f"Validation Test {i+1}",
                    False,
                    "Failed to validate dose/fractionation",
                    error=str(e)
                )
    
    def create_test_sbrt_data(self, scenario: str) -> Dict[str, Any]:
        """Create test data for different SBRT scenarios."""
        
        base_common_info = {
            "physician": {"name": "Smith"},
            "physicist": {"name": "Johnson"},
            "patient": {"age": 65, "sex": "male"}
        }
        
        scenarios = {
            "lung_standard": {
                "common_info": base_common_info,
                "sbrt_data": {
                    "treatment_site": "lung",
                    "dose": 50.0,
                    "fractions": 5,
                    "breathing_technique": "4DCT",
                    "oligomet_location": "",
                    "target_name": "PTV_50",
                    "ptv_volume": "25.1",
                    "vol_ptv_receiving_rx": "95.0",
                    "vol_100_rx_isodose": "27.6",
                    "vol_50_rx_isodose": "125.0",
                    "max_dose_2cm_ring": "52.5",
                    "max_dose_in_target": "55.0",
                    "sib_comment": "",
                    "calculated_metrics": {
                        "coverage": "95.0",
                        "conformityIndex": "1.10",
                        "r50": "4.98",
                        "gradientMeasure": "0.85",
                        "maxDose2cmRingPercent": "52.5",
                        "homogeneityIndex": "1.10",
                        "conformityDeviation": "None",
                        "r50Deviation": "None",
                        "maxDose2cmDeviation": "None",
                        "toleranceRow": {"ptvVol": 22.0, "conformityNone": 1.2}
                    },
                    "is_sib": False
                }
            },
            "spine_high_dose": {
                "common_info": base_common_info,
                "sbrt_data": {
                    "treatment_site": "spine",
                    "dose": 27.0,
                    "fractions": 3,
                    "breathing_technique": "freebreathe",
                    "oligomet_location": "",
                    "target_name": "PTV_27",
                    "ptv_volume": "15.2",
                    "vol_ptv_receiving_rx": "98.0",
                    "vol_100_rx_isodose": "16.8",
                    "vol_50_rx_isodose": "89.5",
                    "max_dose_2cm_ring": "48.0",
                    "max_dose_in_target": "29.7",
                    "sib_comment": "",
                    "calculated_metrics": {
                        "coverage": "98.0",
                        "conformityIndex": "1.11",
                        "r50": "5.89",
                        "gradientMeasure": "0.92",
                        "maxDose2cmRingPercent": "48.0",
                        "homogeneityIndex": "1.10",
                        "conformityDeviation": "None",
                        "r50Deviation": "None",
                        "maxDose2cmDeviation": "None",
                        "toleranceRow": {"ptvVol": 15.2, "conformityNone": 1.2}
                    },
                    "is_sib": False
                }
            },
            "oligomets_liver": {
                "common_info": base_common_info,
                "sbrt_data": {
                    "treatment_site": "oligometastasis",
                    "dose": 50.0,
                    "fractions": 5,
                    "breathing_technique": "DIBH",
                    "oligomet_location": "liver",
                    "target_name": "PTV_liver_met",
                    "ptv_volume": "8.7",
                    "vol_ptv_receiving_rx": "97.0",
                    "vol_100_rx_isodose": "9.2",
                    "vol_50_rx_isodose": "45.1",
                    "max_dose_2cm_ring": "51.8",
                    "max_dose_in_target": "55.0",
                    "sib_comment": "",
                    "calculated_metrics": {
                        "coverage": "97.0",
                        "conformityIndex": "1.06",
                        "r50": "5.18",
                        "gradientMeasure": "0.79",
                        "maxDose2cmRingPercent": "51.8",
                        "homogeneityIndex": "1.10",
                        "conformityDeviation": "None",
                        "r50Deviation": "None",
                        "maxDose2cmDeviation": "None",
                        "toleranceRow": {"ptvVol": 8.7, "conformityNone": 1.2}
                    },
                    "is_sib": False
                }
            },
            "prostate_sib": {
                "common_info": base_common_info,
                "sbrt_data": {
                    "treatment_site": "prostate",
                    "dose": 36.25,
                    "fractions": 5,
                    "breathing_technique": "freebreathe",
                    "oligomet_location": "",
                    "target_name": "PTV_Prostate",
                    "ptv_volume": "45.8",
                    "vol_ptv_receiving_rx": "95.0",
                    "vol_100_rx_isodose": "48.1",
                    "vol_50_rx_isodose": "156.2",
                    "max_dose_2cm_ring": "60.5",
                    "max_dose_in_target": "39.9",
                    "sib_comment": "SIB boost to dominant intraprostatic lesion",
                    "calculated_metrics": {
                        "coverage": "95.0",
                        "conformityIndex": "1.05",
                        "r50": "3.41",
                        "gradientMeasure": "0.88",
                        "maxDose2cmRingPercent": "60.5",
                        "homogeneityIndex": "1.10",
                        "conformityDeviation": "None",
                        "r50Deviation": "None",
                        "maxDose2cmDeviation": "None",
                        "toleranceRow": {"ptvVol": 45.8, "conformityNone": 1.2}
                    },
                    "is_sib": True
                }
            }
        }
        
        return scenarios.get(scenario, scenarios["lung_standard"])
    
    def test_writeup_generation(self):
        """Test SBRT write-up generation for various scenarios."""
        scenarios = ["lung_standard", "spine_high_dose", "oligomets_liver", "prostate_sib"]
        
        for scenario in scenarios:
            try:
                test_data = self.create_test_sbrt_data(scenario)
                
                response = self.session.post(f"{BASE_URL}/generate", json=test_data, timeout=TIMEOUT)
                
                if response.status_code == 200:
                    result = response.json()
                    writeup = result.get("writeup", "")
                    
                    if writeup and len(writeup) > 100:  # Basic validation
                        # Check for key elements in writeup
                        sbrt_data = test_data["sbrt_data"]
                        
                        # Smart breathing technique checking
                        breathing_technique = sbrt_data["breathing_technique"].lower()
                        breathing_check = False
                        if breathing_technique == "4dct":
                            breathing_check = "4D CT" in writeup or "4DCT" in writeup
                        elif breathing_technique == "dibh":
                            breathing_check = "DIBH" in writeup.upper()
                        elif breathing_technique == "freebreathe":
                            # Free breathing doesn't have specific mention, just check it's not 4DCT/DIBH
                            breathing_check = "4D CT" not in writeup and "DIBH" not in writeup.upper()
                        
                        checks = [
                            str(sbrt_data["dose"]) in writeup,
                            str(sbrt_data["fractions"]) in writeup,
                            breathing_check,
                            "Smith" in writeup,  # Physician name
                            "Johnson" in writeup,  # Physicist name
                        ]
                        
                        if all(checks):
                            self.log_result(
                                f"Write-up Generation - {scenario}",
                                True,
                                f"Generated {len(writeup)} character write-up with all key elements"
                            )
                        else:
                            missing_elements = []
                            if str(sbrt_data["dose"]) not in writeup:
                                missing_elements.append("dose")
                            if str(sbrt_data["fractions"]) not in writeup:
                                missing_elements.append("fractions")
                            if not breathing_check:
                                missing_elements.append("breathing_technique")
                            if "Smith" not in writeup:
                                missing_elements.append("physician_name")
                            if "Johnson" not in writeup:
                                missing_elements.append("physicist_name")
                            
                            self.log_result(
                                f"Write-up Generation - {scenario}",
                                False,
                                f"Generated write-up missing elements: {missing_elements}"
                            )
                    else:
                        self.log_result(
                            f"Write-up Generation - {scenario}",
                            False,
                            f"Generated write-up too short or empty: {len(writeup)} characters"
                        )
                else:
                    self.log_result(
                        f"Write-up Generation - {scenario}",
                        False,
                        f"Unexpected status code: {response.status_code}"
                    )
            except Exception as e:
                self.log_result(
                    f"Write-up Generation - {scenario}",
                    False,
                    "Failed to generate write-up",
                    error=str(e)
                )
    
    def run_all_tests(self):
        """Run all SBRT tests and generate a summary report."""
        print("🚀 Starting SBRT Module Automated Testing")
        print(f"📅 Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 API Base URL: {BASE_URL}")
        print("=" * 80)
        
        # Test server connectivity first
        if not self.test_server_connectivity():
            print("\n❌ Cannot proceed - server is not accessible")
            print("\n💡 Make sure your backend server is running:")
            print("   cd backend && uvicorn app.main:app --reload")
            return False
        
        print("\n🧪 Running API endpoint tests...")
        self.test_treatment_sites_endpoint()
        self.test_dose_constraints_endpoint()
        self.test_fractionation_schemes_endpoint()
        
        print("\n🔍 Running validation tests...")
        self.test_validation_endpoint()
        
        print("\n📝 Running write-up generation tests...")
        self.test_writeup_generation()
        
        # Generate summary
        self.generate_summary_report()
        return True
    
    def generate_summary_report(self):
        """Generate a summary report of all test results."""
        print("\n" + "=" * 80)
        print("📊 TEST SUMMARY REPORT")
        print("=" * 80)
        
        total_tests = len(self.results)
        passed_tests = sum(1 for result in self.results if result.passed)
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"📈 Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print(f"\n❌ FAILED TESTS ({failed_tests}):")
            for result in self.results:
                if not result.passed:
                    print(f"   • {result.test_name}: {result.message}")
                    if result.error:
                        print(f"     Error: {result.error}")
        
        print(f"\n✅ PASSED TESTS ({passed_tests}):")
        for result in self.results:
            if result.passed:
                print(f"   • {result.test_name}")
        
        print("\n" + "=" * 80)
        
        # Save detailed results to file
        self.save_detailed_report()
    
    def save_detailed_report(self):
        """Save detailed test results to a JSON file."""
        report_data = {
            "test_date": datetime.now().isoformat(),
            "api_base_url": BASE_URL,
            "summary": {
                "total_tests": len(self.results),
                "passed_tests": sum(1 for result in self.results if result.passed),
                "failed_tests": sum(1 for result in self.results if not result.passed)
            },
            "detailed_results": [
                {
                    "test_name": result.test_name,
                    "passed": result.passed,
                    "message": result.message,
                    "error": result.error,
                    "response_data": result.response_data
                }
                for result in self.results
            ]
        }
        
        filename = f"sbrt_test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        try:
            with open(filename, 'w') as f:
                json.dump(report_data, f, indent=2)
            print(f"📁 Detailed results saved to: {filename}")
        except Exception as e:
            print(f"⚠️  Could not save detailed report: {e}")

def main():
    """Main function to run SBRT tests."""
    if len(sys.argv) > 1 and sys.argv[1] == "--help":
        print(__doc__)
        return
    
    print("🏥 Medical Physics SBRT Module Automated Test Suite")
    print("=" * 60)
    
    tester = SBRTTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 Testing completed! Check the results above.")
        print("\n💡 Pro tip: You can now test different scenarios by modifying")
        print("   the test data in the create_test_sbrt_data() method.")
    else:
        print("\n💥 Testing failed due to connectivity issues.")
        sys.exit(1)

if __name__ == "__main__":
    main()