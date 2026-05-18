import { useNavigate, useParams } from 'react-router-dom';
import SkeletonLoading from '../../../components/other/Loader/SkeletonLoading/SkeletonLoading';
import { HeadingComponent } from '../../../components/other/HeadingComponent';
import { Button } from '../../../components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { toast } from 'sonner';
import { type Expense } from '../financeApi';
import useFetchHook from '../../../Hooks/UseFetchHook';
import useDeleteHook from '../../../Hooks/UseDeleteHook';
import { getDocumentDisplayName, getDocumentPublicUrl } from '../../BusinessDevelopment/ProposalContracts/utils/document';
import { ExternalLink, FileText } from 'lucide-react';
import { useState } from 'react';

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
    receiptUrl?: string;
    subtotal: number;
    discount: number;
    total: number;
  };
}

export const ViewExpense = ({ expense }: ExpenseDetailsProps) => {
  // Navigation for back actions.
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
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
  const { mutateAsync: deleteExpense, isLoading: isDeletingExpense } = useDeleteHook(
    '/finance/expenses',
    ['finance-expenses']
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
    receiptUrl: '',
    subtotal: 20000,
    discount: 0,
    total: 320000
  };

  // Prefer fetched expense data when available.
  const resolvedExpense =
    expense ||
    (expenseData
      ? {
          id: expenseData.expense_id,
          title: expenseData.title,
          category: expenseData.department_name || expenseData.department_id,
          paymentMethod: 'N/A',
          date: new Date(expenseData.expense_date || expenseData.created_at).toLocaleDateString('en-US'),
          amount: expenseData.amount,
          urgency: 'Standard',
          description: expenseData.description,
          additionalNotes: expenseData.justification || 'N/A',
          receiptUrl: expenseData.receipt_url || expenseData.document_url || '',
          subtotal: expenseData.amount,
          discount: 0,
          total: expenseData.amount,
          status: expenseData.status,
        }
      : defaultExpense);

  const receiptUrl = resolvedExpense.receiptUrl
    ? getDocumentPublicUrl(resolvedExpense.receiptUrl)
    : '';
  const receiptName = getDocumentDisplayName(resolvedExpense.receiptUrl, 'View receipt');
  const receiptPath = receiptUrl.split(/[?#]/)[0] || receiptUrl;
  const isImageReceipt = /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(receiptPath);
  const isPdfReceipt = /\.pdf$/i.test(receiptPath);

  const canEditExpense = !['APPROVED', 'REJECTED', 'PAID'].includes(
    ((resolvedExpense as any).status || '').toUpperCase()
  );

  const handleEdit = () => {
    if (!id || !canEditExpense) {
      toast.error('Only pending expenses can be edited.');
      return;
    }
    navigate(`/dashboard/expenses/add?editId=${id}`);
  };

  const handleDelete = () => {
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!id) return;
    try {
      await deleteExpense(id);
      toast.success('Expense deleted successfully.');
      setDeleteModalOpen(false);
      navigate('/dashboard/expenses');
    } catch (deleteError: any) {
      toast.error(deleteError?.response?.data?.message || 'Failed to delete expense.');
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
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
          <Button variant="destructive" onClick={handleDelete} disabled={isDeletingExpense}>
            {isDeletingExpense ? 'Deleting...' : 'Delete'}
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

              {receiptUrl ? (
                <div className="grid grid-cols-3 gap-4">
                  <span className="text-gray-500">Receipt</span>
                  <a
                    href={receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="col-span-2 font-medium text-blue-600 hover:underline"
                  >
                    {receiptName}
                  </a>
                </div>
              ) : null}
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

          <div className="mt-6 bg-white rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Receipt</h2>
              {receiptUrl ? (
                <a
                  href={receiptUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open
                </a>
              ) : null}
            </div>

            {receiptUrl ? (
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                {isImageReceipt ? (
                  <a href={receiptUrl} target="_blank" rel="noreferrer">
                    <img
                      src={receiptUrl}
                      alt={`Receipt for ${resolvedExpense.title}`}
                      className="max-h-80 w-full object-contain"
                    />
                  </a>
                ) : isPdfReceipt ? (
                  <iframe
                    src={receiptUrl}
                    title={`Receipt for ${resolvedExpense.title}`}
                    className="h-80 w-full"
                  />
                ) : (
                  <a
                    href={receiptUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-4 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <FileText className="h-5 w-5 text-gray-500" />
                    {receiptName}
                  </a>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">
                No receipt attached.
              </div>
            )}
          </div>
        </div>
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
              Are you sure you want to delete this expense? This action cannot be undone.
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
