# Fusion Write-up Combination Test Results

**Generated for QA Review**

**Standardized Test Inputs:**
- Physician: Dr. Galvan
- Physicist: Dr. Kirby
- Lesion: brain
- Anatomical Region: brain

---

## Single Fusion Combinations

### 1. Single_MRI

**Configuration:** Single MRI fusion with Rigid registration

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

An MRI study was imported into the Velocity software. A fusion study was created between the planning CT and the imported image set. The CT and MRI image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of this fusion was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusion of the image sets was reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 2. Single_PET_Rigid

**Configuration:** Single PET/CT fusion with Rigid registration

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

A PET/CT study was imported into the Velocity software. A fusion study was created between the planning CT and the imported image set. The CT and PET/CT image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of this fusion was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusion of the image sets was reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 3. Single_PET_Deformable

**Configuration:** Single PET/CT fusion with Deformable registration

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

A PET/CT study was imported into the Velocity software. A fusion study was created between the planning CT and the imported image set. The CT and PET/CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results. The accuracy of this fusion was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusion of the image sets was reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 4. Single_CT_Rigid

**Configuration:** Single CT fusion with Rigid registration

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

A separate CT study was imported into the Velocity software. A fusion study was created between the planning CT and the imported CT image set. The planning CT and imported CT image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of this fusion was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusion of the image sets was reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 5. Single_CT_Deformable

**Configuration:** Single CT fusion with Deformable registration

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

A separate CT study was imported into the Velocity software. A fusion study was created between the planning CT and the imported CT image set. The planning CT and imported CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results. The accuracy of this fusion was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusion of the image sets was reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

## Double Fusion Combinations

### 1. Double_MRI

**Configuration:** Two MRI fusions with Rigid registration

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

Two MRI studies were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets. The CT and MRI image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of these fusions was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 2. MRI_plus_PET_Rigid

**Configuration:** MRI (Rigid) + PET/CT (Rigid)

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

Multiple image studies including one MRI study and one PET/CT study were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets. The CT and MRI image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of this fusion was validated using anatomical landmarks.

The CT and PET/CT image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of this fusion was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 3. MRI_plus_PET_Deformable

**Configuration:** MRI (Rigid) + PET/CT (Deformable)

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

Multiple image studies including one MRI study and one PET/CT study were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets. The CT and MRI image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of this fusion was validated using anatomical landmarks.

The CT and PET/CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results. The accuracy of this fusion was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 4. MRI_plus_CT_Rigid

**Configuration:** MRI (Rigid) + CT (Rigid)

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

Multiple image studies including one MRI study and one CT study were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets. The CT and MRI image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of this fusion was validated using anatomical landmarks.

The planning CT and imported CT image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of this fusion was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 5. MRI_plus_CT_Deformable

**Configuration:** MRI (Rigid) + CT (Deformable)

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

Multiple image studies including one MRI study and one CT study were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets. The CT and MRI image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of this fusion was validated using anatomical landmarks.

The planning CT and imported CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results. The accuracy of this fusion was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 6. Double_PET_Rigid

**Configuration:** Two PET/CT fusions with Rigid registration

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

Two PET/CT studies were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets. The CT and PET/CT image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of these fusions was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 7. PET_Rigid_plus_PET_Deformable

**Configuration:** PET/CT (Rigid) + PET/CT (Deformable)

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

Two PET/CT studies were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets. The CT and PET/CT image sets were aligned using rigid registration for one study and rigid registration followed by deformable registration for the other study. The accuracy of these fusions was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 8. PET_Rigid_plus_CT_Rigid

**Configuration:** PET/CT (Rigid) + CT (Rigid)

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

Multiple image studies including one PET/CT study and one CT study were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets. The CT and PET/CT image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of this fusion was validated using anatomical landmarks.

The planning CT and imported CT image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of this fusion was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 9. PET_Rigid_plus_CT_Deformable

**Configuration:** PET/CT (Rigid) + CT (Deformable)

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

Multiple image studies including one PET/CT study and one CT study were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets. The CT and PET/CT image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of this fusion was validated using anatomical landmarks.

The planning CT and imported CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results. The accuracy of this fusion was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 10. Double_PET_Deformable

**Configuration:** Two PET/CT fusions with Deformable registration

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

Two PET/CT studies were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets. The CT and PET/CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results. The accuracy of these fusions was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 11. PET_Deformable_plus_CT_Rigid

**Configuration:** PET/CT (Deformable) + CT (Rigid)

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

Multiple image studies including one PET/CT study and one CT study were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets. The CT and PET/CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results. The accuracy of this fusion was validated using anatomical landmarks.

The planning CT and imported CT image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of this fusion was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 12. PET_Deformable_plus_CT_Deformable

**Configuration:** PET/CT (Deformable) + CT (Deformable)

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

Multiple image studies including one PET/CT study and one CT study were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets. The CT and PET/CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results. The accuracy of this fusion was validated using anatomical landmarks.

The planning CT and imported CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results. The accuracy of this fusion was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 13. Double_CT_Rigid

**Configuration:** Two CT fusions with Rigid registration

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

Two CT studies were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets. The planning CT and imported CT image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of these fusions was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 14. CT_Rigid_plus_CT_Deformable

**Configuration:** CT (Rigid) + CT (Deformable)

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

Two CT studies were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets. The planning CT and imported CT image sets were aligned using rigid registration for one study and rigid registration followed by deformable registration for the other study. The accuracy of these fusions was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 15. Double_CT_Deformable

**Configuration:** Two CT fusions with Deformable registration

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

