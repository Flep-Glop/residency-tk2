#!/usr/bin/env python3
"""
Fusion Lesion Variation Test Script
====================================
Generates fusion write-ups for all possible lesion types with consistent
fusion configurations and saves results to a markdown file for QA review.

Usage:
    python test_fusion_lesions.py
"""

import requests
import json
from typing import List, Dict
import sys

# API Configuration
API_BASE_URL = "http://localhost:8000/api"

# Standardized test inputs
PHYSICIAN_NAME = "Galvan"
PHYSICIST_NAME = "Kirby"

# Standard fusion configuration to test with all lesions
STANDARD_FUSION_CONFIG = {
    "single_mri": {
        "name": "Single_MRI_Rigid",
        "description": "Single MRI with Rigid registration",
        "registrations": [
            {"primary": "CT", "secondary": "MRI", "method": "Rigid"}
        ]
    },
    "mri_pet": {
        "name": "MRI_plus_PET_Deformable",
        "description": "MRI (Rigid) + PET/CT (Deformable)",
        "registrations": [
            {"primary": "CT", "secondary": "MRI", "method": "Rigid"},
            {"primary": "CT", "secondary": "PET/CT", "method": "Deformable"}
        ]
    }
}

# All available lesion types with their anatomical regions
LESION_TYPES = {
    "brain": "brain",
    "brainstem": "brain",
    "oropharynx": "head and neck",
    "orbital": "head and neck",
    "parotid": "head and neck",
    "nasal cavity": "head and neck",
    "larynx": "head and neck",
    "thymus": "thoracic",
    "thorax": "thoracic",
    "lung": "thoracic",
    "breast": "thoracic",
    "diaphragm": "thoracic",
    "rib": "thoracic",
    "liver": "abdominal",
    "renal": "abdominal",
    "prostate": "pelvic",
    "endometrium": "pelvic",
    "groin": "pelvic",
    "pelvis": "pelvic",
}


def create_fusion_request(lesion: str, anatomical_region: str, registrations: List[Dict]) -> Dict:
    """Create a fusion write-up request payload."""
    return {
        "common_info": {
            "physician": {"name": PHYSICIAN_NAME},
            "physicist": {"name": PHYSICIST_NAME}
        },
        "fusion_data": {
            "lesion": lesion,
            "custom_lesion": None,
            "anatomical_region": anatomical_region,
            "registrations": registrations,
            "is_bladder_filling_study": False,
            "immobilization_device": None
        }
    }


