# Radiation Therapy Dose Constraints: Complete Clinical Reference

**The radiation oncology community relies on three primary constraint frameworks**: QUANTEC for conventional fractionation (~2 Gy/fraction), Timmerman/TG-101 tables for SBRT (3-5 fractions), and specialized SRS limits for single-fraction treatments. This report provides the specific numeric dose limits, volume metrics, α/β ratios, and decision logic needed to implement a comprehensive clinical constraint system, with clear source attribution for each value.

---

## QUANTEC conventional fractionation constraints (~1.8-2 Gy/fraction)

The QUANTEC guidelines, published in the March 2010 IJROBP supplement, established evidence-based dose-volume limits for conventional fractionation. All values assume **1.8-2.0 Gy per fraction** and cannot be directly applied to hypofractionated treatments without EQD2 conversion.

### Central nervous system

| Structure | Volume Metric | Dose Limit | Complication Rate | Endpoint |
|-----------|---------------|------------|-------------------|----------|
| **Spinal Cord** | Dmax | **50 Gy** | 0.2% | Myelopathy |
| | Dmax | 60 Gy | 6% | Myelopathy |
| **Brainstem** | Dmax (whole organ) | **<54 Gy** | <5% | Permanent cranial neuropathy |
| | D1-10cc | ≤59 Gy | <5% | Small volume tolerance |
| **Optic Nerve/Chiasm** | Dmax | **<55 Gy** | <3% | Optic neuropathy (RION) |
| | Dmax | 55-60 Gy | 3-7% | RION |
| **Brain** | Dmax | <60 Gy | <3% | Symptomatic necrosis |
| **Cochlea** | Dmean | **≤45 Gy** | <30% | Sensorineural hearing loss |

### Head and neck structures

| Structure | Volume Metric | Dose Limit | Complication Rate | Endpoint |
|-----------|---------------|------------|-------------------|----------|
| **Parotid (bilateral)** | Dmean | **<25 Gy** | <20% | Long-term salivary dysfunction |
| **Parotid (single)** | Dmean | **<20 Gy** | <20% | When sparing one gland |
| **Larynx** | Dmax | <66 Gy | <20% | Vocal dysfunction |
| | Dmean | **<44 Gy** | <20% | Laryngeal edema |
| **Pharyngeal Constrictors** | Dmean | **<50 Gy** | <20% | Dysphagia/aspiration |

### Thoracic organs

| Structure | Volume Metric | Dose Limit | Complication Rate | Endpoint |
|-----------|---------------|------------|-------------------|----------|
| **Lungs (bilateral)** | V20 | **≤30%** | <20% | Symptomatic pneumonitis |
| | Dmean | 7 Gy | 5% | Pneumonitis |
| | Dmean | **20 Gy** | 20% | Pneumonitis |
| **Heart** | V25 | **<10%** | <1% at 15y | Long-term cardiac mortality |
| | Dmean (pericardium) | <26 Gy | <15% | Pericarditis |
| **Esophagus** | Dmean | **<34 Gy** | 5-20% | Grade ≥3 acute esophagitis |
| | V35 | <50% | <30% | Grade ≥2 esophagitis |
| **Brachial Plexus** | Dmax | **60-62 Gy** | ~5% | Plexopathy (Emami) |

### Abdominal and pelvic organs

| Structure | Volume Metric | Dose Limit | Complication Rate | Endpoint |
|-----------|---------------|------------|-------------------|----------|
| **Liver (normal)** | Dmean | **<30-32 Gy** | <5% | Radiation-induced liver disease |
| **Liver (Child-Pugh A)** | Dmean | <28 Gy | <5% | RILD in HCC patients |
| **Kidneys (bilateral)** | Dmean | **<15-18 Gy** | <5% | Renal dysfunction |
| | V12 | <55% | <5% | Combined kidneys |
| | V20 | <32% | <5% | Combined kidneys |
| **Small Bowel** | V15 | **<120 cc** | <10% | Grade ≥3 acute toxicity |
| | V45 | <195 cc | <10% | Entire peritoneal cavity |
| **Rectum** | V50 | **<50%** | <15% Grade 2 | Late rectal toxicity |
| | V60 | <35% | | |
| | V65 | <25% | | |
| | V70 | <20% | | |
| | V75 | <15% | | |
| **Bladder** | V65 | ≤50% | <6% | Grade ≥3 late toxicity |
| | V70 | ≤35% | | |
| | V80 | ≤15% | | |
| **Femoral Heads** | Dmax | **≤52 Gy** | ~5% | Necrosis/fracture |
| **Penile Bulb** | Dmean | <50 Gy | <35% | Erectile dysfunction |

