# MEDICAL PHYSICS TOOLKIT SPRITES
*Complete module specifications organized by status and features*

## MODULE STATUS LEGEND
- **Most Advanced** - Reference implementation
- **Production Ready** - Fully functional, tested
- **Needs Polish** - Works but UI/UX improvements needed
- **Placeholder** - UI only, no implementation

---

## FUSION MODULE (Reference Implementation)

**Status:** Production Ready  
**Lines:** 1,722 (frontend) + 655 (backend)  
**Test Coverage:** Manual testing, end-to-end validated

### Features
- **Multimodality Support:**
  - MRI/CT fusion (rigid, deformable, mixed)
  - PET/CT fusion (rigid, deformable, mixed)
  - CT/CT fusion (rigid, deformable)
  - Mixed combinations (MRI+PET, MRI+CT+PET, etc.)
- **Special Workflows:**
  - Bladder filling studies (toggle-based)
  - Single vs multiple registration detection
  - Complex mode auto-detection (20+ modes)
- **Registration Types:**
  - Rigid only
  - Deformable only
  - Mixed (rigid + deformable)
- **Anatomical Regions:** 7 options
  - Head and Neck, Brain, Thoracic, Abdominal, Pelvic, Spinal, Extremity

### API Endpoints
```
POST /api/fusion/generate
```

### Key Files
```
backend/app/
├── schemas/fusion.py
├── services/fusion.py          # 655+ lines of logic
└── routers/fusion.py

frontend/src/
├── services/fusionService.js
├── components/fusion/FusionForm.jsx  # 1,722 lines
└── pages/fusion.js
```

### Why It's the Reference
- Handles all edge cases (singular/plural, grammar, mixed modalities)
- 3-column responsive layout perfected
- Always-visible write-up panel
- Bladder filling toggle demonstrates conditional UI
- All input styling patterns correct

---

## PACEMAKER MODULE (TG-203 Compliant)

**Status:** Production Ready  
**Test Coverage:** 13 automated tests (100% pass rate)

### Features
- **Risk Assessment:** Low/Medium/High per TG-203 guidelines
- **Device Database:** 6 vendors, 40+ models
  - Medtronic, Boston Scientific, Abbott/St. Jude Medical
  - Biotronik, MicroPort, ZOLL
- **Clinical Logic:**
  - Pacing dependency detection
  - Dose category calculation (< 2 Gy, 2-5 Gy, > 5 Gy)
  - Neutron therapy handling
  - Beam proximity assessment
- **Measurements:**
  - Diode measurements (replaced OSLD per current practice)
  - Distance from field edge
  - In-field vs out-of-field detection

### API Endpoints
```
POST /api/pacemaker/generate
GET  /api/pacemaker/device-info
```

### Risk Assessment Algorithm
```python
# TG-203 Decision Logic:
if pacing_independent AND dose < 2 Gy:
    return "Low"    # Only Low risk scenario
else:
    return "Medium"  # Default for most cases

if pacing_dependent AND dose > 5 Gy:
    return "High"   # High risk scenario

if neutron_therapy AND dose > 5 Gy:
    return "High"   # Neutron + high dose
```

### Key Files
```
backend/app/
├── schemas/pacemaker_schemas.py
├── services/pacemaker_service.py
└── routers/pacemaker.py

frontend/src/
├── services/pacemakerService.js
├── components/pacemaker/PacemakerForm.jsx
└── pages/pacemaker.js

tests/
└── test_pacemaker_module.py    # 13 comprehensive tests
```

---

## DIBH MODULE (Deep Inspiration Breath Hold)

**Status:** Production Ready

### Features
- **Auto-Device Assignment:**
  - Breast lesions → "breast board"
  - All other lesions → "wing board"
- **Custom Treatment Sites:**
  - Checkbox toggle for custom input
  - Standard dropdown OR custom text field
- **Treatment Sites:** 7 standard options
  - Left breast, Right breast, Chest wall, Thorax, Esophagus, Pancreas, Liver
- **Smart UI:**
  - Informational device display (not editable)
  - Real-time updates when site changes

### API Endpoints
```
POST /api/dibh/generate
```

### Key Files
```
backend/app/
├── schemas/dibh.py
├── services/dibh.py
└── routers/dibh.py

frontend/src/
├── services/dibhService.js
├── components/dibh/DIBHForm.jsx
└── pages/dibh.js
```

---

## SBRT MODULE (Stereotactic Body Radiation Therapy)

