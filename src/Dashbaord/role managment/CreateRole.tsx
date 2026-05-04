import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  FaUserShield,
  FaCircleCheck,
  FaShieldHalved,
  FaKey,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Input } from "../../components/ui/input";
import usePost from "@/Hooks/UsePostHook";
import { fetchApiGet } from "@/Hooks/UseFetchHook";
import { matrixToPermissionCodes } from "./permissionMatrixMap";

type CrudFlags = Record<"create" | "read" | "update" | "delete", boolean>;

function isCrudObject(val: unknown): val is CrudFlags {
  if (typeof val !== "object" || val === null || Array.isArray(val)) return false;
  const o = val as Record<string, unknown>;
  return (
    typeof o.create === "boolean" &&
    typeof o.read === "boolean" &&
    typeof o.update === "boolean" &&
    typeof o.delete === "boolean"
  );
}

/** True if every CRUD leaf in this subtree is enabled. */
function everyCrudLeaf(section: unknown): boolean {
  if (isCrudObject(section)) {
    return section.create && section.read && section.update && section.delete;
  }
  if (typeof section !== "object" || section === null || Array.isArray(section)) {
    return true;
  }
  return Object.values(section).every((v) => {
    if (isCrudObject(v)) return v.create && v.read && v.update && v.delete;
    if (typeof v === "object" && v !== null && !Array.isArray(v)) return everyCrudLeaf(v);
    return true;
  });
}

/** True if this subtree contains at least one CRUD resource. */
function hasNestedCrud(section: unknown): boolean {
  if (isCrudObject(section)) return true;
  if (typeof section !== "object" || section === null || Array.isArray(section)) return false;
  return Object.values(section).some((v) => hasNestedCrud(v));
}

function setAllCrudInSection(section: unknown, on: boolean): unknown {
  if (isCrudObject(section)) {
    return { create: on, read: on, update: on, delete: on };
  }
  if (typeof section !== "object" || section === null || Array.isArray(section)) {
    return section;
  }
  const src = section as Record<string, unknown>;
  const out: Record<string, unknown> = { ...src };
  for (const k of Object.keys(out)) {
    const v = out[k];
    if (isCrudObject(v)) {
      out[k] = { create: on, read: on, update: on, delete: on };
    } else if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      out[k] = setAllCrudInSection(v, on);
    }
  }
  return out;
}

// Initial state derived from role.json
const INITIAL_PERMISSIONS = {
  dashboard: false,
  "human resource": {
    dashboard: false,
    employee: { create: false, read: false, update: false, delete: false },
    onboarding: { create: false, read: false, update: false, delete: false },
    "leave management": { create: false, read: false, update: false, delete: false },
    attendance: { create: false, read: false, update: false, delete: false },
    performance: { create: false, read: false, update: false, delete: false },
    queries: { create: false, read: false, update: false, delete: false },
    reports: { create: false, read: false, update: false, delete: false },
    tasks: { create: false, read: false, update: false, delete: false },
  },
  finance: {
    dashboard: false,
    transactions: { create: false, read: false, update: false, delete: false },
    budgeting: { create: false, read: false, update: false, delete: false },
    expenses: { create: false, read: false, update: false, delete: false },
    payroll: { create: false, read: false, update: false, delete: false },
    "invoice & payments": { create: false, read: false, update: false, delete: false },
    reports: { create: false, read: false, update: false, delete: false },
  },
  "business development": {
    dashboard: false,
    clients: { create: false, read: false, update: false, delete: false },
    leads: { create: false, read: false, update: false, delete: false },
    proposals: { create: false, read: false, update: false, delete: false },
    contracts: { create: false, read: false, update: false, delete: false },
    services: { create: false, read: false, update: false, delete: false },
  },
  roles: { create: false, read: false, update: false, delete: false },
  users: { create: false, read: false, update: false, delete: false },
  projects: { create: false, read: false, update: false, delete: false },
  documents: { create: false, read: false, update: false, delete: false },
  development: {
    dashboard: false,
    tasks: { create: false, read: false, update: false, delete: false },
  },
  facility: {
    construction: { create: false, read: false, update: false, delete: false },
    power: { create: false, read: false, update: false, delete: false },
    inventory: { create: false, read: false, update: false, delete: false },
  },
  tasks: { create: false, read: false, update: false, delete: false },
};

