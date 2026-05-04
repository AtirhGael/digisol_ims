import { useState, useEffect } from "react";
import { ChevronLeft, Save, Plus, X, Upload } from "lucide-react";
import { toast } from "sonner";
import useFetchHook from "../../../../Hooks/UseFetchHook";
import { CustomSelect } from "../../../../components/ui/CustomSelect";
import { Button } from "../../../../components/ui/button";
import { useDocumentNameResolver } from "../../../../Hooks/useDocumentNameResolver";
import TableSkeleton from "../../../../components/other/Loader/TableSkeleton";
import { useDocumentUpload } from "../../../../Hooks/useDocumentUpload";
import { getDocumentPublicUrl } from "../utils/document";

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 bg-white transition";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-6 ${className}`}>
      {children}
    </div>
  );
}
function PrimaryBtn({ children, onClick, className = "", type = "button", disabled = false }: {
  children: React.ReactNode; onClick?: () => void; className?: string; type?: "button" | "submit"; disabled?: boolean;
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto ${className}`}>
      {children}
    </button>
  );
}
function OutlineBtn({ children, onClick, disabled = false }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors w-full sm:w-auto ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      {children}
    </button>
  );
}
interface NewContractFormProps {
  onCancel: () => void;
  onSubmit: (contract: any) => void;
  editContract?: any;
}
export function NewContractForm({ onCancel, onSubmit, editContract }: NewContractFormProps) {
  const { resolveDocumentName } = useDocumentNameResolver();
  const { uploadDocument } = useDocumentUpload();
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [contractData, setContractData] = useState({
    contractTitle: "",
    proposal_id: "",
    proforma_id: "",
    startDate: "",
    endDate: "",
    description: "",
    renewal_type: "manual",
    billing_cycle: "monthly",
    next_billing_date: "",
    status: "",
    contract_value: "",
    currency: "XAF",
    document_file: null as File | null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [services, setServices] = useState<Array<{ service_id: string; service_name: string }>>([]);
  const { data: proposalsData, isLoading: isLoadingProposals, isError: isErrorProposals, error: errorProposals } = useFetchHook('/proposals-contracts/proposals', 'proposals-data', {
    enabled: true,
    refetchOnWindowFocus: false
  });

  const { data: proformaData, isLoading: isLoadingProformas, isError: isErrorProformas, error: errorProformas } = useFetchHook('/proposals-contracts/proforma-invoices', 'proforma-data', {
    enabled: true,
    refetchOnWindowFocus: false
  });

  const { data: servicesData, isLoading: isLoadingServices, isError: isErrorServices, error: errorServices } = useFetchHook('/services', 'services-data', {
    enabled: true,
    refetchOnWindowFocus: false
  });

  useEffect(() => {
    if (!isLoadingProposals && !isLoadingProformas && !isLoadingServices) {
      setIsFetchingData(false);
      if (isErrorProposals || isErrorProformas || isErrorServices) {
        setFetchError(
          (errorProposals?.message || errorProformas?.message || errorServices?.message || 'Failed to fetch required data')
        );
      } else {
        setFetchError(null);
      }
    }
  }, [isLoadingProposals, isLoadingProformas, isLoadingServices, isErrorProposals, isErrorProformas, isErrorServices, errorProposals, errorProformas, errorServices]);

  useEffect(() => {
    if (!fetchError) return;
    toast.error(fetchError);
  }, [fetchError]);

  const proposals = proposalsData?.success && proposalsData?.data ? 
    (Array.isArray(proposalsData.data) ? proposalsData.data : [proposalsData.data]) : [];
    
  const derivedProformas = proformaData?.success && proformaData?.data ? 
    (Array.isArray(proformaData.data) ? proformaData.data : [proformaData.data]) : [];

  const globalServices = servicesData?.success && servicesData?.data ? 
    (Array.isArray(servicesData.data) ? servicesData.data : [servicesData.data]) : [];


  const renewalTypes = ["auto", "manual"];
  const billingCycles = ["monthly", "quarterly", "yearly"];
  const currencies = ["XAF", "USD", "EUR"];

  const acceptedProposals = proposals.filter(
    (proposal: any) => String(proposal.status || "").toUpperCase() === "ACCEPTED"
  );
  const acceptedProformas = derivedProformas.filter(
    (proforma: any) => String(proforma.status || "").toUpperCase() === "ACCEPTED"
  );

  const proposalOptions = [
    { value: "", label: "No proposal selected" },
    ...acceptedProposals.map((proposal: any) => ({
      value: String(proposal.proposal_id),
      label: `${proposal.proposal_number} - ${proposal.proposal_title}`,
    })),
  ];

  if (
    editContract?.proposal_id &&
    !proposalOptions.some((option) => option.value === String(editContract.proposal_id))
  ) {
    proposalOptions.unshift({
      value: String(editContract.proposal_id),
      label:
        editContract?.proposals?.proposal_title
          ? `${editContract?.proposals?.proposal_number || "Current"} - ${editContract.proposals.proposal_title}`
          : "Current Proposal",
    });
  }

  const proformaOptions = [
    { value: "", label: "No proforma selected" },
    ...acceptedProformas.map((proforma: any) => ({
      value: String(proforma.proforma_id),
      label: `${proforma.proforma_number} - ${proforma.proforma_title || "Untitled"}`,
    })),
  ];

  if (
    editContract?.proforma_id &&
    !proformaOptions.some((option) => option.value === String(editContract.proforma_id))
  ) {
    proformaOptions.unshift({
      value: String(editContract.proforma_id),
      label: "Current Proforma",
    });
  }

  const statusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "ACCEPTED", label: "Accepted" },
    { value: "ACTIVE", label: "Active" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "REJECTED", label: "Rejected" },
  ];

  const currencyOptions = currencies.map((currency) => ({ value: currency, label: currency }));
  const renewalTypeOptions = renewalTypes.map((type) => ({ value: type, label: type }));
  const billingCycleOptions = billingCycles.map((cycle) => ({ value: cycle, label: cycle }));
  const serviceOptions = [
    { value: "", label: "Select a service" },
    ...globalServices.map((service: any) => ({
      value: String(service.service_id),
      label: `${service.service_name}${service.service_code ? ` (${service.service_code})` : ""} - XAF ${Number(service.price || 0).toLocaleString()}`,
    })),
  ];

  useEffect(() => {
    if (editContract) {
      setContractData({
        contractTitle: editContract.contract_title || "",
        proposal_id: editContract.proposal_id || "",
        proforma_id: editContract.proforma_id || "",
        startDate: editContract.start_date ? editContract.start_date.split('T')[0] : "",
        endDate: editContract.end_date ? editContract.end_date.split('T')[0] : "",
        description: editContract.description || "",
        renewal_type: editContract.renewal_type || "manual",
        billing_cycle: editContract.billing_cycle || "monthly",
        next_billing_date: editContract.next_billing_date ? editContract.next_billing_date.split('T')[0] : "",
        status: editContract.status || "",
        contract_value: editContract.contract_value || "",
        currency: editContract.currency || "XAF",
        document_file: null
      });
      if (editContract.contract_services && editContract.contract_services.length > 0) {
        setServices(editContract.contract_services.map((cs: any) => ({
          service_id: cs.service_id || "",
          service_name: cs.services?.service_name || ""
        })));
      } else {
        setServices([]);
      }
    }
  }, [editContract]);

  const addService = () => {
    setServices([...services, { service_id: "", service_name: "" }]);
  };
  const updateService = (index: number, field: 'service_id' | 'service_name', value: string) => {
    setServices(services.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };
  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.toLowerCase().startsWith("video/")) {
        toast.error("Video files are not allowed. Please upload a PDF, DOC, or DOCX file.");
        e.target.value = "";
        return;
      }
      setContractData({ ...contractData, document_file: file });
      if (errors.document) {
        setErrors({ ...errors, document: "" });
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!contractData.contractTitle.trim()) {
      newErrors.contractTitle = "Contract title is required";
    }
    if (!contractData.proforma_id) {
      newErrors.proforma_id = "Please select a proforma";
    }
    if (!contractData.startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (!contractData.endDate) {
      newErrors.endDate = "End date is required";
    }
    if (contractData.startDate && contractData.endDate && new Date(contractData.startDate) >= new Date(contractData.endDate)) {
      newErrors.endDate = "End date must be after start date";
    }
    if (!contractData.contract_value.trim()) {
      newErrors.contract_value = "Contract value is required";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error(Object.values(newErrors)[0]);
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      let documentUrl = editContract?.document_url || null;
      if (contractData.document_file) {
        try {
          documentUrl = await uploadDocument(contractData.document_file, {
            folder: "proposal-contracts/contracts",
          });
        } catch (error) {
          toast.error(`Failed to upload document: ${(error as Error).message}`);
          return;
        }
      }
      const contractPayload = {
        contract_number: editContract?.contract_number || `CON-${Date.now()}`,
        contract_title: contractData.contractTitle,
        proposal_id: contractData.proposal_id || null,
        proforma_id: contractData.proforma_id || null,
        description: contractData.description,
        renewal_type: contractData.renewal_type,
        billing_cycle: contractData.billing_cycle,
        next_billing_date: contractData.next_billing_date || null,
        start_date: contractData.startDate,
        end_date: contractData.endDate,
        contract_value: parseFloat(contractData.contract_value || '0'),
        currency: contractData.currency,
        document_url: documentUrl,
        ...(contractData.status ? { status: contractData.status } : {}),
        contract_services: services
          .filter(s => s.service_id)
          .map(s => ({
            service_id: s.service_id,
            service_name: s.service_name
          }))
      };
      await onSubmit(contractPayload);
      setIsSubmitting(false);
    } catch (error) {
      toast.error((error as Error)?.message || "Failed to save contract. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isFetchingData) {
    return (
      <TableSkeleton rows={6} columns={4} showHeader={true} showSearch={false} showFilters={false} />
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-red-500 mb-4">{fetchError}</p>
        <Button onClick={() => window.location.reload()} loading={false}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <nav className="flex items-center gap-1 text-sm text-gray-400">
        <button onClick={onCancel} className="hover:text-primary flex items-center gap-1 transition-colors">
          <ChevronLeft size={14} /> Contracts
        </button>
        <span>/</span>
        <span className="text-gray-700 font-medium">
          {editContract ? 'Edit Contract' : 'New Contract'}
        </span>
      </nav>
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{editContract ? "Edit contract" : "Create new contract"}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <SectionCard>
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Contract Title *</label>
              <input
                type="text"
                className={inputCls}
                placeholder="Enter contract title"
                value={contractData.contractTitle}
                onChange={(e) => setContractData({ ...contractData, contractTitle: e.target.value })}
              />
              {errors.contractTitle && <p className="text-red-500 text-xs mt-1">{errors.contractTitle}</p>}
            </div>
            <div>
              <label className={labelCls}>Related Proposal</label>
              <CustomSelect
                className={inputCls}
                value={contractData.proposal_id || ""}
                onChange={(value) => setContractData({ ...contractData, proposal_id: value })}
                options={proposalOptions}
                placeholder="Select a proposal"
              />
              {errors.proposal_id && <p className="text-red-500 text-sm mt-1">{errors.proposal_id}</p>}
            </div>
            <div>
              <label className={labelCls}>Related Proforma (Optional)</label>
              <CustomSelect
                className={inputCls}
                value={contractData.proforma_id}
                onChange={(value) => setContractData({ ...contractData, proforma_id: value })}
                options={proformaOptions}
                placeholder="Select a proforma invoice"
              />
            </div>
            <div>
              <label className={labelCls}>Start Date</label>
              <input
                type="date"
                className={inputCls}
                value={contractData.startDate}
                onChange={(e) => setContractData({ ...contractData, startDate: e.target.value })}
              />
              {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className={labelCls}>End Date</label>
              <input
                type="date"
                className={inputCls}
                value={contractData.endDate}
                onChange={(e) => setContractData({ ...contractData, endDate: e.target.value })}
              />
              {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
            </div>
            <div>
              <label className={labelCls}>Next Billing Date</label>
              <input
                type="date"
                className={inputCls}
                value={contractData.next_billing_date}
                onChange={(e) => setContractData({ ...contractData, next_billing_date: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <CustomSelect
                className={inputCls}
                value={contractData.status}
                onChange={(value) => setContractData({ ...contractData, status: value })}
                options={statusOptions}
                placeholder="Select a status"
              />
            </div>
          </div>
        </SectionCard>
        {/* Contract Details */}
        <SectionCard>
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Contract Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className={labelCls}>Contract Value *</label>
              <input
                type="number"
                className={inputCls}
                placeholder="Enter contract value"
                value={contractData.contract_value}
                onChange={(e) => setContractData({ ...contractData, contract_value: e.target.value })}
              />
              {errors.contract_value && <p className="text-red-500 text-sm mt-1">{errors.contract_value}</p>}
            </div>
            <div>
              <label className={labelCls}>Currency</label>
              <CustomSelect
                className={inputCls}
                value={contractData.currency}
                onChange={(value) => setContractData({ ...contractData, currency: value })}
                options={currencyOptions}
              />
            </div>
            <div>
              <label className={labelCls}>Renewal Type</label>
              <CustomSelect
                className={inputCls}
                value={contractData.renewal_type}
                onChange={(value) => setContractData({ ...contractData, renewal_type: value })}
                options={renewalTypeOptions}
              />
            </div>
            <div>
              <label className={labelCls}>Billing Cycle</label>
              <CustomSelect
                className={inputCls}
                value={contractData.billing_cycle}
                onChange={(value) => setContractData({ ...contractData, billing_cycle: value })}
                options={billingCycleOptions}
              />
            </div>
          </div>
        </SectionCard>
        {/* Description */}
        <SectionCard>
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Description</h3>
          <textarea
            className={`${inputCls} h-24`}
            placeholder="Enter contract description"
            value={contractData.description}
            onChange={(e) => setContractData({ ...contractData, description: e.target.value })}
          />
        </SectionCard>
        {/* Document Upload */}
        <SectionCard>
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Contract Document</h3>
          {editContract?.document_url && (
            <div className="mb-3 p-3 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Current Document</p>
                <a 
                  href={getDocumentPublicUrl(editContract.document_url)} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs text-primary hover:underline"
                >
                  {resolveDocumentName(editContract.document_url)}
                </a>
              </div>
            </div>
          )}
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
            <input
              type="file"
              id="document"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="document" className="cursor-pointer">
              <div className="flex flex-col items-center gap-3">
                <Upload size={32} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {contractData.document_file ? contractData.document_file.name : 'Upload contract document'}
                  </p>
                  <p className="text-sm text-gray-500">PDF, DOC, or DOCX files only</p>
                </div>
              </div>
            </label>
          </div>
        </SectionCard>
        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6">
          <OutlineBtn onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </OutlineBtn>
          <PrimaryBtn type="submit" disabled={isSubmitting}>
            <Save size={16} />
            {isSubmitting ? 'Saving...' : editContract ? 'Update Contract' : 'Create Contract'}
          </PrimaryBtn>
        </div>
      </form>
    </div>
  );
}
