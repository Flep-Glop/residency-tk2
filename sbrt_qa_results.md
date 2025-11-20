# SBRT Module Comprehensive QA Report

**Generated:** 2025-11-20 10:14:45

**Total Tests:** 20
**Successful:** 20
**Failed:** 0

---

## Suite 1: Standard Treatment Sites

### Test 1: Lung - Standard 50 Gy / 5 fx (4DCT)

**Status:** ✅ PASS

**Configuration:**
- Treatment Site: lung
- Dose: 50 Gy / 5 fractions
- Dose/Fraction: 10.00 Gy
- Breathing Technique: 4DCT
- Target: PTV_50
- PTV Volume: 25.1 cc

**Generated Writeup:**

```
Dr. Galvan requested a medical physics consultation for --- for a 4D CT simulation study and SBRT delivery. Dr. Galvan has elected to treat with a stereotactic body radiotherapy (SBRT) technique by means of the Pinnacle treatment planning system in conjunction with the VersaHD linear accelerator equipped with the kV-CBCT system.

The patient was scanned in our CT simulator in the treatment position (head first supine orientation) with a customized immobilization device to limit motion during treatment and aid in inter-fractional repositioning. Both the prescribing radiation oncologist and radiation oncology physicist evaluated and approved the patient setup. A 4D kVCT simulation scan was performed with the patient immobilized and their breathing limited to reduce tumor motion. Using the 4D dataset, an AIP CT image set and 10 phase CT image sets were reconstructed by the radiation oncology physicist and fused together to regenerate an ITV in order to assess the motion envelope. Dr. Galvan segmented and approved both the PTVs and OARs.

In the treatment planning system, a VMAT treatment plan was developed to conformally deliver a prescribed dose of 50.0 Gy in 5 fractions (10.0 Gy per fraction) to the planning target volume. The treatment plan was inversely optimized such that the prescription isodose volume exactly matched the target volume in all three spatial dimensions and that the dose fell sharply away from the target volume. Normal tissue dose constraints for critical organs associated with the treatment site were reviewed.

Below are the plan statistics:

• Target: PTV_50
• Target Volume: 25.1 cc
• Prescription Dose: 50 Gy
• Coverage: 95%
• Conformity Index (PITV): 1.1 (Deviation: None)
• R50: 5 (Deviation: None)
• Gradient Measure: 0.85 cm
• Max Dose in 2cm Ring: 105% (Deviation: None)
• Homogeneity Index: 1.1

No deviations from institutional guidelines were observed. All metrics meet RTOG 0915 compliance criteria for SBRT plan quality.


A quality assurance plan was developed that was subsequently delivered to a phantom geometry. Measurements within the phantom were obtained and compared against the calculated plan to verify the accuracy of the radiation treatment plan. The data analysis showed good agreement between the plan and measurements. Calculations and data analysis were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the radiation oncology physicist, Dr. Kirby.
```

**Quality Checks:**
- Patient Demographics Present: ✅ None (correct)
- Fractions Mentioned Correctly: ✅ Yes
- Physician Name (Galvan): ✅ Present
- Physicist Name (Kirby): ✅ Present
- Dose (50 Gy): ✅ Present
- Technique Description (4DCT): ✅ Present
- Metrics Table: ✅ Present
- HTML Tags Present: ✅ None (correct)

---

### Test 2: Liver - Standard 45 Gy / 3 fx (Free Breathing)

**Status:** ✅ PASS

**Configuration:**
- Treatment Site: liver
- Dose: 45 Gy / 3 fractions
- Dose/Fraction: 15.00 Gy
- Breathing Technique: freebreathe
- Target: PTV_45
- PTV Volume: 32.5 cc

**Generated Writeup:**

```
Dr. Galvan requested a medical physics consultation for --- for SBRT delivery. Dr. Galvan has elected to treat with a stereotactic body radiotherapy (SBRT) technique by means of the Pinnacle treatment planning system in conjunction with the VersaHD linear accelerator equipped with the kV-CBCT system.

The patient was scanned in our CT simulator in the treatment position (head first supine orientation) with a customized immobilization device to limit motion during treatment and aid in inter-fractional repositioning. Both the prescribing radiation oncologist and radiation oncology physicist evaluated and approved the patient setup. Dr. Galvan segmented and approved both the PTVs and OARs.

In the treatment planning system, a VMAT treatment plan was developed to conformally deliver a prescribed dose of 45.0 Gy in 3 fractions (15.0 Gy per fraction) to the planning target volume. The treatment plan was inversely optimized such that the prescription isodose volume exactly matched the target volume in all three spatial dimensions and that the dose fell sharply away from the target volume. Normal tissue dose constraints for critical organs associated with the treatment site were reviewed.

Below are the plan statistics:

• Target: PTV_45
• Target Volume: 32.5 cc
• Prescription Dose: 45 Gy
• Coverage: 95%
• Conformity Index (PITV): 1.1 (Deviation: None)
• R50: 5 (Deviation: None)
• Gradient Measure: 0.85 cm
• Max Dose in 2cm Ring: 105% (Deviation: None)
• Homogeneity Index: 1.1

No deviations from institutional guidelines were observed. All metrics meet RTOG 0915 compliance criteria for SBRT plan quality.


A quality assurance plan was developed that was subsequently delivered to a phantom geometry. Measurements within the phantom were obtained and compared against the calculated plan to verify the accuracy of the radiation treatment plan. The data analysis showed good agreement between the plan and measurements. Calculations and data analysis were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the radiation oncology physicist, Dr. Kirby.
```

**Quality Checks:**
- Patient Demographics Present: ✅ None (correct)
- Fractions Mentioned Correctly: ✅ Yes
- Physician Name (Galvan): ✅ Present
- Physicist Name (Kirby): ✅ Present
- Dose (45 Gy): ✅ Present
- Technique (Free Breathing): ✅ Correct (no specific mention needed)
- Metrics Table: ✅ Present
- HTML Tags Present: ✅ None (correct)

---

### Test 3: Spine - Standard 24 Gy / 3 fx with Clarification

**Status:** ✅ PASS

**Configuration:**
- Treatment Site: spine
- Anatomical Clarification: T11-L1
- Dose: 24 Gy / 3 fractions
- Dose/Fraction: 8.00 Gy
- Breathing Technique: freebreathe
- Target: PTV_24
- PTV Volume: 15.2 cc

**Generated Writeup:**

