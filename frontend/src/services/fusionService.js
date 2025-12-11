import apiClient from './api';

// Get available modalities
export const getModalities = async () => {
  try {
    const response = await apiClient.get('/fusion/modalities');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get modalities');
  }
};

// Get available registration methods
export const getRegistrationMethods = async () => {
  try {
    const response = await apiClient.get('/fusion/registration-methods');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get registration methods');
  }
};

// Generate fusion write-up
export const generateFusionWriteup = async (formData) => {
  try {
    // Add timestamp to make each request unique
    const response = await apiClient.post(`/fusion/generate?t=${Date.now()}`, formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to generate fusion write-up');
  }
}; 