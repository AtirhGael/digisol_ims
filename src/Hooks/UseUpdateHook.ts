import { useState } from "react";
import axios from "axios";
import { useUserStore } from "../Store/UserStore";
import { navigationService } from "../utils/navigationService";

const baseURL = (import.meta as any).env.VITE_BASE_URL;

// Create axios instance with same configuration as useFetchHook
const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

// Add request interceptor for authentication (same as useFetchHook)
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

export const useUpdate = <T>() => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateData = async (url: string, body: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.put(url, body);

      setData(response.data);
      return response.data;
    } catch (err: any) {
      if (err.response?.status === 403) {
        navigationService.navigateTo("/dashboard/unauthorized", true);
      }
      const respData = err.response?.data as
        | { error?: string; message?: string }
        | undefined;
      setError(
        (typeof respData?.error === "string" && respData.error.trim()) ||
          (typeof respData?.message === "string" && respData.message.trim()) ||
          "An error occurred",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, updateData };
};

export default useUpdate;
