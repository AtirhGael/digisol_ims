import { useUserStore } from "../Store/UserStore";

/**
 * Returns true if the current user has the given permission.
 * SUPER_ADMIN always returns true regardless of the permission check.
 */
export const useHasPermission = (
  module: string,
  resource: string,
  action: string,
): boolean => {
  const roles = useUserStore((state) => state.roles);
  const permissions = useUserStore((state) => state.permissions);

  if (roles.includes("SUPER_ADMIN")) return true;

  return permissions.some(
    (p) =>
      p.module === module &&
      p.resource_type === resource &&
      p.action === action,
  );
};

/**
 * Returns true if the current user has the given role code.
 */
export const useHasRole = (roleCode: string): boolean => {
  const roles = useUserStore((state) => state.roles);
  return roles.includes(roleCode);
};

/**
 * Returns true if the current user has ANY of the given permissions.
 */
export const useHasAnyPermission = (
  checks: Array<{ module: string; resource: string; action: string }>,
): boolean => {
  const roles = useUserStore((state) => state.roles);
  const permissions = useUserStore((state) => state.permissions);

  if (roles.includes("SUPER_ADMIN")) return true;

  return checks.some(({ module, resource, action }) =>
    permissions.some(
      (p) =>
        p.module === module &&
        p.resource_type === resource &&
        p.action === action,
    ),
  );
};

/**
 * Returns the full roles array for the current user.
 */
export const useRoles = (): string[] => {
  return useUserStore((state) => state.roles);
};