**Status:** Production Ready  
**Test Coverage:** 15 automated tests (100% pass rate)

### Features
- **Treatment Sites:** 6 core sites
  - Bone, Kidney, Liver, Lung, Prostate, Spine (alphabetical)
- **Anatomical Clarification:**
  - Spine: "e.g., T11-L1, C5-C7"
  - Bone: "e.g., Humerus, Femur, Rib"
  - Conditional input (only shows for spine/bone)
- **Fractionation Schemes:** Site-specific
- **Breathing Techniques:** Free breathing, 4DCT, DIBH
- **Plan Quality Metrics:**
  - Coverage calculation
  - Conformity Index (with tolerance)
  - R50 (with tolerance)
  - Gradient Measure
  - Max Dose 2cm ring (with tolerance)
  - Homogeneity Index
- **Table Format:**
  - HTML tables with MSO compatibility
  - Copy-paste ready for Word/Office
  - Clean number formatting (no trailing zeros)
- **SIB Support:**
  - Simultaneous Integrated Boost cases
  - Comment field integration

### API Endpoints
```
POST /api/sbrt/generate
GET  /api/sbrt/treatment-sites
GET  /api/sbrt/fractionation-schemes
```

### Key Files
```
backend/app/
├── schemas/sbrt_schemas.py
├── services/sbrt_service.py
└── routers/sbrt.py

frontend/src/
├── services/sbrtService.js
├── components/sbrt/SBRTForm.jsx
└── pages/sbrt.js

tests/
└── test_sbrt_module.py    # 15 comprehensive tests
```

---

## 🚧 PRIOR DOSE MODULE

**Status:** Needs UI Polish (backend complete)  
**Known Issues:** Backend write-up generation needs verification

### Features
- **Modes:**
  - With overlap (BED/EQD2 calculations)
  - Without overlap (documentation only)
- **Prior Treatments:**
  - Dynamic list management
  - Treatment site, dose, fractions, date
  - Multiple prior treatments supported
- **Critical Structures:**
  - Multiple structure selection
  - Dose overlap tracking

### API Endpoints
```
POST /api/prior-dose/generate
```

### What Works
- 3-column responsive layout
- Always-visible write-up
- Back navigation button
- Dark theme styling
- Proper newline handling

### What Needs Work
- useFieldArray integration for prior treatments
- Auto-population based on mode
- Enhanced mode detection

### Key Files
```
backend/app/
├── schemas/prior_dose.py
├── services/prior_dose.py
└── routers/prior_dose.py

frontend/src/
├── services/priorDoseService.js
├── components/prior-dose/PriorDoseForm.jsx
└── pages/prior-dose.js
```

---

## SRS/SRT MODULE (Stereotactic Radiosurgery)

**Status:** Production Ready  
**Lines:** ~600 (frontend) + ~220 (backend)

### Features
- **Multi-lesion Support:** Dynamic accordion UI for multiple brain lesions
- **Brain Regions:** 23 anatomical sites (lobes, brainstem, cerebellum, etc.)
- **Treatment Types:** SRS (single fraction) and SRT (fractionated)
- **Quick Presets:** Common SRS doses (16-21 Gy) and SRT regimens (25-35 Gy)
- **Plan Quality Metrics:**
  - Prescription isodose level
  - PTV coverage
  - Conformity Index
  - Gradient Index
  - Maximum dose
- **MRI/CT Fusion:** Includes simulation imaging workflow
- **Multi-Fraction Support:** Handles both SRS (1fx) and SRT (2-5fx)

### API Endpoints
```
GET  /api/srs/brain-regions
POST /api/srs/generate
```

### Key Files
```
backend/app/
├── schemas/srs_schemas.py
├── services/srs_service.py
└── routers/srs.py

frontend/src/
├── services/srsService.js
├── components/srs/SRSForm.jsx
└── pages/srs.js
```

---

## TBI MODULE (Total Body Irradiation)

**Status:** Production Ready  
**Lines:** ~460 (frontend) + ~180 (backend)

### Features
- **Fractionation Schemes:** Quick presets (12Gy/6fx, 12Gy/8fx, 2Gy/1fx)
- **Setup Options:** AP/PA, Lateral
- **Lung Block Support:** Toggle with conditional write-up text
- **Equipment Details:** Energy, dose rate, machine parameters
- **Grammar Handling:** Automatic singular/plural for fractions
- **Simple Workflow:** Diagnosis, indication, prescription, setup

