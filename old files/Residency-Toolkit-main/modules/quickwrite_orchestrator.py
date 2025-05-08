import streamlit as st
from .templates import ConfigManager
from .common_info_collector import collect_common_info
from .module_selector import select_modules
from validation_utils import FormValidator
from download_utils import WriteUpDisplay

class QuickWriteOrchestrator:
    """Main controller for the QuickWrite workflow."""
    
    def __init__(self, modules):
        """Initialize with all required modules.
        
        Args:
            modules: Dict mapping module_id to module instance
        """
        self.config_manager = ConfigManager()
        self.modules = modules
    
    def render_workflow(self):
        """Render the entire QuickWrite workflow based on current state.
        
        Returns:
            dict: The generated write-ups, or None if not complete
        """
        # Initialize session state for workflow if needed
        if "workflow_step" not in st.session_state:
            st.session_state.workflow_step = "basic_info"
            
        # Determine the current workflow step
        current_step = st.session_state.workflow_step
        
        if current_step == "basic_info":
            return self._render_basic_info_step()
        elif current_step == "module_selection":
            return self._render_module_selection_step()
        elif current_step == "module_details":
            return self._render_module_details_step()
        elif current_step == "results":
            return self._render_results_step()
    
    def _render_basic_info_step(self):
        """Render the basic information collection step."""
        st.markdown("## Common Information")
        st.info("First, let's collect basic information that applies to all write-ups.")
        
        # Get existing data if available
        existing_data = st.session_state.get("common_info", None)
        
        # Use the common info collector
        common_info = collect_common_info(self.config_manager, existing_data)
        
        # Navigation buttons
        col1, col2 = st.columns([4, 1])
        
        with col2:
            can_proceed = common_info is not None
            if st.button("Continue", key="basic_info_continue", disabled=not can_proceed, type="primary"):
                # Save common info to session state
                st.session_state.common_info = common_info
                # Advance to next step
                st.session_state.workflow_step = "module_selection"
                # Force rerun to update the UI
                st.rerun()
    
    def _render_module_selection_step(self):
        """Render the module selection step without saving previous selections."""
        st.markdown("## Select Write-Up Types")
        
        # Show summary of common information with edit option
        if "common_info" in st.session_state:
            with st.expander("Common Information (click to review)", expanded=False):
                st.write(f"**Physician:** Dr. {st.session_state.common_info['physician']}")
                st.write(f"**Physicist:** Dr. {st.session_state.common_info['physicist']}")
                st.write(f"**Patient:** {st.session_state.common_info['patient_details']}")
                
                if st.button("Edit Common Information", key="edit_common_info"):
                    st.session_state.workflow_step = "basic_info"
                    st.rerun()
        
        # IMPORTANT: We're ignoring existing selections to avoid issues
        selected_modules = select_modules(self.modules, existing_selections=None)
        
        # Navigation buttons
        col1, col2, col3 = st.columns([1, 3, 1])
        
        with col1:
            if st.button("← Back", key="module_selection_back"):
                st.session_state.workflow_step = "basic_info"
                st.rerun()
        
        with col3:
            can_proceed = len(selected_modules) > 0
            if st.button("Continue", key="module_selection_continue", disabled=not can_proceed, type="primary"):
                # Save selected modules to session state
                st.session_state.selected_modules = selected_modules
                # IMPORTANT: Reset module data to clear old inputs
                st.session_state.module_data = {}
                # Advance to next step
                st.session_state.workflow_step = "module_details"
                st.rerun()
    
    def _render_module_details_step(self):
        """Render the module-specific details collection step with improved stability."""
        st.markdown("## Module Details")
        
        # Get needed data from session state
        common_info = st.session_state.get("common_info", {})
        selected_modules = st.session_state.get("selected_modules", {})
        module_data = st.session_state.get("module_data", {})
        
        # Track which module is currently being edited
        if "current_editing_module" not in st.session_state:
            st.session_state.current_editing_module = None
        
        # Show progress indicators
        total_modules = len(selected_modules)
        completed_modules = sum(1 for module_id in selected_modules if module_id in module_data)
        
        progress_percentage = completed_modules / total_modules if total_modules > 0 else 0
        st.progress(progress_percentage)
        st.markdown(f"**Progress:** {completed_modules}/{total_modules} modules completed")
        
        # Collect data for modules
        uncompleted_modules = []
        completed_modules_list = []
        
        # Add a "Reset All Modules" button to clear all module data
        if st.button("Reset All Module Data", key="reset_all_modules", type="secondary"):
            # Clear all module data
            st.session_state.module_data = {}
            # Clear registrations and other module-specific state
            if 'registrations' in st.session_state:
                del st.session_state.registrations
            # Clear editing state
            st.session_state.current_editing_module = None
            # Rerun to update UI
            st.rerun()
        
        # Create a single container for module selection using tabs
        tab_labels = []
        valid_module_ids = []
        
        # Build the list of tab labels and valid module IDs
        for module_id, selected in selected_modules.items():
            if selected:
                module = self.modules.get(module_id)
                if module:
                    tab_labels.append(module.get_module_name() + (" ✅" if module_id in module_data else ""))
                    valid_module_ids.append(module_id)
        
        if not tab_labels:
            st.warning("No modules selected. Please go back and select at least one module.")
            return
        
        # Create tabs with the built lists
        module_tabs = st.tabs(tab_labels)
        
        # Process each module in its own tab
        for i, module_id in enumerate(valid_module_ids):
            # Get the module instance
            module = self.modules.get(module_id)
            if not module:
                continue
            
            # Determine if this module is completed
            is_completed = module_id in module_data
            
            # Process module in its tab
            with module_tabs[i]:
                # Create inner tabs for form and information
                inner_tabs = st.tabs(["Form", "Preview", "Information"])
                
                # Form tab
                with inner_tabs[0]:
                    # Add a reset button for this specific module
                    if is_completed:
                        if st.button(f"Reset {module.get_module_name()} Data", key=f"reset_{module_id}"):
                            # Remove this module's data
                            if module_id in module_data:
                                del module_data[module_id]
                            # Clear module-specific state
                            if module_id == "fusion" and 'registrations' in st.session_state:
                                del st.session_state.registrations
                            # Update session state
                            st.session_state.module_data = module_data
                            # Rerun to update UI
                            st.rerun()
                    
                    # Handle edit mode or completed view
                    if st.session_state.current_editing_module == module_id or not is_completed:
                        # We're editing this module or it's not completed yet
                        st.markdown(f"### {module.get_module_name()} Details")
                        
                        # Pass common information to the module
                        result = module.render_specialized_fields(
                            common_info.get("physician", ""),
                            common_info.get("physicist", ""),
                            common_info.get("patient_age", 0),
                            common_info.get("patient_sex", ""),
                            common_info.get("patient_details", "")
                        )
                        
                        # Add an explicit save button
                        save_btn = st.button(f"Save {module.get_module_name()} Details", key=f"save_{module_id}")
                        
                        # Only save when the button is clicked AND we have valid data
                        if save_btn:
                            if result is not None:
                                # Save the module data
                                module_data[module_id] = result
                                # Exit edit mode
                                st.session_state.current_editing_module = None
                                # Success message
                                st.success(f"{module.get_module_name()} details saved successfully.")
                                # Update session state
                                st.session_state.module_data = module_data
                                # Force rerun to update UI
                                st.rerun()
                            else:
                                # Module is not complete
                                st.error(f"Please complete all required fields for {module.get_module_name()}.")
                                uncompleted_modules.append(module.get_module_name())
                        else:
                            # When button isn't clicked but validation fails
                            if result is None:
                                uncompleted_modules.append(module.get_module_name())
                    else:
                        # Show summary of completed module
                        st.success(f"{module.get_module_name()} details completed")
                        
                        # Show summary of entered data
                        self._display_module_data_summary(module_id, module_data[module_id])
                        
                        # Add option to edit (using a button to avoid checkboxes that can cause weird behavior)
                        if st.button(f"Edit {module.get_module_name()} Details", key=f"edit_{module_id}"):
                            # Set this module for editing in the next rerun
                            st.session_state.current_editing_module = module_id
                            # Force rerun to show edit view
                            st.rerun()
                        
                        completed_modules_list.append(module.get_module_name())
                
                # Preview tab for saved data
                with inner_tabs[1]:
                    if is_completed:
                        st.markdown(f"### {module.get_module_name()} Preview")
                        # Generate a preview of the write-up
                        try:
                            write_up_preview = module.generate_write_up(common_info, module_data[module_id])
                            if write_up_preview:
                                # Show a preview of the first 500 characters
                                st.markdown("**First 500 characters of generated write-up:**")
                                st.text_area("", write_up_preview[:500] + "...", height=200, disabled=True)
                                st.info("This is just a preview. The full write-up will be generated when you click 'Generate Write-Ups'.")
                        except Exception as e:
                            st.error(f"Error generating preview: {str(e)}")
                    else:
                        st.info(f"Save the {module.get_module_name()} details first to see a preview.")
                            
                # Information tab
                with inner_tabs[2]:
                    st.markdown(f"### About {module.get_module_name()}")
                    st.info(f"**{module.get_module_name()}:** {module.get_module_description()}")
                    
                    # Add module-specific informational text
                    if module.get_module_name() == "DIBH":
                        st.markdown("""
                        **Deep Inspiration Breath Hold (DIBH)** is a technique used primarily in radiation therapy for breast cancer, especially left-sided breast cancer. During treatment, the patient takes a deep breath and holds it, which creates space between the heart and the chest wall. This reduces the radiation dose to the heart and other critical structures.
                        
                        **Key benefits:**
                        - Significantly reduces mean heart dose (typically by 50% or more)
                        - Decreases radiation to the lung volume
                        - Reduces risk of long-term cardiac complications
                        
                        **Best practices:**
                        - Use for left-sided breast treatments or where cardiac sparing is needed
                        - Ensure patient can comfortably hold breath for 15-25 seconds
                        - Verify consistent positioning between planning and treatment
                        """)
                    elif module.get_module_name() == "Fusion":
                        st.markdown("""
                        **Image Fusion** combines multiple imaging modalities to improve target delineation and critical structure identification. Common fusion combinations include CT-MRI, CT-PET, and CT-CBCT.
                        
                        **Key benefits:**
                        - Improves target visualization by combining modalities with different strengths
                        - Enhances soft tissue contrast when using MRI
                        - Provides functional information when using PET
                        - Can be used for adaptive planning when using CBCT
                        
                        **Common registration methods:**
                        - **Rigid registration**: Preserves distances between all points (translation and rotation only)
                        - **Deformable registration**: Allows for non-uniform spatial transformations 
                        """)
                    elif module.get_module_name() == "Prior Dose":
                        st.markdown("""
                        **Prior Dose Evaluation** assesses the cumulative radiation dose when patients require additional radiation treatments to previously irradiated areas.
                        
                        **Key considerations:**
                        - Time interval between treatments (tissue recovery)
                        - Overlapping volumes and critical structure constraints
                        - Biological equivalent dose calculations (EQD2)
                        - Risk of radiation-induced complications
                        
                        **Common scenarios:**
                        - Recurrent disease requiring retreatment
                        - New primary tumors in previously irradiated regions
                        - Palliation in areas of prior radiation
                        """)
                    elif module.get_module_name() == "Pacemaker":
                        st.markdown("""
                        **Cardiac Implantable Electronic Device (CIED) Management** during radiation therapy follows AAPM TG-203 guidelines to minimize risks to pacemakers and implantable cardioverter-defibrillators (ICDs).
                        
                        **Risk factors:**
                        - Distance from treatment field to device
                        - Cumulative radiation dose to the device
                        - Whether the patient is pacemaker-dependent
                        - Use of high-energy photons (>10 MV) that produce neutrons
                        
                        **Risk categories:**
                        - **Low risk**: <2 Gy to device, non-dependent patient
                        - **Medium risk**: 2-5 Gy to device or neutron-producing therapy
                        - **High risk**: >5 Gy to device, dependent patient, or combination of risk factors
                        """)
                    elif module.get_module_name() == "SBRT":
                        st.markdown("""
                        **Stereotactic Body Radiation Therapy (SBRT)** delivers precisely-targeted radiation in fewer fractions with higher doses per fraction than conventional radiotherapy.
                        
                        **Key characteristics:**
                        - Hypofractionated treatment (typically 1-5 fractions)
                        - High dose per fraction (typically 7-20 Gy per fraction)
                        - Steep dose gradients around the target
                        - Highly conformal dose distributions
                        - Precise image guidance for each fraction
                        
                        **Common applications:**
                        - Early-stage non-small cell lung cancer
                        - Liver tumors
                        - Spine metastases
                        - Pancreatic cancer
                        - Prostate cancer
                        - Oligometastatic disease
                        """)
                    elif module.get_module_name() == "SRS":
                        st.markdown("""
                        **Stereotactic Radiosurgery (SRS)** delivers highly focused radiation to small intracranial targets with millimeter precision, typically in a single fraction.
                        
                        **SRS vs. SRT:**
                        - **SRS**: Single fraction, typically for smaller lesions (<3cm)
                        - **SRT**: Multiple fractions (typically 2-5), used for larger lesions or those near critical structures
                        
                        **Common applications:**
                        - Brain metastases
                        - Acoustic neuromas
                        - Meningiomas
                        - Arteriovenous malformations (AVMs)
                        - Trigeminal neuralgia
                        - Pituitary adenomas
                        
                        **Dose considerations:**
                        - Single fraction: typically 15-24 Gy
                        - Multiple fractions: typically 25-30 Gy in 5 fractions
                        """)
        
        # Navigation buttons
        col1, col2, col3 = st.columns([1, 3, 1])
        
        with col1:
            if st.button("← Back", key="module_details_back"):
                st.session_state.workflow_step = "module_selection"
                # Clear editing state when navigating back
                if "current_editing_module" in st.session_state:
                    del st.session_state.current_editing_module
                st.rerun()
        
        with col3:
            # Ensure all selected modules have been saved
            all_modules_saved = all(module_id in module_data for module_id in selected_modules if selected_modules[module_id])
            
            # Can only proceed if all selected modules have been saved
            can_proceed = all_modules_saved and len(completed_modules_list) > 0
            
            # Display clear message if some modules aren't saved yet
            if not all_modules_saved and len(selected_modules) > 0:
                unsaved_modules = [self.modules[module_id].get_module_name() 
                                for module_id in selected_modules 
                                if selected_modules[module_id] and module_id not in module_data]
                
                if unsaved_modules:
                    st.warning(f"Please save details for: {', '.join(unsaved_modules)}")
            
            if st.button("Generate Write-Ups", key="generate_write_ups", disabled=not can_proceed, type="primary"):
                # Generate all write-ups
                results = {}
                for module_id, selected in selected_modules.items():
                    if selected and module_id in module_data:
                        # Get the module instance
                        module = self.modules.get(module_id)
                        if not module:
                            continue
                        
                        # Generate the write-up
                        write_up = module.generate_write_up(common_info, module_data[module_id])
                        if write_up:
                            results[module.get_module_name()] = write_up
                
                # Save results to session state
                st.session_state.results = results
                
                # Advance to results step
                st.session_state.workflow_step = "results"
                
                # Clear editing state when proceeding to results
                if "current_editing_module" in st.session_state:
                    del st.session_state.current_editing_module
                    
                st.rerun()
    
    def _render_results_step(self):
        """Render the results display step."""
        st.markdown("## Generated Write-Ups")
        
        # Get results from session state
        results = st.session_state.get("results", {})
        common_info = st.session_state.get("common_info", {})
        
        if not results:
            st.error("No write-ups were generated. Please go back and try again.")
            if st.button("← Back to Module Details", key="results_back_error"):
                st.session_state.workflow_step = "module_details"
                st.rerun()
            return
        
        # Display a summary of the patient for context
        patient_details = common_info.get("patient_details", "")
        physician = common_info.get("physician", "")
        physicist = common_info.get("physicist", "")
        
        st.info(f"**Patient:** {patient_details}  \n**Physician:** Dr. {physician}  \n**Physicist:** Dr. {physicist}")
        
        # Use the WriteUpDisplay to show all write-ups
        # Extract the patient name for filenames if available
        patient_age = common_info.get("patient_age", "")
        patient_sex = common_info.get("patient_sex", "")
        patient_name = f"{patient_age}yo_{patient_sex}"
        
        WriteUpDisplay.display_multiple_write_ups(results, patient_name)
        
        # Navigation buttons
        col1, col2, col3 = st.columns([1, 3, 1])
        
        with col1:
            if st.button("← Back to Details", key="results_back"):
                st.session_state.workflow_step = "module_details"
                st.rerun()
        
        with col3:
            if st.button("Start New Write-Up", key="start_new", type="primary"):
                # Reset the entire workflow
                self.reset_workflow()
                st.rerun()
                
    def reset_workflow(self):
        """Reset the entire workflow."""
        for key in ['workflow_step', 'common_info', 'selected_modules', 'module_data', 'results']:
            if key in st.session_state:
                del st.session_state[key]
    
    def _display_module_data_summary(self, module_id, module_data):
        """Display a summary of entered module data.
        
        Args:
            module_id: The ID of the module
            module_data: The module-specific data
        """
        # Create a formatted summary based on module type
        if module_id == "dibh":
            st.write(f"**Treatment Site:** {module_data.get('treatment_site', '')}")
            st.write(f"**Dose:** {module_data.get('dose', 0)} Gy in {module_data.get('fractions', 0)} fractions")
            st.write(f"**Immobilization:** {module_data.get('immobilization_device', '')}")
            
        elif module_id == "fusion":
            st.write(f"**Lesion:** {module_data.get('lesion', '')}")
            st.write(f"**Anatomical Region:** {module_data.get('anatomical_region', '')}")
            
            registrations = module_data.get('registrations', [])
            if registrations:
                st.write(f"**Registrations:** {len(registrations)}")
                for reg in registrations[:2]:  # Show first two registrations
                    st.write(f"- {reg.get('primary', '')} to {reg.get('secondary', '')} ({reg.get('method', '')})")
                if len(registrations) > 2:
                    st.write(f"- Plus {len(registrations) - 2} more...")
                    
        elif module_id == "prior_dose":
            st.write(f"**Current Treatment:** {module_data.get('current_dose', 0)} Gy in {module_data.get('current_fractions', 0)} fractions to {module_data.get('current_site', '')}")
            
            prior_treatments = module_data.get('prior_treatments', [])
            if prior_treatments:
                st.write(f"**Prior Treatments:** {len(prior_treatments)}")
                for treatment in prior_treatments[:2]:  # Show first two treatments
                    st.write(f"- {treatment.get('site', '')}: {treatment.get('dose', 0)} Gy in {treatment.get('fractions', 0)} fx ({treatment.get('month', '')} {treatment.get('year', '')})")
                if len(prior_treatments) > 2:
                    st.write(f"- Plus {len(prior_treatments) - 2} more...")
            
            st.write(f"**Overlap:** {module_data.get('has_overlap', 'No')}")
            
        elif module_id == "pacemaker":
            st.write(f"**Treatment Site:** {module_data.get('treatment_site', '')}")
            st.write(f"**Dose:** {module_data.get('dose', 0)} Gy in {module_data.get('fractions', 0)} fractions")
            st.write(f"**Device Vendor:** {module_data.get('device_vendor', '')}")
            st.write(f"**Field Distance:** {module_data.get('field_distance', '').split(' ')[0]}")
            st.write(f"**Risk Level:** {module_data.get('risk_level', '')}")
            
        elif module_id == "sbrt":
            st.write(f"**Treatment Site:** {module_data.get('treatment_site', '')}")
            st.write(f"**Dose:** {module_data.get('dose', 0)} Gy in {module_data.get('fractions', 0)} fractions")
            st.write(f"**Target Volume:** {module_data.get('target_volume', 0)} cc")
            st.write(f"**4DCT Used:** {module_data.get('is_4dct', '')}")
            
        elif module_id == "srs":
            lesions = module_data.get('lesions', [])
            st.write(f"**Number of Lesions:** {len(lesions)}")
            for i, lesion in enumerate(lesions[:2]):  # Show first two lesions
                st.write(f"- Lesion {i+1}: {lesion.get('site', '')}, {lesion.get('dose', 0)} Gy in {lesion.get('fractions', 0)} fraction(s)")
            if len(lesions) > 2:
                st.write(f"- Plus {len(lesions) - 2} more lesions...")
                
        else:
            # Generic summary for other module types
            st.write("Module data entered successfully.")