---

## Timmerman SBRT constraints for 3-fraction and 5-fraction treatments

The Timmerman tables originated from RTOG 0236 development (~2002), with subsequent formalization in AAPM TG-101 (2010) and evidence-based updates from HyTEC (2021). These constraints apply to treatments delivering **>5 Gy per fraction**.

### Critical serial structures

| Structure | 3 Fractions | 5 Fractions | Volume Spec | Endpoint |
|-----------|-------------|-------------|-------------|----------|
| **Spinal Cord** | **<20.3-22.5 Gy** | **<25.3-28 Gy** | Dmax (≤0.035cc) | Myelopathy |
| | <18 Gy | <23 Gy | D0.35cc | |
| | <12.3 Gy | <14.5 Gy | D1.2cc | |
| **Esophagus** | **<25.2-27 Gy** | **<32-35 Gy** | Dmax (≤0.035cc) | Stenosis/fistula |
| | <17.7-27.9 Gy | <19.5-32.5 Gy | D5cc | |
| **Brachial Plexus** | **<24-26 Gy** | **<30.5-32 Gy** | Dmax (≤0.035cc) | Neuropathy |
| | <20.4-22 Gy | <27 Gy | D3cc | |

### Thoracic structures

| Structure | 3 Fractions | 5 Fractions | Volume Spec | Endpoint |
|-----------|-------------|-------------|-------------|----------|
| **Proximal Bronchial Tree** | **<30-32 Gy** | **<40-50 Gy** | Dmax (0.5cc) | Stenosis/fistula |
| | <15 Gy | <16.5 Gy | D4cc | |
| **Heart/Pericardium** | **<30 Gy** | **<38 Gy** | Dmax (≤0.035cc) | Pericarditis |
| | <24 Gy | <32 Gy | D15cc | |
| **Great Vessels** | **<45 Gy** | **<53 Gy** | Dmax (0.5cc) | Aneurysm |
| | <39 Gy | <47 Gy | D10cc | |
| **Chest Wall/Ribs** | **<36.9-37 Gy** | **<39-43 Gy** | Dmax (0.5cc) | Fracture/pain |
| | <30 Gy | <32-35 Gy | D30cc | |
| **Lungs (bilateral)** | V20 <10-15% | V20 <10-15% | | Pneumonitis |
| | MLD **≤8 Gy** | MLD ≤8 Gy | Mean dose | HyTEC |
| **Skin** | <33 Gy | <38.5 Gy | Dmax | Ulceration |

### Gastrointestinal structures

| Structure | 3 Fractions | 5 Fractions | Volume Spec | Endpoint |
|-----------|-------------|-------------|-------------|----------|
| **Stomach** | **<22.2 Gy** | **<32-35 Gy** | Dmax (0.5cc) | Ulceration |
| | <16.5 Gy | <18-25 Gy | D10cc | |
| **Duodenum** | **<22.2-24 Gy** | **<32-35 Gy** | Dmax (0.03-0.5cc) | Ulceration/perforation |
| | <16.5-22.5 Gy | <18-26.5 Gy | D5cc | |
| **Small Bowel** | **<25.2-27 Gy** | **<34.5-35 Gy** | Dmax (0.03-0.5cc) | Enteritis/obstruction |
| | <17.7-21 Gy | <19.5-25 Gy | D5cc | |
| **Large Bowel/Colon** | **<28.2 Gy** | **<32-38 Gy** | Dmax (0.5cc) | Colitis/fistula |
| **Bile Duct** | <36 Gy | <41 Gy | Dmax | Stenosis |

### Hepatic and renal constraints

| Structure | 3 Fractions | 5-6 Fractions | Volume Spec | Source |
|-----------|-------------|---------------|-------------|--------|
| **Liver (metastases)** | MLD **≤15 Gy** | MLD ≤20 Gy | Mean dose | HyTEC |
| **Liver (HCC primary)** | MLD **≤13 Gy** | MLD ≤18 Gy | Mean dose | HyTEC |
| **Liver critical volume** | **≥700cc <15-17 Gy** | ≥700cc <21 Gy | Spared volume | TG-101 |
| **Kidneys** | D200cc **<14.4-16 Gy** | D200cc <17.5 Gy | | TG-101 |
| | | Dmean <10 Gy | Combined | |

