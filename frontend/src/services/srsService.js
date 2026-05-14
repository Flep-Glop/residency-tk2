import api from './api';

const srsService = {
  generateWriteup: async (data) => {
    const response = await api.post('/srs/generate', data);
    return response.data;
  }
};

export default srsService;
