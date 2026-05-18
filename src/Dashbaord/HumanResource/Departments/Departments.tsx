import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LuPlus } from "react-icons/lu";
import { FaBuilding } from "react-icons/fa";
import { Card } from "../../../components/other/Card";
import DepartmentTable from "./components/DepartmentTable";
import DepartmentForm from "./components/DepartmentForm";
import ConfirmDeleteDialog from "./components/ConfirmDeleteDialog";
import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { useFetchHook } from "../../../Hooks/UseFetchHook";
import { useDeleteHook } from "../../../Hooks/UseDeleteHook";
import usePost from "../../../Hooks/UsePostHook";
import useUpdate from "../../../Hooks/UseUpdateHook";
import { useUserStore } from "../../../Store/UserStore";
import { toast } from "sonner";
import type { Department, DepartmentFormData, Pagination } from "./types";
import { Button } from "@/components/ui/button";

type ViewMode = "list" | "add" | "edit";


const Departments: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const roles = useUserStore((state) => state.roles);
  const isSuperAdmin = roles.includes("SUPER_ADMIN");

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedDepartment, setSelectedDepartment] = useState<Department | undefined>();
  const [initialParentId, setInitialParentId] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);

  // Handle navigation state for "Add Sub-department" from DepartmentDetails
  useEffect(() => {
    const state = location.state as { openAddForm?: boolean; parentDepartmentId?: string } | null;
    if (state?.openAddForm) {
      setInitialParentId(state.parentDepartmentId ?? "");
      setSelectedDepartment(undefined);
      setViewMode("add");
      // Clear state so back navigation doesn't re-trigger
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, []);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; department?: Department }>({
    isOpen: false,
  });

  const { data: deptResponse, isLoading: loading, refetch } = useFetchHook<{
    success: boolean;
    data: { departments: Department[]; pagination: Pagination };
  }>(`/departments?page=${currentPage}&limit=10`, `departments-page-${currentPage}`);

  const departments: Department[] = deptResponse?.data?.departments ?? [];
  const pagination = deptResponse?.data?.pagination ?? {
    current_page: currentPage,
    total_pages: 1,
    total_items: 0,
    items_per_page: 10,
    has_next: false,
    has_prev: false,
  };

  const { postData, loading: creating } = usePost();
  const { updateData, loading: updating } = useUpdate();
  const deleteDeptMutation = useDeleteHook('/departments', [`departments-page-${currentPage}`]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddDepartment = () => {
    if (!isSuperAdmin) {
      navigate("/dashboard/unauthorized");
      return;
    }
    setSelectedDepartment(undefined);
    setInitialParentId("");
    setViewMode("add");
  };

  const handleViewDepartment = (department: Department) => {
    navigate(`/dashboard/departments/${department.department_id}`);
  };

  const handleDeleteDepartment = (departmentId: string) => {
    if (!isSuperAdmin) {
      navigate("/dashboard/unauthorized");
      return;
    }

    const department = departments.find(
      (dept) => dept.department_id === departmentId,
    );
    if (department) {
      setDeleteDialog({ isOpen: true, department });
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialog.department) return;
    try {
      await deleteDeptMutation.mutateAsync(deleteDialog.department.department_id);
      setDeleteDialog({ isOpen: false });
      toast.success("Department deleted successfully");
      refetch();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to delete department. Please try again.";
      toast.error(errorMessage);
    }
  };

  const cancelDelete = () => {
    setDeleteDialog({ isOpen: false });
  };

  // Create and update share one payload, with parent/manager fields omitted when blank.
  const handleSaveDepartment = async (formData: DepartmentFormData) => {
    try {
      const commonData = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        department_head_id: formData.department_head_id || undefined,
        parent_department_id: formData.parent_department_id || undefined,
        contact_email: formData.contact_email || undefined,
        contact_phone: formData.contact_phone || undefined,
        location: formData.location || undefined,
        budget_allocation: formData.budget ? Number(formData.budget) : undefined,
        status: formData.status,
      };

      if (selectedDepartment) {
        await updateData(`/departments/${selectedDepartment.department_id}`, commonData, 'put');
        toast.success("Department updated successfully");
      } else if (commonData.parent_department_id) {
        await postData('/departments/sub', commonData);
        toast.success("Sub-department created successfully");
      } else {
        await postData('/departments', commonData);
        toast.success("Department created successfully");
      }

      setCurrentPage(1);
      refetch();
      setViewMode("list");
      setSelectedDepartment(undefined);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Failed to save department. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleCancel = () => {
    setViewMode("list");
    setSelectedDepartment(undefined);
    setInitialParentId("");
  };

  const isSaving = creating || updating;

  if (viewMode === "add" || viewMode === "edit") {
    return (
      <DepartmentForm
        department={selectedDepartment}
        initialValues={initialParentId ? { parent_department_id: initialParentId } : undefined}
        onSave={handleSaveDepartment}
        onCancel={handleCancel}
        loading={isSaving}
      />
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <SkeletonLoading />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">Department Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage DIGISOL's departments and their details
          </p>
        </div>
        <Button
          onClick={handleAddDepartment}
          className="gap-2"
        >
          <LuPlus className="h-4 w-4" />
          Add Department
        </Button>
      </div>

      <div className="mb-6 max-w-xs">
        <Card
          heading="Total Departments"
          amount={pagination.total_items.toString()}
          currency="Active departments"
          icons={<FaBuilding className="text-white text-lg" />}
          iconBackgroundColor="var(--primary)"
        />
      </div>

      <DepartmentTable
        departments={departments}
        onView={handleViewDepartment}
        onDelete={handleDeleteDepartment}
        loading={loading}
        totalPages={pagination.total_pages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
      
      <ConfirmDeleteDialog
        isOpen={deleteDialog.isOpen}
        departmentName={deleteDialog.department?.name || ""}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        loading={deleteDeptMutation.isLoading}
      />
    </div>
  );
};

export default Departments;
