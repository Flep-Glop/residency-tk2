import apiClient from './api';

// Get available treatment sites for neurostimulator cases
export const getTreatmentSites = async () => {
  try {
    const response = await apiClient.get('/neurostimulator/treatment-sites');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get treatment sites');
  }
};

// Get available neurostimulator device types
export const getDeviceTypes = async () => {
  try {
    const response = await apiClient.get('/neurostimulator/device-types');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get device types');
  }
};

// Get device vendor and model information
export const getDeviceInfo = async () => {
  try {
    const response = await apiClient.get('/neurostimulator/device-info');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get device information');
  }
};

// Get treatment site and distance option information
export const getTreatmentSiteInfo = async () => {
  try {
    const response = await apiClient.get('/neurostimulator/treatment-site-info');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get treatment site information');
  }
};

// Calculate risk assessment for neurostimulator
export const calculateRiskAssessment = async (assessmentData) => {
  try {
    const response = await apiClient.post('/neurostimulator/risk-assessment', assessmentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to calculate risk assessment');
  }
};

// Generate neurostimulator write-up
export const generateNeurostimulatorWriteup = async (formData) => {
  try {
    const response = await apiClient.post('/neurostimulator/generate', formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to generate neurostimulator write-up');
  }
};

