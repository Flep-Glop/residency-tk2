// Version information for the Medical Physics Toolkit
export const VERSION_INFO = {
  current: "2.5.0",
  releaseDate: "2026-01-05",
  
  // Update history - add new updates to the top of this array
  updates: [
    {
      version: "2.5.0",
      date: "2026-01-05", 
      changes: [
        "DIBH/TBI: Preset prescription buttons with custom Rx fallback option",
        "SBRT: Coverage input with auto-conversion for cGy values",
        "Cross-module: Compact button format (50/25 instead of 50 Gy / 25 fx)",
        "UI Polish: Enlarged Home buttons, standardized checkbox sizing"
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
