import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LuPlus } from "react-icons/lu";
import { FaBuilding } from "react-icons/fa";
import { Card } from "../../../components/other/Card";
import DepartmentTable from "./components/DepartmentTable";
import DepartmentForm from "./components/DepartmentForm";
import ConfirmDeleteDialog from "./components/ConfirmDeleteDialog";
import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { toast } from "sonner";
import type { Department, DepartmentFormData } from "./types";
import {
  useDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "./api";
import { Button } from "@/components/ui/button";
import { useUserStore } from "../../../Store/UserStore";

type ViewMode = "list" | "add" | "edit";

const Departments: React.FC = () => {
  const navigate = useNavigate();
  const roles = useUserStore((state) => state.roles);
  const permissions = useUserStore((state) => state.permissions);
  const isSuperAdmin = roles.includes("SUPER_ADMIN");

  const checkPermission = (action: string) => {
    if (isSuperAdmin) return true;
    return permissions.some(
      (p: any) =>
        p.module === "hr" &&
        p.resource_type === "employee" &&
        p.action === action,
    );
  };

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedDepartment, setSelectedDepartment] = useState<
    Department | undefined
  >();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 10,
    has_next: false,
    has_prev: false,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    department?: Department;
  }>({
    isOpen: false,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { fetchDepartments } = useDepartments();
  const { createDepartment } = useCreateDepartment();
  const { updateDepartment } = useUpdateDepartment();
  const { deleteDepartment } = useDeleteDepartment();

  const loadDepartments = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await fetchDepartments(page);
      setDepartments(response.data.departments);
      setPagination(response.data.pagination);
      setCurrentPage(page);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to load departments";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page: number) => {
    loadDepartments(page);
  };

  useEffect(() => {
    if (viewMode === "list") {
      loadDepartments(1);
    }
  }, [viewMode]);

  const handleAddDepartment = () => {
    if (!checkPermission("CREATE")) {
      navigate("/dashboard/unauthorized");
      return;
    }
    setSelectedDepartment(undefined);
    setViewMode("add");
  };

  const handleViewDepartment = (department: Department) => {
    navigate(`/departments/${department.department_id}`);
    console.log("departments");
  };

  const handleDeleteDepartment = (departmentId: string) => {
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
      setDeleteLoading(true);
      await deleteDepartment(deleteDialog.department.department_id);
      setDepartments((prev) =>
        prev.filter(
          (dept) =>
            dept.department_id !== deleteDialog.department!.department_id,
        ),
      );
      setDeleteDialog({ isOpen: false });
      toast.success("Department deleted successfully");
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to delete department. Please try again.";
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeleteDialog({ isOpen: false });
  };

  const handleSaveDepartment = async (formData: DepartmentFormData) => {
    try {
      setLoading(true);

      const commonData = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        department_head_id: formData.department_head_id || undefined,
        parent_department_id: formData.parent_department_id || undefined,
        contact_email: formData.contact_email || undefined,
        contact_phone: formData.contact_phone || undefined,
        location: formData.location || undefined,
        budget_allocation: formData.budget
          ? Number(formData.budget)
          : undefined,
        status: formData.status,
      };

      if (selectedDepartment) {
        await updateDepartment({
          departmentId: selectedDepartment.department_id,
          ...commonData,
        });
        toast.success("Department updated successfully");
      } else {
        await createDepartment(commonData);
        toast.success("Department created successfully");
      }

      setViewMode("list");
      setSelectedDepartment(undefined);
      loadDepartments(1);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "Failed to save department. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setViewMode("list");
    setSelectedDepartment(undefined);
  };

  if (viewMode === "add" || viewMode === "edit") {
    return (
      <DepartmentForm
        department={selectedDepartment}
        onSave={handleSaveDepartment}
        onCancel={handleCancel}
        loading={loading}
      />
    );
  }

  if (loading) {
    return (
      
        <SkeletonLoading />
    );
  }

  return (
    <div className="min-h-screen">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 m-0">
            Department Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage DIGISOL's departments and their details
          </p>
        </div>
        <Button onClick={handleAddDepartment} className="gap-2">
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
        loading={deleteLoading}
      />
    </div>
  );
};

export default Departments;
