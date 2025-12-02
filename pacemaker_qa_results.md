# Pacemaker Module Comprehensive QA Report

**Generated:** 2025-11-26 16:39:06

**Purpose:** Comprehensive quality assurance testing for the Pacemaker/CIED module

## Summary

- **Total Tests:** 21
- **Passed:** 21
- **Failed:** 0
- **Success Rate:** 100.0%

## Quality Metrics

| Quality Check | Passed | Total | Rate |
|--------------|--------|-------|------|
| Aapm Guideline | 21 | 21 | 100.0% |
| Cied Mentioned | 21 | 21 | 100.0% |
| Defibrillator Mentioned | 21 | 21 | 100.0% |
| Device Vendor Mentioned | 21 | 21 | 100.0% |
| Dosimetry Mentioned | 21 | 21 | 100.0% |
| Heart Monitor Mentioned | 21 | 21 | 100.0% |
| Interrogation Mentioned | 21 | 21 | 100.0% |
| Mentions Risk | 21 | 21 | 100.0% |
| No Demographics | 21 | 21 | 100.0% |
| Pacing Dependency | 21 | 21 | 100.0% |
| Physician Format | 21 | 21 | 100.0% |
| Physicist Format | 21 | 21 | 100.0% |
| Treatment Site Mentioned | 21 | 21 | 100.0% |

## Detailed Test Results

---

### Test 1: Low Risk - Pacing Independent, < 2 Gy, > 10 cm

**Configuration:**
- Physician: Dr. Galvan
- Physicist: Dr. Kirby
- Treatment Site: lung
- Dose: 60.0 Gy in 30 fractions
- Field Distance: More than 10 cm from treatment field edge
- Device: Medtronic Azure
- Pacing Dependent: No
- TPS Max Dose: 0.5 Gy
- TPS Mean Dose: 0.2 Gy

**Status:** ✓ PASSED

**Quality Checks:**
- ✓ No Demographics
- ✓ Physician Format
- ✓ Physicist Format
- ✓ Mentions Risk
- ✓ Device Vendor Mentioned
- ✓ Cied Mentioned
- ✓ Pacing Dependency
- ✓ Treatment Site Mentioned
- ✓ Defibrillator Mentioned
- ✓ Heart Monitor Mentioned
- ✓ Interrogation Mentioned
- ✓ Dosimetry Mentioned
- ✓ Aapm Guideline

**Generated Write-up:**

```
Dr. Galvan requested a medical physics consultation for ---. The patient is undergoing radiation treatment to their lung at a dose of 60.0 Gy in 30 fractions. The patient has a model number Azure, from Medtronic. It is noted that they are not pacing dependent.

Our treatment plan follows the guidelines of the manufacturer for radiation therapy. No primary radiation fields intercept the pacemaker. The device was contoured in the treatment planning system. The maximum dose to the device was 0.5 Gy, with a mean dose of 0.2 Gy, which is well below the AAPM recommended total dose of 2 Gy. It is noted that no specific dose tolerance was provided by the manufacturer. 

One potential complication with any pacemaker is that radiation could induce an increased sensor rate. However, our dosimetry analysis puts this patient at a low risk for any radiation induced cardiac complications. A defibrillator is always available during treatment in case of emergency. A heart rate monitor is then used to monitor for events that would require the defibrillator. The patient had their device interrogated before the start of treatment. Per TG-203 guidelines, a follow-up device interrogation will be performed within 6 months after treatment completion.

This was reviewed by the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### Test 2: Medium Risk - Pacing Independent, 2-5 Gy

**Configuration:**
- Physician: Dr. Galvan
- Physicist: Dr. Kirby
- Treatment Site: thorax
- Dose: 50.0 Gy in 25 fractions
- Field Distance: Within 3 cm of field edge
- Device: Medtronic Azure
- Pacing Dependent: No
- TPS Max Dose: 3.0 Gy
- TPS Mean Dose: 1.5 Gy

**Status:** ✓ PASSED

**Quality Checks:**
- ✓ No Demographics
- ✓ Physician Format
- ✓ Physicist Format
- ✓ Mentions Risk
- ✓ Device Vendor Mentioned
- ✓ Cied Mentioned
- ✓ Pacing Dependency
- ✓ Treatment Site Mentioned
- ✓ Defibrillator Mentioned
- ✓ Heart Monitor Mentioned
- ✓ Interrogation Mentioned
- ✓ Dosimetry Mentioned
- ✓ Aapm Guideline

**Generated Write-up:**

```
Dr. Galvan requested a medical physics consultation for ---. The patient is undergoing radiation treatment to their thorax at a dose of 50.0 Gy in 25 fractions. The patient has a model number Azure, from Medtronic. It is noted that they are not pacing dependent.

Our treatment plan follows the guidelines of the manufacturer for radiation therapy. No primary radiation fields intercept the pacemaker. The device was contoured in the treatment planning system. The maximum dose to the device was 3.0 Gy, with a mean dose of 1.5 Gy, which exceeds the AAPM recommended total dose of 2 Gy. It is noted that no specific dose tolerance was provided by the manufacturer. 

One potential complication with any pacemaker is that radiation could induce an increased sensor rate. However, our dosimetry analysis puts this patient at a medium risk for any radiation induced cardiac complications. A defibrillator is always available during treatment in case of emergency. A heart rate monitor is then used to monitor for events that would require the defibrillator. The patient had their device interrogated before the start of treatment. Per TG-203 guidelines, the device will be interrogated at mid-treatment and again after completion, with a follow-up interrogation within 1 month of treatment end.

This was reviewed by the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### Test 3: Medium Risk - Pacing Dependent, < 2 Gy

