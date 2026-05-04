import { useState, useEffect } from "react";
import { Button } from "../../../../components/ui/button";
import { Field, SelectField, TextAreaField, inputCls, SectionCard } from "./DepartmentForm.shared";
import type { Department, DepartmentFormData } from "../types";
import { useFetchHook } from "../../../../Hooks/UseFetchHook";
import { usePost } from "../../../../Hooks/UsePostHook";
import { toast } from "sonner";

interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  status: string;
}

interface DepartmentFormProps {
  department?: Department;
  onSave: (data: DepartmentFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function DepartmentForm({
  department,
  onSave,
  onCancel,
  loading = false,
}: DepartmentFormProps) {
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: "",
    code: "",
    description: "",
    department_head_id: "",
    parent_department_id: "",
    contact_email: "",
    contact_phone: "",
    budget: "",
    location: "",
    status: "ACTIVE",
  });

  const [errors, setErrors] = useState<Partial<DepartmentFormData>>({});


  const { postData, loading: postLoading, error: postError } = usePost();

  
  // Fetch Users
  const { data: userData, isLoading: loadingUsers } = useFetchHook<{
    data: { users: User[] };
  }>("/users", "activeUsers");

  // Fetch Departments  
  const { data: deptData, isLoading: loadingDepts } = useFetchHook<{
    data: { departments: Department[] };
  }>("/departments", "activeDepartments");

  const users = userData?.data?.users || [];
  const rawDepartments = deptData?.data?.departments || [];
  
  console.log('Department data:', { deptData, rawDepartments });
  
  const departments = department?.department_id
    ? rawDepartments.filter((d) => d.department_id !== department.department_id)
    : rawDepartments;

  const loadingData = loadingUsers || loadingDepts;
  const isCreating = !department; 
  const isSubmitting = loading || postLoading;

