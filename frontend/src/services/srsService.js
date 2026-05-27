import { apiPost } from './api';

export const generateSRSWriteup = (data) =>
  apiPost('/srs/generate', data, 'Failed to generate SRS write-up');