**Configuration:**
- Physician: Dr. Galvan
- Physicist: Dr. Kirby
- Treatment Site: breast
- Dose: 50.0 Gy in 25 fractions
- Field Distance: More than 10 cm from treatment field edge
- Device: Medtronic Azure
- Pacing Dependent: Yes
- TPS Max Dose: 1.5 Gy
- TPS Mean Dose: 0.8 Gy

**Status:** ✓ PASSED

**Quality Checks:**
- ✓ No Demographics
- ✓ Physician Format
- ✓ Physicist Format
- ✓ Mentions Risk
- ✓ Device Vendor Mentioned
- ✓ Cied Mentioned
- ✓ Pacing Dependency
- ✓ Treatment Site Mentioned
- ✓ Defibrillator Mentioned
- ✓ Heart Monitor Mentioned
- ✓ Interrogation Mentioned
- ✓ Dosimetry Mentioned
- ✓ Aapm Guideline

**Generated Write-up:**

```
Dr. Galvan requested a medical physics consultation for ---. The patient is undergoing radiation treatment to their breast at a dose of 50.0 Gy in 25 fractions. The patient has a model number Azure, from Medtronic. It is noted that they are pacing dependent.

Our treatment plan follows the guidelines of the manufacturer for radiation therapy. No primary radiation fields intercept the pacemaker. The device was contoured in the treatment planning system. The maximum dose to the device was 1.5 Gy, with a mean dose of 0.8 Gy, which is well below the AAPM recommended total dose of 2 Gy. It is noted that no specific dose tolerance was provided by the manufacturer. 

One potential complication with any pacemaker is that radiation could induce an increased sensor rate. However, our dosimetry analysis puts this patient at a medium risk for any radiation induced cardiac complications. A defibrillator is always available during treatment in case of emergency. A heart rate monitor is then used to monitor for events that would require the defibrillator. The patient had their device interrogated before the start of treatment. Per TG-203 guidelines, the device will be interrogated at mid-treatment and again after completion, with a follow-up interrogation within 1 month of treatment end.

This was reviewed by the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### Test 4: High Risk - Pacing Dependent, > 5 Gy

**Configuration:**
- Physician: Dr. Galvan
- Physicist: Dr. Kirby
- Treatment Site: thorax
- Dose: 50.0 Gy in 25 fractions
- Field Distance: CIED in direct beam
- Device: Medtronic Azure
- Pacing Dependent: Yes
- TPS Max Dose: 7.0 Gy
- TPS Mean Dose: 4.0 Gy

**Status:** ✓ PASSED

**Quality Checks:**
- ✓ No Demographics
- ✓ Physician Format
- ✓ Physicist Format
- ✓ Mentions Risk
- ✓ Device Vendor Mentioned
- ✓ Cied Mentioned
- ✓ Pacing Dependency
- ✓ Treatment Site Mentioned
- ✓ Defibrillator Mentioned
- ✓ Heart Monitor Mentioned
- ✓ Interrogation Mentioned
- ✓ Dosimetry Mentioned
- ✓ Aapm Guideline

**Generated Write-up:**

```
Dr. Galvan requested a medical physics consultation for ---. The patient is undergoing radiation treatment to their thorax at a dose of 50.0 Gy in 25 fractions. The patient has a model number Azure, from Medtronic. It is noted that they are pacing dependent.

Our treatment plan follows the guidelines of the manufacturer for radiation therapy. The CIED is located within the direct treatment beam. The device was contoured in the treatment planning system. The maximum dose to the device was 7.0 Gy, with a mean dose of 4.0 Gy, which exceeds the AAPM recommended total dose of 2 Gy. It is noted that no specific dose tolerance was provided by the manufacturer. 

One potential complication with any pacemaker is that radiation could induce an increased sensor rate. However, our dosimetry analysis puts this patient at a high risk for any radiation induced cardiac complications. A defibrillator is always available during treatment in case of emergency. A heart rate monitor is then used to monitor for events that would require the defibrillator. Per TG-203 guidelines for high-risk cases, the device will be interrogated before each fraction and immediately after each treatment delivery. Due to the high risk nature of this case, a cardiologist will be on standby during treatment.

This was reviewed by the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### Test 5: Distance > 10 cm from field edge

**Configuration:**
- Physician: Dr. Galvan
- Physicist: Dr. Kirby
- Treatment Site: prostate
- Dose: 50.0 Gy in 25 fractions
- Field Distance: More than 10 cm from treatment field edge
- Device: Medtronic Azure
- Pacing Dependent: No
- TPS Max Dose: 0.3 Gy
- TPS Mean Dose: 0.2 Gy

**Status:** ✓ PASSED

**Quality Checks:**
- ✓ No Demographics
- ✓ Physician Format
- ✓ Physicist Format
- ✓ Mentions Risk
- ✓ Device Vendor Mentioned
- ✓ Cied Mentioned
- ✓ Pacing Dependency
- ✓ Treatment Site Mentioned
- ✓ Defibrillator Mentioned
- ✓ Heart Monitor Mentioned
- ✓ Interrogation Mentioned
- ✓ Dosimetry Mentioned
- ✓ Aapm Guideline

**Generated Write-up:**

