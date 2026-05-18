import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { HeadingComponent } from '../../../components/other/HeadingComponent';
import SkeletonLoading from '../../../components/other/Loader/SkeletonLoading/SkeletonLoading';
import { Button } from '../../../components/ui/button';
import { FiMail, FiFileText } from 'react-icons/fi';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { type PayrollRecordApi } from '../financeApi';
import useFetchHook from '../../../Hooks/UseFetchHook';
import useDeleteHook from '../../../Hooks/UseDeleteHook';

interface PayrollDetails {
  id: string;
  name: string;
  status: 'PAID' | 'UNPAID';
  payslipNo: string;
  fullName: string;
  payPeriod: string;
  paymentDate: string;
  grossSalary: string;
  totalDeductions: string;
  netSalary: string;
  amountInWords: string;
  jobTitle: string;
  basicWage: string;
  bonuses: string;
  allowance: string;
  deduction: string;
  signatures: {
    financialClerk: boolean;
    manager: boolean;
    employee: boolean;
  };
}

export const ViewPayroll = () => {
  // Navigation + route params.
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  // Backend payroll data.
  const [payrollRecord, setPayrollRecord] = useState<PayrollRecordApi | null>(null);
  // Delete dialog state.
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    data: recordResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useFetchHook<PayrollRecordApi>(
    id ? `/payroll/${id}` : '',
    `payroll-record-${id}`,
    { enabled: Boolean(id) }
  );
  const { mutateAsync: deletePayroll, isLoading: isDeleting } = useDeleteHook(
    '/payroll',
    ['finance-payroll']
  );

  useEffect(() => {
    if (recordResponse) {
      setPayrollRecord(recordResponse);
    }
  }, [recordResponse]);

  // Normalize the store record into a view-friendly shape.
  const payrollData = useMemo<PayrollDetails | null>(() => {
    if (!payrollRecord) return null;
    const currency = payrollRecord.currency || 'XAF';
    const basicWage = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(payrollRecord.gross_salary || 0);
    const deductions = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(payrollRecord.total_deduction || 0);
    const netSalary = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(payrollRecord.net_salary || 0);
    const bonusValue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(payrollRecord.bonuses || 0);
    const allowanceValue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(payrollRecord.allowance || 0);

    return {
      id: payrollRecord.record_id,
      name: payrollRecord.employee_name || 'Unknown',
      status: payrollRecord.status === 'PAID' ? 'PAID' : 'UNPAID',
      payslipNo: payrollRecord.payroll_id || 'N/A',
      fullName: payrollRecord.employee_name || 'N/A',
      payPeriod: payrollRecord.payroll_period || 'N/A',
      paymentDate: payrollRecord.pay_date ? new Date(payrollRecord.pay_date).toLocaleDateString('en-US') : 'N/A',
      grossSalary: basicWage,
      totalDeductions: deductions,
      netSalary: netSalary,
      amountInWords: payrollRecord.amount_in_words || '',
      jobTitle: payrollRecord.department_name || 'N/A',
      basicWage: basicWage,
      bonuses: bonusValue,
      allowance: allowanceValue,
      deduction: deductions,
      signatures: {
        financialClerk: payrollRecord.signature_approvals?.financial_clerk === 'YES',
        manager: payrollRecord.signature_approvals?.manager === 'YES',
        employee: false,
      },
    };
  }, [payrollRecord]);

  // Status pill colors.
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-600';
      case 'UNPAID':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Edit action routes to the edit form.
  const handleEdit = () => {
    if (!id) return;
    navigate(`/dashboard/payroll/add?editId=${id}`);
  };

  // Open delete confirmation.
  const handleDelete = () => {
    if (!id) return;
    setDeleteModalOpen(true);
  };

  // Back to payroll list.
  const handleCancel = () => {
    navigate('/dashboard/payroll');
  };

  // Confirm delete from the modal.
  const confirmDelete = async () => {
    if (!id || isDeleting) return;
    setDeleteError(null);
    try {
      await deletePayroll(id);
      toast.success('Payroll deleted successfully.');
      setDeleteModalOpen(false);
      navigate('/dashboard/payroll');
    } catch (deleteErr: any) {
      const message = deleteErr?.response?.data?.message || 'Failed to delete payroll record.';
      setDeleteError(message);
      toast.error(message);
    }
  };

  // Close delete modal without deleting.
  const cancelDelete = () => {
    if (isDeleting) return;
    setDeleteModalOpen(false);
    setDeleteError(null);
  };

  if (isLoading) {
    return <SkeletonLoading />
  }

  // Fallback when record is missing.
  if (!payrollData || isError) {
    return (
      <div className="space-y-4">
        <HeadingComponent heading="Payroll" subHeading="Record not found" />
        <p className="text-sm text-gray-600">
          {(error as any)?.response?.data?.message || 'The payroll record you are looking for does not exist.'}
        </p>
        <div className="flex items-center gap-3">
          <Button className="bg-[#3d4094] hover:bg-[#2d3074]" onClick={handleCancel}>
            Back to Payroll
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
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">View Payroll, {payrollData.name}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payrollData.status)}`}>
              {payrollData.status}
            </span>
          </div>
          <p className="text-sm text-gray-500">Edit, payroll from here</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            className="bg-[#3d4094] hover:bg-[#2d3074]"
            onClick={handleEdit}
          >
            Edit
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Payment Information Section */}
        <div className="lg:col-span-2 bg-white rounded-xl  p-6">
          <h2 className="text-xl font-semibold mb-6">Employee Payment Information</h2>
          
          <div className="space-y-6">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">Payslip No</p>
                <p className="text-base font-semibold text-gray-900">{payrollData.payslipNo}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Job Title</p>
                <p className="text-base font-semibold text-gray-900">{payrollData.jobTitle}</p>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">Full Name</p>
                <p className="text-base font-semibold text-gray-900">{payrollData.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Basic wage</p>
                <p className="text-base font-semibold text-gray-900">{payrollData.basicWage}</p>
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">Pay Period</p>
                <p className="text-base font-semibold text-gray-900">{payrollData.payPeriod}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Bonuses</p>
                <p className="text-base font-semibold text-gray-900">{payrollData.bonuses}</p>
              </div>
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">Payment Date</p>
                <p className="text-base font-semibold text-gray-900">{payrollData.paymentDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Allowance</p>
                <p className="text-base font-semibold text-gray-900">{payrollData.allowance}</p>
              </div>
            </div>

            {/* Row 5 */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">Gross Salary</p>
                <p className="text-base font-semibold text-gray-900">{payrollData.grossSalary}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Deduction</p>
                <p className="text-base font-semibold text-gray-900">{payrollData.deduction}</p>
              </div>
            </div>

            {/* Row 6 */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">Total Deductions</p>
                <p className="text-base font-semibold text-gray-900">{payrollData.totalDeductions}</p>
              </div>
            </div>

            {/* Row 7 */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">Net Salary</p>
                <p className="text-base font-semibold text-gray-900">{payrollData.netSalary}</p>
              </div>
            </div>

            {/* Row 8 */}
            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">Amount in Words</p>
                <p className="text-base font-semibold text-gray-900">{payrollData.amountInWords || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Signatures Section */}
        <div className="rounded-xl p-6 h-fit">
          <h2 className="text-xl font-semibold mb-6">Signatures</h2>
          <div className="flex items-start gap-6">
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 rounded-full border border-gray-200 bg-white flex items-center justify-center ">
                <FiMail className="h-5 w-5 text-green-500" />
              </div>
              <div className="w-px h-10 bg-gray-200 my-3" />
              <div className="h-12 w-12 rounded-full border border-gray-200 bg-white flex items-center justify-center ">
                <FiFileText className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <div className="flex flex-col gap-10 pt-1">
              <div>
                <p className="text-lg font-semibold text-gray-900">Financial Clerk</p>
                <p className="text-sm text-gray-400">{payrollData.signatures.financialClerk ? 'YES' : 'NO'}</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900">Manager</p>
                <p className="text-sm text-gray-400">{payrollData.signatures.manager ? 'YES' : 'NO'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Button */}
      <div className="flex justify-end">
        <Button 
          variant="destructive"
          className="bg-red-500 hover:bg-red-600 text-white px-8"
          onClick={handleDelete}
        >
          Delete
        </Button>
      </div>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog
        open={deleteModalOpen}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeleteModalOpen(false);
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
              Deleting payroll records is not currently supported by the backend.
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
                'Delete'
              )}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