### API Endpoints
```
GET  /api/tbi/fractionation-schemes
GET  /api/tbi/setup-options
POST /api/tbi/generate
```

### Key Files
```
backend/app/
├── schemas/tbi_schemas.py
├── services/tbi_service.py
└── routers/tbi.py

frontend/src/
├── services/tbiService.js
├── components/tbi/TBIForm.jsx
└── pages/tbi.js
```

---

## HDR MODULE (High Dose Rate Brachytherapy)

**Status:** Production Ready  
**Lines:** ~730 (frontend) + ~150 (backend)

### Features
- **Applicator Types:** 6 options
  - Vaginal Cylinder (single-channel, multi-channel)
  - Tandem & Ovoid
  - SYED
  - Utrecht
  - GENEVA
- **Auto-Configuration:** Position and channel count auto-update based on applicator
- **Treatment Sites:** Gynecological, Prostate
- **Equipment:** ELEKTA Ir-192 afterloader, Oncentra planning system
- **Workflow Documentation:**
  - Implant procedure with patient positioning
  - CT imaging and contouring (bladder, rectum, intestines, sigmoid)
  - Dwell weighting optimization
  - Independent calculation verification
  - Radiation surveys (< 0.2 mR/hr)
- **Grammar Handling:** Proper channel count text (one/two/three/N channels)

### API Endpoints
```
GET  /api/hdr/applicators
GET  /api/hdr/applicator-info/{applicator_type}
POST /api/hdr/generate
```

### Key Files
```
backend/app/
├── schemas/hdr_schemas.py
├── services/hdr_service.py
└── routers/hdr.py

frontend/src/
├── services/hdrService.js
├── components/hdr/HDRForm.jsx
└── pages/hdr.js
```

### Clinical Use
- Gynecological cancers (primary use case)
- Prostate treatments (SYED applicator)
- Matches institutional clinical examples exactly
- Supports customizable implant dates, CT parameters, survey readings

---

## COMMON MODULE FEATURES

All production modules include:

### Required Elements
- [ ] Patient name placeholder (`---`)
- [ ] Physicist dropdown selection
- [ ] Attending physician dropdown
- [ ] Treatment site selection
- [ ] Real-time preview/results
- [ ] Copy to clipboard functionality
- [ ] Reset form button
- [ ] Form validation
- [ ] 3-column responsive layout
- [ ] Dark theme styling
- [ ] Back to home navigation

### Standard Input Styling
```jsx
// All Select components
bg="gray.700"
borderColor="gray.600"
color="white"
data-theme="dark"
_hover={{ borderColor: "gray.500" }}
sx={{ '& option': { backgroundColor: 'gray.700', color: 'white' }}}

// All Input components
bg="gray.700"
borderColor="gray.600"
color="white"
_hover={{ borderColor: "gray.500" }}
_placeholder={{ color: "gray.400" }}
```

---

## NEW MODULE CREATION GUIDE

### 1. Choose Reference Implementation
- **Complex logic?** → Copy Fusion structure
- **Simple form?** → Copy DIBH structure
- **Risk assessment?** → Copy Pacemaker structure
- **Quality metrics?** → Copy SBRT structure

### 2. Backend Implementation
```bash
cd backend/app
# Create schema
touch schemas/new_module.py
# Create service  
touch services/new_module.py
# Create router
touch routers/new_module.py
```

### 3. Frontend Implementation
```bash
cd frontend/src
# Create service
touch services/newModuleService.js
# Create component
mkdir components/new-module
touch components/new-module/NewModuleForm.jsx
# Create page
touch pages/new-module.js
```

### 4. Testing
```bash
# Create test script
touch test_new_module.py
# Run tests
python test_new_module.py
```

### 5. Integration
- Add to home page module list
- Update navigation
- Add to documentation
- Update this file (SPRITES.md)

---

## DOCUMENTATION ASSETS

### Workflow Diagrams (Mermaid)
Located in `/docs`:
- `fusion-quickwrite-flow.mermaid` - Fusion decision tree
- `prior-dose-flow.mermaid` - Prior dose workflow
- `mpc-quickwrite-simplified.mermaid` - Complete consultation flow

### Code Examples
- Fusion module: Gold standard for complex logic
- Pacemaker module: Gold standard for risk assessment
- SBRT module: Gold standard for quality metrics tables
- DIBH module: Gold standard for simple forms

---

## DOCUMENTATION VERSIONS
- SPRITES: v1.0 (Oct 2025)
- Last updated: November 20, 2025
- Next review: When new modules are added or module specifications change

