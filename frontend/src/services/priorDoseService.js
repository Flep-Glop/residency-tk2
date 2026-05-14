import apiClient from './api';

export const getTreatmentSites = async () => {
  try {
    const response = await apiClient.get('/prior-dose/treatment-sites');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get treatment sites');
  }
};

export const getDoseCalcMethods = async () => {
  try {
    const response = await apiClient.get('/prior-dose/dose-calc-methods');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get dose calculation methods');
  }
};

export const generatePriorDoseWriteup = async (formData) => {
  try {
    const response = await apiClient.post(`/prior-dose/generate?t=${Date.now()}`, formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to generate prior dose write-up');
  }
};

export const getSuggestedConstraints = async (sites, options = {}) => {
  try {
    const { doseCalcMethod = 'Raw Dose', currentDose, currentFractions } = options;
    
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
