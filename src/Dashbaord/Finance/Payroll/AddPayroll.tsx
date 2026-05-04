import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HeadingComponent } from '../../../components/other/HeadingComponent';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import SkeletonLoading from '../../../components/other/Loader/SkeletonLoading/SkeletonLoading';
import { toast } from 'sonner';
import useFetchHook from '../../../Hooks/UseFetchHook';
import { createPayrollRecord, updatePayrollRecord, type PayrollRecordApi } from '../financeApi';

export const AddPayroll = () => {
  // Navigation + query params.
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Edit mode state from URL.
  const editId = searchParams.get('editId');
  const isEditing = Boolean(editId);
  // Form state for the payroll entry.
  const [formData, setFormData] = useState({
    // Employee Payment Information
    payrollId: '',
    employeeId: '',
    jobTitle: '',
    basicWage: '',
    payPeriod: '',
    bonuses: '',
    paymentDate: '',
    allowance: '',
    deductions: '',
    // Status + approvals (backend-driven fields)
    status: 'PENDING',
    paymentReference: '',
    financialClerkApproval: 'NO',
    managerApproval: 'NO',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load employees for the select dropdown.
  const { data: employeesResponse, isLoading: isEmployeesLoading, isError: isEmployeesError } = useFetchHook<any>(
    '/employees?status=ACTIVE&page_size=200',
    'payroll-employees'
  );

  // Load the record when editing.
  const {
    data: payrollRecord,
    isLoading: isRecordLoading,
    isError: isRecordError,
    error: recordError,
  } = useFetchHook<PayrollRecordApi>(
    editId ? `/payroll/${editId}` : '',
    `payroll-record-${editId}`,
    { enabled: Boolean(editId) }
  );

  const isLoading = isRecordLoading;

  const employees = useMemo(() => {
    const list = employeesResponse?.data ?? [];
    return list.map((employee: any) => ({
      id: employee.employee_id,
      name: `${employee.first_name || ''} ${employee.last_name || ''}`.trim() || employee.email || 'Unknown',
      department: employee.department?.department_name || 'N/A',
      position: employee.position || '',
    }));
  }, [employeesResponse]);

  // Auto-fill job title when an employee is selected (if the field is still empty).
  useEffect(() => {
    if (!formData.employeeId || formData.jobTitle) return;
    const selected = employees.find((employee) => employee.id === formData.employeeId);
    if (selected?.position) {
      setFormData((prev) => ({ ...prev, jobTitle: selected.position }));
    }
  }, [employees, formData.employeeId, formData.jobTitle]);

  if (isLoading) {
    return <SkeletonLoading />
  }

  // Pre-fill the form when editing an existing record.
  useEffect(() => {
    if (!editId) return;
    if (isRecordError) {
      toast.error((recordError as any)?.response?.data?.message || 'Payroll record not found.');
      navigate('/dashboard/payroll');
      return;
    }
    if (!payrollRecord) return;
    setFormData({
      payrollId: payrollRecord.payroll_id || '',
      employeeId: payrollRecord.employee_id || '',
      jobTitle: payrollRecord.department_name || '',
      basicWage: payrollRecord.gross_salary ? payrollRecord.gross_salary.toString() : '',
      payPeriod: payrollRecord.payroll_period || '',
      bonuses: payrollRecord.bonuses ? payrollRecord.bonuses.toString() : '',
      paymentDate: payrollRecord.pay_date ? new Date(payrollRecord.pay_date).toISOString().slice(0, 10) : '',
      allowance: payrollRecord.allowance ? payrollRecord.allowance.toString() : '',
      deductions: payrollRecord.total_deduction ? payrollRecord.total_deduction.toString() : '',
      status: payrollRecord.status || 'PENDING',
      paymentReference: payrollRecord.payment_reference_number || '',
      financialClerkApproval: payrollRecord.signature_approvals?.financial_clerk || 'NO',
      managerApproval: payrollRecord.signature_approvals?.manager || 'NO',
    });
  }, [editId, isRecordError, navigate, payrollRecord, recordError]);

  // Input change handler for all text inputs.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const parseAmount = (value: string) => {
    const numeric = Number(value.replace(/[^0-9.]/g, ''));
    return Number.isNaN(numeric) ? 0 : numeric;
  };

  // Create or update a payroll record.
  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.employeeId || !formData.basicWage || !formData.payrollId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const basicSalary = parseAmount(formData.basicWage);
      const allowances = parseAmount(formData.allowance);
      const bonuses = parseAmount(formData.bonuses);
      const deductions = parseAmount(formData.deductions);

      if (isEditing && editId) {
        // Backend supports status + approval updates on existing records.
        await updatePayrollRecord(editId, {
          status: formData.status as 'PENDING' | 'PAID' | 'PARTIALLY_PAID',
          payment_reference: formData.paymentReference || undefined,
          signature_approvals: {
            financial_clerk: formData.financialClerkApproval as 'YES' | 'NO',
            manager: formData.managerApproval as 'YES' | 'NO',
          },
        });
        toast.success('Payroll updated successfully!');
        navigate(`/dashboard/payroll/${editId}`);
        return;
      }

      // Create a new payroll record for the selected payroll run.
      // The backend derives pay period/date from the payroll run, so only core salary fields are sent here.
      await createPayrollRecord({
        payroll_id: formData.payrollId,
        employee_id: formData.employeeId,
        gross_salary: basicSalary,
        basic_salary: basicSalary,
        allowances: allowances ? { allowance: allowances } : undefined,
        bonuses: bonuses || undefined,
        deductions: deductions ? { deductions: deductions } : undefined,
      });

      toast.success('Payroll created successfully!');
      navigate('/dashboard/payroll');
    } catch (error: any) {
      toast.error(error?.message || 'Failed to save payroll record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel and return to the list or back to the view page.
  const handleCancel = () => {
    navigate('/dashboard/payroll');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <HeadingComponent 
          heading={isEditing ? "Edit Payroll" : "Create New Payroll"}
          subHeading={
            isEditing
              ? "Update payroll information and keep records accurate"
              : "Generate payroll for employees and track bonuses"
          }
        />
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            className="bg-[#3d4094] hover:bg-[#2d3074]"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Payroll'}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Payment Information Section */}
        <div className="lg:col-span-2 bg-white rounded-xl  p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Employee Payment Information</h3>
          </div>

          {/* PAYSLIP NO and Job Title */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payrollId" className="text-sm font-medium text-gray-700">
                Payroll Run ID
              </Label>
              <Input
                id="payrollId"
                name="payrollId"
                type="text"
                placeholder="PAY-2026-APR"
                value={formData.payrollId}
                onChange={handleInputChange}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="jobTitle" className="text-sm font-medium text-gray-700">
                Job Title
              </Label>
              <Input
                id="jobTitle"
                name="jobTitle"
                type="text"
                placeholder="Enter job title"
                value={formData.jobTitle}
                onChange={handleInputChange}
                className="mt-2"
              />
            </div>
          </div>

          {/* Full Name and Basic Wage */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employeeId" className="text-sm font-medium text-gray-700">
                Full Name
              </Label>
              <select
                id="employeeId"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleSelectChange}
                disabled={isEmployeesLoading || isSubmitting}
                className="mt-2 flex h-9 w-full rounded-sm border border-gray-200 bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
              >
                <option value="">
                  {isEmployeesLoading ? 'Loading employees...' : 'Select employee'}
                </option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} {employee.department ? `- ${employee.department}` : ''}
                  </option>
                ))}
              </select>
              {isEmployeesError && (
                <p className="mt-1 text-xs text-red-500">Failed to load employees.</p>
              )}
            </div>
            <div>
              <Label htmlFor="basicWage" className="text-sm font-medium text-gray-700">
                Basic Wage
              </Label>
              <Input
                id="basicWage"
                name="basicWage"
                type="text"
                placeholder="Standard salary"
                value={formData.basicWage}
                onChange={handleInputChange}
                className="mt-2"
              />
            </div>
          </div>

          {/* Pay Period and Bonuses */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payPeriod" className="text-sm font-medium text-gray-700">
                Pay Period
              </Label>
              <Input
                id="payPeriod"
                name="payPeriod"
                type="text"
                placeholder="Enter month"
                value={formData.payPeriod}
                onChange={handleInputChange}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="bonuses" className="text-sm font-medium text-gray-700">
                Bonuses
              </Label>
              <Input
                id="bonuses"
                name="bonuses"
                type="text"
                placeholder="Enter bonus for this month"
                value={formData.bonuses}
                onChange={handleInputChange}
                className="mt-2"
              />
            </div>
          </div>

          {/* Payment date and Allowance */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paymentDate" className="text-sm font-medium text-gray-700">
                Payment date
              </Label>
              <Input
                id="paymentDate"
                name="paymentDate"
                type="date"
                placeholder="Select date"
                value={formData.paymentDate}
                onChange={handleInputChange}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="allowance" className="text-sm font-medium text-gray-700">
                Allowance
              </Label>
              <Input
                id="allowance"
                name="allowance"
                type="text"
                placeholder="Enter allowance"
                value={formData.allowance}
                onChange={handleInputChange}
                className="mt-2"
              />
            </div>
          </div>

          {/* Deductions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="deductions" className="text-sm font-medium text-gray-700">
                Deductions
              </Label>
              <Input
                id="deductions"
                name="deductions"
                type="text"
                placeholder="Enter date"
                value={formData.deductions}
                onChange={handleInputChange}
                className="mt-2"
              />
            </div>
          </div>
        </div>

        {/* Signatures Section */}
        <div className="bg-white rounded-xl  p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Signatures</h3>
          </div>

          {/* Financial Clerk Approval */}
          <div>
            <Label htmlFor="financialClerkApproval" className="text-sm font-medium text-gray-700">
              Financial Clerk Approval
            </Label>
            <select
              id="financialClerkApproval"
              name="financialClerkApproval"
              value={formData.financialClerkApproval}
              onChange={handleSelectChange}
              className="mt-2 flex h-9 w-full rounded-sm border border-gray-200 bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              <option value="NO">NO</option>
              <option value="YES">YES</option>
            </select>
          </div>

          {/* Manager Approval */}
          <div>
            <Label htmlFor="managerApproval" className="text-sm font-medium text-gray-700">
              Manager Approval
            </Label>
            <select
              id="managerApproval"
              name="managerApproval"
              value={formData.managerApproval}
              onChange={handleSelectChange}
              className="mt-2 flex h-9 w-full rounded-sm border border-gray-200 bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              <option value="NO">NO</option>
              <option value="YES">YES</option>
            </select>
          </div>

          {/* Payment Reference */}
          <div>
            <Label htmlFor="paymentReference" className="text-sm font-medium text-gray-700">
              Payment Reference
            </Label>
            <Input
              id="paymentReference"
              name="paymentReference"
              type="text"
              placeholder="Optional reference"
              value={formData.paymentReference}
              onChange={handleInputChange}
              className="mt-2"
            />
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status" className="text-sm font-medium text-gray-700">
              Status
            </Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleSelectChange}
              className="mt-2 flex h-9 w-full rounded-sm border border-gray-200 bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
            >
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
