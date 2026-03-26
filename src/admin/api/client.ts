import axios, { AxiosError } from 'axios';
import type { ApiResponse } from '../types/api.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Axios instance
export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (adiciona token)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (trata erros)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    // Se 401, limpar token e redirecionar para login
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Helper para extrair dados ou lançar erro
export function handleApiResponse<T>(response: ApiResponse<T>): T {
  if (response.ok) {
    return response.data;
  }
  throw new Error(response.error.message);
}

// Helper para salvar token
export function setAuthToken(token: string) {
  localStorage.setItem('admin_token', token);
}

// Helper para verificar autenticação
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('admin_token');
}

// Helper para logout
export function logout() {
  localStorage.removeItem('admin_token');
  window.location.href = '/admin/login';
}
