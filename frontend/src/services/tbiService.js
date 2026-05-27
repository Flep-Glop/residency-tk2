import { apiPost } from './api';

export const generateTBIWriteup = (data) =>
  apiPost('/tbi/generate', data, 'Failed to generate TBI write-up');
