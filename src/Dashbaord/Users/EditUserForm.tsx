import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Save, User, Plus, Upload } from "lucide-react";
import { useFetchHook } from "../../Hooks/UseFetchHook";
import { useUpdate } from "../../Hooks/UseUpdateHook";
import { Button } from "../../components/ui/button";
import { useUserStore } from "../../Store/UserStore";
import { toast } from "sonner";
import SkeletonLoading from "../../components/other/Loader/SkeletonLoading/SkeletonLoading";

// Types
interface UserRole {
  id: string;
  name: string;
  code: string;
  is_primary: boolean;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface UserProps {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_ACTIVATION';
  department: Department | null;
  roles: UserRole[];
  created_at: string;
  updated_at: string;
  avatar_url?: string;
}

interface EditUser {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department_id: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_ACTIVATION';
}

interface UserRolesUpdate {
  roles: string[];
  primary_role?: string;
}

// Types for role/department data
interface DepartmentOption {
  department_id: string;
  department_name: string;
  department_code: string;
}

interface RoleOption {
  role_id: string;
  role_name: string;
  role_code: string;
  description: string;
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

interface EditUserFormProps {
  user: UserProps;
  onCancel: () => void;
  onSuccess: () => void;
}

export function EditUserForm({ user, onCancel, onSuccess }: EditUserFormProps) {
  const [form, setForm] = useState<EditUser>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    department_id: "",
    status: "PENDING_ACTIVATION"
  });

  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [primaryRole, setPrimaryRole] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showRoleUpdate, setShowRoleUpdate] = useState(false);

  // Fetch departments and roles
  const { data: departmentsData, isLoading: departmentsLoading } = useFetchHook('/users/departments', 'departments');
  const { data: rolesData, isLoading: rolesLoading } = useFetchHook('/users/roles', 'roles');

  // Update mutations
  const { updateData: updateUser, loading: updating, error: updateError } = useUpdate();
  const { updateData: updateRoles, loading: updatingRoles, error: rolesError } = useUpdate();

  // Avatar upload state
  const avatarFileRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const accessToken = useUserStore((s) => s.accessToken);

  const departments: DepartmentOption[] = departmentsData?.data || [];
  const roles: RoleOption[] = rolesData?.data || [];


  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone || "",
        department_id: user.department?.id || "",
        status: user.status
      });

      setUserRoles(user.roles.map(r => r.code));
      setPrimaryRole(user.roles.find(r => r.is_primary)?.code || user.roles[0]?.code || "");
    }
  }, [user]);

  const handleFieldChange = (field: keyof EditUser, value: string) => {
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload to backend
    setUploadingAvatar(true);
    try {
      const baseURL = import.meta.env.VITE_BASE_URL || "http://localhost:4000";
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", user.user_id);

      const res = await fetch(`${baseURL}/users/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Profile picture updated successfully");
      } else {
        toast.error(json.message || "Failed to upload profile picture");
        setAvatarPreview(null);
      }
    } catch {
      toast.error("Failed to upload profile picture");
      setAvatarPreview(null);
    } finally {
      setUploadingAvatar(false);
      // Reset input so same file can be re-selected
      if (avatarFileRef.current) avatarFileRef.current.value = "";
    }
  };

  const handleRoleChange = (roleCode: string, checked: boolean) => {
    setUserRoles(prev => {
      const newRoles = checked 
        ? [...prev, roleCode]
        : prev.filter(r => r !== roleCode);
      
      // Ensure at least one role is selected
      const finalRoles = newRoles.length === 0 ? ["STAFF_MEMBER"] : newRoles;
      
      // Update primary role if current primary is removed
      if (!checked && primaryRole === roleCode && finalRoles.length > 0) {
        setPrimaryRole(finalRoles[0]);
      }
      
      return finalRoles;
    });
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateUser = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      // Clean the form data before submitting
      const cleanedForm = {
        ...form,
        department_id: form.department_id || null, // Convert empty string to null
        phone: form.phone || undefined // Remove empty phone
      };
      
      await updateUser(`/users/${user.user_id}`, cleanedForm);
      
      if (showRoleUpdate) {
        await handleUpdateRoles();
      } else {
        onSuccess();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleUpdateRoles = async () => {
    try {
      // Allow all roles as selected by the user
      let cleanedRoles = userRoles;
      // Ensure at least one role exists
      if (cleanedRoles.length === 0) {
        cleanedRoles = ['STAFF_MEMBER'];
      }
      const roleData: UserRolesUpdate = {
        roles: cleanedRoles
      };
      // Only include primary_role if it's not empty and is in the selected roles
      if (primaryRole && cleanedRoles.includes(primaryRole)) {
        roleData.primary_role = primaryRole;
      }
      await updateRoles(`/users/${user.user_id}/roles`, roleData);
      onSuccess();
    } catch (error) {
      console.error('Error updating roles:', error);
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
        <span className="text-gray-700 font-medium">Edit User</span>
      </nav>

      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Edit User Information</h1>

      {/* Error Display */}
      {(updateError || rolesError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">
            {updateError || rolesError || "An error occurred while updating the user"}
          </p>
        </div>
      )}

      {isDataLoading ? (
        <SkeletonLoading />
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
                      <label className={labelCls}>Department</label>
                      <select 
                        className={inputCls}
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
                    </div>

                    {/* Role Management */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-700">Role Management</h4>
                        <button
                          type="button"
                          onClick={() => setShowRoleUpdate(!showRoleUpdate)}
                          className="text-sm text-primary hover:text-primary-dark underline"
                        >
                          {showRoleUpdate ? 'Hide' : 'Edit Roles'}
                        </button>
                      </div>

                      {!showRoleUpdate ? (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 mb-2">Current Roles:</p>
                          <div className="flex flex-wrap gap-2">
                            {user.roles.map(role => (
                              <span
                                key={role.id}
                                className={`px-2 py-1 rounded text-xs ${
                                  role.is_primary
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-200 text-gray-700'
                                }`}
                              >
                                {role.name} {role.is_primary && '(Primary)'}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            {roles
                              .map(role => (
                              <label key={role.role_id} className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={userRoles.includes(role.role_code)}
                                  onChange={e => handleRoleChange(role.role_code, e.target.checked)}
                                  className="rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <div className="flex-1">
                                  <span className="text-sm font-medium text-gray-700">{role.role_name}</span>
                                  {role.description && <p className="text-xs text-gray-500">{role.description}</p>}
                                </div>
                                {userRoles.length > 1 && userRoles.includes(role.role_code) && (
                                  <label className="flex items-center gap-1 text-xs text-gray-500">
                                    <input
                                      type="radio"
                                      name="primaryRole"
                                      value={role.role_code}
                                      checked={primaryRole === role.role_code}
                                      onChange={() => setPrimaryRole(role.role_code)}
                                      className="text-primary focus:ring-primary"
                                    />
                                    Primary
                                  </label>
                                )}
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Security Information */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Security Information</h3>
                  
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Password cannot be changed from this form. Please use the password reset feature or contact an administrator to change the user's password.
                    </p>
                  </div>
                </section>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <Button variant="outline" onClick={onCancel} disabled={updating || updatingRoles}>Cancel</Button>
                <Button variant="default" onClick={handleUpdateUser} disabled={updating || updatingRoles} loading={updating || updatingRoles}>
                  <Save size={13} /> Update User
                </Button>
              </div>
            </SectionCard>
          </div>

          {/* Right Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Profile Picture */}
            <SectionCard>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Profile Picture</h3>
                
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-gray-200 border-4 border-gray-200 flex items-center justify-center overflow-hidden">
                    {avatarPreview || user.avatar_url ? (
                      <img 
                        src={avatarPreview || user.avatar_url} 
                        alt={`${user.first_name} ${user.last_name}`}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <User size={32} className="text-gray-400" />
                    )}
                  </div>
                  
                  <input
                    ref={avatarFileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => avatarFileRef.current?.click()}
                    disabled={uploadingAvatar}
                    loading={uploadingAvatar}
                  >
                    <Upload size={14} />
                    {uploadingAvatar ? "Uploading..." : "Change Photo"}
                  </Button>
                </div>
              </div>
            </SectionCard>

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
          </div>
        </div>
      )}

      {/* User Details - Full width horizontal section */}
      <SectionCard>
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-500" />
          <h2 className="text-base font-semibold text-gray-800">User Details</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">User ID</label>
            <p className="text-sm text-gray-700 font-mono mt-1">{user.user_id}</p>
          </div>
          
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Username</label>
            <p className="text-sm text-gray-700 mt-1">{user.username}</p>
          </div>
          
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Created On</label>
            <p className="text-sm text-gray-700 mt-1">{new Date(user.created_at).toLocaleDateString('en-GB')}</p>
          </div>
          
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wider">Last Modified</label>
            <p className="text-sm text-gray-700 mt-1">{new Date(user.updated_at).toLocaleDateString('en-GB')}</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}