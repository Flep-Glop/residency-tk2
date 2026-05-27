import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timed out. Please try again.';
    } else if (!error.response && error.request) {
      error.message = 'Network error. Please check your connection and try again.';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

export const apiGet = async (path, errorMsg) => {
  try {
    const response = await apiClient.get(path);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || errorMsg);
  }
};

export const apiPost = async (path, data, errorMsg, { cacheBust } = {}) => {
  try {
    const url = cacheBust ? `${path}?t=${Date.now()}` : path;
    const response = await apiClient.post(url, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || errorMsg);
  }
};
