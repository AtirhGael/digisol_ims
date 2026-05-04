import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useUserStore } from "../Store/UserStore";
import { navigationService } from "../utils/navigationService";

interface UsePatchOptions {
     onSuccess?: (data: any) => void;
     onError?: (error: any) => void;
}

interface UsePatchResult {
     isLoading: boolean;
     isError: boolean;
     error: any;
     mutate: (variables: { id?: string | number; data: any }) => void;
     mutateAsync: (variables: { id?: string | number; data: any }) => Promise<any>;
     isSuccess: boolean;
     data: any;
     api_method: string;
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
          const accessToken = useUserStore.getState().accessToken || localStorage.getItem("accessToken");
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
                         useUserStore.getState().clearUser();
                         navigationService.navigateTo("/", true);
                         return Promise.reject(error);
                    }

                    // Call refresh token endpoint
                    const refreshResponse = await axios.post(
                         `${baseURL}/auth/refresh-token`,
                         { refreshToken: refreshToken },
                         {
                              headers: { "Content-Type": "application/json" },
                         },
                    );

                    const { token, refresh_token: newRefreshToken } = refreshResponse.data || {};
                    if (token) {
                         useUserStore.getState().setAccessToken(token);
                         if (newRefreshToken) {
                              localStorage.setItem("refreshToken", newRefreshToken);
                         }
                         originalRequest.headers.Authorization = `Bearer ${token}`;
                         return apiClient(originalRequest);
                    }
               } catch (refreshError) {
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

/**
 * Hook for performing PATCH requests with React Query
 * @param endpoint The base URL for the request
 * @param invalidateQueries Array of query keys to invalidate on success
 * @param options Optional success/error callbacks
 */

export const usePatchHook = (
     endpoint: string,
     api_method: "put" | "patch",
     invalidateQueries?: string[],
     options?: UsePatchOptions,
): UsePatchResult => {
     const queryClient = useQueryClient();

     const mutation = useMutation({
          mutationFn: async ({ id, data }: { id?: string | number; data: any }) => {
               const url = id ? `${endpoint}/${id}` : endpoint;
               if (api_method === "put") {
                      const response = await apiClient.put(url, data);
                    return response.data;
               } else {
                    const response = await apiClient.patch(url, data);
                    return response.data;
               }
          },
          onSuccess: (responseData) => {
               if (invalidateQueries && invalidateQueries.length > 0) {
                    invalidateQueries.forEach((queryKey) => {
                         queryClient.invalidateQueries({ queryKey: [queryKey] });
                    });
               }

               if (options?.onSuccess) {
                    options.onSuccess(responseData);
               }
          },
          onError: (err: any) => {
               if (options?.onError) {
                    options.onError(err);
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

export default usePatchHook;
