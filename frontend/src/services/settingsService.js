import apiClient from './api';

export const listProfiles = async () => {
  const response = await apiClient.get('/settings/profiles');
  return response.data;
};

export const getActiveProfile = async () => {
  const response = await apiClient.get('/settings/profiles/active');
  return response.data;
};

export const createProfile = async (data) => {
  const response = await apiClient.post('/settings/profiles', data);
  return response.data;
};

export const verifyEditCode = async (id, editCode) => {
  const response = await apiClient.post(`/settings/profiles/${id}/verify`, { edit_code: editCode });
  return response.data;
};

export const updateProfile = async (id, data) => {
  const response = await apiClient.put(`/settings/profiles/${id}`, data);
  return response.data;
};

export const activateProfile = async (id) => {
  const response = await apiClient.put(`/settings/profiles/${id}/activate`);
  return response.data;
};

export const deleteProfile = async (id, editCode) => {
  await apiClient.request({
    method: 'DELETE',
    url: `/settings/profiles/${id}`,
    data: { edit_code: editCode },
  });
};
