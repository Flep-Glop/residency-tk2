import apiClient from './api';
import { apiGet, apiPost } from './api';

export const getTreatmentSites = () =>
  apiGet('/prior-dose/treatment-sites', 'Failed to get treatment sites');

export const getDoseCalcMethods = () =>
  apiGet('/prior-dose/dose-calc-methods', 'Failed to get dose calculation methods');

export const generatePriorDoseWriteup = (data) =>
  apiPost('/prior-dose/generate', data, 'Failed to generate prior dose write-up', { cacheBust: true });

export const getSuggestedConstraints = async (sites, options = {}) => {
  try {
    const { doseCalcMethod = 'Raw Dose', currentDose, currentFractions } = options;
    const params = new URLSearchParams();
    params.append('sites', sites.join(','));
    params.append('dose_calc_method', doseCalcMethod);
    if (currentDose !== undefined && currentDose !== null && currentDose !== '') {
      params.append('current_dose', currentDose);
    }
    if (currentFractions !== undefined && currentFractions !== null && currentFractions !== '') {
      params.append('current_fractions', currentFractions);
    }
    const response = await apiClient.get(`/prior-dose/suggested-constraints?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || 'Failed to get suggested constraints');
  }
};