Two CT studies were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets. The planning CT and imported CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results. The accuracy of these fusions was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

## Triple Fusion Combinations (Representative)

### 1. MRI_MRI_MRI

**Configuration:** MRI (Rigid) + MRI (Rigid) + MRI (Rigid)

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

Three MRI studies were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets. The CT and MRI image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of these fusions was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 2. PET_Rigid_PET_Rigid_PET_Rigid

**Configuration:** PET/CT (Rigid) + PET/CT (Rigid) + PET/CT (Rigid)

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

Three PET/CT studies were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets. The CT and PET/CT image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of these fusions was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 3. PET_Deformable_PET_Deformable_PET_Deformable

**Configuration:** PET/CT (Deformable) + PET/CT (Deformable) + PET/CT (Deformable)

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

Three PET/CT studies were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets. The CT and PET/CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results. The accuracy of these fusions was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 4. CT_Rigid_CT_Rigid_CT_Rigid

**Configuration:** CT (Rigid) + CT (Rigid) + CT (Rigid)

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

Three CT studies were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets. The planning CT and imported CT image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of these fusions was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 5. CT_Deformable_CT_Deformable_CT_Deformable

**Configuration:** CT (Deformable) + CT (Deformable) + CT (Deformable)

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

Three CT studies were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets. The planning CT and imported CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results. The accuracy of these fusions was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 6. MRI_PET_Rigid_PET_Deformable

**Configuration:** MRI (Rigid) + PET/CT (Rigid) + PET/CT (Deformable)

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

Multiple image studies including one MRI study and two PET/CT studies were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets. The CT and MRI image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of this fusion was validated using anatomical landmarks.

The CT and PET/CT image sets were aligned using rigid registration for one study and rigid registration followed by deformable registration for the other study. The accuracy of these fusions was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 7. MRI_CT_Rigid_CT_Deformable

**Configuration:** MRI (Rigid) + CT (Rigid) + CT (Deformable)

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

Multiple image studies including one MRI study and two CT studies were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets. The CT and MRI image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of this fusion was validated using anatomical landmarks.

The planning CT and imported CT image sets were aligned using rigid registration for one study and rigid registration followed by deformable registration for the other study. The accuracy of these fusions was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 8. MRI_PET_Rigid_CT_Rigid

**Configuration:** MRI (Rigid) + PET/CT (Rigid) + CT (Rigid)

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

Multiple image studies including one MRI study, one CT study, and one PET/CT study were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets. The CT and MRI image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of this fusion was validated using anatomical landmarks.

The planning CT and imported CT image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of this fusion was validated using anatomical landmarks.

The CT and PET/CT image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of this fusion was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 9. PET_Rigid_PET_Deformable_CT_Rigid

**Configuration:** PET/CT (Rigid) + PET/CT (Deformable) + CT (Rigid)

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

Multiple image studies including two PET/CT studies and one CT study were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets. The CT and PET/CT image sets were aligned using rigid registration for one study and rigid registration followed by deformable registration for the other study. The accuracy of these fusions was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The planning CT and imported CT image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of this fusion was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 10. PET_Rigid_PET_Deformable_CT_Deformable

**Configuration:** PET/CT (Rigid) + PET/CT (Deformable) + CT (Deformable)

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

Multiple image studies including two PET/CT studies and one CT study were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets. The CT and PET/CT image sets were aligned using rigid registration for one study and rigid registration followed by deformable registration for the other study. The accuracy of these fusions was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The planning CT and imported CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results. The accuracy of this fusion was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 11. MRI_PET_Rigid_CT_Rigid

**Configuration:** MRI (Rigid) + PET/CT (Rigid) + CT (Rigid)

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

Multiple image studies including one MRI study, one CT study, and one PET/CT study were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets. The CT and MRI image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of this fusion was validated using anatomical landmarks.

The planning CT and imported CT image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of this fusion was validated using anatomical landmarks.

The CT and PET/CT image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of this fusion was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

### 12. MRI_PET_Deformable_CT_Deformable

**Configuration:** MRI (Rigid) + PET/CT (Deformable) + CT (Deformable)

**Write-up:**

```
Dr. Galvan requested a medical physics consultation for --- to perform a multimodality image fusion. The patient was scanned in our CT simulator in the treatment position. This CT study was then exported to the Velocity imaging registration software.

Multiple image studies including one MRI study, one CT study, and one PET/CT study were imported into the Velocity software. Fusion studies were created between the planning CT and each of the imported image sets. The CT and MRI image sets were initially aligned using a rigid registration algorithm based on the brain anatomy, which was then further refined manually. The accuracy of this fusion was validated using anatomical landmarks.

The planning CT and imported CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results. The accuracy of this fusion was validated using anatomical landmarks.

The CT and PET/CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results. The accuracy of this fusion was validated using anatomical landmarks. The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.

The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, Dr. Galvan, and the medical physicist, Dr. Kirby.
```

---

## Special Cases

### 1. Bladder_Filling_Study

**Configuration:** Full/Empty bladder comparison study

**Write-up:**

```
ERROR: API call failed - 500 Server Error: Internal Server Error for url: http://localhost:8000/api/fusion/generate
```

---

## Test Summary

- Total combinations tested: 33
- Single fusion types: 5
- Double fusion types: 15
- Triple fusion types: 12
- Special cases: 1

**Review Guidelines:**
1. Verify grammar (singular/plural agreement)
2. Check medical terminology accuracy
3. Validate registration method descriptions
4. Ensure proper formatting and punctuation
5. Confirm physician/physicist names are correct