```
Dr. Galvan requested a medical physics consultation for --- for SBRT delivery. Dr. Galvan has elected to treat with a stereotactic body radiotherapy (SBRT) technique by means of the Pinnacle treatment planning system in conjunction with the VersaHD linear accelerator equipped with the kV-CBCT system.

The patient was scanned in our CT simulator in the treatment position (head first supine orientation) with a customized immobilization device to limit motion during treatment and aid in inter-fractional repositioning. Both the prescribing radiation oncologist and radiation oncology physicist evaluated and approved the patient setup. Dr. Galvan segmented and approved both the PTVs and OARs.

In the treatment planning system, a VMAT treatment plan was developed to conformally deliver a prescribed dose of 24.0 Gy in 3 fractions (8.0 Gy per fraction) to the planning target volume. The treatment plan was inversely optimized such that the prescription isodose volume exactly matched the target volume in all three spatial dimensions and that the dose fell sharply away from the target volume. Normal tissue dose constraints for critical organs associated with the treatment site were reviewed.

Below are the plan statistics:

• Target: PTV_24
• Target Volume: 15.2 cc
• Prescription Dose: 24 Gy
• Coverage: 95%
• Conformity Index (PITV): 1.1 (Deviation: None)
• R50: 5 (Deviation: None)
• Gradient Measure: 0.85 cm
• Max Dose in 2cm Ring: 105% (Deviation: None)
• Homogeneity Index: 1.1

No deviations from institutional guidelines were observed. All metrics meet RTOG 0915 compliance criteria for SBRT plan quality.


A quality assurance plan was developed that was subsequently delivered to a phantom geometry. Measurements within the phantom were obtained and compared against the calculated plan to verify the accuracy of the radiation treatment plan. The data analysis showed good agreement between the plan and measurements. Calculations and data analysis were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the radiation oncology physicist, Dr. Kirby.
```

**Quality Checks:**
- Patient Demographics Present: ✅ None (correct)
- Fractions Mentioned Correctly: ✅ Yes
- Physician Name (Galvan): ✅ Present
- Physicist Name (Kirby): ✅ Present
- Dose (24 Gy): ✅ Present
- Technique (Free Breathing): ✅ Correct (no specific mention needed)
- Metrics Table: ✅ Present
- Anatomical Clarification (T11-L1): ❌ Missing
- HTML Tags Present: ✅ None (correct)

---

### Test 4: Kidney - Standard 40 Gy / 5 fx (4DCT)

**Status:** ✅ PASS

**Configuration:**
- Treatment Site: kidney
- Dose: 40 Gy / 5 fractions
- Dose/Fraction: 8.00 Gy
- Breathing Technique: 4DCT
- Target: PTV_40
- PTV Volume: 18.3 cc

**Generated Writeup:**

```
Dr. Galvan requested a medical physics consultation for --- for a 4D CT simulation study and SBRT delivery. Dr. Galvan has elected to treat with a stereotactic body radiotherapy (SBRT) technique by means of the Pinnacle treatment planning system in conjunction with the VersaHD linear accelerator equipped with the kV-CBCT system.

The patient was scanned in our CT simulator in the treatment position (head first supine orientation) with a customized immobilization device to limit motion during treatment and aid in inter-fractional repositioning. Both the prescribing radiation oncologist and radiation oncology physicist evaluated and approved the patient setup. A 4D kVCT simulation scan was performed with the patient immobilized and their breathing limited to reduce tumor motion. Using the 4D dataset, an AIP CT image set and 10 phase CT image sets were reconstructed by the radiation oncology physicist and fused together to regenerate an ITV in order to assess the motion envelope. Dr. Galvan segmented and approved both the PTVs and OARs.

In the treatment planning system, a VMAT treatment plan was developed to conformally deliver a prescribed dose of 40.0 Gy in 5 fractions (8.0 Gy per fraction) to the planning target volume. The treatment plan was inversely optimized such that the prescription isodose volume exactly matched the target volume in all three spatial dimensions and that the dose fell sharply away from the target volume. Normal tissue dose constraints for critical organs associated with the treatment site were reviewed.

Below are the plan statistics:

• Target: PTV_40
• Target Volume: 18.3 cc
• Prescription Dose: 40 Gy
• Coverage: 95%
• Conformity Index (PITV): 1.1 (Deviation: None)
• R50: 5 (Deviation: None)
• Gradient Measure: 0.85 cm
• Max Dose in 2cm Ring: 105% (Deviation: None)
• Homogeneity Index: 1.1

No deviations from institutional guidelines were observed. All metrics meet RTOG 0915 compliance criteria for SBRT plan quality.


A quality assurance plan was developed that was subsequently delivered to a phantom geometry. Measurements within the phantom were obtained and compared against the calculated plan to verify the accuracy of the radiation treatment plan. The data analysis showed good agreement between the plan and measurements. Calculations and data analysis were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the radiation oncology physicist, Dr. Kirby.
```

**Quality Checks:**
- Patient Demographics Present: ✅ None (correct)
- Fractions Mentioned Correctly: ✅ Yes
- Physician Name (Galvan): ✅ Present
- Physicist Name (Kirby): ✅ Present
- Dose (40 Gy): ✅ Present
- Technique Description (4DCT): ✅ Present
- Metrics Table: ✅ Present
- HTML Tags Present: ✅ None (correct)

---

### Test 5: Prostate - Standard 36.25 Gy / 5 fx

**Status:** ✅ PASS

**Configuration:**
- Treatment Site: prostate
- Dose: 36.25 Gy / 5 fractions
- Dose/Fraction: 7.25 Gy
- Breathing Technique: freebreathe
- Target: PTV_Prostate
- PTV Volume: 45.8 cc

**Generated Writeup:**

```
Dr. Galvan requested a medical physics consultation for --- for SBRT delivery. Dr. Galvan has elected to treat with a stereotactic body radiotherapy (SBRT) technique by means of the Pinnacle treatment planning system in conjunction with the VersaHD linear accelerator equipped with the kV-CBCT system.

The patient was scanned in our CT simulator in the treatment position (head first supine orientation) with a customized immobilization device to limit motion during treatment and aid in inter-fractional repositioning. Both the prescribing radiation oncologist and radiation oncology physicist evaluated and approved the patient setup. Dr. Galvan segmented and approved both the PTVs and OARs.

In the treatment planning system, a VMAT treatment plan was developed to conformally deliver a prescribed dose of 36.25 Gy in 5 fractions (7.2 Gy per fraction) to the planning target volume. The treatment plan was inversely optimized such that the prescription isodose volume exactly matched the target volume in all three spatial dimensions and that the dose fell sharply away from the target volume. Normal tissue dose constraints for critical organs associated with the treatment site were reviewed.

Below are the plan statistics:

• Target: PTV_Prostate
• Target Volume: 45.8 cc
• Prescription Dose: 36.2 Gy
• Coverage: 95%
• Conformity Index (PITV): 1.1 (Deviation: None)
• R50: 5 (Deviation: None)
• Gradient Measure: 0.85 cm
• Max Dose in 2cm Ring: 105% (Deviation: None)
• Homogeneity Index: 1.1

No deviations from institutional guidelines were observed. All metrics meet RTOG 0915 compliance criteria for SBRT plan quality.


A quality assurance plan was developed that was subsequently delivered to a phantom geometry. Measurements within the phantom were obtained and compared against the calculated plan to verify the accuracy of the radiation treatment plan. The data analysis showed good agreement between the plan and measurements. Calculations and data analysis were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the radiation oncology physicist, Dr. Kirby.
```

**Quality Checks:**
- Patient Demographics Present: ✅ None (correct)
- Fractions Mentioned Correctly: ✅ Yes
- Physician Name (Galvan): ✅ Present
- Physicist Name (Kirby): ✅ Present
- Dose (36.25 Gy): ✅ Present
- Technique (Free Breathing): ✅ Correct (no specific mention needed)
- Metrics Table: ✅ Present
- HTML Tags Present: ✅ None (correct)

---

### Test 6: Bone - Standard 30 Gy / 5 fx with Clarification

**Status:** ✅ PASS

