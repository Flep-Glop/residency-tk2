import streamlit as st
from modules.quickwrite import QuickWriteModule
from utils import load_css
from theme_utils import inject_theme_responsive_css, load_theme_aware_css

# Import the reset button utility
from reset_state_utility import add_reset_button

# Page configuration
st.set_page_config(
    page_title="Medical Physics Residency Toolkit",
    page_icon="📋",
    layout="wide",
    initial_sidebar_state="collapsed"  # Changed to collapsed by default
)

# Inject theme-responsive CSS (this should be first before any UI is shown)
inject_theme_responsive_css()

# Load main CSS (it will now use the theme variables)
load_theme_aware_css("assets/css/main.css")

# Add reset button in sidebar for debugging
add_reset_button(location="sidebar")

# Initialize session state variables
if 'show_landing_page' not in st.session_state:
    st.session_state.show_landing_page = True
if 'active_module' not in st.session_state:
    st.session_state.active_module = None
if 'use_unified_workflow' not in st.session_state:
    st.session_state.use_unified_workflow = False

# Navigation functions
def go_to_module(module_name, use_unified=False):
    st.session_state.show_landing_page = False
    st.session_state.active_module = module_name
    st.session_state.use_unified_workflow = use_unified

def go_to_landing_page():
    st.session_state.show_landing_page = True
    st.session_state.active_module = None
    st.session_state.use_unified_workflow = False

# Initialize modules
quick_write = QuickWriteModule()

# Function to add a persistent "New Form" button
def add_new_form_button():
    if st.button("🔄 New Form", key="new_form_button"):
        # Reset the workflow state
        if hasattr(quick_write, 'orchestrator'):
            quick_write.orchestrator.reset_workflow()
        go_to_landing_page()
        st.rerun()

# Main content area
if not st.session_state.show_landing_page:
    # Display selected module content
    active_module = st.session_state.active_module
    
    if active_module == "Quick Write":
        if st.session_state.use_unified_workflow:
            # QuickWrite workflow
            st.markdown('<div class="header-container">', unsafe_allow_html=True)
            
            col1, col2, col3 = st.columns([4, 1, 1])
            
            with col1:
                # Show which module we're in (left-aligned)
                st.markdown(f"<h1 class='left-aligned-title'>QuickWrite</h1>", unsafe_allow_html=True)
            
            with col2:
                # Add persistent New Form button
                add_new_form_button()
                
            with col3:
                # Back to Home button
                if st.button("← Home", key="home_btn", use_container_width=True):
                    go_to_landing_page()
                    st.rerun()
            
            st.markdown('</div>', unsafe_allow_html=True)
            
            # Add a horizontal divider
            st.markdown("<hr style='margin: 0.5rem 0 1.5rem 0; border: none; height: 1px; background-color: var(--card-border);'>", unsafe_allow_html=True)
            
            # Render the unified workflow
            quick_write.render_unified_workflow()
        else:
            # Legacy individual write-up workflow
            # Get the write-up type from session state or URL parameter, default to DIBH if not specified
            write_up_type = st.session_state.get("active_write_up", "DIBH")
            
            # Create a modern header with left-aligned title and right-aligned navigation
            st.markdown('<div class="header-container">', unsafe_allow_html=True)
            
            col1, col2, col3 = st.columns([4, 1, 1])
            
            with col1:
                # Show which module we're in (left-aligned)
                st.markdown(f"<h1 class='left-aligned-title'>{write_up_type} Write-Up Generator</h1>", unsafe_allow_html=True)
            
            with col2:
                # Add persistent New Form button
                add_new_form_button()
                
            with col3:
                # Back to Home button
                if st.button("← Home", key="home_btn", use_container_width=True):
                    go_to_landing_page()
                    st.rerun()
            
            st.markdown('</div>', unsafe_allow_html=True)
            
            # Add a horizontal divider
            st.markdown("<hr style='margin: 0.5rem 0 1.5rem 0; border: none; height: 1px; background-color: var(--card-border);'>", unsafe_allow_html=True)
            
            # Add a dropdown to allow changing the form type
            new_write_up_type = st.selectbox(
                "Change Write-Up Type",
                ["DIBH", "Fusion", "Prior Dose", "Pacemaker", "SBRT", "SRS"],
                index=["DIBH", "Fusion", "Prior Dose", "Pacemaker", "SBRT", "SRS"].index(write_up_type),
                key="write_up_type_selector"
            )
            
            # If the user changed the type using the dropdown, update and rerun
            if new_write_up_type != write_up_type:
                st.session_state.active_write_up = new_write_up_type
                st.rerun()
                
            # Display the appropriate form based on the write_up_type
            if write_up_type == "DIBH":
                write_up = quick_write.render_dibh_form()
                quick_write.dibh_module.display_write_up(write_up)
            elif write_up_type == "Fusion":
                write_up = quick_write.render_fusion_form()
                quick_write.fusion_module.display_write_up(write_up)
            elif write_up_type == "Prior Dose":
                write_up = quick_write.render_prior_dose_form()
                quick_write.prior_dose_module.display_write_up(write_up)
            elif write_up_type == "Pacemaker":
                write_up = quick_write.render_pacemaker_form()
                quick_write.pacemaker_module.display_write_up(write_up)
            elif write_up_type == "SBRT":
                write_up = quick_write.render_sbrt_form()
                quick_write.sbrt_module.display_write_up(write_up)
            elif write_up_type == "SRS":
                write_up = quick_write.render_srs_form()
                quick_write.srs_module.display_write_up(write_up)
            else:
                st.info(f"The {write_up_type} write-up type is under development.")

    elif active_module in ["Competency Tracker", "Part 3 Bank"]:
        # Add navigation header
        col1, col2 = st.columns([1, 5])
        
        with col1:
            if st.button("← Home", key="home_btn", use_container_width=True):
                go_to_landing_page()
                st.rerun()
        
        with col2:
            st.title(f"{active_module}")
        
        st.info(f"The {active_module} module is under development.")

