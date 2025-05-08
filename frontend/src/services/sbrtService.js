import apiClient from './api';

// Get available treatment sites for SBRT
export const getTreatmentSites = async () => {
  try {
    const response = await apiClient.get('/sbrt/treatment-sites');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get treatment sites');
  }
};

// Get dose constraints for a specific treatment site
export const getDoseConstraints = async (site) => {
  try {
    const response = await apiClient.get(`/sbrt/dose-constraints/${site}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get dose constraints');
  }
};

// Get available fractionation schemes for a treatment site
export const getFractionationSchemes = async (site) => {
  try {
    const response = await apiClient.get(`/sbrt/fractionation-schemes/${site}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get fractionation schemes');
  }
};

// Generate SBRT write-up
export const generateSBRTWriteup = async (formData) => {
  try {
    const response = await apiClient.post('/sbrt/generate', formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to generate SBRT write-up');
  }
};

// Validate dose and fractionation for a specific site
export const validateDoseFractionation = async (site, dose, fractions) => {
  try {
    const response = await apiClient.post('/sbrt/validate', { site, dose, fractions });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to validate dose/fractionation');
  }
}; 