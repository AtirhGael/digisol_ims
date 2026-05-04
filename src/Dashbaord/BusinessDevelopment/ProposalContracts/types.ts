export type ProposalStatus = "PENDING" | "ACCEPTED" | "REJECTED";
export type View = "list" | "new" | "detail" | "edit" | "proforma-new" | "contract-new";

export type ContractStatus = "Active" | "Pending" | "Draft";

export interface ContractRow {
  id: string;
  title: string;
  code: string;
  client: string;
  value: string;
  billing: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  iconClass: string;
}

export interface Proposal {
  id: number;
  proposal_number?: string;
  title: string;
  company: string;
  status: ProposalStatus;
  dateAdded: string;
  description?: string;
  validUntil?: string;
  services?: string[];
  sentDate?: string;
  decisionDate?: string;
  documentUrl?: string;
  createdBy?: string;
  clientId?: string;
  leadId?: string;
  targetEntity?: {
    type: 'Client' | 'Lead' | 'Unknown';
    company: string;
    contact: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    industry?: string;
    status?: string;
    // Client-specific fields
    clientSince?: string;
    // Lead-specific fields  
    position?: string;
    lastContactDate?: string;
  };
  contactBreakdown?: { normal: number; potential: number; client: number };
}
