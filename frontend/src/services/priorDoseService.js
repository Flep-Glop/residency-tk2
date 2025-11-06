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