  // --- 2. EFFECTS ---

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || "",
        code: department.code || "",
        description: department.description || "",
        department_head_id: department.department_head_id || "",
        parent_department_id: department.parent_department_id || "",
        contact_email: department.contact_email || "",
        contact_phone: department.contact_phone || "",
        budget: department.budget_allocation?.toString() || "",
        location: department.location || "",
        status: department.status || "ACTIVE",
      });
    }
  }, [department]);

  // --- 3. HANDLERS ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Partial<DepartmentFormData> = {};

    if (!formData.name.trim()) newErrors.name = "Department name is required";
    if (!formData.code.trim()) newErrors.code = "Department code is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (formData.budget && isNaN(Number(formData.budget))) newErrors.budget = "Budget must be a valid number";
    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = "Invalid email format";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error("Validation Error", {
        description: firstError || "Please fix the highlighted fields.",
        duration: 5000,
      });
      return;
    }

    try {
      if (isCreating) {
        // Creating a new department - use POST hook
        const payload = {
          name: formData.name.trim(),
          code: formData.code.trim().toUpperCase(),
          description: formData.description.trim(),
          department_head_id: formData.department_head_id || null,
       
        };

         console.log("this is the data to be sent to the backend: ", payload);
        const response = await postData("/departments", payload);
        
        toast.success(
          `Department "${formData.name}" has been created successfully!`,
          {
            description: "You can now assign employees to this department.",
            duration: 5000,
          }
        );
        
        onCancel(); 
      } else {
        try {
          await onSave(formData);
          toast.success(
            `Department "${formData.name}" has been updated successfully!`,
            {
              description: "Changes have been saved.",
              duration: 4000,
            }
          );
        } catch (editError: any) {
          const editErrorMessage = editError.response?.data?.message || 
                                   editError.response?.data?.error || 
                                   editError.message || 
                                   "Failed to update department. Please try again.";
          toast.error(editErrorMessage, {
            description: "Please check your input and try again.",
            duration: 6000,
          });
          throw editError; 
        }
      }
    } catch (error: any) {
      let errorTitle = "Operation Failed";
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      if (error.response?.status === 409) {
        errorTitle = "Department Already Exists";
        errorMessage = "A department with this name or code already exists.";
      } else if (error.response?.status === 400) {
        errorTitle = "Invalid Information";
        errorMessage = error.response?.data?.message || "Please check your input and try again.";
      } else if (error.response?.status === 403) {
        errorTitle = "Access Denied";
        errorMessage = "You don't have permission to perform this action.";
      } else if (error.response?.status >= 500) {
        errorTitle = "Server Error";
        errorMessage = "Server is temporarily unavailable. Please try again later.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorTitle, {
        description: errorMessage,
        duration: 7000,
      });
    }
  };

  const handleInputChange = (field: keyof DepartmentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-full font-sans">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">Department Management</h1>
          <p className="text-sm text-gray-400 mt-1 mb-0">
            <span className="cursor-pointer hover:text-blue-600" onClick={onCancel}>
              Departments
            </span>
            {" / "}
            <span className="text-gray-600">
              {department ? "Edit Department" : "Add New Department"}
            </span>
          </p>
        </div>
        <Button variant="outline" onClick={onCancel} className="gap-2" disabled={isSubmitting}>
          <span className="font-mono text-xs text-gray-400">&lt;--</span>
          Back to Departments
        </Button>
      </div>

      <SectionCard
        title={department ? "Edit Department" : "Add New Department"}
        subtitle="Fill in the department details below"
      >
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Basic Information */}
          <div>
            <p className="text-sm font-semibold text-gray-400 mb-5">Basic Information</p>
            <div className="grid grid-cols-2 gap-5">
              <Field label="Department Name" required>
                <input
                  className={`${inputCls} ${errors.name ? "border-red-500" : ""}`}
                  placeholder="Enter department name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </Field>

              <Field label="Department Code" required>
                <input
                  className={`${inputCls} ${errors.code ? "border-red-500" : ""}`}
                  placeholder="e.g., HR, IT, FIN"
                  value={formData.code}
                  onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
                  disabled={isSubmitting}
                  maxLength={10}
                />
                {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
              </Field>

              <div className="col-span-2">
                <Field label="Description" required>
                  <TextAreaField
                    value={formData.description}
                    onChange={(value) => handleInputChange("description", value)}
                    placeholder="Describe the department's role and responsibilities"
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                  )}
                </Field>
              </div>
            </div>
          </div>

          {/* Management */}
          <div>
            <p className="text-sm font-semibold text-gray-400 mb-5">Management</p>
            <div className="grid grid-cols-2 gap-5">
              <Field label="Department Head">
                <SelectField
                  value={formData.department_head_id}
                  onChange={(value) => handleInputChange("department_head_id", value)}
                >
                  <option value="">Select Department Head</option>
                  {loadingData ? (
                    <option value="" disabled>Loading users...</option>
                  ) : (
                    users.map((user) => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.first_name} {user.last_name}
                      </option>
                    ))
                  )}
                </SelectField>
              </Field>

              <Field label="Parent Department">
                <SelectField
                  value={formData.parent_department_id}
                  onChange={(value) => handleInputChange("parent_department_id", value)}
                >
                  <option value="">No Parent (Main Department)</option>
                  {loadingData ? (
                    <option value="" disabled>Loading departments...</option>
                  ) : (
                    departments.map((dept) => (
                      <option key={dept.department_id} value={dept.department_id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))
                  )}
                </SelectField>
              </Field>

              <Field label="Status">
                <SelectField
                  value={formData.status}
                  onChange={(value) => handleInputChange("status", value)}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </SelectField>
              </Field>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <p className="text-sm font-semibold text-gray-400 mb-5">Contact Information</p>
            <div className="grid grid-cols-2 gap-5">
              <Field label="Contact Email">
                <input
                  type="email"
                  className={inputCls}
                  placeholder="e.g., hr@digisol.com"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange("contact_email", e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.contact_email && (
                  <p className="text-red-500 text-xs mt-1">{errors.contact_email}</p>
                )}
              </Field>

              <Field label="Contact Phone">
                <input
                  type="tel"
                  className={inputCls}
                  placeholder="e.g., +237 6XX XXX XXX"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange("contact_phone", e.target.value)}
                  disabled={isSubmitting}
                />
              </Field>

              <Field label="Location">
                <input
                  className={inputCls}
                  placeholder="e.g., Douala, Cameroon"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  disabled={isSubmitting}
                />
              </Field>

              <Field label="Budget Allocation (XAF)">
                <input
                  type="number"
                  className={inputCls}
                  placeholder="e.g., 5000000"
                  value={formData.budget}
                  onChange={(e) => handleInputChange("budget", e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.budget && <p className="text-red-500 text-xs mt-1">{errors.budget}</p>}
              </Field>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button type="submit" disabled={isSubmitting} className="px-6 py-2">
              {isSubmitting ? "Saving..." : department ? "Update Department" : "Create Department"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-2"
            >
              Cancel
            </Button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}

export default DepartmentForm;