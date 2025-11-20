#!/usr/bin/env python3
"""
Quick test script to verify DIBH backend functionality.
Tests both with and without boost.
"""

import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_dibh_without_boost():
    """Test DIBH writeup generation without boost."""
    print("\n" + "="*80)
    print("TEST 1: Left Breast DIBH - No Boost (40 Gy / 15 fx)")
    print("="*80)
    
    payload = {
        "common_info": {
            "physician": {"name": "Galvan", "role": "physician"},
            "physicist": {"name": "Kirby", "role": "physicist"}
        },
        "dibh_data": {
            "treatment_site": "left breast",
            "custom_treatment_site": None,
            "dose": 40,
            "fractions": 15,
            "has_boost": False
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/dibh/generate", json=payload)
        response.raise_for_status()
        result = response.json()
        print("\n✓ Success! Generated writeup:\n")
        print(result['writeup'])
    except Exception as e:
        print(f"\n✗ Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")

def test_dibh_with_boost():
    """Test DIBH writeup generation with boost."""
    print("\n" + "="*80)
    print("TEST 2: Right Breast DIBH - With Boost (50 Gy / 25 fx + 10 Gy / 4 fx)")
    print("="*80)
    
    payload = {
        "common_info": {
            "physician": {"name": "Newman", "role": "physician"},
            "physicist": {"name": "Paschal", "role": "physicist"}
        },
        "dibh_data": {
            "treatment_site": "right breast",
            "custom_treatment_site": None,
            "dose": 50,
            "fractions": 25,
            "has_boost": True,
            "boost_dose": 10,
            "boost_fractions": 4
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/dibh/generate", json=payload)
        response.raise_for_status()
        result = response.json()
        print("\n✓ Success! Generated writeup:\n")
        print(result['writeup'])
    except Exception as e:
        print(f"\n✗ Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")

def test_dibh_custom_site():
    """Test DIBH writeup generation with custom treatment site."""
    print("\n" + "="*80)
    print("TEST 3: Custom Site DIBH - Diaphragm (45 Gy / 15 fx)")
    print("="*80)
    
    payload = {
        "common_info": {
            "physician": {"name": "Ha", "role": "physician"},
            "physicist": {"name": "Bassiri", "role": "physicist"}
        },
        "dibh_data": {
            "treatment_site": "diaphragm",
            "custom_treatment_site": None,
            "dose": 45,
            "fractions": 15,
            "has_boost": False
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/dibh/generate", json=payload)
        response.raise_for_status()
        result = response.json()
        print("\n✓ Success! Generated writeup:\n")
        print(result['writeup'])
    except Exception as e:
        print(f"\n✗ Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")

def test_endpoints():
    """Test DIBH endpoints."""
    print("\n" + "="*80)
    print("TEST 4: Backend Endpoints")
    print("="*80)
    
    try:
        # Test treatment sites endpoint
        response = requests.get(f"{BASE_URL}/dibh/treatment-sites")
        response.raise_for_status()
        print("\n✓ Treatment Sites:")
        print(json.dumps(response.json(), indent=2))
        
        # Test immobilization devices endpoint
        response = requests.get(f"{BASE_URL}/dibh/immobilization-devices")
        response.raise_for_status()
        print("\n✓ Immobilization Devices:")
        print(json.dumps(response.json(), indent=2))
        
        # Test fractionation schemes endpoint
        response = requests.get(f"{BASE_URL}/dibh/fractionation-schemes")
        response.raise_for_status()
        print("\n✓ Fractionation Schemes:")
        print(json.dumps(response.json(), indent=2))
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")

if __name__ == "__main__":
    print("\n" + "="*80)
    print("DIBH BACKEND TEST SUITE")
    print("="*80)
    print("Testing backend at:", BASE_URL)
    
    test_endpoints()
    test_dibh_without_boost()
    test_dibh_with_boost()
    test_dibh_custom_site()
    
    print("\n" + "="*80)
    print("ALL TESTS COMPLETED")
    print("="*80 + "\n")

