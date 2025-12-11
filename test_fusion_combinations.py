#!/usr/bin/env python3
"""
Fusion Write-up Combination Test Script
========================================
Generates fusion write-ups for all possible fusion type combinations
and saves results to a markdown file for QA review.

Usage:
    python test_fusion_combinations.py
"""

import requests
import json
from typing import List, Dict
from itertools import product
import sys

# API Configuration
API_BASE_URL = "http://localhost:8000/api"

# Standardized test inputs
PHYSICIAN_NAME = "Galvan"
PHYSICIST_NAME = "Kirby"
ANATOMICAL_REGION = "brain"  # Updated per Entry #55 - lesion field removed

# Fusion type configurations
FUSION_TYPES = {
    "MRI": {"secondary": "MRI", "method": "Rigid"},
    "PET_Rigid": {"secondary": "PET/CT", "method": "Rigid"},
    "PET_Deformable": {"secondary": "PET/CT", "method": "Deformable"},
    "CT_Rigid": {"secondary": "CT", "method": "Rigid"},
    "CT_Deformable": {"secondary": "CT", "method": "Deformable"},
}


def create_fusion_request(registrations: List[Dict]) -> Dict:
    """Create a fusion write-up request payload."""
    return {
        "common_info": {
            "physician": {"name": PHYSICIAN_NAME},
            "physicist": {"name": PHYSICIST_NAME}
        },
        "fusion_data": {
            "anatomical_region": ANATOMICAL_REGION,
            "custom_anatomical_region": None,
            "registrations": registrations,
            "is_bladder_filling_study": False,
            "immobilization_device": None
        }
    }


def generate_single_fusion_combinations() -> List[Dict]:
    """Generate all single fusion type combinations."""
    combinations = []
    
    for fusion_name, fusion_config in FUSION_TYPES.items():
        reg = {
            "primary": "CT",
            "secondary": fusion_config["secondary"],
            "method": fusion_config["method"]
        }
        combinations.append({
            "name": f"Single_{fusion_name}",
            "description": f"Single {fusion_config['secondary']} fusion with {fusion_config['method']} registration",
            "registrations": [reg]
        })
    
    return combinations


def generate_double_fusion_combinations() -> List[Dict]:
    """Generate all double fusion type combinations."""
    combinations = []
    fusion_list = list(FUSION_TYPES.items())
    
    for i, (name1, config1) in enumerate(fusion_list):
        for name2, config2 in fusion_list[i:]:  # Only unique pairs (no duplicates or reversed)
            # Create registrations
            reg1 = {
                "primary": "CT",
                "secondary": config1["secondary"],
                "method": config1["method"]
            }
            reg2 = {
                "primary": "CT",
                "secondary": config2["secondary"],
                "method": config2["method"]
            }
            
            # Handle same type (e.g., 2x MRI, 2x PET Rigid, etc.)
            if name1 == name2:
                combinations.append({
                    "name": f"Double_{name1}",
                    "description": f"Two {config1['secondary']} fusions with {config1['method']} registration",
                    "registrations": [reg1, reg2]
                })
            else:
                combinations.append({
                    "name": f"{name1}_plus_{name2}",
                    "description": f"{config1['secondary']} ({config1['method']}) + {config2['secondary']} ({config2['method']})",
                    "registrations": [reg1, reg2]
                })
    
    return combinations


def generate_triple_fusion_combinations() -> List[Dict]:
    """Generate representative triple fusion combinations (not all permutations)."""
    combinations = []
    
    # Representative triple combinations
    representative_triples = [
        # Three of same type
        ["MRI", "MRI", "MRI"],
        ["PET_Rigid", "PET_Rigid", "PET_Rigid"],
        ["PET_Deformable", "PET_Deformable", "PET_Deformable"],
        ["CT_Rigid", "CT_Rigid", "CT_Rigid"],
        ["CT_Deformable", "CT_Deformable", "CT_Deformable"],
        
        # Mixed combinations
        ["MRI", "PET_Rigid", "PET_Deformable"],
        ["MRI", "CT_Rigid", "CT_Deformable"],
        ["MRI", "PET_Rigid", "CT_Rigid"],
        ["PET_Rigid", "PET_Deformable", "CT_Rigid"],
        ["PET_Rigid", "PET_Deformable", "CT_Deformable"],
        
        # All different modalities
        ["MRI", "PET_Rigid", "CT_Rigid"],
        ["MRI", "PET_Deformable", "CT_Deformable"],
    ]
    
    for triple in representative_triples:
        registrations = []
        for fusion_name in triple:
            config = FUSION_TYPES[fusion_name]
            registrations.append({
                "primary": "CT",
                "secondary": config["secondary"],
                "method": config["method"]
            })
        
        combinations.append({
            "name": "_".join(triple),
            "description": " + ".join([f"{FUSION_TYPES[name]['secondary']} ({FUSION_TYPES[name]['method']})" for name in triple]),
            "registrations": registrations
        })
    
    return combinations


