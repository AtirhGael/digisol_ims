import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { HeadingComponent } from '../../../components/other/HeadingComponent';
import { Card } from '../../../components/other/Card';
import SkeletonLoading from '../../../components/other/Loader/SkeletonLoading/SkeletonLoading';
import useFetchHook from '../../../Hooks/UseFetchHook';
import { getBudgetUtilization, type Budget } from '../financeApi';

type UtilizationResponse = {
  budget_id: string;
  department_name: string;
  start_date: string;
  end_date: string;
  total_allocated: number;
  total_spent: number;
  remaining: number;
  utilization_percentage: number;
};

const formatCurrency = (value: number, currency = 'XAF') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value || 0);

const statusStyles: Record<string, string> = {
  DRAFT: 'bg-yellow-100 text-yellow-700',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-green-100 text-green-700',
  ACTIVE: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-700',
};

export const ViewBudget = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [utilization, setUtilization] = useState<UtilizationResponse | null>(null);
  const [utilError, setUtilError] = useState<string | null>(null);
  const [isUtilLoading, setIsUtilLoading] = useState(false);

  const {
    data: budget,
    isLoading,
    isError,
    error,
    refetch,
  } = useFetchHook<Budget>(
    id ? `/finance/budgets/${id}` : '',
    `budget-${id}`,
    { enabled: Boolean(id) }
  );

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    const loadUtilization = async () => {
      setIsUtilLoading(true);
      setUtilError(null);
      try {
        const response = await getBudgetUtilization(id);
        if (isMounted) {
          setUtilization(response);
        }
      } catch (err: any) {
        if (isMounted) {
          setUtilError(err?.response?.data?.message || 'Failed to load budget utilization.');
          setUtilization(null);
        }
      } finally {
        if (isMounted) {
          setIsUtilLoading(false);
        }
      }
    };

    loadUtilization();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const isPageLoading = isLoading || isUtilLoading;

  const budgetTotals = useMemo(() => {
    const allocated = utilization?.total_allocated ?? budget?.total_amount ?? 0;
    const spent = utilization?.total_spent ?? 0;
    const remaining = utilization?.remaining ?? Math.max(allocated - spent, 0);
    const utilizationPct =
      utilization?.utilization_percentage ??
      (allocated > 0 ? Math.round((spent / allocated) * 100) : 0);

    return { allocated, spent, remaining, utilizationPct };
  }, [budget, utilization]);

  if (isPageLoading) {
    return <SkeletonLoading />
  }

  if (isError || !budget) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-red-500 mb-4">
          {(error as any)?.response?.data?.message || 'Budget not found.'}
        </p>
        <div className="flex items-center gap-3">
          <Button onClick={() => navigate('/dashboard/budgeting')}>
            Back to Budgets
          </Button>
          {id && (
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <HeadingComponent heading="Budget Details" subHeading="Review allocation and utilization" />
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm text-gray-500">
              Department: <span className="font-medium text-gray-700">
                {budget.department?.department_name || budget.department_name || 'N/A'}
              </span>
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                statusStyles[budget.status] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {budget.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/dashboard/budgeting')}>
            Back
          </Button>
        </div>
      </div>

      {utilError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {utilError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          heading="Total Allocated"
          amount={formatCurrency(budgetTotals.allocated, budget.currency || 'XAF')}
          currency="Budget"
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
          amount={formatCurrency(budgetTotals.spent, budget.currency || 'XAF')}
          currency="Spent"
        />
        <Card
          heading="Remaining"
          amount={formatCurrency(budgetTotals.remaining, budget.currency || 'XAF')}
          currency="Available"
        />
        <Card
          heading="Utilization"
          amount={`${budgetTotals.utilizationPct}%`}
          currency="Budget Used"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Budget Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p className="text-xs uppercase text-gray-400">Start Date</p>
              <p className="font-medium text-gray-800">{budget.start_date}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">End Date</p>
              <p className="font-medium text-gray-800">{budget.end_date}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">Currency</p>
              <p className="font-medium text-gray-800">{budget.currency || 'XAF'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">Created</p>
              <p className="font-medium text-gray-800">
                {budget.created_at ? new Date(budget.created_at).toLocaleDateString('en-US') : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <p className="text-xs uppercase text-gray-400">Description</p>
              <p className="font-medium text-gray-800">{budget.description || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">Notes</p>
              <p className="font-medium text-gray-800">{budget.notes || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-gray-400">Additional Notes</p>
              <p className="font-medium text-gray-800">{budget.additional_notes || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBudget;
