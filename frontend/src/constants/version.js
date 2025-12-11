// Version information for the Medical Physics Toolkit
export const VERSION_INFO = {
  current: "2.4.0",
  releaseDate: "2025-12-11",
  
  // Update history - add new updates to the top of this array
  updates: [
    {
      version: "2.4.0",
      date: "2025-12-11", 
      changes: [
        "Aseprite pixel font integration with unified typography across all modules",
        "Observatory tab redesign with click-to-enlarge screenshots",
        "Prior Dose smart assessment with automatic constraint violation detection",
        "Prior Dose constraint verification system for clinical governance",
        "Prior Dose fractionation-sensitive dose constraints (QUANTEC, Timmerman, SRS)",
        "Prior Dose dose statistics grouped by anatomical region",
        "SBRT form label abbreviations for pixel font compatibility",
        "Homepage cleanup: removed redundant badges and sections",
        "Fusion PET+CT mode support without MRI requirement"
      ]
    },
    {
      version: "2.3.1",
      date: "2025-12-02", 
      changes: [
        "Confirmed Prior Dose and SRS/SRT modules hidden from production",
        "Active modules: Fusion, DIBH, SBRT, TBI, HDR, Pacemaker",
        "Cache-busting deployment to ensure clean state"
      ]
    },
    {
      version: "2.3.0",
      date: "2025-12-02", 
      changes: [
        "TBI Module - comprehensive QA testing with 13/13 tests passing",
        "HDR Module - comprehensive QA testing with 18/18 tests passing",
        "Pacemaker Module - comprehensive QA testing with 21/21 tests passing",
        "Button-driven interfaces for standardized clinical workflows",
        "Streamlined form layouts and improved clinical workflow order",
        "Automated quality checks across all modules",
        "Consistent UI patterns and styling across all 8 modules",
        "Grammar and terminology fixes validated through automated testing"
      ]
    },
    {
      version: "2.2.0",
      date: "2025-11-20", 
      changes: [
        "DIBH Module - comprehensive QA testing with 20/20 tests passing",
        "SBRT Module - comprehensive QA testing and validation",
        "UI refinements - improved input formatting and error visibility",
        "Button group controls for breathing technique selection",
        "Enhanced table styling with color hierarchy for metrics",
        "Side-by-side dose/fractions layout across modules",
        "Backend writeup generation improvements",
        "Automated quality checks for demographics, grammar, formatting"
      ]
    },
    {
      version: "2.1.0",
      date: "2025-11-06", 
      changes: [
        "HDR (High Dose Rate) Brachytherapy Module - complete implementation",
        "SRS (Stereotactic Radiosurgery) Module - brain and spine treatments",
        "TBI (Total Body Irradiation) Module - full workflow support",
        "Prior Dose Module - comprehensive dose tracking and analysis",
        "Enhanced documentation system (DEV_LOG, VERSION_MANAGEMENT)",
        "Static documentation hub (ARCHITECTURE, PATTERNS, SPRITES, STACK)",
        "UI improvements across DIBH, Fusion, Pacemaker, and SBRT modules",
        "Backend service refinements and code optimization"
      ]
    },
    {
      version: "2.0.0",
      date: "2025-01-15", 
      changes: [
        "Complete Pacemaker/CIED Module with TG-203 compliance",
        "Enhanced SBRT with 6 core sites and anatomical clarification",
        "DIBH custom treatment sites and auto-assigned devices",
        "Fusion module with bladder filling studies support",
        "Comprehensive automated testing framework",
        "Improved deployment workflow and documentation",
        "Grammar fixes and professional writeup templates",
        "Advanced table formatting for plan quality metrics"
      ]
    },
    {
      version: "1.2.0",
      date: "2024-12-20", 
      changes: [
        "Fixed dropdown visibility in dark theme",
        "Added boost functionality to DIBH writeups",
        "Auto-select breast board for breast treatments", 
        "Improved number formatting (no unnecessary decimals)",
        "Added update notification system"
      ]
    },
    {
      version: "1.1.0",
      date: "2024-12-15",
      changes: [
        "Enhanced DIBH form with better validation",
        "Improved form state management", 
        "Updated UI styling for better accessibility"
      ]
    },
    {
      version: "1.0.0",
      date: "2024-12-01", 
      changes: [
        "Initial release",
        "Migrated from Streamlit to React/FastAPI",
        "Added Fusion and DIBH writeup generators",
        "Implemented dark theme interface"
      ]
    }
  ]
};

// Helper function to get the latest update
export const getLatestUpdate = () => VERSION_INFO.updates[0];

// Helper function to check if there are new updates since last seen version
export const hasNewUpdates = (lastSeenVersion) => {
  return !lastSeenVersion || lastSeenVersion !== VERSION_INFO.current;
};
