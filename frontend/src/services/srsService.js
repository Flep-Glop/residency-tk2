import api from './api';

const srsService = {
  /**
   * Get available brain regions for SRS/SRT
   * @returns {Promise<Array>} List of brain regions
   */
  getBrainRegions: async () => {
    const response = await api.get('/srs/brain-regions');
    return response.data;
  },

  /**
   * Generate SRS/SRT write-up
   * @param {Object} data - Form data including common_info and srs_data
   * @returns {Promise<Object>} Generated write-up
   */
  generateWriteup: async (data) => {
    const response = await api.post('/srs/generate', data);
    return response.data;
  }
};

export default srsService;