```
Dr. Galvan requested a medical physics consultation for ---. The patient is undergoing radiation treatment to their prostate at a dose of 50.0 Gy in 25 fractions. The patient has a model number Azure, from Medtronic. It is noted that they are not pacing dependent.

Our treatment plan follows the guidelines of the manufacturer for radiation therapy. No primary radiation fields intercept the pacemaker. The device was contoured in the treatment planning system. The maximum dose to the device was 0.3 Gy, with a mean dose of 0.2 Gy, which is well below the AAPM recommended total dose of 2 Gy. It is noted that no specific dose tolerance was provided by the manufacturer. 

One potential complication with any pacemaker is that radiation could induce an increased sensor rate. However, our dosimetry analysis puts this patient at a low risk for any radiation induced cardiac complications. A defibrillator is always available during treatment in case of emergency. A heart rate monitor is then used to monitor for events that would require the defibrillator. The patient had their device interrogated before the start of treatment. Per TG-203 guidelines, a follow-up device interrogation will be performed within 6 months after treatment completion.

This was reviewed by the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### Test 6: Distance 3-10 cm (Less than 10 cm)

**Configuration:**
- Physician: Dr. Galvan
- Physicist: Dr. Kirby
- Treatment Site: lung
- Dose: 50.0 Gy in 25 fractions
- Field Distance: Less than 10 cm from field edge but not in direct field
- Device: Medtronic Azure
- Pacing Dependent: No
- TPS Max Dose: 1.5 Gy
- TPS Mean Dose: 0.2 Gy

**Status:** ✓ PASSED

**Quality Checks:**
- ✓ No Demographics
- ✓ Physician Format
- ✓ Physicist Format
- ✓ Mentions Risk
- ✓ Device Vendor Mentioned
- ✓ Cied Mentioned
- ✓ Pacing Dependency
- ✓ Treatment Site Mentioned
- ✓ Defibrillator Mentioned
- ✓ Heart Monitor Mentioned
- ✓ Interrogation Mentioned
- ✓ Dosimetry Mentioned
- ✓ Aapm Guideline

**Generated Write-up:**

```
Dr. Galvan requested a medical physics consultation for ---. The patient is undergoing radiation treatment to their lung at a dose of 50.0 Gy in 25 fractions. The patient has a model number Azure, from Medtronic. It is noted that they are not pacing dependent.

Our treatment plan follows the guidelines of the manufacturer for radiation therapy. No primary radiation fields intercept the pacemaker. The device was contoured in the treatment planning system. The maximum dose to the device was 1.5 Gy, with a mean dose of 0.2 Gy, which is well below the AAPM recommended total dose of 2 Gy. It is noted that no specific dose tolerance was provided by the manufacturer. 

One potential complication with any pacemaker is that radiation could induce an increased sensor rate. However, our dosimetry analysis puts this patient at a low risk for any radiation induced cardiac complications. A defibrillator is always available during treatment in case of emergency. A heart rate monitor is then used to monitor for events that would require the defibrillator. The patient had their device interrogated before the start of treatment. Per TG-203 guidelines, a follow-up device interrogation will be performed within 6 months after treatment completion.

This was reviewed by the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### Test 7: Within 3 cm of field edge

**Configuration:**
- Physician: Dr. Galvan
- Physicist: Dr. Kirby
- Treatment Site: thorax
- Dose: 50.0 Gy in 25 fractions
- Field Distance: Within 3 cm of field edge
- Device: Medtronic Azure
- Pacing Dependent: No
- TPS Max Dose: 3.5 Gy
- TPS Mean Dose: 0.2 Gy

**Status:** ✓ PASSED

**Quality Checks:**
- ✓ No Demographics
- ✓ Physician Format
- ✓ Physicist Format
- ✓ Mentions Risk
- ✓ Device Vendor Mentioned
- ✓ Cied Mentioned
- ✓ Pacing Dependency
- ✓ Treatment Site Mentioned
- ✓ Defibrillator Mentioned
- ✓ Heart Monitor Mentioned
- ✓ Interrogation Mentioned
- ✓ Dosimetry Mentioned
- ✓ Aapm Guideline

**Generated Write-up:**

```
Dr. Galvan requested a medical physics consultation for ---. The patient is undergoing radiation treatment to their thorax at a dose of 50.0 Gy in 25 fractions. The patient has a model number Azure, from Medtronic. It is noted that they are not pacing dependent.

Our treatment plan follows the guidelines of the manufacturer for radiation therapy. No primary radiation fields intercept the pacemaker. The device was contoured in the treatment planning system. The maximum dose to the device was 3.5 Gy, with a mean dose of 0.2 Gy, which exceeds the AAPM recommended total dose of 2 Gy. It is noted that no specific dose tolerance was provided by the manufacturer. 

One potential complication with any pacemaker is that radiation could induce an increased sensor rate. However, our dosimetry analysis puts this patient at a medium risk for any radiation induced cardiac complications. A defibrillator is always available during treatment in case of emergency. A heart rate monitor is then used to monitor for events that would require the defibrillator. The patient had their device interrogated before the start of treatment. Per TG-203 guidelines, the device will be interrogated at mid-treatment and again after completion, with a follow-up interrogation within 1 month of treatment end.

This was reviewed by the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### Test 8: CIED in direct beam

**Configuration:**
- Physician: Dr. Galvan
- Physicist: Dr. Kirby
- Treatment Site: thorax
- Dose: 50.0 Gy in 25 fractions
- Field Distance: CIED in direct beam
- Device: Medtronic Azure
- Pacing Dependent: No
- TPS Max Dose: 8.0 Gy
- TPS Mean Dose: 0.2 Gy

**Status:** ✓ PASSED

**Quality Checks:**
- ✓ No Demographics
- ✓ Physician Format
- ✓ Physicist Format
- ✓ Mentions Risk
- ✓ Device Vendor Mentioned
- ✓ Cied Mentioned
- ✓ Pacing Dependency
- ✓ Treatment Site Mentioned
- ✓ Defibrillator Mentioned
- ✓ Heart Monitor Mentioned
- ✓ Interrogation Mentioned
- ✓ Dosimetry Mentioned
- ✓ Aapm Guideline

**Generated Write-up:**

```
Dr. Galvan requested a medical physics consultation for ---. The patient is undergoing radiation treatment to their thorax at a dose of 50.0 Gy in 25 fractions. The patient has a model number Azure, from Medtronic. It is noted that they are not pacing dependent.