/** Shared access toggle — consistent sizing and focus for the matrix. */
function CrudToggle({
  enabled,
  onClick,
  ariaLabel,
}: {
  enabled: boolean;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={ariaLabel}
      onClick={onClick}
      className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border px-0.5 transition-colors duration-200 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        ${enabled
          ? "border-blue-600 bg-blue-600 shadow-sm shadow-blue-600/20"
          : "border-slate-300/90 bg-slate-200/90 hover:border-slate-400 hover:bg-slate-200"
        }
      `}
    >
      <span
        className={`
          pointer-events-none block h-[1.125rem] w-[1.125rem] rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-out
          ${enabled ? "translate-x-5" : "translate-x-0"}
        `}
      />
    </button>
  );
}

const CreateRole: React.FC = () => {
  const navigate = useNavigate();
  const { postData, loading: isSubmitting } = usePost<{ success: boolean; message?: string }>();
  const [roleForm, setRoleForm] = useState({
    role_name: "",
    role_code: "",
    description: "",
  });

  const [permissionsMatrix, setPermissionsMatrix] = useState(INITIAL_PERMISSIONS);
  const [expandedModules, setExpandedModules] = useState<string[]>(["human resource", "finance"]);

  const toggleModule = (module: string) => {
    setExpandedModules((prev) =>
      prev.includes(module) ? prev.filter((m) => m !== module) : [...prev, module]
    );
  };

  const handlePermissionChange = (path: string[]) => {
    setPermissionsMatrix((prev: any) => {
      const newState = { ...prev };
      let current = newState;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      const lastKey = path[path.length - 1];
      current[lastKey] = !current[lastKey];
      return newState;
    });
  };

  const toggleAllCrudUnderDepartment = (moduleName: string) => {
    setPermissionsMatrix((prev: Record<string, unknown>) => {
      const section = prev[moduleName];
      if (!hasNestedCrud(section)) return prev as typeof INITIAL_PERMISSIONS;
      const allOn = everyCrudLeaf(section);
      const nextSection = setAllCrudInSection(section, !allOn);
      return { ...prev, [moduleName]: nextSection } as typeof INITIAL_PERMISSIONS;
    });
  };

  const handleCreate = async () => {
    const name = roleForm.role_name.trim();
    const code = roleForm.role_code.trim().toUpperCase();

    if (!name || !code) {
      toast.error("Role name and system code are required");
      return;
    }
    if (name.length < 2) {
      toast.error("Role name must be at least 2 characters");
      return;
    }
    if (code.length < 2) {
      toast.error("Role code must be at least 2 characters");
      return;
    }

    const rawCodes = matrixToPermissionCodes(
      permissionsMatrix as unknown as Record<string, unknown>
    );

    let permission_codes = rawCodes;
    try {
      const permRes = await fetchApiGet<{
        data?: { permissions?: Array<{ permission_code?: string | null }> };
      }>("admin/permissions");
      const rows = permRes?.data?.permissions;
      if (Array.isArray(rows) && rows.length > 0) {
        const known = new Set(
          rows
            .map((p) => p.permission_code?.trim().toUpperCase())
            .filter((c): c is string => !!c)
        );
        permission_codes = rawCodes.filter((c) => known.has(c.toUpperCase()));
        const dropped = rawCodes.length - permission_codes.length;
        if (dropped > 0) {
          toast.warning(
            `${dropped} permission(s) from the matrix are not in the database and were skipped.`
          );
        }
      }
    } catch {
      // No catalog — send matrix codes as-is (backend validates).
    }

    try {
      await postData("/admin/roles", {
        role_name: name,
        role_code: code,
        description: roleForm.description.trim() || undefined,
        ...(permission_codes.length > 0 ? { permission_codes } : {}),
      });
      toast.success("Role created successfully");
      navigate("/dashboard/rolemanagement");
    } catch (err: unknown) {
      const ax = err as {
        response?: {
          data?: {
            message?: string;
            invalid_permission_codes?: string[];
            hint?: string;
          };
        };
        message?: string;
      };
      const body = ax?.response?.data;
      const invalid = body?.invalid_permission_codes;
      let msg =
        body?.message ||
        ax?.message ||
        "Failed to create role. Please try again.";
      if (invalid?.length) {
        const sample = invalid.slice(0, 8).join(", ");
        msg = `${msg}: ${sample}${invalid.length > 8 ? "…" : ""}`;
      }
      if (body?.hint) {
        msg = `${msg} ${body.hint}`;
      }
      toast.error(msg);
    }
  };

  const renderPermissionRow = (label: string, value: any, path: string[]) => {
    // If value is boolean, it's a T/F permission
    if (typeof value === "boolean") {
      return (
        <div className="group flex items-center justify-between gap-4 rounded-xl border border-slate-200/90 bg-white px-4 py-3 shadow-sm transition-all hover:border-slate-300 hover:shadow-md">
          <span className="text-sm font-medium capitalize tracking-tight text-slate-800">
            {label.replace(/_/g, " ")}
          </span>
          <CrudToggle
            enabled={value}
            onClick={() => handlePermissionChange(path)}
            ariaLabel={`Toggle ${label.replace(/_/g, " ")}`}
          />
        </div>
      );
    }

    // If value is an object, it's a sub-group
    const isExpanded = expandedModules.includes(label);
    return (
      <div className="space-y-3 border-l-2 border-slate-200/70 ml-1 pl-5 py-1">
        <button
          type="button"
          onClick={() => toggleModule(label)}
          className="group flex w-full items-center gap-2.5 rounded-lg py-1 text-left text-sm font-medium text-slate-600 transition-colors hover:text-blue-700"
        >
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200/90 bg-slate-50 text-slate-500 transition-colors group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600 ${
              isExpanded ? "border-blue-200 bg-blue-50 text-blue-600" : ""
            }`}
          >
            {isExpanded ? (
              <FaChevronDown className="h-3 w-3" aria-hidden />
            ) : (
              <FaChevronRight className="h-3 w-3" aria-hidden />
            )}
          </span>
          <span className="capitalize">{label.replace(/_/g, " ")}</span>
        </button>
        {isExpanded && (
          <div className="grid grid-cols-1 gap-3 pt-1 md:grid-cols-2">
            {Object.entries(value).map(([subLabel, subValue]) => (
              <React.Fragment key={subLabel}>
                {renderPermissionRow(subLabel, subValue, [...path, subLabel])}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/40 pb-12">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-5">
          <div className="flex h-16 items-center justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                Create new role
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                Define identity and module access in one place.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard/rolemanagement")}
                disabled={isSubmitting}
                className="rounded-xl px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                Discard
              </Button>
              <Button
                variant="default"
                buttonType="add"
                className="h-10 rounded-xl px-5 text-sm font-semibold shadow-sm sm:h-10"
                onClick={handleCreate}
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Save Role
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-7xl px-4 sm:px-5">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Side: Basic Info */}
          <div className="space-y-6 lg:col-span-4">
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="mb-7 flex items-center gap-3 text-lg font-semibold tracking-tight text-slate-900">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <FaUserShield className="h-5 w-5" />
                </div>
                General information
              </h2>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="pl-0.5 text-sm font-medium text-slate-800">Role name</label>
                  <Input
                    placeholder="e.g. Finance reviewer"
                    value={roleForm.role_name}
                    onChange={(e) => setRoleForm({ ...roleForm, role_name: e.target.value })}
                    className="h-12 rounded-xl border border-slate-200 bg-slate-50/50 font-medium transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="pl-0.5 text-sm font-medium text-slate-800">System code</label>
                  <Input
                    placeholder="FINANCE_REVIEWER"
                    value={roleForm.role_code}
                    onChange={(e) => setRoleForm({ ...roleForm, role_code: e.target.value.toUpperCase().replace(/\s+/g, '_') })}
                    className="h-12 rounded-xl border border-slate-200 bg-slate-50/50 font-medium uppercase tracking-wide transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label className="pl-0.5 text-sm font-medium text-slate-800">Description</label>
                  <textarea
                    rows={4}
                    placeholder="Short summary of responsibilities and boundaries."
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-800 transition-all placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-800/20 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-8 text-white shadow-lg shadow-slate-900/15">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                  <FaShieldHalved className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight">Least privilege</h3>
                  <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
                    Access guidance
                  </p>
                </div>
              </div>
              <p className="mb-6 text-sm leading-relaxed text-slate-300">
                Grant only the operations this role needs. You can refine individual resources in the matrix.
              </p>
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="text-xs font-medium text-slate-200">Validation on save</span>
                <FaCircleCheck className="h-4 w-4 text-emerald-400" aria-hidden />
              </div>
            </div>
          </div>

          {/* Right Side: Permissions Matrix */}
          <div className="lg:col-span-8">
            <div className="min-h-fit overflow-hidden rounded-3xl border border-slate-200/80 bg-white pb-2 shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-100 bg-gradient-to-b from-slate-50/90 to-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-slate-900">Permission matrix</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Toggle modules below. Use <span className="font-medium text-slate-700">All actions</span> to select
                    every CRUD operation in a department.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 self-start rounded-full border border-blue-100 bg-blue-50/90 px-4 py-2 sm:self-center">
                  <FaKey className="h-3.5 w-3.5 text-blue-600" aria-hidden />
                  <span className="text-xs font-semibold tracking-tight text-blue-800">Live preview</span>
                </div>
              </div>

              <div className="custom-scrollbar max-h-[800px] space-y-8 overflow-y-auto px-4 pb-6 pt-6 sm:px-5">
                {Object.entries(permissionsMatrix).map(([moduleName, moduleValue]) => {
                  const allCrudOn = everyCrudLeaf(moduleValue);
                  const showBulkCrud = hasNestedCrud(moduleValue);
                  return (
                    <div key={moduleName} className="space-y-4">
                      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-slate-50/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold capitalize tracking-tight text-slate-900">
                              {moduleName.replace(/_/g, " ")}
                            </h3>
                            {showBulkCrud && (
                              <span
                                className={`
                                  rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider
                                  ${allCrudOn
                                    ? "border border-emerald-200/80 bg-emerald-50 text-emerald-800"
                                    : "border border-slate-200/80 bg-white text-slate-500"
                                  }
                                `}
                              >
                                {allCrudOn ? "Full CRUD" : "Partial"}
                              </span>
                            )}
                          </div>
                          {showBulkCrud && (
                            <p className="mt-1 text-xs text-slate-500">
                              Enable create, read, update, and delete for every resource in this area.
                            </p>
                          )}
                        </div>
                        {showBulkCrud && (
                          <div className="flex shrink-0 items-center gap-3 sm:border-l sm:border-slate-200/80 sm:pl-5">
                            <div className="hidden text-right sm:block">
                              <p className="text-xs font-medium text-slate-800">All actions</p>
                              <p className="text-[11px] text-slate-500">Create · Read · Update · Delete</p>
                            </div>
                            <CrudToggle
                              enabled={allCrudOn}
                              onClick={() => toggleAllCrudUnderDepartment(moduleName)}
                              ariaLabel={`Toggle all CRUD permissions for ${moduleName}`}
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4 pl-0.5">{renderPermissionRow(moduleName, moduleValue, [moduleName])}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRole;
