import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SkeletonLoading from '../../../components/other/Loader/SkeletonLoading/SkeletonLoading';
import { HeadingComponent } from '../../../components/other/HeadingComponent';
import { Button } from '../../../components/ui/button';
import { toast } from 'sonner';
import { type Expense } from '../financeApi';
import useFetchHook from '../../../Hooks/UseFetchHook';

interface ExpenseDetailsProps {
  expense?: {
    id: string;
    title: string;
    category: string;
    paymentMethod: string;
    date: string;
    amount: number;
    urgency: string;
    description: string;
    additionalNotes: string;
    subtotal: number;
    discount: number;
    total: number;
  };
}

export const ViewExpense = ({ expense }: ExpenseDetailsProps) => {
  // Navigation for back actions.
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const {
    data: expenseData,
    isLoading,
    isError,
    error,
    refetch,
  } = useFetchHook<Expense>(
    id ? `/finance/expenses/${id}` : '',
    `expense-${id}`,
    { enabled: Boolean(id) }
  );

  if (isLoading) {
    return <SkeletonLoading />
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-red-500 mb-4">{(error as any)?.response?.data?.message || 'Failed to load expense'}</p>
        <button
          onClick={() => (id ? refetch() : navigate('/dashboard/expenses'))}
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          {id ? 'Retry' : 'Back to Expenses'}
        </button>
      </div>
    );
  }
  // Default expense data (placeholder until API integration).
  const defaultExpense = {
    id: 'EXP-2026-001',
    title: 'Water bill',
    category: 'Other',
    paymentMethod: 'Cash',
    date: '12 January 2026',
    amount: 20000,
    urgency: '2 days',
    description: 'Monthly water bill payment',
    additionalNotes: 'None',
    subtotal: 20000,
    discount: 0,
    total: 320000
  };

  // Prefer fetched expense data when available.
  const resolvedExpense = useMemo(
    () =>
      expense ||
      (expenseData
        ? {
            id: expenseData.expense_id,
            title: expenseData.title,
            category: expenseData.department_name || expenseData.department_id,
            paymentMethod: 'N/A',
            date: new Date(expenseData.created_at).toLocaleDateString('en-US'),
            amount: expenseData.amount,
            urgency: 'Standard',
            description: expenseData.description,
            additionalNotes: expenseData.justification || 'N/A',
            subtotal: expenseData.amount,
            discount: 0,
            total: expenseData.amount,
          }
        : defaultExpense),
    [expense, expenseData]
  );

  const handleEdit = () => {
    navigate(`/dashboard/expenses/add?editId=${resolvedExpense.id}`);
  };

  const handleDelete = () => {
    toast.success('Expense deleted successfully.');
    navigate('/dashboard/expenses');
  };

  return (
    <div className=" space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <HeadingComponent 
          heading={`View Expense, ${resolvedExpense.title}`}
          subHeading="Edit and expense record here"
        />
        <div className="flex items-center gap-4">
          <Button className="bg-[#3d4094] hover:bg-[#2d3074]" onClick={handleEdit}>
            Edit
          </Button>
          <Button variant="outline" onClick={() => navigate('/dashboard/expenses')}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Expense Information */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl  p-6">
            <h2 className="text-xl font-semibold mb-6">Expense Information</h2>
            
            <div className="space-y-6">
              {/* Expense Title */}
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-500">Expense Title</span>
                <span className="col-span-2 font-medium text-gray-900">{resolvedExpense.title}</span>
              </div>

              {/* Category */}
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-500">Category</span>
                <span className="col-span-2 font-medium text-gray-900">{resolvedExpense.category}</span>
              </div>

              {/* Payment Method */}
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-500">Payment Method</span>
                <span className="col-span-2 font-medium text-gray-900">{resolvedExpense.paymentMethod}</span>
              </div>

              {/* Date */}
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-500">Date</span>
                <span className="col-span-2 font-medium text-gray-900">{resolvedExpense.date}</span>
              </div>

              {/* Amount */}
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-500">Amount</span>
                <span className="col-span-2 font-medium text-gray-900">{resolvedExpense.amount.toLocaleString()}frs</span>
              </div>

              {/* Urgency */}
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-500">Urgency</span>
                <span className="col-span-2 font-medium text-gray-900">{resolvedExpense.urgency}</span>
              </div>

              {/* Description */}
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-500">Description</span>
                <span className="col-span-2 font-medium text-gray-900">{resolvedExpense.description}</span>
              </div>

              {/* Additional Notes */}
              <div className="grid grid-cols-3 gap-4">
                <span className="text-gray-500">Additional Notes</span>
                <span className="col-span-2 font-medium text-gray-900">{resolvedExpense.additionalNotes}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Expense Summary */}
        <div className="col-span-1">
          <div className="bg-white rounded-xl  p-6 space-y-6">
            <h2 className="text-xl font-semibold">Expense Summary</h2>
            
            <div className="space-y-4">
              {/* Subtotal */}
              <div>
                <p className="text-sm text-gray-500 mb-1">Subtotal :</p>
                <p className="text-lg font-semibold">{resolvedExpense.subtotal.toLocaleString()}CFA</p>
              </div>

              {/* Discount */}
              <div>
                <p className="text-sm text-gray-500 mb-1">Discount (0%) :</p>
                <p className="text-lg font-semibold">{resolvedExpense.discount}FCFA</p>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Total :</p>
                <p className="text-2xl font-bold">{resolvedExpense.total.toLocaleString()}CFA</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
