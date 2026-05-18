import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "../../../components/other/Card";
import { HeadingComponent } from "../../../components/other/HeadingComponent";
import { Button } from "../../../components/ui/button";
import ReusableTable from "../../../components/other/ReusableTable/ReusableTable";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { FiInfo, FiCheckCircle, FiTrendingUp } from "react-icons/fi";
import { MoreVertical, Eye, Pencil, Trash2, FileText } from "lucide-react";
import { type Expense } from "../financeApi";
import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { toast } from "sonner";
import useFetchHook from "../../../Hooks/UseFetchHook";
import useUpdate from "../../../Hooks/UseUpdateHook";
import { useUserStore } from "../../../Store/UserStore";

export const Expenses = () => {
  // Navigation + UI state.
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const roles = useUserStore((s) => s.roles);
  const permissions = useUserStore((s) => s.permissions);
  const isSuperAdmin = roles.includes("SUPER_ADMIN");

  const checkPermission = (action: string) => {
    if (isSuperAdmin) return true;
    return permissions.some(
      (p) =>
        p.module === "finance" &&
        p.resource_type === "expenses" &&
        p.action === action,
    );
  };

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeletingExpense, setIsDeletingExpense] = useState(false);
  const [isApprovingExpense, setIsApprovingExpense] = useState(false);
  const { updateData } = useUpdate<any>();

  const {
    data: expensesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useFetchHook<{ data: Expense[] }>(
    "/finance/expenses?page=1&page_size=50",
    "finance-expenses",
  );

  useEffect(() => {
    if (expensesResponse?.data) {
      setExpenses(expensesResponse.data);
    }
  }, [expensesResponse?.data]);

  useEffect(() => {
    if (!openMenuId) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-expense-action-menu="true"]')) return;
      setOpenMenuId(null);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [openMenuId]);

  const { data: departmentsData } = useFetchHook(
    "/users/departments",
    "departments",
  );
  const departmentMap = useMemo(() => {
    const rawDepartments = departmentsData?.data || [];
    return new Map<string, string>(
      rawDepartments.map((dept: any) => [
        dept.department_id,
        dept.department_name,
      ]),
    );
  }, [departmentsData]);
  const canApproveExpense =
    roles.includes('SUPER_ADMIN') ||
    permissions.some(
      (permission) =>
        permission.module === 'finance' &&
        ['expense', 'expenses'].includes(permission.resource_type) &&
        ['APPROVE', 'UPDATE'].includes(permission.action)
    );

  // Summary stats derived from the current list.
  const stats = {
    totalPending: 0,
    totalApproved: 0,
    budgetUtilization: 78,
  };

  // Aggregate counts for the metric cards.
  expenses.forEach((exp) => {
    if (
      [
        "PENDING",
        "PENDING_APPROVAL",
        "PENDING_DEPT_HEAD",
        "PENDING_FINANCE",
      ].includes(exp.status)
    ) {
      stats.totalPending++;
    }
    if (["APPROVED", "PAID"].includes(exp.status)) stats.totalApproved++;
  });

  // Status badge color helper.
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
      case "PENDING_APPROVAL":
      case "PENDING_DEPT_HEAD":
      case "PENDING_FINANCE":
        return "text-blue-600 bg-blue-50";
      case "APPROVED":
        return "text-green-600 bg-green-50";
      case "IN_REVIEW":
        return "text-orange-600 bg-orange-50";
      case "REJECTED":
        return "text-red-600 bg-red-50";
      case "PAID":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  // Initials for the requestor avatar.
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const handleViewExpense = (expenseId: string) => {
    navigate(`/dashboard/expenses/${expenseId}`);
  };

  const handleEditExpense = (expenseId: string) => {
    if (!checkPermission("UPDATE")) {
      navigate("/dashboard/unauthorized");
      return;
    }
    navigate(`/dashboard/expenses/add?editId=${expenseId}`);
  };

  const canEditExpense = (status: string) =>
    !['APPROVED', 'REJECTED', 'PAID'].includes((status || '').toUpperCase());

  // Open the delete confirmation dialog.
  const handleDeleteExpense = (expenseId: string) => {
    setDeleteId(expenseId);
    setDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  // Confirm deletion and update the list.
  const confirmDelete = async () => {
    if (!deleteId) return;
    setExpenses((prev) =>
      prev.filter((expense) => expense.expense_id !== deleteId),
    );
    toast.success("Expense deleted successfully.");
    setDeleteModalOpen(false);
    setDeleteId(null);
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setDeleteId(null);
  };

  const handleApproveExpense = async (expenseId: string) => {
    setIsApprovingExpense(true);
    try {
      await updateData(`/finance/expenses/${expenseId}`, { status: 'APPROVED' }, 'patch');
      await queryClient.invalidateQueries({ queryKey: ['finance-budgets'] });
      await queryClient.invalidateQueries({ queryKey: ['finance-dashboard'] });
      queryClient.removeQueries({ queryKey: ['finance-budgets'] });
      toast.success('Expense approved successfully.');
      setOpenMenuId(null);
      await refetch();
    } catch (approveError: any) {
      toast.error(approveError?.response?.data?.message || 'Failed to approve expense.');
    } finally {
      setIsApprovingExpense(false);
    }
  };

  const handleRejectExpense = async (expenseId: string) => {
    setIsApprovingExpense(true);
    try {
      await updateData(`/finance/expenses/${expenseId}`, { status: 'REJECTED' }, 'patch');
      await queryClient.invalidateQueries({ queryKey: ['finance-budgets'] });
      await queryClient.invalidateQueries({ queryKey: ['finance-dashboard'] });
      queryClient.removeQueries({ queryKey: ['finance-budgets'] });
      toast.success('Expense rejected successfully.');
      setOpenMenuId(null);
      await refetch();
    } catch (rejectError: any) {
      toast.error(rejectError?.response?.data?.message || 'Failed to reject expense.');
    } finally {
      setIsApprovingExpense(false);
    }
  };

  const expenseColumns = useMemo(
    () => [
      {
        key: "title",
        header: "Description",
        render: (_value: string, row: Expense) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-sm text-gray-900">
              {row.title || row.description || "Untitled expense"}
            </p>
          </div>
        ),
      },
      {
        key: "department_id",
        header: "Category",
        render: (_value: string, row: Expense) =>
          departmentMap.get(row.department_id) ||
          row.department_name ||
          "General",
      },
      {
        key: "employee_name",
        header: "Requestor",
        render: (value: string, row: Expense) => (
          <div className="flex min-w-0 items-center gap-2">
            <div className="w-8 h-8 shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium">
              {getInitials(value || row.employee_id || "UN")}
            </div>
            <span className="min-w-0 truncate text-sm text-gray-700">
              {value || row.employee_id || "Unknown"}
            </span>
          </div>
        ),
      },
      {
        key: "created_at",
        header: "Date",
        render: (value: string) =>
          new Date(value).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
      },
      {
        key: "amount",
        header: "Amount",
        render: (_value: number, row: Expense) => (
          <span className="font-medium text-gray-900">
            {row.currency || "XAF"} {Number(row.amount).toLocaleString()}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        render: (value: string) => (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(value)}`}
          >
            {value}
          </span>
        ),
      },
      {
        key: "receipt",
        header: "Receipt",
        render: () => (
          <button className="p-2 hover:bg-gray-100 rounded">
            <FileText className="w-4 h-4 text-gray-400" />
          </button>
        ),
        truncate: false,
      },
      {
        key: "actions",
        header: "Actions",
        render: (_value: any, row: Expense) => (
          <div
            className="relative flex justify-center"
            data-expense-action-menu="true"
          >
            <button
              type="button"
              className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId((prev) =>
                  prev === row.expense_id ? null : row.expense_id,
                );
              }}
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            {openMenuId === row.expense_id && (
              <div
                className="absolute right-0 top-9 z-10 min-w-32 rounded-md border border-gray-200 bg-white py-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => {
                    setOpenMenuId(null);
                    handleViewExpense(row.expense_id);
                  }}
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                {canEditExpense(row.status) && (
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => {
                      setOpenMenuId(null);
                      handleEditExpense(row.expense_id);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                )}
                {canApproveExpense && row.status !== 'APPROVED' && (
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm text-green-600 hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => handleApproveExpense(row.expense_id)}
                    disabled={isApprovingExpense}
                  >
                    <FiCheckCircle className="w-4 h-4" />
                    {isApprovingExpense ? 'Approving...' : 'Approve'}
                  </button>
                )}
                {canApproveExpense && row.status !== 'REJECTED' && (
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm text-amber-600 hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => handleRejectExpense(row.expense_id)}
                    disabled={isApprovingExpense}
                  >
                    <Trash2 className="w-4 h-4" />
                    {isApprovingExpense ? 'Updating...' : 'Reject'}
                  </button>
                )}
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => handleDeleteExpense(row.expense_id)}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        ),
        truncate: false,
      },
    ],
    [handleDeleteExpense, handleEditExpense, handleViewExpense, openMenuId],
  );

  if (isLoading) {
    // Consistent loading experience across finance pages.
    return <SkeletonLoading />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-red-500 mb-4">
          {(error as any)?.response?.data?.message || "Failed to load expenses"}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <HeadingComponent
          heading="Expenses"
          subHeading="Manage money that leaves the coffers"
        />
        <Button
          buttonType="add"
          className="bg-[#3d4094] hover:bg-[#2d3074]"
          onClick={() => {
            if (!checkPermission("CREATE")) {
              navigate("/dashboard/unauthorized");
              return;
            }
            navigate("/dashboard/expenses/add");
          }}
        >
          Add Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          heading="Total Pending"
          amount={stats.totalPending.toString()}
          currency="FCFA"
          icons={<FiInfo />}
          cardStyle={{
            background: "linear-gradient(135deg, #4f46a1 0%, #2f71b7 100%)",
          }}
          cardClassName="min-h-[120px]"
          headingClassName="text-white/90"
          amountClassName="text-white text-4xl font-semibold"
          currencyClassName="text-white/80 text-sm"
          iconBackgroundColor="#ffffff"
          iconClassName="text-gray-900 h-5 w-5"
        />
        <Card
          heading="Approved"
          amount={stats.totalApproved.toString()}
          currency="FCFA"
          icons={<FiCheckCircle className="h-5 w-5 text-white" />}
        />
        <Card
          heading="Budget Utilization"
          amount={`${stats.budgetUtilization}%`}
          currency="Under Projected"
          icons={<FiTrendingUp className="h-5 w-5 text-white" />}
        />
      </div>

      <div className="w-full rounded-2xl py-4 px-5 bg-white">
        <ReusableTable
          columns={expenseColumns}
          data={expenses}
          heading="Expenditures Management"
          showToolbar
          showHeading
          showSearch
          showFilter
          filterKey="status"
          filterOptions={[
            { key: "status", value: "PENDING", label: "Pending" },
            { key: "status", value: "APPROVED", label: "Approved" },
            { key: "status", value: "PAID", label: "Paid" },
            { key: "status", value: "REJECTED", label: "Rejected" },
          ]}
          searchKeys={[
            "title",
            "description",
            "department_name",
            "employee_name",
            "status",
          ]}
          itemsPerPage={Math.max(1, expenses.length)}
        />
      </div>

      <AlertDialog
        open={deleteModalOpen}
        onOpenChange={(open) => {
          if (!open) cancelDelete();
        }}
      >
        <AlertDialogContent onOverlayClick={cancelDelete}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <button
              onClick={cancelDelete}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={isDeletingExpense}
              className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              {isDeletingExpense ? 'Deleting...' : 'Delete'}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
