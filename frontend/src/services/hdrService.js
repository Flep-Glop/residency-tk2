import { apiPost } from './api';

export const generateHDRWriteup = (data) =>
  apiPost('/hdr/generate', data, 'Failed to generate HDR write-up');
