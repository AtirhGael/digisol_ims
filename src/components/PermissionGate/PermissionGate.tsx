import { ReactNode } from "react";
import { useUserStore } from "../../Store/UserStore";

interface PermissionGateProps {
  /** The module this resource belongs to (e.g. 'hr', 'finance', 'admin'). */
  module: string;
  /** The resource type (e.g. 'employee', 'transactions', 'roles'). */
  resource: string;
  /** The action required (e.g. 'CREATE', 'READ', 'UPDATE', 'DELETE'). */
  action: string;
  /** Content rendered when the user has permission. */
  children: ReactNode;
  /** Optional fallback rendered when the user lacks permission. Defaults to null. */
  fallback?: ReactNode;
}

/**
 * Conditionally renders children only when the current user has the specified
 * permission. Use this to hide/show Create, Edit, Delete buttons.
 *
 * SUPER_ADMIN always passes.
 *
 * Usage:
 *   <PermissionGate module="hr" resource="employee" action="CREATE">
 *     <button>Add Employee</button>
 *   </PermissionGate>
 *
 *   <PermissionGate module="hr" resource="employee" action="DELETE" fallback={<span />}>
 *     <button>Delete</button>
 *   </PermissionGate>
 */
export const PermissionGate = ({
  module,
  resource,
  action,
  children,
  fallback = null,
}: PermissionGateProps) => {
  const roles = useUserStore((state) => state.roles);
  const permissions = useUserStore((state) => state.permissions);

  const isSuperAdmin = roles.includes("SUPER_ADMIN");
  const permitted =
    isSuperAdmin ||
    permissions.some(
      (p) =>
        p.module === module &&
        p.resource_type === resource &&
        p.action === action,
    );

  return permitted ? <>{children}</> : <>{fallback}</>;
};