Our treatment plan follows the guidelines of the manufacturer for radiation therapy. The CIED is located within the direct treatment beam. The device was contoured in the treatment planning system. The maximum dose to the device was 8.0 Gy, with a mean dose of 0.2 Gy, which exceeds the AAPM recommended total dose of 2 Gy. It is noted that no specific dose tolerance was provided by the manufacturer. 

One potential complication with any pacemaker is that radiation could induce an increased sensor rate. However, our dosimetry analysis puts this patient at a high risk for any radiation induced cardiac complications. A defibrillator is always available during treatment in case of emergency. A heart rate monitor is then used to monitor for events that would require the defibrillator. Per TG-203 guidelines for high-risk cases, the device will be interrogated before each fraction and immediately after each treatment delivery. Due to the high risk nature of this case, a cardiologist will be on standby during treatment.

This was reviewed by the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### Test 9: Medtronic - Azure

**Configuration:**
- Physician: Dr. Galvan
- Physicist: Dr. Kirby
- Treatment Site: thorax
- Dose: 50.0 Gy in 25 fractions
- Field Distance: More than 10 cm from treatment field edge
- Device: Medtronic Azure
- Pacing Dependent: No
- TPS Max Dose: 0.5 Gy
- TPS Mean Dose: 0.2 Gy

**Status:** ✓ PASSED

**Quality Checks:**
- ✓ No Demographics
- ✓ Physician Format
- ✓ Physicist Format
- ✓ Mentions Risk
- ✓ Device Vendor Mentioned
- ✓ Cied Mentioned
- ✓ Pacing Dependency
- ✓ Treatment Site Mentioned
- ✓ Defibrillator Mentioned
- ✓ Heart Monitor Mentioned
- ✓ Interrogation Mentioned
- ✓ Dosimetry Mentioned
- ✓ Aapm Guideline

**Generated Write-up:**

```
Dr. Galvan requested a medical physics consultation for ---. The patient is undergoing radiation treatment to their thorax at a dose of 50.0 Gy in 25 fractions. The patient has a model number Azure, from Medtronic. It is noted that they are not pacing dependent.

Our treatment plan follows the guidelines of the manufacturer for radiation therapy. No primary radiation fields intercept the pacemaker. The device was contoured in the treatment planning system. The maximum dose to the device was 0.5 Gy, with a mean dose of 0.2 Gy, which is well below the AAPM recommended total dose of 2 Gy. It is noted that no specific dose tolerance was provided by the manufacturer. 

One potential complication with any pacemaker is that radiation could induce an increased sensor rate. However, our dosimetry analysis puts this patient at a low risk for any radiation induced cardiac complications. A defibrillator is always available during treatment in case of emergency. A heart rate monitor is then used to monitor for events that would require the defibrillator. The patient had their device interrogated before the start of treatment. Per TG-203 guidelines, a follow-up device interrogation will be performed within 6 months after treatment completion.

This was reviewed by the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### Test 10: Boston Scientific - Ingenio

**Configuration:**
- Physician: Dr. Galvan
- Physicist: Dr. Kirby
- Treatment Site: thorax
- Dose: 50.0 Gy in 25 fractions
- Field Distance: More than 10 cm from treatment field edge
- Device: Boston Scientific Ingenio
- Pacing Dependent: No
- TPS Max Dose: 0.5 Gy
- TPS Mean Dose: 0.2 Gy

**Status:** ✓ PASSED

**Quality Checks:**
- ✓ No Demographics
- ✓ Physician Format
- ✓ Physicist Format
- ✓ Mentions Risk
- ✓ Device Vendor Mentioned
- ✓ Cied Mentioned
- ✓ Pacing Dependency
- ✓ Treatment Site Mentioned
- ✓ Defibrillator Mentioned
- ✓ Heart Monitor Mentioned
- ✓ Interrogation Mentioned
- ✓ Dosimetry Mentioned
- ✓ Aapm Guideline

**Generated Write-up:**

```
Dr. Galvan requested a medical physics consultation for ---. The patient is undergoing radiation treatment to their thorax at a dose of 50.0 Gy in 25 fractions. The patient has a model number Ingenio, from Boston Scientific. It is noted that they are not pacing dependent.

Our treatment plan follows the guidelines of the manufacturer for radiation therapy. No primary radiation fields intercept the pacemaker. The device was contoured in the treatment planning system. The maximum dose to the device was 0.5 Gy, with a mean dose of 0.2 Gy, which is well below the AAPM recommended total dose of 2 Gy. It is noted that no specific dose tolerance was provided by the manufacturer. 

One potential complication with any pacemaker is that radiation could induce an increased sensor rate. However, our dosimetry analysis puts this patient at a low risk for any radiation induced cardiac complications. A defibrillator is always available during treatment in case of emergency. A heart rate monitor is then used to monitor for events that would require the defibrillator. The patient had their device interrogated before the start of treatment. Per TG-203 guidelines, a follow-up device interrogation will be performed within 6 months after treatment completion.

This was reviewed by the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### Test 11: Abbott/St. Jude Medical - Assurity

