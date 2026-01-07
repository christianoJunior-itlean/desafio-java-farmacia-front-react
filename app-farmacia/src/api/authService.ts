import api from '../config/axios';
import { LoginRequest, LoginResponse } from '../types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  registrar: async (credentials: LoginRequest): Promise<string> => {
    const response = await api.post<string>('/auth/registrar', credentials);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  },

  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  getUsername: (): string | null => {
    return localStorage.getItem('username');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },
};
