import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, Save } from "lucide-react";
import { toast } from "sonner";
import type { Proposal } from "../types";
import useFetchHook from "../../../../Hooks/UseFetchHook";
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

function PrimaryBtn({ children, onClick, className = "", type = "button" }: {
  children: React.ReactNode; onClick?: () => void; className?: string; type?: "button" | "submit";
}) {
  return (
    <button type={type} onClick={onClick}
      className={`flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/80 transition-colors w-full sm:w-auto ${className}`}>
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

interface NewProposalFormProps {
  onCancel: () => void;
  onSubmit: (p: Proposal) => void;
  editProposal?: Proposal | null;
}

type ProposalFormClient = {
  client_id: string;
  client_name: string;
  contact_person?: string;
};

type ProposalFormLead = {
  lead_id: string;
  company_name: string;
  contact_person?: string;
};

const toInputDate = (value?: string): string => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().split("T")[0];
};

export function NewProposalForm({ onCancel, onSubmit, editProposal }: NewProposalFormProps) {
  const { resolveDocumentName } = useDocumentNameResolver();
  const { uploadDocument } = useDocumentUpload();
  const [nextId, setNextId] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    leadId: editProposal?.leadId ? String(editProposal.leadId) : "",
    clientId: editProposal?.clientId ? String(editProposal.clientId) : "",
    proposalNumber: editProposal?.proposal_number || "",
    title: editProposal?.title || "",
    validUntil: toInputDate(editProposal?.validUntil),
    status: editProposal?.status || "PENDING",
    description: editProposal?.description || "",
    services: editProposal?.services ? editProposal.services.join(', ') : "",
    documentFile: null as File | null
  });

  useEffect(() => {
    if (!editProposal) return;
    setForm((prev) => ({
      ...prev,
      leadId: editProposal.leadId ? String(editProposal.leadId) : "",
      clientId: editProposal.clientId ? String(editProposal.clientId) : "",
      proposalNumber: editProposal.proposal_number || "",
      title: editProposal.title || "",
      validUntil: toInputDate(editProposal.validUntil),
      status: editProposal.status || "PENDING",
      description: editProposal.description || "",
      services: editProposal.services ? editProposal.services.join(", ") : "",
      documentFile: null,
    }));
  }, [editProposal]);

  const uid = () => { const id = nextId; setNextId(n => n + 1); return id; };

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setFieldErrors((prev) => {
      if (!prev[k]) return prev;
      const next = { ...prev };
      delete next[k];
      return next;
    });
  };

  const { data: clientsData, isLoading: isLoadingClients, isError: isClientsError } = useFetchHook('/client-management/clients', 'clients-data', {
    enabled: true,
    refetchOnWindowFocus: false
  });

  const { data: leadsData, isLoading: isLoadingLeads, isError: isLeadsError } = useFetchHook('/contacts-leads?type=all&page=1&limit=200', 'leads-data', {
    enabled: true,
    refetchOnWindowFocus: false
  });

  const asArray = (value: any): any[] => {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== "object") return [];
    if (Array.isArray(value.items)) return value.items;
    if (Array.isArray(value.data)) return value.data;
    return [];
  };

  const clients = useMemo<ProposalFormClient[]>(() => {
    if (isClientsError) {
      return [];
    }
    const payload = clientsData?.data ?? clientsData;
    const candidates = [
      ...asArray(payload),
      ...asArray(payload?.clients),
      ...asArray(payload?.items),
    ];

    const normalized = candidates
      .map((client: any) => ({
        client_id: String(client?.client_id ?? client?.id ?? ""),
        client_name: client?.client_name ?? client?.name ?? client?.company_name ?? "",
        contact_person: client?.contact_person ?? client?.name ?? "",
      }))
      .filter((client) => client.client_id && client.client_name);

    const unique = new Map<string, ProposalFormClient>();
    normalized.forEach((client) => unique.set(client.client_id, client));
    return Array.from(unique.values());
  }, [clientsData, isClientsError]);

  const leads = useMemo<ProposalFormLead[]>(() => {
    if (isLeadsError) {
      return [];
    }
    const payload = leadsData?.data ?? leadsData;
    const candidates = [
      ...asArray(payload),
      ...asArray(payload?.leads),
      ...asArray(payload?.leadList),
      ...asArray(payload?.items),
    ];

    const normalized = candidates
      .filter((lead: any) => {
        const itemType = String(lead?.type ?? "").toLowerCase();
        if (!itemType) return true;
        return itemType === "lead" || itemType === "leads";
      })
      .map((lead: any) => ({
        lead_id: String(lead?.lead_id ?? lead?.id ?? ""),
        company_name: lead?.company_name ?? lead?.company ?? lead?.client_name ?? "Unknown Lead",
        contact_person: lead?.contact_person ?? lead?.name ?? "",
      }))
      .filter((lead) => lead.lead_id);

    const unique = new Map<string, ProposalFormLead>();
    normalized.forEach((lead) => unique.set(lead.lead_id, lead));
    return Array.from(unique.values());
  }, [leadsData, isLeadsError]);

  useEffect(() => {
    if (isLeadsError) {
      toast.error("Unable to load leads from the database.");
    }
  }, [isLeadsError]);

  useEffect(() => {
    if (isClientsError) {
      toast.error("Unable to load clients from the database.");
    }
  }, [isClientsError]);

  const leadOptions = useMemo(
    () =>
      [
        { value: "", label: "No lead selected" },
        ...leads.map((lead: any) => ({
          value: String(lead.lead_id),
          label: `${lead.company_name} - ${lead.contact_person}`,
        })),
      ],
    [leads]
  );

  const clientOptions = useMemo(
    () =>
      [
        { value: "", label: "No client selected" },
        ...clients.map((client: any) => ({
          value: String(client.client_id),
          label: `${client.client_name} - ${client.contact_person || "No contact"}`,
        })),
      ],
    [clients]
  );

  const statusOptions = [
    { value: "PENDING", label: "Pending" },
    { value: "ACCEPTED", label: "Accepted" },
    { value: "REJECTED", label: "Rejected" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!form.title.trim()) {
      newErrors.title = "Proposal title is required.";
    }
    if (!form.validUntil) {
      newErrors.validUntil = "Valid until date is required.";
    }
    if (!form.status) {
      newErrors.status = "Status is required.";
    }
    if (!form.description.trim()) {
      newErrors.description = "Description is required.";
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      toast.error("Please complete the required fields highlighted in red.");
      return;
    }

    setIsSubmitting(true);
    try {
      let documentUrl = editProposal?.documentUrl;

      if (form.documentFile) {
        try {
          documentUrl = await uploadDocument(form.documentFile, {
            folder: "proposal-contracts/proposals",
          });
        } catch (error) {
          toast.error('Failed to upload document: ' + (error as Error).message);
          return;
        }
      }

    const p: Proposal = {
      id: editProposal?.id || uid(), 
      proposal_number: form.proposalNumber || `PROP-${Date.now()}`,
      title: form.title || "New Proposal", 
      company: form.clientId && form.clientId !== "" ? clients.find(c => String(c.client_id) === String(form.clientId))?.client_name || "Unknown Client" :
               form.leadId && form.leadId !== "" ? leads.find(l => String(l.lead_id) === String(form.leadId))?.company_name || "Unknown Lead" :
               "General Proposal",
      status: form.status as any,
      dateAdded: editProposal?.dateAdded || new Date().toLocaleDateString("en-US"),
      description: form.description,
      validUntil: form.validUntil,
      services: form.services ? form.services.split(',').map(s => s.trim()).filter(Boolean) : [],
      documentUrl: documentUrl,
      contactBreakdown: editProposal?.contactBreakdown || { normal: 0, potential: 0, client: 0 },
      sentDate: editProposal?.sentDate,
      decisionDate: editProposal?.decisionDate,
      createdBy: editProposal?.createdBy,
      clientId: form.clientId && form.clientId !== "" ? form.clientId : undefined,
      leadId: form.leadId && form.leadId !== "" ? form.leadId : undefined,
      targetEntity: editProposal?.targetEntity || {
        type: form.clientId && form.clientId !== "" ? 'Client' : form.leadId && form.leadId !== "" ? 'Lead' : 'Unknown',
        company: form.clientId && form.clientId !== "" ? clients.find(c => String(c.client_id) === String(form.clientId))?.client_name || "Unknown Client" :
                 form.leadId && form.leadId !== "" ? leads.find(l => String(l.lead_id) === String(form.leadId))?.company_name || "Unknown Lead" :
                 "General Proposal",
        contact: 'N/A',
        email: 'N/A',
        phone: 'N/A'
      }
    };
    
    await onSubmit(p);
    } catch (error) {
      toast.error("Failed to save proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-400">
        <button onClick={onCancel} className="hover:text-primary flex items-center gap-1 transition-colors">
          <ChevronLeft size={14} /> Proposals &amp; Contracts
        </button>
        <span>/</span>
        <span className="text-gray-700 font-medium">{editProposal ? 'Edit Proposal' : 'New Proposal'}</span>
      </nav>

      <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{editProposal ? 'Edit proposal' : 'Create new proposal'}</h1>

      <SectionCard>
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
          <h2 className="text-base font-semibold text-gray-800">{editProposal ? 'Edit proposal' : 'Create new proposal'}</h2>
        </div>
        
        <div className="space-y-6">
          {/* Lead and Client Selection */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Lead & Client Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelCls}>Select Lead (Optional)</label>
                <CustomSelect
                  className={inputCls}
                  value={form.leadId} 
                  onChange={(value) => set("leadId", value)}
                  options={leadOptions}
                  placeholder={
                    isLoadingLeads
                      ? "Loading leads..."
                      : isLeadsError
                      ? "Failed to load leads"
                      : "Select a lead..."
                  }
                  disabled={isLoadingLeads}
                />
                {isLeadsError && (
                  <p className="text-xs text-red-500">Unable to load leads. You can still create a proposal without selecting a lead.</p>
                )}
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Select Client (Optional)</label>
                <CustomSelect
                  className={inputCls}
                  value={form.clientId} 
                  onChange={(value) => set("clientId", value)}
                  options={clientOptions}
                  placeholder={
                    isLoadingClients
                      ? "Loading clients..."
                      : isClientsError
                      ? "Failed to load clients"
                      : "Select a client..."
                  }
                  disabled={isLoadingClients}
                />
                {isClientsError && (
                  <p className="text-xs text-red-500">Unable to load clients. You can still create a proposal without selecting a client.</p>
                )}
              </div>
            </div>
          </section>

          {/* Proposal Details */}
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Proposal Details</h3>
            
            <div className="space-y-1">
              <label className={labelCls}>Proposal Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                placeholder="e.g. Annual Maintenance Services"
                className={`${inputCls} ${fieldErrors.title ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
                value={form.title}
                onChange={e => set("title", e.target.value)}
              />
              {fieldErrors.title && <p className="text-xs text-red-500">{fieldErrors.title}</p>}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className={labelCls}>Valid Until <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  className={`${inputCls} ${fieldErrors.validUntil ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
                  value={form.validUntil}
                  onChange={e => set("validUntil", e.target.value)}
                />
                {fieldErrors.validUntil && <p className="text-xs text-red-500">{fieldErrors.validUntil}</p>}
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Status <span className="text-red-500">*</span></label>
                <CustomSelect
                  className={`${inputCls} ${fieldErrors.status ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`}
                  value={form.status}
                  onChange={(value) => set("status", value)}
                  options={statusOptions}
                />
                {fieldErrors.status && <p className="text-xs text-red-500">{fieldErrors.status}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Services Offered</label>
              <textarea rows={3} className={inputCls} placeholder="List the services offered (comma-separated)"
                value={form.services} 
                onChange={e => set("services", e.target.value)}></textarea>
              <p className="text-xs text-gray-500 mt-1">Enter services separated by commas</p>
            </div>
            
            <div className="space-y-1">
              <label className={labelCls}>Description / Scope of Work <span className="text-red-500">*</span></label>
              <textarea rows={4} className={`${inputCls} ${fieldErrors.description ? "border-red-400 focus:ring-red-200 focus:border-red-400" : ""}`} placeholder="Detailed service description..."
                value={form.description} onChange={e => set("description", e.target.value)}></textarea>
              {fieldErrors.description && <p className="text-xs text-red-500">{fieldErrors.description}</p>}
            </div>

            <div className="space-y-1">
              <label className={labelCls}>Upload Document</label>
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
              {editProposal?.documentUrl && !form.documentFile && (
                <p className="text-blue-600 text-xs mt-1">
                  Current document:{" "}
                  <a
                    href={getDocumentPublicUrl(editProposal.documentUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {resolveDocumentName(editProposal.documentUrl)}
                  </a>
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Accepted formats: PDF, DOC, DOCX (Max: 50MB)
              </p>
            </div>
          </section>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6">
          <OutlineBtn onClick={onCancel} disabled={isSubmitting}>Cancel</OutlineBtn>
          <PrimaryBtn onClick={handleSubmit} className={isSubmitting ? "opacity-50 cursor-not-allowed" : ""}>
            {isSubmitting ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {editProposal ? 'Updating...' : 'Saving...'}
              </>
            ) : (
              <>
                <Save size={13} /> {editProposal ? 'Update Proposal' : 'Save Proposal'}
              </>
            )}
          </PrimaryBtn>
        </div>
      </SectionCard>
    </div>
  );
}