**Configuration:**
- Physician: Dr. Galvan
- Physicist: Dr. Kirby
- Treatment Site: thorax
- Dose: 50.0 Gy in 25 fractions
- Field Distance: More than 10 cm from treatment field edge
- Device: Abbott/St. Jude Medical Assurity
- Pacing Dependent: No
- TPS Max Dose: 0.5 Gy
- TPS Mean Dose: 0.2 Gy

**Status:** ✓ PASSED

**Quality Checks:**
- ✓ No Demographics
- ✓ Physician Format
- ✓ Physicist Format
- ✓ Mentions Risk
- ✓ Device Vendor Mentioned
- ✓ Cied Mentioned
- ✓ Pacing Dependency
- ✓ Treatment Site Mentioned
- ✓ Defibrillator Mentioned
- ✓ Heart Monitor Mentioned
- ✓ Interrogation Mentioned
- ✓ Dosimetry Mentioned
- ✓ Aapm Guideline

**Generated Write-up:**

```
Dr. Galvan requested a medical physics consultation for ---. The patient is undergoing radiation treatment to their thorax at a dose of 50.0 Gy in 25 fractions. The patient has a model number Assurity, from Abbott/St. Jude Medical. It is noted that they are not pacing dependent.

Our treatment plan follows the guidelines of the manufacturer for radiation therapy. No primary radiation fields intercept the pacemaker. The device was contoured in the treatment planning system. The maximum dose to the device was 0.5 Gy, with a mean dose of 0.2 Gy, which is well below the AAPM recommended total dose of 2 Gy. It is noted that no specific dose tolerance was provided by the manufacturer. 

One potential complication with any pacemaker is that radiation could induce an increased sensor rate. However, our dosimetry analysis puts this patient at a low risk for any radiation induced cardiac complications. A defibrillator is always available during treatment in case of emergency. A heart rate monitor is then used to monitor for events that would require the defibrillator. The patient had their device interrogated before the start of treatment. Per TG-203 guidelines, a follow-up device interrogation will be performed within 6 months after treatment completion.

This was reviewed by the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### Test 12: Biotronik - Evia

**Configuration:**
- Physician: Dr. Galvan
- Physicist: Dr. Kirby
- Treatment Site: thorax
- Dose: 50.0 Gy in 25 fractions
- Field Distance: More than 10 cm from treatment field edge
- Device: Biotronik Evia
- Pacing Dependent: No
- TPS Max Dose: 0.5 Gy
- TPS Mean Dose: 0.2 Gy

**Status:** ✓ PASSED

**Quality Checks:**
- ✓ No Demographics
- ✓ Physician Format
- ✓ Physicist Format
- ✓ Mentions Risk
- ✓ Device Vendor Mentioned
- ✓ Cied Mentioned
- ✓ Pacing Dependency
- ✓ Treatment Site Mentioned
- ✓ Defibrillator Mentioned
- ✓ Heart Monitor Mentioned
- ✓ Interrogation Mentioned
- ✓ Dosimetry Mentioned
- ✓ Aapm Guideline

**Generated Write-up:**

```
Dr. Galvan requested a medical physics consultation for ---. The patient is undergoing radiation treatment to their thorax at a dose of 50.0 Gy in 25 fractions. The patient has a model number Evia, from Biotronik. It is noted that they are not pacing dependent.

Our treatment plan follows the guidelines of the manufacturer for radiation therapy. No primary radiation fields intercept the pacemaker. The device was contoured in the treatment planning system. The maximum dose to the device was 0.5 Gy, with a mean dose of 0.2 Gy, which is well below the AAPM recommended total dose of 2 Gy. It is noted that no specific dose tolerance was provided by the manufacturer. 

One potential complication with any pacemaker is that radiation could induce an increased sensor rate. However, our dosimetry analysis puts this patient at a low risk for any radiation induced cardiac complications. A defibrillator is always available during treatment in case of emergency. A heart rate monitor is then used to monitor for events that would require the defibrillator. The patient had their device interrogated before the start of treatment. Per TG-203 guidelines, a follow-up device interrogation will be performed within 6 months after treatment completion.

This was reviewed by the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### Test 13: Treatment site: brain

**Configuration:**
- Physician: Dr. Galvan
- Physicist: Dr. Kirby
- Treatment Site: brain
- Dose: 50.0 Gy in 25 fractions
- Field Distance: More than 10 cm from treatment field edge
- Device: Medtronic Azure
- Pacing Dependent: No
- TPS Max Dose: 0.5 Gy
- TPS Mean Dose: 0.2 Gy

**Status:** ✓ PASSED

**Quality Checks:**
- ✓ No Demographics
- ✓ Physician Format
- ✓ Physicist Format
- ✓ Mentions Risk
- ✓ Device Vendor Mentioned
- ✓ Cied Mentioned
- ✓ Pacing Dependency
- ✓ Treatment Site Mentioned
- ✓ Defibrillator Mentioned
- ✓ Heart Monitor Mentioned
- ✓ Interrogation Mentioned
- ✓ Dosimetry Mentioned
- ✓ Aapm Guideline

**Generated Write-up:**

