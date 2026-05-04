import { useParams, useNavigate } from "react-router-dom";
import { FaShieldAlt, FaUserShield } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import useFetchHook from "@/Hooks/UseFetchHook";
import SkeletonLoading from "@/components/other/Loader/SkeletonLoading/SkeletonLoading";

interface Permission {
  permission_id: string;
  permission_name: string;
  module: string;
  action: string;
  resource_type?: string;
}

interface Role {
  role_id: string;
  role_name: string;
  role_code: string;
  description: string;
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
  permissions: Permission[];
}

const ViewRole = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // fetch data here
  const { data, isLoading, isError, error } = useFetchHook(`admin/roles/${id}`, `role-${id}`)
  
  // isloading screen
  if (isLoading) {
    return (<SkeletonLoading />)
  }

  // error screen
  if (isError) {
    return (<div className="flex items-center justify-center h-screen"><p>Error loading role</p></div>)
  }

  // Group permissions by module and resource type
  const permissions = data?.data?.role?.permissions || [];
  
  const groupedPermissions = permissions.reduce((acc: any, permission: any) => {
    const moduleName = permission.module || "General";
    const resourceName = permission.resource_type || "General";
    
    if (!acc[moduleName]) acc[moduleName] = {};
    if (!acc[moduleName][resourceName]) acc[moduleName][resourceName] = [];
    
    // Store only the action, avoiding duplicates
    if (!acc[moduleName][resourceName].includes(permission.action)) {
      acc[moduleName][resourceName].push(permission.action);
    }
    return acc;
  }, {});

  const formatModule = (module: string) => {
    return module.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  return (
    <div className="max-w-5xl mx-auto scrollbar-hide animate-in fade-in duration-500">
      {/* Header section */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* <button 
            onClick={() => navigate("/dashboard/rolemanagement")}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-all shadow-sm group"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          </button> */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded tracking-wider border ${
                data?.data?.role?.is_system_role ? "bg-purple-50 text-purple-700 border-purple-100" : "bg-blue-50 text-blue-700 border-blue-100"
              }`}>
                {data?.data?.role?.is_system_role ? "System Role" : "Custom Role"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{data?.data?.role?.role_name}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate(`/dashboard/rolemanagement/edit/${id}`)}>
            Edit Role
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Left Column - Role Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50 p-3">
            <h3 className="text-base font-semibold mb-6">Information</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold mb-1">Role Code</p>
                <p className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
                  {data?.data?.role.role_code}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold mb-1 text-wrap">Description</p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {data?.data?.role.description || "No description provided for this role."}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-50 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                    <FaUserShield className="text-gray-500 text-xs" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-gray-500">System role</p>
                    <p className="text-[12px] font-semibold text-gray-700">
                      {data?.data?.role?.is_system_role ? "true" : "false"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Permissions */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <FaShieldAlt className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Permissions Matrix</h2>
                  <p className="text-xs text-gray-500 font-medium">All capabilities currently assigned to this role</p>
                </div>
              </div>
              <div className="bg-white px-3 py-1 rounded-full border border-gray-200">
                <span className="text-xs font-bold text-blue-600">{data?.data?.role?.permissions.length} Total</span>
              </div>
            </div>

            <div className="p-4 sm:p-8">
              <div className="space-y-8">
                {Object.entries(groupedPermissions).map(([moduleName, resources]: [string, any]) => (
                  <div key={moduleName} className="relative">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-[1px] bg-gray-200 flex-1"></div>
                      <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] px-2 bg-white">
                        {formatModule(moduleName)}
                      </h4>
                      <div className="h-[1px] bg-gray-200 flex-1"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(resources).map(([resourceName, actions]: [string, any]) => (
                        <div 
                          key={resourceName}
                          className="bg-white border border-gray-100 rounded-xl p-4 hover:border-blue-200 hover:shadow-md transition-all duration-300 group"
                        >
                          <div className="flex flex-col gap-3">
                            <span className="text-[13px] font-bold text-gray-800 group-hover:text-blue-600 transition-colors uppercase">
                              {resourceName.replace(/_/g, ' ')}
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {actions.map((action: string) => (
                                <span key={action} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${
                                  action === "READ" ? "bg-emerald-100 text-emerald-700" :
                                  action === "CREATE" ? "bg-blue-100 text-blue-700" :
                                  action === "UPDATE" ? "bg-amber-100 text-amber-700" :
                                  action === "DELETE" ? "bg-rose-100 text-rose-700" :
                                  "bg-gray-100 text-gray-700"
                                }`}>
                                  {action}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRole;
