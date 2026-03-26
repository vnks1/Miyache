import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient, handleApiResponse, setAuthToken } from './client';
import type { ApiResponse, User } from '../types/api.types';
import type { LoginInput } from '../schemas/series.schemas';

// Login
export function useLogin() {
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const { data } = await apiClient.post<ApiResponse<{ accessToken: string; user: User }>>(
        '/api/auth/login',
        input
      );
      const result = handleApiResponse(data);
      setAuthToken(result.accessToken);
      return result.user;
    },
  });
}

// Get current user
export function useMe() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await apiClient.get<ApiResponse<User>>('/api/auth/me');
      return handleApiResponse(data);
    },
    retry: false,
  });
}
