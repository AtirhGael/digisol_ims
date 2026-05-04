import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaBuilding,
  FaUsers,
  FaSitemap,
  FaEdit,
  FaArrowLeft,
} from "react-icons/fa";
import { SelectField } from "./components/DepartmentForm.shared";
import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import useFetchHook from "../../../Hooks/UseFetchHook";
import { useUpdate } from "../../../Hooks/UseUpdateHook";
import { toast } from "sonner";
import axios from "axios";
import { useUserStore } from "../../../Store/UserStore";
import { Button } from "@/components/ui/button";

const API_BASE_URL =
  import.meta.env.VITE_BASE_URL?.replace("/api", "") || "http://localhost:4000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(
  (config) => {
    const accessToken =
      useUserStore.getState().accessToken ||
      localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

interface User {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
}

interface DepartmentListItem {
  department_id: string;
  name: string;
  department_name: string;
  department_code: string;
}

interface DepartmentHead {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
}

interface ParentDepartment {
  department_id: string;
  department_name: string;
  department_code: string;
}

interface SubDepartment {
  department_id: string;
  department_name: string;
  department_code: string;
  status: string;
}

interface Staff {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  assignment_date: string;
  assigned_by: string;
}

interface DepartmentDetailsData {
  department_id: string;
  name: string;
  code: string;
  description: string | null;
  department_head_id: string | null;
  department_head: DepartmentHead | null;
  parent_department_id: string | null;
  parent_department: ParentDepartment | null;
  contact_email: string | null;
  contact_phone: string | null;
  location: string | null;
  budget_allocation: number | null;
  sub_departments: SubDepartment[];
  staff: Staff[];
  status: string;
  created_at: string | null;
  updated_at: string | null;
}

const DepartmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<DepartmentListItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const { data, isLoading, isError, error, refetch } = useFetchHook<{
    success: boolean;
    data: DepartmentDetailsData;
  }>(`/departments/${id}`, `department-${id}`, { enabled: !!id });

  const { updateData } = useUpdate();

  useEffect(() => {
    const loadDropdownData = async () => {
      setLoadingData(true);
      try {
        const [usersRes, deptRes] = await Promise.all([
          apiClient.get(`/api/users`, { params: { status: "ACTIVE" } }),
          apiClient.get(`/api/departments`),
        ]);

        if (usersRes.data?.data?.users) {
          setUsers(usersRes.data.data.users);
        }
        if (deptRes.data?.data?.departments) {
          const depts = deptRes.data.data.departments;
          setDepartments(
            depts.filter((d: DepartmentListItem) => d.department_id !== id),
          );
        }
      } catch (err) {
        console.error("Failed to load dropdown data:", err);
      } finally {
        setLoadingData(false);
      }
    };

    if (isEditing) {
      loadDropdownData();
    }
  }, [isEditing, id]);

  const handleBack = () => {
    navigate("/dashboard/departments");
  };

  const handleEditToggle = () => {
    const { roles, permissions } = useUserStore.getState();
    const isSuperAdmin = roles.includes("SUPER_ADMIN");
    const hasUpdatePermission =
      isSuperAdmin ||
      permissions.some(
        (p: any) =>
          p.module === "hr" &&
          p.resource_type === "employee" &&
          p.action === "UPDATE",
      );
    if (!hasUpdatePermission) {
      navigate("/dashboard/unauthorized");
      return;
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async (formData: any) => {
    setLoading(true);
    try {
      await apiClient.put(`/api/departments/${id}`, formData);
      toast.success("Department updated successfully");
      setIsEditing(false);
      refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update department");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <SkeletonLoading />;
  }

  if (isError) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error?.message || "Failed to load department details"}
        </div>
        <Button onClick={handleBack} className="mt-4">
          Back to Departments
        </Button>
      </div>
    );
  }

  const department = data?.data;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="mb-4">
        <p
          className="text-sm hover:text-primary cursor-pointer text-gray-600"
          onClick={handleBack}
        >
          Departments / {department?.name}
        </p>
      </div>

      {/* Header Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full flex items-center justify-center bg-(--primary) text-white font-bold text-2xl">
              {department?.name?.charAt(0)?.toUpperCase() || "D"}
            </div>
            <div className="flex flex-col gap-2">
              <div>
                <p className="text-xl font-bold">{department?.name}</p>
                <p className="text-xs text-gray-500 mt-1">{department?.code}</p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    department?.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {department?.status || "UNKNOWN"}
                </span>
                {department?.parent_department && (
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <FaSitemap className="text-xs" />
                    Parent: {department.parent_department.department_name}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleEditToggle}
            className="flex items-center gap-2"
          >
            <FaEdit className="w-4 h-4" />
            {isEditing ? "Cancel Edit" : "Edit Department"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            className={`px-6 py-3 text-sm font-medium flex items-center gap-2 ${
              activeTab === "overview"
                ? "border-b-2 border-(--primary) text-(--primary)"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            <FaBuilding className="w-4 h-4" />
            Overview
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium flex items-center gap-2 ${
              activeTab === "staff"
                ? "border-b-2 border-(--primary) text-(--primary)"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("staff")}
          >
            <FaUsers className="w-4 h-4" />
            Staff ({department?.staff?.length || 0})
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium flex items-center gap-2 ${
              activeTab === "sub-departments"
                ? "border-b-2 border-(--primary) text-(--primary)"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("sub-departments")}
          >
            <FaSitemap className="w-4 h-4" />
            Sub-departments ({department?.sub_departments?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <OverviewTab
              department={department}
              isEditing={isEditing}
              onSave={handleSave}
              loading={loading}
              users={users}
              departments={departments}
              loadingData={loadingData}
            />
          )}
          {activeTab === "staff" && (
            <StaffTab staff={department?.staff || []} />
          )}
          {activeTab === "sub-departments" && (
            <SubDepartmentsTab
              subDepartments={department?.sub_departments || []}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Overview Tab Component
interface OverviewTabProps {
  department: DepartmentDetailsData | undefined;
  isEditing: boolean;
  onSave: (data: any) => void;
  loading: boolean;
  users: User[];
  departments: DepartmentListItem[];
  loadingData: boolean;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  department,
  isEditing,
  onSave,
  loading,
  users,
  departments,
  loadingData,
}) => {
  const [formData, setFormData] = useState({
    name: department?.name || "",
    code: department?.code || "",
    description: department?.description || "",
    department_head_id: department?.department_head_id || "",
    parent_department_id: department?.parent_department_id || "",
    contact_email: department?.contact_email || "",
    contact_phone: department?.contact_phone || "",
    location: department?.location || "",
    budget_allocation: department?.budget_allocation?.toString() || "",
    status: department?.status || "ACTIVE",
  });

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
        location: department.location || "",
        budget_allocation: department.budget_allocation?.toString() || "",
        status: department.status || "ACTIVE",
      });
    }
  }, [department]);

  const handleSubmit = () => {
    const cleanedData: any = {};
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== "") {
        cleanedData[key] = value;
      }
    });
    onSave(cleanedData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Department Name
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          ) : (
            <p className="text-gray-900 font-medium">{department?.name}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Department Code
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.code}
              onChange={(e) =>
                handleChange("code", e.target.value.toUpperCase())
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          ) : (
            <p className="text-gray-900">{department?.code}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Status
          </label>
          {isEditing ? (
            <select
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          ) : (
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                department?.status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {department?.status}
            </span>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Department Head
          </label>
          {isEditing ? (
            <select
              value={formData.department_head_id}
              onChange={(e) =>
                handleChange("department_head_id", e.target.value)
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Select Department Head</option>
              {loadingData ? (
                <option value="" disabled>
                  Loading...
                </option>
              ) : (
                users.map((user) => (
                  <option key={user.user_id} value={user.user_id}>
                    {user.first_name} {user.last_name} ({user.email})
                  </option>
                ))
              )}
            </select>
          ) : (
            <p className="text-gray-900">
              {department?.department_head
                ? `${department.department_head.first_name} ${department.department_head.last_name}`
                : "Not assigned"}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Parent Department
          </label>
          {isEditing ? (
            <select
              value={formData.parent_department_id}
              onChange={(e) =>
                handleChange("parent_department_id", e.target.value)
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">No Parent (Main Department)</option>
              {loadingData ? (
                <option value="" disabled>
                  Loading...
                </option>
              ) : (
                departments.map((dept) => (
                  <option key={dept.department_id} value={dept.department_id}>
                    {dept?.name}
                  </option>
                ))
              )}
            </select>
          ) : (
            <p className="text-gray-900">
              {department?.parent_department
                ? department.parent_department.department_name
                : "None (Main Department)"}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Location
          </label>
          {isEditing ? (
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Enter location"
            />
          ) : (
            <p className="text-gray-900">
              {department?.location || "Not specified"}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Contact Email
          </label>
          {isEditing ? (
            <input
              type="email"
              value={formData.contact_email}
              onChange={(e) => handleChange("contact_email", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Enter email"
            />
          ) : (
            <p className="text-gray-900">
              {department?.contact_email || "Not specified"}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Contact Phone
          </label>
          {isEditing ? (
            <input
              type="tel"
              value={formData.contact_phone}
              onChange={(e) => handleChange("contact_phone", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Enter phone"
            />
          ) : (
            <p className="text-gray-900">
              {department?.contact_phone || "Not specified"}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Budget Allocation (XAF)
          </label>
          {isEditing ? (
            <input
              type="number"
              value={formData.budget_allocation}
              onChange={(e) =>
                handleChange("budget_allocation", e.target.value)
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Enter budget"
            />
          ) : (
            <p className="text-gray-900">
              {department?.budget_allocation
                ? `XAF ${Number(department.budget_allocation).toLocaleString()}`
                : "Not specified"}
            </p>
          )}
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Description
          </label>
          {isEditing ? (
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={3}
            />
          ) : (
            <p className="text-gray-900">
              {department?.description || "No description"}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Created At
          </label>
          <p className="text-gray-900">
            {department?.created_at
              ? new Date(department.created_at).toLocaleString()
              : "N/A"}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            Updated At
          </label>
          <p className="text-gray-900">
            {department?.updated_at
              ? new Date(department.updated_at).toLocaleString()
              : "N/A"}
          </p>
        </div>
      </div>
      {isEditing && (
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </div>
  );
};

// Staff Tab Component
const StaffTab: React.FC<{ staff: Staff[] }> = ({ staff }) => {
  if (staff.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FaUsers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No staff members in this department</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Email
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Username
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Assigned Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {staff.map((member) => (
            <tr key={member.user_id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-(--primary) text-white flex items-center justify-center text-sm font-medium">
                    {member.first_name?.charAt(0)}
                    {member.last_name?.charAt(0)}
                  </div>
                  <span className="font-medium">
                    {member.first_name} {member.last_name}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-gray-600">{member.email}</td>
              <td className="px-4 py-3 text-gray-600">{member.username}</td>
              <td className="px-4 py-3 text-gray-600">
                {member.assignment_date
                  ? new Date(member.assignment_date).toLocaleDateString()
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Sub-departments Tab Component
const SubDepartmentsTab: React.FC<{ subDepartments: SubDepartment[] }> = ({
  subDepartments,
}) => {
  if (subDepartments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FaSitemap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No sub-departments</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Department Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Code
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {subDepartments.map((subDept) => (
            <tr key={subDept.department_id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">
                {subDept.department_name}
              </td>
              <td className="px-4 py-3 text-gray-600">
                {subDept.department_code}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    subDept.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {subDept.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DepartmentDetails;
