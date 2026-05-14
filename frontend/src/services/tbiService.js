import api from './api';

const tbiService = {
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
