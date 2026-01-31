import axios from 'axios';
import { firebaseAuth } from '../config/firebase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const user = firebaseAuth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - force refresh and retry once
      const user = firebaseAuth.currentUser;
      if (user && error.config && !error.config._retry) {
        error.config._retry = true;
        const token = await user.getIdToken(true);
        error.config.headers.Authorization = `Bearer ${token}`;
        return apiClient(error.config);
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
