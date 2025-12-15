from app.schemas.fusion import FusionRequest, FusionResponse, Registration
from typing import List, Dict

class FusionService:
    """Service for generating fusion write-ups."""
    
    def __init__(self):
        """Initialize the Fusion service."""
        pass
    
    def generate_fusion_writeup(self, request: FusionRequest) -> FusionResponse:
        """Generate a fusion write-up based on the request data."""
        # DEBUG: Log the incoming request data
        print(f"\nDEBUG: generate_fusion_writeup called!")
        print(f"DEBUG: Physician: {request.common_info.physician.name}")
        print(f"DEBUG: Region: {request.fusion_data.anatomical_region}")
        print(f"DEBUG: Custom region: {request.fusion_data.custom_anatomical_region}")
        print(f"DEBUG: Registrations ({len(request.fusion_data.registrations)}):")
        for i, reg in enumerate(request.fusion_data.registrations):
            print(f"  [{i+1}] {reg.primary} -> {reg.secondary} ({reg.method})")
        print(f"DEBUG: Bladder study: {request.fusion_data.is_bladder_filling_study}")
        
        common_info = request.common_info
        fusion_data = request.fusion_data
        
        physician = common_info.physician.name
        physicist = common_info.physicist.name
        
        # Check if this is a bladder filling study
        if fusion_data.is_bladder_filling_study:
            return self._generate_bladder_filling_writeup(common_info, fusion_data)
        
        # Use custom anatomical region if provided, otherwise use the standard region
        anatomical_region = fusion_data.custom_anatomical_region if fusion_data.custom_anatomical_region else fusion_data.anatomical_region
        registrations = fusion_data.registrations
        
        # Generate fusion description text based on the registrations
        fusion_type_text = self._generate_fusion_text(registrations, anatomical_region)
        
        # Generate the write-up
        write_up = f"Dr. {physician} requested a medical physics consultation for --- to perform a multimodality image fusion. "
        write_up += "The patient was scanned in our CT simulator in the treatment position. "
        write_up += "This CT study was then exported to the Velocity imaging registration software.\n\n"
        
        write_up += f"{fusion_type_text}\n\n"
        
        # Adjust conclusion based on number of registrations
        if len(registrations) == 1:
            write_up += f"The fusion of the image sets was reviewed and approved by both the prescribing radiation oncologist, "
        else:
            write_up += f"The fusions of all image sets were reviewed and approved by both the prescribing radiation oncologist, "
        write_up += f"Dr. {physician}, and the medical physicist, Dr. {physicist}."
        
        return FusionResponse(writeup=write_up)
    
    def _generate_fusion_text(self, registrations: List[Registration], anatomical_region: str) -> str:
        """Generate the fusion description text based on the configured registrations."""
        # DEBUG: Always log what we receive
        print(f"DEBUG: _generate_fusion_text called with {len(registrations)} registrations:")
        for i, reg in enumerate(registrations):
            print(f"  [{i+1}] {reg.primary} -> {reg.secondary} ({reg.method})")
        print(f"DEBUG: anatomical_region='{anatomical_region}'")
        # Count registrations by modality for summary
        modality_counts = {}
        for reg in registrations:
            secondary = reg.secondary
            if secondary in modality_counts:
                modality_counts[secondary] += 1
            else:
                modality_counts[secondary] = 1
        
        # Introduction text varies based on the number and type of registrations
        intro_text = ""
        if len(registrations) == 1:
            # Single registration - improved flow
            reg = registrations[0]
            secondary = reg.secondary
            
            if secondary == "CT":
                intro_text = f"In addition to the planning CT, a separate {secondary} study was imported into the Velocity software. "
                intro_text += f"A fusion study was created between the planning CT and the imported CT image set. "
            elif secondary == "MRI":
                intro_text = f"In addition to the planning CT, an {secondary} study was imported into the Velocity software. "
                intro_text += f"A fusion study was created between the planning CT and the imported image set. "
            else:
                intro_text = f"In addition to the planning CT, a {secondary} study was imported into the Velocity software. "
                intro_text += f"A fusion study was created between the planning CT and the imported image set. "
            
        else:
            # Multiple registrations - improved plural/singular handling
            modality_descriptions = []
            for modality, count in modality_counts.items():
                if count == 1:
                    modality_descriptions.append(f"one {modality} study")
                else:
                    # Convert number to word for better readability
                    number_words = {2: "two", 3: "three", 4: "four", 5: "five"}
                    count_word = number_words.get(count, str(count))
                    modality_descriptions.append(f"{count_word} {modality} studies")
            
            if len(modality_descriptions) == 1:
                # Single modality type but potentially multiple studies
                desc = modality_descriptions[0]
                if desc.startswith("one"):
                    intro_text = f"In addition to the planning CT, a {desc.replace('one ', '')} was imported into the Velocity software. "
                else:
                    # For plural like "two MRI studies"
                    parts = desc.split(' ', 2)  # Split into ["two", "MRI", "studies"]
                    intro_text = f"In addition to the planning CT, {parts[0]} {parts[1]} {parts[2]} were imported into the Velocity software. "
            else:
                intro_text = f"In addition to the planning CT, multiple image studies including {' and '.join(modality_descriptions)} were imported into the Velocity software. "
            intro_text += "Fusion studies were created between the planning CT and each of the imported image sets. "
        
        # Registration process description
        reg_text = ""
        
        # Group registrations by modality for better text flow
        mri_registrations = [reg for reg in registrations if reg.secondary == "MRI"]
        pet_registrations = [reg for reg in registrations if reg.secondary == "PET/CT"]
        ct_registrations = [reg for reg in registrations if reg.secondary == "CT"]
        
        # Special handling for mixed MRI/CT + PET/CT combinations
        has_mri = len(mri_registrations) > 0
        has_pet = len(pet_registrations) > 0
        has_ct = len(ct_registrations) > 0
        
        # Check if this is a mixed MRI+PET combination (the special case we're implementing)
        is_mixed_mri_pet = has_mri and has_pet and not has_ct
        
        if is_mixed_mri_pet:
            print(f"DEBUG: MRI+PET MIXED COMBINATION DETECTED!")
            print(f"DEBUG: MRI registrations: {len(mri_registrations)}")
            print(f"DEBUG: PET registrations: {len(pet_registrations)}")
            for i, pet_reg in enumerate(pet_registrations):
                print(f"  PET[{i+1}] method: {pet_reg.method}")
            
            # Generate combined text for MRI + PET combinations
            return self._generate_mixed_mri_pet_text(mri_registrations, pet_registrations, anatomical_region)
        
        # Check if this is the ultimate MRI+CT+PET combination
        is_mixed_mri_ct_pet = has_mri and has_ct and has_pet
        
        if is_mixed_mri_ct_pet:
            print(f"DEBUG: ULTIMATE MRI+CT+PET COMBINATION DETECTED!")
            print(f"DEBUG: MRI={len(mri_registrations)}, CT={len(ct_registrations)}, PET={len(pet_registrations)}")
            for i, ct_reg in enumerate(ct_registrations):
                print(f"  CT[{i+1}] method: {ct_reg.method}")
            for i, pet_reg in enumerate(pet_registrations):
                print(f"  PET[{i+1}] method: {pet_reg.method}")
            
            # Generate combined text for ultimate MRI + CT + PET combinations
            return self._generate_mixed_mri_ct_pet_text(mri_registrations, ct_registrations, pet_registrations, anatomical_region)
        
        # Check if this is a mixed MRI+CT combination
        is_mixed_mri_ct = has_mri and has_ct and not has_pet
        
        if is_mixed_mri_ct:
            print(f"DEBUG: MRI+CT MIXED COMBINATION DETECTED!")
            print(f"DEBUG: MRI registrations: {len(mri_registrations)}")
            print(f"DEBUG: CT registrations: {len(ct_registrations)}")
            for i, ct_reg in enumerate(ct_registrations):
                print(f"  CT[{i+1}] method: {ct_reg.method}")
            
            # Generate combined text for MRI + CT combinations
            return self._generate_mixed_mri_ct_text(mri_registrations, ct_registrations, anatomical_region)
        
        if mri_registrations:
            if len(mri_registrations) == 1:
                reg_text += f"The CT and MRI image sets were initially aligned using a rigid registration algorithm based on the {anatomical_region} anatomy, which was then further refined manually. The accuracy of this fusion was validated using nearby anatomical landmarks."
            else:
                reg_text += f"The CT and MRI image sets were initially aligned using a rigid registration algorithm based on the {anatomical_region} anatomy, which was then further refined manually. The accuracy of these fusions was validated using nearby anatomical landmarks."
        
        if pet_registrations:
            if mri_registrations:
                reg_text += "\n\n"
            
            # Check if any PET/CT registrations use deformable method
            has_deformable_pet = any(reg.method.lower() != "rigid" for reg in pet_registrations)
            
            if len(pet_registrations) == 1:
                # Single PET/CT registration - similar to MRI approach
                if has_deformable_pet:
                    pet_text = f"The CT and PET/CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results. The accuracy of this fusion was validated using nearby anatomical landmarks."
                else:
                    pet_text = f"The CT and PET/CT image sets were initially aligned using a rigid registration algorithm based on the {anatomical_region} anatomy, which was then further refined manually. The accuracy of this fusion was validated using nearby anatomical landmarks."
            else:
                # Multiple PET/CT registrations - handle different combinations
                rigid_count = sum(1 for reg in pet_registrations if reg.method.lower() == "rigid")
                deformable_count = sum(1 for reg in pet_registrations if reg.method.lower() != "rigid")
                total_count = len(pet_registrations)
                
                if deformable_count == 0:
                    # All rigid
                    pet_text = f"The CT and PET/CT image sets were initially aligned using a rigid registration algorithm based on the {anatomical_region} anatomy, which was then further refined manually."
                elif rigid_count == 0:
                    # All deformable  
                    pet_text = f"The CT and PET/CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results."
                else:
                    # Mixed rigid and deformable
                    if rigid_count == 1 and deformable_count == 1:
                        pet_text = f"The CT and PET/CT image sets were aligned using rigid registration for one study and rigid registration followed by deformable registration for the other study."
                    elif deformable_count == 1 and total_count == 2:
                        # Only for exactly 2 total registrations with 1 deformable
                        pet_text = f"The CT and PET/CT image sets were initially aligned using rigid registration, with one study receiving additional deformable image registration."
                    elif rigid_count == 1:
                        pet_text = f"The CT and PET/CT image sets were aligned using rigid registration for one study, while the remaining {deformable_count} studies received rigid registration followed by deformable registration."
                    else:
                        # Multiple of each type (including cases with >2 total where deformable_count == 1)
                        print(f"DEBUG: FIXED BRANCH WORKING! rigid_count={rigid_count}, deformable_count={deformable_count}")
                        rigid_word = "study" if rigid_count == 1 else "studies"
                        deformable_word = "study" if deformable_count == 1 else "studies"
                        pet_text = f"The CT and PET/CT image sets were aligned using rigid registration for {rigid_count} {rigid_word} and rigid registration followed by deformable registration for {deformable_count} {deformable_word}."
                
                pet_text += f" The accuracy of these fusions was validated using nearby anatomical landmarks."
            
            reg_text += pet_text
        
        if ct_registrations:
            if mri_registrations or pet_registrations:
                reg_text += "\n\n"
            
            # Check if any CT registrations use deformable method
            has_deformable_ct = any(reg.method.lower() != "rigid" for reg in ct_registrations)
            
            if len(ct_registrations) == 1:
                # Single CT/CT registration - similar to MRI and PET/CT approach
                if has_deformable_ct:
                    ct_text = f"The planning CT and imported CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results. The accuracy of this fusion was validated using nearby anatomical landmarks."
                else:
                    ct_text = f"The planning CT and imported CT image sets were initially aligned using a rigid registration algorithm based on the {anatomical_region} anatomy, which was then further refined manually. The accuracy of this fusion was validated using nearby anatomical landmarks."
            else:
                # Multiple CT/CT registrations - handle different combinations using PET/CT patterns
                rigid_count = sum(1 for reg in ct_registrations if reg.method.lower() == "rigid")
                deformable_count = sum(1 for reg in ct_registrations if reg.method.lower() != "rigid")
                total_count = len(ct_registrations)
                
                if deformable_count == 0:
                    # All rigid
                    ct_text = f"The planning CT and imported CT image sets were initially aligned using a rigid registration algorithm based on the {anatomical_region} anatomy, which was then further refined manually."
                elif rigid_count == 0:
                    # All deformable  
                    ct_text = f"The planning CT and imported CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results."
                else:
                    # Mixed rigid and deformable - mirror PET/CT logic exactly
                    if rigid_count == 1 and deformable_count == 1:
                        ct_text = f"The planning CT and imported CT image sets were aligned using rigid registration for one study and rigid registration followed by deformable registration for the other study."
                    elif deformable_count == 1 and total_count == 2:
                        # Only for exactly 2 total registrations with 1 deformable
                        ct_text = f"The planning CT and imported CT image sets were initially aligned using rigid registration, with one study receiving additional deformable image registration."
                    elif rigid_count == 1:
                        ct_text = f"The planning CT and imported CT image sets were aligned using rigid registration for one study, while the remaining {deformable_count} studies received rigid registration followed by deformable registration."
                    else:
                        # Multiple of each type (including cases with >2 total where deformable_count == 1)
                        print(f"DEBUG: CT/CT ENHANCED BRANCH! rigid_count={rigid_count}, deformable_count={deformable_count}")
                        rigid_word = "study" if rigid_count == 1 else "studies"
                        deformable_word = "study" if deformable_count == 1 else "studies"
                        ct_text = f"The planning CT and imported CT image sets were aligned using rigid registration for {rigid_count} {rigid_word} and rigid registration followed by deformable registration for {deformable_count} {deformable_word}."
                
                ct_text += f" The accuracy of these fusions was validated using nearby anatomical landmarks."
            
            reg_text += ct_text
        
        # Conclusion text - adjust based on number of registrations
        if len(registrations) == 1:
            conclusion_text = " The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process."
        else:
            conclusion_text = " The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process."
        
        return intro_text + reg_text + conclusion_text
    
    def _generate_mixed_mri_pet_text(self, mri_registrations: List[Registration], pet_registrations: List[Registration], anatomical_region: str) -> str:
        """Generate specialized text for MRI/CT + PET/CT combinations with detailed handling."""
        
        mri_count = len(mri_registrations)
        pet_count = len(pet_registrations)
        
        # Analyze PET registration methods
        pet_rigid_count = sum(1 for reg in pet_registrations if reg.method.lower() == "rigid")
        pet_deformable_count = sum(1 for reg in pet_registrations if reg.method.lower() != "rigid")
        has_deformable_pet = pet_deformable_count > 0
        
        print(f"DEBUG: MRI+PET Analysis: MRI={mri_count}, PET={pet_count} (rigid={pet_rigid_count}, deformable={pet_deformable_count})")
        
        # Generate introduction text for MRI+PET combinations
        intro_text = ""
        modality_descriptions = []
        
        # Add MRI description
        if mri_count == 1:
            modality_descriptions.append("one MRI study")
        else:
            number_words = {2: "two", 3: "three", 4: "four", 5: "five"}
            count_word = number_words.get(mri_count, str(mri_count))
            modality_descriptions.append(f"{count_word} MRI studies")
        
        # Add PET description  
        if pet_count == 1:
            modality_descriptions.append("one PET/CT study")
        else:
            number_words = {2: "two", 3: "three", 4: "four", 5: "five"}
            count_word = number_words.get(pet_count, str(pet_count))
            modality_descriptions.append(f"{count_word} PET/CT studies")
        
        # Generate proper introduction
        intro_text = f"In addition to the planning CT, multiple image studies including {' and '.join(modality_descriptions)} were imported into the Velocity software. "
        intro_text += "Fusion studies were created between the planning CT and each of the imported image sets. "
        
        # Generate comprehensive registration text for all MRI+PET combinations
        reg_text = ""
        
        # Handle MRI portion (always rigid for MRI/CT)
        if mri_count == 1:
            mri_text = f"The CT and MRI image sets were initially aligned using a rigid registration algorithm based on the {anatomical_region} anatomy, which was then further refined manually. The accuracy of this fusion was validated using nearby anatomical landmarks."
        else:
            mri_text = f"The CT and MRI image sets were initially aligned using a rigid registration algorithm based on the {anatomical_region} anatomy, which was then further refined manually. The accuracy of these fusions was validated using nearby anatomical landmarks."
        
        reg_text += mri_text + "\n\n"
        
        # Handle PET/CT portion with all combinations
        if pet_count == 1:
            # Single PET/CT with MRI
            if has_deformable_pet:
                pet_text = f"The CT and PET/CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results. The accuracy of this fusion was validated using nearby anatomical landmarks."
            else:
                pet_text = f"The CT and PET/CT image sets were initially aligned using a rigid registration algorithm based on the {anatomical_region} anatomy, which was then further refined manually. The accuracy of this fusion was validated using nearby anatomical landmarks."
        else:
            # Multiple PET/CT with MRI - handle all cases
            if pet_deformable_count == 0:
                # All PET rigid with MRI
                pet_text = f"The CT and PET/CT image sets were initially aligned using a rigid registration algorithm based on the {anatomical_region} anatomy, which was then further refined manually."
            elif pet_rigid_count == 0:
                # All PET deformable with MRI  
                pet_text = f"The CT and PET/CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results."
            else:
                # Mixed PET rigid and deformable with MRI
                if pet_rigid_count == 1 and pet_deformable_count == 1:
                    pet_text = f"The CT and PET/CT image sets were aligned using rigid registration for one study and rigid registration followed by deformable registration for the other study."
                elif pet_deformable_count == 1 and pet_count == 2:
                    pet_text = f"The CT and PET/CT image sets were initially aligned using rigid registration, with one study receiving additional deformable image registration."
                elif pet_rigid_count == 1:
                    pet_text = f"The CT and PET/CT image sets were aligned using rigid registration for one study, while the remaining {pet_deformable_count} studies received rigid registration followed by deformable registration."
                else:
                    # Multiple of each type
                    print(f"DEBUG: MRI+PET COMPLEX CASE! pet_rigid={pet_rigid_count}, pet_deformable={pet_deformable_count}")
                    rigid_word = "study" if pet_rigid_count == 1 else "studies"
                    deformable_word = "study" if pet_deformable_count == 1 else "studies"
                    pet_text = f"The CT and PET/CT image sets were aligned using rigid registration for {pet_rigid_count} {rigid_word} and rigid registration followed by deformable registration for {pet_deformable_count} {deformable_word}."
            
            pet_text += f" The accuracy of these fusions was validated using nearby anatomical landmarks."
        
        reg_text += pet_text
        
        # Add conclusion for deformable cases
        if has_deformable_pet:
            reg_text += f" The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process."
        else:
            reg_text += f" The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process."
        
        return intro_text + reg_text
    
    def _generate_mixed_mri_ct_text(self, mri_registrations: List[Registration], ct_registrations: List[Registration], anatomical_region: str) -> str:
        """Generate specialized text for MRI/CT + CT/CT combinations with detailed handling."""
        
        mri_count = len(mri_registrations)
        ct_count = len(ct_registrations)
        
        # Analyze CT registration methods (rigid/deformable)
        ct_rigid_count = sum(1 for reg in ct_registrations if reg.method.lower() == "rigid")
        ct_deformable_count = sum(1 for reg in ct_registrations if reg.method.lower() != "rigid")
        has_deformable_ct = ct_deformable_count > 0
        
        print(f"DEBUG: MRI+CT Analysis: MRI={mri_count}, CT={ct_count} (rigid={ct_rigid_count}, deformable={ct_deformable_count})")
        
        # Generate introduction text for MRI+CT combinations
        intro_text = ""
        modality_descriptions = []
        
        # Add MRI description
        if mri_count == 1:
            modality_descriptions.append("one MRI study")
        else:
            number_words = {2: "two", 3: "three", 4: "four", 5: "five"}
            count_word = number_words.get(mri_count, str(mri_count))
            modality_descriptions.append(f"{count_word} MRI studies")
        
        # Add CT description  
        if ct_count == 1:
            modality_descriptions.append("one CT study")
        else:
            number_words = {2: "two", 3: "three", 4: "four", 5: "five"}
            count_word = number_words.get(ct_count, str(ct_count))
            modality_descriptions.append(f"{count_word} CT studies")
        
        # Generate proper introduction
        intro_text = f"In addition to the planning CT, multiple image studies including {' and '.join(modality_descriptions)} were imported into the Velocity software. "
        intro_text += "Fusion studies were created between the planning CT and each of the imported image sets. "
        
        # Generate comprehensive registration text for all MRI+CT combinations
        reg_text = ""
        
        # Handle MRI portion (always rigid for MRI/CT)
        if mri_count == 1:
            mri_text = f"The CT and MRI image sets were initially aligned using a rigid registration algorithm based on the {anatomical_region} anatomy, which was then further refined manually. The accuracy of this fusion was validated using nearby anatomical landmarks."
        else:
            mri_text = f"The CT and MRI image sets were initially aligned using a rigid registration algorithm based on the {anatomical_region} anatomy, which was then further refined manually. The accuracy of these fusions was validated using nearby anatomical landmarks."
        
        reg_text += mri_text + "\n\n"
        
        # Handle CT/CT portion with all combinations
        if ct_count == 1:
            # Single CT/CT with MRI
            if has_deformable_ct:
                ct_text = f"The planning CT and imported CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results. The accuracy of this fusion was validated using nearby anatomical landmarks."
            else:
                ct_text = f"The planning CT and imported CT image sets were initially aligned using a rigid registration algorithm based on the {anatomical_region} anatomy, which was then further refined manually. The accuracy of this fusion was validated using nearby anatomical landmarks."
        else:
            # Multiple CT/CT with MRI - handle all cases
            if ct_deformable_count == 0:
                # All CT rigid with MRI
                ct_text = f"The planning CT and imported CT image sets were initially aligned using a rigid registration algorithm based on the {anatomical_region} anatomy, which was then further refined manually."
            elif ct_rigid_count == 0:
                # All CT deformable with MRI  
                ct_text = f"The planning CT and imported CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results."
            else:
                # Mixed CT rigid and deformable with MRI
                if ct_rigid_count == 1 and ct_deformable_count == 1:
                    ct_text = f"The planning CT and imported CT image sets were aligned using rigid registration for one study and rigid registration followed by deformable registration for the other study."
                elif ct_deformable_count == 1 and ct_count == 2:
                    ct_text = f"The planning CT and imported CT image sets were initially aligned using rigid registration, with one study receiving additional deformable image registration."
                elif ct_rigid_count == 1:
                    ct_text = f"The planning CT and imported CT image sets were aligned using rigid registration for one study, while the remaining {ct_deformable_count} studies received rigid registration followed by deformable registration."
                else:
                    # Multiple of each type
                    print(f"DEBUG: MRI+CT COMPLEX CASE! ct_rigid={ct_rigid_count}, ct_deformable={ct_deformable_count}")
                    rigid_word = "study" if ct_rigid_count == 1 else "studies"
                    deformable_word = "study" if ct_deformable_count == 1 else "studies"
                    ct_text = f"The planning CT and imported CT image sets were aligned using rigid registration for {ct_rigid_count} {rigid_word} and rigid registration followed by deformable registration for {ct_deformable_count} {deformable_word}."
            
            ct_text += f" The accuracy of these fusions was validated using nearby anatomical landmarks."
        
        reg_text += ct_text
        
        # Add conclusion for deformable cases
        if has_deformable_ct:
            reg_text += f" The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process."
        else:
            reg_text += f" The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process."
        
        return intro_text + reg_text
    
    def _generate_mixed_mri_ct_pet_text(self, mri_registrations: List[Registration], ct_registrations: List[Registration], pet_registrations: List[Registration], anatomical_region: str) -> str:
        """Generate specialized text for ultimate MRI/CT + CT/CT + PET/CT combinations with comprehensive handling."""
        
        mri_count = len(mri_registrations)
        ct_count = len(ct_registrations)
        pet_count = len(pet_registrations)
        
        # Analyze CT registration methods (rigid/deformable)
        ct_rigid_count = sum(1 for reg in ct_registrations if reg.method.lower() == "rigid")
        ct_deformable_count = sum(1 for reg in ct_registrations if reg.method.lower() != "rigid")
        has_deformable_ct = ct_deformable_count > 0
        
        # Analyze PET registration methods (rigid/deformable)
        pet_rigid_count = sum(1 for reg in pet_registrations if reg.method.lower() == "rigid")
        pet_deformable_count = sum(1 for reg in pet_registrations if reg.method.lower() != "rigid")
        has_deformable_pet = pet_deformable_count > 0
        
        print(f"DEBUG: ULTIMATE Analysis: MRI={mri_count}, CT={ct_count} (rigid={ct_rigid_count}, deformable={ct_deformable_count}), PET={pet_count} (rigid={pet_rigid_count}, deformable={pet_deformable_count})")
        
        # Generate introduction text for ultimate MRI+CT+PET combinations
        intro_text = ""
        modality_descriptions = []
        
        # Add MRI description
        if mri_count == 1:
            modality_descriptions.append("one MRI study")
        else:
            number_words = {2: "two", 3: "three", 4: "four", 5: "five"}
            count_word = number_words.get(mri_count, str(mri_count))
            modality_descriptions.append(f"{count_word} MRI studies")
        
        # Add CT description  
        if ct_count == 1:
            modality_descriptions.append("one CT study")
        else:
            number_words = {2: "two", 3: "three", 4: "four", 5: "five"}
            count_word = number_words.get(ct_count, str(ct_count))
            modality_descriptions.append(f"{count_word} CT studies")
        
        # Add PET description
        if pet_count == 1:
            modality_descriptions.append("one PET/CT study")
        else:
            number_words = {2: "two", 3: "three", 4: "four", 5: "five"}
            count_word = number_words.get(pet_count, str(pet_count))
            modality_descriptions.append(f"{count_word} PET/CT studies")
        
        # Generate proper introduction with oxford comma for three items
        if len(modality_descriptions) == 3:
            intro_text = f"In addition to the planning CT, multiple image studies including {modality_descriptions[0]}, {modality_descriptions[1]}, and {modality_descriptions[2]} were imported into the Velocity software. "
        else:
            intro_text = f"In addition to the planning CT, multiple image studies including {', '.join(modality_descriptions[:-1])}, and {modality_descriptions[-1]} were imported into the Velocity software. "
        
        intro_text += "Fusion studies were created between the planning CT and each of the imported image sets. "
        
        # Generate comprehensive registration text for all MRI+CT+PET combinations
        reg_text = ""
        
        # Handle MRI portion (always rigid for MRI/CT)
        if mri_count == 1:
            mri_text = f"The CT and MRI image sets were initially aligned using a rigid registration algorithm based on the {anatomical_region} anatomy, which was then further refined manually. The accuracy of this fusion was validated using nearby anatomical landmarks."
        else:
            mri_text = f"The CT and MRI image sets were initially aligned using a rigid registration algorithm based on the {anatomical_region} anatomy, which was then further refined manually. The accuracy of these fusions was validated using nearby anatomical landmarks."
        
        reg_text += mri_text + "\n\n"
        
        # Handle CT/CT portion with all combinations
        if ct_count == 1:
            # Single CT/CT with MRI and PET
            if has_deformable_ct:
                ct_text = f"The planning CT and imported CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results. The accuracy of this fusion was validated using nearby anatomical landmarks."
            else:
                ct_text = f"The planning CT and imported CT image sets were initially aligned using a rigid registration algorithm based on the {anatomical_region} anatomy, which was then further refined manually. The accuracy of this fusion was validated using nearby anatomical landmarks."
        else:
            # Multiple CT/CT with MRI and PET - handle all cases
            if ct_deformable_count == 0:
                # All CT rigid with MRI and PET
                ct_text = f"The planning CT and imported CT image sets were initially aligned using a rigid registration algorithm based on the {anatomical_region} anatomy, which was then further refined manually."
            elif ct_rigid_count == 0:
                # All CT deformable with MRI and PET  
                ct_text = f"The planning CT and imported CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results."
            else:
                # Mixed CT rigid and deformable with MRI and PET
                if ct_rigid_count == 1 and ct_deformable_count == 1:
                    ct_text = f"The planning CT and imported CT image sets were aligned using rigid registration for one study and rigid registration followed by deformable registration for the other study."
                elif ct_deformable_count == 1 and ct_count == 2:
                    ct_text = f"The planning CT and imported CT image sets were initially aligned using rigid registration, with one study receiving additional deformable image registration."
                elif ct_rigid_count == 1:
                    ct_text = f"The planning CT and imported CT image sets were aligned using rigid registration for one study, while the remaining {ct_deformable_count} studies received rigid registration followed by deformable registration."
                else:
                    # Multiple of each type
                    print(f"DEBUG: ULTIMATE CT COMPLEX CASE! ct_rigid={ct_rigid_count}, ct_deformable={ct_deformable_count}")
                    rigid_word = "study" if ct_rigid_count == 1 else "studies"
                    deformable_word = "study" if ct_deformable_count == 1 else "studies"
                    ct_text = f"The planning CT and imported CT image sets were aligned using rigid registration for {ct_rigid_count} {rigid_word} and rigid registration followed by deformable registration for {ct_deformable_count} {deformable_word}."
            
            ct_text += f" The accuracy of these fusions was validated using nearby anatomical landmarks."
        
        reg_text += ct_text + "\n\n"
        
        # Handle PET/CT portion with all combinations
        if pet_count == 1:
            # Single PET/CT with MRI and CT
            if has_deformable_pet:
                pet_text = f"The CT and PET/CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results. The accuracy of this fusion was validated using nearby anatomical landmarks."
            else:
                pet_text = f"The CT and PET/CT image sets were initially aligned using a rigid registration algorithm based on the {anatomical_region} anatomy, which was then further refined manually. The accuracy of this fusion was validated using nearby anatomical landmarks."
        else:
            # Multiple PET/CT with MRI and CT - handle all cases
            if pet_deformable_count == 0:
                # All PET rigid with MRI and CT
                pet_text = f"The CT and PET/CT image sets were initially aligned using a rigid registration algorithm based on the {anatomical_region} anatomy, which was then further refined manually."
            elif pet_rigid_count == 0:
                # All PET deformable with MRI and CT  
                pet_text = f"The CT and PET/CT image sets were aligned using a rigid registration algorithm followed by deformable image registration to enhance the results."
            else:
                # Mixed PET rigid and deformable with MRI and CT
                if pet_rigid_count == 1 and pet_deformable_count == 1:
                    pet_text = f"The CT and PET/CT image sets were aligned using rigid registration for one study and rigid registration followed by deformable registration for the other study."
                elif pet_deformable_count == 1 and pet_count == 2:
                    pet_text = f"The CT and PET/CT image sets were initially aligned using rigid registration, with one study receiving additional deformable image registration."
                elif pet_rigid_count == 1:
                    pet_text = f"The CT and PET/CT image sets were aligned using rigid registration for one study, while the remaining {pet_deformable_count} studies received rigid registration followed by deformable registration."
                else:
                    # Multiple of each type
                    print(f"DEBUG: ULTIMATE PET COMPLEX CASE! pet_rigid={pet_rigid_count}, pet_deformable={pet_deformable_count}")
                    rigid_word = "study" if pet_rigid_count == 1 else "studies"
                    deformable_word = "study" if pet_deformable_count == 1 else "studies"
                    pet_text = f"The CT and PET/CT image sets were aligned using rigid registration for {pet_rigid_count} {rigid_word} and rigid registration followed by deformable registration for {pet_deformable_count} {deformable_word}."
            
            pet_text += f" The accuracy of these fusions was validated using nearby anatomical landmarks."
        
        reg_text += pet_text
        
        # Add comprehensive conclusion for ultimate combination
        has_any_deformable = has_deformable_ct or has_deformable_pet
        if has_any_deformable:
            reg_text += f" The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process."
        else:
            reg_text += f" The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process."
        
        return intro_text + reg_text
    
    def _generate_bladder_filling_writeup(self, common_info, fusion_data) -> FusionResponse:
        """Generate a write-up for full/empty bladder fusion studies."""
        physician = common_info.physician.name
        physicist = common_info.physicist.name
        
        # Use custom anatomical region if provided, otherwise use standard (Entry #55 - lesion field removed)
        anatomical_region = fusion_data.custom_anatomical_region if fusion_data.custom_anatomical_region else fusion_data.anatomical_region
        immobilization_device = fusion_data.immobilization_device if fusion_data.immobilization_device else "Vac-Lok"
        
        # Generate the bladder filling write-up based on the template
        write_up = f"Dr. {physician} requested a medical physics consultation for --- for multimodality image fusion. "
        write_up += "The patient was scanned with the bladder full and again with the bladder empty to evaluate the position of the pelvic anatomy in both scans.\n\n"
        
        write_up += f"The patient was scanned in our CT simulator in the treatment position in a {immobilization_device} to minimize motion. "
        write_up += "The CT studies were then exported to the Velocity imaging registration software. "
        write_up += "A fusion study of the two CT sets (empty and full bladder) was then created. "
        write_up += "The CT image sets were registered using a rigid registration algorithm based on the pelvic anatomy. "
        write_up += "The accuracy of these fusions was validated using nearby anatomical landmarks. "
        write_up += "The fused images were used to improve the segmentation of organs at risk and targets as part of the treatment planning process.\n\n"
        
        write_up += f"The fusion of the image sets was reviewed and approved by both the prescribing radiation oncologist, "
        write_up += f"Dr. {physician}, and the medical physicist, Dr. {physicist}."
        
        return FusionResponse(writeup=write_up) 