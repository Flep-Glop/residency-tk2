import api from './api';

const hdrService = {
  // Get available applicator types
  getApplicators: async () => {
    try {
      const response = await api.get('/hdr/applicators');
      return response.data;
    } catch (error) {
      console.error('Error fetching applicators:', error);
      throw error;
    }
  },

  // Get applicator-specific info (position, channels)
  getApplicatorInfo: async (applicatorType) => {
    try {
      const response = await api.get(`/hdr/applicator-info/${encodeURIComponent(applicatorType)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching applicator info:', error);
      throw error;
    }
  },

  // Generate HDR write-up
  generateWriteup: async (data) => {
    try {
      const response = await api.post('/hdr/generate', data);
      return response.data;
    } catch (error) {
      console.error('Error generating HDR write-up:', error);
      throw error;
    }
  }
};

export default hdrService;

