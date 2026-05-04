import { create } from "zustand";

const baseURL = import.meta.env.VITE_BASE_URL;

export interface Permission {
  permission_name: string;
  permission_code: string;
  module: string;
  resource_type: string;
  action: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string | null;
}

interface UserStore {
  user: User | null;
  roles: string[];
  permissions: Permission[];
  resetEmail: string | null;
  accessToken: string | null;
  isInitialized: boolean;
  passwordMustChange: boolean;
  setUser: (user: User) => void;
  setRoles: (roles: string[]) => void;
  setPermissions: (permissions: Permission[]) => void;
  setResetEmail: (email: string) => void;
  setAccessToken: (token: string) => void;
  setInitialized: (initialized: boolean) => void;
  setPasswordMustChange: (mustChange: boolean) => void;
  updateAvatarUrl: (url: string) => void;
  clearUser: () => void;
  initializeAuth: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  roles: [],
  permissions: [],
  resetEmail: null,
  accessToken: null,
  isInitialized: false,
  passwordMustChange: false,
  setUser: (user) => set({ user }),
  setRoles: (roles) => set({ roles }),
  setPermissions: (permissions) => set({ permissions }),
  setResetEmail: (email) => set({ resetEmail: email }),
  setAccessToken: (token) => set({ accessToken: token }),
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  setPasswordMustChange: (mustChange) =>
    set({ passwordMustChange: mustChange }),
  updateAvatarUrl: (url) =>
    set((state) => ({
      user: state.user ? { ...state.user, avatar_url: url } : null,
    })),
  clearUser: () =>
    set({
      user: null,
      roles: [],
      permissions: [],
      resetEmail: null,
      accessToken: null,
      passwordMustChange: false,
    }),
  initializeAuth: async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        set({ isInitialized: true });
        return;
      }
      // Try to refresh the access token
      const response = await fetch(`${baseURL}/auth/refresh-token`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken: refreshToken }),
      });
      const data = await response.json();
      if (response.ok) {
        // Handle both wrapped { data: { ... } } and unwrapped responses
        const responseData = data.data || data;
        const {
          token,
          refresh_token: newRefreshToken,
          user,
          permissions,
        } = responseData;

        // Normalize user object to ensure 'id' property exists (matching the store's User interface)
        const normalizedUser = user
          ? {
              ...user,
              id: user.id || user.user_id || user.id,
            }
          : null;

        const mustChangePassword = Boolean(
          (user as { password_must_change?: boolean })?.password_must_change
        );

        // Update tokens and user
        set({
          accessToken: token || responseData.accessToken,
          user: normalizedUser,
          roles: normalizedUser?.roles ?? user?.roles ?? [],
          permissions: permissions ?? [],
          passwordMustChange: mustChangePassword,
          isInitialized: true,
        });

        // Only update localStorage if a NEW refresh token was actually provided
        const finalRefreshToken = newRefreshToken || responseData.refreshToken;
        if (finalRefreshToken) {
          localStorage.setItem("refreshToken", finalRefreshToken);
        }
      } else {
        localStorage.removeItem("refreshToken");
        set({
          user: null,
          accessToken: null,
          resetEmail: null,
          passwordMustChange: false,
          isInitialized: true,
        });
      }
    } catch (error) {
      // Error during refresh, clear everything
      localStorage.removeItem("refreshToken");
      set({
        user: null,
        accessToken: null,
        resetEmail: null,
        passwordMustChange: false,
        isInitialized: true,
      });
    }
  },
}));
