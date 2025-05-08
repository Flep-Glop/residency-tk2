import axios from 'axios';

// Use environment variable with Railway URL as default, falling back to localhost only in development
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://fresh-residency-toolkit-production.up.railway.app/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient; 