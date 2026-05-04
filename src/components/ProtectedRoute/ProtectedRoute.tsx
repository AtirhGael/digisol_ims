import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useUserStore } from "../../Store/UserStore";

interface PermissionCheck {
  module: string;
  resource: string;
  action: string;
}

interface ProtectedRouteProps {
  children: ReactNode;
  /**
   * If provided, the user must have this permission to access the route.
   * SUPER_ADMIN always bypasses this check.
   */
  requiredPermission?: PermissionCheck;
  /**
   * If provided, the user must have this exact role code.
   */
  requiredRole?: string;
  /**
   * If true, only users with the SUPER_ADMIN role can access this route.
   */
  superAdminOnly?: boolean;
}

/**
 * Wraps a route and redirects to /dashboard/unauthorized if the user
 * doesn't have the required permission or role.
 *
 * Usage:
 *   <ProtectedRoute requiredPermission={{ module: 'hr', resource: 'employee', action: 'READ' }}>
 *     <Employees />
 *   </ProtectedRoute>
 */
export const ProtectedRoute = ({
  children,
  requiredPermission,
  requiredRole,
  superAdminOnly,
}: ProtectedRouteProps) => {
  const roles = useUserStore((state) => state.roles);
  const permissions = useUserStore((state) => state.permissions);

  const isSuperAdmin = roles.includes("SUPER_ADMIN");

  // If the route is Super Admin only, redirect anyone who isn't a Super Admin
  if (superAdminOnly && !isSuperAdmin) {
    return <Navigate to="/dashboard/unauthorized" replace />;
  }

  if (!isSuperAdmin && requiredPermission) {
    const permitted = permissions.some(
      (p) =>
        p.module === requiredPermission.module &&
        p.resource_type === requiredPermission.resource &&
        p.action === requiredPermission.action,
    );
    if (!permitted) {
      return <Navigate to="/dashboard/unauthorized" replace />;
    }
  }

  if (requiredRole && !isSuperAdmin && !roles.includes(requiredRole)) {
    return <Navigate to="/dashboard/unauthorized" replace />;
  }

  return <>{children}</>;
};
