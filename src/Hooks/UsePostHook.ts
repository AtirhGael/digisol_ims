import { useState } from "react";
import axios from "axios";
import { useUserStore } from "../Store/UserStore";
import { navigationService } from "../utils/navigationService";

export const usePost = <T>() => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postData = async (url: string, body: any) => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = useUserStore.getState().accessToken;
      const response = await axios.post(
        `${(import.meta as any).env.VITE_BASE_URL}${url}`,
        body,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

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
