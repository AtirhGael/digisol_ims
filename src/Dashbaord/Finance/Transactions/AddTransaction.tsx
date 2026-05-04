import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomSelect } from '../../../components/ui/CustomSelect';
import { FaLandmark, FaFileInvoice, FaCartShopping, FaBullhorn, FaMoneyCheckDollar } from 'react-icons/fa6';
import { createTransaction } from '../financeApi';
import SkeletonLoading from '../../../components/other/Loader/SkeletonLoading/SkeletonLoading';

type TransactionCategory =
  | 'office-supply'
  | 'marketing'
  | 'payroll'
  | 'client-invoice'
  | 'tax'
  | 'outings'
  | 'rent';

interface CategoryOption {
  id: TransactionCategory;
  label: string;
  icon: React.ReactNode;
  apiCategory: string;
}

export const AddTransaction = () => {
  // Navigation + form state.
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    transactionDate: '',
    amount: '',
    currency: 'XAF',
    reportingCurrency: 'XAF',
    type: '',
    department: '',
    project: '',
    paymentMethod: '',
    referenceNumber: '',
    bankAccount: '',
    description: '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const inputClass =
    'w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';
  const sectionClass = 'rounded-xl bg-white p-5';
  const labelClass = 'mb-2 block text-xs font-semibold text-gray-500';

  // Category tiles mapped to API values.
  const categories: CategoryOption[] = [
    { id: 'office-supply', label: 'Office supply', icon: <FaCartShopping className="text-2xl" />, apiCategory: 'office supply' },
    { id: 'marketing', label: 'Marketing', icon: <FaBullhorn className="text-2xl" />, apiCategory: 'marketing' },
    { id: 'payroll', label: 'Payroll', icon: <FaMoneyCheckDollar className="text-2xl" />, apiCategory: 'payroll' },
    { id: 'client-invoice', label: 'Client invoice Payment', icon: <FaFileInvoice className="text-2xl" />, apiCategory: 'client invoice payment' },
    { id: 'tax', label: 'Tax', icon: <FaLandmark className="text-2xl" />, apiCategory: 'Tax' },
    { id: 'outings', label: 'Outings', icon: <FaLandmark className="text-2xl" />, apiCategory: 'Outings' },
    { id: 'rent', label: 'Rent', icon: <FaLandmark className="text-2xl" />, apiCategory: 'Rent' },
  ];

  // Handle input/select changes.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateField = (name: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // File picker handler.
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  // Drag-and-drop helpers.
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  // Submit the new transaction.
  const isValidUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

  const handleSubmit = async () => {
    if (!selectedCategory || !formData.type || !formData.amount || !formData.transactionDate || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    const numericAmount = Number(formData.amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    // Prevent future dates (backend also enforces this).
    const todayIso = new Date().toISOString().slice(0, 10);
    if (formData.transactionDate > todayIso) {
      setError('Transaction date cannot be in the future');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const selectedCategoryData = categories.find(c => c.id === selectedCategory);
      
      const payload = {
        amount: numericAmount,
        transaction_type: formData.type as 'Income' | 'Expense',
        category: selectedCategoryData?.apiCategory || selectedCategory,
        transaction_date: formData.transactionDate,
        description: formData.description.trim(),
        currency: formData.currency,
        ledger_type: formData.bankAccount || 'BANK',
        payment_method: formData.paymentMethod || undefined,
        reference_number: formData.referenceNumber || undefined,
        department_id: isValidUuid(formData.department) ? formData.department : undefined,
        project_id: isValidUuid(formData.project) ? formData.project : undefined,
      };

      const response = await createTransaction(payload);

      if (response.success) {
        navigate('/dashboard/transactions');
      } else {
        setError(response.message || 'Failed to create transaction');
      }
    } catch (err: any) {
      console.error('Error creating transaction:', err);
      const apiMessage = err.response?.data?.message;
      const apiDetails = Array.isArray(err.response?.data?.details)
        ? err.response.data.details.join(', ')
        : null;
      setError(apiDetails || apiMessage || 'Failed to create transaction');
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel and return to list.
  const handleCancel = () => {
    navigate('/dashboard/transactions');
  };

  // Show a skeleton while the submission is in flight.
  if (isLoading) {
    return <SkeletonLoading />
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Record New Transaction</h1>
          <p className="text-sm text-gray-500">Manage and record transactions to keep track of spendings</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/transactions')}
          className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          Back to Transactions
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-2 p-3">
        <div className={`${sectionClass} mb-6 p-8` }>
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Transaction Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border px-3 py-4 text-xs font-semibold transition ${
                  selectedCategory === category.id
                    ? 'border-emerald-400  text-emerald-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {selectedCategory === category.id && (
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500" />
                )}
                <div className="text-lg">{category.icon}</div>
                <span className="text-center">{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={`${sectionClass} mb-6`}>
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={labelClass}>Transaction Date</label>
              <input
                type="date"
                name="transactionDate"
                value={formData.transactionDate}
                onChange={handleInputChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Amount</label>
              <div className="flex items-center rounded-md border border-gray-200 bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <span className="px-3 text-xs font-semibold text-gray-500">{formData.currency}</span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full bg-transparent px-2 py-2 text-sm text-gray-700 focus:outline-none"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Currency</label>
              <CustomSelect
                options={[
                  { value: 'XAF', label: 'XAF' },
                  { value: 'USD', label: 'USD' },
                  { value: 'EUR', label: 'EUR' },
                ]}
                value={formData.currency}
                onChange={(value) => updateField('currency', value)}
              />
            </div>
            <div>
              <label className={labelClass}>Currency</label>
              <CustomSelect
                options={[
                  { value: 'XAF', label: 'XAF' },
                  { value: 'USD', label: 'USD' },
                  { value: 'EUR', label: 'EUR' },
                ]}
                value={formData.reportingCurrency}
                onChange={(value) => updateField('reportingCurrency', value)}
              />
            </div>
          </div>
        </div>

        <div className={`${sectionClass} mb-6`}>
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Transaction Classification</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Type</label>
              <CustomSelect
                options={[
                  { value: 'Income', label: 'Income' },
                  { value: 'Expense', label: 'Expense' },
                ]}
                value={formData.type}
                onChange={(value) => updateField('type', value)}
                placeholder="Select transaction type..."
              />
            </div>
            <div>
              <label className={labelClass}>Department</label>
              <CustomSelect
                options={[
                  { value: 'finance', label: 'Finance' },
                  { value: 'hr', label: 'Human Resources' },
                  { value: 'it', label: 'IT' },
                  { value: 'operations', label: 'Operations' },
                ]}
                value={formData.department}
                onChange={(value) => updateField('department', value)}
                placeholder="Select department..."
              />
            </div>
            <div>
              <label className={labelClass}>Project (Optional)</label>
              <CustomSelect
                options={[
                  { value: 'project1', label: 'Project Alpha' },
                  { value: 'project2', label: 'Project Beta' },
                  { value: 'project3', label: 'Project Gamma' },
                ]}
                value={formData.project}
                onChange={(value) => updateField('project', value)}
                placeholder="Select project..."
              />
            </div>
          </div>
        </div>

        <div className={`${sectionClass} mb-6`}>
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Payment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Payment Method</label>
              <CustomSelect
                options={[
                  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
                  { value: 'CASH', label: 'Cash' },
                  { value: 'CHECK', label: 'Check' },
                  { value: 'MTN MOMO', label: 'MTN MoMo' },
                  { value: 'Orange Money', label: 'Orange Money' },
                ]}
                value={formData.paymentMethod}
                onChange={(value) => updateField('paymentMethod', value)}
                placeholder="Select method..."
              />
            </div>
            <div>
              <label className={labelClass}>Reference Number</label>
              <input
                type="text"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="Enter reference number (e.g IN-2)"
              />
            </div>
            <div>
              <label className={labelClass}>Bank Account</label>
              <CustomSelect
                options={[
                  { value: 'BANK', label: 'Bank' },
                  { value: 'CASH', label: 'Cash' },
                  { value: 'Mobile Money', label: 'Mobile Money' },
                ]}
                value={formData.bankAccount}
                onChange={(value) => updateField('bankAccount', value)}
                placeholder="Select bank account..."
              />
            </div>
          </div>
        </div>

        <div className={`${sectionClass} mb-6`}>
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Description & Details</h2>
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              maxLength={500}
              className={`${inputClass} min-h-30`}
              placeholder="Provide detailed description of this transaction..."
            />
            <div className="mt-2 text-right text-xs text-gray-400">
              {formData.description.length}/500
            </div>
          </div>
        </div>

        <div className={`${sectionClass} mb-6`}>
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Supporting Documentation</h2>
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center"
          >
            <div className="flex flex-col items-center">
              <div className="mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-2">Drag files here or click to browse</p>
              <p className="text-xs text-gray-500 mb-4">Supported formats: PDF, JPG, PNG (max 10MB total)</p>
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <span className="px-4 py-2 bg-white border border-gray-300 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50 transition inline-block">
                  Choose files
                </span>
              </label>
            </div>
          </div>
          
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaFileInvoice className="text-gray-400" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                  </div>
                  <button
                    onClick={() => setFiles(files.filter((_, i) => i !== index))}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-6 py-2 rounded-md border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 rounded-md bg-primary text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
          >
            Record Transaction
          </button>
        </div>
      </div>
    </div>
  );
};
