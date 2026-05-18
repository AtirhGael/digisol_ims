import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { FaPlus, FaTrash } from 'react-icons/fa';
import { toast } from 'sonner';
import SkeletonLoading from '../../../components/other/Loader/SkeletonLoading/SkeletonLoading';
import useFetchHook from '../../../Hooks/UseFetchHook';
import usePost from '../../../Hooks/UsePostHook';
import useUpdate from '../../../Hooks/UseUpdateHook';

interface LineItem {
  id: string;
  description: string;
  quantity: string;
  amount: string;
  totalAmount: string;
}

interface InvoiceClient {
  client_id: string;
  client_name: string;
  email: string;
  projectId: string;
  projectName: string;
  paymentTerms: string;
}

const asArray = (value: any): any[] => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return [];
  if (Array.isArray(value.clients)) return value.clients;
  if (Array.isArray(value.data)) return value.data;
  if (Array.isArray(value.items)) return value.items;
  return [];
};

const firstString = (...values: any[]): string => {
  const value = values.find((candidate) => typeof candidate === 'string' && candidate.trim());
  return value ? value.trim() : '';
};

const resolveClientEmail = (client: any): string =>
  firstString(
    client?.email,
    client?.client_email,
    client?.contact_email,
    client?.primary_email,
    client?.contact?.email,
    client?.primary_contact?.email
  );

const resolveProjectName = (client: any): string => {
  const project =
    client?.project ||
    client?.active_project ||
    client?.current_project ||
    client?.latest_project ||
    client?.projects?.[0] ||
    client?.client_projects?.[0];

  return firstString(
    client?.project_name,
    client?.projectName,
    client?.project_title,
    project?.project_name,
    project?.projectName,
    project?.name,
    project?.title,
    project?.project_id,
    client?.project_id
  );
};

const resolveProjectId = (client: any): string => {
  const project =
    client?.project ||
    client?.active_project ||
    client?.current_project ||
    client?.latest_project ||
    client?.projects?.[0] ||
    client?.client_projects?.[0];

  return firstString(
    client?.project_id,
    client?.projectId,
    project?.project_id,
    project?.projectId,
    project?.id
  );
};

