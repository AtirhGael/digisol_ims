import React, { useState, useMemo } from 'react';
import { ChevronLeft, Save, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useFetchHook } from '../../../../Hooks/UseFetchHook';
import { CustomSelect } from "../../../../components/ui/CustomSelect";
import { useDocumentNameResolver } from "../../../../Hooks/useDocumentNameResolver";
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
    <button onClick={onClick} disabled={disabled}
      className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors w-full sm:w-auto">
      {children}
    </button>
  );
}

interface ProformaFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  editProforma?: any;
}

export const NewProformaForm: React.FC<ProformaFormProps> = ({ 
  onSubmit, 
  onCancel, 
  editProforma 
}) => {
  const { resolveDocumentName } = useDocumentNameResolver();
  const { uploadDocument } = useDocumentUpload();
  const [form, setForm] = useState({
    proformaNumber: editProforma?.proforma_number || "",
    proformaTitle: editProforma?.proformaTitle || "",
    selectedProposal: editProforma?.proposalTitle || "",
    proposal_id: editProforma?.proposal_id ? String(editProforma.proposal_id) : "",
    description: editProforma?.description || "",
    proformaValue: editProforma?.value ? String(editProforma.value) : "",
    status: editProforma?.status || "PENDING",
    currency: editProforma?.currency || "XAF",
    documentFile: null as File | null,
    document_url: editProforma?.document_url || "",
    services: editProforma?.proforma_invoice_services?.length
      ? editProforma.proforma_invoice_services.map((s: any) => ({
          service_id: s.service_id,
          service_name: s.services?.service_name || "Unknown Service"
        }))
      : [{ service_id: "", service_name: "" }],
    dateCreated: editProforma?.dateCreated || "",
    dateSent: editProforma?.dateSent || "",
    proforma_number: editProforma?.proforma_number || ""
  });

  const [nextId, setNextId] = useState(1000);
  const [isLoading, setIsLoading] = useState(false);
  
  const uid = () => { const id = nextId; setNextId(n => n + 1); return id; };
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const { data: proposalsData, isLoading: isLoadingProposals, isError: isProposalsError } = useFetchHook('/proposals-contracts/proposals', 'proposals-for-proforma', {
    enabled: true,
    refetchOnWindowFocus: false
  });

  const { data: servicesData, isLoading: isLoadingServices } = useFetchHook('/services', 'services-list', {
    enabled: true,
    refetchOnWindowFocus: false
  });

  const availableServices = useMemo(() => {
    if (servicesData?.success && Array.isArray(servicesData.data)) {
      return servicesData.data;
    }
    return [];
  }, [servicesData]);

  const allProposals = useMemo(() => {
    if (isProposalsError) return [];
    if (proposalsData?.success && proposalsData?.data) {
      return Array.isArray(proposalsData.data) ? proposalsData.data : [proposalsData.data];
    }
    return [];
  }, [proposalsData, isProposalsError]);

  const acceptedProposals = useMemo(() => {
    return allProposals.filter((p: any) => p.status === 'ACCEPTED');
  }, [allProposals]);

  const proposalOptions = useMemo(
    () => {
      const options = acceptedProposals.map((proposal: any) => ({
        value: String(proposal.proposal_id),
        label: `${proposal.proposal_title} - ${proposal.clients?.client_name || proposal.leads?.lead_name || proposal.leads?.company_name || "Unknown Client"}`,
      }));

      if (
        editProforma?.proposal_id &&
        !options.some((option) => option.value === String(editProforma.proposal_id))
      ) {
        options.unshift({
          value: String(editProforma.proposal_id),
          label: editProforma.proposalTitle || "Current Proposal",
        });
      }

      return options;
    },
    [acceptedProposals, editProforma]
  );

  const currencyOptions = [
    { value: "XAF", label: "XAF" },
    { value: "USD", label: "USD" },
    { value: "EUR", label: "EUR" },
  ];

  const statusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "SENT", label: "Sent" },
    { value: "ACCEPTED", label: "Accepted" },
    { value: "REJECTED", label: "Rejected" },
  ];

  const serviceOptions = useMemo(
    () =>
      [
        { value: "", label: "Select a service" },
        ...availableServices.map((apiService: any) => ({
          value: String(apiService.service_id),
          label: `${apiService.service_name}${apiService.service_code ? ` (${apiService.service_code})` : ""} - XAF ${Number(apiService.price || 0).toLocaleString()}`,
        })),
      ],
    [availableServices]
  );

  const addService = () => {
    setForm(f => ({ ...f, services: [...f.services, { service_id: "", service_name: "" }] }));
  };

  const removeService = (index: number) => {
    setForm(f => ({ ...f, services: f.services.filter((_, i) => i !== index) }));
  };

  const updateService = (index: number, service_id: string, service_name: string) => {
    setForm(f => ({
      ...f,
      services: f.services.map((service, i) => i === index ? { service_id, service_name } : service)
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      if (!form.proposal_id) {
        toast.error("Please select a proposal.");
        return;
      }

      if (!form.proformaTitle.trim()) {
        toast.error("Please enter a proforma title.");
        return;
      }

      if (!form.proformaValue || Number(form.proformaValue) <= 0) {
        toast.error('Please enter a valid proforma value.');
        setIsLoading(false);
        return;
      }

      const validServices = form.services.filter(s => s.service_id && s.service_id.trim() !== "");

      let documentUrl = form.document_url;
      
      if (form.documentFile) {
        try {
          documentUrl = await uploadDocument(form.documentFile, {
            folder: "proposal-contracts/proforma",
          });
        } catch (error) {
          toast.error('Failed to upload document: ' + (error as Error).message);
          return;
        }
      }

      const proforma = {
        id: editProforma?.id || uid(),
        proformaTitle: form.proformaTitle || "New Proforma",
        proposalTitle: form.selectedProposal || "Unknown Proposal",
        proposal_id: form.proposal_id,
        value: parseFloat(form.proformaValue) || 0,
        status: form.status,
        dateAdded: new Date().toLocaleDateString("en-US"),
        dateCreated: form.dateCreated,
        dateSent: form.dateSent,
        description: form.description,
        services: validServices.map(s => ({ service_id: s.service_id, quantity: 1, unit_price: 0 })),
        currency: form.currency,
        document_url: documentUrl,
        ...(form.proformaNumber.trim() && { proforma_number: form.proformaNumber.trim() })
      };
      
      await onSubmit(proforma);
    } catch (error) {
      toast.error("An error occurred while saving the proforma. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-400">
        <button onClick={onCancel} className="hover:text-primary flex items-center gap-1 transition-colors">
          <ChevronLeft size={14} /> Back
        </button>
        <span>/</span>
        <span className="text-gray-700 font-medium">{editProforma ? 'Edit Proforma' : 'New Proforma'}</span>
      </nav>

      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{editProforma ? 'Edit proforma' : 'Create new proforma'}</h1>

      <SectionCard>
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
          <h2 className="text-base font-semibold text-gray-800">{editProforma ? 'Edit proforma' : 'Create new proforma'}</h2>
        </div>
        
        <div className="space-y-6">
          {/* Proposal Selection */}
          <div>
            <label className={labelCls}>
              Select Proposal <span className="text-red-500">*</span>
            </label>
            {isLoadingProposals && (
              <div className="text-sm text-gray-500">Loading proposals...</div>
            )}
            {!isLoadingProposals && acceptedProposals.length === 0 && !editProforma?.proposal_id && (
              <div className="text-sm text-gray-500 bg-yellow-50 p-2 rounded">
                No accepted proposals available. A proposal must be accepted before creating a proforma.
              </div>
            )}
            {!isLoadingProposals && proposalOptions.length > 0 && (
              <CustomSelect
                className={inputCls}
                value={form.proposal_id}
                options={proposalOptions}
                placeholder={
                  acceptedProposals.length === 0 ? "No proposals available" :
                  isLoadingProposals ? "Loading..." : "Select a proposal"
                }
                onChange={(selectedValue) => {
                  const selectedProposal = allProposals.find((p: any) => String(p.proposal_id) === selectedValue);
                  set('proposal_id', selectedValue);
                  set('selectedProposal', selectedProposal?.proposal_title || proposalOptions.find((option) => option.value === selectedValue)?.label || "");
                }}
                disabled={isLoadingProposals || proposalOptions.length === 0}
              />
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className={labelCls}>
                Proforma Title <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                className={inputCls}
                value={form.proformaTitle} 
                onChange={(e) => set('proformaTitle', e.target.value)} 
                placeholder="Enter proforma title"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>
                Value <span className="text-red-500">*</span>
              </label>
              <input 
                type="number"
                step="0.01"
                min="0"
                className={inputCls}
                value={form.proformaValue} 
                onChange={(e) => set('proformaValue', e.target.value)} 
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className={labelCls}>Currency</label>
              <CustomSelect
                className={inputCls}
                value={form.currency} 
                onChange={(value) => set('currency', value)}
                options={currencyOptions}
              />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <CustomSelect
                className={inputCls}
                value={form.status} 
                onChange={(value) => set('status', value)}
                options={statusOptions}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea 
              className={inputCls}
              rows={3}
              value={form.description} 
              onChange={(e) => set('description', e.target.value)} 
              placeholder="Enter proforma description..."
            />
          </div>

          {/* Services Section */}
          <div>
            <label className={labelCls}>Services</label>
            <div className="space-y-3">
              {isLoadingServices ? (
                <div className="text-sm text-gray-500">Loading available services...</div>
              ) : (
                <>
                  {form.services.map((service, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2">
                       <CustomSelect
                        value={service.service_id}
                        options={serviceOptions}
                        placeholder="Select a service"
                        onChange={(value) => {
                          const selectedOption = serviceOptions.find((option) => option.value === value);
                          updateService(index, value, selectedOption?.label || "");
                        }}
                        className={inputCls}
                      />
                      {form.services.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center justify-center shrink-0 w-full sm:w-auto"
                          title="Remove service"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addService}
                    className="flex items-center gap-2 px-4 py-2 mt-2 border border-dashed border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors w-full justify-center text-sm font-medium"
                  >
                    <Plus size={16} />
                    Add Another Service
                  </button>
                </>
              )}
            </div>
          </div>

          <div>
            <label className={labelCls}>Proforma Document (Optional)</label>
            {editProforma?.document_url && (
              <div className="mb-3 p-3 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Current Document</p>
                  <a 
                    href={getDocumentPublicUrl(editProforma.document_url)} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-xs text-primary hover:underline"
                  >
                    {resolveDocumentName(editProforma.document_url)}
                  </a>
                </div>
              </div>
            )}
            <input 
              type="file" 
              className={inputCls}
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (file && file.type.toLowerCase().startsWith("video/")) {
                  toast.error("Video files are not allowed. Please upload a PDF, DOC, or DOCX file.");
                  e.target.value = "";
                  return;
                }
                setForm(f => ({ ...f, documentFile: file }));
              }}
            />
            {form.documentFile && (
              <p className="text-green-600 text-xs mt-1">
                Selected: {form.documentFile.name} ({(form.documentFile.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX</p>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 pt-6 border-t">
            <OutlineBtn onClick={onCancel} disabled={isLoading}>Cancel</OutlineBtn>
            <PrimaryBtn onClick={handleSubmit} disabled={isLoading}>
              <Save size={16} />
              {isLoading ? "Saving..." : editProforma ? 'Update Proforma' : 'Save Proforma'}
            </PrimaryBtn>
          </div>
        </div>
      </SectionCard>
    </div>
  );
};

export default NewProformaForm;
