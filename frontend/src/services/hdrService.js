import api from './api';

const hdrService = {
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
