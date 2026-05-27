import { apiPost } from './api';

export const generateSBRTWriteup = (data) =>
  apiPost('/sbrt/generate', data, 'Failed to generate SBRT write-up');
