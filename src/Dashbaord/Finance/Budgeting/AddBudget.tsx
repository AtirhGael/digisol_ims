import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa6';
import SkeletonLoading from '../../../components/other/Loader/SkeletonLoading/SkeletonLoading';
import useFetchHook from '../../../Hooks/UseFetchHook';
import { createBudget } from '../financeApi';
import { toast } from 'sonner';

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
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: departmentsData, isLoading: departmentsLoading } = useFetchHook(
    '/users/departments',
    'departments'
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
      await createBudget({
        department_id: formData.department,
        start_date: formData.startDate,
        end_date: formData.endDate,
        description: formData.description || formData.title || 'Budget draft',
        total_amount: parseFloat(formData.amountAllocated),
        additional_notes: formData.additionalNotes || undefined,
      });
      toast.success('Budget saved as draft.');
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
      await createBudget({
        department_id: formData.department,
        start_date: formData.startDate,
        end_date: formData.endDate,
        description: formData.description || formData.title || 'Budget submission',
        total_amount: parseFloat(formData.amountAllocated),
        additional_notes: formData.additionalNotes || undefined,
      });
      toast.success('Budget submitted successfully.');
      navigate('/dashboard/budgeting');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (departmentsLoading || isSubmitting) {
    return <SkeletonLoading />
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Title and Action Buttons */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Add New Budget</h1>
            <p className="text-sm text-gray-500">Draft</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAsDraft}
              className="px-6 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-900 text-white rounded-lg font-medium hover:bg-indigo-800 transition-colors"
            >
              Submit for Approval
            </button>
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
