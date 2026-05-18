import { useState } from "react";
import axios from "axios";
import { useUserStore } from "../Store/UserStore";
import { navigationService } from "../utils/navigationService";

const baseURL = (import.meta as any).env.VITE_BASE_URL;

const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const accessToken =
      useUserStore.getState().accessToken ||
      (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null);

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken =
          typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

        if (!refreshToken) {
          useUserStore.getState().clearUser();
          navigationService.navigateTo("/", true);
          return Promise.reject(error);
        }

        const refreshResponse = await axios.post(
          `${baseURL}/auth/refresh-token`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } },
        );

        const { token, refresh_token: newRefreshToken } = refreshResponse.data || {};

        if (token) {
          useUserStore.getState().setAccessToken(token);
          localStorage.setItem("accessToken", token);

          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        useUserStore.getState().clearUser();
        localStorage.removeItem("accessToken");
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

export const usePost = <T,>() => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postData = async (
    url: string,
    body: any,
    method: "POST" | "PUT" | "PATCH" = "POST"
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient({
        method,
        url,
        data: body,
      });

      setData(response.data);
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 403) {
        navigationService.navigateTo("/dashboard/unauthorized", true);
      }
      const data = err.response?.data as
        | { error?: string; message?: string }
        | undefined;
      setError(
        (typeof data?.error === "string" && data.error.trim()) ||
          (typeof data?.message === "string" && data.message.trim()) ||
          "An error occurred",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, postData };
};

export default usePost;


