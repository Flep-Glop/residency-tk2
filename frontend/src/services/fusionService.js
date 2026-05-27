import { apiGet, apiPost } from './api';

export const getModalities = () =>
  apiGet('/fusion/modalities', 'Failed to get modalities');

export const getRegistrationMethods = () =>
  apiGet('/fusion/registration-methods', 'Failed to get registration methods');

export const generateFusionWriteup = (data) =>
  apiPost('/fusion/generate', data, 'Failed to generate fusion write-up', { cacheBust: true });
