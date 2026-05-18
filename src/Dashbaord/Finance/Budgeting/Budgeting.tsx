import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/other/Card';
import ReusableTable from '../../../components/other/ReusableTable/ReusableTable';
import SkeletonLoading from '../../../components/other/Loader/SkeletonLoading/SkeletonLoading';
import { getBudgetUtilization, type Budget } from '../financeApi';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  FaFileInvoice,
  FaMoneyBillWave,
  FaChartLine,
  FaArrowTrendUp,
  FaCircleExclamation,
  FaTriangleExclamation,
  FaXmark,
} from 'react-icons/fa6';
import useFetchHook from '../../../Hooks/UseFetchHook';
import useUpdate from '../../../Hooks/UseUpdateHook';

type AlertSeverity = 'critical' | 'exceeded' | 'warning';

interface BudgetAlertProps {
  severity: AlertSeverity;
  department: string;
  message: string;
  percentage: string;
  onDismiss?: () => void;
}

interface DepartmentBudget {
  id: string;
  department: string;
  allocated: string;
  spent: string;
  remaining: string;
  utilization: number;
  variance: string;
  varianceType: 'positive' | 'negative';
  allocatedValue: number;
  spentValue: number;
  remainingValue: number;
  varianceValue: number;
}

interface DepartmentBudgetTableProps {
  budgets: DepartmentBudget[];
  onViewDetails?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

// Visual config for alert severity badges.
const alertConfig = {
  critical: {
    icon: FaCircleExclamation,
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    iconColor: 'text-red-500',
    borderColor: 'border-red-200',
    label: 'Critical',
  },
  exceeded: {
    icon: FaCircleExclamation,
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    iconColor: 'text-red-500',
    borderColor: 'border-red-200',
    label: 'Exceeded',
  },
  warning: {
    icon: FaTriangleExclamation,
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-600',
    iconColor: 'text-yellow-500',
    borderColor: 'border-yellow-200',
    label: 'Warning',
  },
};

// Budget alert banner used for the alert list.
const BudgetAlert: React.FC<BudgetAlertProps> = ({
  severity,
  department,
  message,
  percentage,
  onDismiss,
}) => {
  const config = alertConfig[severity];
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 flex items-start gap-3`}>
      <Icon className={`${config.iconColor} text-xl mt-0.5 shrink-0`} />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className={`${config.textColor} font-semibold text-sm`}>{config.label}</span>
          <span className="text-gray-400">-</span>
          <span className="text-gray-600 text-sm">{department}</span>
        </div>
        <p className={`${config.textColor} text-sm`}>{message}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`${config.textColor} font-bold text-sm`}>{percentage}</span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaXmark />
          </button>
        )}
      </div>
    </div>
  );
};

// Map utilization to a progress bar color.
const getUtilizationColor = (utilization: number) => {
  if (utilization >= 100) return 'bg-red-500';
  if (utilization >= 80) return 'bg-orange-500';
  if (utilization >= 50) return 'bg-teal-500';
  return 'bg-green-500';
};

// Budget table using the reusable table component.
const DepartmentBudgetTable: React.FC<DepartmentBudgetTableProps> = ({
  budgets,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const columns = [
    {
      key: 'department',
      header: 'Department',
      render: (value: string) => (
        <span className="text-sm font-medium text-gray-900">{value}</span>
      ),
    },
    {
      key: 'allocated',
      header: 'Allocated',
      render: (value: string) => <span className="text-sm text-gray-700">{value}</span>,
    },
    {
      key: 'spent',
      header: 'Spent',
      render: (value: string) => <span className="text-sm text-gray-700">{value}</span>,
    },
    {
      key: 'remaining',
      header: 'Remaining',
      render: (value: string) => <span className="text-sm text-gray-700">{value}</span>,
    },
    {
      key: 'utilization',
      header: 'Utilization',
      render: (value: number) => (
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-30">
            <div
              className={`h-2 rounded-full ${getUtilizationColor(value)}`}
              style={{ width: `${Math.min(value, 100)}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700 min-w-10">{value}%</span>
        </div>
      ),
      truncate: false,
    },
    {
      key: 'variance',
      header: 'Variance',
      render: (value: string, row: DepartmentBudget) => (
        <span
          className={`text-sm font-medium ${
            row.varianceType === 'positive' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_: unknown, row: DepartmentBudget) => (
        <div className="relative flex justify-center">
          <button
            type="button"
            className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100"
            onClick={(event) => {
              event.stopPropagation();
              setOpenMenuId((prev) => (prev === row.id ? null : row.id));
            }}
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
          {openMenuId === row.id && (
            <div
              className="absolute right-0 top-9 z-10 min-w-30 rounded-md border border-gray-200 bg-white py-1"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                onClick={() => {
                  setOpenMenuId(null);
                  onViewDetails?.(row.id);
                }}
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                onClick={() => {
                  setOpenMenuId(null);
                  onEdit?.(row.id);
                }}
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                onClick={() => {
                  setOpenMenuId(null);
                  onDelete?.(row.id);
                }}
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
  ];

  // Filter options for the reusable table.
  const filterOptions = [
    { key: 'varianceType', value: 'positive', label: 'Positive Variance' },
    { key: 'varianceType', value: 'negative', label: 'Negative Variance' },
  ];

  // Reusable table for department budgets
  return (
    <ReusableTable
      columns={columns}
      data={budgets}
      heading="Department Budgets"
      showToolbar={true}
      showHeading={true}
      showSearch={true}
      showFilter={true}
      filterKey="varianceType"
      filterOptions={filterOptions}
      searchKeys={['department']}
      itemsPerPage={5}
    />
  );
};

interface Alert {
  id: string;
  severity: AlertSeverity;
  department: string;
  message: string;
  percentage: string;
}

export const Budgeting = () => {
  // Navigation for the Add Budget action.
  const navigate = useNavigate();
  // Delete confirmation dialog state.
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Table data held in state so rows can be updated locally.
  const [departmentBudgets, setDepartmentBudgets] = useState<DepartmentBudget[]>([]);
  const [isUtilizationLoading, setIsUtilizationLoading] = useState(false);
  const { updateData, loading: isClosingBudget } = useUpdate<any>();

  const {
    data: budgetsResponse,
    isLoading: isBudgetsLoading,
    isError,
    error,
    refetch,
  } = useFetchHook<{ data: Budget[] }>(
    '/finance/budgets?page=1&page_size=50',
    'finance-budgets',
    { refetchOnWindowFocus: true, staleTime: 0 }
  );

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k`;
    }
    return amount.toLocaleString();
  };

  const formatTableCurrency = (value: number) => `${value.toLocaleString()} XAF`;

  useEffect(() => {
    if (!budgetsResponse?.data) {
      setDepartmentBudgets([]);
      setAlerts([]);
      setIsUtilizationLoading(false);
      return;
    }

    let isMounted = true;
    const hydrateBudgets = async () => {
      setIsUtilizationLoading(true);
      const budgets = (budgetsResponse.data || []).filter(
        (budget) => (budget.status || '').toUpperCase() !== 'CLOSED'
      );

      const utilizationResults = await Promise.all(
        budgets.map(async (budget) => {
          try {
            return await getBudgetUtilization(budget.budget_id);
          } catch {
            return null;
          }
        })
      );

      if (!isMounted) return;

      const mappedBudgets: DepartmentBudget[] = budgets.map((budget, index) => {
        const utilization = utilizationResults[index];
        const allocatedValue = utilization?.total_allocated ?? budget.total_amount ?? 0;
        const spentValue = utilization?.total_spent ?? 0;
        const remainingValue =
          utilization?.remaining ?? Math.max(allocatedValue - spentValue, 0);
        const utilizationValue =
          utilization?.utilization_percentage ??
          (allocatedValue > 0 ? Math.round((spentValue / allocatedValue) * 100) : 0);
        const varianceValue = allocatedValue - spentValue;

        return {
          id: budget.budget_id,
          department: budget.department?.department_name || budget.department_name || 'Unknown',
          allocated: formatTableCurrency(allocatedValue),
          spent: formatTableCurrency(spentValue),
          remaining: formatTableCurrency(remainingValue),
          utilization: utilizationValue,
          variance: `${varianceValue >= 0 ? '+' : '-'}${formatTableCurrency(Math.abs(varianceValue))}`,
          varianceType: varianceValue >= 0 ? 'positive' : 'negative',
          allocatedValue,
          spentValue,
          remainingValue,
          varianceValue,
        };
      });

      setDepartmentBudgets(mappedBudgets);

      const nextAlerts: Alert[] = mappedBudgets
        .filter((budget) => budget.utilization >= 85)
        .map((budget) => {
          const severity: AlertSeverity =
            budget.utilization > 100
              ? 'exceeded'
              : budget.utilization >= 95
                ? 'critical'
                : 'warning';

          const message =
            severity === 'exceeded'
              ? 'Budget exceeded. Immediate action required.'
              : severity === 'critical'
                ? 'Budget utilization at critical level. Review recommended.'
                : 'Approaching budget threshold. Monitor spending closely.';

          return {
            id: budget.id,
            severity,
            department: budget.department,
            message,
            percentage: `${budget.utilization}%`,
          };
        });

      setAlerts(nextAlerts);
      setIsUtilizationLoading(false);
    };

    hydrateBudgets();
    return () => {
      isMounted = false;
    };
  }, [budgetsResponse?.data]);

  // Remove a dismissed alert from the UI.
  const handleDismissAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  // Placeholder for details navigation when route is added.
  const handleViewDetails = (id: string) => {
    navigate(`/dashboard/budgeting/${id}`);
  };

  const handleEditBudget = (id: string) => {
    navigate(`/dashboard/budgeting/add?editId=${id}`);
  };

  const handleDeleteBudget = (id: string) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await updateData(`/finance/budgets/${deleteId}`, { status: 'CLOSED' });
      setDepartmentBudgets((prev) => prev.filter((budget) => budget.id !== deleteId));
      setAlerts((prev) => prev.filter((alert) => alert.id !== deleteId));
      toast.success('Budget deleted successfully.');
      await refetch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete budget.');
    } finally {
      setDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setDeleteId(null);
  };

  // Navigate to the add budget form.
  const handleAddBudget = () => {
    navigate('add');
  };

  const budgetTotals = useMemo(() => {
    const totals = departmentBudgets.reduce(
      (acc, budget) => {
        acc.allocated += budget.allocatedValue || 0;
        acc.spent += budget.spentValue || 0;
        acc.remaining += budget.remainingValue || 0;
        return acc;
      },
      { allocated: 0, spent: 0, remaining: 0 }
    );

    return {
      ...totals,
      variance: totals.allocated - totals.spent,
    };
  }, [departmentBudgets]);

  if (isBudgetsLoading || isUtilizationLoading) {
    return <SkeletonLoading />
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-red-500 mb-4">{(error as any)?.response?.data?.message || 'Failed to load budgets'}</p>
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
    <div>
      {/* Title and Add Button */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Budgeting</h1>
          <p className="text-sm text-gray-500">Manage allocated budgets and compare with actual</p>
        </div>
        <button
          onClick={handleAddBudget}
          className="bg-indigo-900  text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
        >
          Add Budget
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card
          heading="Total Allocated"
          amount={formatCurrency(budgetTotals.allocated)}
          currency="XAF"
          icons={<FaFileInvoice />}
          cardStyle={{ background: 'linear-gradient(135deg, #4f46a1 0%, #2f71b7 100%)' }}
          cardClassName="min-h-[120px]"
          headingClassName="text-white/90"
          amountClassName="text-white text-4xl font-semibold"
          currencyClassName="text-white/80 text-sm"
          iconBackgroundColor="#ffffff"
          iconClassName="text-gray-900 text-lg"
        />
        <Card
          heading="Total Spent"
          amount={formatCurrency(budgetTotals.spent)}
          currency="XAF"
          icons={<FaMoneyBillWave className="text-white text-xl" />}
        />
        <Card
          heading="Remaining Budget"
          amount={formatCurrency(budgetTotals.remaining)}
          currency="XAF"
          icons={<FaChartLine className="text-white text-xl" />}
        />
        <Card
          heading="Budget Variance"
          amount={`${budgetTotals.variance >= 0 ? '' : '-'}${formatCurrency(Math.abs(budgetTotals.variance))}`}
          currency="XAF"
          icons={<FaArrowTrendUp className="text-white text-xl" />}
        />
      </div>

      {/* Budget Alerts */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Alerts</h2>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <BudgetAlert
              key={alert.id}
              severity={alert.severity}
              department={alert.department}
              message={alert.message}
              percentage={alert.percentage}
              onDismiss={() => handleDismissAlert(alert.id)}
            />
          ))}
        </div>
      </div>

      {/* Department Budgets Table */}
      <DepartmentBudgetTable
        budgets={departmentBudgets}
        onViewDetails={handleViewDetails}
        onEdit={handleEditBudget}
        onDelete={handleDeleteBudget}
      />

      <AlertDialog
        open={deleteModalOpen}
        onOpenChange={(open) => {
          if (!open) cancelDelete();
        }}
      >
        <AlertDialogContent onOverlayClick={cancelDelete}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Budget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this budget? This action cannot be undone.
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
              disabled={isClosingBudget}
              className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              {isClosingBudget ? 'Deleting...' : 'Delete'}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default Budgeting;

