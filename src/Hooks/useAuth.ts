import { useUserStore, Permission } from "../Store/UserStore";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const navigate = useNavigate();
  const {
    user,
    roles,
    permissions,
    accessToken,
    isInitialized,
    passwordMustChange,
    setUser,
    setAccessToken,
    setPasswordMustChange,
    setPermissions,
    setRoles,
    loginUser,
    clearUser,
    initializeAuth,
  } = useUserStore();

  const isAuthenticated = Boolean(user && accessToken);
  const isLoading = !isInitialized;

  const logout = () => {
    clearUser();
    localStorage.removeItem("refreshToken");
    navigate("/", { replace: true });
  };

  const login = (
    userData: any,
    token: string,
    refreshToken: string,
    mustChangePassword: boolean = false,
    permissionsData: Permission[] = [],
    rolesData: string[] = [],
  ) => {
    setUser(userData);
    setAccessToken(token);
    setPasswordMustChange(mustChangePassword);
    setPermissions(permissionsData);
    setRoles(rolesData.length ? rolesData : (userData?.roles ?? []));
    localStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", refreshToken);

    if (mustChangePassword) {
      navigate("/dashboard/settings?changePassword=true", { replace: true });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  return {
    user,
    roles,
    permissions,
    isAuthenticated,
    isLoading,
    accessToken,
    passwordMustChange,
    login,
    logout,
    initializeAuth,
  };
};
