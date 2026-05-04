import React, { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReusableTable from "../../../components/other/ReusableTable/ReusableTable";
import { createEmployeeColumns } from "../../../components/Columns/EmployeeColumns";
import { employeeData } from "../../../data/employeeData";
import { AddEmployeeForm } from "./AddEmployeeForm";
import { useUserStore } from "../../../Store/UserStore";


export const Employees: React.FC = () => {
  const navigate = useNavigate();
  const roles = useUserStore((state) => state.roles);
  const permissions = useUserStore((state) => state.permissions);
  const isSuperAdmin = roles.includes("SUPER_ADMIN");

  const checkPermission = (action: string) => {
    if (isSuperAdmin) return true;
    return permissions.some(
      (p: any) => p.module === "hr" && p.resource_type === "employee" && p.action === action
    );
  };

  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleView = (id: string) => {
    // View employee details (future)
  };

  const handleAddNew = () => {
    if (!checkPermission("CREATE")) {
      navigate("/dashboard/unauthorized");
      return;
    }
    setShowForm(true);
  };
  const handleBackToTable = () => {
    setShowForm(false);
    setShowSuccess(false);
  };
  const handleCreateEmployee = () => setShowSuccess(true);
  const handleAddAnother = () => {
    setShowSuccess(false);
    setShowForm(true);
  };
  const handleGoToDashboard = () => {
    setShowSuccess(false);
    setShowForm(false);
  };

  if (showSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Employee Successfully Created!
          </h2>
          <p className="text-sm text-gray-600 mb-1">Employee ID: EMP181</p>
          <p className="text-sm text-gray-500 mb-8">
            Temporary password has been sent to tiaya.josue@digisol.com
          </p>
          <div className="space-y-3">
            <button className="w-full bg-primary hover:bg-[#35345f] text-white rounded-lg px-6 py-3 font-medium">
              View Employee Profile
            </button>
            <button
              onClick={handleAddAnother}
              className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg px-6 py-3 font-medium"
            >
              Add Another Employee
            </button>
            <button
              onClick={handleGoToDashboard}
              className="w-full text-gray-600 hover:text-gray-900 py-2 font-medium"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <AddEmployeeForm
        onCancel={handleBackToTable}
        onSuccess={handleCreateEmployee}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Employee Records
          </h1>
          <p className="text-sm text-gray-500">
            Manage and view all employee information
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            className="border rounded px-4 py-2 text-sm font-medium flex items-center gap-2"
            aria-label="Export Records"
          >
            <span>Export Records</span>
          </button>
          <button
            className="border rounded px-4 py-2 text-sm font-medium flex items-center gap-2"
            aria-label="Import Employees"
          >
            <span>Import Employees</span>
          </button>
          <button
            className="bg-primary hover:bg-[#35345f] text-white rounded px-4 py-2 text-sm font-semibold flex items-center gap-2"
            onClick={handleAddNew}
            aria-label="Add New Employee"
          >
            + Add New Employee
          </button>
        </div>
      </div>
      <ReusableTable
        heading="Employee Table"
        columns={createEmployeeColumns({
          openMenuId,
          onToggleMenu: setOpenMenuId,
          onViewEmployee: handleView,
          onEditEmployee: (id) => {
            if (!checkPermission("UPDATE")) {
              navigate("/dashboard/unauthorized");
              return;
            }
          },
          onDeleteEmployee: (id) => {},
        })}
        data={employeeData}
        filterKey="status"
        filterOptions={[
          { key: "active", value: "Active", label: "Active" },
          { key: "on-leave", value: "On Leave", label: "On Leave" },
        ]}
        searchKeys={["name", "employeeId", "department", "role"]}
      />
    </div>
  );
};
