import apiClient from '../client';
import type { LoginRequest, LoginResponse } from '../../types/auth';

export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/auth/login', data),

  logout: () =>
    apiClient.post('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    apiClient.post<LoginResponse>('/auth/refresh', { refreshToken }),
};
