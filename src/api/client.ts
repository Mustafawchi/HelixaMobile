import axios from 'axios';
import { firebaseAuth } from '../config/firebase';

const RAW_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const stripTrailingSlashes = (value: string) => value.replace(/\/+$/, '');

const toFunctionsRootBaseUrl = (value: string) =>
  stripTrailingSlashes(value).replace(/\/audioProcessing$/, '');

const toAudioProcessingBaseUrl = (value: string) => {
  const normalized = stripTrailingSlashes(value);
  return normalized.endsWith('/audioProcessing')
    ? normalized
    : `${normalized}/audioProcessing`;
};

const attachAuthInterceptors = (client: ReturnType<typeof axios.create>) => {
  client.interceptors.request.use(async (config) => {
    const user = firebaseAuth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Token expired - force refresh and retry once
        const user = firebaseAuth.currentUser;
        if (user && error.config && !error.config._retry) {
          error.config._retry = true;
          const token = await user.getIdToken(true);
          error.config.headers.Authorization = `Bearer ${token}`;
          return client(error.config);
        }
      }
      return Promise.reject(error);
    },
  );
};

export const audioApiClient = axios.create({
  baseURL: toAudioProcessingBaseUrl(RAW_API_BASE_URL),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const functionsApiClient = axios.create({
  baseURL: toFunctionsRootBaseUrl(RAW_API_BASE_URL),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

attachAuthInterceptors(audioApiClient);
attachAuthInterceptors(functionsApiClient);

// Backward compatibility: existing endpoints import default client.
export default audioApiClient;
