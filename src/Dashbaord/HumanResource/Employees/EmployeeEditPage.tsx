import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { Button } from "../../../components/ui/button";
import { fetchEmployeeById, updateEmployeeById, type HrEmployeeDetail } from "../hrApi";

const inputClassName =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 bg-white";

export const EmployeeEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  // Standalone edit route used when another HR surface deep-links directly to an employee.
  const [loadingEmployee, setLoadingEmployee] = useState(true);
  const [savingEmployee, setSavingEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<HrEmployeeDetail | null>(null);
  const [editForm, setEditForm] = useState({
    national_id: "",
    gender: "",
    marital_status: "",
    position: "",
    employment_type: "",
    employment_status: "",
    address_street: "",
    address_city: "",
    address_region: "",
    address_country: "",
    emergency_name: "",
    emergency_relationship: "",
    emergency_phone: "",
  });

  useEffect(() => {
    const loadEmployee = async () => {
      if (!id) {
        toast.error("Employee not found.");
        navigate("/dashboard/employees");
        return;
      }

      setLoadingEmployee(true);
      try {
        const response = await fetchEmployeeById(id);
        const employee = response.data;
        setSelectedEmployee(employee);
        setEditForm({
          national_id: employee.national_id || "",
          gender: employee.gender || "",
          marital_status: employee.marital_status || "",
          position: employee.employment_info?.position || "",
          employment_type: employee.employment_info?.employment_type || "",
          employment_status: employee.employment_info?.employment_status || "",
          address_street: employee.address?.street || "",
          address_city: employee.address?.city || "",
          address_region: employee.address?.region || "",
          address_country: employee.address?.country || "",
          emergency_name: employee.emergency_contact?.name || "",
          emergency_relationship: employee.emergency_contact?.relationship || "",
          emergency_phone: employee.emergency_contact?.phone || "",
        });
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to load employee details.");
        navigate("/dashboard/employees");
      } finally {
        setLoadingEmployee(false);
      }
    };

    void loadEmployee();
  }, [id, navigate]);

  const handleFieldChange = (field: keyof typeof editForm, value: string) => {
    setEditForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSaveEmployee = async () => {
    if (!selectedEmployee) return;

    setSavingEmployee(true);
    try {
      await updateEmployeeById(selectedEmployee.employee_id, {
        national_id: editForm.national_id,
        gender: editForm.gender || undefined,
        marital_status: editForm.marital_status || undefined,
        address: {
          street: editForm.address_street,
          city: editForm.address_city,
          region: editForm.address_region,
          country: editForm.address_country,
        },
        emergency_contact: {
          name: editForm.emergency_name,
          relationship: editForm.emergency_relationship,
          phone: editForm.emergency_phone,
        },
        employment_info: {
          position: editForm.position,
          employment_type: editForm.employment_type,
          employment_status: editForm.employment_status,
        },
      });

      toast.success("Employee record updated successfully.");
      navigate("/dashboard/employees");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update employee.");
    } finally {
      setSavingEmployee(false);
    }
  };

  const detailDepartment =
    selectedEmployee?.user_info?.departments_users_department_idTodepartments
      ?.department_name ||
    selectedEmployee?.employment_info?.department?.department_name ||
    "Unassigned";

  const employeeFullName =
    `${selectedEmployee?.user_info?.first_name || ""} ${
      selectedEmployee?.user_info?.last_name || ""
    }`.trim() || "Employee";

  return (
    <div className="min-h-screen space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate("/dashboard/employees")}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Employee Records
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Employee</h1>
          <p className="text-sm text-gray-500">
            Update {employeeFullName}&apos;s record without losing the existing employee information.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/dashboard/employees")}>
            Cancel
          </Button>
          <Button onClick={handleSaveEmployee} loading={savingEmployee}>
            Save Changes
          </Button>
        </div>
      </div>

      {loadingEmployee ? (
        <SkeletonLoading />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-lg border border-gray-200 p-5">
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Full Name</p>
              <p className="mt-1 font-medium text-gray-900">{employeeFullName}</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Employee Code</p>
              <p className="mt-1 font-medium text-gray-900">{selectedEmployee?.employee_code || "-"}</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Email</p>
              <p className="mt-1 font-medium text-gray-900">{selectedEmployee?.user_info?.email || "-"}</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <p className="text-xs text-gray-500">Department</p>
              <p className="mt-1 font-medium text-gray-900">{detailDepartment}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-lg border border-gray-200 p-5">
            <label className="text-sm text-gray-700">
              National ID
              <input
                className={inputClassName}
                value={editForm.national_id}
                onChange={(e) => handleFieldChange("national_id", e.target.value)}
              />
            </label>
            <label className="text-sm text-gray-700">
              Position
              <input
                className={inputClassName}
                value={editForm.position}
                onChange={(e) => handleFieldChange("position", e.target.value)}
              />
            </label>
            <label className="text-sm text-gray-700">
              Gender
              <select
                className={inputClassName}
                value={editForm.gender}
                onChange={(e) => handleFieldChange("gender", e.target.value)}
              >
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </label>
            <label className="text-sm text-gray-700">
              Marital Status
              <select
                className={inputClassName}
                value={editForm.marital_status}
                onChange={(e) => handleFieldChange("marital_status", e.target.value)}
              >
                <option value="">Select status</option>
                <option value="SINGLE">Single</option>
                <option value="MARRIED">Married</option>
                <option value="DIVORCED">Divorced</option>
                <option value="WIDOWED">Widowed</option>
              </select>
            </label>
            <label className="text-sm text-gray-700">
              Employment Type
              <select
                className={inputClassName}
                value={editForm.employment_type}
                onChange={(e) => handleFieldChange("employment_type", e.target.value)}
              >
                <option value="">Select type</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </label>
            <label className="text-sm text-gray-700">
              Employment Status
              <select
                className={inputClassName}
                value={editForm.employment_status}
                onChange={(e) => handleFieldChange("employment_status", e.target.value)}
              >
                <option value="">Select status</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="TERMINATED">Terminated</option>
                <option value="RESIGNED">Resigned</option>
              </select>
            </label>
            <label className="text-sm text-gray-700 md:col-span-2">
              Street Address
              <input
                className={inputClassName}
                value={editForm.address_street}
                onChange={(e) => handleFieldChange("address_street", e.target.value)}
              />
            </label>
            <label className="text-sm text-gray-700">
              City
              <input
                className={inputClassName}
                value={editForm.address_city}
                onChange={(e) => handleFieldChange("address_city", e.target.value)}
              />
            </label>
            <label className="text-sm text-gray-700">
              Region
              <input
                className={inputClassName}
                value={editForm.address_region}
                onChange={(e) => handleFieldChange("address_region", e.target.value)}
              />
            </label>
            <label className="text-sm text-gray-700 md:col-span-2">
              Country
              <input
                className={inputClassName}
                value={editForm.address_country}
                onChange={(e) => handleFieldChange("address_country", e.target.value)}
              />
            </label>
            <label className="text-sm text-gray-700">
              Emergency Contact Name
              <input
                className={inputClassName}
                value={editForm.emergency_name}
                onChange={(e) => handleFieldChange("emergency_name", e.target.value)}
              />
            </label>
            <label className="text-sm text-gray-700">
              Emergency Contact Relationship
              <input
                className={inputClassName}
                value={editForm.emergency_relationship}
                onChange={(e) => handleFieldChange("emergency_relationship", e.target.value)}
              />
            </label>
            <label className="text-sm text-gray-700 md:col-span-2">
              Emergency Contact Phone
              <input
                className={inputClassName}
                value={editForm.emergency_phone}
                onChange={(e) => handleFieldChange("emergency_phone", e.target.value)}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