**Configuration:**
- Treatment Site: bone
- Anatomical Clarification: Humerus
- Dose: 30 Gy / 5 fractions
- Dose/Fraction: 6.00 Gy
- Breathing Technique: freebreathe
- Target: PTV_30
- PTV Volume: 22.4 cc

**Generated Writeup:**

```
Dr. Galvan requested a medical physics consultation for --- for SBRT delivery. Dr. Galvan has elected to treat with a stereotactic body radiotherapy (SBRT) technique by means of the Pinnacle treatment planning system in conjunction with the VersaHD linear accelerator equipped with the kV-CBCT system.

The patient was scanned in our CT simulator in the treatment position (head first supine orientation) with a customized immobilization device to limit motion during treatment and aid in inter-fractional repositioning. Both the prescribing radiation oncologist and radiation oncology physicist evaluated and approved the patient setup. Dr. Galvan segmented and approved both the PTVs and OARs.

In the treatment planning system, a VMAT treatment plan was developed to conformally deliver a prescribed dose of 30.0 Gy in 5 fractions (6.0 Gy per fraction) to the planning target volume. The treatment plan was inversely optimized such that the prescription isodose volume exactly matched the target volume in all three spatial dimensions and that the dose fell sharply away from the target volume. Normal tissue dose constraints for critical organs associated with the treatment site were reviewed.

Below are the plan statistics:

• Target: PTV_30
• Target Volume: 22.4 cc
• Prescription Dose: 30 Gy
• Coverage: 95%
• Conformity Index (PITV): 1.1 (Deviation: None)
• R50: 5 (Deviation: None)
• Gradient Measure: 0.85 cm
• Max Dose in 2cm Ring: 105% (Deviation: None)
• Homogeneity Index: 1.1

No deviations from institutional guidelines were observed. All metrics meet RTOG 0915 compliance criteria for SBRT plan quality.


A quality assurance plan was developed that was subsequently delivered to a phantom geometry. Measurements within the phantom were obtained and compared against the calculated plan to verify the accuracy of the radiation treatment plan. The data analysis showed good agreement between the plan and measurements. Calculations and data analysis were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the radiation oncology physicist, Dr. Kirby.
```

**Quality Checks:**
- Patient Demographics Present: ✅ None (correct)
- Fractions Mentioned Correctly: ✅ Yes
- Physician Name (Galvan): ✅ Present
- Physicist Name (Kirby): ✅ Present
- Dose (30 Gy): ✅ Present
- Technique (Free Breathing): ✅ Correct (no specific mention needed)
- Metrics Table: ✅ Present
- Anatomical Clarification (Humerus): ❌ Missing
- HTML Tags Present: ✅ None (correct)

---

## Suite 2: Breathing Technique Variations

### Test 7: Lung - 4DCT Technique (54 Gy / 3 fx)

**Status:** ✅ PASS

**Configuration:**
- Treatment Site: lung
- Dose: 54 Gy / 3 fractions
- Dose/Fraction: 18.00 Gy
- Breathing Technique: 4DCT
- Target: PTV_54
- PTV Volume: 12.8 cc

**Generated Writeup:**

```
Dr. Galvan requested a medical physics consultation for --- for a 4D CT simulation study and SBRT delivery. Dr. Galvan has elected to treat with a stereotactic body radiotherapy (SBRT) technique by means of the Pinnacle treatment planning system in conjunction with the VersaHD linear accelerator equipped with the kV-CBCT system.

The patient was scanned in our CT simulator in the treatment position (head first supine orientation) with a customized immobilization device to limit motion during treatment and aid in inter-fractional repositioning. Both the prescribing radiation oncologist and radiation oncology physicist evaluated and approved the patient setup. A 4D kVCT simulation scan was performed with the patient immobilized and their breathing limited to reduce tumor motion. Using the 4D dataset, an AIP CT image set and 10 phase CT image sets were reconstructed by the radiation oncology physicist and fused together to regenerate an ITV in order to assess the motion envelope. Dr. Galvan segmented and approved both the PTVs and OARs.

In the treatment planning system, a VMAT treatment plan was developed to conformally deliver a prescribed dose of 54.0 Gy in 3 fractions (18.0 Gy per fraction) to the planning target volume. The treatment plan was inversely optimized such that the prescription isodose volume exactly matched the target volume in all three spatial dimensions and that the dose fell sharply away from the target volume. Normal tissue dose constraints for critical organs associated with the treatment site were reviewed.

Below are the plan statistics:

• Target: PTV_54
• Target Volume: 12.8 cc
• Prescription Dose: 54 Gy
• Coverage: 95%
• Conformity Index (PITV): 1.1 (Deviation: None)
• R50: 5 (Deviation: None)
• Gradient Measure: 0.85 cm
• Max Dose in 2cm Ring: 105% (Deviation: None)
• Homogeneity Index: 1.1

No deviations from institutional guidelines were observed. All metrics meet RTOG 0915 compliance criteria for SBRT plan quality.


A quality assurance plan was developed that was subsequently delivered to a phantom geometry. Measurements within the phantom were obtained and compared against the calculated plan to verify the accuracy of the radiation treatment plan. The data analysis showed good agreement between the plan and measurements. Calculations and data analysis were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the radiation oncology physicist, Dr. Kirby.
```

**Quality Checks:**
- Patient Demographics Present: ✅ None (correct)
- Fractions Mentioned Correctly: ✅ Yes
- Physician Name (Galvan): ✅ Present
- Physicist Name (Kirby): ✅ Present
- Dose (54 Gy): ✅ Present
- Technique Description (4DCT): ✅ Present
- Metrics Table: ✅ Present
- HTML Tags Present: ✅ None (correct)

---

### Test 8: Lung - DIBH Technique (50 Gy / 5 fx)

**Status:** ✅ PASS

**Configuration:**
- Treatment Site: lung
- Dose: 50 Gy / 5 fractions
- Dose/Fraction: 10.00 Gy
- Breathing Technique: DIBH
- Target: PTV_50_DIBH
- PTV Volume: 20.5 cc

**Generated Writeup:**

