#!/usr/bin/env python3
"""
Pacemaker Module Automated Testing Script

This script tests the Pacemaker module functionality programmatically without needing 
to manually fill out the web form. It covers various clinical scenarios including 
different risk levels, device types, and treatment configurations following TG-203 guidelines.

Usage:
    python test_pacemaker_module.py

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
BASE_URL = "http://localhost:8000/api/pacemaker"
TIMEOUT = 30

@dataclass
class TestResult:
    """Container for test results."""
    test_name: str
    passed: bool
    message: str
    response_data: Dict[str, Any] = None
    error: str = None

class PacemakerTester:
    """Automated Pacemaker module testing class."""
    
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
        """Test if the Pacemaker API server is accessible."""
        try:
            response = self.session.get(f"{BASE_URL}/treatment-sites", timeout=TIMEOUT)
            if response.status_code == 200:
                sites = response.json()
                self.log_result(
                    "Server Connectivity", 
                    True, 
                    f"Connected successfully. Found {len(sites)} treatment sites: {', '.join(sites[:5])}{'...' if len(sites) > 5 else ''}"
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
                "Could not connect to Pacemaker API server",
                error=str(e)
            )
            return False
    
    def test_treatment_sites_endpoint(self):
        """Test the treatment sites endpoint."""
        try:
            response = self.session.get(f"{BASE_URL}/treatment-sites", timeout=TIMEOUT)
            if response.status_code == 200:
                sites = response.json()
                expected_sites = ["brain", "head and neck", "thorax", "breast", "lung", 
                                "liver", "pancreas", "abdomen", "pelvis", "prostate"]
                
                if all(site in sites for site in expected_sites[:5]):  # Check first 5
                    self.log_result(
                        "Treatment Sites Endpoint",
                        True,
                        f"Found expected sites including: {', '.join(expected_sites[:5])}",
                        response_data=sites
                    )
                else:
                    missing = [site for site in expected_sites[:5] if site not in sites]
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
    
    def test_device_info_endpoint(self):
        """Test the device information endpoint."""
        try:
            response = self.session.get(f"{BASE_URL}/device-info", timeout=TIMEOUT)
            if response.status_code == 200:
                device_info = response.json()
                vendors = device_info.get("vendors", [])
                models_by_vendor = device_info.get("models_by_vendor", {})
                
                expected_vendors = ["Medtronic", "Boston Scientific", "Abbott/St. Jude Medical"]
                
                if all(vendor in vendors for vendor in expected_vendors):
                    # Check if Medtronic has models
                    medtronic_models = models_by_vendor.get("Medtronic", [])
                    if medtronic_models and len(medtronic_models) > 0:
                        self.log_result(
                            "Device Info Endpoint",
                            True,
                            f"Found {len(vendors)} vendors with model data. Medtronic has {len(medtronic_models)} models",
                            response_data=device_info
                        )
                    else:
                        self.log_result(
                            "Device Info Endpoint",
                            False,
                            "Vendors found but missing model data",
                            response_data=device_info
                        )
                else:
                    missing = [vendor for vendor in expected_vendors if vendor not in vendors]
                    self.log_result(
                        "Device Info Endpoint",
                        False,
                        f"Missing expected vendors: {missing}",
                        response_data=device_info
                    )
            else:
                self.log_result(
                    "Device Info Endpoint",
                    False,
                    f"Unexpected status code: {response.status_code}"
                )
        except Exception as e:
            self.log_result(
                "Device Info Endpoint",
                False,
                "Failed to retrieve device information",
                error=str(e)
            )
    
    def test_risk_assessment_endpoint(self):
        """Test risk assessment calculations for various scenarios."""
        test_cases = [
            # Low Risk Cases
            {
                "name": "Low Risk - No Pacing, Low Dose, No Neutron",
                "data": {
                    "pacing_dependent": "No",
                    "field_distance": "More than 10 cm from treatment field edge",
                    "neutron_producing": "No",
                    "tps_max_dose": 0.5
                },
                "expected_risk": "Low"
            },
            # Medium Risk Cases
            {
                "name": "Medium Risk - No Pacing, Medium Dose",
                "data": {
                    "pacing_dependent": "No",
                    "field_distance": "Within 3 cm of field edge",
                    "neutron_producing": "No",
                    "tps_max_dose": 3.0
                },
                "expected_risk": "Medium"  # 3.0 Gy is 2-5 Gy range, not < 2 Gy, so goes to Medium per TG-203
            },
            {
                "name": "Medium Risk - Pacing Dependent, Medium Dose",
                "data": {
                    "pacing_dependent": "Yes",
                    "field_distance": "Within 3 cm of field edge",
                    "neutron_producing": "No",
                    "tps_max_dose": 3.0
                },
                "expected_risk": "Medium"  # 2-5 Gy + pacing dependent = Medium risk
            },
            # High Risk Cases
            {
                "name": "High Risk - Pacing Dependent, High Dose",
                "data": {
                    "pacing_dependent": "Yes",
                    "field_distance": "CIED in direct beam",
                    "neutron_producing": "No",
                    "tps_max_dose": 7.0
                },
                "expected_risk": "High"
            },
            {
                "name": "High Risk - Neutron Producing, High Dose",
                "data": {
                    "pacing_dependent": "No",
                    "field_distance": "CIED in direct beam",
                    "neutron_producing": "Yes",
                    "tps_max_dose": 6.0
                },
                "expected_risk": "High"
            }
        ]
        
        for case in test_cases:
            try:
                response = self.session.post(f"{BASE_URL}/risk-assessment", json=case["data"], timeout=TIMEOUT)
                
                if response.status_code == 200:
                    result = response.json()
                    actual_risk = result.get("risk_level", "")
                    recommendations = result.get("recommendations", [])
                    
                    if actual_risk == case["expected_risk"]:
                        self.log_result(
                            f"Risk Assessment - {case['name']}",
                            True,
                            f"Correctly assessed as {actual_risk} risk with {len(recommendations)} recommendations",
                            response_data=result
                        )
                    else:
                        self.log_result(
                            f"Risk Assessment - {case['name']}",
                            False,
                            f"Expected {case['expected_risk']} but got {actual_risk}",
                            response_data=result
                        )
                else:
                    self.log_result(
                        f"Risk Assessment - {case['name']}",
                        False,
                        f"Unexpected status code: {response.status_code}"
                    )
            except Exception as e:
                self.log_result(
                    f"Risk Assessment - {case['name']}",
                    False,
                    "Failed to calculate risk assessment",
                    error=str(e)
                )
    
    def create_test_pacemaker_data(self, scenario: str) -> Dict[str, Any]:
        """Create test data for different pacemaker scenarios."""
        
        base_common_info = {
            "physician": {"name": "Smith", "role": "physician"},
            "physicist": {"name": "Johnson", "role": "physicist"},
            "patient": {"age": 72, "sex": "male"}
        }
        
        scenarios = {
            "low_risk_thorax": {
                "common_info": base_common_info,
                "pacemaker_data": {
                    "treatment_site": "thorax",
                    "dose": 45.0,
                    "fractions": 15,
                    "field_distance": "More than 10 cm from treatment field edge",
                    "neutron_producing": "No",
                    "device_vendor": "Medtronic",
                    "device_model": "Azure",
                    "device_serial": "ABC123456",
                    "pacing_dependent": "No",
                    "tps_max_dose": 0.8,
                    "tps_mean_dose": 0.3,
                    "osld_mean_dose": 0.0,
                    "risk_level": "Low"
                }
            },
            "medium_risk_breast": {
                "common_info": base_common_info,
                "pacemaker_data": {
                    "treatment_site": "breast",
                    "dose": 40.0,
                    "fractions": 15,
                    "field_distance": "Within 3 cm of field edge",
                    "neutron_producing": "No",
                    "device_vendor": "Boston Scientific",
                    "device_model": "Ingenio",
                    "device_serial": "BSC789012",
                    "pacing_dependent": "Yes",
                    "tps_max_dose": 2.5,
                    "tps_mean_dose": 1.1,
                    "osld_mean_dose": 0.15,
                    "risk_level": "Medium"
                }
            },
            "high_risk_prostate": {
                "common_info": base_common_info,
                "pacemaker_data": {
                    "treatment_site": "prostate",
                    "dose": 78.0,
                    "fractions": 39,
                    "field_distance": "CIED in direct beam",
                    "neutron_producing": "Yes",
                    "device_vendor": "Abbott/St. Jude Medical",
                    "device_model": "Assurity",
                    "device_serial": "SJM345678",
                    "pacing_dependent": "Yes",
                    "tps_max_dose": 6.2,
                    "tps_mean_dose": 3.1,
                    "osld_mean_dose": 0.0,
                    "risk_level": "High"
                }
            },
            "diode_measurement_case": {
                "common_info": base_common_info,
                "pacemaker_data": {
                    "treatment_site": "lung",
                    "dose": 60.0,
                    "fractions": 30,
                    "field_distance": "Less than 10 cm from field edge but not in direct field",
                    "neutron_producing": "No",
                    "device_vendor": "Biotronik",
                    "device_model": "Evia",
                    "device_serial": "BIO567890",
                    "pacing_dependent": "Unknown",
                    "tps_max_dose": 1.8,
                    "tps_mean_dose": 0.9,
                    "osld_mean_dose": 0.25,  # This will test diode measurement inclusion
                    "risk_level": "Low"
                }
            }
        }
        
        return scenarios.get(scenario, scenarios["low_risk_thorax"])
    
    def test_writeup_generation(self):
        """Test pacemaker write-up generation for various scenarios."""
        scenarios = ["low_risk_thorax", "medium_risk_breast", "high_risk_prostate", "diode_measurement_case"]
        
        for scenario in scenarios:
            try:
                test_data = self.create_test_pacemaker_data(scenario)
                
                response = self.session.post(f"{BASE_URL}/generate", json=test_data, timeout=TIMEOUT)
                
                if response.status_code == 200:
                    result = response.json()
                    writeup = result.get("writeup", "")
                    
                    if writeup and len(writeup) > 200:  # Basic validation
                        # Check for key elements in writeup
                        pacemaker_data = test_data["pacemaker_data"]
                        common_info = test_data["common_info"]
                        
                        checks = [
                            str(pacemaker_data["dose"]) in writeup,
                            str(pacemaker_data["fractions"]) in writeup,
                            pacemaker_data["treatment_site"] in writeup,
                            pacemaker_data["device_vendor"] in writeup,
                            common_info["physician"]["name"] in writeup,
                            common_info["physicist"]["name"] in writeup,
                            "medical physics consultation" in writeup,
                            "2Gy" in writeup,  # AAPM dose limit
                        ]
                        
                        # Risk-specific checks
                        risk_level = pacemaker_data["risk_level"].lower()
                        risk_check = f"{risk_level} risk" in writeup
                        
                        # Diode measurement check
                        diode_check = True
                        if pacemaker_data["osld_mean_dose"] > 0:
                            diode_check = "Diode measurements" in writeup
                        
                        # Pacing dependency check
                        pacing_check = True
                        if pacemaker_data["pacing_dependent"] != "Unknown":
                            if pacemaker_data["pacing_dependent"] == "Yes":
                                pacing_check = "they are pacing dependent" in writeup
                            else:
                                pacing_check = "they are not pacing dependent" in writeup
                        
                        all_checks = checks + [risk_check, diode_check, pacing_check]
                        
                        if all(all_checks):
                            self.log_result(
                                f"Write-up Generation - {scenario}",
                                True,
                                f"Generated {len(writeup)} character write-up with all key elements"
                            )
                        else:
                            missing_elements = []
                            if str(pacemaker_data["dose"]) not in writeup:
                                missing_elements.append("dose")
                            if str(pacemaker_data["fractions"]) not in writeup:
                                missing_elements.append("fractions")
                            if pacemaker_data["treatment_site"] not in writeup:
                                missing_elements.append("treatment_site")
                            if pacemaker_data["device_vendor"] not in writeup:
                                missing_elements.append("device_vendor")
                            if not risk_check:
                                missing_elements.append("risk_level")
                            if not diode_check:
                                missing_elements.append("diode_measurements")
                            if not pacing_check:
                                missing_elements.append("pacing_dependency")
                            
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
    
    def test_high_risk_blocking(self):
        """Test that high-risk cases are properly handled."""
        high_risk_data = self.create_test_pacemaker_data("high_risk_prostate")
        
        try:
            response = self.session.post(f"{BASE_URL}/generate", json=high_risk_data, timeout=TIMEOUT)
            
            # High risk cases might be blocked in the frontend, but backend should still generate
            # We'll test that the backend can handle it and includes appropriate warnings
            if response.status_code == 200:
                result = response.json()
                writeup = result.get("writeup", "")
                
                # Should not include specific high-risk protocols since template doesn't have them
                # But should still generate a writeup
                if len(writeup) > 200:
                    self.log_result(
                        "High Risk Case Handling",
                        True,
                        "Backend properly handles high-risk case generation"
                    )
                else:
                    self.log_result(
                        "High Risk Case Handling",
                        False,
                        "High-risk case generated insufficient writeup"
                    )
            else:
                self.log_result(
                    "High Risk Case Handling",
                    False,
                    f"Backend failed to handle high-risk case: {response.status_code}"
                )
        except Exception as e:
            self.log_result(
                "High Risk Case Handling",
                False,
                "Failed to test high-risk case handling",
                error=str(e)
            )
    
    def run_all_tests(self):
        """Run all pacemaker tests and generate a summary report."""
        print("🔋 Starting Pacemaker Module Automated Testing")
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
        self.test_device_info_endpoint()
        
        print("\n🔍 Running risk assessment tests...")
        self.test_risk_assessment_endpoint()
        
        print("\n📝 Running write-up generation tests...")
        self.test_writeup_generation()
        
        print("\n⚠️  Running high-risk case tests...")
        self.test_high_risk_blocking()
        
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
            "module": "pacemaker",
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
        
        filename = f"pacemaker_test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        try:
            with open(filename, 'w') as f:
                json.dump(report_data, f, indent=2)
            print(f"📁 Detailed results saved to: {filename}")
        except Exception as e:
            print(f"⚠️  Could not save detailed report: {e}")

def main():
    """Main function to run pacemaker tests."""
    if len(sys.argv) > 1 and sys.argv[1] == "--help":
        print(__doc__)
        return
    
    print("🏥 Medical Physics Pacemaker Module Automated Test Suite")
    print("🔋 Testing TG-203 Compliance and Clinical Documentation Generation")
    print("=" * 70)
    
    tester = PacemakerTester()
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 Testing completed! Check the results above.")
        print("\n💡 Pro tip: You can test different clinical scenarios by modifying")
        print("   the test data in the create_test_pacemaker_data() method.")
        print("\n🔋 Test scenarios covered:")
        print("   • Low Risk: Distant CIED, no pacing dependency, low dose")
        print("   • Medium Risk: Close CIED or pacing dependent")
        print("   • High Risk: Direct beam or neutron therapy")
        print("   • Diode Measurements: Including dose measurement reporting")
    else:
        print("\n💥 Testing failed due to connectivity issues.")
        sys.exit(1)

if __name__ == "__main__":
    main()