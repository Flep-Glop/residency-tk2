import api from './api';

const tbiService = {
  // Get available fractionation schemes
  getFramentationSchemes: async () => {
    try {
      const response = await api.get('/tbi/fractionation-schemes');
      return response.data;
    } catch (error) {
      console.error('Error fetching fractionation schemes:', error);
      throw error;
    }
  },

  // Get setup options
  getSetupOptions: async () => {
    try {
      const response = await api.get('/tbi/setup-options');
      return response.data;
    } catch (error) {
      console.error('Error fetching setup options:', error);
      throw error;
    }
  },

  // Generate TBI write-up
  generateWriteup: async (data) => {
    try {
      const response = await api.post('/tbi/generate', data);
      return response.data;
    } catch (error) {
      console.error('Error generating TBI write-up:', error);
      throw error;
    }
  }
};

export default tbiService;

