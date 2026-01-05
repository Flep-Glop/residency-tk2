from app.schemas.prior_dose import PriorDoseRequest, PriorDoseResponse, PriorTreatment
from typing import List, Dict, Any, Tuple
from datetime import datetime

class PriorDoseService:
    """Service for generating prior dose write-ups."""
    
    def __init__(self):
        """Initialize the Prior Dose service."""
        # Common treatment sites
        self.treatment_sites = [
            "brain", "head and neck", "thorax", "breast", "lung", 
            "liver", "pancreas", "abdomen", "pelvis", "prostate", 
            "endometrium", "cervix", "rectum", "spine", "extremity"
        ]
        
        # α/β ratios for EQD2 calculations (reference values from QUANTEC/literature)
        self.alpha_beta_ratios = {
            "spinal cord": 2,
            "brainstem": 2,
            "optic nerve": 2,
            "optic chiasm": 2,
            "cochlea": 3,
            "brain": 2,
            "parotid": 3,
            "larynx": 3,
            "pharyngeal constrictors": 3,
            "lung": 3,
            "heart": 2.5,
            "esophagus": 3,
            "brachial plexus": 2,
            "liver": 2.5,
            "kidney": 2.5,
            "small bowel": 3,
            "rectum": 3,
            "bladder": 3,
            "femoral head": 3,
            "default_late": 3,  # Default for late-responding tissues
            "default_tumor": 10,  # Default for tumors
        }
        
        # ============================================================
        # QUANTEC CONSTRAINTS - Conventional Fractionation (~2 Gy/fx)
        # Also used when EQD2 is selected (values expressed as EQD2₂)
        # Source: IJROBP Volume 76, Supplement 3, March 2010
        # 
        # VERIFIED FIELD: Controls whether constraint is shown to users
        # Only verified=True constraints are displayed in the UI
        # This allows gradual rollout of constraints after clinical review
        # ============================================================
        self.quantec_constraints = {
            "brain": [
                {"structure": "Brainstem", "constraint": "Dmax", "limit": "<54 Gy", "endpoint": "Cranial neuropathy", "verified": True},
                {"structure": "Brainstem", "constraint": "D1-10cc", "limit": "≤59 Gy", "endpoint": "Small volume tolerance", "verified": False},
                {"structure": "Optic Chiasm", "constraint": "Dmax", "limit": "<55 Gy", "endpoint": "Optic neuropathy", "verified": False},
                {"structure": "Optic Nerves", "constraint": "Dmax", "limit": "<55 Gy", "endpoint": "Optic neuropathy", "verified": False},
                {"structure": "Cochlea", "constraint": "Dmean", "limit": "≤45 Gy", "endpoint": "Hearing loss", "verified": False},
                {"structure": "Brain", "constraint": "Dmax", "limit": "<60 Gy", "endpoint": "Symptomatic necrosis", "verified": False},
            ],
            "head and neck": [
                {"structure": "Spinal Cord", "constraint": "Dmax", "limit": "<45 Gy", "endpoint": "Myelopathy", "verified": True},
                {"structure": "Brainstem", "constraint": "Dmax", "limit": "<54 Gy", "endpoint": "Cranial neuropathy", "verified": True},
                {"structure": "Esophagus", "constraint": "Dmean", "limit": "<35 Gy", "endpoint": "Esophagitis", "verified": True},
                {"structure": "Parotid (bilateral)", "constraint": "Dmean", "limit": "<25 Gy", "endpoint": "Salivary dysfunction", "verified": False},
                {"structure": "Parotid (single)", "constraint": "Dmean", "limit": "<20 Gy", "endpoint": "Salivary dysfunction", "verified": False},
                {"structure": "Larynx", "constraint": "Dmax", "limit": "<66 Gy", "endpoint": "Vocal dysfunction", "verified": False},
                {"structure": "Larynx", "constraint": "Dmean", "limit": "<44 Gy", "endpoint": "Laryngeal edema", "verified": False},
                {"structure": "Pharyngeal Constrictors", "constraint": "Dmean", "limit": "<50 Gy", "endpoint": "Dysphagia", "verified": False},
            ],
            "thorax": [
                {"structure": "Spinal Cord", "constraint": "Dmax", "limit": "<45 Gy", "endpoint": "Myelopathy", "verified": True},
                {"structure": "Lungs (bilateral)", "constraint": "V20", "limit": "<37%", "endpoint": "Pneumonitis", "verified": True},
                {"structure": "Lungs (bilateral)", "constraint": "Dmean", "limit": "<20 Gy", "endpoint": "Pneumonitis", "verified": False},
                {"structure": "Heart", "constraint": "Dmax", "limit": "<40 Gy", "endpoint": "Cardiac toxicity", "verified": True},
                {"structure": "Heart", "constraint": "V25", "limit": "<10%", "endpoint": "Cardiac mortality", "verified": False},
                {"structure": "Heart", "constraint": "Dmean", "limit": "<26 Gy", "endpoint": "Pericarditis", "verified": False},
                {"structure": "Esophagus", "constraint": "Dmean", "limit": "<35 Gy", "endpoint": "Esophagitis", "verified": True},
                {"structure": "Brachial Plexus", "constraint": "Dmax", "limit": "60-62 Gy", "endpoint": "Plexopathy", "verified": False},
            ],
            "breast": [
                {"structure": "Heart", "constraint": "Dmax", "limit": "<40 Gy", "endpoint": "Cardiac toxicity", "verified": True},
                {"structure": "Lungs (bilateral)", "constraint": "V20", "limit": "<37%", "endpoint": "Pneumonitis", "verified": True},
                {"structure": "Heart", "constraint": "V25", "limit": "<10%", "endpoint": "Cardiac mortality", "verified": False},
                {"structure": "Heart", "constraint": "Dmean", "limit": "<26 Gy", "endpoint": "Pericarditis", "verified": False},
                {"structure": "Contralateral Breast", "constraint": "Dmean", "limit": "<3 Gy", "endpoint": "Secondary malignancy", "verified": False},
            ],
            "lung": [
                {"structure": "Spinal Cord", "constraint": "Dmax", "limit": "<45 Gy", "endpoint": "Myelopathy", "verified": True},
                {"structure": "Lungs (bilateral)", "constraint": "V20", "limit": "<37%", "endpoint": "Pneumonitis", "verified": True},
                {"structure": "Lungs (bilateral)", "constraint": "Dmean", "limit": "<20 Gy", "endpoint": "Pneumonitis", "verified": False},
                {"structure": "Heart", "constraint": "Dmax", "limit": "<40 Gy", "endpoint": "Cardiac toxicity", "verified": True},
                {"structure": "Heart", "constraint": "V25", "limit": "<10%", "endpoint": "Cardiac mortality", "verified": False},
                {"structure": "Heart", "constraint": "Dmean", "limit": "<26 Gy", "endpoint": "Pericarditis", "verified": False},
                {"structure": "Esophagus", "constraint": "Dmean", "limit": "<35 Gy", "endpoint": "Esophagitis", "verified": True},
            ],
            "liver": [
                {"structure": "Liver (normal)", "constraint": "Dmean", "limit": "<30-32 Gy", "endpoint": "RILD", "verified": False},
                {"structure": "Spinal Cord", "constraint": "Dmax", "limit": "<45 Gy", "endpoint": "Myelopathy", "verified": True},
                {"structure": "Esophagus", "constraint": "Dmean", "limit": "<35 Gy", "endpoint": "Esophagitis", "verified": True},
                {"structure": "Kidneys (bilateral)", "constraint": "Dmean", "limit": "<15-18 Gy", "endpoint": "Renal dysfunction", "verified": False},
                {"structure": "Kidneys (bilateral)", "constraint": "V12", "limit": "<55%", "endpoint": "Renal dysfunction", "verified": False},
            ],
            "pancreas": [
                {"structure": "Spinal Cord", "constraint": "Dmax", "limit": "<45 Gy", "endpoint": "Myelopathy", "verified": True},
                {"structure": "Esophagus", "constraint": "Dmean", "limit": "<35 Gy", "endpoint": "Esophagitis", "verified": True},
                {"structure": "Kidneys (bilateral)", "constraint": "Dmean", "limit": "<15-18 Gy", "endpoint": "Renal dysfunction", "verified": False},
                {"structure": "Small Bowel", "constraint": "V15", "limit": "<120 cc", "endpoint": "Acute toxicity", "verified": False},
                {"structure": "Stomach", "constraint": "V45", "limit": "<195 cc", "endpoint": "Ulceration", "verified": False},
            ],
            "abdomen": [
                {"structure": "Spinal Cord", "constraint": "Dmax", "limit": "<45 Gy", "endpoint": "Myelopathy", "verified": True},
                {"structure": "Esophagus", "constraint": "Dmean", "limit": "<35 Gy", "endpoint": "Esophagitis", "verified": True},
                {"structure": "Liver (normal)", "constraint": "Dmean", "limit": "<30-32 Gy", "endpoint": "RILD", "verified": False},
                {"structure": "Kidneys (bilateral)", "constraint": "Dmean", "limit": "<15-18 Gy", "endpoint": "Renal dysfunction", "verified": False},
                {"structure": "Small Bowel", "constraint": "V15", "limit": "<120 cc", "endpoint": "Acute toxicity", "verified": False},
            ],
            "pelvis": [
                {"structure": "Rectum", "constraint": "V50", "limit": "<60%", "endpoint": "Late rectal toxicity", "verified": True},
                {"structure": "Rectum", "constraint": "V60", "limit": "<35%", "endpoint": "Late rectal toxicity", "verified": False},
                {"structure": "Rectum", "constraint": "V70", "limit": "<20%", "endpoint": "Late rectal toxicity", "verified": False},
                {"structure": "Bladder", "constraint": "V65", "limit": "≤50%", "endpoint": "Late toxicity", "verified": False},
                {"structure": "Bladder", "constraint": "V80", "limit": "≤15%", "endpoint": "Late toxicity", "verified": False},
                {"structure": "Femoral Heads", "constraint": "Dmax", "limit": "≤52 Gy", "endpoint": "Necrosis", "verified": False},
                {"structure": "Small Bowel", "constraint": "V15", "limit": "<120 cc", "endpoint": "Acute toxicity", "verified": False},
            ],
            "prostate": [
                {"structure": "Rectum", "constraint": "V50", "limit": "<60%", "endpoint": "Late rectal toxicity", "verified": True},
                {"structure": "Rectum", "constraint": "V70", "limit": "<20%", "endpoint": "Late rectal toxicity", "verified": False},
                {"structure": "Bladder", "constraint": "V65", "limit": "≤50%", "endpoint": "Late toxicity", "verified": False},
                {"structure": "Femoral Heads", "constraint": "Dmax", "limit": "≤52 Gy", "endpoint": "Necrosis", "verified": False},
                {"structure": "Penile Bulb", "constraint": "Dmean", "limit": "<50 Gy", "endpoint": "Erectile dysfunction", "verified": False},
            ],
            "endometrium": [
                {"structure": "Rectum", "constraint": "V50", "limit": "<60%", "endpoint": "Late rectal toxicity", "verified": True},
                {"structure": "Bladder", "constraint": "V65", "limit": "≤50%", "endpoint": "Late toxicity", "verified": False},
                {"structure": "Small Bowel", "constraint": "V15", "limit": "<120 cc", "endpoint": "Acute toxicity", "verified": False},
                {"structure": "Femoral Heads", "constraint": "Dmax", "limit": "≤52 Gy", "endpoint": "Necrosis", "verified": False},
            ],
            "cervix": [
                {"structure": "Rectum", "constraint": "V50", "limit": "<60%", "endpoint": "Late rectal toxicity", "verified": True},
                {"structure": "Bladder", "constraint": "V65", "limit": "≤50%", "endpoint": "Late toxicity", "verified": False},
                {"structure": "Small Bowel", "constraint": "V15", "limit": "<120 cc", "endpoint": "Acute toxicity", "verified": False},
                {"structure": "Femoral Heads", "constraint": "Dmax", "limit": "≤52 Gy", "endpoint": "Necrosis", "verified": False},
            ],
            "rectum": [
                {"structure": "Small Bowel", "constraint": "V15", "limit": "<120 cc", "endpoint": "Acute toxicity", "verified": False},
                {"structure": "Bladder", "constraint": "V65", "limit": "≤50%", "endpoint": "Late toxicity", "verified": False},
                {"structure": "Femoral Heads", "constraint": "Dmax", "limit": "≤52 Gy", "endpoint": "Necrosis", "verified": False},
            ],
            "spine": [
                {"structure": "Spinal Cord", "constraint": "Dmax", "limit": "<45 Gy", "endpoint": "Myelopathy", "verified": True},
                {"structure": "Esophagus", "constraint": "Dmean", "limit": "<35 Gy", "endpoint": "Esophagitis", "verified": True},
            ],
            "extremity": [
                {"structure": "Bone", "constraint": "Dmax", "limit": "Per protocol", "endpoint": "Fracture", "verified": False},
                {"structure": "Soft Tissue", "constraint": "Dmean", "limit": "Per protocol", "endpoint": "Fibrosis", "verified": False},
            ],
        }
        
        # ============================================================
        # TIMMERMAN/TG-101 CONSTRAINTS - SBRT (3-5 fractions)
        # Source: AAPM TG-101 (2010), HyTEC (2021), RTOG protocols
        # All SBRT constraints are unverified by default
        # ============================================================
        self.timmerman_constraints = {
            # 3-fraction constraints
            "3fx": {
                "brain": [
                    {"structure": "Brainstem", "constraint": "Dmax (0.035cc)", "limit": "<23.1 Gy", "endpoint": "Necrosis", "verified": False},
                    {"structure": "Optic Chiasm", "constraint": "Dmax", "limit": "<17.4 Gy", "endpoint": "Optic neuropathy", "verified": False},
                    {"structure": "Optic Nerves", "constraint": "Dmax", "limit": "<17.4 Gy", "endpoint": "Optic neuropathy", "verified": False},
                    {"structure": "Cochlea", "constraint": "Dmax", "limit": "<17.1 Gy", "endpoint": "Hearing loss", "verified": False},
                ],
                "head and neck": [
                    {"structure": "Spinal Cord", "constraint": "Dmax (0.035cc)", "limit": "<20.3-22.5 Gy", "endpoint": "Myelopathy", "verified": False},
                    {"structure": "Spinal Cord", "constraint": "D0.35cc", "limit": "<18 Gy", "endpoint": "Myelopathy", "verified": False},
                    {"structure": "Brainstem", "constraint": "Dmax (0.035cc)", "limit": "<23.1 Gy", "endpoint": "Necrosis", "verified": False},
                    {"structure": "Esophagus", "constraint": "Dmax (0.035cc)", "limit": "<25.2-27 Gy", "endpoint": "Stenosis", "verified": False},
                ],
                "thorax": [
                    {"structure": "Spinal Cord", "constraint": "Dmax (0.035cc)", "limit": "<20.3-22.5 Gy", "endpoint": "Myelopathy", "verified": False},
                    {"structure": "Lungs (bilateral)", "constraint": "V20", "limit": "<10-15%", "endpoint": "Pneumonitis", "verified": False},
                    {"structure": "Lungs (bilateral)", "constraint": "MLD", "limit": "≤8 Gy", "endpoint": "Pneumonitis (HyTEC)", "verified": False},
                    {"structure": "Heart", "constraint": "Dmax (0.035cc)", "limit": "<30 Gy", "endpoint": "Pericarditis", "verified": False},
                    {"structure": "Heart", "constraint": "D15cc", "limit": "<24 Gy", "endpoint": "Pericarditis", "verified": False},
                    {"structure": "Esophagus", "constraint": "Dmax (0.035cc)", "limit": "<25.2-27 Gy", "endpoint": "Stenosis", "verified": False},
                    {"structure": "Brachial Plexus", "constraint": "Dmax (0.035cc)", "limit": "<24-26 Gy", "endpoint": "Neuropathy", "verified": False},
                    {"structure": "Great Vessels", "constraint": "Dmax (0.5cc)", "limit": "<45 Gy", "endpoint": "Aneurysm", "verified": False},
                    {"structure": "Proximal Bronchial Tree", "constraint": "Dmax (0.5cc)", "limit": "<30-32 Gy", "endpoint": "Stenosis", "verified": False},
                    {"structure": "Chest Wall/Ribs", "constraint": "Dmax (0.5cc)", "limit": "<36.9-37 Gy", "endpoint": "Fracture/pain", "verified": False},
                ],
                "lung": [
                    {"structure": "Spinal Cord", "constraint": "Dmax (0.035cc)", "limit": "<20.3-22.5 Gy", "endpoint": "Myelopathy", "verified": False},
                    {"structure": "Lungs (bilateral)", "constraint": "V20", "limit": "<10-15%", "endpoint": "Pneumonitis", "verified": False},
                    {"structure": "Lungs (bilateral)", "constraint": "MLD", "limit": "≤8 Gy", "endpoint": "Pneumonitis (HyTEC)", "verified": False},
                    {"structure": "Heart", "constraint": "Dmax (0.035cc)", "limit": "<30 Gy", "endpoint": "Pericarditis", "verified": False},
                    {"structure": "Esophagus", "constraint": "Dmax (0.035cc)", "limit": "<25.2-27 Gy", "endpoint": "Stenosis", "verified": False},
                    {"structure": "Brachial Plexus", "constraint": "Dmax (0.035cc)", "limit": "<24-26 Gy", "endpoint": "Neuropathy", "verified": False},
                    {"structure": "Proximal Bronchial Tree", "constraint": "Dmax (0.5cc)", "limit": "<30-32 Gy", "endpoint": "Stenosis", "verified": False},
                    {"structure": "Chest Wall/Ribs", "constraint": "Dmax (0.5cc)", "limit": "<36.9-37 Gy", "endpoint": "Fracture/pain", "verified": False},
                ],
                "liver": [
                    {"structure": "Liver (normal)", "constraint": "MLD", "limit": "≤15 Gy", "endpoint": "RILD (HyTEC)", "verified": False},
                    {"structure": "Liver (normal)", "constraint": "Critical volume", "limit": "≥700cc <15-17 Gy", "endpoint": "RILD (TG-101)", "verified": False},
                    {"structure": "Spinal Cord", "constraint": "Dmax (0.035cc)", "limit": "<20.3-22.5 Gy", "endpoint": "Myelopathy", "verified": False},
                    {"structure": "Kidneys", "constraint": "D200cc", "limit": "<14.4-16 Gy", "endpoint": "Nephropathy", "verified": False},
                    {"structure": "Stomach", "constraint": "Dmax (0.5cc)", "limit": "<22.2 Gy", "endpoint": "Ulceration", "verified": False},
                    {"structure": "Duodenum", "constraint": "Dmax (0.5cc)", "limit": "<22.2-24 Gy", "endpoint": "Ulceration", "verified": False},
                    {"structure": "Small Bowel", "constraint": "Dmax (0.5cc)", "limit": "<25.2-27 Gy", "endpoint": "Enteritis", "verified": False},
                ],
                "pancreas": [
                    {"structure": "Spinal Cord", "constraint": "Dmax (0.035cc)", "limit": "<20.3-22.5 Gy", "endpoint": "Myelopathy", "verified": False},
                    {"structure": "Stomach", "constraint": "Dmax (0.5cc)", "limit": "<22.2 Gy", "endpoint": "Ulceration", "verified": False},
                    {"structure": "Duodenum", "constraint": "Dmax (0.5cc)", "limit": "<22.2-24 Gy", "endpoint": "Ulceration", "verified": False},
                    {"structure": "Small Bowel", "constraint": "Dmax (0.5cc)", "limit": "<25.2-27 Gy", "endpoint": "Enteritis", "verified": False},
                    {"structure": "Kidneys", "constraint": "D200cc", "limit": "<14.4-16 Gy", "endpoint": "Nephropathy", "verified": False},
                ],
                "abdomen": [
                    {"structure": "Spinal Cord", "constraint": "Dmax (0.035cc)", "limit": "<20.3-22.5 Gy", "endpoint": "Myelopathy", "verified": False},
                    {"structure": "Liver (normal)", "constraint": "Critical volume", "limit": "≥700cc <15-17 Gy", "endpoint": "RILD", "verified": False},
                    {"structure": "Kidneys", "constraint": "D200cc", "limit": "<14.4-16 Gy", "endpoint": "Nephropathy", "verified": False},
                    {"structure": "Stomach", "constraint": "Dmax (0.5cc)", "limit": "<22.2 Gy", "endpoint": "Ulceration", "verified": False},
                    {"structure": "Small Bowel", "constraint": "Dmax (0.5cc)", "limit": "<25.2-27 Gy", "endpoint": "Enteritis", "verified": False},
                ],
                "pelvis": [
                    {"structure": "Rectum", "constraint": "Dmax (0.5cc)", "limit": "<28.2 Gy", "endpoint": "Proctitis", "verified": False},
                    {"structure": "Bladder", "constraint": "Dmax (0.5cc)", "limit": "<28.2 Gy", "endpoint": "Cystitis", "verified": False},
                    {"structure": "Small Bowel", "constraint": "Dmax (0.5cc)", "limit": "<25.2-27 Gy", "endpoint": "Enteritis", "verified": False},
                    {"structure": "Femoral Heads", "constraint": "V24", "limit": "<3 cc", "endpoint": "Necrosis", "verified": False},
                ],
                "prostate": [
                    {"structure": "Rectum", "constraint": "V36", "limit": "<1 cc", "endpoint": "Proctitis", "verified": False},
                    {"structure": "Bladder", "constraint": "V37", "limit": "<10 cc", "endpoint": "Cystitis", "verified": False},
                    {"structure": "Urethra", "constraint": "V37", "limit": "<0.5 cc", "endpoint": "Stricture", "verified": False},
                    {"structure": "Femoral Heads", "constraint": "V24", "limit": "<3 cc", "endpoint": "Necrosis", "verified": False},
                ],
                "spine": [
                    {"structure": "Spinal Cord", "constraint": "Dmax (0.035cc)", "limit": "<20.3-22.5 Gy", "endpoint": "Myelopathy", "verified": False},
                    {"structure": "Spinal Cord", "constraint": "D0.35cc", "limit": "<18 Gy", "endpoint": "Myelopathy", "verified": False},
                    {"structure": "Cauda Equina", "constraint": "Dmax (0.035cc)", "limit": "<24 Gy", "endpoint": "Neurologic deficit", "verified": False},
                    {"structure": "Esophagus", "constraint": "Dmax (0.035cc)", "limit": "<25.2-27 Gy", "endpoint": "Stenosis", "verified": False},
                ],
            },
            # 5-fraction constraints
            "5fx": {
                "brain": [
                    {"structure": "Brainstem", "constraint": "Dmax (0.035cc)", "limit": "<31 Gy", "endpoint": "Necrosis", "verified": False},
                    {"structure": "Optic Chiasm", "constraint": "Dmax", "limit": "<20-25 Gy", "endpoint": "Optic neuropathy", "verified": False},
                    {"structure": "Optic Nerves", "constraint": "Dmax", "limit": "<20-25 Gy", "endpoint": "Optic neuropathy", "verified": False},
                    {"structure": "Cochlea", "constraint": "Dmax", "limit": "<22 Gy", "endpoint": "Hearing loss", "verified": False},
                ],
                "head and neck": [
                    {"structure": "Spinal Cord", "constraint": "Dmax (0.035cc)", "limit": "<25.3-28 Gy", "endpoint": "Myelopathy", "verified": False},
                    {"structure": "Spinal Cord", "constraint": "D0.35cc", "limit": "<23 Gy", "endpoint": "Myelopathy", "verified": False},
                    {"structure": "Brainstem", "constraint": "Dmax (0.035cc)", "limit": "<31 Gy", "endpoint": "Necrosis", "verified": False},
                    {"structure": "Esophagus", "constraint": "Dmax (0.035cc)", "limit": "<32-35 Gy", "endpoint": "Stenosis", "verified": False},
                ],
                "thorax": [
                    {"structure": "Spinal Cord", "constraint": "Dmax (0.035cc)", "limit": "<25.3-28 Gy", "endpoint": "Myelopathy", "verified": False},
                    {"structure": "Lungs (bilateral)", "constraint": "V20", "limit": "<10-15%", "endpoint": "Pneumonitis", "verified": False},
                    {"structure": "Lungs (bilateral)", "constraint": "MLD", "limit": "≤8 Gy", "endpoint": "Pneumonitis (HyTEC)", "verified": False},
                    {"structure": "Heart", "constraint": "Dmax (0.035cc)", "limit": "<38 Gy", "endpoint": "Pericarditis", "verified": False},
                    {"structure": "Heart", "constraint": "D15cc", "limit": "<32 Gy", "endpoint": "Pericarditis", "verified": False},
                    {"structure": "Esophagus", "constraint": "Dmax (0.035cc)", "limit": "<32-35 Gy", "endpoint": "Stenosis", "verified": False},
                    {"structure": "Brachial Plexus", "constraint": "Dmax (0.035cc)", "limit": "<30.5-32 Gy", "endpoint": "Neuropathy", "verified": False},
                    {"structure": "Great Vessels", "constraint": "Dmax (0.5cc)", "limit": "<53 Gy", "endpoint": "Aneurysm", "verified": False},
                    {"structure": "Proximal Bronchial Tree", "constraint": "Dmax (0.5cc)", "limit": "<40-50 Gy", "endpoint": "Stenosis", "verified": False},
                    {"structure": "Chest Wall/Ribs", "constraint": "Dmax (0.5cc)", "limit": "<39-43 Gy", "endpoint": "Fracture/pain", "verified": False},
                ],
                "lung": [
                    {"structure": "Spinal Cord", "constraint": "Dmax (0.035cc)", "limit": "<25.3-28 Gy", "endpoint": "Myelopathy", "verified": False},
                    {"structure": "Lungs (bilateral)", "constraint": "V20", "limit": "<10-15%", "endpoint": "Pneumonitis", "verified": False},
                    {"structure": "Lungs (bilateral)", "constraint": "MLD", "limit": "≤8 Gy", "endpoint": "Pneumonitis (HyTEC)", "verified": False},
                    {"structure": "Heart", "constraint": "Dmax (0.035cc)", "limit": "<38 Gy", "endpoint": "Pericarditis", "verified": False},
                    {"structure": "Esophagus", "constraint": "Dmax (0.035cc)", "limit": "<32-35 Gy", "endpoint": "Stenosis", "verified": False},
                    {"structure": "Brachial Plexus", "constraint": "Dmax (0.035cc)", "limit": "<30.5-32 Gy", "endpoint": "Neuropathy", "verified": False},
                    {"structure": "Proximal Bronchial Tree", "constraint": "Dmax (0.5cc)", "limit": "<40-50 Gy", "endpoint": "Stenosis", "verified": False},
                    {"structure": "Chest Wall/Ribs", "constraint": "Dmax (0.5cc)", "limit": "<39-43 Gy", "endpoint": "Fracture/pain", "verified": False},
                ],
                "liver": [
                    {"structure": "Liver (normal)", "constraint": "MLD", "limit": "≤20 Gy", "endpoint": "RILD (HyTEC)", "verified": False},
                    {"structure": "Liver (normal)", "constraint": "Critical volume", "limit": "≥700cc <21 Gy", "endpoint": "RILD (TG-101)", "verified": False},
                    {"structure": "Spinal Cord", "constraint": "Dmax (0.035cc)", "limit": "<25.3-28 Gy", "endpoint": "Myelopathy", "verified": False},
                    {"structure": "Kidneys", "constraint": "D200cc", "limit": "<17.5 Gy", "endpoint": "Nephropathy", "verified": False},
                    {"structure": "Kidneys", "constraint": "Dmean", "limit": "<10 Gy", "endpoint": "Nephropathy", "verified": False},
                    {"structure": "Stomach", "constraint": "Dmax (0.5cc)", "limit": "<32-35 Gy", "endpoint": "Ulceration", "verified": False},
                    {"structure": "Duodenum", "constraint": "Dmax (0.5cc)", "limit": "<32-35 Gy", "endpoint": "Ulceration", "verified": False},
                    {"structure": "Small Bowel", "constraint": "Dmax (0.5cc)", "limit": "<34.5-35 Gy", "endpoint": "Enteritis", "verified": False},
                ],
                "pancreas": [
                    {"structure": "Spinal Cord", "constraint": "Dmax (0.035cc)", "limit": "<25.3-28 Gy", "endpoint": "Myelopathy", "verified": False},
                    {"structure": "Stomach", "constraint": "Dmax (0.5cc)", "limit": "<32-35 Gy", "endpoint": "Ulceration", "verified": False},
                    {"structure": "Duodenum", "constraint": "Dmax (0.5cc)", "limit": "<32-35 Gy", "endpoint": "Ulceration", "verified": False},
                    {"structure": "Small Bowel", "constraint": "Dmax (0.5cc)", "limit": "<34.5-35 Gy", "endpoint": "Enteritis", "verified": False},
                    {"structure": "Kidneys", "constraint": "D200cc", "limit": "<17.5 Gy", "endpoint": "Nephropathy", "verified": False},
                ],
                "abdomen": [
                    {"structure": "Spinal Cord", "constraint": "Dmax (0.035cc)", "limit": "<25.3-28 Gy", "endpoint": "Myelopathy", "verified": False},
                    {"structure": "Liver (normal)", "constraint": "Critical volume", "limit": "≥700cc <21 Gy", "endpoint": "RILD", "verified": False},
                    {"structure": "Kidneys", "constraint": "D200cc", "limit": "<17.5 Gy", "endpoint": "Nephropathy", "verified": False},
                    {"structure": "Stomach", "constraint": "Dmax (0.5cc)", "limit": "<32-35 Gy", "endpoint": "Ulceration", "verified": False},
                    {"structure": "Small Bowel", "constraint": "Dmax (0.5cc)", "limit": "<34.5-35 Gy", "endpoint": "Enteritis", "verified": False},
                ],
                "pelvis": [
                    {"structure": "Rectum", "constraint": "Dmax (0.5cc)", "limit": "<32-38 Gy", "endpoint": "Proctitis", "verified": False},
                    {"structure": "Bladder", "constraint": "Dmax (0.5cc)", "limit": "<32-38 Gy", "endpoint": "Cystitis", "verified": False},
                    {"structure": "Small Bowel", "constraint": "Dmax (0.5cc)", "limit": "<34.5-35 Gy", "endpoint": "Enteritis", "verified": False},
                    {"structure": "Femoral Heads", "constraint": "V30", "limit": "<3 cc", "endpoint": "Necrosis", "verified": False},
                ],
                "prostate": [
                    {"structure": "Rectum", "constraint": "V36", "limit": "<1 cc", "endpoint": "Proctitis", "verified": False},
                    {"structure": "Bladder", "constraint": "V37", "limit": "<10 cc", "endpoint": "Cystitis", "verified": False},
                    {"structure": "Urethra", "constraint": "V37", "limit": "<0.5 cc", "endpoint": "Stricture", "verified": False},
                    {"structure": "Femoral Heads", "constraint": "V30", "limit": "<3 cc", "endpoint": "Necrosis", "verified": False},
                ],
                "spine": [
                    {"structure": "Spinal Cord", "constraint": "Dmax (0.035cc)", "limit": "<25.3-28 Gy", "endpoint": "Myelopathy", "verified": False},
                    {"structure": "Spinal Cord", "constraint": "D0.35cc", "limit": "<23 Gy", "endpoint": "Myelopathy", "verified": False},
                    {"structure": "Cauda Equina", "constraint": "Dmax (0.035cc)", "limit": "<30 Gy", "endpoint": "Neurologic deficit", "verified": False},
                    {"structure": "Esophagus", "constraint": "Dmax (0.035cc)", "limit": "<32-35 Gy", "endpoint": "Stenosis", "verified": False},
                ],
            },
        }
        
        # ============================================================
        # SRS CONSTRAINTS - Single Fraction
        # Source: TG-101, HyTEC (2021), UK Consensus, RTOG 90-05
        # All SRS constraints are unverified by default
        # ============================================================
        self.srs_constraints = {
            "brain": [
                {"structure": "Brainstem", "constraint": "Dmax (0.035cc)", "limit": "<15 Gy", "endpoint": "Necrosis", "verified": False},
                {"structure": "Brainstem", "constraint": "D0.5cc", "limit": "<10 Gy", "endpoint": "Necrosis", "verified": False},
                {"structure": "Optic Chiasm", "constraint": "Dmax", "limit": "<10 Gy", "endpoint": "Optic neuropathy", "verified": False},
                {"structure": "Optic Nerves", "constraint": "Dmax", "limit": "<10 Gy", "endpoint": "Optic neuropathy", "verified": False},
                {"structure": "Cochlea", "constraint": "Dmax", "limit": "<9 Gy", "endpoint": "Hearing loss", "verified": False},
                {"structure": "Lens", "constraint": "Dmax", "limit": "<1.5-2 Gy", "endpoint": "Cataract", "verified": False},
                {"structure": "Retina", "constraint": "Dmax (0.1cc)", "limit": "<8 Gy", "endpoint": "Retinopathy", "verified": False},
                {"structure": "Normal Brain", "constraint": "V12", "limit": "<5 cc", "endpoint": "Necrosis (~10%)", "verified": False},
                {"structure": "Normal Brain", "constraint": "V12", "limit": "<10 cc", "endpoint": "Necrosis (~15%)", "verified": False},
            ],
            "spine": [
                {"structure": "Spinal Cord", "constraint": "Dmax", "limit": "12.4-14 Gy", "endpoint": "Myelopathy (1-5%)", "verified": False},
                {"structure": "Spinal Cord", "constraint": "D0.35cc", "limit": "<10 Gy", "endpoint": "Myelopathy", "verified": False},
                {"structure": "Spinal Cord", "constraint": "D1.2cc", "limit": "<7 Gy", "endpoint": "Myelopathy", "verified": False},
                {"structure": "Cauda Equina", "constraint": "Dmax (0.035cc)", "limit": "<16 Gy", "endpoint": "Neurologic deficit", "verified": False},
                {"structure": "Cauda Equina", "constraint": "D5cc", "limit": "<14 Gy", "endpoint": "Neurologic deficit", "verified": False},
                {"structure": "Sacral Plexus", "constraint": "Dmax (0.035cc)", "limit": "<16 Gy", "endpoint": "Neuropathy", "verified": False},
            ],
        }

    def detect_fractionation_regime(self, dose: float, fractions: int) -> str:
        """Detect the fractionation regime based on dose and fractions.
        
        Returns one of: 'SRS', 'SBRT_3fx', 'SBRT_5fx', 'MODERATE_HYPOFX', 'CONVENTIONAL'
        
        Logic:
        - SRS: Single fraction (regardless of dose)
        - SBRT: ≥5 Gy/fraction with ≤8 fractions
        - Moderate hypofractionation: 2.5-5 Gy/fraction
        - Conventional: <2.5 Gy/fraction
        """
        if fractions <= 0:
            return "CONVENTIONAL"
            
        dose_per_fraction = dose / fractions
        
        # Single fraction - SRS
        if fractions == 1:
            return "SRS"
        
        # SBRT (≥5 Gy per fraction with ≤8 fractions)
        if dose_per_fraction >= 5 and fractions <= 8:
            if fractions <= 3:
                return "SBRT_3fx"
            else:
                return "SBRT_5fx"
        
        # Moderate hypofractionation (2.5-5 Gy/fx)
        if dose_per_fraction >= 2.5 and dose_per_fraction < 5:
            return "MODERATE_HYPOFX"
        
        # Conventional fractionation (<2.5 Gy/fx)
        return "CONVENTIONAL"
    
    def get_regime_label(self, regime: str) -> str:
        """Get a human-readable label for a fractionation regime.
        
        Args:
            regime: Regime code (SRS, SBRT_3fx, etc.)
            
        Returns:
            Human-readable label
        """
        labels = {
            "SRS": "SRS",
            "SBRT_3fx": "SBRT",
            "SBRT_5fx": "SBRT",
            "MODERATE_HYPOFX": "moderate hypofractionation",
            "CONVENTIONAL": "conventional fractionation"
        }
        return labels.get(regime, "conventional fractionation")
    
    def get_constraint_source_text(self, regime: str) -> str:
        """Get the constraint source description for methodology text.
        
        Args:
            regime: Fractionation regime code
            
        Returns:
            Source text for methodology section
        """
        if regime in ["SRS", "SBRT_3fx", "SBRT_5fx"]:
            return "Timmerman/TG-101 SBRT constraints"
        else:
            return "QUANTEC dose-volume constraints"
    
    # Mapping from structure name to anatomical region for grouping
    STRUCTURE_TO_REGION = {
        # CNS structures (brain + spinal cord)
        "brainstem": "CNS",
        "brain": "CNS",
        "normal brain": "CNS",
        "spinal cord": "CNS",
        "cauda equina": "CNS",
        "sacral plexus": "CNS",
        # Optics & Hearing structures
        "optic chiasm": "Optics & Hearing",
        "optic nerves": "Optics & Hearing",
        "lens": "Optics & Hearing",
        "retina": "Optics & Hearing",
        "cochlea": "Optics & Hearing",
        # Head & Neck structures
        "parotid (bilateral)": "Head & Neck",
        "parotid (single)": "Head & Neck",
        "larynx": "Head & Neck",
        "pharyngeal constrictors": "Head & Neck",
        # Thoracic structures
        "lungs (bilateral)": "Thorax",
        "heart": "Thorax",
        "esophagus": "Thorax",
        "brachial plexus": "Thorax",
        "great vessels": "Thorax",
        "proximal bronchial tree": "Thorax",
        "chest wall/ribs": "Thorax",
        "contralateral breast": "Thorax",
        # Abdominal structures
        "liver (normal)": "Abdomen",
        "kidneys (bilateral)": "Abdomen",
        "kidneys": "Abdomen",
        "stomach": "Abdomen",
        "duodenum": "Abdomen",
        "small bowel": "Abdomen",
        # Pelvic structures
        "rectum": "Pelvis",
        "bladder": "Pelvis",
        "femoral heads": "Pelvis",
        "penile bulb": "Pelvis",
        "urethra": "Pelvis",
        # Other
        "bone": "Extremity",
        "soft tissue": "Extremity",
    }
    
    def _get_region_for_structure(self, structure: str) -> str:
        """Get the anatomical region for a structure name.
        
        Args:
            structure: Structure name
            
        Returns:
            Region name (Brain, Spine, Thorax, etc.) or "Other"
        """
        structure_lower = structure.lower()
        
        # Check exact match first
        if structure_lower in self.STRUCTURE_TO_REGION:
            return self.STRUCTURE_TO_REGION[structure_lower]
        
        # Check partial matches
        for key, region in self.STRUCTURE_TO_REGION.items():
            if key in structure_lower or structure_lower in key:
                return region
        
        return "Other"
    
    def get_constraints_for_sites(
        self, 
        sites: List[str], 
        dose_calc_method: str = "Raw Dose",
        current_dose: float = None,
        current_fractions: int = None
    ) -> List[dict]:
        """Get all relevant dose constraints for treatment sites.
        
        NOTE: Constraints should be based on the CURRENT treatment site only, not prior sites.
        We're evaluating OARs in the current treatment region - prior treatment locations
        are used for dose summation, but don't affect which constraints apply.
        
        Selects appropriate constraint set based on:
        1. If dose_calc_method == "EQD2" → Always use QUANTEC (values are EQD2₂)
        2. If dose_calc_method == "Raw Dose" → Detect regime from fractionation
        
        Args:
            sites: List of treatment site names (typically just the current site)
            dose_calc_method: "Raw Dose" or "EQD2"
            current_dose: Current treatment dose in Gy
            current_fractions: Current treatment number of fractions
            
        Returns:
            Deduplicated list of constraint dictionaries with source attribution and region
        """
        # Determine which constraint set to use
        if dose_calc_method and "EQD2" in dose_calc_method:
            # EQD2 selected - use QUANTEC constraints (they're expressed as EQD2₂)
            regime = "QUANTEC"
            source_note = "QUANTEC (EQD2)"
        elif current_dose is not None and current_fractions is not None:
            # Raw dose - detect regime from fractionation
            regime = self.detect_fractionation_regime(current_dose, current_fractions)
            source_note = f"{regime}"
        else:
            # Default to QUANTEC if no fractionation info provided
            regime = "QUANTEC"
            source_note = "QUANTEC"
        
        print(f"DEBUG: Constraint selection - Method: {dose_calc_method}, Regime: {regime}")
        
        # Select constraint table based on regime
        if regime == "SRS":
            constraint_table = self.srs_constraints
        elif regime == "SBRT_3fx":
            constraint_table = self.timmerman_constraints.get("3fx", {})
        elif regime == "SBRT_5fx":
            constraint_table = self.timmerman_constraints.get("5fx", {})
        else:  # QUANTEC, CONVENTIONAL, or MODERATE_HYPOFX
            # Moderate hypofractionation and conventional use QUANTEC constraints
            constraint_table = self.quantec_constraints
        
        seen = set()  # Track structure+constraint combos we've added
        constraints = []
        
        for site in sites:
            site_lower = site.lower()
            if site_lower in constraint_table:
                for constraint in constraint_table[site_lower]:
                    # Skip unverified constraints - only show verified ones to users
                    if not constraint.get("verified", False):
                        continue
                    
                    # Create unique key from structure + constraint type
                    key = f"{constraint['structure']}_{constraint['constraint']}"
                    if key not in seen:
                        seen.add(key)
                        # Determine region for grouping
                        region = self._get_region_for_structure(constraint["structure"])
                        # Add source, regime, and region info to constraint
                        constraint_with_source = {
                            "structure": constraint["structure"],
                            "constraint": constraint["constraint"],
                            "limit": constraint["limit"],
                            "endpoint": constraint.get("endpoint", ""),
                            "source": source_note,
                            "unit": "Gy" if "Gy" in constraint["limit"] or "cc" in constraint["constraint"].lower() else "%",
                            "region": region,
                        }
                        constraints.append(constraint_with_source)
        
        return constraints
    
    def get_alpha_beta(self, structure: str) -> float:
        """Get α/β ratio for a given structure.
        
        Args:
            structure: Anatomical structure name
            
        Returns:
            α/β ratio in Gy
        """
        structure_lower = structure.lower()
        
        # Check for exact match
        if structure_lower in self.alpha_beta_ratios:
            return self.alpha_beta_ratios[structure_lower]
        
        # Check for partial match
        for key, value in self.alpha_beta_ratios.items():
            if key in structure_lower or structure_lower in key:
                return value
        
        # Default for late-responding tissues
        return self.alpha_beta_ratios["default_late"]
    
    def _format_constraint_section(self, constraints: List[dict]) -> str:
        """Format constraint section for writeup with blank spaces for physicist to fill in.
        
        Args:
            constraints: List of constraint dictionaries
            
        Returns:
            Formatted constraint text with blanks
        """
        if not constraints:
            return ""
        
        section = "\n\nDose Constraint Evaluation:\n"
        for constraint in constraints:
            section += f"• {constraint['structure']} - {constraint['constraint']}: _______ ({constraint['source']})\n"
        
        return section
    
    def _parse_limit_value(self, limit: str) -> float:
        """Parse a limit string to extract the numeric value for comparison.
        
        Handles formats like: "<54 Gy", "≤50%", "50 Gy", "<30-32 Gy" (takes first number)
        
        Args:
            limit: Limit string from constraint
            
        Returns:
            Numeric value or None if cannot parse
        """
        import re
        if not limit:
            return None
        
        # Remove comparison operators and find numbers
        # Handle ranges like "30-32" by taking first number
        numbers = re.findall(r'[\d.]+', limit)
        if numbers:
            try:
                return float(numbers[0])
            except ValueError:
                return None
        return None
    
    def _compare_value_to_limit(self, value_str: str, limit_str: str) -> str:
        """Compare an entered value to its limit.
        
        Returns: 'exceeded', 'within', or 'unknown'
        """
        import re
        if not value_str or not limit_str:
            return 'unknown'
        
        # Extract numeric value from the entered value
        value_numbers = re.findall(r'[\d.]+', value_str)
        if not value_numbers:
            return 'unknown'
        
        try:
            entered_value = float(value_numbers[0])
        except ValueError:
            return 'unknown'
        
        # Parse limit
        limit_value = self._parse_limit_value(limit_str)
        if limit_value is None:
            return 'unknown'
        
        # Determine if limit is "less than" type
        is_less_than = '<' in limit_str or '≤' in limit_str
        
        if is_less_than:
            # For "<54 Gy" type limits, value should be less than limit
            if entered_value > limit_value:
                return 'exceeded'
            else:
                return 'within'
        else:
            # For "50 Gy" or ">50%" type limits
            if '>' in limit_str:
                if entered_value < limit_value:
                    return 'exceeded'
                else:
                    return 'within'
            else:
                # Assume it's a max limit if no operator specified
                if entered_value > limit_value:
                    return 'exceeded'
                else:
                    return 'within'
    
    def _generate_smart_assessment(self, dose_statistics: List, physician: str, physicist: str) -> str:
        """Generate assessment text based on whether constraints are met or exceeded.
        
        Args:
            dose_statistics: List of DoseStatistic objects with value and limit
            physician: Physician name
            physicist: Physicist name
            
        Returns:
            Assessment paragraph text
        """
        if not dose_statistics:
            return (
                f"The composite dose distribution and DVH were reviewed. "
                f"This evaluation was reviewed and approved by Dr. {physician} and Dr. {physicist}."
            )
        
        # Analyze all filled statistics
        exceeded_constraints = []
        within_constraints = []
        unknown_constraints = []
        
        for stat in dose_statistics:
            if not stat.value or not stat.value.strip():
                continue
            
            result = self._compare_value_to_limit(stat.value, stat.limit)
            constraint_info = {
                'structure': stat.structure,
                'constraint_type': stat.constraint_type,
                'value': stat.value,
                'limit': stat.limit
            }
            
            if result == 'exceeded':
                exceeded_constraints.append(constraint_info)
            elif result == 'within':
                within_constraints.append(constraint_info)
            else:
                unknown_constraints.append(constraint_info)
        
        # Generate appropriate assessment
        if exceeded_constraints:
            # Constraints exceeded - note that this was considered during planning
            exceeded_list = ", ".join([
                f"{c['structure']} ({c['value']} vs limit {c['limit']})" 
                for c in exceeded_constraints
            ])
            
            assessment = (
                f"Composite dose analysis indicates that the following constraint(s) exceed standard limits: {exceeded_list}. "
            )
            
            if within_constraints:
                assessment += f"Other evaluated structures remain within acceptable limits. "
            
            assessment += (
                f"This was taken into consideration during the treatment planning process. "
                f"The composite dose distribution and DVH were reviewed and approved by Dr. {physician} and Dr. {physicist}."
            )
        else:
            # All constraints within limits
            assessment = (
                f"Composite dose analysis demonstrates acceptable normal tissue doses within institutional constraints. "
                f"The composite dose distribution and DVH were reviewed and approved by Dr. {physician} and Dr. {physicist}."
            )
        
        return assessment
    
    def _format_fractions(self, num_fractions: int) -> str:
        """Format fractions with proper singular/plural grammar.
        
        Args:
            num_fractions: Number of fractions
            
        Returns:
            Properly formatted "fraction" or "fractions"
        """
        return "fraction" if num_fractions == 1 else "fractions"
    
    def _format_dose_statistic(self, stat) -> str:
        """Format a dose statistic in clean clinical style.
        
        Format: • Spinal Cord Dmax: 30 Gy (limit <50 Gy per QUANTEC)
        
        Args:
            stat: DoseStatistic object with structure, constraint_type, value, limit, source, unit
            
        Returns:
            Formatted bullet point string
        """
        # Build value with unit if not already present
        value_display = stat.value
        if stat.unit and stat.unit not in stat.value:
            value_display = f"{stat.value} {stat.unit}"
        
        # Build limit+source string, removing redundant "(EQD2)" since it's in methodology
        # Don't include source if it's "Custom" - user-added constraints don't need source attribution
        is_custom = stat.source and stat.source.lower() == 'custom'
        
        if hasattr(stat, 'limit') and stat.limit and stat.source and not is_custom:
            clean_source = stat.source.replace(" (EQD2)", "")
            limit_source = f" (limit {stat.limit} per {clean_source})"
        elif hasattr(stat, 'limit') and stat.limit:
            limit_source = f" (limit {stat.limit})"
        elif stat.source and not is_custom:
            clean_source = stat.source.replace(" (EQD2)", "")
            limit_source = f" ({clean_source})"
        else:
            limit_source = ""
        
        return f"• {stat.structure} {stat.constraint_type}: {value_display}{limit_source}\n"
    
    def _sort_treatments_chronologically(self, treatments: List[PriorTreatment]) -> List[PriorTreatment]:
        """Sort prior treatments chronologically (earliest to most recent).
        
        Enhancement 5: Ensures clear clinical timeline in writeups.
        
        Args:
            treatments: List of prior treatments
            
        Returns:
            Sorted list of treatments from earliest to most recent
        """
        # Month name to number mapping
        month_map = {
            "January": 1, "February": 2, "March": 3, "April": 4,
            "May": 5, "June": 6, "July": 7, "August": 8,
            "September": 9, "October": 10, "November": 11, "December": 12
        }
        
        def get_sort_key(treatment):
            month_num = month_map.get(treatment.month, 1)
            return (treatment.year, month_num)
        
        return sorted(treatments, key=get_sort_key)
    
    def _generate_methodology_text(self, method_abbreviation: str, any_dicom_unavailable: bool, constraint_source: str = None) -> str:
        """Generate methodology section based on DICOM availability and fractionation regime.
        
        Enhancement 1: Fix DICOM unavailable + overlap logic.
        When DICOM files are unavailable, we cannot reconstruct dose in Velocity,
        so we use a conservative estimation approach.
        
        Enhancement 2: Include constraint source reference (QUANTEC vs Timmerman).
        
        Enhancement 3: Alpha/beta ratios only mentioned for EQD2 (not Raw Dose).
        
        Args:
            method_abbreviation: EQD2, BED, or Raw Dose
            any_dicom_unavailable: True if any overlapping treatment has DICOM unavailable
            constraint_source: Constraint reference source (e.g., "QUANTEC dose-volume constraints")
            
        Returns:
            Appropriate methodology text
        """
        # Default constraint source if not provided
        if not constraint_source:
            constraint_source = "institutional dose-volume constraints"
        
        # Alpha/beta ratio text only applies to EQD2/BED, not Raw Dose
        uses_biologic_correction = method_abbreviation in ["EQD2", "BED"]
        alpha_beta_text = " with an alpha/beta ratio of 2 for spinal cord and 3 for all other organs at risk" if uses_biologic_correction else ""
        
        if any_dicom_unavailable:
            # Conservative approach when DICOM unavailable
            return (
                "Due to unavailable DICOM files, the previous treatment dose distribution could not be "
                "directly reconstructed in Velocity. Dose constraints are therefore "
                "estimated based on available treatment records and clinical assessment of overlapping anatomy. "
                f"Dose estimation uses {method_abbreviation} methodology{alpha_beta_text}, referencing {constraint_source}. "
                "A conservative approach is recommended given the uncertainty in composite dose calculation without direct dose summation.\n"
            )
        else:
            # Normal reconstruction methodology
            return (
                "The previous treatment was reconstructed on the current patient CT for summation "
                f"with the current plan in Velocity. Dose constraints are evaluated using {method_abbreviation} methodology{alpha_beta_text}, "
                f"referencing {constraint_source}.\n"
            )
    
    def _generate_multi_methodology_text(self, method_abbreviation: str, any_dicom_unavailable: bool, constraint_source: str = None) -> str:
        """Generate methodology section for multiple prior treatments.
        
        Enhancement 1: Fix DICOM unavailable + overlap logic for multiple treatments.
        Enhancement 2: Include constraint source reference (QUANTEC vs Timmerman).
        Enhancement 3: Alpha/beta ratios only mentioned for EQD2 (not Raw Dose).
        
        Args:
            method_abbreviation: EQD2, BED, or Raw Dose
            any_dicom_unavailable: True if any overlapping treatment has DICOM unavailable
            constraint_source: Constraint reference source (e.g., "QUANTEC dose-volume constraints")
            
        Returns:
            Appropriate methodology text
        """
        # Default constraint source if not provided
        if not constraint_source:
            constraint_source = "institutional dose-volume constraints"
        
        # Alpha/beta ratio text only applies to EQD2/BED, not Raw Dose
        uses_biologic_correction = method_abbreviation in ["EQD2", "BED"]
        alpha_beta_text = " with an alpha/beta ratio of 2 for spinal cord and 3 for all other organs at risk" if uses_biologic_correction else ""
        
        if any_dicom_unavailable:
            # Conservative approach when any DICOM unavailable
            return (
                "Due to unavailable DICOM files for one or more prior treatments, the previous dose distributions "
                "could not be completely reconstructed in Velocity. Available treatments were "
                "reconstructed where possible, and dose constraints for treatments without DICOM files are estimated "
                "based on available treatment records and clinical assessment of overlapping anatomy. "
                f"Dose estimation uses {method_abbreviation} methodology{alpha_beta_text}, referencing {constraint_source}. "
                "A conservative approach is recommended given the uncertainty in composite dose calculation.\n"
            )
        else:
            # Normal reconstruction methodology
            return (
                "The previous treatment(s) were reconstructed on the current patient CT for summation "
                f"with the current plan in Velocity. Dose constraints are evaluated using {method_abbreviation} methodology{alpha_beta_text}, "
                f"referencing {constraint_source}.\n"
            )
    
    def generate_prior_dose_writeup(self, request: PriorDoseRequest) -> PriorDoseResponse:
        """Generate a prior dose write-up based on the request data."""
        # DEBUG: Log the incoming request data
        print(f"\nDEBUG: generate_prior_dose_writeup called!")
        print(f"DEBUG: Physician: {request.common_info.physician.name}")
        print(f"DEBUG: Current site: {request.prior_dose_data.current_site}")
        print(f"DEBUG: Current dose: {request.prior_dose_data.current_dose} Gy in {request.prior_dose_data.current_fractions} fractions")
        print(f"DEBUG: Prior treatments ({len(request.prior_dose_data.prior_treatments)}):")
        for i, treatment in enumerate(request.prior_dose_data.prior_treatments):
            overlap_status = "OVERLAP" if treatment.has_overlap else "no overlap"
            print(f"  [{i+1}] {treatment.site}: {treatment.dose} Gy in {treatment.fractions} fx ({treatment.month} {treatment.year}) - {overlap_status}")
        print(f"DEBUG: Dose calc method: {request.prior_dose_data.dose_calc_method}")
        
        common_info = request.common_info
        prior_dose_data = request.prior_dose_data
        
        # Generate write-up using the same pattern detection logic as fusion
        writeup = self._generate_prior_dose_text(common_info, prior_dose_data)
        
        return PriorDoseResponse(writeup=writeup)
    
    def _generate_prior_dose_text(self, common_info, prior_dose_data) -> str:
        """Generate the prior dose text following fusion's pattern-based approach."""
        
        physician = common_info.physician.name
        physicist = common_info.physicist.name
        
        # Use custom site if provided, otherwise use standard site
        current_site = prior_dose_data.custom_current_site if prior_dose_data.custom_current_site else prior_dose_data.current_site
        current_dose = prior_dose_data.current_dose
        current_fractions = prior_dose_data.current_fractions
        spine_location = prior_dose_data.spine_location or ""
        prior_treatments = prior_dose_data.prior_treatments
        dose_calc_method = prior_dose_data.dose_calc_method
        critical_structures = prior_dose_data.critical_structures
        
        # DETECTION LOGIC (following fusion pattern)
        num_prior_treatments = len(prior_treatments)
        has_spine_location = current_site == "spine" and spine_location
        
        # Check if ANY prior treatment has overlap
        any_overlap = any(t.has_overlap for t in prior_treatments)
        
        print(f"DEBUG: Detection - Prior treatments: {num_prior_treatments}, Any overlap: {any_overlap}")
        
        if num_prior_treatments == 0:
            print("DEBUG: NO PRIOR TREATMENTS DETECTED!")
            return self._generate_no_prior_text(physician, physicist, current_site, current_dose, current_fractions, spine_location)
        elif num_prior_treatments == 1:
            print("DEBUG: SINGLE PRIOR TREATMENT DETECTED!")
            return self._generate_single_prior_text(physician, physicist, current_site, current_dose, current_fractions, spine_location, prior_treatments[0], dose_calc_method, critical_structures, prior_dose_data)
        else:
            print("DEBUG: MULTIPLE PRIOR TREATMENTS DETECTED!")
            return self._generate_multiple_prior_text(physician, physicist, current_site, current_dose, current_fractions, spine_location, prior_treatments, dose_calc_method, critical_structures, prior_dose_data)
    
    def _generate_no_prior_text(self, physician: str, physicist: str, current_site: str, current_dose: float, current_fractions: int, spine_location: str) -> str:
        """Generate text for no prior treatments (basic case)."""
        
        # Format site with spine location if applicable
        current_site_display = current_site
        if current_site == "spine" and spine_location:
            current_site_display = f"{spine_location} spine"
        
        # Clean up integers
        current_dose_display = int(current_dose) if current_dose == int(current_dose) else current_dose
        current_fractions_display = int(current_fractions)
        
        # Format treatment with proper grammar
        fraction_word = self._format_fractions(current_fractions_display)
        current_treatment = f"{current_dose_display} Gy in {current_fractions_display} {fraction_word}"
        
        writeup = f"Dr. {physician} requested a medical physics consultation for --- for a prior dose assessment.\n\n"
        
        writeup += f"Patient Information:\n"
        writeup += f"The patient is currently being planned for {current_treatment} to the {current_site_display}. "
        writeup += "The patient has no history of prior radiation treatments.\n\n"
        
        writeup += f"Assessment:\n"
        writeup += f"The proposed treatment of {current_treatment} to the {current_site_display} can proceed as planned with standard toxicity monitoring. "
        writeup += f"This evaluation was reviewed and approved by the radiation oncologist, Dr. {physician}, and the medical physicist, Dr. {physicist}."
        
        return writeup
    
    def _generate_single_prior_text(self, physician: str, physicist: str, current_site: str, current_dose: float, current_fractions: int, spine_location: str, prior_treatment: PriorTreatment, dose_calc_method: str, critical_structures: List[str], prior_dose_data) -> str:
        """Generate text for single prior treatment."""
        
        # Format current site
        current_site_display = current_site
        if current_site == "spine" and spine_location:
            current_site_display = f"{spine_location} spine"
        
        # Clean up current treatment integers
        current_dose_display = int(current_dose) if current_dose == int(current_dose) else current_dose
        current_fractions_display = int(current_fractions)
        current_fraction_word = self._format_fractions(current_fractions_display)
        current_treatment = f"{current_dose_display} Gy in {current_fractions_display} {current_fraction_word}"
        
        # Detect fractionation regime for current treatment
        current_regime = self.detect_fractionation_regime(current_dose, current_fractions)
        prior_regime = self.detect_fractionation_regime(prior_treatment.dose, prior_treatment.fractions)
        
        # Format prior treatment
        prior_dose_display = int(prior_treatment.dose) if prior_treatment.dose == int(prior_treatment.dose) else prior_treatment.dose
        prior_fractions_display = int(prior_treatment.fractions)
        prior_fraction_word = self._format_fractions(prior_fractions_display)
        
        # Use custom site if provided, otherwise use standard site
        prior_site_display = prior_treatment.custom_site if prior_treatment.custom_site else prior_treatment.site
        if prior_site_display == "spine" and prior_treatment.spine_location:
            prior_site_display = f"{prior_treatment.spine_location} spine"
        
        # Get method abbreviation
        if dose_calc_method.startswith("BED"):
            method_abbreviation = "BED"
        elif dose_calc_method.startswith("EQD2"):
            method_abbreviation = "EQD2"
        else:
            method_abbreviation = "Raw Dose"
        
        # Determine constraint source based on current treatment regime and dose calc method
        # EQD2 always uses QUANTEC; Raw Dose uses regime-appropriate constraints
        if "EQD2" in dose_calc_method:
            constraint_source = "QUANTEC dose-volume constraints"
        else:
            constraint_source = self.get_constraint_source_text(current_regime)
        
        if prior_treatment.has_overlap:
            # STRUCTURED FORMAT FOR OVERLAP CASES
            writeup = f"Dr. {physician} requested a medical physics consultation for --- for a prior dose assessment. This consultation provides dosimetric analysis and planning guidance for composite dose evaluation.\n\n"
            
            # PATIENT INFORMATION (includes current treatment and prior radiation history)
            writeup += f"Patient Information:\n"
            writeup += f"The patient has a {current_site_display} lesion, currently planned for {current_dose_display} Gy in {current_fractions_display} {current_fraction_word} to the {current_site_display}. "
            writeup += f"In {prior_treatment.month} {prior_treatment.year}, the patient received external beam radiotherapy of {prior_dose_display} Gy in {prior_fractions_display} {prior_fraction_word} to the {prior_site_display}. "
            if prior_treatment.dicoms_unavailable:
                writeup += f"DICOM files for this treatment were unavailable for reconstruction. "
            writeup += f"The current course of treatment has overlap with the previous treatment"
            if critical_structures:
                writeup += f" on the {', '.join(critical_structures)}"
            writeup += f".\n\n"
            
            # ANALYSIS - DICOM-aware methodology, constraint source, and dose statistics
            writeup += f"Analysis:\n"
            writeup += self._generate_methodology_text(method_abbreviation, prior_treatment.dicoms_unavailable, constraint_source)
            
            # Dose statistics integrated under Analysis
            dose_statistics = prior_dose_data.dose_statistics if hasattr(prior_dose_data, 'dose_statistics') else []
            filled_statistics = [stat for stat in dose_statistics if stat.value and stat.value.strip()]
            
            if filled_statistics:
                writeup += f"Below are the dose statistics:\n"
                for stat in filled_statistics:
                    writeup += self._format_dose_statistic(stat)
            
            # ASSESSMENT - Smart analysis of whether constraints are exceeded
            writeup += f"\nAssessment:\n"
            writeup += self._generate_smart_assessment(dose_statistics, physician, physicist)
        else:
            # NO OVERLAP CASE - simpler format (no need to mention DICOM availability since we're not reconstructing)
            writeup = f"Dr. {physician} requested a medical physics consultation for --- for a prior dose assessment.\n\n"
            
            # PATIENT INFORMATION (includes current treatment and prior radiation history)
            writeup += f"Patient Information:\n"
            writeup += f"The patient has a {current_site_display} lesion, currently planned for {current_dose_display} Gy in {current_fractions_display} {current_fraction_word} to the {current_site_display}. "
            writeup += f"In {prior_treatment.month} {prior_treatment.year}, the patient received external beam radiotherapy of {prior_dose_display} Gy in {prior_fractions_display} {prior_fraction_word} to the {prior_site_display}.\n\n"
            
            writeup += f"Assessment:\n"
            writeup += f"Review of the prior treatment fields and current treatment plan indicates minimal to no overlap between treatment volumes. "
            writeup += f"The distance between field edges is sufficient to ensure that critical structures will not receive excessive cumulative dose. "
            writeup += f"The proposed treatment can proceed as planned with standard toxicity monitoring. "
            writeup += f"This evaluation was reviewed and approved by Dr. {physician} and Dr. {physicist}."
        
        return writeup
    
    def _generate_multiple_prior_text(self, physician: str, physicist: str, current_site: str, current_dose: float, current_fractions: int, spine_location: str, prior_treatments: List[PriorTreatment], dose_calc_method: str, critical_structures: List[str], prior_dose_data) -> str:
        """Generate text for multiple prior treatments."""
        
        # Format current site
        current_site_display = current_site
        if current_site == "spine" and spine_location:
            current_site_display = f"{spine_location} spine"
        
        # Clean up current treatment integers
        current_dose_display = int(current_dose) if current_dose == int(current_dose) else current_dose
        current_fractions_display = int(current_fractions)
        current_fraction_word = self._format_fractions(current_fractions_display)
        current_treatment = f"{current_dose_display} Gy in {current_fractions_display} {current_fraction_word}"
        
        # Detect fractionation regime for current treatment
        current_regime = self.detect_fractionation_regime(current_dose, current_fractions)
        
        # Check if ANY treatment has overlap
        overlapping_treatments = [t for t in prior_treatments if t.has_overlap]
        
        # Get method abbreviation
        if dose_calc_method.startswith("BED"):
            method_abbreviation = "BED"
        elif dose_calc_method.startswith("EQD2"):
            method_abbreviation = "EQD2"
        else:
            method_abbreviation = "Raw Dose"
        
        # Determine constraint source based on current treatment regime and dose calc method
        # EQD2 always uses QUANTEC; Raw Dose uses regime-appropriate constraints
        if "EQD2" in dose_calc_method:
            constraint_source = "QUANTEC dose-volume constraints"
        else:
            constraint_source = self.get_constraint_source_text(current_regime)
        
        if overlapping_treatments:
            # STRUCTURED FORMAT FOR OVERLAP CASES
            writeup = f"Dr. {physician} requested a medical physics consultation for --- for a prior dose assessment. This consultation provides dosimetric analysis and planning guidance for composite dose evaluation.\n\n"
            
            # PATIENT INFORMATION (includes current treatment and prior radiation history)
            writeup += f"Patient Information:\n"
            writeup += f"The patient has a {current_site_display} lesion, currently planned for {current_dose_display} Gy in {current_fractions_display} {current_fraction_word} to the {current_site_display}. "
            
            # Prior treatments - sorted chronologically
            sorted_treatments = self._sort_treatments_chronologically(prior_treatments)
            for i, treatment in enumerate(sorted_treatments):
                prior_dose_display = int(treatment.dose) if treatment.dose == int(treatment.dose) else treatment.dose
                prior_fractions_display = int(treatment.fractions)
                prior_fraction_word = self._format_fractions(prior_fractions_display)
                
                # Use custom site if provided, otherwise use standard site
                prior_site_display = treatment.custom_site if treatment.custom_site else treatment.site
                if prior_site_display == "spine" and treatment.spine_location:
                    prior_site_display = f"{treatment.spine_location} spine"
                
                writeup += f"In {treatment.month} {treatment.year}, the patient received external beam radiotherapy of {prior_dose_display} Gy in {prior_fractions_display} {prior_fraction_word} to the {prior_site_display}. "
                if treatment.dicoms_unavailable:
                    writeup += f"DICOM files for this treatment were unavailable for reconstruction. "
            
            # Add overlap statement
            writeup += f"The current course of treatment has overlap with "
            if len(overlapping_treatments) == 1:
                writeup += f"one of the previous treatments"
            else:
                writeup += f"{len(overlapping_treatments)} of the previous treatments"
            
            if critical_structures:
                writeup += f" on the {', '.join(critical_structures)}"
            writeup += f".\n\n"
            
            # ANALYSIS - DICOM-aware methodology, constraint source, and dose statistics
            # Check if any overlapping treatment has DICOM unavailable
            any_dicom_unavailable = any(t.dicoms_unavailable for t in overlapping_treatments)
            writeup += f"Analysis:\n"
            writeup += self._generate_multi_methodology_text(method_abbreviation, any_dicom_unavailable, constraint_source)
            
            # Dose statistics integrated under Analysis
            dose_statistics = prior_dose_data.dose_statistics if hasattr(prior_dose_data, 'dose_statistics') else []
            filled_statistics = [stat for stat in dose_statistics if stat.value and stat.value.strip()]
            
            if filled_statistics:
                writeup += f"Below are the dose statistics:\n"
                for stat in filled_statistics:
                    writeup += self._format_dose_statistic(stat)
            
            # ASSESSMENT - Smart analysis of whether constraints are exceeded
            writeup += f"\nAssessment:\n"
            writeup += self._generate_smart_assessment(dose_statistics, physician, physicist)
        else:
            # NO OVERLAP CASE - simpler format (no need to mention DICOM availability since we're not reconstructing)
            writeup = f"Dr. {physician} requested a medical physics consultation for --- for a prior dose assessment.\n\n"
            
            # PATIENT INFORMATION (includes current treatment and prior radiation history)
            writeup += f"Patient Information:\n"
            writeup += f"The patient has a {current_site_display} lesion, currently planned for {current_dose_display} Gy in {current_fractions_display} {current_fraction_word} to the {current_site_display}. "
            
            # Prior treatments - sorted chronologically
            sorted_treatments = self._sort_treatments_chronologically(prior_treatments)
            for i, treatment in enumerate(sorted_treatments):
                prior_dose_display = int(treatment.dose) if treatment.dose == int(treatment.dose) else treatment.dose
                prior_fractions_display = int(treatment.fractions)
                prior_fraction_word = self._format_fractions(prior_fractions_display)
                
                # Use custom site if provided, otherwise use standard site
                prior_site_display = treatment.custom_site if treatment.custom_site else treatment.site
                if prior_site_display == "spine" and treatment.spine_location:
                    prior_site_display = f"{treatment.spine_location} spine"
                
                writeup += f"In {treatment.month} {treatment.year}, the patient received external beam radiotherapy of {prior_dose_display} Gy in {prior_fractions_display} {prior_fraction_word} to the {prior_site_display}. "
            
            writeup += f"\n\nAssessment:\n"
            writeup += f"Review of the prior treatment fields and current treatment plan indicates minimal to no overlap between treatment volumes. "
            writeup += f"The distance between field edges is sufficient to ensure that critical structures will not receive excessive cumulative dose. "
            writeup += f"The proposed treatment can proceed as planned with standard toxicity monitoring. "
            writeup += f"This evaluation was reviewed and approved by Dr. {physician} and Dr. {physicist}."
        
        return writeup