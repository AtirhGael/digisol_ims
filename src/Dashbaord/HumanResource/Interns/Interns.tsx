import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuPlus, LuGraduationCap } from "react-icons/lu";
import { UserCheck, CalendarDays } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import ReusableTable from "../../../components/other/ReusableTable/ReusableTable";
import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { AddEmployeeForm } from "../Employees/AddEmployeeForm";
import { EmployeeSuccessView } from "../Employees/components/EmployeeSuccessView";
import { InternDetailView } from "./InternDetailView";
import { createEmployeeColumns } from "../../../components/Columns/EmployeeColumns";
import { useFetchHook } from "../../../Hooks/UseFetchHook";
import { useDeleteHook } from "../../../Hooks/UseDeleteHook";
import useUpdate from "../../../Hooks/UseUpdateHook";
import { useUserStore } from "../../../Store/UserStore";
import { toast } from "sonner";
import type { HrEmployee, HrEmployeeDetail } from "../hrApi";

// Shape matches EmployeeRow so createEmployeeColumns works directly
type InternRow = {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  role: string;
  status: string;
  hireDate: string;
};

type InternView = "list" | "form" | "success" | "detail";

const STATUS_MAP: Record<string, string> = {
  ACTIVE: "Active",
  ON_LEAVE: "On Leave",
  SUSPENDED: "Suspended",
  TERMINATED: "Terminated",
  RESIGNED: "Resigned",
};

type ConvertForm = {
  newPosition: string;
  employmentType: "FULL_TIME" | "PART_TIME" | "CONTRACT";
};

const DEFAULT_CONVERT_FORM: ConvertForm = {
  newPosition: "",
  employmentType: "FULL_TIME",
};

