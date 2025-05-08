import apiClient from './api';

// Get available treatment sites for DIBH
export const getTreatmentSites = async () => {
  try {
    const response = await apiClient.get('/dibh/treatment-sites');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get treatment sites');
  }
};

// Get available immobilization devices
export const getImmobilizationDevices = async () => {
  try {
    const response = await apiClient.get('/dibh/immobilization-devices');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get immobilization devices');
  }
};

// Get default fractionation schemes
export const getFractionationSchemes = async () => {
  try {
    const response = await apiClient.get('/dibh/fractionation-schemes');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get fractionation schemes');
  }
};

// Generate DIBH write-up
export const generateDIBHWriteup = async (formData) => {
  try {
    const response = await apiClient.post('/dibh/generate', formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to generate DIBH write-up');
  }
}; 