def generate_bladder_filling_combination() -> Dict:
    """Generate bladder filling study combination."""
    # Updated per Entry #55 - lesion/custom_lesion fields removed, now using anatomical_region only
    return {
        "name": "Bladder_Filling_Study",
        "description": "Full/Empty bladder comparison study",
        "common_info": {
            "physician": {"name": PHYSICIAN_NAME},
            "physicist": {"name": PHYSICIST_NAME}
        },
        "fusion_data": {
            "anatomical_region": "pelvic",
            "custom_anatomical_region": None,
            "registrations": [],
            "is_bladder_filling_study": True,
            "immobilization_device": "Vac-Lok"
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
    print("FUSION WRITE-UP COMBINATION TEST")
    print("=" * 80)
    print(f"API Base URL: {API_BASE_URL}")
    print(f"Standardized Inputs:")
    print(f"  Physician: Dr. {PHYSICIAN_NAME}")
    print(f"  Physicist: Dr. {PHYSICIST_NAME}")
    print(f"  Anatomical Region: {ANATOMICAL_REGION}")
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
    
    output_file = "fusion_writeup_test_results.md"
    
    # Generate all combinations
    print("\nGenerating test combinations...")
    single_combinations = generate_single_fusion_combinations()
    double_combinations = generate_double_fusion_combinations()
    triple_combinations = generate_triple_fusion_combinations()
    bladder_combination = generate_bladder_filling_combination()
    
    print(f"  Single fusion combinations: {len(single_combinations)}")
    print(f"  Double fusion combinations: {len(double_combinations)}")
    print(f"  Triple fusion combinations: {len(triple_combinations)}")
    print(f"  Special combinations: 1 (bladder filling)")
    print(f"  TOTAL: {len(single_combinations) + len(double_combinations) + len(triple_combinations) + 1}")
    print()
    
    # Open output file
    with open(output_file, 'w') as f:
        # Write header
        f.write("# Fusion Write-up Combination Test Results\n\n")
        f.write(f"**Generated for QA Review**\n\n")
        f.write(f"**Standardized Test Inputs:**\n")
        f.write(f"- Physician: Dr. {PHYSICIAN_NAME}\n")
        f.write(f"- Physicist: Dr. {PHYSICIST_NAME}\n")
        f.write(f"- Anatomical Region: {ANATOMICAL_REGION}\n\n")
        f.write("---\n\n")
        
        # Test single combinations
        f.write("## Single Fusion Combinations\n\n")
        for i, combo in enumerate(single_combinations, 1):
            print(f"Testing [{i}/{len(single_combinations)}] {combo['name']}...")
            f.write(f"### {i}. {combo['name']}\n\n")
            f.write(f"**Configuration:** {combo['description']}\n\n")
            
            request = create_fusion_request(combo['registrations'])
            writeup = call_fusion_api(request)
            
            f.write(f"**Write-up:**\n\n```\n{writeup}\n```\n\n")
            f.write("---\n\n")
        
        # Test double combinations
        f.write("## Double Fusion Combinations\n\n")
        for i, combo in enumerate(double_combinations, 1):
            print(f"Testing [{i}/{len(double_combinations)}] {combo['name']}...")
            f.write(f"### {i}. {combo['name']}\n\n")
            f.write(f"**Configuration:** {combo['description']}\n\n")
            
            request = create_fusion_request(combo['registrations'])
            writeup = call_fusion_api(request)
            
            f.write(f"**Write-up:**\n\n```\n{writeup}\n```\n\n")
            f.write("---\n\n")
        
        # Test triple combinations
        f.write("## Triple Fusion Combinations (Representative)\n\n")
        for i, combo in enumerate(triple_combinations, 1):
            print(f"Testing [{i}/{len(triple_combinations)}] {combo['name']}...")
            f.write(f"### {i}. {combo['name']}\n\n")
            f.write(f"**Configuration:** {combo['description']}\n\n")
            
            request = create_fusion_request(combo['registrations'])
            writeup = call_fusion_api(request)
            
            f.write(f"**Write-up:**\n\n```\n{writeup}\n```\n\n")
            f.write("---\n\n")
        
        # Test bladder filling
        f.write("## Special Cases\n\n")
        print(f"Testing Bladder Filling Study...")
        f.write(f"### 1. {bladder_combination['name']}\n\n")
        f.write(f"**Configuration:** {bladder_combination['description']}\n\n")
        
        writeup = call_fusion_api(bladder_combination)
        
        f.write(f"**Write-up:**\n\n```\n{writeup}\n```\n\n")
        f.write("---\n\n")
        
        # Write summary
        f.write("## Test Summary\n\n")
        f.write(f"- Total combinations tested: {len(single_combinations) + len(double_combinations) + len(triple_combinations) + 1}\n")
        f.write(f"- Single fusion types: {len(single_combinations)}\n")
        f.write(f"- Double fusion types: {len(double_combinations)}\n")
        f.write(f"- Triple fusion types: {len(triple_combinations)}\n")
        f.write(f"- Special cases: 1\n\n")
        f.write(f"**Review Guidelines:**\n")
        f.write(f"1. Verify grammar (singular/plural agreement)\n")
        f.write(f"2. Check medical terminology accuracy\n")
        f.write(f"3. Validate registration method descriptions\n")
        f.write(f"4. Ensure proper formatting and punctuation\n")
        f.write(f"5. Confirm physician/physicist names are correct\n")
    
    print()
    print("=" * 80)
    print(f"✓ Test complete! Results saved to: {output_file}")
    print("=" * 80)


if __name__ == "__main__":
    main()