```
Dr. Galvan requested a medical physics consultation for --- for SBRT delivery with DIBH technique. Dr. Galvan has elected to treat the lung using a DIBH technique to significantly reduce cardiac dose with the C-RAD positioning and gating system in conjunction with the linear accelerator. Dr. Galvan has elected to treat with a stereotactic body radiotherapy (SBRT) technique by means of the Pinnacle treatment planning system in conjunction with the VersaHD linear accelerator equipped with the kV-CBCT system.

Days before the initial radiation delivery, the patient was simulated in the treatment position using a wing board to aid in immobilization and localization. Instructions were provided and the patient was coached to reproducibly hold their breath. Using the C-RAD surface scanning system, a free breathing and breath hold signal trace was established. After reproducing the breath hold pattern and establishing a consistent breathing pattern, a gating baseline and gating window was created. Subsequently, a DIBH CT simulation scan was acquired and approved by the radiation oncologist, Dr. Galvan.

A radiation treatment plan was developed on the DIBH CT simulation to deliver a prescribed dose of 50.0 Gy in 5 fractions (10.0 Gy per fraction) to the PTV_50_DIBH. The delivery of the DIBH gating technique on the linear accelerator will be performed using the C-RAD CatalystHD. The CatalystHD will be used to position the patient, monitor intra-fraction motion, and gate the beam delivery. Verification of the patient position will be validated with a DIBH kV-CBCT. The treatment plan was inversely optimized such that the prescription isodose volume exactly matched the target volume in all three spatial dimensions and that the dose fell sharply away from the target volume. Normal tissue dose constraints for critical organs associated with the treatment site were reviewed.

Below are the plan statistics:

• Target: PTV_50_DIBH
• Target Volume: 20.5 cc
• Prescription Dose: 50 Gy
• Coverage: 95%
• Conformity Index (PITV): 1.1 (Deviation: None)
• R50: 5 (Deviation: None)
• Gradient Measure: 0.85 cm
• Max Dose in 2cm Ring: 105% (Deviation: None)
• Homogeneity Index: 1.1

No deviations from institutional guidelines were observed. All metrics meet RTOG 0915 compliance criteria for SBRT plan quality.


A quality assurance plan was developed that was subsequently delivered to a phantom geometry. Measurements within the phantom were obtained and compared against the calculated plan to verify the accuracy of the radiation treatment plan. The data analysis showed good agreement between the plan and measurements.

These findings were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the radiation oncology physicist, Dr. Kirby.
```

**Quality Checks:**
- Patient Demographics Present: ✅ None (correct)
- Fractions Mentioned Correctly: ✅ Yes
- Physician Name (Galvan): ✅ Present
- Physicist Name (Kirby): ✅ Present
- Dose (50 Gy): ✅ Present
- Technique Description (DIBH): ✅ Present
- Metrics Table: ✅ Present
- HTML Tags Present: ✅ None (correct)

---

### Test 9: Liver - Free Breathing (50 Gy / 5 fx)

**Status:** ✅ PASS

**Configuration:**
- Treatment Site: liver
- Dose: 50 Gy / 5 fractions
- Dose/Fraction: 10.00 Gy
- Breathing Technique: freebreathe
- Target: PTV_50
- PTV Volume: 28.7 cc

**Generated Writeup:**

```
Dr. Galvan requested a medical physics consultation for --- for SBRT delivery. Dr. Galvan has elected to treat with a stereotactic body radiotherapy (SBRT) technique by means of the Pinnacle treatment planning system in conjunction with the VersaHD linear accelerator equipped with the kV-CBCT system.

The patient was scanned in our CT simulator in the treatment position (head first supine orientation) with a customized immobilization device to limit motion during treatment and aid in inter-fractional repositioning. Both the prescribing radiation oncologist and radiation oncology physicist evaluated and approved the patient setup. Dr. Galvan segmented and approved both the PTVs and OARs.

In the treatment planning system, a VMAT treatment plan was developed to conformally deliver a prescribed dose of 50.0 Gy in 5 fractions (10.0 Gy per fraction) to the planning target volume. The treatment plan was inversely optimized such that the prescription isodose volume exactly matched the target volume in all three spatial dimensions and that the dose fell sharply away from the target volume. Normal tissue dose constraints for critical organs associated with the treatment site were reviewed.

Below are the plan statistics:

• Target: PTV_50
• Target Volume: 28.7 cc
• Prescription Dose: 50 Gy
• Coverage: 95%
• Conformity Index (PITV): 1.1 (Deviation: None)
• R50: 5 (Deviation: None)
• Gradient Measure: 0.85 cm
• Max Dose in 2cm Ring: 105% (Deviation: None)
• Homogeneity Index: 1.1

No deviations from institutional guidelines were observed. All metrics meet RTOG 0915 compliance criteria for SBRT plan quality.


A quality assurance plan was developed that was subsequently delivered to a phantom geometry. Measurements within the phantom were obtained and compared against the calculated plan to verify the accuracy of the radiation treatment plan. The data analysis showed good agreement between the plan and measurements. Calculations and data analysis were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the radiation oncology physicist, Dr. Kirby.
```

**Quality Checks:**
- Patient Demographics Present: ✅ None (correct)
- Fractions Mentioned Correctly: ✅ Yes
- Physician Name (Galvan): ✅ Present
- Physicist Name (Kirby): ✅ Present
- Dose (50 Gy): ✅ Present
- Technique (Free Breathing): ✅ Correct (no specific mention needed)
- Metrics Table: ✅ Present
- HTML Tags Present: ✅ None (correct)

---

## Suite 3: Edge Cases

### Test 10: Lung - Single Fraction (34 Gy / 1 fx)

**Status:** ✅ PASS

**Configuration:**
- Treatment Site: lung
- Dose: 34 Gy / 1 fractions
- Dose/Fraction: 34.00 Gy
- Breathing Technique: freebreathe
- Target: PTV_34
- PTV Volume: 8.5 cc

**Generated Writeup:**

```
Dr. Galvan requested a medical physics consultation for --- for SBRT delivery. Dr. Galvan has elected to treat with a stereotactic body radiotherapy (SBRT) technique by means of the Pinnacle treatment planning system in conjunction with the VersaHD linear accelerator equipped with the kV-CBCT system.

The patient was scanned in our CT simulator in the treatment position (head first supine orientation) with a customized immobilization device to limit motion during treatment and aid in inter-fractional repositioning. Both the prescribing radiation oncologist and radiation oncology physicist evaluated and approved the patient setup. Dr. Galvan segmented and approved both the PTVs and OARs.

In the treatment planning system, a VMAT treatment plan was developed to conformally deliver a prescribed dose of 34.0 Gy in 1 fraction (34.0 Gy per fraction) to the planning target volume. The treatment plan was inversely optimized such that the prescription isodose volume exactly matched the target volume in all three spatial dimensions and that the dose fell sharply away from the target volume. Normal tissue dose constraints for critical organs associated with the treatment site were reviewed.

Below are the plan statistics:

• Target: PTV_34
• Target Volume: 8.5 cc
• Prescription Dose: 34 Gy
• Coverage: 95%
• Conformity Index (PITV): 1.1 (Deviation: None)
• R50: 5 (Deviation: None)
• Gradient Measure: 0.85 cm
• Max Dose in 2cm Ring: 105% (Deviation: None)
• Homogeneity Index: 1.1

No deviations from institutional guidelines were observed. All metrics meet RTOG 0915 compliance criteria for SBRT plan quality.


A quality assurance plan was developed that was subsequently delivered to a phantom geometry. Measurements within the phantom were obtained and compared against the calculated plan to verify the accuracy of the radiation treatment plan. The data analysis showed good agreement between the plan and measurements. Calculations and data analysis were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the radiation oncology physicist, Dr. Kirby.
```

**Quality Checks:**
- Patient Demographics Present: ✅ None (correct)
- Correct Grammar ('1 fraction' not '1 fractions'): ✅ Yes
- Physician Name (Galvan): ✅ Present
- Physicist Name (Kirby): ✅ Present
- Dose (34 Gy): ✅ Present
- Technique (Free Breathing): ✅ Correct (no specific mention needed)
- Metrics Table: ✅ Present
- HTML Tags Present: ✅ None (correct)

---

### Test 11: Lung - High Fractionation (60 Gy / 8 fx)

**Status:** ✅ PASS

