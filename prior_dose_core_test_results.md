# Prior Dose Module - Core Test Results
Generated: 2025-12-02 12:03:42

## Test Summary
Total Tests: 3
Passed: 3
Failed: 0

---

## Test 1: Single Prior - NO Overlap

**Status:** PASS

**Configuration:**
- Physician: Galvan
- Physicist: Kirby
- Current: lung - 50.0 Gy / 25 fx
- Prior treatments: 1
- Dose calc method: EQD2

**Generated Writeup:**
```
Dr. Galvan requested a medical physics consultation for prior dose assessment.

Patient Information:
Patient with lung lesion, currently planned for 50 Gy in 25 fractions to the lung.

Prior Radiation History:
In March 2020, the patient received external beam radiotherapy of 50.4 Gy in 28 fractions to the breast. 

Assessment:
Review of the prior treatment fields and current treatment plan indicates minimal to no overlap between treatment volumes. The distance between field edges is sufficient to ensure that critical structures will not receive excessive cumulative dose. The proposed treatment can proceed as planned with standard toxicity monitoring. This evaluation was reviewed and approved by Dr. Galvan and Dr. Kirby.
```

---

## Test 2: Single Prior - WITH Overlap

**Status:** PASS

**Configuration:**
- Physician: Galvan
- Physicist: Kirby
- Current: lung - 50.0 Gy / 25 fx
- Prior treatments: 1
- Dose calc method: EQD2

**Generated Writeup:**
```
Dr. Galvan requested a medical physics consultation for prior dose assessment. This consultation provides dosimetric analysis and planning guidance for composite dose evaluation.

Patient Information:
Patient with lung lesion, currently planned for 50 Gy in 25 fractions to the lung.

Prior Radiation History:
In January 2022, the patient received external beam radiotherapy of 60 Gy in 30 fractions to the thorax. The current course of treatment has overlap with the previous treatment.

Methodology:
The previous treatment was reconstructed on the current patient CT for summation with the current plan in Velocity. Dose constraints are evaluated using EQD2 with an alpha/beta ratio of 2 for spinal cord and 3 for all other organs at risk.

Dose Constraint Evaluation:
• Spinal Cord - Max dose (0.03cc): _______ (Timmerman)
• Bilateral Lungs - V20Gy: _______ (QUANTEC)
• Bilateral Lungs - Mean Lung Dose: _______ (QUANTEC)

Assessment:
[IF ALL CONSTRAINTS MET:]
Composite dose analysis demonstrates acceptable normal tissue doses within institutional constraints.

[IF ANY CONSTRAINT EXCEEDED - auto-populate structure name and value:]
[Structure] [constraint type] of [value] exceeds [reference] guidelines. However, given prior radiation exposure and overlap with current treatment volume, the elevated dose was reviewed and deemed acceptable by the treating physicians.

The composite dose distribution and DVH are shown below. The findings were reviewed and approved by Dr. Galvan and Dr. Kirby.

[Figures]
```

---

## Test 3: Multiple Prior - Mixed Overlap

**Status:** PASS

**Configuration:**
- Physician: Galvan
- Physicist: Kirby
- Current: spine - 24.0 Gy / 3 fx
- Prior treatments: 3
- Dose calc method: EQD2

**Generated Writeup:**
```
Dr. Galvan requested a medical physics consultation for prior dose assessment. This consultation provides dosimetric analysis and planning guidance for composite dose evaluation.

Patient Information:
Patient with spine lesion, currently planned for 24 Gy in 3 fractions to the spine.

Prior Radiation History:
In March 2019, the patient received external beam radiotherapy of 50.4 Gy in 28 fractions to the thorax. 
In June 2021, the patient received external beam radiotherapy of 45 Gy in 25 fractions to the abdomen. DICOM files for this treatment were unavailable for reconstruction. 
In September 2022, the patient received external beam radiotherapy of 30 Gy in 10 fractions to the spine. 
The current course of treatment has overlap with 2 of the previous treatments.

Methodology:
The previous treatment(s) were reconstructed on the current patient CT for summation with the current plan in Velocity. Dose constraints are evaluated using EQD2 with an alpha/beta ratio of 2 for spinal cord and 3 for all other organs at risk.

Dose Constraint Evaluation:
• Spinal Cord - Max dose (0.03cc): _______ (Timmerman)
• Adjacent critical structures - Per QUANTEC: _______ (QUANTEC)
• Overlapping normal tissue - Composite dose evaluation: _______ (Clinical judgment)
• Cauda Equina - Max dose (0.03cc): _______ (Timmerman)
• Esophagus - Max dose (0.03cc): _______ (Timmerman)

Assessment:
[IF ALL CONSTRAINTS MET:]
Composite dose analysis demonstrates acceptable normal tissue doses within institutional constraints.

[IF ANY CONSTRAINT EXCEEDED - auto-populate structure name and value:]
[Structure] [constraint type] of [value] exceeds [reference] guidelines. However, given prior radiation exposure and overlap with current treatment volume, the elevated dose was reviewed and deemed acceptable by the treating physicians.

The composite dose distribution and DVH are shown below. The findings were reviewed and approved by Dr. Galvan and Dr. Kirby.

[Figures]
```

---