```
Dr. Galvan requested a medical physics consultation for ---. The patient is undergoing radiation treatment to their brain at a dose of 50.0 Gy in 25 fractions. The patient has a model number Azure, from Medtronic. It is noted that they are not pacing dependent.

Our treatment plan follows the guidelines of the manufacturer for radiation therapy. No primary radiation fields intercept the pacemaker. The device was contoured in the treatment planning system. The maximum dose to the device was 0.5 Gy, with a mean dose of 0.2 Gy, which is well below the AAPM recommended total dose of 2 Gy. It is noted that no specific dose tolerance was provided by the manufacturer. 

One potential complication with any pacemaker is that radiation could induce an increased sensor rate. However, our dosimetry analysis puts this patient at a low risk for any radiation induced cardiac complications. A defibrillator is always available during treatment in case of emergency. A heart rate monitor is then used to monitor for events that would require the defibrillator. The patient had their device interrogated before the start of treatment. Per TG-203 guidelines, a follow-up device interrogation will be performed within 6 months after treatment completion.

This was reviewed by the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### Test 14: Treatment site: head and neck

**Configuration:**
- Physician: Dr. Galvan
- Physicist: Dr. Kirby
- Treatment Site: head and neck
- Dose: 50.0 Gy in 25 fractions
- Field Distance: More than 10 cm from treatment field edge
- Device: Medtronic Azure
- Pacing Dependent: No
- TPS Max Dose: 0.5 Gy
- TPS Mean Dose: 0.2 Gy

**Status:** ✓ PASSED

**Quality Checks:**
- ✓ No Demographics
- ✓ Physician Format
- ✓ Physicist Format
- ✓ Mentions Risk
- ✓ Device Vendor Mentioned
- ✓ Cied Mentioned
- ✓ Pacing Dependency
- ✓ Treatment Site Mentioned
- ✓ Defibrillator Mentioned
- ✓ Heart Monitor Mentioned
- ✓ Interrogation Mentioned
- ✓ Dosimetry Mentioned
- ✓ Aapm Guideline

**Generated Write-up:**

```
Dr. Galvan requested a medical physics consultation for ---. The patient is undergoing radiation treatment to their head and neck at a dose of 50.0 Gy in 25 fractions. The patient has a model number Azure, from Medtronic. It is noted that they are not pacing dependent.

Our treatment plan follows the guidelines of the manufacturer for radiation therapy. No primary radiation fields intercept the pacemaker. The device was contoured in the treatment planning system. The maximum dose to the device was 0.5 Gy, with a mean dose of 0.2 Gy, which is well below the AAPM recommended total dose of 2 Gy. It is noted that no specific dose tolerance was provided by the manufacturer. 

One potential complication with any pacemaker is that radiation could induce an increased sensor rate. However, our dosimetry analysis puts this patient at a low risk for any radiation induced cardiac complications. A defibrillator is always available during treatment in case of emergency. A heart rate monitor is then used to monitor for events that would require the defibrillator. The patient had their device interrogated before the start of treatment. Per TG-203 guidelines, a follow-up device interrogation will be performed within 6 months after treatment completion.

This was reviewed by the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### Test 15: Treatment site: breast

**Configuration:**
- Physician: Dr. Galvan
- Physicist: Dr. Kirby
- Treatment Site: breast
- Dose: 50.0 Gy in 25 fractions
- Field Distance: More than 10 cm from treatment field edge
- Device: Medtronic Azure
- Pacing Dependent: No
- TPS Max Dose: 0.5 Gy
- TPS Mean Dose: 0.2 Gy

**Status:** ✓ PASSED

**Quality Checks:**
- ✓ No Demographics
- ✓ Physician Format
- ✓ Physicist Format
- ✓ Mentions Risk
- ✓ Device Vendor Mentioned
- ✓ Cied Mentioned
- ✓ Pacing Dependency
- ✓ Treatment Site Mentioned
- ✓ Defibrillator Mentioned
- ✓ Heart Monitor Mentioned
- ✓ Interrogation Mentioned
- ✓ Dosimetry Mentioned
- ✓ Aapm Guideline

**Generated Write-up:**

```
Dr. Galvan requested a medical physics consultation for ---. The patient is undergoing radiation treatment to their breast at a dose of 50.0 Gy in 25 fractions. The patient has a model number Azure, from Medtronic. It is noted that they are not pacing dependent.

Our treatment plan follows the guidelines of the manufacturer for radiation therapy. No primary radiation fields intercept the pacemaker. The device was contoured in the treatment planning system. The maximum dose to the device was 0.5 Gy, with a mean dose of 0.2 Gy, which is well below the AAPM recommended total dose of 2 Gy. It is noted that no specific dose tolerance was provided by the manufacturer. 

One potential complication with any pacemaker is that radiation could induce an increased sensor rate. However, our dosimetry analysis puts this patient at a low risk for any radiation induced cardiac complications. A defibrillator is always available during treatment in case of emergency. A heart rate monitor is then used to monitor for events that would require the defibrillator. The patient had their device interrogated before the start of treatment. Per TG-203 guidelines, a follow-up device interrogation will be performed within 6 months after treatment completion.

This was reviewed by the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### Test 16: Treatment site: lung

**Configuration:**
- Physician: Dr. Galvan
- Physicist: Dr. Kirby
- Treatment Site: lung
- Dose: 50.0 Gy in 25 fractions
- Field Distance: More than 10 cm from treatment field edge
- Device: Medtronic Azure
- Pacing Dependent: No
- TPS Max Dose: 0.5 Gy
- TPS Mean Dose: 0.2 Gy

**Status:** ✓ PASSED

**Quality Checks:**
- ✓ No Demographics
- ✓ Physician Format
- ✓ Physicist Format
- ✓ Mentions Risk
- ✓ Device Vendor Mentioned
- ✓ Cied Mentioned
- ✓ Pacing Dependency
- ✓ Treatment Site Mentioned
- ✓ Defibrillator Mentioned
- ✓ Heart Monitor Mentioned
- ✓ Interrogation Mentioned
- ✓ Dosimetry Mentioned
- ✓ Aapm Guideline

**Generated Write-up:**

```
Dr. Galvan requested a medical physics consultation for ---. The patient is undergoing radiation treatment to their lung at a dose of 50.0 Gy in 25 fractions. The patient has a model number Azure, from Medtronic. It is noted that they are not pacing dependent.