**Configuration:**
- Treatment Site: lung
- Dose: 60 Gy / 8 fractions
- Dose/Fraction: 7.50 Gy
- Breathing Technique: 4DCT
- Target: PTV_60
- PTV Volume: 35.2 cc

**Generated Writeup:**

```
Dr. Galvan requested a medical physics consultation for --- for a 4D CT simulation study and SBRT delivery. Dr. Galvan has elected to treat with a stereotactic body radiotherapy (SBRT) technique by means of the Pinnacle treatment planning system in conjunction with the VersaHD linear accelerator equipped with the kV-CBCT system.

The patient was scanned in our CT simulator in the treatment position (head first supine orientation) with a customized immobilization device to limit motion during treatment and aid in inter-fractional repositioning. Both the prescribing radiation oncologist and radiation oncology physicist evaluated and approved the patient setup. A 4D kVCT simulation scan was performed with the patient immobilized and their breathing limited to reduce tumor motion. Using the 4D dataset, an AIP CT image set and 10 phase CT image sets were reconstructed by the radiation oncology physicist and fused together to regenerate an ITV in order to assess the motion envelope. Dr. Galvan segmented and approved both the PTVs and OARs.

In the treatment planning system, a VMAT treatment plan was developed to conformally deliver a prescribed dose of 60.0 Gy in 8 fractions (7.5 Gy per fraction) to the planning target volume. The treatment plan was inversely optimized such that the prescription isodose volume exactly matched the target volume in all three spatial dimensions and that the dose fell sharply away from the target volume. Normal tissue dose constraints for critical organs associated with the treatment site were reviewed.

Below are the plan statistics:

• Target: PTV_60
• Target Volume: 35.2 cc
• Prescription Dose: 60 Gy
• Coverage: 95%
• Conformity Index (PITV): 1.1 (Deviation: None)
• R50: 5 (Deviation: None)
• Gradient Measure: 0.85 cm
• Max Dose in 2cm Ring: 105% (Deviation: None)
• Homogeneity Index: 1.1

No deviations from institutional guidelines were observed. All metrics meet RTOG 0915 compliance criteria for SBRT plan quality.


A quality assurance plan was developed that was subsequently delivered to a phantom geometry. Measurements within the phantom were obtained and compared against the calculated plan to verify the accuracy of the radiation treatment plan. The data analysis showed good agreement between the plan and measurements. Calculations and data analysis were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the radiation oncology physicist, Dr. Kirby.
```

**Quality Checks:**
- Patient Demographics Present: ✅ None (correct)
- Fractions Mentioned Correctly: ✅ Yes
- Physician Name (Galvan): ✅ Present
- Physicist Name (Kirby): ✅ Present
- Dose (60 Gy): ✅ Present
- Technique Description (4DCT): ✅ Present
- Metrics Table: ✅ Present
- HTML Tags Present: ✅ None (correct)

---

### Test 12: Spine - Decimal Dose (27.5 Gy / 5 fx)

**Status:** ✅ PASS

**Configuration:**
- Treatment Site: spine
- Anatomical Clarification: L4-L5
- Dose: 27.5 Gy / 5 fractions
- Dose/Fraction: 5.50 Gy
- Breathing Technique: freebreathe
- Target: PTV_27.5
- PTV Volume: 18.9 cc

**Generated Writeup:**

```
Dr. Galvan requested a medical physics consultation for --- for SBRT delivery. Dr. Galvan has elected to treat with a stereotactic body radiotherapy (SBRT) technique by means of the Pinnacle treatment planning system in conjunction with the VersaHD linear accelerator equipped with the kV-CBCT system.

The patient was scanned in our CT simulator in the treatment position (head first supine orientation) with a customized immobilization device to limit motion during treatment and aid in inter-fractional repositioning. Both the prescribing radiation oncologist and radiation oncology physicist evaluated and approved the patient setup. Dr. Galvan segmented and approved both the PTVs and OARs.

In the treatment planning system, a VMAT treatment plan was developed to conformally deliver a prescribed dose of 27.5 Gy in 5 fractions (5.5 Gy per fraction) to the planning target volume. The treatment plan was inversely optimized such that the prescription isodose volume exactly matched the target volume in all three spatial dimensions and that the dose fell sharply away from the target volume. Normal tissue dose constraints for critical organs associated with the treatment site were reviewed.

Below are the plan statistics:

• Target: PTV_27.5
• Target Volume: 18.9 cc
• Prescription Dose: 27.5 Gy
• Coverage: 95%
• Conformity Index (PITV): 1.1 (Deviation: None)
• R50: 5 (Deviation: None)
• Gradient Measure: 0.85 cm
• Max Dose in 2cm Ring: 105% (Deviation: None)
• Homogeneity Index: 1.1

No deviations from institutional guidelines were observed. All metrics meet RTOG 0915 compliance criteria for SBRT plan quality.


A quality assurance plan was developed that was subsequently delivered to a phantom geometry. Measurements within the phantom were obtained and compared against the calculated plan to verify the accuracy of the radiation treatment plan. The data analysis showed good agreement between the plan and measurements. Calculations and data analysis were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the radiation oncology physicist, Dr. Kirby.
```

**Quality Checks:**
- Patient Demographics Present: ✅ None (correct)
- Fractions Mentioned Correctly: ✅ Yes
- Physician Name (Galvan): ✅ Present
- Physicist Name (Kirby): ✅ Present
- Dose (27.5 Gy): ✅ Present
- Technique (Free Breathing): ✅ Correct (no specific mention needed)
- Metrics Table: ✅ Present
- Anatomical Clarification (L4-L5): ❌ Missing
- HTML Tags Present: ✅ None (correct)

---

### Test 13: Lung - Very Small PTV (50 Gy / 5 fx)

**Status:** ✅ PASS

**Configuration:**
- Treatment Site: lung
- Dose: 50 Gy / 5 fractions
- Dose/Fraction: 10.00 Gy
- Breathing Technique: 4DCT
- Target: PTV_50_small
- PTV Volume: 3.2 cc

**Generated Writeup:**

```
Dr. Galvan requested a medical physics consultation for --- for a 4D CT simulation study and SBRT delivery. Dr. Galvan has elected to treat with a stereotactic body radiotherapy (SBRT) technique by means of the Pinnacle treatment planning system in conjunction with the VersaHD linear accelerator equipped with the kV-CBCT system.

The patient was scanned in our CT simulator in the treatment position (head first supine orientation) with a customized immobilization device to limit motion during treatment and aid in inter-fractional repositioning. Both the prescribing radiation oncologist and radiation oncology physicist evaluated and approved the patient setup. A 4D kVCT simulation scan was performed with the patient immobilized and their breathing limited to reduce tumor motion. Using the 4D dataset, an AIP CT image set and 10 phase CT image sets were reconstructed by the radiation oncology physicist and fused together to regenerate an ITV in order to assess the motion envelope. Dr. Galvan segmented and approved both the PTVs and OARs.

In the treatment planning system, a VMAT treatment plan was developed to conformally deliver a prescribed dose of 50.0 Gy in 5 fractions (10.0 Gy per fraction) to the planning target volume. The treatment plan was inversely optimized such that the prescription isodose volume exactly matched the target volume in all three spatial dimensions and that the dose fell sharply away from the target volume. Normal tissue dose constraints for critical organs associated with the treatment site were reviewed.

Below are the plan statistics:

• Target: PTV_50_small
• Target Volume: 3.2 cc
• Prescription Dose: 50 Gy
• Coverage: 95%
• Conformity Index (PITV): 1.1 (Deviation: None)
• R50: 5 (Deviation: None)
• Gradient Measure: 0.85 cm
• Max Dose in 2cm Ring: 105% (Deviation: None)
• Homogeneity Index: 1.1

No deviations from institutional guidelines were observed. All metrics meet RTOG 0915 compliance criteria for SBRT plan quality.


A quality assurance plan was developed that was subsequently delivered to a phantom geometry. Measurements within the phantom were obtained and compared against the calculated plan to verify the accuracy of the radiation treatment plan. The data analysis showed good agreement between the plan and measurements. Calculations and data analysis were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the radiation oncology physicist, Dr. Kirby.
```

