import apiClient from './api';

// Get available treatment sites
export const getTreatmentSites = async () => {
  try {
    const response = await apiClient.get('/prior-dose/treatment-sites');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get treatment sites');
  }
};

// Get available dose calculation methods
export const getDoseCalcMethods = async () => {
  try {
    const response = await apiClient.get('/prior-dose/dose-calc-methods');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get dose calculation methods');
  }
};

// Generate prior dose write-up
export const generatePriorDoseWriteup = async (formData) => {
  try {
    // Add timestamp to make each request unique
    const response = await apiClient.post(`/prior-dose/generate?t=${Date.now()}`, formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to generate prior dose write-up');
  }
};

// Get suggested constraints based on treatment sites and fractionation
// Takes an array of site names and optional fractionation parameters
// Returns deduplicated constraints appropriate for the fractionation regime
//
// Constraint selection logic:
// - If doseCalcMethod contains "EQD2" → Use QUANTEC constraints (values are EQD2₂)
// - If doseCalcMethod is "Raw Dose" → Detect regime from fractionation:
//   - SRS: Single fraction ≥10 Gy → TG-101/HyTEC SRS limits
//   - SBRT_3fx: 2-3 fractions, ≥5 Gy/fx → Timmerman 3fx limits
//   - SBRT_5fx: 4-8 fractions, ≥5 Gy/fx → Timmerman 5fx limits
//   - CONVENTIONAL: ~2 Gy/fx → QUANTEC limits
export const getSuggestedConstraints = async (sites, options = {}) => {
  try {
    const { doseCalcMethod = 'Raw Dose', currentDose, currentFractions } = options;
    
    // Build query parameters
    const params = new URLSearchParams();
    params.append('sites', sites.join(','));
    params.append('dose_calc_method', doseCalcMethod);
    
    if (currentDose !== undefined && currentDose !== null && currentDose !== '') {
      params.append('current_dose', currentDose);
    }
    if (currentFractions !== undefined && currentFractions !== null && currentFractions !== '') {
      params.append('current_fractions', currentFractions);
    }
    
    const response = await apiClient.get(`/prior-dose/suggested-constraints?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get suggested constraints');
  }
};

// Get fractionation regime info for given dose/fractions
export const getFractionationRegime = async (dose, fractions) => {
  try {
    const response = await apiClient.get(`/prior-dose/fractionation-regime?dose=${dose}&fractions=${fractions}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get fractionation regime');
  }
};

// Get α/β ratio reference values
export const getAlphaBetaRatios = async () => {
  try {
    const response = await apiClient.get('/prior-dose/alpha-beta');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get α/β ratios');
  }
};