function toInternRow(emp: HrEmployee): InternRow {
  return {
    id: emp.employee_id,
    name: `${emp.first_name} ${emp.last_name}`.trim(),
    employeeId: emp.employee_code,
    department: emp.department?.department_name ?? "Unassigned",
    role: emp.position || "Intern",
    status: STATUS_MAP[emp.employment_status] ?? emp.employment_status,
    hireDate: emp.start_date
      ? new Date(emp.start_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "-",
  };
}

export const Interns: React.FC = () => {
  const navigate = useNavigate();
  const roles = useUserStore((state) => state.roles);
  const permissions = useUserStore((state) => state.permissions);
  const isSuperAdmin = roles.includes("SUPER_ADMIN");

  const checkPermission = (action: string) =>
    isSuperAdmin ||
    permissions.some(
      (p: any) =>
        p.module === "hr" && p.resource_type === "employee" && p.action === action
    );

  const [view, setView] = useState<InternView>("list");
  const [viewingInternId, setViewingInternId] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<any>(null);
  const [internToDelete, setInternToDelete] = useState<InternRow | null>(null);
  const [internToConvert, setInternToConvert] = useState<InternRow | null>(null);
  const [convertForm, setConvertForm] = useState<ConvertForm>(DEFAULT_CONVERT_FORM);
  const [converting, setConverting] = useState(false);

  const { data, isLoading, refetch } = useFetchHook<{
    success: boolean;
    message: string;
    data: HrEmployee[];
  }>("/employees?page_size=200", "hr-interns");

  const { mutateAsync: deleteIntern } = useDeleteHook("/employees", ["hr-interns"]);
  const { updateData } = useUpdate();

  const allEmployees: HrEmployee[] = data?.data ?? [];
  const interns: InternRow[] = allEmployees
    .filter((emp) => emp.position?.toLowerCase().includes("intern"))
    .map(toInternRow);

  const handleViewIntern = (id: string) => {
    setViewingInternId(id);
    setView("detail");
  };

  const handleAddIntern = () => {
    if (!checkPermission("CREATE")) {
      navigate("/dashboard/unauthorized");
      return;
    }
    setView("form");
  };

  const handleSuccess = (result: {
    employee: HrEmployeeDetail;
    credentialsSentTo?: string;
  }) => {
    setCreatedResult(result);
    setView("success");
    refetch();
  };

  const handleDeleteIntern = (id: string) => {
    if (!checkPermission("DELETE")) {
      navigate("/dashboard/unauthorized");
      return;
    }
    const intern = interns.find((i) => i.id === id);
    if (intern) setInternToDelete(intern);
  };

  const handleConvertIntern = (id: string) => {
    if (!checkPermission("UPDATE")) {
      navigate("/dashboard/unauthorized");
      return;
    }
    const intern = interns.find((i) => i.id === id);
    if (intern) {
      setConvertForm({ newPosition: intern.role.replace(/intern/i, "").trim() || "", employmentType: "FULL_TIME" });
      setInternToConvert(intern);
    }
  };

  const handleConfirmConvert = async () => {
    if (!internToConvert) return;
    if (!convertForm.newPosition.trim()) {
      toast.error("Please enter the new position.");
      return;
    }
    setConverting(true);
    try {
      await updateData(`/employees/${internToConvert.id}`, {
        employment_info: {
          employment_type: convertForm.employmentType,
          position: convertForm.newPosition.trim(),
        },
      }, "patch");
      toast.success(`${internToConvert.name} has been converted to a full employee.`);
      setInternToConvert(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to convert intern.");
    } finally {
      setConverting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!internToDelete) return;
    try {
      await deleteIntern(internToDelete.id);
      toast.success("Intern record removed successfully.");
      setInternToDelete(null);
      refetch();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to remove intern record."
      );
    }
  };

  const columns = createEmployeeColumns({
    onViewEmployee: handleViewIntern,
    onEditEmployee: (id) => navigate(`/dashboard/employees/${id}/edit`),
    onDeleteEmployee: handleDeleteIntern,
  });

  if (view === "detail" && viewingInternId) {
    return (
      <InternDetailView
        internId={viewingInternId}
        onBack={() => { setView("list"); setViewingInternId(null); }}
        onConverted={() => { setView("list"); setViewingInternId(null); refetch(); }}
      />
    );
  }

  if (view === "form") {
    return (
      <AddEmployeeForm
        onCancel={() => setView("list")}
        onSuccess={handleSuccess}
      />
    );
  }

  if (view === "success" && createdResult) {
    return (
      <EmployeeSuccessView
        employee={createdResult.employee}
        credentialsSentTo={createdResult.credentialsSentTo}
        onAddAnother={() => setView("form")}
        onGoToList={() => setView("list")}
      />
    );
  }

  return (
    <div className="min-h-screen">
      {/* Delete confirmation */}
      <AlertDialog
        open={internToDelete !== null}
        onOpenChange={(open) => !open && setInternToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Intern</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{internToDelete?.name}</strong>? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Convert to Employee dialog */}
      <AlertDialog
        open={internToConvert !== null}
        onOpenChange={(open) => !open && setInternToConvert(null)}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              Convert to Full Employee
            </AlertDialogTitle>
            <AlertDialogDescription>
              Converting <strong>{internToConvert?.name}</strong> from intern to a full employee. Confirm the new role details below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Position / Job Title</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Software Developer"
                value={convertForm.newPosition}
                onChange={(e) => setConvertForm((f) => ({ ...f, newPosition: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={convertForm.employmentType}
                onChange={(e) => setConvertForm((f) => ({ ...f, employmentType: e.target.value as ConvertForm["employmentType"] }))}
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={converting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmConvert}
              disabled={converting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {converting ? "Converting…" : "Convert to Employee"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Intern Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Manage and track all intern records
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            className="border border-gray-300 text-gray-700 rounded px-4 py-2 text-sm font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors"
            onClick={() => navigate("/dashboard/leavemanagement/request")}
          >
            <CalendarDays className="w-4 h-4" />
            Request Leave
          </button>
          <button
            className="border border-orange-300 text-orange-700 rounded px-4 py-2 text-sm font-medium flex items-center gap-2 hover:bg-orange-50 transition-colors"
            onClick={() => navigate("/dashboard/offboarding?type=intern")}
          >
            Offboarding
          </button>
          {checkPermission("CREATE") && (
            <button
              className="bg-primary text-white rounded px-4 py-2 text-sm font-medium flex items-center gap-2 hover:bg-[#35346b] transition-colors"
              onClick={handleAddIntern}
            >
              <LuPlus className="w-4 h-4" />
              Add Intern
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Total Interns</p>
          <p className="text-2xl font-bold text-gray-900">{interns.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {interns.filter((i) => i.status === "Active").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {interns.filter((i) => i.status !== "Active" && i.status !== "Terminated" && i.status !== "Resigned").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Departments</p>
          <p className="text-2xl font-bold text-purple-600">
            {new Set(interns.map((i) => i.department)).size}
          </p>
        </div>
      </div>

      {isLoading ? (
        <SkeletonLoading />
      ) : interns.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <LuGraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Interns Found</h3>
          <p className="text-sm text-gray-500 mb-6">
            No employee records with an intern position were found.
            Add an intern by clicking the button above.
          </p>
          {checkPermission("CREATE") && (
            <button
              className="bg-primary text-white rounded px-4 py-2 text-sm font-medium flex items-center gap-2 mx-auto hover:bg-[#35346b] transition-colors"
              onClick={handleAddIntern}
            >
              <LuPlus className="w-4 h-4" />
              Add First Intern
            </button>
          )}
        </div>
      ) : (
        <ReusableTable
          columns={columns}
          data={interns}
          heading="Intern Records"
          searchKeys={["name", "department", "role"]}
          itemsPerPage={10}
        />
      )}
    </div>
  );
};

export default Interns;