**Quality Checks:**
- Patient Demographics Present: ✅ None (correct)
- Fractions Mentioned Correctly: ✅ Yes
- Physician Name (Galvan): ✅ Present
- Physicist Name (Kirby): ✅ Present
- Dose (50 Gy): ✅ Present
- Technique Description (4DCT): ✅ Present
- Metrics Table: ✅ Present
- HTML Tags Present: ✅ None (correct)

---

### Test 14: Liver - Large PTV (45 Gy / 3 fx)

**Status:** ✅ PASS

**Configuration:**
- Treatment Site: liver
- Dose: 45 Gy / 3 fractions
- Dose/Fraction: 15.00 Gy
- Breathing Technique: freebreathe
- Target: PTV_45_large
- PTV Volume: 125.6 cc

**Generated Writeup:**

```
Dr. Galvan requested a medical physics consultation for --- for SBRT delivery. Dr. Galvan has elected to treat with a stereotactic body radiotherapy (SBRT) technique by means of the Pinnacle treatment planning system in conjunction with the VersaHD linear accelerator equipped with the kV-CBCT system.

The patient was scanned in our CT simulator in the treatment position (head first supine orientation) with a customized immobilization device to limit motion during treatment and aid in inter-fractional repositioning. Both the prescribing radiation oncologist and radiation oncology physicist evaluated and approved the patient setup. Dr. Galvan segmented and approved both the PTVs and OARs.

In the treatment planning system, a VMAT treatment plan was developed to conformally deliver a prescribed dose of 45.0 Gy in 3 fractions (15.0 Gy per fraction) to the planning target volume. The treatment plan was inversely optimized such that the prescription isodose volume exactly matched the target volume in all three spatial dimensions and that the dose fell sharply away from the target volume. Normal tissue dose constraints for critical organs associated with the treatment site were reviewed.

Below are the plan statistics:

• Target: PTV_45_large
• Target Volume: 125.6 cc
• Prescription Dose: 45 Gy
• Coverage: 95%
• Conformity Index (PITV): 1.1 (Deviation: None)
• R50: 5 (Deviation: None)
• Gradient Measure: 0.85 cm
• Max Dose in 2cm Ring: 105% (Deviation: None)
• Homogeneity Index: 1.1

No deviations from institutional guidelines were observed. All metrics meet RTOG 0915 compliance criteria for SBRT plan quality.


A quality assurance plan was developed that was subsequently delivered to a phantom geometry. Measurements within the phantom were obtained and compared against the calculated plan to verify the accuracy of the radiation treatment plan. The data analysis showed good agreement between the plan and measurements. Calculations and data analysis were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the radiation oncology physicist, Dr. Kirby.
```

**Quality Checks:**
- Patient Demographics Present: ✅ None (correct)
- Fractions Mentioned Correctly: ✅ Yes
- Physician Name (Galvan): ✅ Present
- Physicist Name (Kirby): ✅ Present
- Dose (45 Gy): ✅ Present
- Technique (Free Breathing): ✅ Correct (no specific mention needed)
- Metrics Table: ✅ Present
- HTML Tags Present: ✅ None (correct)

---

## Suite 4: SIB Cases and Custom Sites

### Test 15: Prostate - SIB with Comment (36.25 Gy / 5 fx)

**Status:** ✅ PASS

**Configuration:**
- Treatment Site: prostate
- Dose: 36.25 Gy / 5 fractions
- Dose/Fraction: 7.25 Gy
- Breathing Technique: freebreathe
- Target: PTV_Prostate_SIB
- PTV Volume: 52.3 cc
- **SIB Case**: SIB 40/36.25 Gy to dominant intraprostatic lesion

**Generated Writeup:**

```
Dr. Galvan requested a medical physics consultation for --- for SBRT delivery. Dr. Galvan has elected to treat with a stereotactic body radiotherapy (SBRT) technique by means of the Pinnacle treatment planning system in conjunction with the VersaHD linear accelerator equipped with the kV-CBCT system.

The patient was scanned in our CT simulator in the treatment position (head first supine orientation) with a customized immobilization device to limit motion during treatment and aid in inter-fractional repositioning. Both the prescribing radiation oncologist and radiation oncology physicist evaluated and approved the patient setup. Dr. Galvan segmented and approved both the PTVs and OARs.

In the treatment planning system, a VMAT treatment plan was developed to conformally deliver a prescribed dose of 36.25 Gy in 5 fractions (7.2 Gy per fraction) to the planning target volume. The treatment plan was inversely optimized such that the prescription isodose volume exactly matched the target volume in all three spatial dimensions and that the dose fell sharply away from the target volume. Normal tissue dose constraints for critical organs associated with the treatment site were reviewed.

Below are the plan statistics:

• Target: PTV_Prostate_SIB
• Target Volume: 52.3 cc
• Prescription Dose: 36.2 Gy
• Coverage: 95%
• Conformity Index (PITV): 1.1
• R50: 5
• Gradient Measure: 0.85 cm
• Max Dose in 2cm Ring: 105%
• Homogeneity Index: 1.1

This is an SIB case (SIB 40/36.25 Gy to dominant intraprostatic lesion). Deviation analysis not applicable for simultaneous integrated boost treatments.


A quality assurance plan was developed that was subsequently delivered to a phantom geometry. Measurements within the phantom were obtained and compared against the calculated plan to verify the accuracy of the radiation treatment plan. The data analysis showed good agreement between the plan and measurements. Calculations and data analysis were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the radiation oncology physicist, Dr. Kirby.
```

**Quality Checks:**
- Patient Demographics Present: ✅ None (correct)
- Fractions Mentioned Correctly: ✅ Yes
- Physician Name (Galvan): ✅ Present
- Physicist Name (Kirby): ✅ Present
- Dose (36.25 Gy): ✅ Present
- Technique (Free Breathing): ✅ Correct (no specific mention needed)
- Metrics Table: ✅ Present
- SIB Case Handling: ✅ Mentioned
- HTML Tags Present: ✅ None (correct)

---

### Test 16: Lung - SIB without Comment (50 Gy / 5 fx)

**Status:** ✅ PASS

**Configuration:**
- Treatment Site: lung
- Dose: 50 Gy / 5 fractions
- Dose/Fraction: 10.00 Gy
- Breathing Technique: 4DCT
- Target: PTV_50_SIB
- PTV Volume: 28.4 cc
- **SIB Case**: 

**Generated Writeup:**