else:  # This is the landing page
    # Load landing-specific CSS with theme awareness
    load_theme_aware_css("assets/css/landing.css")
    
    # Clean header with title
    col1, col2 = st.columns([1, 5])
    with col2:
        st.markdown("<h1 class='landing-page-title'>Medical Physics Residency Toolkit</h1>", unsafe_allow_html=True)
        st.markdown("<p class='subtitle'>Streamlining documentation for radiation oncology workflows</p>", unsafe_allow_html=True)
    
    # Main content tabs - matching QuickWrite styling
    tools_tab, about_tab, coming_soon_tab = st.tabs([
        "Available Tools", "About", "Coming Soon"
    ])
    
    with tools_tab:
        st.markdown("<br>", unsafe_allow_html=True)
        
        # Main QuickWrite tool card
        st.markdown("""
        <div class='tool-card' style='border-left: 4px solid var(--primary-color);'>
            <h2>QuickWrite</h2>
            <p>Generate standardized clinical documentation with guided forms for DIBH, Fusion, Prior Dose, Pacemaker, SBRT, and SRS reports - all with shared patient information in a single workflow.</p>
        </div>
        """, unsafe_allow_html=True)
        
        # Button for QuickWrite workflow
        if st.button("Launch QuickWrite", type="primary", key="quickwrite_btn"):
            go_to_module("Quick Write", use_unified=True)
            st.rerun()

        st.markdown("<hr style='margin: 1.5rem 0; border: none; height: 1px; background-color: var(--card-border);'>", unsafe_allow_html=True)
        
        # Future tools section
        st.markdown("""
        <div class='tool-card'>
            <h2>Legacy Tools</h2>
            <p>Access the previous individual module tools by selecting a specific write-up type after launching QuickWrite.</p>
        </div>
        """, unsafe_allow_html=True)
        
    with about_tab:
        st.markdown("<br>", unsafe_allow_html=True)
        
        # About section with cards for better organization
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("""
            <div class='info-card'>
                <h3>Purpose</h3>
                <p>The <b>Medical Physics Residency Toolkit</b> is designed to help radiation oncology residents and physicists create standardized documentation quickly and accurately, improving clinical workflow efficiency.</p>
            </div>
            """, unsafe_allow_html=True)
        
        with col2:
            st.markdown("""
            <div class='info-card'>
                <h3>Current Version</h3>
                <p><span class='version'>Beta v0.9</span></p>
                <p>Last updated: March 2025</p>
                <p>New! QuickWrite workflow provides a streamlined all-in-one experience.</p>
                <p>For help or suggestions, use the feedback form below.</p>
            </div>
            """, unsafe_allow_html=True)
        
        st.markdown("<br>", unsafe_allow_html=True)
        
        # Simple feedback section
        with st.expander("Provide Feedback", expanded=False):
            feedback_type = st.selectbox("Type", ["Bug Report", "Feature Request", "General Feedback"])
            feedback_text = st.text_area("Details")
            if st.button("Submit Feedback"):
                st.success("Thank you for your feedback!")
    
    with coming_soon_tab:
        st.markdown("<br>", unsafe_allow_html=True)
        
        # Coming soon features - reduced to only first two items
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("""
            <div class='coming-soon-card'>
                <h3>📊 QA Dashboard</h3>
                <p>Interactive quality assurance tracking and visualization</p>
                <div class='timeline'>In development</div>
            </div>
            """, unsafe_allow_html=True)
        
        with col2:
            st.markdown("""
            <div class='coming-soon-card'>
                <h3>📚 Rogue Resident </h3>
                <p>Rogue-like study tool to sharpen your medical physics knowledge</p>
                <div class='timeline'>In development</div>
            </div>
            """, unsafe_allow_html=True)