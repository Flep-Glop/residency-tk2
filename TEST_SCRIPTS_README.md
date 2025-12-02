# Module QA Test Scripts

This directory contains automated test scripts for comprehensive QA testing of modules before clinical use.

## Prerequisites

1. **Backend must be running**
   ```bash
   ./start.sh
   ```

2. **Python 3 with requests library**
   ```bash
   pip3 install requests
   ```

## Test Scripts

### 1. `test_fusion_combinations.py` - Fusion Type Combinations

Tests all possible combinations of fusion types (MRI, PET/CT, CT) with rigid/deformable registration methods.

**What it tests:**
- Single fusion types (5 variations)
- Double fusion combinations (15 variations)
- Triple fusion combinations (12 representative variations)
- Special cases (bladder filling study)

**Standardized inputs:**
- Physician: Dr. Galvan
- Physicist: Dr. Kirby
- Lesion: brain
- Anatomical Region: brain

**Usage:**
```bash
python3 test_fusion_combinations.py
```

**Output:** `fusion_writeup_test_results.md` (~33 test cases)

---

### 2. `test_fusion_lesions.py` - Lesion Variations

Tests all available lesion types with consistent fusion configurations to validate anatomical region mapping and terminology.

**What it tests:**
- All 19 standard lesion types
- 2 standard fusion configurations per lesion
- 3 custom lesion examples

**Standardized inputs:**
- Physician: Dr. Galvan
- Physicist: Dr. Kirby
- Fusion Type 1: Single MRI (Rigid)
- Fusion Type 2: MRI (Rigid) + PET/CT (Deformable)

**Usage:**
```bash
python3 test_fusion_lesions.py
```

**Output:** `fusion_lesion_test_results.md` (~41 test cases)

---

### 3. `test_dibh_comprehensive.py` - DIBH Module Comprehensive Testing

Tests all treatment sites, boost/no boost combinations, custom sites, and edge cases for DIBH module.

**What it tests:**
- Standard treatment sites without boost (7 tests)
- Boost combinations (4 tests)
- Custom treatment sites (3 tests)
- Edge cases and unusual fractionation (6 tests)

**Automated quality checks:**
- No patient demographics (age/sex)
- Correct grammar ("were created" not "was created")
- Proper treatment site mention
- Boost formatting
- Immobilization device assignment
- Cardiac dose mention for left breast

**Standardized inputs:**
- Physician: Dr. Galvan
- Physicist: Dr. Kirby

**Usage:**
```bash
python3 test_dibh_comprehensive.py
```

**Output:** `dibh_qa_results.md` (20 test cases)

---

### 4. `test_tbi_comprehensive.py` - TBI Module Comprehensive Testing

Tests all fractionation regimens, setup types, and lung block options for TBI module.

**What it tests:**
- Standard fractionation regimens with AP/PA setup (4 tests)
- Lung block variations with 12 Gy regimen (3 tests)
- Lateral setup variations (3 tests)
- Complex combinations (3 tests)

**Automated quality checks:**
- No patient demographics (age/sex)
- No diagnosis/indication mentioned
- Proper Dr. prefix for physician names
- Correct fraction grammar (singular/plural)
- HVL specification in lung blocks text
- Setup description (two AP/PA vs two lateral)
- Aluminum filters and diode dosimeters mentioned

**Standardized inputs:**
- Physician: Dr. Galvan
- Physicist: Dr. Kirby

**Usage:**
```bash
python3 test_tbi_comprehensive.py
```

**Output:** `tbi_qa_results.md` (13 test cases)

---

### 5. `test_hdr_comprehensive.py` - HDR Module Comprehensive Testing

Tests all applicator types, channel variations, treatment sites, and edge cases for HDR brachytherapy module.

**What it tests:**
- Standard applicator types with default configurations (6 tests: VC, T&O, Utrecht, GENEVA, SYED-Gyn, SYED-Prostate)
- Channel variations for grammar testing (5 tests: 1-25 channels)
- Treatment site variations (3 tests: gynecological vs prostate)
- Edge cases and custom configurations (4 tests)

**Automated quality checks:**
- No patient demographics (age/sex)
- Proper Dr. prefix for physician and physicist names
- Correct channel grammar (one/two/three/N channels)
- HDR-specific content (Ir-192 source, lithotomy position, CT scan)
- Critical structures mentioned (bladder, rectum, intestines, sigmoid)
- Planning system (Oncentra) mentioned
- Applicator digitization described
- Radiation survey with proper reading (0.2 mR/hr)
- Proper article usage (a vs an)

**Standardized inputs:**
- Physician: Dr. Galvan
- Physicist: Dr. Kirby

**Usage:**
```bash
python3 test_hdr_comprehensive.py
```

**Output:** `hdr_qa_results.md` (18 test cases)

---

## QA Review Workflow

