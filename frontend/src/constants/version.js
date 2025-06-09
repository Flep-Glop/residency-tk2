// Version information for the Medical Physics Toolkit
export const VERSION_INFO = {
  current: "1.2.0",
  releaseDate: "2024-12-20",
  
  // Update history - add new updates to the top of this array
  updates: [
    {
      version: "1.2.0",
      date: "2024-12-20", 
      changes: [
        "🎯 Fixed dropdown visibility in dark theme",
        "✨ Added boost functionality to DIBH writeups",
        "🔧 Auto-select breast board for breast treatments", 
        "📝 Improved number formatting (no unnecessary decimals)",
        "📢 Added update notification system"
      ]
    },
    {
      version: "1.1.0",
      date: "2024-12-15",
      changes: [
        "🚀 Enhanced DIBH form with better validation",
        "💾 Improved form state management", 
        "🎨 Updated UI styling for better accessibility"
      ]
    },
    {
      version: "1.0.0",
      date: "2024-12-01", 
      changes: [
        "🎉 Initial release",
        "📱 Migrated from Streamlit to React/FastAPI",
        "✨ Added Fusion and DIBH writeup generators",
        "🌓 Implemented dark theme interface"
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