import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaSave, FaShieldAlt, FaUserShield, FaInfoCircle } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useFetchHook from "@/Hooks/UseFetchHook";
import usePatchHook from "@/Hooks/usePatchHook";
import SkeletonLoading from "@/components/other/Loader/SkeletonLoading/SkeletonLoading";

const EditRole = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [roleForm, setRoleForm] = useState({
    role_name: "",
    role_code: "",
    description: "",
    permission_ids: [] as string[]
  });

  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  // Fetch all permissions for the selection grid
  const { data: allPermissionsData, isLoading: allPermissionsLoading } = useFetchHook("admin/permissions", "all-permissions");
  
  // Fetch specific role data
  const { data: roleData, isLoading: isFetching } = useFetchHook(`admin/roles/${id}`, `role-${id}`);

  // Setup patch hook
  const { mutate: updateRole, isLoading: isUpdating } = usePatchHook("admin/roles", "put", [`role-${id}`, "roles"], {
    onSuccess: () => {
      showToast("Role updated successfully!", "success");
    },
    onError: (err: any) => {
      showToast(err.response?.data?.message || "Failed to update role", "error");
    }
  });

  useEffect(() => {
    if (roleData?.data?.role) {
      const { role_name, role_code, description, permissions } = roleData.data.role;
      setRoleForm({
        role_name: role_name || "",
        role_code: role_code || "",
        description: description || "",
        permission_ids: permissions?.map((p: any) => p.permission_id) || []
      });
    }
  }, [roleData]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 5000);
  };

  // Group permissions by module and resource type
  const togglePermission = (permissionId: string) => {
    setRoleForm(prev => {
      const isSelected = prev.permission_ids.includes(permissionId);
      return {
        ...prev,
        permission_ids: isSelected 
          ? prev.permission_ids.filter(id => id !== permissionId)
          : [...prev.permission_ids, permissionId]
      };
    });
  };

  const groupedPermissions = allPermissionsData?.data?.permissions?.reduce((acc: any, permission: any) => {
    const moduleName = permission.module || "General";
    if (!acc[moduleName]) acc[moduleName] = [];
    acc[moduleName].push(permission);
    return acc;
  }, {}) || {};

  const formatModule = (module: string) => {
    return module.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare data based on backend requirements
    const payload = {
      role_name: roleForm.role_name,
      description: roleForm.description,
      permission_ids: roleForm.permission_ids
    };

    updateRole({ id, data: payload });
  };

  if (isFetching) return <SkeletonLoading />;

  return (
    <div className="mx-auto scrollbar-hide animate-in fade-in duration-500">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-[9999] p-4 rounded-xl shadow-2xl max-w-sm w-full transition-all duration-300 transform translate-x-0 ${
            toast.type === "success" ? "bg-white border-l-4 border-green-500" : "bg-white border-l-4 border-red-500"
          }`}
        >
          <div className="flex items-center">
            <div className={`p-2 rounded-full mr-3 ${toast.type === "success" ? "bg-green-100" : "bg-red-100"}`}>
              {toast.type === "success" ? (
                <FaSave className="text-green-600 text-sm" />
              ) : (
                <FaInfoCircle className="text-red-600 text-sm" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{toast.type === "success" ? "Success" : "Error"}</p>
              <p className="text-xs text-gray-500">{toast.message}</p>
            </div>
            <button onClick={() => setToast({ ...toast, show: false })} className="ml-4 text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </div>
      )}

      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Edit System Role</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded tracking-wider border border-blue-100">
                Administration
              </span>
              <span className="text-sm text-gray-400">•</span>
              <p className="text-sm text-gray-500 font-medium">Configure roles and permissions</p>
            </div>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)} disabled={isUpdating}>
            Discard Changes
          </Button>
          <Button onClick={handleUpdate} disabled={isUpdating} className="shadow-lg shadow-blue-200">
            {isUpdating ? "Saving..." : (
              <span className="flex items-center gap-2">
                <FaSave /> Save Role
              </span>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleUpdate} className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
            <div className="p-6 sm:p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Role Name</label>
                  <Input
                    type="text"
                    value={roleForm.role_name}
                    onChange={(e) => setRoleForm({ ...roleForm, role_name: e.target.value })}
                    placeholder="e.g. Administrator"
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                    required
                  />
                  <p className="text-[11px] text-gray-400 ml-1 italic">The display name used across the system.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Unique Role Code</label>
                  <Input
                    type="text"
                    value={roleForm.role_code}
                    placeholder="e.g. ADMIN_MASTER"
                    className="h-12 border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed font-mono"
                    disabled
                  />
                  <p className="text-[11px] text-gray-400 ml-1 italic">Role identifiers cannot be modified.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <FaShieldAlt className="text-white text-sm" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Permissions Matrix</h3>
                    <p className="text-[11px] text-gray-500">Toggle capabilities for this role</p>
                  </div>
                </div>

                {/* show permissions */}
                <div className="min-h-[200px] pt-4">
                  {allPermissionsLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-xs font-medium text-gray-500 animate-pulse">Loading permissions matrix...</p>
                    </div>
                  ) : (
                    <div className="space-y-8 max-h-[600px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-gray-200">
                      {Object.entries(groupedPermissions).map(([moduleName, permissions]: [string, any]) => (
                        <div key={moduleName} className="space-y-4">
                          <div className="flex items-center gap-4">
                            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded">
                              {formatModule(moduleName)}
                            </h4>
                            <div className="h-[1px] bg-gray-100 flex-1"></div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {permissions.map((permission: any) => {
                              const isSelected = roleForm.permission_ids.includes(permission.permission_id);
                              return (
                                <div 
                                  key={permission.permission_id}
                                  onClick={() => togglePermission(permission.permission_id)}
                                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group ${
                                    isSelected 
                                      ? "bg-blue-50 border-blue-200 shadow-sm" 
                                      : "bg-white border-gray-100 hover:border-blue-200"
                                  }`}
                                >
                                  <div className="flex flex-col gap-0.5">
                                    <span className={`text-[12px] font-bold ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                                      {permission.resource_type?.replace(/_/g, ' ') || "General"}
                                    </span>
                                    <span className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">
                                      {permission.action}
                                    </span>
                                  </div>
                                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                                    isSelected 
                                      ? "bg-blue-600 border-blue-600" 
                                      : "bg-white border-gray-200 group-hover:border-blue-300"
                                  }`}>
                                    {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Right Column - Status/Context */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50 p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Role Overview
            </h3>
            
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                  <FaUserShield className="text-gray-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Assigned Permissions</p>
                  <p className="text-sm font-semibold text-gray-700 truncate">{roleForm.permission_ids.length} Active</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                  <FaSave className="text-gray-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Role Status</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {roleData?.data?.role?.is_system_role ? "System Protected" : "Customizable"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">System Status</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-gray-600">Active Role</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRole;
