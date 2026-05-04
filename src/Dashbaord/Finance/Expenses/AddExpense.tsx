import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HeadingComponent } from '../../../components/other/HeadingComponent';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { createExpense, getCurrentEmployeeId, type Expense } from '../financeApi';
import SkeletonLoading from '../../../components/other/Loader/SkeletonLoading/SkeletonLoading';
import { toast } from 'sonner';
import useFetchHook from '../../../Hooks/UseFetchHook';

export const AddExpense = () => {
  // Navigation + form state.
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');
  const isEditMode = Boolean(editId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    expenseTitle: '',
    date: '',
    amount: '',
    category: '',
    paymentMethod: '',
    description: '',
    urgency: 'STANDARD',
    additionalNotes: ''
  });

  // Dropdown state.
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showUrgencyDropdown, setShowUrgencyDropdown] = useState(false);

  const { data: departmentsData, isLoading: departmentsLoading } = useFetchHook(
    '/users/departments',
    'departments'
  );

  const {
    data: expenseRecord,
    isLoading: isExpenseLoading,
    isError: isExpenseError,
    error: expenseError,
  } = useFetchHook<Expense>(
    editId ? `/finance/expenses/${editId}` : '',
    `expense-${editId}`,
    { enabled: Boolean(editId) }
  );
  const departments = departmentsData?.data || [];
  const selectedDepartment = departments.find(
    (dept: any) => dept.department_id === formData.category
  );
  const urgencyOptions = [
    { value: 'STANDARD', label: 'Standard (3-5 days)' },
    { value: 'URGENT', label: 'Urgent (1-2 days)' },
    { value: 'CRITICAL', label: 'Critical (Same day)' }
  ];

  // Shared input handler.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // VAT calculation helper (17.5%).
  const calculateVAT = () => {
    const amount = parseFloat(formData.amount) || 0;
    return (amount * 0.175).toFixed(2);
  };

  // Total includes VAT.
  const calculateTotal = () => {
    const amount = parseFloat(formData.amount) || 0;
    const vat = parseFloat(calculateVAT());
    return (amount + vat).toFixed(2);
  };

  // Load the expense from the backend when editing.
  useEffect(() => {
    if (!isEditMode) return;
    if (isExpenseError) {
      toast.error((expenseError as any)?.response?.data?.message || 'Failed to load expense');
      return;
    }
    if (!expenseRecord) return;
    setFormData({
      expenseTitle: expenseRecord.title || '',
      date: expenseRecord.created_at ? new Date(expenseRecord.created_at).toISOString().slice(0, 10) : '',
      amount: expenseRecord.amount?.toString() || '',
      category: expenseRecord.department_id || '',
      paymentMethod: 'N/A',
      description: expenseRecord.description || '',
      urgency: 'STANDARD',
      additionalNotes: expenseRecord.justification || '',
    });
  }, [expenseRecord, isEditMode, isExpenseError, expenseError]);

  // Submit expense to the API.
  const handleSubmit = async () => {
    if (!formData.expenseTitle || !formData.amount || !formData.category) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);

    if (isEditMode) {
      toast.error('Editing expenses is not supported yet.');
      setIsSubmitting(false);
      return;
    }

    try {
      const employeeId = await getCurrentEmployeeId();
      if (!employeeId) {
        toast.error('Unable to resolve employee profile for this user.');
        setIsLoading(false);
        return;
      }

      const payload = {
        title: formData.expenseTitle,
        employee_id: employeeId,
        amount: parseFloat(formData.amount),
        description: formData.description || formData.expenseTitle,
        department_id: formData.category,
        justification: formData.additionalNotes || undefined,
      };

      const response = await createExpense(payload);

      if (response.success) {
        toast.success('Expense submitted for approval!');
        navigate('/dashboard/expenses');
      } else {
        toast.error(response.message || 'Failed to submit expense');
      }
    } catch (err: any) {
      console.error('Error submitting expense:', err);
      toast.error(err.response?.data?.message || 'Failed to submit expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Display label for the urgency dropdown.
  const getSelectedUrgencyLabel = () => {
    const option = urgencyOptions.find(o => o.value === formData.urgency);
    return option?.label || 'Select Urgency';
  };

  const handleCancel = () => {
    navigate('/dashboard/expenses');
  };

  // Show a skeleton while the submission is in flight.
  if (isSubmitting || isExpenseLoading || departmentsLoading) {
    return <SkeletonLoading />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <HeadingComponent 
          heading={isEditMode ? 'Edit Expense' : 'Create New Expense'} 
          subHeading={isEditMode ? 'Expense/Edit' : 'Expense/Create'}
        />
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            className="bg-[#3d4094] hover:bg-[#2d3074]" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isEditMode ? 'Save Changes' : 'Submit for Approval'}
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Basic Information</h3>
          <p className="text-sm text-gray-500">Core details about the expense</p>
        </div>

        <div>
          <Label htmlFor="expenseTitle" className="text-sm font-medium text-gray-700">Expense Title *</Label>
          <Input
            id="expenseTitle"
            name="expenseTitle"
            type="text"
            placeholder="e.g., Client Dinner with ACME Corp"
            value={formData.expenseTitle}
            onChange={handleInputChange}
            className="mt-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date" className="text-sm font-medium text-gray-700">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="amount" className="text-sm font-medium text-gray-700">Amount *</Label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                XAF
              </span>
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="1,020.00"
                value={formData.amount}
                onChange={handleInputChange}
                className="pl-12"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <Label htmlFor="category" className="text-sm font-medium text-gray-700">Department</Label>
            <button
              type="button"
              onClick={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setShowUrgencyDropdown(false);
              }}
              className="mt-2 w-full flex h-9 items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-1 text-sm text-left"
            >
              <span className={formData.category ? 'text-gray-900' : 'text-gray-400'}>
                {selectedDepartment?.department_name || 'Select Department'}
              </span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showCategoryDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl  overflow-hidden">
                {departments.map((dept: any) => (
                  <button
                    key={dept.department_id}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, category: dept.department_id }));
                      setShowCategoryDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700"
                  >
                    {dept.department_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <Label htmlFor="urgency" className="text-sm font-medium text-gray-700">Urgency</Label>
            <button
              type="button"
              onClick={() => {
                setShowUrgencyDropdown(!showUrgencyDropdown);
                setShowCategoryDropdown(false);
              }}
              className="mt-2 w-full flex h-9 items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-1 text-sm text-left"
            >
              <span className="text-gray-700">{getSelectedUrgencyLabel()}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showUrgencyDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl  overflow-hidden">
                {urgencyOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, urgency: option.value }));
                      setShowUrgencyDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
          <Input
            id="description"
            name="description"
            type="text"
            placeholder="Description of expenditure"
            value={formData.description}
            onChange={handleInputChange}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="additionalNotes" className="text-sm font-medium text-gray-700">Additional Notes / Justification</Label>
          <textarea
            id="additionalNotes"
            name="additionalNotes"
            rows={4}
            placeholder="Any other relevant details or justification..."
            value={formData.additionalNotes}
            onChange={handleInputChange}
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-900 resize-none"
          />
        </div>
      </div>

      <div className="bg-[#e8f4fd] rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">New Expense Summary</h3>
        
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Subtotal:</div>
            <div className="text-sm text-gray-600">VAT (17.5%):</div>
            <div className="text-sm font-semibold text-gray-900 pt-2">Total:</div>
          </div>
          <div className="space-y-2 text-right">
            <div className="text-sm font-medium text-gray-900">XAF {formData.amount || '0'}</div>
            <div className="text-sm font-medium text-gray-900">XAF {calculateVAT()}</div>
            <div className="text-lg font-bold text-gray-900 pt-2">XAF {calculateTotal()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
