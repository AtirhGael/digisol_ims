import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { HeadingComponent } from "../../../components/other/HeadingComponent";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { CustomSelect } from "../../../components/ui/CustomSelect";
import {
  createExpense,
  updateExpense,
  type Expense,
} from "../financeApi";
import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { toast } from "sonner";
import useFetchHook from "../../../Hooks/UseFetchHook";
import { useDocumentUpload } from "../../../Hooks/useDocumentUpload";
import { useUserStore } from "../../../Store/UserStore";
import {
  getDocumentDisplayName,
  getDocumentPublicUrl,
} from "../../BusinessDevelopment/ProposalContracts/utils/document";

export const AddExpense = () => {
  // Navigation + form state.
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const accessToken = useUserStore((state) => state.accessToken);
  const setAccessToken = useUserStore((state) => state.setAccessToken);
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("editId");
  const isEditMode = Boolean(editId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingReceiptUrl, setExistingReceiptUrl] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const { uploadDocument, isUploading: isUploadingReceipt } = useDocumentUpload();
  const [formData, setFormData] = useState({
    expenseTitle: "",
    date: "",
    amount: "",
    currency: "XAF",
    category: "",
    paymentMethod: "",
    description: "",
    urgency: "STANDARD",
  });

  // Dropdown state.
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showUrgencyDropdown, setShowUrgencyDropdown] = useState(false);

  const { data: departmentsData, isLoading: departmentsLoading } = useFetchHook(
    "/users/departments",
    "departments",
  );

  const {
    data: expenseRecord,
    isLoading: isExpenseLoading,
    isError: isExpenseError,
    error: expenseError,
  } = useFetchHook<Expense>(
    editId ? `/finance/expenses/${editId}` : "",
    `expense-${editId}`,
    { enabled: Boolean(editId) },
  );
  const departments = departmentsData?.data || [];
  const selectedDepartment = departments.find(
    (dept: any) => dept.department_id === formData.category,
  );
  const urgencyOptions = [
    { value: "STANDARD", label: "Standard (3-5 days)" },
    { value: "URGENT", label: "Urgent (1-2 days)" },
    { value: "CRITICAL", label: "Critical (Same day)" },
  ];
  // Shared input handler.
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExtension = /\.(pdf|png|jpe?g|docx?)$/i.test(file.name);

    if (!allowedTypes.includes(file.type) && !allowedExtension) {
      toast.error("Please upload a PDF, image, DOC, or DOCX receipt.");
      e.currentTarget.value = "";
      return;
    }

    setReceiptFile(file);
    toast.success("Receipt selected. It will upload when you save.");
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

  // Keep the auth store in sync so financeApi can submit after a page refresh.
  useEffect(() => {
    if (accessToken || typeof window === 'undefined') return;
    const storedAccessToken = localStorage.getItem('accessToken');
    if (storedAccessToken) {
      setAccessToken(storedAccessToken);
    }
  }, [accessToken, setAccessToken]);

  // Load the expense from the backend when editing.
  useEffect(() => {
    if (!isEditMode) return;
    if (isExpenseError) {
      toast.error(
        (expenseError as any)?.response?.data?.message ||
          "Failed to load expense",
      );
      return;
    }
    if (!expenseRecord) return;
    setFormData({
      expenseTitle: expenseRecord.title || "",
      date: (expenseRecord.expense_date || expenseRecord.created_at)
        ? new Date(expenseRecord.expense_date || expenseRecord.created_at).toISOString().slice(0, 10)
        : "",
      amount: expenseRecord.amount?.toString() || "",
      currency: expenseRecord.currency || "XAF",
      category: expenseRecord.department_id || "",
      paymentMethod: "N/A",
      description: expenseRecord.description || "",
      urgency: "STANDARD",
    });
    setExistingReceiptUrl(expenseRecord.receipt_url || expenseRecord.document_url || '');
  }, [expenseRecord, isEditMode, isExpenseError, expenseError]);

  // Submit expense to the API.
  const handleSubmit = async () => {
    if (!formData.expenseTitle || !formData.amount || !formData.category) {
      toast.error("Please fill in required fields");
      return;
    }

    if (!formData.currency || formData.currency.trim().length !== 3) {
      toast.error("Please enter a valid 3-letter currency code");
      return;
    }

    const numericAmount = parseFloat(formData.amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    if (!useUserStore.getState().accessToken) {
      toast.error("Your session is not ready yet. Please try again in a moment.");
      return;
    }

    setIsSubmitting(true);

    try {
      let receiptUrl = existingReceiptUrl;
      if (receiptFile) {
        receiptUrl = await uploadDocument(receiptFile, {
          folder: "finance/expenses",
        });
      }

      const basePayload = {
        title: formData.expenseTitle,
        amount: numericAmount,
        description: formData.description || formData.expenseTitle,
        department_id: formData.category,
        currency: formData.currency.trim().toUpperCase(),
        expense_date: formData.date || undefined,
      };

      const response = isEditMode && editId
        ? await updateExpense(editId, {
            ...basePayload,
            receipt_url: receiptUrl || null,
          })
        : await createExpense({
            ...basePayload,
            receipt_url: receiptUrl || undefined,
          });

      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["finance-expenses"] });
        queryClient.removeQueries({ queryKey: ["finance-expenses"] });
        if (editId) {
          queryClient.removeQueries({ queryKey: [`expense-${editId}`] });
        }
        toast.success(isEditMode ? "Expense updated successfully!" : "Expense submitted for approval!");
        navigate("/dashboard/expenses");
      } else {
        toast.error(response.message || (isEditMode ? "Failed to update expense" : "Failed to submit expense"));
      }
    } catch (err: any) {
      console.error("Error submitting expense:", err);
      const apiDetails = Array.isArray(err.response?.data?.details)
        ? err.response.data.details.join(", ")
        : null;
      toast.error(apiDetails || err.response?.data?.message || (isEditMode ? "Failed to update expense" : "Failed to submit expense"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Display label for the urgency dropdown.
  const getSelectedUrgencyLabel = () => {
    const option = urgencyOptions.find((o) => o.value === formData.urgency);
    return option?.label || "Select Urgency";
  };

  const handleCancel = () => {
    navigate("/dashboard/expenses");
  };

  // Show a skeleton while the submission is in flight.
  if (isSubmitting || isExpenseLoading || departmentsLoading) {
    return <SkeletonLoading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <HeadingComponent
          heading={isEditMode ? "Edit Expense" : "Create New Expense"}
          subHeading={isEditMode ? "Expense/Edit" : "Expense/Create"}
        />
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            className="bg-[#3d4094] hover:bg-[#2d3074]"
            onClick={handleSubmit}
            disabled={isSubmitting || isUploadingReceipt}
          >
            {isUploadingReceipt
              ? "Uploading Receipt..."
              : isEditMode
                ? "Save Changes"
                : "Submit for Approval"}
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Basic Information</h3>
          <p className="text-sm text-gray-500">
            Core details about the expense
          </p>
        </div>

        <div>
          <Label
            htmlFor="expenseTitle"
            className="text-sm font-medium text-gray-700"
          >
            Expense Title *
          </Label>
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

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="date" className="text-sm font-medium text-gray-700">
              Date
            </Label>
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
            <Label
              htmlFor="amount"
              className="text-sm font-medium text-gray-700"
            >
              Amount *
            </Label>
            <div className="relative mt-2">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                {formData.currency || "XAF"}
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
          <div>
            <Label
              htmlFor="currency"
              className="text-sm font-medium text-gray-700"
            >
              Currency *
            </Label>
            <div className="mt-2">
              <CustomSelect
                options={[
                  { value: "XAF", label: "XAF" },
                  { value: "USD", label: "USD" },
                  { value: "EUR", label: "EUR" },
                ]}
                value={formData.currency}
                onChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    currency: value,
                  }))
                }
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <Label
              htmlFor="category"
              className="text-sm font-medium text-gray-700"
            >
              Department
            </Label>
            <button
              type="button"
              onClick={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
                setShowUrgencyDropdown(false);
              }}
              className="mt-2 w-full flex h-9 items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-1 text-sm text-left"
            >
              <span
                className={
                  formData.category ? "text-gray-900" : "text-gray-400"
                }
              >
                {selectedDepartment?.department_name || "Select Department"}
              </span>
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showCategoryDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl  overflow-hidden">
                {departments.map((dept: any) => (
                  <button
                    key={dept.department_id}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        category: dept.department_id,
                      }));
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <Label
              htmlFor="urgency"
              className="text-sm font-medium text-gray-700"
            >
              Urgency
            </Label>
            <button
              type="button"
              onClick={() => {
                setShowUrgencyDropdown(!showUrgencyDropdown);
                setShowCategoryDropdown(false);
              }}
              className="mt-2 w-full flex h-9 items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-1 text-sm text-left"
            >
              <span className="text-gray-700">{getSelectedUrgencyLabel()}</span>
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showUrgencyDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl  overflow-hidden">
                {urgencyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        urgency: option.value,
                      }));
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
          <Label
            htmlFor="description"
            className="text-sm font-medium text-gray-700"
          >
            Description
          </Label>
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
          <Label htmlFor="receipt" className="text-sm font-medium text-gray-700">Receipt (Optional)</Label>
          <div className="mt-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
            <input
              id="receipt"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              onChange={handleReceiptChange}
              className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-[#3d4094] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#2d3074]"
            />
            <p className="mt-2 text-xs text-gray-500">
              Supported formats: PDF, PNG, JPG, DOC, DOCX.
            </p>
            {receiptFile ? (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm">
                <span className="truncate text-gray-700">{receiptFile.name}</span>
                <button
                  type="button"
                  onClick={() => setReceiptFile(null)}
                  className="shrink-0 text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ) : null}
            {existingReceiptUrl ? (
              <div className="mt-3 flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
                <a
                  href={getDocumentPublicUrl(existingReceiptUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {getDocumentDisplayName(existingReceiptUrl, 'View current receipt')}
                </a>
                <button
                  type="button"
                  onClick={() => setExistingReceiptUrl('')}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="bg-[#e8f4fd] rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          New Expense Summary
        </h3>

        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Subtotal:</div>
            <div className="text-sm text-gray-600">VAT (17.5%):</div>
            <div className="text-sm font-semibold text-gray-900 pt-2">
              Total:
            </div>
          </div>
          <div className="space-y-2 text-right">
            <div className="text-sm font-medium text-gray-900">
              {formData.currency || "XAF"} {formData.amount || "0"}
            </div>
            <div className="text-sm font-medium text-gray-900">
              {formData.currency || "XAF"} {calculateVAT()}
            </div>
            <div className="text-lg font-bold text-gray-900 pt-2">
              {formData.currency || "XAF"} {calculateTotal()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