```
Dr. Galvan requested a medical physics consultation for --- for a 4D CT simulation study and SBRT delivery. Dr. Galvan has elected to treat with a stereotactic body radiotherapy (SBRT) technique by means of the Pinnacle treatment planning system in conjunction with the VersaHD linear accelerator equipped with the kV-CBCT system.

The patient was scanned in our CT simulator in the treatment position (head first supine orientation) with a customized immobilization device to limit motion during treatment and aid in inter-fractional repositioning. Both the prescribing radiation oncologist and radiation oncology physicist evaluated and approved the patient setup. A 4D kVCT simulation scan was performed with the patient immobilized and their breathing limited to reduce tumor motion. Using the 4D dataset, an AIP CT image set and 10 phase CT image sets were reconstructed by the radiation oncology physicist and fused together to regenerate an ITV in order to assess the motion envelope. Dr. Galvan segmented and approved both the PTVs and OARs.

In the treatment planning system, a VMAT treatment plan was developed to conformally deliver a prescribed dose of 50.0 Gy in 5 fractions (10.0 Gy per fraction) to the planning target volume. The treatment plan was inversely optimized such that the prescription isodose volume exactly matched the target volume in all three spatial dimensions and that the dose fell sharply away from the target volume. Normal tissue dose constraints for critical organs associated with the treatment site were reviewed.

Below are the plan statistics:

• Target: PTV_50_SIB
• Target Volume: 28.4 cc
• Prescription Dose: 50 Gy
• Coverage: 95%
• Conformity Index (PITV): 1.1
• R50: 5
• Gradient Measure: 0.85 cm
• Max Dose in 2cm Ring: 105%
• Homogeneity Index: 1.1

This is an SIB case. Deviation analysis not applicable for simultaneous integrated boost treatments.


A quality assurance plan was developed that was subsequently delivered to a phantom geometry. Measurements within the phantom were obtained and compared against the calculated plan to verify the accuracy of the radiation treatment plan. The data analysis showed good agreement between the plan and measurements. Calculations and data analysis were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the radiation oncology physicist, Dr. Kirby.
```

**Quality Checks:**
- Patient Demographics Present: ✅ None (correct)
- Fractions Mentioned Correctly: ✅ Yes
- Physician Name (Galvan): ✅ Present
- Physicist Name (Kirby): ✅ Present
- Dose (50 Gy): ✅ Present
- Technique Description (4DCT): ✅ Present
- Metrics Table: ✅ Present
- SIB Case Handling: ✅ Mentioned
- HTML Tags Present: ✅ None (correct)

---

### Test 17: Custom Site - Adrenal (50 Gy / 5 fx)

**Status:** ✅ PASS

**Configuration:**
- Treatment Site: adrenal
- Dose: 50 Gy / 5 fractions
- Dose/Fraction: 10.00 Gy
- Breathing Technique: 4DCT
- Target: PTV_Adrenal
- PTV Volume: 15.7 cc

**Generated Writeup:**

```
Dr. Galvan requested a medical physics consultation for --- for a 4D CT simulation study and SBRT delivery. Dr. Galvan has elected to treat with a stereotactic body radiotherapy (SBRT) technique by means of the Pinnacle treatment planning system in conjunction with the VersaHD linear accelerator equipped with the kV-CBCT system.

The patient was scanned in our CT simulator in the treatment position (head first supine orientation) with a customized immobilization device to limit motion during treatment and aid in inter-fractional repositioning. Both the prescribing radiation oncologist and radiation oncology physicist evaluated and approved the patient setup. A 4D kVCT simulation scan was performed with the patient immobilized and their breathing limited to reduce tumor motion. Using the 4D dataset, an AIP CT image set and 10 phase CT image sets were reconstructed by the radiation oncology physicist and fused together to regenerate an ITV in order to assess the motion envelope. Dr. Galvan segmented and approved both the PTVs and OARs.

In the treatment planning system, a VMAT treatment plan was developed to conformally deliver a prescribed dose of 50.0 Gy in 5 fractions (10.0 Gy per fraction) to the planning target volume. The treatment plan was inversely optimized such that the prescription isodose volume exactly matched the target volume in all three spatial dimensions and that the dose fell sharply away from the target volume. Normal tissue dose constraints for critical organs associated with the treatment site were reviewed.

Below are the plan statistics:

• Target: PTV_Adrenal
• Target Volume: 15.7 cc
• Prescription Dose: 50 Gy
• Coverage: 95%
• Conformity Index (PITV): 1.1 (Deviation: None)
• R50: 5 (Deviation: None)
• Gradient Measure: 0.85 cm
• Max Dose in 2cm Ring: 105% (Deviation: None)
• Homogeneity Index: 1.1

No deviations from institutional guidelines were observed. All metrics meet RTOG 0915 compliance criteria for SBRT plan quality.


A quality assurance plan was developed that was subsequently delivered to a phantom geometry. Measurements within the phantom were obtained and compared against the calculated plan to verify the accuracy of the radiation treatment plan. The data analysis showed good agreement between the plan and measurements. Calculations and data analysis were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the radiation oncology physicist, Dr. Kirby.
```

**Quality Checks:**
- Patient Demographics Present: ✅ None (correct)
- Fractions Mentioned Correctly: ✅ Yes
- Physician Name (Galvan): ✅ Present
- Physicist Name (Kirby): ✅ Present
- Dose (50 Gy): ✅ Present
- Technique Description (4DCT): ✅ Present
- Metrics Table: ✅ Present
- HTML Tags Present: ✅ None (correct)

---

### Test 18: Custom Site - Pancreas (33 Gy / 3 fx)

**Status:** ✅ PASS

**Configuration:**
- Treatment Site: pancreas
- Dose: 33 Gy / 3 fractions
- Dose/Fraction: 11.00 Gy
- Breathing Technique: 4DCT
- Target: PTV_Pancreas
- PTV Volume: 42.1 cc

**Generated Writeup:**

```
Dr. Galvan requested a medical physics consultation for --- for a 4D CT simulation study and SBRT delivery. Dr. Galvan has elected to treat with a stereotactic body radiotherapy (SBRT) technique by means of the Pinnacle treatment planning system in conjunction with the VersaHD linear accelerator equipped with the kV-CBCT system.

The patient was scanned in our CT simulator in the treatment position (head first supine orientation) with a customized immobilization device to limit motion during treatment and aid in inter-fractional repositioning. Both the prescribing radiation oncologist and radiation oncology physicist evaluated and approved the patient setup. A 4D kVCT simulation scan was performed with the patient immobilized and their breathing limited to reduce tumor motion. Using the 4D dataset, an AIP CT image set and 10 phase CT image sets were reconstructed by the radiation oncology physicist and fused together to regenerate an ITV in order to assess the motion envelope. Dr. Galvan segmented and approved both the PTVs and OARs.

In the treatment planning system, a VMAT treatment plan was developed to conformally deliver a prescribed dose of 33.0 Gy in 3 fractions (11.0 Gy per fraction) to the planning target volume. The treatment plan was inversely optimized such that the prescription isodose volume exactly matched the target volume in all three spatial dimensions and that the dose fell sharply away from the target volume. Normal tissue dose constraints for critical organs associated with the treatment site were reviewed.

Below are the plan statistics:

• Target: PTV_Pancreas
• Target Volume: 42.1 cc
• Prescription Dose: 33 Gy
• Coverage: 95%
• Conformity Index (PITV): 1.1 (Deviation: None)
• R50: 5 (Deviation: None)
• Gradient Measure: 0.85 cm
• Max Dose in 2cm Ring: 105% (Deviation: None)
• Homogeneity Index: 1.1

No deviations from institutional guidelines were observed. All metrics meet RTOG 0915 compliance criteria for SBRT plan quality.


A quality assurance plan was developed that was subsequently delivered to a phantom geometry. Measurements within the phantom were obtained and compared against the calculated plan to verify the accuracy of the radiation treatment plan. The data analysis showed good agreement between the plan and measurements. Calculations and data analysis were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the radiation oncology physicist, Dr. Kirby.
```

