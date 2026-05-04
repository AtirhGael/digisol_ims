import { useState } from "react";
import { ChevronLeft, Save, User } from "lucide-react";
import { toast } from "sonner";
import { useFetchHook } from "../../Hooks/UseFetchHook";
import { usePost } from "../../Hooks/UsePostHook";
import { Button } from "../../components/ui/button";

// Types
interface Department {
  department_id: string;
  department_name: string;
  department_code: string;
}

interface Role {
  role_id: string;
  role_name: string;
  role_code: string;
  description: string;
}

interface NewUser {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  roles: string[];
  department_id: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_ACTIVATION';
}

// Styles
const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary/40 bg-white transition";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";
const errorCls = "text-red-500 text-xs mt-1";

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-6 ${className}`}>
      {children}
    </div>
  );
}

interface NewUserFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export function NewUserForm({ onCancel, onSuccess }: NewUserFormProps) {
  const [form, setForm] = useState<NewUser>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    roles: [],
    department_id: "",
    status: "PENDING_ACTIVATION"
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch departments and roles
  const { data: departmentsData, isLoading: departmentsLoading } = useFetchHook('/users/departments', 'departments');
  const { data: rolesData, isLoading: rolesLoading } = useFetchHook('/users/roles', 'roles');

  // Create user mutation
  const { postData: createUser, loading: creating } = usePost();

  const departments: Department[] = departmentsData?.data || [];
  const roles: Role[] = Array.isArray(rolesData?.data)
    ? rolesData?.data
    : Array.isArray(rolesData?.data?.roles)
      ? rolesData.data.roles
      : [];

  const handleFieldChange = (field: keyof NewUser, value: string | string[]) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleRoleChange = (roleCode: string, checked: boolean) => {
    setForm(prev => {
      const newRoles = checked
        ? [...prev.roles, roleCode]
        : prev.roles.filter(r => r !== roleCode);
      return { ...prev, roles: newRoles };
    });
    if (errors.roles) {
      setErrors(prev => ({ ...prev, roles: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!form.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.department_id) {
      newErrors.department_id = "Please select a department";
    }

    if (!form.roles.length) {
      newErrors.roles = "Select at least one role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the highlighted fields before submitting.");
      return;
    }

    try {
      const cleanedForm = {
        ...form,
        department_id: form.department_id || null,
        phone: form.phone || undefined,
        roles: form.roles,
      };

      await createUser("/users", cleanedForm);
      toast.success("User created successfully.");
      onSuccess();
    } catch (error: unknown) {
      const ax = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const msg =
        ax?.response?.data?.message ||
        ax?.message ||
        "Failed to create user. Please try again.";
      toast.error(msg);
    }
  };

  const isDataLoading = departmentsLoading || rolesLoading;

  return (
    <div className="flex flex-col gap-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-400">
        <button onClick={onCancel} className="hover:text-primary flex items-center gap-1 transition-colors">
          <ChevronLeft size={14} /> Users
        </button>
        <span>/</span>
        <span className="text-gray-700 font-medium">New User</span>
      </nav>

      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Create new user</h1>

      {isDataLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600">Loading form data...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2">
            <SectionCard>
              <div className="flex items-center gap-2 mb-6">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <h2 className="text-base font-semibold text-gray-800">User Information</h2>
              </div>
              
              <div className="space-y-6">
                {/* Personal Information */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className={labelCls}>First Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        placeholder="e.g. John" 
                        className={`${inputCls} ${errors.first_name ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''}`}
                        value={form.first_name} 
                        onChange={e => handleFieldChange("first_name", e.target.value)} 
                      />
                      {errors.first_name && <p className={errorCls}>{errors.first_name}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className={labelCls}>Last Name <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        placeholder="e.g. Doe" 
                        className={`${inputCls} ${errors.last_name ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''}`}
                        value={form.last_name} 
                        onChange={e => handleFieldChange("last_name", e.target.value)} 
                      />
                      {errors.last_name && <p className={errorCls}>{errors.last_name}</p>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className={labelCls}>Email Address <span className="text-red-500">*</span></label>
                    <input 
                      type="email" 
                      placeholder="e.g. john.doe@company.com" 
                      className={`${inputCls} ${errors.email ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''}`}
                      value={form.email} 
                      onChange={e => handleFieldChange("email", e.target.value)} 
                    />
                    {errors.email && <p className={errorCls}>{errors.email}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className={labelCls}>Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. +237 123 456 789" 
                      className={inputCls}
                      value={form.phone} 
                      onChange={e => handleFieldChange("phone", e.target.value)} 
                    />
                  </div>
                </section>

                {/* Work Information */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Work Information</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className={labelCls}>Department <span className="text-red-500">*</span></label>
                      <select 
                        className={`${inputCls} ${errors.department_id ? 'border-red-300 focus:border-red-300 focus:ring-red-200' : ''}`}
                        value={form.department_id} 
                        onChange={e => handleFieldChange("department_id", e.target.value)}
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept.department_id} value={dept.department_id}>
                            {dept.department_name}
                          </option>
                        ))}
                      </select>
                      {errors.department_id && <p className={errorCls}>{errors.department_id}</p>}
                    </div>

                    <div className="space-y-3">
                      <label className={labelCls}>Roles <span className="text-red-500">*</span></label>
                      <div className={`space-y-2 ${errors.roles ? "rounded-lg border border-red-200 bg-red-50/50 p-3" : ""}`}>
                        {roles.map(role => (
                          <label key={role.role_id} className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={form.roles.includes(role.role_code)}
                              onChange={e => handleRoleChange(role.role_code, e.target.checked)}
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-700">{role.role_name}</span>
                              {role.description && <p className="text-xs text-gray-500">{role.description}</p>}
                            </div>
                          </label>
                        ))}
                      </div>
                      {errors.roles && <p className={errorCls}>{errors.roles}</p>}
                    </div>
                  </div>
                </section>

                {/* Security Notice */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Security Information</h3>
                  
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                        <User size={12} className="text-blue-600" />
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-blue-800">Temporary Password Policy</p>
                        <p className="text-blue-700 mt-1">
                          The user will receive an auto-generated temporary password sent to their email.
                          They must use it to log in, and will be prompted to change it on their first login.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <Button variant="outline" onClick={onCancel} disabled={creating}>Cancel</Button>
                <Button variant="default" onClick={handleSubmit} disabled={creating} loading={creating}>
                  <Save size={13} /> Create User
                </Button>
              </div>
            </SectionCard>
          </div>

          {/* Right Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Status */}
            <SectionCard>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Status</h3>
                
                <div className="space-y-1">
                  <label className={labelCls}>User Status</label>
                  <select 
                    className={inputCls} 
                    value={form.status} 
                    onChange={e => handleFieldChange("status", e.target.value)}
                  >
                    <option value="PENDING_ACTIVATION">Pending Activation</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Pending Activation:</strong> User needs to activate account
                  </p>
                  <p className="text-sm text-blue-800 mt-1">
                    <strong>Active:</strong> User can log in and access the system
                  </p>
                  <p className="text-sm text-blue-800 mt-1">
                    <strong>Inactive:</strong> User account is disabled
                  </p>
                </div>
              </div>
            </SectionCard>

            {/* Quick Info */}
            <SectionCard>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Quick Info</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Username:</span>
                    <span className="font-medium">
                      {form.first_name && form.last_name 
                        ? `${form.first_name} ${form.last_name}` 
                        : 'Auto-generated'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Selected Roles:</span>
                    <span className="font-medium">{form.roles.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium">
                      {departments.find(d => d.department_id === form.department_id)?.department_name || 'None'}
                    </span>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
}