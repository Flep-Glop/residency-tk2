import { apiGet, apiPost } from './api';

export const getTreatmentSites = () =>
  apiGet('/pacemaker/treatment-sites', 'Failed to get treatment sites');

export const getDeviceInfo = () =>
  apiGet('/pacemaker/device-info', 'Failed to get device information');

export const getTreatmentSiteInfo = () =>
  apiGet('/pacemaker/treatment-site-info', 'Failed to get treatment site information');

export const calculateRiskAssessment = (data) =>
  apiPost('/pacemaker/risk-assessment', data, 'Failed to calculate risk assessment');

export const generatePacemakerWriteup = (data) =>
  apiPost('/pacemaker/generate', data, 'Failed to generate pacemaker write-up');