---

## SRS single-fraction constraints

Single-fraction SRS requires the most stringent constraints due to limited repair capacity. Values derive from AAPM TG-101, HyTEC (2021), and UK Consensus Guidelines.

### Intracranial structures

| Structure | Dose Limit | Volume Spec | Complication Rate | Source |
|-----------|------------|-------------|-------------------|--------|
| **Brainstem** | **<15 Gy** | Dmax (≤0.035cc) | Not specified | TG-101 |
| | <10 Gy | D0.5cc | | TG-101 |
| | <12.5 Gy | Dmax (acoustic tumors) | <5% | QUANTEC |
| **Optic Chiasm** | **<10 Gy** | Dmax | <1% | TG-101, HyTEC |
| | <8 Gy | D0.2cc | | TG-101 |
| **Optic Nerve** | **<10 Gy** | Dmax | <1% | TG-101, HyTEC |
| | <12 Gy | Dmax | <1% (upper limit) | HyTEC |
| **Cochlea** | **<9 Gy** | Dmax | | TG-101 |
| | <4 Gy | Dmean (optimal) | Improved preservation | UK Consensus |
| **Lens** | <1.5-2 Gy | Dmax | Threshold | ICRP |
| **Retina** | <8 Gy | Dmax (0.1cc) | | UK Consensus |
| **Normal Brain** | **V12 <5cc** | | ~10% | HyTEC |
| | V12 <10cc | | ~15% | HyTEC |

### Spine SRS constraints

| Structure | Dose Limit | Volume Spec | Complication Rate | Source |
|-----------|------------|-------------|-------------------|--------|
| **Spinal Cord** | **12.4-14 Gy** | Dmax | 1-5% | HyTEC |
| | <10 Gy | D0.35cc | | TG-101 |
| | <7 Gy | D1.2cc | | TG-101 |
| **Cauda Equina** | **<16 Gy** | Dmax (≤0.035cc) | | TG-101 |
| | <14 Gy | D5cc | | TG-101 |
| **Sacral Plexus** | <16 Gy | Dmax (≤0.035cc) | | TG-101 |

### Prescription dose by target size (RTOG 90-05)

| Maximum Diameter | Prescription Dose | Rationale |
|------------------|-------------------|-----------|
| ≤20 mm | **24 Gy** | Maximum tolerated |
| 21-30 mm | **18 Gy** | V12 increases |
| 31-40 mm | **15 Gy** | Further reduction needed |

---

## EQD2 decision logic and implementation

### When to use physical dose versus EQD2

**Use physical (raw) dose when:**
- Fractionation is standard 2 Gy/fraction (EQD2 equals physical dose)
- Constraints are already defined for the specific fractionation being used
- Treatment planning within a single fractionation scheme
- Using published constraint tables matched to your regimen

**Use EQD2 conversion when:**
- Comparing different fractionation schemes across protocols
- Combining doses from different treatment courses (re-irradiation)
- Converting brachytherapy doses to external beam equivalents
- Evaluating cumulative SBRT dose after prior conventional treatment
- Comparing institutional outcomes across different fractionation practices

### Clinical implementation workflow

The recommended approach for treatment planning systems involves **applying fractionation-specific constraint sets** rather than converting all constraints to EQD2. Most planning systems display physical dose, requiring manual conversion for re-irradiation scenarios.

**For re-irradiation calculations:**
1. Convert prior treatment to EQD2 using appropriate α/β
2. Apply time-based recovery factor (25-100% based on interval)
3. Subtract discounted prior dose from OAR limit (in EQD2)
4. Convert remaining allowable EQD2 back to physical dose for planning

### EQD2 formula

```
EQD2 = D × [(d + α/β)/(2 + α/β)]
```

Where D = total dose, d = dose per fraction, α/β = tissue-specific ratio in Gy

### Limitations of EQD2

The linear-quadratic model underlying EQD2 has **controversial validity above 10-15 Gy per fraction**. Alternative models (Linear-Quadratic-Linear, Universal Survival Curve) may better predict outcomes for extreme hypofractionation. Differences between LQ and modified models can reach **25-35%** for SBRT calculations.

---

## α/β ratio reference values

### Normal tissues