const isUuid = (value: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export const CreateInvoice = () => {
  // Navigation + form state.
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { id: routeId } = useParams();
  const editId = routeId ?? searchParams.get('editId');
  const isEditMode = Boolean(editId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { postData, loading: isCreatingInvoice } = usePost<any>();
  const { updateData, loading: isUpdatingInvoice } = useUpdate<any>();
  const { data: clientsData, isLoading: isClientsLoading } = useFetchHook(
    '/client-management/clients',
    'clients-data'
  );
  const {
    data: invoiceResponse,
    isLoading: isInvoiceLoading,
    isError: isInvoiceError,
    error: invoiceError,
  } = useFetchHook<any>(
    editId ? `/finance/invoices/${editId}` : '',
    `invoice-edit-${editId}`,
    { enabled: Boolean(editId) }
  );
  const clients = useMemo<InvoiceClient[]>(() => {
    const payload = clientsData?.data ?? clientsData;
    const candidates = asArray(payload);

    return candidates
      .map((client: any) => ({
        client_id: String(client?.client_id ?? client?.id ?? ''),
        client_name: client?.client_name ?? client?.name ?? client?.company_name ?? '',
        email: resolveClientEmail(client),
        projectId: resolveProjectId(client),
        projectName: resolveProjectName(client),
        paymentTerms: firstString(client?.payment_terms, client?.paymentTerms),
      }))
      .filter((client) => client.client_id && client.client_name);
  }, [clientsData]);

  const clientOptions = useMemo(
    () =>
      clients.map((client) => ({
        value: client.client_id,
        label: client.client_name,
      })),
    [clients]
  );
  
  // Invoice form data.
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    clientEmail: '',
    projectId: '',
    projectName: '',
    startDate: '',
    paymentTerms: '',
    stage: '',
    status: '',
    dueDate: '',
    notes: '',
  });

  const selectedClientId = formData.clientId;
  const {
    data: selectedClientResponse,
    isError: isSelectedClientError,
  } = useFetchHook<any>(
    selectedClientId ? `/client-management/clients/${selectedClientId}/details` : '',
    `invoice-client-details-${selectedClientId}`,
    { enabled: Boolean(selectedClientId) }
  );

  const selectedClientDetails = useMemo(() => {
    const payload = selectedClientResponse?.data ?? selectedClientResponse;
    return payload?.client ?? payload;
  }, [selectedClientResponse]);

  // Line items start with two rows to match the design.
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: '1',
      description: '',
      quantity: '1',
      amount: '1220.00',
      totalAmount: '1',
    },
    {
      id: '2',
      description: '',
      quantity: '1',
      amount: '1220.00',
      totalAmount: '2',
    },
  ]);

  // Discount percentage (editable).
  const [discount, setDiscount] = useState('17.5');

  useEffect(() => {
    if (!isEditMode) return;
    if (isInvoiceError) {
      toast.error((invoiceError as any)?.response?.data?.message || 'Failed to load invoice details');
      return;
    }
    if (!invoiceResponse) return;

    setFormData({
      clientId: invoiceResponse.client_id || '',
      clientName: invoiceResponse.client_name || '',
      clientEmail: '',
      projectId: invoiceResponse.project_id || '',
      projectName: invoiceResponse.project_name || invoiceResponse.project_id || '',
      startDate: invoiceResponse.invoice_date || '',
      paymentTerms: '',
      stage: '',
      status: invoiceResponse.status || '',
      dueDate: invoiceResponse.due_date || '',
      notes: invoiceResponse.notes || '',
    });

    const items = invoiceResponse.line_items || [];
    setLineItems(
      items.length > 0
        ? items.map((item: any, index: number) => ({
            id: String(index + 1),
            description: item.description || '',
            quantity: String(item.quantity || 1),
            amount: String(item.unit_price || 0),
            totalAmount: String(item.amount || 0),
          }))
        : [
            {
              id: '1',
              description: '',
              quantity: '1',
              amount: '0',
              totalAmount: '0',
            },
          ]
    );
  }, [editId, invoiceResponse, isEditMode, isInvoiceError, invoiceError]);

  useEffect(() => {
    if (!selectedClientDetails || isSelectedClientError) return;

    const selectedClientName = firstString(
      selectedClientDetails?.client_name,
      selectedClientDetails?.name,
      selectedClientDetails?.company_name
    );
    const selectedClientEmail = resolveClientEmail(selectedClientDetails);
    const selectedProjectId = resolveProjectId(selectedClientDetails);
    const selectedProjectName = resolveProjectName(selectedClientDetails);
    const selectedPaymentTerms = firstString(
      selectedClientDetails?.payment_terms,
      selectedClientDetails?.paymentTerms
    );

    setFormData((prev) => ({
      ...prev,
      clientName: selectedClientName || prev.clientName,
      clientEmail: selectedClientEmail || prev.clientEmail,
      projectId: selectedProjectId || prev.projectId,
      projectName: selectedProjectName || prev.projectName,
      paymentTerms: selectedPaymentTerms || prev.paymentTerms,
    }));
  }, [selectedClientDetails, isSelectedClientError]);

  // Handle input/select/textarea changes.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Update a line item and re-calc totals.
  const handleLineItemChange = (id: string, field: keyof LineItem, value: string) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Calculate total amount if quantity or amount changes
          if (field === 'quantity' || field === 'amount') {
            const qty = parseFloat(field === 'quantity' ? value : item.quantity) || 0;
            const amt = parseFloat(field === 'amount' ? value : item.amount) || 0;
            updatedItem.totalAmount = (qty * amt).toString();
          }
          
          return updatedItem;
        }
        return item;
      })
    );
  };

  // Add a new line item row.
  const addLineItem = () => {
    const newId = (lineItems.length + 1).toString();
    setLineItems((prev) => [
      ...prev,
      {
        id: newId,
        description: '',
        quantity: '1',
        amount: '0',
        totalAmount: '0',
      },
    ]);
  };

  // Remove a line item (keep at least one).
  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Invoice math helpers.
  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => {
      return sum + (parseFloat(item.totalAmount) || 0);
    }, 0);
  };

  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    const discountPercent = parseFloat(discount) || 0;
    return (subtotal * discountPercent) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  // Submit the invoice to the API.
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      if (!formData.clientId) {
        toast.error('Please select a client');
        setIsSubmitting(false);
        return;
      }

      if (!formData.startDate || !formData.dueDate) {
        toast.error('Please fill in invoice dates');
        setIsSubmitting(false);
        return;
      }

      const validLineItems = lineItems.filter(item => item.description && parseFloat(item.amount) > 0);
      if (validLineItems.length === 0) {
        toast.error('Please add at least one line item');
        setIsSubmitting(false);
        return;
      }

      if (isEditMode && editId) {
        await updateData(`/finance/invoices/${editId}`, {
          notes: formData.notes || undefined,
          status: formData.status || undefined,
          terms_conditions: undefined,
        });
        toast.success('Invoice updated successfully!');
        navigate(`/dashboard/invoice/${editId}`);
        return;
      }

      const payload = {
        client_id: formData.clientId,
        project_id: isUuid(formData.projectId) ? formData.projectId : undefined,
        invoice_date: formData.startDate,
        due_date: formData.dueDate,
        status: 'PENDING',
        items: validLineItems.map(item => ({
          description: item.description,
          quantity: parseInt(item.quantity) || 1,
          unit_price: parseFloat(item.amount) || 0,
          amount: (parseInt(item.quantity) || 1) * (parseFloat(item.amount) || 0),
        })),
        tax_rate: 0,
        tax_applied: false,
        notes: formData.notes || undefined,
      };

      await postData('/finance/invoices', payload);
      toast.success('Invoice created successfully!');
      navigate('/dashboard/invoice');
    } catch (err: any) {
      console.error('Error creating invoice:', err);
      toast.error(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel and return to invoices list.
  const handleCancel = () => {
    navigate('/dashboard/invoice');
  };

  // Show a skeleton while the submission is in flight.
  if (isSubmitting || isCreatingInvoice || isUpdatingInvoice || isInvoiceLoading || isClientsLoading) {
    return <SkeletonLoading />
  }

  return (
    <div className="w-full h-full flex flex-col gap-6 overflow-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Invoice' : 'Create New Invoice'}
          </h1>
          <p className="text-sm text-gray-500">
            {isEditMode ? 'Update invoice details' : 'Generate invoice for client services'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button className="bg-[#3d4094] hover:bg-[#2d3074]" onClick={handleSubmit} disabled={isSubmitting}>
            {isEditMode ? 'Save Changes' : 'Create Invoice'}
          </Button>
        </div>
      </div>

      {isEditMode ? (
        <div className="bg-white p-6 rounded-xl ">
          <h3 className="text-base font-semibold mb-4">Client And Project</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Client Name</Label>
              <div className="min-h-10 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-900">
                {formData.clientName || 'N/A'}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Project</Label>
              <div className="min-h-10 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-900">
                {formData.projectName || 'N/A'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Client Information */}
          <div className="bg-white p-6 rounded-xl ">
            <h3 className="text-base font-semibold mb-4">Client Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <CustomSelect
                  options={clientOptions}
                  value={formData.clientId}
                  onChange={(value) => {
                    const selected = clients.find((client) => client.client_id === value);
                    setFormData((prev) => ({
                      ...prev,
                      clientId: value,
                      clientName: selected?.client_name || '',
                      clientEmail: selected?.email || '',
                      projectId: selected?.projectId || '',
                      projectName: selected?.projectName || '',
                      paymentTerms: selected?.paymentTerms || prev.paymentTerms,
                    }));
                  }}
                  placeholder="Select client"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email</Label>
                <Input
                  id="clientEmail"
                  name="clientEmail"
                  type="email"
                  placeholder="client@gmail.com"
                  value={formData.clientEmail}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  name="projectName"
                  placeholder="Enter project name"
                  value={formData.projectName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      projectName: e.target.value,
                      projectId: '',
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="bg-white p-6 rounded-xl ">
            <h3 className="text-base font-semibold mb-4">Invoice Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  placeholder="Enter date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Input
                  id="paymentTerms"
                  name="paymentTerms"
                  placeholder="Enter terms"
                  value={formData.paymentTerms}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stage">Stage</Label>
                <CustomSelect
                  options={[
                    { value: 'Planning', label: 'Planning' },
                    { value: 'In Progress', label: 'In Progress' },
                    { value: 'Completed', label: 'Completed' },
                  ]}
                  value={formData.stage}
                  onChange={(value) => setFormData(prev => ({ ...prev, stage: value }))}
                  placeholder="Select stage"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <CustomSelect
                  options={[
                    { value: 'Pending', label: 'Pending' },
                    { value: 'Paid', label: 'Paid' },
                    { value: 'Partially Paid', label: 'Partially Paid' },
                  ]}
                  value={formData.status}
                  onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  placeholder="Select status"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due date</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  placeholder="Enter date"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Line Terms */}
      <div className="bg-white p-6 rounded-xl ">
        <h3 className="text-base font-semibold mb-4">Line Terms</h3>
        <div className="space-y-4">
          {lineItems.map((item, index) => (
            <div key={item.id}>
              <div className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-5 space-y-2">
                  <Label htmlFor={`description-${item.id}`}>Description</Label>
                  <Input
                    id={`description-${item.id}`}
                    placeholder="Description of product"
                    value={item.description}
                    onChange={(e) =>
                      handleLineItemChange(item.id, 'description', e.target.value)
                    }
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor={`quantity-${item.id}`}>Quantity</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={`quantity-${item.id}`}
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleLineItemChange(item.id, 'quantity', e.target.value)
                      }
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500">bag</span>
                  </div>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor={`amount-${item.id}`}>Amount</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">XAF</span>
                    <Input
                      id={`amount-${item.id}`}
                      type="number"
                      step="0.01"
                      value={item.amount}
                      onChange={(e) =>
                        handleLineItemChange(item.id, 'amount', e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor={`total-${item.id}`}>Total Amount</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={`total-${item.id}`}
                      value={item.totalAmount}
                      readOnly
                      className="flex-1 bg-gray-50"
                    />
                  </div>
                </div>
                <div className="col-span-1 flex justify-end">
                  {lineItems.length > 1 && (
                    <button
                      onClick={() => removeLineItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addLineItem}
          className="mt-4 flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <FaPlus className="text-xs" />
          Add Items
        </button>
      </div>

      {/* Notes / Payment Instructions */}
      <div className="bg-white p-6 rounded-xl ">
        <h3 className="text-base font-semibold mb-4">Notes / Payment Instructions</h3>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="Add payment instructions, thank you message, or other notes..."
          className="w-full h-32 rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-ring resize-none"
        />
      </div>

      {/* Invoice Summary */}
      <div className="bg-blue-50 p-6 rounded-xl">
        <h3 className="text-base font-semibold mb-4">Invoice Summary</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">XAF {calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm items-center">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Discount</span>
              <Input
                type="number"
                step="0.1"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-16 h-7 text-xs"
              />
              <span className="text-gray-600">%:</span>
            </div>
            <span className="font-medium">XAF {calculateDiscount().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Amount Paid:</span>
            <span className="font-medium">XAF 0</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-300">
            <span>Total:</span>
            <span>XAF {calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
