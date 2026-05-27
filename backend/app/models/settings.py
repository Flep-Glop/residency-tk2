from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON, Text
from sqlalchemy.sql import func
from app.database import Base

DEFAULT_VISIBLE_MODULES = {
    "fusion": True, "prior_dose": True, "pacemaker": True,
    "sbrt": True, "srs": True, "tbi": True, "hdr": True, "dibh": True
}

DEFAULT_FACILITY_DEFAULTS = {
    "srs": {
        "planning_system": "BrainLAB Elements",
        "accelerator": "Versa HD",
        "tracking_system": "ExacTrac",
        "immobilization_device": "rigid aquaplast head mask",
        "mri_sequence": "T1-weighted, post Gd contrast",
        "ct_slice_thickness": 1.25
    },
    "tbi": {
        "energy": "6 MV",
        "dose_rate_range": "10 - 15 cGy/min",
        "machine_dose_rate": "200 MU/min"
    },
    "sbrt": {
        "planning_system": "Pinnacle",
        "accelerator": "VersaHD",
        "imaging_system": "kV-CBCT",
        "gating_system": "C-RAD CatalystHD"
    },
    "hdr": {
        "afterloader": "ELEKTA Ir-192 remote afterloader",
        "planning_system": "Oncentra",
        "ct_slice_thickness": 3.0
    },
    "dibh": {
        "scanning_system": "C-RAD",
        "gating_device": "C-RAD CatalystHD"
    }
}

DEFAULT_MODULE_PRESETS = {
    "sbrt": {
        "treatment_sites": [
            {"id": "liver", "label": "Liver"},
            {"id": "lung", "label": "Lung"},
            {"id": "prostate", "label": "Prostate"},
            {"id": "breast", "label": "Breast"},
            {"id": "kidney", "label": "Kidney"},
            {"id": "pancreas", "label": "Pancreas"}
        ],
        "breathing_techniques": [
            {"value": "freebreathe", "label": "FB"},
            {"value": "4DCT", "label": "4DCT"},
            {"value": "DIBH", "label": "DIBH"}
        ]
    },
    "srs": {
        "srs_dose_presets": [14, 16, 18, 20, 22],
        "srt_dose_presets": [
            {"dose": 18, "fractions": 3},
            {"dose": 25, "fractions": 5},
            {"dose": 30, "fractions": 5}
        ]
    },
    "tbi": {
        "regimens": {
            "2gy1fx": {"dose": 2.0, "fractions": 1, "lung_blocks": "none"},
            "4gy1fx": {"dose": 4.0, "fractions": 1, "lung_blocks": "none"},
            "12gy6fx": {"dose": 12.0, "fractions": 6, "lung_blocks": None},
            "13.2gy8fx": {"dose": 13.2, "fractions": 8, "lung_blocks": None}
        },
        "setup_options": ["AP/PA", "Lateral"],
        "hvl_options": ["1 HVL", "2 HVL", "3 HVL"]
    },
    "dibh": {
        "treatment_sites": ["left breast", "right breast", "diaphragm", "chest wall"],
        "rx_presets": [
            {"dose": 50, "fractions": 25},
            {"dose": 40, "fractions": 15}
        ],
        "boost_presets": [
            {"dose": 10, "fractions": 5},
            {"dose": 16, "fractions": 8}
        ]
    },
    "hdr": {
        "applicators": [
            {"type": "VC", "site": "gynecological", "channels": 1},
            {"type": "T&O", "site": "gynecological", "channels": 3},
            {"type": "Hybrid T&O", "site": "gynecological", "channels": None},
            {"type": "SYED-Gyn", "site": "gynecological", "channels": None},
            {"type": "SYED-Prostate", "site": "prostate", "channels": None}
        ]
    },
    "fusion": {
        "anatomical_regions": [
            {"value": "brain", "label": "Brain"},
            {"value": "head and neck", "label": "Head & Neck"},
            {"value": "thoracic", "label": "Thoracic"},
            {"value": "abdominal", "label": "Abdominal"},
            {"value": "pelvic", "label": "Pelvic"},
            {"value": "spinal", "label": "Spinal"}
        ]
    },
    "prior_dose": {
        "region_order": [
            "CNS", "Optics & Hearing", "Head & Neck", "Thorax",
            "Abdomen", "Pelvis", "Extremity", "Custom", "Other"
        ],
        "region_colors": {
            "CNS": "purple",
            "Optics & Hearing": "cyan",
            "Head & Neck": "teal",
            "Thorax": "orange",
            "Abdomen": "yellow",
            "Pelvis": "pink",
            "Extremity": "green",
            "Custom": "blue",
            "Other": "gray"
        }
    }
}


class ClinicProfile(Base):
    __tablename__ = "clinic_profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    physicians = Column(JSON, default=list)
    physicists = Column(JSON, default=list)
    visible_modules = Column(JSON, default=lambda: DEFAULT_VISIBLE_MODULES.copy())
    facility_defaults = Column(JSON, default=lambda: DEFAULT_FACILITY_DEFAULTS.copy())
    module_presets = Column(JSON, default=lambda: DEFAULT_MODULE_PRESETS.copy())
    icon = Column(Text, nullable=True)
    edit_code_hash = Column(String, nullable=True)
    is_active = Column(Boolean, default=False)
    is_system = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