Our treatment plan follows the guidelines of the manufacturer for radiation therapy. No primary radiation fields intercept the pacemaker. The device was contoured in the treatment planning system. The maximum dose to the device was 0.5 Gy, with a mean dose of 0.2 Gy, which is well below the AAPM recommended total dose of 2 Gy. It is noted that no specific dose tolerance was provided by the manufacturer. 

One potential complication with any pacemaker is that radiation could induce an increased sensor rate. However, our dosimetry analysis puts this patient at a low risk for any radiation induced cardiac complications. A defibrillator is always available during treatment in case of emergency. A heart rate monitor is then used to monitor for events that would require the defibrillator. The patient had their device interrogated before the start of treatment. Per TG-203 guidelines, a follow-up device interrogation will be performed within 6 months after treatment completion.

This was reviewed by the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### Test 17: Treatment site: abdomen

**Configuration:**
- Physician: Dr. Galvan
- Physicist: Dr. Kirby
- Treatment Site: abdomen
- Dose: 50.0 Gy in 25 fractions
- Field Distance: More than 10 cm from treatment field edge
- Device: Medtronic Azure
- Pacing Dependent: No
- TPS Max Dose: 0.5 Gy
- TPS Mean Dose: 0.2 Gy

**Status:** ✓ PASSED

**Quality Checks:**
- ✓ No Demographics
- ✓ Physician Format
- ✓ Physicist Format
- ✓ Mentions Risk
- ✓ Device Vendor Mentioned
- ✓ Cied Mentioned
- ✓ Pacing Dependency
- ✓ Treatment Site Mentioned
- ✓ Defibrillator Mentioned
- ✓ Heart Monitor Mentioned
- ✓ Interrogation Mentioned
- ✓ Dosimetry Mentioned
- ✓ Aapm Guideline

**Generated Write-up:**

```
Dr. Galvan requested a medical physics consultation for ---. The patient is undergoing radiation treatment to their abdomen at a dose of 50.0 Gy in 25 fractions. The patient has a model number Azure, from Medtronic. It is noted that they are not pacing dependent.

Our treatment plan follows the guidelines of the manufacturer for radiation therapy. No primary radiation fields intercept the pacemaker. The device was contoured in the treatment planning system. The maximum dose to the device was 0.5 Gy, with a mean dose of 0.2 Gy, which is well below the AAPM recommended total dose of 2 Gy. It is noted that no specific dose tolerance was provided by the manufacturer. 

One potential complication with any pacemaker is that radiation could induce an increased sensor rate. However, our dosimetry analysis puts this patient at a low risk for any radiation induced cardiac complications. A defibrillator is always available during treatment in case of emergency. A heart rate monitor is then used to monitor for events that would require the defibrillator. The patient had their device interrogated before the start of treatment. Per TG-203 guidelines, a follow-up device interrogation will be performed within 6 months after treatment completion.

This was reviewed by the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### Test 18: Treatment site: pelvis

**Configuration:**
- Physician: Dr. Galvan
- Physicist: Dr. Kirby
- Treatment Site: pelvis
- Dose: 50.0 Gy in 25 fractions
- Field Distance: More than 10 cm from treatment field edge
- Device: Medtronic Azure
- Pacing Dependent: No
- TPS Max Dose: 0.5 Gy
- TPS Mean Dose: 0.2 Gy

**Status:** ✓ PASSED

**Quality Checks:**
- ✓ No Demographics
- ✓ Physician Format
- ✓ Physicist Format
- ✓ Mentions Risk
- ✓ Device Vendor Mentioned
- ✓ Cied Mentioned
- ✓ Pacing Dependency
- ✓ Treatment Site Mentioned
- ✓ Defibrillator Mentioned
- ✓ Heart Monitor Mentioned
- ✓ Interrogation Mentioned
- ✓ Dosimetry Mentioned
- ✓ Aapm Guideline

**Generated Write-up:**

```
Dr. Galvan requested a medical physics consultation for ---. The patient is undergoing radiation treatment to their pelvis at a dose of 50.0 Gy in 25 fractions. The patient has a model number Azure, from Medtronic. It is noted that they are not pacing dependent.

Our treatment plan follows the guidelines of the manufacturer for radiation therapy. No primary radiation fields intercept the pacemaker. The device was contoured in the treatment planning system. The maximum dose to the device was 0.5 Gy, with a mean dose of 0.2 Gy, which is well below the AAPM recommended total dose of 2 Gy. It is noted that no specific dose tolerance was provided by the manufacturer. 

One potential complication with any pacemaker is that radiation could induce an increased sensor rate. However, our dosimetry analysis puts this patient at a low risk for any radiation induced cardiac complications. A defibrillator is always available during treatment in case of emergency. A heart rate monitor is then used to monitor for events that would require the defibrillator. The patient had their device interrogated before the start of treatment. Per TG-203 guidelines, a follow-up device interrogation will be performed within 6 months after treatment completion.

This was reviewed by the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### Test 19: SBRT - High dose single fraction

**Configuration:**
- Physician: Dr. Galvan
- Physicist: Dr. Kirby
- Treatment Site: lung
- Dose: 54.0 Gy in 3 fractions
- Field Distance: More than 10 cm from treatment field edge
- Device: Medtronic Azure
- Pacing Dependent: No
- TPS Max Dose: 1.8 Gy
- TPS Mean Dose: 0.2 Gy

**Status:** ✓ PASSED

