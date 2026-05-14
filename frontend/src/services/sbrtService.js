import apiClient from './api';

export const generateSBRTWriteup = async (formData) => {
  try {
    const response = await apiClient.post('/sbrt/generate', formData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to generate SBRT write-up');
  }
};
