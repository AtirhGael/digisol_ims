import { ChevronLeft, Pencil, FileText, ExternalLink, Download } from "lucide-react";
import type { Proposal, ProposalStatus } from "../types";
import { formatDate } from "../utils/dateTime";
import { useDocumentNameResolver } from "../../../../Hooks/useDocumentNameResolver";
import { getDocumentPublicUrl } from "../utils/document";

// Status color config 
const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  ACCEPTED:    { label: "ACCEPTED",    cls: "text-emerald-600 bg-emerald-50 border border-emerald-200" },
  DRAFT:       { label: "DRAFT",       cls: "text-gray-500   bg-gray-100   border border-gray-200"    },
  SENT:        { label: "SENT",        cls: "text-sky-600    bg-sky-50     border border-sky-200"     },
  REJECTED:    { label: "REJECTED",    cls: "text-red-500    bg-red-50     border border-red-200"     },
  NEGOTIATION: { label: "NEGOTIATION", cls: "text-amber-600  bg-amber-50   border border-amber-200"   },
  PENDING:     { label: "PENDING",     cls: "text-yellow-600  bg-yellow-50   border border-yellow-200"   },
};

function Badge({ status }: { status: string }) {
  const statusConfig = STATUS_CFG[status.toUpperCase()] || { 
    label: status.toUpperCase(), 
    cls: "text-gray-600 bg-gray-100 border border-gray-200" 
  };
  const { label, cls } = statusConfig;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold tracking-wide ${cls}`}>
      {label}
    </span>
  );
}

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
      className={`flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/80 transition-colors ${className}`}>
      {children}
    </button>
  );
}

interface ProposalDetailProps {
  proposal: Proposal;
  onBack: () => void;
  onEdit?: () => void;
}

export function ProposalDetail({ proposal, onBack, onEdit }: ProposalDetailProps) {
  const { resolveDocumentName } = useDocumentNameResolver();
  const addedDate = formatDate(proposal.dateAdded);
  const sentDate = proposal.sentDate ? formatDate(proposal.sentDate) : undefined;
  const decisionDate = proposal.decisionDate ? formatDate(proposal.decisionDate) : undefined;
  const validUntil = proposal.validUntil ? formatDate(proposal.validUntil, "") : "";

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-400">
        <button onClick={onBack} className="hover:text-primary flex items-center gap-1 transition-colors">
          <ChevronLeft size={14} /> Proposals &amp; Contracts
        </button>
        <span>/</span>
        <span className="text-gray-700 font-medium truncate">{proposal.title}</span>
      </nav>

      {/* Header Card */}
      <SectionCard>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-gray-900">{proposal.title}</span>
              <Badge status={proposal.status} />
            </div>
            <p className="text-sm text-gray-400">{proposal.description ?? `Proposal for ${proposal.company}`}</p>
            <p className="text-xs text-gray-400 mt-0.5">Client: <span className="font-medium text-gray-600">{proposal.company}</span></p>
          </div>
          <PrimaryBtn onClick={onEdit} className="shrink-0 rounded-lg w-full sm:w-auto justify-center">
            <Pencil size={13} /> Edit
          </PrimaryBtn>
        </div>
      </SectionCard>

      {/* 2-column row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Timeline */}
        <SectionCard>
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Timeline</h3>
          <div className="flex flex-col gap-3">
            {[
              ["Date Added", addedDate],
              ["Status", proposal.status],
              ...(sentDate ? [["Sent Date", sentDate]] : []),
              ...(decisionDate ? [["Decision Date", decisionDate]] : []),
              ...(proposal.proposal_number ? [["Proposal Number", proposal.proposal_number]] : []),
            ].map(([k, v]) => (
              <div key={k} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <span className="text-sm text-gray-400 shrink-0">{k}</span>
                <span className="text-sm font-medium text-gray-700 sm:text-right break-words">{v}</span>
              </div>
            ))}
          </div>
        </SectionCard>



        {/* Proposal Information */}
        <SectionCard>
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Proposal Information</h3>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
              <span className="text-sm text-gray-400 shrink-0">Company</span>
              <span className="text-sm font-medium text-gray-700 sm:text-right break-words">{proposal.company}</span>
            </div>
            {validUntil && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <span className="text-sm text-gray-400 shrink-0">Valid Until</span>
                <span className="text-sm font-medium text-gray-700 sm:text-right break-words">{validUntil}</span>
              </div>
            )}
            {proposal.createdBy && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <span className="text-sm text-gray-400 shrink-0">Created By</span>
                <span className="text-sm font-medium text-gray-700 sm:text-right break-words">{proposal.createdBy}</span>
              </div>
            )}
            {proposal.documentUrl && (
              <div className="col-span-2">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Attached Document</h3>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            Proposal Document
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {resolveDocumentName(proposal.documentUrl, "document.pdf")}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                      <a 
                        href={getDocumentPublicUrl(proposal.documentUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors whitespace-nowrap"
                      >
                        <ExternalLink size={12} />
                        View
                      </a>
                      <a 
                        href={getDocumentPublicUrl(proposal.documentUrl)}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors whitespace-nowrap"
                      >
                        <Download size={12} />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      {proposal.description && (
        <SectionCard>
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Description</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{proposal.description}</p>
        </SectionCard>
      )}

      {proposal.services && proposal.services.length > 0 && (
        <SectionCard>
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Services Offered</h3>
          <div className="flex flex-wrap gap-2">
            {proposal.services.map((service, index) => (
              <span key={index} className="inline-flex px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                {service}
              </span>
            ))}
          </div>
        </SectionCard>
      )}

      {proposal.targetEntity && (
        <SectionCard>
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Target Entity Details</h3>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
              <span className="text-sm text-gray-400 shrink-0">Type</span>
              <span className="text-sm font-medium text-gray-700 sm:text-right break-words">{proposal.targetEntity.type}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
              <span className="text-sm text-gray-400 shrink-0">Company</span>
              <span className="text-sm font-medium text-gray-700 sm:text-right break-words">{proposal.targetEntity.company}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
              <span className="text-sm text-gray-400 shrink-0">Contact</span>
              <span className="text-sm font-medium text-gray-700 sm:text-right break-words">{proposal.targetEntity.contact}</span>
            </div>
            {proposal.targetEntity.email && proposal.targetEntity.email !== 'N/A' && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <span className="text-sm text-gray-400 shrink-0">Email</span>
                <span className="text-sm font-medium text-gray-700 sm:text-right break-words">{proposal.targetEntity.email}</span>
              </div>
            )}
            {proposal.targetEntity.phone && proposal.targetEntity.phone !== 'N/A' && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <span className="text-sm text-gray-400 shrink-0">Phone</span>
                <span className="text-sm font-medium text-gray-700 sm:text-right break-words">{proposal.targetEntity.phone}</span>
              </div>
            )}
            {proposal.targetEntity.address && proposal.targetEntity.address !== 'N/A' && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <span className="text-sm text-gray-400 shrink-0">Address</span>
                <span className="text-sm font-medium text-gray-700 sm:text-right break-words">{proposal.targetEntity.address}</span>
              </div>
            )}
            {proposal.targetEntity.city && proposal.targetEntity.city !== 'N/A' && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <span className="text-sm text-gray-400 shrink-0">City</span>
                <span className="text-sm font-medium text-gray-700 sm:text-right break-words">{proposal.targetEntity.city}</span>
              </div>
            )}
            {proposal.targetEntity.industry && proposal.targetEntity.industry !== 'N/A' && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <span className="text-sm text-gray-400 shrink-0">Industry</span>
                <span className="text-sm font-medium text-gray-700 sm:text-right break-words">{proposal.targetEntity.industry}</span>
              </div>
            )}
            {proposal.targetEntity.type === 'Client' && proposal.targetEntity.clientSince && proposal.targetEntity.clientSince !== 'N/A' && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <span className="text-sm text-gray-400 shrink-0">Client Since</span>
                <span className="text-sm font-medium text-gray-700 sm:text-right break-words">{proposal.targetEntity.clientSince}</span>
              </div>
            )}
            {proposal.targetEntity.type === 'Lead' && proposal.targetEntity.position && proposal.targetEntity.position !== 'N/A' && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <span className="text-sm text-gray-400 shrink-0">Position</span>
                <span className="text-sm font-medium text-gray-700 sm:text-right break-words">{proposal.targetEntity.position}</span>
              </div>
            )}
            {proposal.targetEntity.type === 'Lead' && proposal.targetEntity.lastContactDate && proposal.targetEntity.lastContactDate !== 'Never' && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                <span className="text-sm text-gray-400 shrink-0">Last Contact</span>
                <span className="text-sm font-medium text-gray-700 sm:text-right break-words">{proposal.targetEntity.lastContactDate}</span>
              </div>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );
}

