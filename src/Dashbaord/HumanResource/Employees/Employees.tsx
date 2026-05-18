import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { AddEmployeeForm } from "./AddEmployeeForm";
import { useUserStore } from "../../../Store/UserStore";
import { type HrEmployeeDetail } from "../hrApi";
import { toast } from "sonner";
import { useFetchHook } from "../../../Hooks/UseFetchHook";
import useUpdate from "../../../Hooks/UseUpdateHook";
import { useEmployees } from "./hooks/useEmployees";
import { EmployeeListView } from "./components/EmployeeListView";
import { EmployeeDetailView } from "./components/EmployeeDetailView";
import { EmployeeEditView } from "./components/EmployeeEditView";
import { EmployeeSuccessView } from "./components/EmployeeSuccessView";
import { type EmployeePageView, type EmployeeRow, type EditForm, EMPTY_EDIT_FORM } from "./types";
import { escapeHtml, openHrPrintPreview } from "../utils/print";

export const Employees: React.FC = () => {
  const navigate = useNavigate();
  const roles = useUserStore((state) => state.roles);
  const permissions = useUserStore((state) => state.permissions);
  const isSuperAdmin = roles.includes("SUPER_ADMIN");

  const checkPermission = (action: string) => {
    if (isSuperAdmin) return true;
    return permissions.some(
      (p: any) =>
        p.module === "hr" && p.resource_type === "employee" && p.action === action
    );
  };

  const [view, setView] = useState<EmployeePageView>("list");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [selectedEmployeeRow, setSelectedEmployeeRow] = useState<EmployeeRow | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeRow | null>(null);
  const [createdEmployeeResult, setCreatedEmployeeResult] = useState<any>(null);
  const [editForm, setEditForm] = useState<EditForm>(EMPTY_EDIT_FORM);
  const [pendingAction, setPendingAction] = useState<"view" | "edit">("view");

  const { employees, isLoading, refetch, deleteEmployee } = useEmployees();
  const { updateData, loading: savingEmployee } = useUpdate();

  const { data: empDetailResponse, isLoading: loadingEmployee } = useFetchHook<{
    success: boolean;
    data: HrEmployeeDetail;
  }>(
    `/employees/${selectedEmployeeId}`,
    `hr-employee-detail-${selectedEmployeeId}`,
    { enabled: Boolean(selectedEmployeeId) }
  );
  const selectedEmployee = empDetailResponse?.data ?? null;

  // Populate edit form when employee detail loads for edit action
  React.useEffect(() => {
    if (selectedEmployee && pendingAction === "edit" && !loadingEmployee) {
      populateEditForm(selectedEmployee);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmployee, loadingEmployee]);

  const resetToTable = () => {
    setView("list");
    setSelectedEmployeeId("");
    setSelectedEmployeeRow(null);
    setEmployeeToDelete(null);
    setCreatedEmployeeResult(null);
  };

  const populateEditForm = (emp: HrEmployeeDetail) => {
    setEditForm({
      national_id: emp.national_id || "",
      gender: emp.gender || "",
      marital_status: emp.marital_status || "",
      position: emp.employment_info?.position || "",
      department_id: emp.employment_info?.department?.department_id || "",
      employment_type: emp.employment_info?.employment_type || "",
      employment_status: emp.employment_info?.employment_status || "",
      address_street: emp.address?.street || "",
      address_city: emp.address?.city || "",
      address_region: emp.address?.region || "",
      address_country: emp.address?.country || "",
      emergency_name: emp.emergency_contact?.name || "",
      emergency_relationship: emp.emergency_contact?.relationship || "",
      emergency_phone: emp.emergency_contact?.phone || "",
    });
  };

  const loadEmployee = (row: EmployeeRow, action: "view" | "edit") => {
    setSelectedEmployeeRow(row);
    setPendingAction(action);
    setSelectedEmployeeId(row.id);
    setView(action === "view" ? "detail" : "edit");
  };

  const handleSaveEmployee = async () => {
    if (!selectedEmployee) return;
    try {
      await updateData(`/employees/${selectedEmployee.employee_id}`, {
        national_id: editForm.national_id || undefined,
        gender: editForm.gender || undefined,
        marital_status: editForm.marital_status || undefined,
        employment_info: {
          position: editForm.position || undefined,
          department_id: editForm.department_id || null,
          employment_type: editForm.employment_type || undefined,
          employment_status: editForm.employment_status || undefined,
        },
        address: {
          city: editForm.address_city || undefined,
          region: editForm.address_region || undefined,
          country: editForm.address_country || undefined,
        },
        emergency_contact: {
          name: editForm.emergency_name || undefined,
          relationship: editForm.emergency_relationship || undefined,
          phone: editForm.emergency_phone || undefined,
        },
      }, 'patch');
      toast.success("Employee updated successfully.");
      await refetch();
      resetToTable();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to update employee.");
    }
  };

  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    try {
      await deleteEmployee(employeeToDelete.id);
      toast.success("Employee deleted successfully.");
      if (selectedEmployeeRow?.id === employeeToDelete.id) resetToTable();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to delete employee.");
    } finally {
      setEmployeeToDelete(null);
    }
  };

  const handleExportPdf = () => {
    const rows = employees
      .map(
        (emp) =>
          `<tr>
            <td>${escapeHtml(emp.name)}</td>
            <td>${escapeHtml(emp.department)}</td>
            <td>${escapeHtml(emp.role)}</td>
            <td>${escapeHtml(emp.status)}</td>
            <td>${escapeHtml(emp.hireDate)}</td>
          </tr>`
      )
      .join("");

    const html = `
      <h1>Employee Records</h1>
      <p>Exported on ${escapeHtml(new Date().toLocaleDateString())}</p>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Department</th>
            <th>Role</th>
            <th>Status</th>
            <th>Hire Date</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    const opened = openHrPrintPreview("Employee Records", html);
    if (!opened) toast.error("Unable to open print preview. Please allow pop-ups for this site.");
    else toast.info("Print preview opened — use your browser's Save as PDF option.");
  };

  if (isLoading) return <SkeletonLoading />;

  if (view === "success") {
    return (
      <EmployeeSuccessView
        createdEmployeeResult={createdEmployeeResult}
        onAddAnother={() => setView("form")}
        onGoToDashboard={resetToTable}
      />
    );
  }

  if (view === "form") {
    return (
      <AddEmployeeForm
        onCancel={resetToTable}
        onSuccess={() => {
          void refetch();
          setView("list");
        }}
      />
    );
  }

  if (view === "detail") {
    return (
      <EmployeeDetailView
        selectedEmployee={selectedEmployee}
        selectedEmployeeRow={selectedEmployeeRow}
        loading={loadingEmployee}
        onBack={resetToTable}
      />
    );
  }

  if (view === "edit") {
    return (
      <EmployeeEditView
        editForm={editForm}
        loading={loadingEmployee}
        saving={savingEmployee}
        onFieldChange={(field, value) =>
          setEditForm((prev) => ({ ...prev, [field]: value }))
        }
        onSave={handleSaveEmployee}
        onCancel={resetToTable}
      />
    );
  }

  return (
    <EmployeeListView
      employees={employees}
      employeeToDelete={employeeToDelete}
      onView={(id) => {
        const row = employees.find((e) => e.id === id);
        if (row) loadEmployee(row, "view");
      }}
      onEdit={(id) => {
        if (!checkPermission("UPDATE")) {
          navigate("/dashboard/unauthorized");
          return;
        }
        const row = employees.find((e) => e.id === id);
        if (row) loadEmployee(row, "edit");
      }}
      onDelete={(id) => {
        const row = employees.find((e) => e.id === id);
        if (row) setEmployeeToDelete(row);
      }}
      onConfirmDelete={confirmDeleteEmployee}
      onCancelDelete={() => setEmployeeToDelete(null)}
      onAddNew={() => {
        if (!checkPermission("CREATE")) {
          navigate("/dashboard/unauthorized");
          return;
        }
        setView("form");
      }}
      onExportPdf={handleExportPdf}
      onRequestLeave={() => navigate("/dashboard/leavemanagement/request")}
    />
  );
};
