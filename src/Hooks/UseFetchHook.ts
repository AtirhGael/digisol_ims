import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useUserStore } from "../Store/UserStore";
import { navigationService } from "../utils/navigationService";

interface UseFetchOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

interface UseFetchResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: any;
  refetch: () => void;
  isSuccess: boolean;
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
    // Prefer in-memory token; fall back to localStorage for page refreshes.
    const accessToken =
      useUserStore.getState().accessToken ||
      (typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null);
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
      // No localStorage-based refresh flow. Clear user and redirect.
      originalRequest._retry = true;
      useUserStore.getState().clearUser();
      navigationService.navigateTo("/", true);
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      navigationService.navigateTo("/dashboard/unauthorized", true);
      return Promise.reject(error);
    }
    return Promise.reject(error);
  },
);

export const useFetchHook = <T = any>(
  endpoint: string,
  requeryKey: string,
  options?: UseFetchOptions,
): UseFetchResult<T> => {
  const { data, isLoading, isError, error, refetch, isSuccess } = useQuery({
    queryKey: [requeryKey, endpoint], // Include endpoint in query key for uniqueness
    queryFn: async () => {
      const response = await apiClient.get(endpoint);
      return response.data;
    },
    enabled: options?.enabled ?? true,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    staleTime: options?.staleTime ?? 5 * 60 * 1000, // 5 minutes
    gcTime: options?.cacheTime ?? 10 * 60 * 1000, // 10 minutes (replaces cacheTime)
  });

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isSuccess,
  };
};

export default useFetchHook;

/** Same axios client as useFetchHook — for one-off requests (e.g. before submit). */
export async function fetchApiGet<T = unknown>(endpoint: string): Promise<T> {
  const response = await apiClient.get(endpoint);
  return response.data;
}
