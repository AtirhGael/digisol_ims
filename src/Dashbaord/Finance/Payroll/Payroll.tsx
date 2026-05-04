import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/other/Card";
import { HeadingComponent } from "../../../components/other/HeadingComponent";
import ReusableTable from "../../../components/other/ReusableTable/ReusableTable";
import {
  FiEdit2,
  FiInfo,
  FiMoreVertical,
  FiTrash2,
  FiEye,
} from "react-icons/fi";
import { FaMoneyBillWave, FaUsers, FaChartLine } from "react-icons/fa6";
import { ChartLineLabel } from "../Dashboard/component/ChartLineLabel";
import { ChartBarStacked } from "../Dashboard/component/ChartBarStacked";
import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { type PayrollRecordApi } from "../financeApi";
import useFetchHook from "../../../Hooks/UseFetchHook";
import { useUserStore } from "../../../Store/UserStore";

// Row actions menu (View/Edit/Delete) with absolute positioning.
const PayrollRowActionsMenu = ({
  onView,
  onEdit,
  onDelete,
}: {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  // Local open state for the menu.
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  // Track menu position so it can be placed next to the trigger.
  const [menuPos, setMenuPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  // Position the menu relative to the trigger button.
  const updateMenuPosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMenuPos({
      top: rect.bottom + 6,
      left: rect.right - 144,
    });
  };

  useEffect(() => {
    if (open) updateMenuPosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // Close on outside click and keep position in sync on scroll/resize.
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    const handleReposition = () => updateMenuPosition();
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [open]);

  return (
    <div className="relative" style={{ zIndex: open ? 1000 : 1 }}>
      <button
        ref={triggerRef}
        type="button"
        className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100"
        onClick={() => setOpen((prev) => !prev)}
      >
        <FiMoreVertical className="w-4 h-4 text-gray-600" />
      </button>
      {open && (
        <div
          ref={menuRef}
          className="fixed z-1000 w-36 rounded-md border border-gray-200 bg-white py-1 "
          style={{ top: menuPos.top, left: menuPos.left }}
        >
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-sm text-gray-700 flex items-center gap-2.5 hover:bg-gray-50"
            onClick={() => {
              setOpen(false);
              onView();
            }}
          >
            <FiEye className="w-4 h-4" />
            <span>View</span>
          </button>
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-sm text-gray-700 flex items-center gap-2.5 hover:bg-gray-50"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
          >
            <FiEdit2 className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            type="button"
            className="w-full px-4 py-2 text-left text-sm text-red-600 flex items-center gap-2.5 hover:bg-gray-50"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            <FiTrash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

type PayrollRow = {
  id: string;
  name: string;
  department: string;
  payDate: string;
  basicSalary: string;
  bonuses: string;
  totalSalary: string;
  status: string;
};

const formatCurrency = (value: number, currency = "XAF") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatCompact = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);

const statusLabelMap: Record<PayrollRecordApi["status"], string> = {
  PENDING: "Pending",
  PAID: "Paid",
  PARTIALLY_PAID: "Partially Paid",
};

export const Payroll = () => {
  // Navigation + table search.
  const navigate = useNavigate();
  const roles = useUserStore((s) => s.roles);
  const permissions = useUserStore((s) => s.permissions);

  const checkPermission = (action: string) => {
    if (roles.includes("SUPER_ADMIN")) return true;
    return permissions.some(
      (p) =>
        p.module === "finance" &&
        p.resource_type === "payroll" &&
        p.action === action,
    );
  };

  const [searchQuery, setSearchQuery] = useState("");
  // Backend-driven payroll data.
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecordApi[]>([]);
  // Delete dialog state.
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    data: payrollResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useFetchHook<{ data: PayrollRecordApi[] }>(
    "/payroll?page=1&page_size=10",
    "finance-payroll",
  );

  useEffect(() => {
    if (payrollResponse?.data) {
      setPayrollRecords(payrollResponse.data);
    }
  }, [payrollResponse?.data]);

  // Status badge color helper.
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "text-yellow-600 bg-yellow-50";
      case "Paid":
        return "text-green-600 bg-green-50";
      case "Partially Paid":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const handleViewPayroll = (id: string) => {
    navigate(`/dashboard/payroll/${id}`);
  };

  // Edit navigates to the Add Payroll page in edit mode.
  const handleEditPayroll = (id: string) => {
    if (!checkPermission("UPDATE")) {
      navigate("/dashboard/unauthorized");
      return;
    }
    navigate(`/dashboard/payroll/add?editId=${id}`);
  };

  // Open delete confirmation.
  const handleDeletePayroll = (id: string) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  // Confirm delete action.
  const confirmDelete = () => {
    if (!deleteId || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    // Backend does not expose a delete endpoint for payroll.
    const message = "Delete is not available for payroll records yet.";
    setDeleteError(message);
    toast.error(message);
    setIsDeleting(false);
  };

  // Cancel delete dialog.
  const cancelDelete = () => {
    if (isDeleting) return;
    setDeleteModalOpen(false);
    setDeleteId(null);
    setDeleteError(null);
  };

  // Filter data by the search term.
  const tableRows = useMemo<PayrollRow[]>(() => {
    return payrollRecords.map((record) => {
      const currency = record.currency || "XAF";
      return {
        id: record.record_id,
        name: record.employee_name || "Unknown",
        department: record.department_name || "N/A",
        payDate: record.pay_date
          ? new Date(record.pay_date).toLocaleDateString("en-US")
          : "N/A",
        basicSalary: formatCurrency(record.gross_salary || 0, currency),
        bonuses: formatCurrency(record.bonuses || 0, currency),
        totalSalary: formatCurrency(
          record.net_salary || record.gross_salary || 0,
          currency,
        ),
        status: statusLabelMap[record.status] || record.status,
      };
    });
  }, [payrollRecords]);

  const filteredPayrollRecords = tableRows.filter(
    (record) =>
      record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.status.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Monthly stats based on the payroll records.
  const { totalPayroll, totalEmployeesPaid, averageSalary } = useMemo(() => {
    const now = new Date();
    const monthRecords = payrollRecords.filter((record) => {
      if (!record.pay_date) return false;
      const payDate = new Date(record.pay_date);
      return (
        payDate.getMonth() === now.getMonth() &&
        payDate.getFullYear() === now.getFullYear()
      );
    });

    const total = monthRecords.reduce(
      (sum, record) => sum + (record.net_salary || 0),
      0,
    );
    const uniqueEmployees = new Set(
      monthRecords.map((record) => record.employee_id),
    ).size;
    const average = monthRecords.length ? total / monthRecords.length : 0;

    return {
      totalPayroll: total,
      totalEmployeesPaid: uniqueEmployees,
      averageSalary: average,
    };
  }, [payrollRecords]);

  const payrollTrendData = useMemo(() => {
    const totalsByMonth = new Map<string, number>();
    payrollRecords.forEach((record) => {
      if (!record.pay_date) return;
      const payDate = new Date(record.pay_date);
      if (Number.isNaN(payDate.getTime())) return;
      const key = `${payDate.getFullYear()}-${payDate.getMonth()}`;
      const amount = record.net_salary ?? record.gross_salary ?? 0;
      totalsByMonth.set(key, (totalsByMonth.get(key) || 0) + amount);
    });

    const now = new Date();
    const series = [];
    for (let i = 11; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      series.push({
        month: date.toLocaleString("en-US", { month: "short" }),
        value: totalsByMonth.get(key) || 0,
      });
    }
    return series;
  }, [payrollRecords]);

  const payrollDistributionData = useMemo(() => {
    const totals = new Map<string, { salary: number; bonuses: number }>();
    payrollRecords.forEach((record) => {
      const department = record.department_name || "Unassigned";
      const salary = record.net_salary ?? record.gross_salary ?? 0;
      const bonuses = record.bonuses ?? 0;
      const current = totals.get(department) || { salary: 0, bonuses: 0 };
      totals.set(department, {
        salary: current.salary + salary,
        bonuses: current.bonuses + bonuses,
      });
    });

    const sorted = Array.from(totals.entries())
      .map(([department, values]) => ({
        department,
        salary: values.salary,
        bonuses: values.bonuses,
        total: values.salary + values.bonuses,
      }))
      .sort((a, b) => b.total - a.total);

    const formatDepartment = (name: string) =>
      name.length > 9 ? `${name.slice(0, 8)}...` : name;

    const topDepartments = sorted.slice(0, 5).map((item) => ({
      department: formatDepartment(item.department),
      salary: item.salary,
      bonuses: item.bonuses,
    }));

    const remaining = sorted.slice(5);
    if (remaining.length) {
      const others = remaining.reduce(
        (acc, item) => ({
          salary: acc.salary + item.salary,
          bonuses: acc.bonuses + item.bonuses,
        }),
        { salary: 0, bonuses: 0 },
      );
      topDepartments.push({
        department: "Others",
        salary: others.salary,
        bonuses: others.bonuses,
      });
    }

    return topDepartments;
  }, [payrollRecords]);

  const payrollDistributionChange = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const previousYear = currentYear - 1;
    let currentTotal = 0;
    let previousTotal = 0;

    payrollRecords.forEach((record) => {
      if (!record.pay_date) return;
      const payDate = new Date(record.pay_date);
      if (Number.isNaN(payDate.getTime())) return;
      const amount = record.net_salary ?? record.gross_salary ?? 0;
      if (payDate.getFullYear() === currentYear) {
        currentTotal += amount;
      } else if (payDate.getFullYear() === previousYear) {
        previousTotal += amount;
      }
    });

    if (!previousTotal) {
      return { label: "No prior year data", tone: "neutral" as const };
    }

    const changePercent =
      ((currentTotal - previousTotal) / previousTotal) * 100;
    return {
      label: `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(1)}% from last year`,
      tone: changePercent >= 0 ? ("positive" as const) : ("negative" as const),
    };
  }, [payrollRecords]);

  // ReusableTable columns config.
  const payrollColumns = [
    {
      key: "name",
      header: "Name",
      render: (value: string) => (
        <span className="text-sm text-gray-700">{value}</span>
      ),
    },
    {
      key: "basicSalary",
      header: "Basic Salary",
      render: (value: string) => (
        <span className="text-sm text-gray-700">{value}</span>
      ),
    },
    {
      key: "department",
      header: "Department",
      render: (value: string) => (
        <span className="text-sm text-gray-700">{value}</span>
      ),
    },
    {
      key: "payDate",
      header: "Pay Date",
      render: (value: string) => (
        <span className="text-sm text-gray-700">{value}</span>
      ),
    },
    {
      key: "bonuses",
      header: "Bonuses",
      render: (value: string) => (
        <span className="text-sm text-gray-700">{value}</span>
      ),
    },
    {
      key: "totalSalary",
      header: "Total Salary",
      render: (value: string) => (
        <span className="text-sm font-medium text-gray-900">{value}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value: string) => (
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}
        >
          {value}
        </span>
      ),
      truncate: false,
    },
    {
      key: "actions",
      header: "Actions",
      render: (_: unknown, row: PayrollRow) => (
        <PayrollRowActionsMenu
          onView={() => handleViewPayroll(row.id)}
          onEdit={() => handleEditPayroll(row.id)}
          onDelete={() => handleDeletePayroll(row.id)}
        />
      ),
      truncate: false,
    },
  ];

  if (isLoading) {
    return <SkeletonLoading />;
  }

  return (
    <div className="space-y-6">
      {isError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {(error as any)?.response?.data?.message ||
            "Failed to load payroll records."}
          <button
            type="button"
            className="ml-3 underline"
            onClick={() => refetch()}
          >
            Retry
          </button>
        </div>
      )}
      {/* Header */}
      <div className="flex justify-between items-start">
        <HeadingComponent
          heading="Payroll"
          subHeading="Record every staff's pay"
        />
        <Button
          buttonType="add"
          className="bg-[#3d4094] hover:bg-[#2d3074]"
          onClick={() => {
            if (!checkPermission("CREATE")) {
              navigate("/dashboard/unauthorized");
              return;
            }
            navigate("/dashboard/payroll/add");
          }}
        >
          Add Payroll
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card
          heading="Total Payroll This Month"
          amount={formatCompact(totalPayroll)}
          currency="XAF, based on payroll records"
          icons={<FaMoneyBillWave />}
          cardStyle={{
            background: "linear-gradient(135deg, #4f46a1 0%, #2f71b7 100%)",
          }}
          cardClassName="min-h-[120px]"
          headingClassName="text-white/90"
          amountClassName="text-white text-4xl font-semibold"
          currencyClassName="text-white/80 text-sm"
          iconBackgroundColor="#ffffff"
          iconClassName="text-gray-900 text-lg"
        />
        <Card
          heading="Total Employees Paid"
          amount={totalEmployeesPaid.toString()}
          currency="Employees paid this month"
          icons={<FaUsers />}
          iconBackgroundColor="#f3f4f6"
          iconClassName="text-gray-600"
        />
        <Card
          heading="Average salary"
          amount={formatCompact(averageSalary)}
          currency="XAF, average per payroll"
          icons={<FaChartLine />}
          iconBackgroundColor="#f3f4f6"
          iconClassName="text-gray-600"
        />
      </div>

      {/* Info Alert */}
      <div className="bg-white border border-white rounded-lg p-4 flex items-start gap-3">
        <FiInfo className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-sm text-gray-600">
          Heads up! Payroll is due in 3 Days. Please ensure all employee data,
          attendance logs, and bonuses are finalized before April 17, 2025 to
          avoid delays in payment processing.
        </p>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartLineLabel data={payrollTrendData} />
        <ChartBarStacked
          data={payrollDistributionData}
          changeLabel={payrollDistributionChange.label}
          changeTone={payrollDistributionChange.tone}
        />
      </div>

      {/* Invoices And Payments Table */}
      <ReusableTable
        columns={payrollColumns}
        data={filteredPayrollRecords}
        heading="Invoices And Payments"
        showToolbar={true}
        showHeading={true}
        showSearch={true}
        showFilter={false}
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        searchKeys={["name", "department", "status"]}
        itemsPerPage={5}
      />

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog
        open={deleteModalOpen}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeleteModalOpen(false);
            setDeleteId(null);
            setDeleteError(null);
          }
        }}
      >
        <AlertDialogContent
          onOverlayClick={() => {
            if (isDeleting) return;
            cancelDelete();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payroll</AlertDialogTitle>
            <AlertDialogDescription>
              Deleting payroll records is not currently supported by the
              backend.
            </AlertDialogDescription>
            {deleteError && (
              <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {deleteError}
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <button
              onClick={cancelDelete}
              disabled={isDeleting}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium  hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 mt-2 sm:mt-0"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white  hover:bg-red-700 disabled:pointer-events-none disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
