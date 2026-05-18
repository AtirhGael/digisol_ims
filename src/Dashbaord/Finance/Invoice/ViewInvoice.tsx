import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CustomSelect } from '@/components/ui/CustomSelect';
import SkeletonLoading from '../../../components/other/Loader/SkeletonLoading/SkeletonLoading';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import useFetchHook from '../../../Hooks/UseFetchHook';
import useDeleteHook from '../../../Hooks/UseDeleteHook';
import useUpdate from '../../../Hooks/UseUpdateHook';

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: string;
  amount: string;
}

interface resolvedInvoice {
  invoiceNumber: string;
  status: 'Paid' | 'Pending' | 'Partially Paid';
  billedTo: string;
  billingDetails: string;
  projectName: string;
  issueDate: string;
  dueDate: string;
  notes: string;
  lineItems: LineItem[];
  subtotal: string;
  discount: string;
  discountPercent: string;
  total: string;
  amountPaid: string;
  amountDue: string;
  paymentBatch: string;
  termsAndCondition: string;
}

interface LogEntry {
  action: string;
  timestamp: string;
}

const normalizeInvoiceStatus = (status?: string) =>
  String(status ?? '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');

export const ViewInvoice = () => {
  // Navigation + route params.
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [invoiceData, setInvoiceData] = useState<any | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentDate: new Date().toISOString().slice(0, 10),
    paymentMethod: '',
    referenceNumber: '',
  });
  // Editable notes state.
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editableNotes, setEditableNotes] = useState(
    'Please ensure payment is made by the due date to avoid any late fees. Payment is due on or before the due date.'
  );

  const {
    data: invoiceResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useFetchHook<any>(
    id ? `/finance/invoices/${id}` : '',
    `invoice-${id}`,
    { enabled: Boolean(id) }
  );

  useEffect(() => {
    if (!invoiceResponse) return;
    setInvoiceData(invoiceResponse);
    if (invoiceResponse?.notes) {
      setEditableNotes(invoiceResponse.notes);
    }
  }, [invoiceResponse]);

  const { mutateAsync: deleteInvoice, isLoading: isDeletingInvoice } = useDeleteHook(
    '/finance/invoices',
    ['finance-invoices']
  );
  const { updateData: recordPayment, loading: isRecordingPayment } = useUpdate<any>();

  if (isLoading) {
    return <SkeletonLoading />
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-red-500 mb-4">{(error as any)?.response?.data?.message || 'Failed to load invoice'}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard/invoice')}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            Back to Invoices
          </button>
          {id && (
            <button
              onClick={() => refetch()}
              className="px-4 py-2 border border-gray-200 rounded-lg"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  const formatCurrency = (value?: number) =>
    `${Number(value || 0).toLocaleString()}FCFA`;

  const mapStatus = (status?: string): resolvedInvoice['status'] => {
    const normalizedStatus = normalizeInvoiceStatus(status);
    if (normalizedStatus === 'PAID') return 'Paid';
    if (normalizedStatus === 'PARTIALLY_PAID') return 'Partially Paid';
    return 'Pending';
  };

  const resolvedInvoice = invoiceData
    ? {
        invoiceNumber: invoiceData.invoice_number,
        status: mapStatus(invoiceData.status),
        billedTo: invoiceData.client_name || invoiceData.client_id || 'Unknown',
        billingDetails: invoiceData.client_name || invoiceData.client_id || 'Unknown',
        projectName: invoiceData.project_id || 'N/A',
        issueDate: new Date(invoiceData.invoice_date).toLocaleDateString('en-US'),
        dueDate: new Date(invoiceData.due_date).toLocaleDateString('en-US'),
        notes: invoiceData.notes || '',
        lineItems: (invoiceData.line_items || []).map((item: any) => ({
          description: item.description || 'Item',
          quantity: Number(item.quantity || 0),
          unitPrice: formatCurrency(item.unit_price),
          amount: formatCurrency(item.amount),
        })),
        subtotal: formatCurrency(invoiceData.subtotal),
        discount: '0FCFA',
        discountPercent: '0',
        total: formatCurrency(invoiceData.total_amount),
        amountPaid: formatCurrency(invoiceData.amount_paid),
        amountDue: formatCurrency(invoiceData.outstanding_balance),
        paymentBatch: 'Payment batch',
        termsAndCondition:
          invoiceData.terms_conditions ||
          'Please ensure payment is made by the due date to avoid any late fees. Payment is due on or before the due date.',
      }
    : {
        invoiceNumber: 'INV-2025-001',
        status: 'Paid',
        billedTo: 'john@gmail.com',
        billingDetails: 'John Smith',
        projectName: 'Project Genesis',
        issueDate: '20 November 2025',
        dueDate: '30 November 2025',
        notes: '',
        lineItems: [
          {
            description: 'Starlink kit and access point',
            quantity: 1,
            unitPrice: '320,000FCFA',
            amount: '320,000FCFA',
          },
          {
            description: 'Starlink kit and access point',
            quantity: 1,
            unitPrice: '320,000FCFA',
            amount: '320,000FCFA',
          },
        ],
        subtotal: '320,000FCFA',
        discount: '32,000FCFA',
        discountPercent: '10',
        total: '320,000FCFA',
        amountPaid: '0FCFA',
        amountDue: '320,000FCFA',
        paymentBatch: 'Payment batch January 2025',
        termsAndCondition:
          'Please ensure payment is made by the due date to avoid any late fees. Payment is due on or before the due date.',
      };

  const logs: LogEntry[] = [
    {
      action: 'Sent to john@gmail',
      timestamp: '22 Jan 2025, 1:26 PM',
    },
    {
      action: 'Finalized',
      timestamp: '22 Jan 2025, 1:28 PM',
    },
    {
      action: 'Payment was made',
      timestamp: '22 Jan 2025, 1:28 PM',
    },
  ];

  // Navigate to edit invoice.
  const handleEdit = () => {
    navigate(`/dashboard/invoice/edit/${id}`);
  };

  // Trigger print flow.
  const handlePrint = () => {
    window.print();
    toast.success('Invoice ready to print');
  };

  // Return to invoice list.
  const handleCancel = () => {
    navigate('/dashboard/invoice');
  };

  const handleDelete = () => {
    setDeleteModalOpen(true);
  };

  const openPaymentModal = () => {
    const amountDue = Number(invoiceData?.outstanding_balance || 0);
    setPaymentForm((prev) => ({
      ...prev,
      amount: amountDue > 0 ? String(amountDue) : '',
      paymentDate: new Date().toISOString().slice(0, 10),
    }));
    setPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    if (isRecordingPayment) return;
    setPaymentModalOpen(false);
  };

  const handleRecordPayment = async () => {
    if (!id) return;

    const paymentAmount = Number(paymentForm.amount);
    const amountDue = Number(invoiceData?.outstanding_balance || 0);

    if (!paymentAmount || paymentAmount <= 0) {
      toast.error('Enter a valid payment amount');
      return;
    }

    if (amountDue > 0 && paymentAmount > amountDue) {
      toast.error('Payment amount cannot exceed the amount due');
      return;
    }

    if (!paymentForm.paymentDate) {
      toast.error('Select a payment date');
      return;
    }

    if (!paymentForm.paymentMethod) {
      toast.error('Select a payment method');
      return;
    }

    try {
      await recordPayment(
        `/finance/invoices/${id}/payment`,
        {
          payment_amount: paymentAmount,
          payment_date: paymentForm.paymentDate,
          payment_method: paymentForm.paymentMethod,
          reference_number: paymentForm.referenceNumber || undefined,
        },
        'patch',
      );
      toast.success('Payment recorded successfully');
      setPaymentModalOpen(false);
      setPaymentForm({
        amount: '',
        paymentDate: new Date().toISOString().slice(0, 10),
        paymentMethod: '',
        referenceNumber: '',
      });
      await queryClient.invalidateQueries({ queryKey: ['finance-invoices'] });
      refetch();
    } catch (paymentError: any) {
      toast.error(paymentError?.response?.data?.message || 'Failed to record payment');
    }
  };

  const confirmDelete = async () => {
    if (!id) return;
    try {
      await deleteInvoice(id);
      toast.success('Invoice deleted successfully');
      setDeleteModalOpen(false);
      navigate('/dashboard/invoice');
    } catch (deleteError: any) {
      toast.error(deleteError?.response?.data?.message || 'Failed to delete invoice');
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
  };

  // Persist notes locally (UI only for now).
  const handleSaveNotes = () => {
    setIsEditingNotes(false);
    toast.success('Notes updated successfully');
  };

  // Status badge styling helper.
  const getStatusBadge = (status: string) => {
    const statusStyles = {
      Pending: 'bg-yellow-500 text-white',
      Paid: 'bg-green-500 text-white',
      'Partially Paid': 'bg-red-500 text-white',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          statusStyles[status as keyof typeof statusStyles]
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="w-full h-full p-6 flex flex-col gap-6 overflow-auto">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .print-area, .print-area * { visibility: visible !important; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          body { background: #ffffff !important; }
        }
      `}</style>
      <div className="print-area">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  View Invoice Number {resolvedInvoice.invoiceNumber}
                </h1>
                {getStatusBadge(resolvedInvoice.status)}
              </div>
              <p className="text-sm text-gray-500 mt-1 no-print">
                Edit, delete and print invoice from here
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 no-print">
            {resolvedInvoice.status !== 'Paid' && (
              <Button
                variant="default"
                className="bg-green-600 hover:bg-green-700"
                onClick={openPaymentModal}
              >
                Record Payment
              </Button>
            )}
            <Button
              variant="default"
              className="bg-[#3d4094] hover:bg-[#2d3074]"
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              Print
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
          {/* Payment Batch */}
          <div className="bg-white p-6 rounded-xl ">
            <h2 className="text-xl font-semibold mb-6">
              {resolvedInvoice.paymentBatch}
            </h2>

            {/* Billing Information Grid */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Billed to</p>
                <p className="text-sm font-medium">{resolvedInvoice.billedTo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Invoice Number</p>
                <p className="text-sm font-medium">{resolvedInvoice.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Billing Details</p>
                <p className="text-sm font-medium">{resolvedInvoice.billingDetails}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Project Name</p>
                <p className="text-sm font-medium">{resolvedInvoice.projectName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Issue Date</p>
                <p className="text-sm font-medium">{resolvedInvoice.issueDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Due Date</p>
                <p className="text-sm font-medium">{resolvedInvoice.dueDate}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500 mb-1">Notes</p>
                <p className="text-sm font-medium">{resolvedInvoice.notes || '-'}</p>
              </div>
            </div>

            {/* Line Items */}
            <div className="mt-8">
              <h3 className="text-base font-semibold mb-4">Line Items</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500 uppercase">
                      Product Description
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500 uppercase">
                      QTY
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500 uppercase">
                      Unit Price
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {resolvedInvoice.lineItems.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-4 px-2 text-sm text-gray-900">
                        {item.description}
                      </td>
                      <td className="py-4 px-2 text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="py-4 px-2 text-sm text-gray-900">
                        {item.unitPrice}
                      </td>
                      <td className="py-4 px-2 text-sm text-gray-900">
                        {item.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary */}
              <div className="flex justify-end mt-6">
                <div className="w-80 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{resolvedInvoice.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Discount ({resolvedInvoice.discountPercent}%)
                    </span>
                    <span className="font-medium">{resolvedInvoice.discount}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-gray-200 pt-3">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold">{resolvedInvoice.total}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-3 border-t border-gray-200">
                    <span className="font-medium">Amount Paid</span>
                    <span className="font-medium">{resolvedInvoice.amountPaid}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Amount Due</span>
                    <span className="font-medium">{resolvedInvoice.amountDue}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Terms & Condition */}
          <div className="bg-white p-6 rounded-xl ">
            <h3 className="text-base font-semibold mb-3">Terms & Condition</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {resolvedInvoice.termsAndCondition}
            </p>
          </div>
        </div>

        {/* Right Sidebar */}
          <div className="space-y-6 no-print">
          {/* Notes */}
          <div className="bg-white p-6 rounded-xl ">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold">Notes</h3>
              {!isEditingNotes ? (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Edit notes
                </button>
              ) : (
                <button
                  onClick={handleSaveNotes}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  Save
                </button>
              )}
            </div>
            {!isEditingNotes ? (
              <p className="text-sm text-gray-600 leading-relaxed">
                {editableNotes}
              </p>
            ) : (
              <textarea
                value={editableNotes}
                onChange={(e) => setEditableNotes(e.target.value)}
                className="w-full h-32 rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-ring resize-none"
              />
            )}
          </div>

          {/* Log */}
          <div className="bg-white p-6 rounded-xl ">
            <h3 className="text-base font-semibold mb-4">Log</h3>
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-6 h-6 rounded bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-sm"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{log.action}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{log.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delete Button */}
          {resolvedInvoice.status !== 'Paid' && (
            <Button
              variant="default"
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={openPaymentModal}
            >
              Record Payment
            </Button>
          )}
          <Button
            variant="destructive"
            className="w-full bg-red-500 hover:bg-red-600"
            onClick={handleDelete}
          >
            Delete
          </Button>
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
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
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
              disabled={isDeletingInvoice}
              className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              {isDeletingInvoice ? 'Deleting...' : 'Delete'}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={paymentModalOpen}
        onOpenChange={(open) => {
          if (!open) closePaymentModal();
        }}
      >
        <AlertDialogContent onOverlayClick={closePaymentModal}>
          <AlertDialogHeader>
            <AlertDialogTitle>Record Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Add a payment against this invoice. The invoice status will update based on the amount paid.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid grid-cols-1 gap-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Amount</label>
              <Input
                type="number"
                min="1"
                step="0.01"
                value={paymentForm.amount}
                onChange={(event) =>
                  setPaymentForm((prev) => ({ ...prev, amount: event.target.value }))
                }
                placeholder="Enter amount paid"
              />
              <p className="text-xs text-gray-500">
                Amount due: {formatCurrency(invoiceData?.outstanding_balance)}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Payment Date</label>
              <Input
                type="date"
                value={paymentForm.paymentDate}
                onChange={(event) =>
                  setPaymentForm((prev) => ({ ...prev, paymentDate: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Payment Method</label>
              <CustomSelect
                options={[
                  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
                  { value: 'CASH', label: 'Cash' },
                  { value: 'CHECK', label: 'Check' },
                  { value: 'MTN MOMO', label: 'MTN MoMo' },
                  { value: 'Orange Money', label: 'Orange Money' },
                ]}
                value={paymentForm.paymentMethod}
                onChange={(value) =>
                  setPaymentForm((prev) => ({ ...prev, paymentMethod: value }))
                }
                placeholder="Select method"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Reference Number</label>
              <Input
                value={paymentForm.referenceNumber}
                onChange={(event) =>
                  setPaymentForm((prev) => ({
                    ...prev,
                    referenceNumber: event.target.value,
                  }))
                }
                placeholder="Enter reference number"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <button
              onClick={closePaymentModal}
              disabled={isRecordingPayment}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleRecordPayment}
              disabled={isRecordingPayment}
              className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isRecordingPayment ? 'Recording...' : 'Record Payment'}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