**Quality Checks:**
- ✓ No Demographics
- ✓ Physician Format
- ✓ Physicist Format
- ✓ Mentions Risk
- ✓ Device Vendor Mentioned
- ✓ Cied Mentioned
- ✓ Pacing Dependency
- ✓ Treatment Site Mentioned
- ✓ Defibrillator Mentioned
- ✓ Heart Monitor Mentioned
- ✓ Interrogation Mentioned
- ✓ Dosimetry Mentioned
- ✓ Aapm Guideline

**Generated Write-up:**

```
Dr. Galvan requested a medical physics consultation for ---. The patient is undergoing radiation treatment to their lung at a dose of 54.0 Gy in 3 fractions. The patient has a model number Azure, from Medtronic. It is noted that they are not pacing dependent.

Our treatment plan follows the guidelines of the manufacturer for radiation therapy. No primary radiation fields intercept the pacemaker. The device was contoured in the treatment planning system. The maximum dose to the device was 1.8 Gy, with a mean dose of 0.2 Gy, which is well below the AAPM recommended total dose of 2 Gy. It is noted that no specific dose tolerance was provided by the manufacturer. 

One potential complication with any pacemaker is that radiation could induce an increased sensor rate. However, our dosimetry analysis puts this patient at a low risk for any radiation induced cardiac complications. A defibrillator is always available during treatment in case of emergency. A heart rate monitor is then used to monitor for events that would require the defibrillator. The patient had their device interrogated before the start of treatment. Per TG-203 guidelines, a follow-up device interrogation will be performed within 6 months after treatment completion.

This was reviewed by the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### Test 20: Low dose per fraction (conventional)

**Configuration:**
- Physician: Dr. Galvan
- Physicist: Dr. Kirby
- Treatment Site: prostate
- Dose: 78.0 Gy in 39 fractions
- Field Distance: More than 10 cm from treatment field edge
- Device: Medtronic Azure
- Pacing Dependent: No
- TPS Max Dose: 0.8 Gy
- TPS Mean Dose: 0.2 Gy

**Status:** ✓ PASSED

**Quality Checks:**
- ✓ No Demographics
- ✓ Physician Format
- ✓ Physicist Format
- ✓ Mentions Risk
- ✓ Device Vendor Mentioned
- ✓ Cied Mentioned
- ✓ Pacing Dependency
- ✓ Treatment Site Mentioned
- ✓ Defibrillator Mentioned
- ✓ Heart Monitor Mentioned
- ✓ Interrogation Mentioned
- ✓ Dosimetry Mentioned
- ✓ Aapm Guideline

**Generated Write-up:**

```
Dr. Galvan requested a medical physics consultation for ---. The patient is undergoing radiation treatment to their prostate at a dose of 78.0 Gy in 39 fractions. The patient has a model number Azure, from Medtronic. It is noted that they are not pacing dependent.

Our treatment plan follows the guidelines of the manufacturer for radiation therapy. No primary radiation fields intercept the pacemaker. The device was contoured in the treatment planning system. The maximum dose to the device was 0.8 Gy, with a mean dose of 0.2 Gy, which is well below the AAPM recommended total dose of 2 Gy. It is noted that no specific dose tolerance was provided by the manufacturer. 

One potential complication with any pacemaker is that radiation could induce an increased sensor rate. However, our dosimetry analysis puts this patient at a low risk for any radiation induced cardiac complications. A defibrillator is always available during treatment in case of emergency. A heart rate monitor is then used to monitor for events that would require the defibrillator. The patient had their device interrogated before the start of treatment. Per TG-203 guidelines, a follow-up device interrogation will be performed within 6 months after treatment completion.

This was reviewed by the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### Test 21: Device without model specified

**Configuration:**
- Physician: Dr. Galvan
- Physicist: Dr. Kirby
- Treatment Site: thorax
- Dose: 50.0 Gy in 25 fractions
- Field Distance: More than 10 cm from treatment field edge
- Device: MicroPort
- Pacing Dependent: No
- TPS Max Dose: 0.5 Gy
- TPS Mean Dose: 0.2 Gy

**Status:** ✓ PASSED

**Quality Checks:**
- ✓ No Demographics
- ✓ Physician Format
- ✓ Physicist Format
- ✓ Mentions Risk
- ✓ Device Vendor Mentioned
- ✓ Cied Mentioned
- ✓ Pacing Dependency
- ✓ Treatment Site Mentioned
- ✓ Defibrillator Mentioned
- ✓ Heart Monitor Mentioned
- ✓ Interrogation Mentioned
- ✓ Dosimetry Mentioned
- ✓ Aapm Guideline

**Generated Write-up:**

```
Dr. Galvan requested a medical physics consultation for ---. The patient is undergoing radiation treatment to their thorax at a dose of 50.0 Gy in 25 fractions. The patient has an implanted cardiac device, from MicroPort. It is noted that they are not pacing dependent.

Our treatment plan follows the guidelines of the manufacturer for radiation therapy. No primary radiation fields intercept the pacemaker. The device was contoured in the treatment planning system. The maximum dose to the device was 0.5 Gy, with a mean dose of 0.2 Gy, which is well below the AAPM recommended total dose of 2 Gy. The specific device model was not available at the time of planning. Manufacturer-specific recommendations could not be fully assessed. 

One potential complication with any pacemaker is that radiation could induce an increased sensor rate. However, our dosimetry analysis puts this patient at a low risk for any radiation induced cardiac complications. A defibrillator is always available during treatment in case of emergency. A heart rate monitor is then used to monitor for events that would require the defibrillator. The patient had their device interrogated before the start of treatment. Per TG-203 guidelines, a follow-up device interrogation will be performed within 6 months after treatment completion.

This was reviewed by the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

## Recommendations

✅ **All tests passed!** The Pacemaker module is ready for production deployment.

**All critical checks passed!**
