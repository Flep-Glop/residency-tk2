#!/usr/bin/env python3
"""
Fusion Anatomical Region Variation Test Script
===============================================
Generates fusion write-ups for all anatomical regions with consistent
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

# Standard fusion configuration to test with all regions
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

# All available anatomical regions
ANATOMICAL_REGIONS = [
    "brain",
    "head and neck",
    "thoracic",
    "abdominal",
    "pelvic",
    "spinal",
    "extremity",
]


def create_fusion_request(anatomical_region: str, registrations: List[Dict]) -> Dict:
    """Create a fusion write-up request payload."""
    return {
        "common_info": {
            "physician": {"name": PHYSICIAN_NAME},
            "physicist": {"name": PHYSICIST_NAME}
        },
        "fusion_data": {
            "anatomical_region": anatomical_region,
            "custom_anatomical_region": None,
            "registrations": registrations,
            "is_bladder_filling_study": False,
            "immobilization_device": None
        }
    }


def call_fusion_api(request: Dict) -> str:
    """Call the fusion API and return the writeup."""
    try:
        response = requests.post(
            f"{API_BASE_URL}/fusion/generate",
            json=request,
            timeout=30
        )
        response.raise_for_status()
        return response.json()["writeup"]
    except requests.exceptions.RequestException as e:
        return f"ERROR: API call failed - {str(e)}"


def main():
    """Main test execution."""
    print("=" * 80)
    print("FUSION ANATOMICAL REGION VARIATION TEST")
    print("=" * 80)
    print(f"API Base URL: {API_BASE_URL}")
    print(f"Standardized Inputs:")
    print(f"  Physician: Dr. {PHYSICIAN_NAME}")
    print(f"  Physicist: Dr. {PHYSICIST_NAME}")
    print(f"  Fusion Configs: {len(STANDARD_FUSION_CONFIG)}")
    print(f"  Anatomical Regions: {len(ANATOMICAL_REGIONS)}")
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
    
    output_file = "fusion_region_test_results.md"
    
    print(f"\nTotal test combinations: {len(STANDARD_FUSION_CONFIG) * len(ANATOMICAL_REGIONS)}")
    print()
    
    # Open output file
    with open(output_file, 'w') as f:
        # Write header
        f.write("# Fusion Anatomical Region Variation Test Results\n\n")
        f.write(f"**Generated for QA Review**\n\n")
        f.write(f"**Standardized Test Inputs:**\n")
        f.write(f"- Physician: Dr. {PHYSICIAN_NAME}\n")
        f.write(f"- Physicist: Dr. {PHYSICIST_NAME}\n")
        f.write(f"- Fusion Configurations: {', '.join([cfg['name'] for cfg in STANDARD_FUSION_CONFIG.values()])}\n\n")
        f.write("---\n\n")
        
        # Test each fusion configuration with all anatomical regions
        for config_key, fusion_config in STANDARD_FUSION_CONFIG.items():
            f.write(f"## {fusion_config['name']}\n\n")
            f.write(f"**Fusion Configuration:** {fusion_config['description']}\n\n")
            f.write("---\n\n")
            
            for i, anatomical_region in enumerate(sorted(ANATOMICAL_REGIONS), 1):
                print(f"Testing {fusion_config['name']} with region [{i}/{len(ANATOMICAL_REGIONS)}]: {anatomical_region}...")
                
                f.write(f"### {i}. Anatomical Region: {anatomical_region}\n\n")
                
                request = create_fusion_request(
                    anatomical_region=anatomical_region,
                    registrations=fusion_config['registrations']
                )
                writeup = call_fusion_api(request)
                
                f.write(f"**Write-up:**\n\n```\n{writeup}\n```\n\n")
                f.write("---\n\n")
        
        # Test with custom anatomical region
        f.write("## Custom Anatomical Region Tests\n\n")
        custom_regions = [
            {"region": "shoulder"},
            {"region": "foot"},
            {"region": "sacrum"},
        ]
        
        for i, custom in enumerate(custom_regions, 1):
            print(f"Testing custom region [{i}/{len(custom_regions)}]: {custom['region']}...")
            
            f.write(f"### {i}. Custom Region: {custom['region']}\n\n")
            
            request = {
                "common_info": {
                    "physician": {"name": PHYSICIAN_NAME},
                    "physicist": {"name": PHYSICIST_NAME}
                },
                "fusion_data": {
                    "anatomical_region": "",
                    "custom_anatomical_region": custom['region'],
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
        f.write(f"- Total combinations tested: {len(STANDARD_FUSION_CONFIG) * len(ANATOMICAL_REGIONS) + len(custom_regions)}\n")
        f.write(f"- Standard anatomical regions: {len(ANATOMICAL_REGIONS)}\n")
        f.write(f"- Custom region examples: {len(custom_regions)}\n")
        f.write(f"- Fusion configurations: {len(STANDARD_FUSION_CONFIG)}\n\n")
        f.write(f"**Review Guidelines:**\n")
        f.write(f"1. Verify anatomical region appears correctly in registration description\n")
        f.write(f"2. Check that 'the [region] anatomy' reads naturally\n")
        f.write(f"3. Ensure custom regions work properly\n")
        f.write(f"4. Confirm consistent phrasing across all regions\n")
    
    print()
    print("=" * 80)
    print(f"✓ Test complete! Results saved to: {output_file}")
    print("=" * 80)


if __name__ == "__main__":
    main()