| Structure | α/β Ratio (Gy) | Category | Notes |
|-----------|----------------|----------|-------|
| **Spinal Cord** | **2-3** | Late | Conservative default; 3.9 Gy reported across species |
| **Brainstem** | 2-3 | Late | 2.82-2.90 Gy in LQ-L models |
| **Optic Structures** | **1-3** | Late | Very low; ~1.03 Gy for optic pathway |
| **Brain** | 2 | Late | Standard CNS tissue |
| **Lung (late)** | **3-4** | Late | Pneumonitis/fibrosis |
| **Heart** | 2-3 | Late | Pericarditis, cardiac toxicity |
| **Esophagus** | 3-5 | Late | Stricture endpoint |
| **Liver** | 2-3 | Late | RILD |
| **Kidney** | 2-3 | Late | Nephropathy |
| **Rectum** | **3-5** | Late | ~3 Gy for bleeding |
| **Bladder** | 3-6 | Late | Late toxicity |
| **Bowel (late)** | 3-6 | Late | Fibrosis/stricture |
| **Bowel (acute)** | 8-10 | Acute | Diarrhea/mucositis |
| **Skin (late)** | 2-3 | Late | Fibrosis/telangiectasia |
| **Skin (acute)** | 8-10 | Acute | Erythema/desquamation |
| **Mucosa** | 10-15 | Acute | Early-responding |

### Tumor types

| Tumor | α/β Ratio (Gy) | Fractionation Sensitivity | Clinical Implication |
|-------|----------------|---------------------------|----------------------|
| **Prostate Cancer** | **1.5-2** | HIGH | Supports hypofractionation |
| **Breast Cancer** | **3.5-4.5** | HIGH | Supports hypofractionation |
| **Melanoma** | 0.6-2.5 | HIGH | Very low α/β |
| **NSCLC (squamous)** | **8-10** | LOW | Standard fractionation |
| **Head & Neck SCC** | 10-14 | LOW | Standard fractionation |
| **Cervical Cancer (SCC)** | 10 | LOW | Standard fractionation |
| **Gliomas** | 5-10 | Variable | Depends on grade |
| **Meningioma** | 3-4 | HIGH | Benign tumor |
| **Vestibular Schwannoma** | 2-4 | HIGH | Benign tumor |

### Clinical defaults

The standard defaults used when tumor-specific data is unavailable: **α/β = 10 Gy** for tumors and acute-responding tissues; **α/β = 3 Gy** for late-responding normal tissues.

---

## Site-specific OAR priority hierarchies

### Lung SBRT: Central versus peripheral tumors

**Central tumor definition** (RTOG 0813): Within 2 cm of the proximal bronchial tree (trachea, carina, mainstem bronchi, lobar bronchi) or adjacent to mediastinal/pericardial pleura.

**Ultracentral tumor definition**: PTV directly abutting or overlapping the proximal bronchial tree, esophagus, or great vessels.

**"No-fly zone" context**: The 2006 Indiana University study showed **11-fold increased severe toxicity risk** for central tumors treated with 60-66 Gy in 3 fractions, establishing the original contraindication for high-dose SBRT to central locations.

| Priority | Central/Ultracentral SBRT | Peripheral SBRT |
|----------|---------------------------|-----------------|
| 1 (Highest) | **Proximal Bronchial Tree** | Spinal Cord |
| 2 | Esophagus | Chest Wall/Ribs |
| 3 | Great Vessels/Aorta | Brachial Plexus |
| 4 | Heart/Pericardium | Normal Lung (V20, MLD) |
| 5 | Spinal Cord | Skin |

**Central SBRT approach**: Use 5-8 fractions (60 Gy/5fx or 60 Gy/8fx). For ultracentral tumors, 8-12 fractions preferred. **Prioritize OAR constraints over target coverage** when necessary.

### Conventional lung treatment priorities

1. **Spinal Cord** (Dmax <50 Gy) - highest priority, non-negotiable
2. **Lung V20 and MLD** - critical for pneumonitis risk; V20 ≤30%, MLD ≤20 Gy
3. **V5** - increasingly recognized for pneumonitis prediction
4. **Heart** - growing emphasis on cardiac constraints (V25 <10%, Dmean <26 Gy)
5. **Esophagus** - acute toxicity management

### Brain SRS/SRT priority hierarchy

