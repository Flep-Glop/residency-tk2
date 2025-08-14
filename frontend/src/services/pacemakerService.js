import apiClient from './api';

// Get available treatment sites for pacemaker cases
export const getTreatmentSites = async () => {
  try {
    const response = await apiClient.get('/pacemaker/treatment-sites');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get treatment sites');
  }
};

// Get device vendor and model information
export const getDeviceInfo = async () => {
  try {
    const response = await apiClient.get('/pacemaker/device-info');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get device information');
  }
};

// Get treatment site and distance option information
export const getTreatmentSiteInfo = async () => {
  try {
    const response = await apiClient.get('/pacemaker/treatment-site-info');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get treatment site information');
  }
};

// Calculate risk assessment based on TG-203 guidelines
export const calculateRiskAssessment = async (assessmentData) => {
  try {
    const response = await apiClient.post('/pacemaker/risk-assessment', assessmentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to calculate risk assessment');
  }
};

// Generate pacemaker write-up
export const generatePacemakerWriteup = async (formData) => {
  try {
    const response = await apiClient.post('/pacemaker/generate', formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to generate pacemaker write-up');
  }
};