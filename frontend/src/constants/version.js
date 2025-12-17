// Version information for the Medical Physics Toolkit
export const VERSION_INFO = {
  current: "2.4.1",
  releaseDate: "2025-12-11",
  
  // Update history - add new updates to the top of this array
  updates: [
    {
      version: "2.4.1",
      date: "2025-12-11", 
      changes: [
        "Prior Dose: Fixed multiple prior treatments bug that cleared dose statistics",
        "Prior Dose: Added decimal precision support for constraint values",
        "Prior Dose: Added 5 verified constraints (Brainstem, Lungs V20, Heart, Esophagus, Rectum)",
        "Prior Dose: Improved exceeded constraint language to reflect planning approval"
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