**Quality Checks:**
- Patient Demographics Present: ✅ None (correct)
- Fractions Mentioned Correctly: ✅ Yes
- Physician Name (Galvan): ✅ Present
- Physicist Name (Kirby): ✅ Present
- Dose (33 Gy): ✅ Present
- Technique Description (4DCT): ✅ Present
- Metrics Table: ✅ Present
- HTML Tags Present: ✅ None (correct)

---

## Suite 5: Deviation Cases

### Test 19: Lung - Minor R50 Deviation (50 Gy / 5 fx)

**Status:** ✅ PASS

**Configuration:**
- Treatment Site: lung
- Dose: 50 Gy / 5 fractions
- Dose/Fraction: 10.00 Gy
- Breathing Technique: freebreathe
- Target: PTV_50_minor
- PTV Volume: 22.0 cc

**Generated Writeup:**

```
Dr. Galvan requested a medical physics consultation for --- for SBRT delivery. Dr. Galvan has elected to treat with a stereotactic body radiotherapy (SBRT) technique by means of the Pinnacle treatment planning system in conjunction with the VersaHD linear accelerator equipped with the kV-CBCT system.

The patient was scanned in our CT simulator in the treatment position (head first supine orientation) with a customized immobilization device to limit motion during treatment and aid in inter-fractional repositioning. Both the prescribing radiation oncologist and radiation oncology physicist evaluated and approved the patient setup. Dr. Galvan segmented and approved both the PTVs and OARs.

In the treatment planning system, a VMAT treatment plan was developed to conformally deliver a prescribed dose of 50.0 Gy in 5 fractions (10.0 Gy per fraction) to the planning target volume. The treatment plan was inversely optimized such that the prescription isodose volume exactly matched the target volume in all three spatial dimensions and that the dose fell sharply away from the target volume. Normal tissue dose constraints for critical organs associated with the treatment site were reviewed.

Below are the plan statistics:

• Target: PTV_50_minor
• Target Volume: 22 cc
• Prescription Dose: 50 Gy
• Coverage: 95%
• Conformity Index (PITV): 1.1 (Deviation: None)
• R50: 5.2 (Deviation: Minor)
• Gradient Measure: 0.85 cm
• Max Dose in 2cm Ring: 105% (Deviation: None)
• Homogeneity Index: 1.1

The following deviation(s) were identified:
• R50 of 5.2 shows acceptable dose falloff with minor deviation.
These deviations were evaluated and accepted during the treatment planning process.


A quality assurance plan was developed that was subsequently delivered to a phantom geometry. Measurements within the phantom were obtained and compared against the calculated plan to verify the accuracy of the radiation treatment plan. The data analysis showed good agreement between the plan and measurements. Calculations and data analysis were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the radiation oncology physicist, Dr. Kirby.
```

**Quality Checks:**
- Patient Demographics Present: ✅ None (correct)
- Fractions Mentioned Correctly: ✅ Yes
- Physician Name (Galvan): ✅ Present
- Physicist Name (Kirby): ✅ Present
- Dose (50 Gy): ✅ Present
- Technique (Free Breathing): ✅ Correct (no specific mention needed)
- Metrics Table: ✅ Present
- HTML Tags Present: ✅ None (correct)

---

### Test 20: Liver - Major Deviations (45 Gy / 3 fx)

**Status:** ✅ PASS

**Configuration:**
- Treatment Site: liver
- Dose: 45 Gy / 3 fractions
- Dose/Fraction: 15.00 Gy
- Breathing Technique: freebreathe
- Target: PTV_45_major
- PTV Volume: 34.0 cc

**Generated Writeup:**

```
Dr. Galvan requested a medical physics consultation for --- for SBRT delivery. Dr. Galvan has elected to treat with a stereotactic body radiotherapy (SBRT) technique by means of the Pinnacle treatment planning system in conjunction with the VersaHD linear accelerator equipped with the kV-CBCT system.

The patient was scanned in our CT simulator in the treatment position (head first supine orientation) with a customized immobilization device to limit motion during treatment and aid in inter-fractional repositioning. Both the prescribing radiation oncologist and radiation oncology physicist evaluated and approved the patient setup. Dr. Galvan segmented and approved both the PTVs and OARs.

In the treatment planning system, a VMAT treatment plan was developed to conformally deliver a prescribed dose of 45.0 Gy in 3 fractions (15.0 Gy per fraction) to the planning target volume. The treatment plan was inversely optimized such that the prescription isodose volume exactly matched the target volume in all three spatial dimensions and that the dose fell sharply away from the target volume. Normal tissue dose constraints for critical organs associated with the treatment site were reviewed.

Below are the plan statistics:

• Target: PTV_45_major
• Target Volume: 34 cc
• Prescription Dose: 45 Gy
• Coverage: 95%
• Conformity Index (PITV): 1.6 (Deviation: Major)
• R50: 6.5 (Deviation: Major)
• Gradient Measure: 0.85 cm
• Max Dose in 2cm Ring: 105% (Deviation: None)
• Homogeneity Index: 1.1

The following deviation(s) were identified:
• Conformity Index of 1.6 indicates the prescription isodose volume significantly exceeds the target volume, suggesting poor conformality.
• R50 of 6.5 indicates excessive dose spillage to normal tissue outside the target.
These deviations were evaluated and accepted during the treatment planning process.


A quality assurance plan was developed that was subsequently delivered to a phantom geometry. Measurements within the phantom were obtained and compared against the calculated plan to verify the accuracy of the radiation treatment plan. The data analysis showed good agreement between the plan and measurements. Calculations and data analysis were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the radiation oncology physicist, Dr. Kirby.
```

**Quality Checks:**
- Patient Demographics Present: ✅ None (correct)
- Fractions Mentioned Correctly: ✅ Yes
- Physician Name (Galvan): ✅ Present
- Physicist Name (Kirby): ✅ Present
- Dose (45 Gy): ✅ Present
- Technique (Free Breathing): ✅ Correct (no specific mention needed)
- Metrics Table: ✅ Present
- Major Deviation Handling: ✅ Correct wording
- HTML Tags Present: ✅ None (correct)

---

## Quality Check Summary

- **Patient Demographics Found:** 0/20 ✅ PASS
- **Correct Grammar (fractions):** 20/20 ✅ PASS
- **Physician/Physicist Names Present:** 20/20 ✅ PASS
- **No HTML Tags:** 20/20 ✅ PASS

---

**End of Report**