| Priority | Single-Fraction SRS | Multi-Fraction SRS (3-5fx) |
|----------|---------------------|----------------------------|
| 1 | **Optic Nerves/Chiasm** (<10 Gy) | Optic apparatus (<20-25 Gy) |
| 2 | Brainstem (<12.5-15 Gy) | Brainstem (<23-31 Gy) |
| 3 | Normal Brain V12 (<5-10cc) | Brain V20-24 (<20cc) |
| 4 | Cochlea (<9 Gy) | Cochlea |

### Liver SBRT priority hierarchy

1. **Normal Liver Volume** - ≥700cc receiving <15-17 Gy (critical); Child-Pugh status determines stringency
2. **Duodenum/Stomach/Bowel** - Dmax <30 Gy (3fx)
3. **Central Hepatobiliary Tract** - biliary stricture risk
4. **Kidneys** - V15 <35%
5. **Spinal Cord**

### Spine SBRT priority

The spinal cord is the **singular critical structure**. De novo SBRT limits (1-5% myelopathy risk per HyTEC):
- 1 fraction: Dmax 12.4-14 Gy
- 3 fractions: Dmax 20.3-23.1 Gy
- 5 fractions: Dmax 25.3-28.8 Gy

For re-irradiation: Cumulative thecal sac EQD2₂ Dmax ≤70 Gy; SBRT component EQD2₂ Dmax ≤25 Gy.

---

## Source documents for reference

### Primary guideline documents

**QUANTEC (2010)**: Published as IJROBP Volume 76, Supplement 3 (March 2010). Key papers include Marks et al. "Use of Normal Tissue Complication Probability Models in the Clinic" (overview), plus organ-specific papers by Mayo (optic structures, brainstem), Kirkpatrick (spinal cord), Marks (lung), Gagliardi (heart), Dawson (liver), Pan (kidney), Michalski (rectum), and Kavanagh (stomach/small bowel).

**AAPM TG-101 (2010)**: Benedict et al., "Stereotactic Body Radiation Therapy," Medical Physics 2010;37:4078-4101. Foundational SBRT constraint recommendations with 2023 addendum updating lung, liver, and renal constraints.

**HyTEC (2021)**: Published as IJROBP special issue May 2021, providing evidence-based updates to QUANTEC for hypofractionated treatments. Key NTCP papers cover brain/SRS necrosis (Milano), optic pathway (Milano), spinal cord (Sahgal), lung pneumonitis, liver toxicity, and pelvic structures.

**Timmerman Publications**: Original Indiana University phase II study (2006) established central tumor toxicity risk; RTOG 0236 results (JAMA 2010) validated peripheral SBRT; 2022 IJROBP editorial documents constraint table development history.

### Protocol references

| Protocol | Application | Key Constraints |
|----------|-------------|-----------------|
| RTOG 0236 | Peripheral lung, 54-60 Gy/3fx | Established no-fly zone |
| RTOG 0813 | Central lung, 50-60 Gy/5fx | PBT D4cc ≤18 Gy, 7.2% DLT at max dose |
| RTOG 0915 | Peripheral lung comparison | 34 Gy/1fx vs 48 Gy/4fx |
| RTOG 90-05 | Brain metastases SRS | Dose-volume relationship |

### Recent consensus updates (2020-2025)

ASTRO Brain Metastases Guideline (2022) updated SRS recommendations. UK SABR Consortium Guidelines v6 (2019/2022) provides comprehensive UK national constraints. ESTRO-ACROP published central lung SBRT guidance (2020). HyTEC represents the most current evidence synthesis for hypofractionated normal tissue effects.

---

## Conclusion

Implementing a robust clinical constraint system requires **three distinct constraint tables**: QUANTEC-based limits for conventional fractionation, Timmerman/TG-101/HyTEC limits for SBRT (3-5 fractions), and specialized SRS limits for single-fraction treatments. The decision to use raw dose versus EQD2 should be based on clinical context—physical dose within matched-fractionation planning, EQD2 for cross-scheme comparisons and re-irradiation.

Key implementation considerations include using **fractionation-appropriate α/β ratios** (3 Gy default for late-responding tissues, lower values for prostate/breast tumors), recognizing **LQ model limitations above 10-15 Gy per fraction**, and establishing **site-specific priority hierarchies** that prioritize serial organs and central structures at highest risk for catastrophic complications. For central/ultracentral lung SBRT, OAR constraints should take precedence over target coverage when necessary, using extended fractionation schemes (5-8 fractions) to maintain therapeutic ratios.