### Step 1: Run Tests
```bash
# Make sure backend is running
./start.sh

# Run fusion type combination tests
python3 test_fusion_combinations.py

# Run lesion variation tests
python3 test_fusion_lesions.py

# Run DIBH comprehensive tests
python3 test_dibh_comprehensive.py

# Run TBI comprehensive tests
python3 test_tbi_comprehensive.py

# Run HDR comprehensive tests
python3 test_hdr_comprehensive.py
```

### Step 2: Review Output Files

All scripts generate markdown files with test results:
- `fusion_writeup_test_results.md`
- `fusion_lesion_test_results.md`
- `dibh_qa_results.md`
- `tbi_qa_results.md`
- `hdr_qa_results.md`

### Step 3: QA Checklist

For each write-up, verify:

**Grammar & Style:**
- [ ] Singular/plural agreement ("fusion" vs "fusions", "study" vs "studies")
- [ ] Article usage ("a" vs "an" - e.g., "An MRI study" not "A MRI study")
- [ ] Consistent tense and voice
- [ ] Proper sentence structure and punctuation

**Medical Terminology:**
- [ ] Accurate anatomical region references
- [ ] Correct modality names (MRI, PET/CT, CT)
- [ ] Proper registration method descriptions (rigid vs deformable)
- [ ] Appropriate clinical language

**Content Accuracy:**
- [ ] Physician/physicist names correct (Dr. Galvan, Dr. Kirby)
- [ ] Patient identifier placeholder (`---`) present
- [ ] Lesion/anatomical landmarks appropriate for region
- [ ] Registration workflow steps in logical order

**Formatting:**
- [ ] No formatting artifacts (extra spaces, missing punctuation)
- [ ] Consistent paragraph structure
- [ ] Professional tone maintained throughout
- [ ] Newlines and spacing appropriate

### Step 4: Document Issues

If any issues found:
1. Note the specific test case name
2. Document the issue type (grammar, terminology, logic, etc.)
3. Create issue in project tracker or notify development team
4. Retest after fixes are applied

---

## Understanding Test Coverage

### Fusion Type Combinations (`test_fusion_combinations.py`)

This script tests the **logical combinations** of different fusion types:

**Single Fusions (5):**
- 1 MRI Rigid
- 1 PET/CT Rigid
- 1 PET/CT Deformable
- 1 CT Rigid
- 1 CT Deformable

**Double Fusions (15):**
- All unique pairs (e.g., MRI + PET Rigid, MRI + CT Deformable, etc.)
- Multiple of same type (e.g., 2x MRI, 2x PET Rigid, etc.)

**Triple Fusions (12 representative):**
- Three of same type (e.g., 3x MRI, 3x PET Rigid)
- Mixed modalities (e.g., MRI + PET Rigid + CT Deformable)
- All different modalities (e.g., MRI + PET + CT)

**Special Cases (1):**
- Bladder filling study (full/empty comparison)

### Lesion Variations (`test_fusion_lesions.py`)

This script tests **anatomical variation** with consistent fusion configs:

**Anatomical Regions Covered:**
- Brain (2 lesions)
- Head and Neck (5 lesions)
- Thoracic (6 lesions)
- Abdominal (2 lesions)
- Pelvic (4 lesions)

**Total: 19 standard lesions + 3 custom examples**

---

## Extending the Tests

### Adding New Fusion Types

Edit `test_fusion_combinations.py`:

```python
FUSION_TYPES = {
    "MRI": {"secondary": "MRI", "method": "Rigid"},
    # Add new type here:
    "NEW_TYPE": {"secondary": "MODALITY", "method": "METHOD"},
}
```

### Adding New Lesions

Edit `test_fusion_lesions.py`:

```python
LESION_TYPES = {
    "brain": "brain",
    # Add new lesion here:
    "new_lesion": "anatomical_region",
}
```

### Changing Standard Inputs

Both scripts use constants at the top:

```python
PHYSICIAN_NAME = "Galvan"  # Change here
PHYSICIST_NAME = "Kirby"   # Change here
```

---

## Troubleshooting

**"Backend is not running" error:**
```bash
# Start backend
./start.sh

# Verify it's running
curl http://localhost:8000/health
```

**"Module not found: requests" error:**
```bash
pip3 install requests
```

**API timeout errors:**
- Check backend logs for errors
- Verify API is accessible: `curl http://localhost:8000/api/fusion/generate`
- Increase timeout in script if needed

**Empty or incorrect write-ups:**
- Check backend service code for recent changes
- Verify database/cache is not corrupted
- Restart backend: `./stop.sh && ./start.sh`

---

## Notes

- These scripts test the **backend API directly** via HTTP requests
- Frontend UI is bypassed to isolate backend logic
- Test results are deterministic (same inputs = same outputs)
- Scripts can be integrated into CI/CD pipeline for automated QA
- Output markdown files are human-readable and diff-friendly for version control

---

## Contact

For questions about these test scripts or QA process, contact the development team.