def call_fusion_api(request_payload: Dict) -> str:
    """Call the fusion API and return the write-up."""
    try:
        response = requests.post(
            f"{API_BASE_URL}/fusion/generate",
            json=request_payload,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        return response.json()["writeup"]
    except requests.exceptions.RequestException as e:
        return f"ERROR: API call failed - {str(e)}"


def main():
    """Main test execution."""
    print("=" * 80)
    print("FUSION LESION VARIATION TEST")
    print("=" * 80)
    print(f"API Base URL: {API_BASE_URL}")
    print(f"Standardized Inputs:")
    print(f"  Physician: Dr. {PHYSICIAN_NAME}")
    print(f"  Physicist: Dr. {PHYSICIST_NAME}")
    print(f"  Fusion Configs: {len(STANDARD_FUSION_CONFIG)}")
    print(f"  Lesion Types: {len(LESION_TYPES)}")
    print("=" * 80)
    print()
    
    # Check if backend is running
    try:
        response = requests.get(f"{API_BASE_URL.replace('/api', '')}/health", timeout=5)
        print("✓ Backend is running")
    except requests.exceptions.RequestException:
        print("✗ ERROR: Backend is not running!")
        print("  Please start the backend with: ./start.sh")
        sys.exit(1)
    
    output_file = "fusion_lesion_test_results.md"
    
    print(f"\nTotal test combinations: {len(STANDARD_FUSION_CONFIG) * len(LESION_TYPES)}")
    print()
    
    # Open output file
    with open(output_file, 'w') as f:
        # Write header
        f.write("# Fusion Lesion Variation Test Results\n\n")
        f.write(f"**Generated for QA Review**\n\n")
        f.write(f"**Standardized Test Inputs:**\n")
        f.write(f"- Physician: Dr. {PHYSICIAN_NAME}\n")
        f.write(f"- Physicist: Dr. {PHYSICIST_NAME}\n")
        f.write(f"- Fusion Configurations: {', '.join([cfg['name'] for cfg in STANDARD_FUSION_CONFIG.values()])}\n\n")
        f.write("---\n\n")
        
        # Test each fusion configuration with all lesion types
        for config_key, fusion_config in STANDARD_FUSION_CONFIG.items():
            f.write(f"## {fusion_config['name']}\n\n")
            f.write(f"**Fusion Configuration:** {fusion_config['description']}\n\n")
            f.write("---\n\n")
            
            for i, (lesion, anatomical_region) in enumerate(sorted(LESION_TYPES.items()), 1):
                print(f"Testing {fusion_config['name']} with lesion [{i}/{len(LESION_TYPES)}]: {lesion}...")
                
                f.write(f"### {i}. Lesion: {lesion}\n\n")
                f.write(f"**Anatomical Region:** {anatomical_region}\n\n")
                
                request = create_fusion_request(
                    lesion=lesion,
                    anatomical_region=anatomical_region,
                    registrations=fusion_config['registrations']
                )
                writeup = call_fusion_api(request)
                
                f.write(f"**Write-up:**\n\n```\n{writeup}\n```\n\n")
                f.write("---\n\n")
        
        # Test with custom lesion
        f.write("## Custom Lesion Tests\n\n")
        custom_lesions = [
            {"lesion": "Custom", "custom_lesion": "meningioma", "region": "brain"},
            {"lesion": "Custom", "custom_lesion": "pancreatic head", "region": "abdominal"},
            {"lesion": "Custom", "custom_lesion": "cervical spine", "region": "head and neck"},
        ]
        
        for i, custom in enumerate(custom_lesions, 1):
            print(f"Testing custom lesion [{i}/{len(custom_lesions)}]: {custom['custom_lesion']}...")
            
            f.write(f"### {i}. Custom Lesion: {custom['custom_lesion']}\n\n")
            f.write(f"**Anatomical Region:** {custom['region']}\n\n")
            
            request = {
                "common_info": {
                    "physician": {"name": PHYSICIAN_NAME},
                    "physicist": {"name": PHYSICIST_NAME}
                },
                "fusion_data": {
                    "lesion": custom['lesion'],
                    "custom_lesion": custom['custom_lesion'],
                    "anatomical_region": custom['region'],
                    "registrations": STANDARD_FUSION_CONFIG['single_mri']['registrations'],
                    "is_bladder_filling_study": False,
                    "immobilization_device": None
                }
            }
            writeup = call_fusion_api(request)
            
            f.write(f"**Write-up:**\n\n```\n{writeup}\n```\n\n")
            f.write("---\n\n")
        
        # Write summary
        f.write("## Test Summary\n\n")
        f.write(f"- Total combinations tested: {len(STANDARD_FUSION_CONFIG) * len(LESION_TYPES) + len(custom_lesions)}\n")
        f.write(f"- Standard lesion types: {len(LESION_TYPES)}\n")
        f.write(f"- Custom lesion examples: {len(custom_lesions)}\n")
        f.write(f"- Fusion configurations: {len(STANDARD_FUSION_CONFIG)}\n\n")
        f.write(f"**Review Guidelines:**\n")
        f.write(f"1. Verify anatomical region matches lesion location\n")
        f.write(f"2. Check that 'the {lesion}' reads naturally in context\n")
        f.write(f"3. Validate article usage ('a' vs 'an' before anatomical terms)\n")
        f.write(f"4. Ensure custom lesions are properly substituted\n")
        f.write(f"5. Confirm consistent phrasing across similar lesion types\n")
    
    print()
    print("=" * 80)
    print(f"✓ Test complete! Results saved to: {output_file}")
    print("=" * 80)


if __name__ == "__main__":
    main()

