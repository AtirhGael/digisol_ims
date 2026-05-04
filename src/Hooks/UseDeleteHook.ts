import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useUserStore } from "../Store/UserStore";
import { navigationService } from "../utils/navigationService";

interface UseDeleteOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

interface UseDeleteResult {
  isLoading: boolean;
  isError: boolean;
  error: any;
  mutate: (id: string | number) => void;
  mutateAsync: (id: string | number) => Promise<any>;
  isSuccess: boolean;
  data: any;
}

const baseURL = (import.meta as any).env.VITE_BASE_URL;

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = useUserStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          // No refresh token, redirect to login
          useUserStore.getState().clearUser();
          navigationService.navigateTo("/", true);
          return Promise.reject(error);
        }

        // Call refresh token endpoint
        const refreshResponse = await axios.post(
          `${baseURL}/auth/refresh-token`,
          { refreshToken: refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const { token, refresh_token: newRefreshToken } =
          refreshResponse.data || {};
        if (token) {
          // Update tokens
          useUserStore.getState().setAccessToken(token);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }

          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;

          // Retry the original request
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear user and redirect to login
        useUserStore.getState().clearUser();
        localStorage.removeItem("refreshToken");
        navigationService.navigateTo("/", true);
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403) {
      navigationService.navigateTo("/dashboard/unauthorized", true);
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);

export const useDeleteHook = <T = any>(
  endpoint: string,
  invalidateQueries: string[],
  options?: UseDeleteOptions,
): UseDeleteResult => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string | number) => {
      const response = await apiClient.delete(`${endpoint}/${id}`);
      return response.data;
    },
    onSuccess: (data, variables, context) => {
      // Invalidate specified queries - clear the cache completely
      if (invalidateQueries && invalidateQueries.length > 0) {
        invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
          // Also remove cached data to force refetch
          queryClient.removeQueries({ queryKey: [queryKey] });
        });
      } else {
        // Default invalidation - invalidate queries related to the endpoint
        queryClient.invalidateQueries({ queryKey: [endpoint] });
        queryClient.removeQueries({ queryKey: [endpoint] });
      }
      // Call custom onSuccess callback if provided
      if (options?.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error, variables, context) => {
      // Call custom onError callback if provided
      if (options?.onError) {
        options.onError(error);
      }
    },
  });

  return {
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
  };
};

export default useDeleteHook;
