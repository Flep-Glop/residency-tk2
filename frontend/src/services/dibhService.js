import { apiGet, apiPost } from './api';

export const getTreatmentSites = () =>
  apiGet('/dibh/treatment-sites', 'Failed to get treatment sites');

export const getImmobilizationDevices = () =>
  apiGet('/dibh/immobilization-devices', 'Failed to get immobilization devices');

export const getFractionationSchemes = () =>
  apiGet('/dibh/fractionation-schemes', 'Failed to get fractionation schemes');

export const generateDIBHWriteup = (data) =>
  apiPost('/dibh/generate', data, 'Failed to generate DIBH write-up');
