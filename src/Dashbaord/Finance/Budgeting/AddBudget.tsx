import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { FaChevronDown } from 'react-icons/fa6';
import SkeletonLoading from '../../../components/other/Loader/SkeletonLoading/SkeletonLoading';
import useFetchHook from '../../../Hooks/UseFetchHook';
import { toast } from 'sonner';
import usePost from '../../../Hooks/UsePostHook';
import { Button } from '../../../components/ui/button';
import { updateBudget, type Budget } from '../financeApi';

interface BudgetFormData {
  title: string;
  startDate: string;
  endDate: string;
  department: string;
  amountAllocated: string;
  amountSpent: string;
  description: string;
  additionalNotes: string;
}

type VarianceStatus = 'under' | 'exact' | 'over';

type DepartmentOption = {
  department_id: string;
  department_name: string;
  department_code?: string;
};

export const AddBudget = () => {
  // Navigation + dropdown state.
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('editId');
  const isEditMode = Boolean(editId);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { postData, loading: isPostingBudget } = usePost<any>();

  const { data: departmentsData, isLoading: departmentsLoading } = useFetchHook(
    '/users/departments',
    'departments'
  );

  const { data: budgetRecord, isLoading: isBudgetLoading } = useFetchHook<Budget>(
    editId ? `/finance/budgets/${editId}` : '',
    `budget-${editId}`,
    { enabled: Boolean(editId) }
  );
  
  // Form state for the budget draft.
  const [formData, setFormData] = useState<BudgetFormData>({
    title: '',
    startDate: '',
    endDate: '',
    department: '',
    amountAllocated: '',
    amountSpent: '',
    description: '',
    additionalNotes: '',
  });

  const departments: DepartmentOption[] = departmentsData?.data || [];
  const selectedDepartment = departments.find(
    (dept) => dept.department_id === formData.department
  );
  const isSaving = isSubmitting || isPostingBudget;

  useEffect(() => {
    if (!budgetRecord) return;

    setFormData({
      title: budgetRecord.description || '',
      startDate: budgetRecord.start_date
        ? new Date(budgetRecord.start_date).toISOString().slice(0, 10)
        : '',
      endDate: budgetRecord.end_date
        ? new Date(budgetRecord.end_date).toISOString().slice(0, 10)
        : '',
      department: budgetRecord.department_id || budgetRecord.department?.department_id || '',
      amountAllocated: budgetRecord.total_amount?.toString() || '',
      amountSpent: '',
      description: budgetRecord.description || '',
      additionalNotes: budgetRecord.additional_notes || budgetRecord.notes || '',
    });
  }, [budgetRecord]);

  // Calculate variance based on current form values.
  const calculateVariance = (): { amount: number; status: VarianceStatus; percentage: number } => {
    const allocated = parseFloat(formData.amountAllocated) || 0;
    const spent = parseFloat(formData.amountSpent) || 0;
    const variance = allocated - spent;
    const percentage = allocated > 0 ? Math.abs((variance / allocated) * 100) : 0;

    let status: VarianceStatus = 'exact';
    if (variance > 0) status = 'under';
    else if (variance < 0) status = 'over';

    return { amount: Math.abs(variance), status, percentage };
  };

  const variance = calculateVariance();

  // Generic input change handler for text/textarea fields.
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Apply the selected department.
  const handleDepartmentSelect = (deptId: string) => {
    setFormData((prev) => ({ ...prev, department: deptId }));
    setShowDepartmentDropdown(false);
  };

  // Return to budgeting list.
  const handleCancel = () => {
    navigate('/dashboard/budgeting');
  };

  const handleSaveAsDraft = async () => {
    if (!formData.department || !formData.startDate || !formData.endDate || !formData.amountAllocated) {
      toast.error('Please fill in the required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        department_id: formData.department,
        start_date: formData.startDate,
        end_date: formData.endDate,
        description: formData.description || formData.title || 'Budget draft',
        total_amount: parseFloat(formData.amountAllocated),
        additional_notes: formData.additionalNotes || undefined,
      };

      if (isEditMode && editId) {
        await updateBudget(editId, {
          start_date: payload.start_date,
          end_date: payload.end_date,
          description: payload.description,
          total_amount: payload.total_amount,
          additional_notes: payload.additional_notes,
        });
      } else {
        await postData('/finance/budgets', payload);
      }
      await queryClient.invalidateQueries({ queryKey: ['finance-budgets'] });
      queryClient.removeQueries({ queryKey: ['finance-budgets'] });
      if (editId) {
        queryClient.removeQueries({ queryKey: [`budget-${editId}`] });
      }
      toast.success(isEditMode ? 'Budget updated successfully.' : 'Budget saved as draft.');
      navigate('/dashboard/budgeting');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.department || !formData.startDate || !formData.endDate || !formData.amountAllocated) {
      toast.error('Please fill in the required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        department_id: formData.department,
        start_date: formData.startDate,
        end_date: formData.endDate,
        description: formData.description || formData.title || 'Budget submission',
        total_amount: parseFloat(formData.amountAllocated),
        additional_notes: formData.additionalNotes || undefined,
      };

      if (isEditMode && editId) {
        await updateBudget(editId, {
          start_date: payload.start_date,
          end_date: payload.end_date,
          description: payload.description,
          total_amount: payload.total_amount,
          additional_notes: payload.additional_notes,
        });
      } else {
        await postData('/finance/budgets', payload);
      }
      await queryClient.invalidateQueries({ queryKey: ['finance-budgets'] });
      queryClient.removeQueries({ queryKey: ['finance-budgets'] });
      if (editId) {
        queryClient.removeQueries({ queryKey: [`budget-${editId}`] });
      }
      toast.success(isEditMode ? 'Budget updated successfully.' : 'Budget submitted successfully.');
      navigate('/dashboard/budgeting');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (departmentsLoading || isBudgetLoading) {
    return <SkeletonLoading />
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Title and Action Buttons */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {isEditMode ? 'Edit Budget' : 'Add New Budget'}
            </h1>
            <p className="text-sm text-gray-500">{isEditMode ? 'Update budget details' : 'Draft'}</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            {!isEditMode && (
              <Button
                variant="outline"
                type="button"
                onClick={handleSaveAsDraft}
                disabled={isSaving}
                loading={isSaving}
              >
                Save as Draft
              </Button>
            )}
            <Button
              type="submit"
              className="bg-indigo-900 hover:bg-indigo-800"
              disabled={isSaving}
              loading={isSaving}
            >
              {isEditMode ? 'Save Changes' : 'Submit for Approval'}
            </Button>
          </div>
        </div>

        {/* Basic Information Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Basic Information</h2>
              <p className="text-sm text-gray-500">Core details about the budgeting</p>
            </div>

            <div className="space-y-6">
              {/* Budget Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Q2 Marketing Budget"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Budget Period and Department Row */}
              <div className="grid grid-cols-3 gap-6">
                {/* Budget Period Label */}
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Period
                  </label>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    placeholder="DD/MM/YY"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    placeholder="DD/MM/YY"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Department Dropdown */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
                    disabled={isEditMode}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex justify-between items-center bg-white"
                  >
                    <span className={formData.department ? 'text-gray-900' : 'text-gray-400'}>
                      {selectedDepartment?.department_name || 'Select Department'}
                    </span>
                    <FaChevronDown className="text-gray-400 text-xs" />
                  </button>
                  
                  {showDepartmentDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg  max-h-60 overflow-auto">
                      {departments.map((dept) => (
                        <button
                          key={dept.department_id}
                          type="button"
                          onClick={() => handleDepartmentSelect(dept.department_id)}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors"
                        >
                          {dept.department_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Amount Allocated and Amount Spent */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount Allocated
                  </label>
                  <div className="flex gap-2">
                    <span className="px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium text-gray-700">
                      XAF
                    </span>
                    <input
                      type="number"
                      name="amountAllocated"
                      value={formData.amountAllocated}
                      onChange={handleInputChange}
                      placeholder="1,020.00"
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount Spent
                  </label>
                  <div className="flex gap-2">
                    <span className="px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium text-gray-700">
                      XAF
                    </span>
                    <input
                      type="number"
                      name="amountSpent"
                      value={formData.amountSpent}
                      onChange={handleInputChange}
                      placeholder="1,000.00"
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Expense Details Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Expense Details</h2>
              <p className="text-sm text-gray-500">Details of what was spent on</p>
            </div>

            <div className="space-y-6">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description of expenditure"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  placeholder="Any other relevant details..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Variance Section */}
          <div className="bg-blue-50 rounded-lg border border-blue-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Variance (Auto-calculated)</h2>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Variance Status (XAF)</p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500"></div>
                  <span className="text-sm text-gray-700">Under Budget</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-500"></div>
                  <span className="text-sm text-gray-700">Exact Budget</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500"></div>
                  <span className="text-sm text-gray-700">Over Budget</span>
                </div>
              </div>

              {(formData.amountAllocated || formData.amountSpent) && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Current Variance</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {variance.amount.toFixed(2)} XAF
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className={`w-3 h-3 rounded ${
                            variance.status === 'under'
                              ? 'bg-green-500'
                              : variance.status === 'exact'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                        ></div>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {variance.status} Budget
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
            </div>
  );
};
