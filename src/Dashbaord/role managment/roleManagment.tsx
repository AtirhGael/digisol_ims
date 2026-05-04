import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserShield,
  FaUsers,
  FaKey,
  FaTriangleExclamation,
} from "react-icons/fa6";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { useAuth } from "../../Hooks/useAuth";
import { useFetchHook } from "../../Hooks/UseFetchHook";
import { usePost } from "../../Hooks/UsePostHook";
import { useDeleteHook } from "../../Hooks/UseDeleteHook";
import { useUserStore } from "../../Store/UserStore";
import SkeletonLoading from "../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import ReusableTable from "../../components/other/ReusableTable/ReusableTable";
import { Card } from "../../components/other/Card";
import { Button } from "@/components/ui/button";

import { getRoleColumns, Role, Permission } from "../../components/Columns/RoleColumns";

// Group permissions by module
interface ModuleGroup {
  moduleName: string;
  permissions: Permission[];
}

const formatModule = (m: string) =>
  m.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const RoleManagement = () => {
  const navigate = useNavigate();
  const { accessToken, isLoading: authLoading } = useAuth();
  const storeRoles = useUserStore((state) => state.roles);
  const storePermissions = useUserStore((state) => state.permissions);

  const checkPermission = (action: string) => {
    if (storeRoles.includes("SUPER_ADMIN")) return true;
    return storePermissions.some(
      (p) =>
        p.module === "admin" &&
        p.resource_type === "roles" &&
        p.action === action,
    );
  };

  // Data fetching with custom hooks
  const {
    data: rolesData,
    isLoading: rolesLoading,
    refetch: refetchRoles,
  } = useFetchHook("/admin/roles", "roles", { enabled: !!accessToken });

  const {
    data: permissionsData,
    isLoading: permissionsLoading,
    refetch: refetchPermissions,
  } = useFetchHook("/admin/permissions", "permissions", {
    enabled: !!accessToken,
  });

  // CRUD operations hooks
  const { isLoading: isDeleting, mutate: deleteRole } = useDeleteHook(
    "/admin/roles",
    ["roles"],
    {
      onSuccess: () => {
        showToast("Role deleted successfully!", "success");
        refetchRoles();
      },
      onError: (error: any) => {
        showToast(
          error?.response?.data?.message || "Failed to delete role",
          "error",
        );
      },
    },
  );
  const { loading: permissionLoading, postData: assignPermissions } = usePost();

  // Extract data from API responses
  const roles: Role[] = rolesData?.data?.roles || [];
  const permissions: Permission[] = permissionsData?.data?.permissions || [];

  const [showLoader, setShowLoader] = useState(true);
  const loadStartRef = useRef<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [isDeleteRoleOpen, setIsDeleteRoleOpen] = useState(false);

  // Permission assignments (for Assign Permissions modal)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Toast notification state
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  // Toast utility function
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      5000,
    );
  };

  // Hide toast
  const hideToast = () => {
    setToast({ show: false, message: "", type: "success" });
  };

  const isDataLoading = rolesLoading || permissionsLoading;

  useEffect(() => {
    if (isDataLoading) {
      if (loadStartRef.current === null) {
        loadStartRef.current = Date.now();
      }
      setShowLoader(true);
      return;
    }

    if (loadStartRef.current === null) {
      setShowLoader(false);
      return;
    }

    const elapsed = Date.now() - loadStartRef.current;
    const remaining = Math.max(0, 2000 - elapsed);
    const timer = window.setTimeout(() => {
      setShowLoader(false);
      loadStartRef.current = null;
    }, remaining);

    return () => window.clearTimeout(timer);
  }, [isDataLoading]);

  // Group permissions by module
  const groupedPermissions: ModuleGroup[] = Array.isArray(permissions)
    ? permissions
      .reduce((groups: ModuleGroup[], permission) => {
        const moduleName = permission.module || "other";
        const existing = groups.find((g) => g.moduleName === moduleName);
        if (existing) {
          existing.permissions.push(permission);
        } else {
          groups.push({ moduleName, permissions: [permission] });
        }
        return groups;
      }, [])
      .sort((a, b) => a.moduleName.localeCompare(b.moduleName))
    : [];

  const handleDeleteRole = async (roleId: string) => {
    deleteRole(roleId);
  };

  const handleAssignPermissions = async () => {
    if (!selectedRole) return;

    try {
      const result = await assignPermissions(
        `/admin/roles/${selectedRole.role_id}/permissions`,
        {
          permission_ids: selectedPermissions,
        },
      );

      if (result.success) {
        setIsPermissionModalOpen(false);
        setSelectedPermissions([]);
        setSelectedRole(null);
        showToast("Permissions updated successfully!", "success");
        refetchRoles();
      } else {
        showToast(result.message || "Failed to assign permissions", "error");
      }
    } catch (error: any) {
      showToast(
        error?.response?.data?.message || "Failed to assign permissions",
        "error",
      );
    }
  };

  const requestDeleteRole = (role: Role) => {
    setRoleToDelete(role);
    setIsDeleteRoleOpen(true);
  };

  const confirmDeleteRole = () => {
    if (!roleToDelete) return;
    handleDeleteRole(roleToDelete.role_id);
    setIsDeleteRoleOpen(false);
    setRoleToDelete(null);
  };

  const handleOpenCreateModal = () => {
    if (!checkPermission("CREATE")) {
      navigate("/dashboard/unauthorized");
      return;
    }
    navigate("/dashboard/rolemanagement/create");
  };

  const openEditModal = (role: Role) => {
    if (!checkPermission("UPDATE")) {
      navigate("/dashboard/unauthorized");
      return;
    }
    navigate(`/dashboard/rolemanagement/edit/${role.role_id}`);
  };

  const openViewModal = (role: Role) => {
    navigate(`/dashboard/rolemanagement/view/${role.role_id}`);
  };

  const openPermissionModal = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions?.map((p) => p.permission_id) || []);
    setIsPermissionModalOpen(true);
  };

  const totalUsers = roles.reduce(
    (total, role) => total + (role.user_count || 0),
    0,
  );

  const roleColumns = getRoleColumns(
    openViewModal,
    openEditModal,
    requestDeleteRole
  );

  // Show loading state if authentication is still loading
  if (authLoading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-3xl border border-gray-100 p-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-gray-500">Loading authentication...</div>
          </div>
        </div>
      </div>
    );
  }

  if (showLoader) {
    return <SkeletonLoading />;
  }

  return (
    <div className="min-h-screen">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm w-full transition-all duration-300 ${toast.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
            }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={hideToast}
              className="ml-3 text-white hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      
      <div className="min-h-full font-sans">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 m-0">
              Role Management
            </h1>
            <p className="text-sm text-gray-500 mt-1 mb-0">
              Manage system roles and permissions for user access control
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="default"
              buttonType="add"
              className="w-full sm:w-auto"
              onClick={handleOpenCreateModal}
            >
              Create Role
            </Button>
          </div>
        </div>

        {/* cards */}
        <div className="mb-6 mt-10 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <Card
            heading="Total Roles"
            amount={roles.length.toString()}
            icons={<FaUserShield size={18} className="text-white" />}
            textColor="#3b82f6"
            iconBackgroundColor="#3b82f6"
          />
          <Card
            heading="Permissions"
            amount={permissions.length.toString()}
            icons={<FaKey size={18} className="text-white" />}
            textColor="#10b981"
            iconBackgroundColor="#10b981"
          />
          <Card
            heading="Total Users"
            amount={totalUsers.toString()}
            icons={<FaUsers size={18} className="text-white" />}
            textColor="#8b5cf6"
            iconBackgroundColor="#8b5cf6"
          />
        </div>

        <ReusableTable
          heading="System Roles"
          data={roles}
          columns={roleColumns}
          searchKeys={["role_name", "role_code", "description"]}
          showFilter={false}
        />
      </div>

      {/* Delete Role Confirm */}
      <Dialog open={isDeleteRoleOpen} onOpenChange={setIsDeleteRoleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <FaTriangleExclamation className="text-red-600 text-lg" />
              </div>
              <span>Delete Role</span>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600">
              Are you sure you want to delete the role{" "}
              <span className="font-semibold text-gray-900">
                "{roleToDelete?.role_name}"
              </span>
              ?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This action cannot be undone and will remove all role assignments
              from users.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteRoleOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteRole}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                "Delete Role"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>



      {/* Permission Assignment Modal */}
      <Dialog
        open={isPermissionModalOpen}
        onOpenChange={setIsPermissionModalOpen}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Manage Permissions - {selectedRole?.role_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="text-sm text-gray-600">
              Select the permissions that users with this role should have
              access to.
            </div>

            {groupedPermissions.map((group) => (
              <div
                key={group.moduleName}
                className="border border-gray-200 rounded-lg p-4"
              >
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FaUserShield className="text-blue-500 text-sm" />
                  {formatModule(group.moduleName)}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {group.permissions.map((permission) => (
                    <label
                      key={permission.permission_id}
                      className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(
                          permission.permission_id,
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPermissions((prev) => [
                              ...prev,
                              permission.permission_id,
                            ]);
                          } else {
                            setSelectedPermissions((prev) =>
                              prev.filter(
                                (id) => id !== permission.permission_id,
                              ),
                            );
                          }
                        }}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">
                          {permission.permission_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {permission.description}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {permission.action}
                          </span>
                          <span className="text-gray-400">
                            • {permission.module}
                          </span>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={handleAssignPermissions}
                className="flex-1"
                disabled={permissionLoading}
              >
                {permissionLoading ? "Updating..." : "Update Permissions"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsPermissionModalOpen(false)}
                className="flex-1"
                disabled={permissionLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
