import { ReactNode, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Loader } from "../components/other/Loader/Loader";
import { useUserStore } from "../Store/UserStore";

export const Authenticate = ({ children }: { children: ReactNode }) => {
  const { user, accessToken, isInitialized, initializeAuth } = useUserStore();

  useEffect(() => {
    // Initialize authentication if not already done
    if (!isInitialized) {
      initializeAuth();
    }
  }, [isInitialized, initializeAuth]);

  // Show loading while authentication is being initialized
  if (!isInitialized) {
    return <Loader />;
  }

  // If no user or access token after initialization, redirect to login
  if (!user || !accessToken) {
    return <Navigate to="/" replace />;
  }

  // User is authenticated, render protected content
  return <>{children}</>;
};
