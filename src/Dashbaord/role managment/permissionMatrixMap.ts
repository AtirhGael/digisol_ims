/**
 * Maps CreateRole UI permission matrix paths to backend `permissions` rows
 * (module, resource_type, action) — aligns with Digisol-IMS-backend seed-permissions.ts.
 */

export type BackendPermissionRow = {
  permission_id: string;
  module: string;
  resource_type: string;
  action: string;
};

const UI_TOP_MODULE_TO_BACKEND: Record<string, string> = {
  dashboard: "",
  "human resource": "hr",
  finance: "finance",
  "business development": "business_development",
  roles: "admin",
  users: "admin",
  projects: "projects",
  documents: "documents",
  development: "development",
  facility: "facility",
  /** Root-level tasks align with development/tasks in seed */
  tasks: "development",
};

const CRUD_KEYS = new Set(["create", "read", "update", "delete"]);

function normalizeResourceType(uiLabel: string): string {
  const lower = uiLabel.toLowerCase().trim();
  if (lower === "leave management") return "leave_management";
  if (lower === "invoice & payments" || lower === "invoice and payments") return "invoice_payments";
  return lower.replace(/\s+/g, "_");
}

/** Same convention as seed-permissions.ts `buildPermissions`. */
function buildPermissionCode(module: string, resourceType: string, action: string): string {
  return `${module.toUpperCase().replace(/-/g, "_")}_${resourceType.toUpperCase().replace(/-/g, "_")}_${action.toUpperCase()}`;
}

/**
 * Walk the nested matrix; for each true CRUD leaf, find matching permission_id.
 */
export function matrixToPermissionIds(
  matrix: Record<string, unknown>,
  allPermissions: BackendPermissionRow[],
): string[] {
  const ids = new Set<string>();

  const findId = (module: string, resourceType: string, action: string) => {
    const row = allPermissions.find(
      (p) =>
        p.module === module &&
        p.resource_type === resourceType &&
        p.action === action.toUpperCase(),
    );
    if (row) ids.add(row.permission_id);
  };

  const walk = (node: unknown, path: string[]) => {
    if (typeof node === "boolean") {
      if (!node || path.length < 2) return;

      const last = path[path.length - 1];
      const isCrudLeaf = CRUD_KEYS.has(last);

      if (isCrudLeaf && path.length >= 3) {
        const topKey = path[0];
        const backendModule = UI_TOP_MODULE_TO_BACKEND[topKey];
        if (!backendModule) return;
        const resourceUi = path[1];
        const resourceType = normalizeResourceType(resourceUi);
        findId(backendModule, resourceType, last);
        return;
      }

      // Top-level CRUD blocks e.g. roles, users → admin/roles, admin/users
      if (isCrudLeaf && path.length === 2) {
        const topKey = path[0];
        const backendModule = UI_TOP_MODULE_TO_BACKEND[topKey];
        if (!backendModule) return;
        const resourceType = normalizeResourceType(topKey);
        findId(backendModule, resourceType, last);
        return;
      }

      // Two-segment booleans e.g. ["human resource", "dashboard"] — no matching seed rows; skip
      return;
    }

    if (node !== null && typeof node === "object" && !Array.isArray(node)) {
      for (const [key, value] of Object.entries(node)) {
        walk(value, [...path, key]);
      }
    }
  };

  walk(matrix, []);
  return Array.from(ids);
}

/**
 * Derive stable `permission_code` values from the matrix (no API call).
 * Matches Digisol-IMS-backend seed-permissions.ts naming.
 */
export function matrixToPermissionCodes(matrix: Record<string, unknown>): string[] {
  const codes = new Set<string>();

  const walk = (node: unknown, path: string[]) => {
    if (typeof node === "boolean") {
      if (!node || path.length < 2) return;

      const last = path[path.length - 1];
      const isCrudLeaf = CRUD_KEYS.has(last);

      if (isCrudLeaf && path.length >= 3) {
        const topKey = path[0];
        const backendModule = UI_TOP_MODULE_TO_BACKEND[topKey];
        if (!backendModule) return;
        const resourceUi = path[1];
        const resourceType = normalizeResourceType(resourceUi);
        codes.add(buildPermissionCode(backendModule, resourceType, last));
        return;
      }

      if (isCrudLeaf && path.length === 2) {
        const topKey = path[0];
        const backendModule = UI_TOP_MODULE_TO_BACKEND[topKey];
        if (!backendModule) return;
        const resourceType = normalizeResourceType(topKey);
        codes.add(buildPermissionCode(backendModule, resourceType, last));
        return;
      }

      return;
    }

    if (node !== null && typeof node === "object" && !Array.isArray(node)) {
      for (const [key, value] of Object.entries(node)) {
        walk(value, [...path, key]);
      }
    }
  };

  walk(matrix, []);
  return Array.from(codes);
}
