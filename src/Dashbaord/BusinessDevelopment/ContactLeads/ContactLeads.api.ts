// Contact Leads: feature UI logic and helpers
import type { Contact, InterestLevel, Lead, LeadStatus } from "./types";
import { useUserStore } from "../../../Store/UserStore";

// Base API URL (fallback to local dev).
const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000/api";

// Backend list item shape for contacts/leads.
export type BackendContactLeadItem = {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  interestLevel?: InterestLevel;
  source?: string;
  date: string;
  type: "contact" | "lead";
  status?: LeadStatus;
  prospection_id?: string;
};

// Backend detail shape for a contact record.
export type BackendContactDetail = {
  contact_id: string;
  first_name: string;
  last_name: string;
  company_name?: string | null;
  email?: string | null;
  phone_primary?: string | null;
  phone_secondary?: string | null;
  interest_level?: string;
  contact_source?: string | null;
  contact_date?: string;
  position?: string | null;
  physical_address?: string | null;
  city?: string | null;
  country?: string | null;
  industry_sector?: string | null;
  notes?: string | null;
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  business_card_url?: string | null;
  business_card_picture_id?: string | null;
  prospection_id?: string | null;
  prospection_plans?: {
    prospection_code: string;
    title: string;
  } | null;
  users?: {
    first_name: string;
    last_name: string;
  } | null;
};

// Generic API response wrapper used by backend.
export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

// List response payload shape.
export type ContactsLeadsListResponse = {
  items: BackendContactLeadItem[];
};

// Payload for create/update endpoints.
type CreateOrUpdateContactPayload = {
  first_name: string;
  last_name: string;
  company_name?: string;
  position?: string;
  email?: string;
  phone_primary?: string;
  phone_secondary?: string;
  physical_address?: string;
  city?: string;
  country?: string;
  industry_sector?: string;
  interest_level: string;
  contact_source?: string;
  notes?: string;
  prospection_id?: string;
};

// Payload for POST /contacts-leads/contacts/convert-to-lead.
// Matches the backend convertContactToLeadSchema exactly.
export type ConvertContactToLeadPayload = {
  contact_id: string;         // UUID of the contact to convert
  assigned_to: string;        // UUID of the BDM employee assigned to the lead
  estimated_value?: number;   // Numeric value (not a string)
  currency?: string;          // 3-char ISO code, defaults to 'XAF'
  next_follow_up_date?: string; // ISO 8601 date string
  initial_status?: 'NEW' | 'CONTACTED' | 'QUALIFIED'; // defaults to 'NEW'
};

// Backend lead list item from GET /contacts-leads/leads.
export type BackendLeadListItem = {
  id: string;
  lead_code: string;
  contact_person: string;
  company_name: string;
  email?: string;
  phone?: string;
  industry_sector?: string;
  source_type: string;
  status: LeadStatus;
  estimated_value?: number;
  currency?: string;
  assigned_to: string;
  assigned_to_name: string;
  next_follow_up_date?: string;
  created_at: string;
};

// Backend lead detail from GET /contacts-leads/leads/:id.
export type BackendLeadDetail = {
  lead_id: string;
  lead_code: string;
  company_name: string;
  contact_person: string;
  position?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  industry_sector?: string;
  source_type: string;
  source_prospection_id?: string;
  source_details?: string;
  status: LeadStatus;
  assigned_to: string;
  assigned_at: string;
  last_contact_date?: string;
  next_follow_up_date?: string;
  follow_up_notes?: string;
  needs_description?: string;
  decision_makers?: string[];
  estimated_value?: number;
  currency?: string;
  converted_to_client: boolean;
  client_id?: string;
  converted_at?: string;
  loss_reason?: string;
  lost_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  assigned_to_user?: { first_name: string; last_name: string; email?: string };
  interactions?: any[];
  notes?: any[];
};

// Backend expects: "High", "Medium", "Low", "Lead".
const interestFromBackend = (value?: string): InterestLevel => {
  const normalized = (value || "").trim().toLowerCase();
  if (normalized === "high") return "High";
  if (normalized === "medium") return "Medium";
  if (normalized === "low") return "Low";
  if (normalized === "lead") return "Lead";
  return "Low";
};

// Map UI interest level to backend-accepted values.
const interestToBackend = (value: InterestLevel): string => {
  return value;
};

// Format helpers for dates.
const formatDate = (value?: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB");
};

const formatDateTime = (value?: string | null): string => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString();
};

// Split a full name into first and last name buckets.
const splitName = (fullName?: string): { firstName: string; lastName: string } => {
  const trimmed = (fullName || "").trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const [firstName, ...rest] = trimmed.split(" ");
  return { firstName: firstName || "", lastName: rest.join(" ") };
};

// Pull auth token from store/localStorage.
const getAuthHeaders = (): HeadersInit => {
  const token =
    useUserStore.getState().accessToken ||
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken");
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// JSON headers with auth.
const getJsonHeaders = (): HeadersInit => ({
  "Content-Type": "application/json",
  ...getAuthHeaders(),
});

// Generic request wrapper with JSON parsing + error handling.
const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...getJsonHeaders(),
      ...(init?.headers || {}),
    },
  });

  const text = await response.text();
  let body: any = {};
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = {};
    }
  }

  if (!response.ok) {
    const message = body?.error || body?.message || "Request failed";
    throw new Error(message);
  }

  return body as T;
};

// Resolve relative image paths to a full URL.
const resolveImageUrl = (value?: string | null): string | null => {
  if (!value) return null;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const base = API_BASE_URL.endsWith("/api")
    ? API_BASE_URL.slice(0, -4)
    : API_BASE_URL;
  return `${base}${value.startsWith("/") ? "" : "/"}${value}`;
};

// Convert a base64 data URL to a File for upload.
const dataUrlToFile = (dataUrl: string, filename: string): File => {
  const match = dataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!match) {
    throw new Error("Invalid image data");
  }
  const mime = match[1];
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], filename, { type: mime });
};

// Map list items to contact records.
export const mapListContactToFrontend = (item: BackendContactLeadItem): Contact => {
  const { firstName, lastName } = splitName(item.name);
  return {
    id: item.id,
    name: item.name || `${firstName} ${lastName}`.trim(),
    firstName,
    lastName,
    company: item.company || "",
    phone: item.phone || "",
    secondaryPhone: "",
    email: item.email || "",
    interestLevel: interestFromBackend(item.interestLevel),
    source: item.source || "",
    date: formatDate(item.date),
    position: "",
    industrySector: "",
    address: "",
    location: "",
    collectedFrom: item.source || "Manual Entry",
    prospectionId: item.prospection_id,
    collectedDate: formatDateTime(item.date),
    contactSource: item.source || "",
    firstContactDate: formatDateTime(item.date),
    createdBy: "System",
    createdAt: formatDateTime(item.date),
    lastUpdated: formatDateTime(item.date),
    notes: "",
    businessCardImage: null,
  };
};

// Map detailed contact payload into UI record.
export const mapDetailContactToFrontend = (contact: BackendContactDetail): Contact => {
  return {
    id: contact.contact_id,
    name: `${contact.first_name || ""} ${contact.last_name || ""}`.trim(),
    firstName: contact.first_name || "",
    lastName: contact.last_name || "",
    company: contact.company_name || "",
    phone: contact.phone_primary || "",
    secondaryPhone: contact.phone_secondary || "",
    email: contact.email || "",
    interestLevel: interestFromBackend(contact.interest_level),
    source: contact.contact_source || "",
    date: formatDate(contact.contact_date || contact.created_at),
    position: contact.position || "",
    industrySector: contact.industry_sector || "",
    address: contact.physical_address || "",
    location: `${contact.city || ""}${contact.city && contact.country ? ", " : ""}${contact.country || ""}`,
    collectedFrom: (contact.prospection_plans && contact.prospection_plans.title !== "General Contacts") 
      ? `PROSP:${contact.prospection_plans.prospection_code} - ${contact.prospection_plans.title}`
      : (contact.contact_source || "Manual Entry"),
    collectedDate: formatDateTime(contact.contact_date || contact.created_at),
    contactSource: contact.contact_source || "",
    firstContactDate: formatDateTime(contact.contact_date || contact.created_at),
    createdBy: contact.users
      ? `${contact.users.first_name} ${contact.users.last_name}`
      : (contact.created_by || "System"),
    createdAt: formatDateTime(contact.created_at),
    lastUpdated: formatDateTime(contact.updated_at || contact.created_at),
    notes: contact.notes || "",
    businessCardImage: resolveImageUrl(contact.business_card_url),
    prospectionId: (contact.prospection_plans && contact.prospection_plans.title !== "General Contacts") ? (contact.prospection_id || undefined) : undefined,
  };
};

// Map list items into lead records (from the combined endpoint — minimal data).
export const mapLeadToFrontend = (item: BackendContactLeadItem): Lead => {
  return {
    id: item.id,
    contactName: item.name || "",
    company: item.company || "",
    industry: "",
    assignedTo: "Unassigned",
    nextFollowUp: "TBD",
    estimatedValue: "0 XAF",
    status: item.status || "NEW",
  };
};

// Map a rich lead list item to the frontend Lead type (from dedicated /leads endpoint).
export const mapLeadListItemToFrontend = (item: BackendLeadListItem): Lead => {
  const formatEstValue = (val?: number, cur?: string): string => {
    if (val === undefined || val === null) return "0 XAF";
    return `${val.toLocaleString()} ${cur || "XAF"}`;
  };
  return {
    id: item.id,
    contactName: item.contact_person || "",
    company: item.company_name || "",
    industry: item.industry_sector || "",
    assignedTo: item.assigned_to_name || "Unassigned",
    assignedToId: item.assigned_to,
    nextFollowUp: formatDate(item.next_follow_up_date) || "TBD",
    estimatedValue: formatEstValue(item.estimated_value, item.currency),
    status: item.status || "NEW",
    leadCode: item.lead_code,
    email: item.email,
    phone: item.phone,
    sourceType: item.source_type,
    createdAt: formatDateTime(item.created_at),
    currency: item.currency,
  };
};

// Map full lead detail to the frontend Lead type.
export const mapLeadDetailToFrontend = (detail: BackendLeadDetail): Lead => {
  const formatEstValue = (val?: number, cur?: string): string => {
    if (val === undefined || val === null) return "0 XAF";
    return `${val.toLocaleString()} ${cur || "XAF"}`;
  };
  const assignedName = detail.assigned_to_user
    ? `${detail.assigned_to_user.first_name} ${detail.assigned_to_user.last_name}`.trim()
    : "Unassigned";
  return {
    id: detail.lead_id,
    contactName: detail.contact_person || "",
    company: detail.company_name || "",
    industry: detail.industry_sector || "",
    assignedTo: assignedName,
    assignedToId: detail.assigned_to,
    nextFollowUp: formatDate(detail.next_follow_up_date) || "TBD",
    estimatedValue: formatEstValue(detail.estimated_value, detail.currency),
    status: detail.status || "NEW",
    leadCode: detail.lead_code,
    email: detail.email,
    phone: detail.phone,
    position: detail.position,
    address: detail.address,
    city: detail.city,
    country: detail.country,
    sourceType: detail.source_type,
    sourceDetails: detail.source_details,
    currency: detail.currency,
    needsDescription: detail.needs_description,
    followUpNotes: detail.follow_up_notes,
    decisionMakers: detail.decision_makers,
    createdAt: formatDateTime(detail.created_at),
    updatedAt: formatDateTime(detail.updated_at),
    lastContactDate: formatDate(detail.last_contact_date),
    convertedToClient: detail.converted_to_client,
  };
};

// Convert UI contact to backend payload.
const toContactPayload = (contact: Contact): CreateOrUpdateContactPayload => ({
  first_name: contact.firstName,
  last_name: contact.lastName,
  company_name: contact.company || "",
  position: contact.position || "",
  email: contact.email || "",
  phone_primary: contact.phone || "",
  phone_secondary: contact.secondaryPhone || "",
  physical_address: contact.address || "",
  city: contact.location.split(",")[0]?.trim() || "",
  country: contact.location.split(",")[1]?.trim() || "",
  industry_sector: contact.industrySector || "",
  interest_level: interestToBackend(contact.interestLevel),
  contact_source: contact.contactSource || contact.source || "",
  notes: contact.notes || "",
  prospection_id: contact.prospectionId || undefined,
});

// Normalize list responses into contacts + leads.
export const mapContactsLeadsListToFrontend = (
  response: ApiResponse<ContactsLeadsListResponse>
): { contacts: Contact[]; leads: Lead[] } => {
  const root = response as any;
  const directPayload = root?.data || {};
  const payload =
    directPayload?.items ||
      directPayload?.contacts ||
      directPayload?.leads ||
      directPayload?.results
      ? directPayload
      : directPayload?.data || {};
  const asArray = (value: any): any[] => (Array.isArray(value) ? value : []);
  const normalizeType = (value?: string): string => (value || "").toString().trim().toLowerCase();
  const leadStatuses = new Set(["QUALIFIED", "CONTACTED", "NEW", "WON", "LOST"]);

  const itemCandidates = asArray(
    payload.items ?? payload.results ?? payload.rows ?? payload.list ?? payload.records
  );
  const contactCandidates = asArray(payload.contacts ?? payload.contactList);
  const leadCandidates = asArray(payload.leads ?? payload.leadList);

  const combinedContacts = contactCandidates.length
    ? contactCandidates
    : itemCandidates.filter((item) => {
      const itemType = normalizeType(item?.type ?? item?.itemType ?? item?.category);
      if (itemType === "contact" || itemType === "contacts") return true;
      if (itemType === "lead" || itemType === "leads") return false;
      return !leadStatuses.has((item?.status || "").toString().toUpperCase());
    });

  const combinedLeads = leadCandidates.length
    ? leadCandidates
    : itemCandidates.filter((item) => {
      const itemType = normalizeType(item?.type ?? item?.itemType ?? item?.category);
      if (itemType === "lead" || itemType === "leads") return true;
      if (itemType === "contact" || itemType === "contacts") return false;
      return leadStatuses.has((item?.status || "").toString().toUpperCase());
    });

  const contacts = combinedContacts.map((item) => {
    if (item?.contact_id || item?.first_name || item?.last_name) {
      return mapDetailContactToFrontend(item as BackendContactDetail);
    }
    return mapListContactToFrontend(item as BackendContactLeadItem);
  });

  const leads = combinedLeads.map((item) => mapLeadToFrontend(item as BackendContactLeadItem));

  return { contacts, leads };
};

// API surface for contacts/leads endpoints.
export const contactLeadsApi = {
  async getContact(contactId: string): Promise<Contact> {
    const response = await request<ApiResponse<BackendContactDetail>>(
      `/contacts-leads/contacts/${contactId}`
    );
    return mapDetailContactToFrontend(response.data);
  },

  async createContact(contact: Contact): Promise<Contact> {
    const response = await request<ApiResponse<BackendContactDetail>>("/contacts-leads/contacts", {
      method: "POST",
      body: JSON.stringify(toContactPayload(contact)),
    });
    return mapDetailContactToFrontend(response.data);
  },

  async updateContact(contact: Contact): Promise<Contact> {
    const response = await request<ApiResponse<BackendContactDetail>>(
      `/contacts-leads/contacts/${contact.id}`,
      {
        method: "PUT",
        body: JSON.stringify(toContactPayload(contact)),
      }
    );
    return mapDetailContactToFrontend(response.data);
  },

  async deleteContact(contactId: string): Promise<void> {
    await request(`/contacts-leads/contacts/${contactId}`, {
      method: "DELETE",
    });
  },

  async uploadContactBusinessCard(contactId: string, imageDataUrl: string): Promise<{ business_card_url: string }> {
    const file = dataUrlToFile(imageDataUrl, "business-card.jpg");
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error("Image is too large (max 10MB)");
    }
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(
      `${API_BASE_URL}/contacts-leads/contacts/${contactId}/business-card`,
      {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
        },
        body: formData,
      }
    );

    const text = await response.text();
    let body: any = {};
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = { raw: text };
      }
    }

    if (!response.ok) {
      const message =
        body?.error ||
        body?.message ||
        body?.raw ||
        response.statusText ||
        `Upload failed (${response.status})`;
      throw new Error(message);
    }

    const data = body?.data || {};
    return {
      business_card_url: resolveImageUrl(data.business_card_url) || "",
    };
  },

  resolveImageUrl,

  /**
   * Fetch active employees in the Business Development department.
   * Uses GET /users?department_id={id}&status=ACTIVE&limit=200
   * We first look up the BD department by name, then fetch its members.
   */
  async fetchBDEmployees(): Promise<{ id: string; name: string }[]> {
    try {
      // Step 1: get all departments to find the BD department_id.
      const deptRes = await request<ApiResponse<{ department_id: string; department_name: string; department_code: string }[]>>('/users/departments');
      const depts = (deptRes as any)?.data || [];
      const bdDept = (Array.isArray(depts) ? depts : []).find(
        (d: any) => /business.?dev/i.test(d.department_name || '') || /^BDM$/i.test(d.department_code || '')
      );

      if (!bdDept) {
        // Fallback: fetch all active employees if we can't identify the BD department.
        const fallbackRes = await request<{ success: boolean; data: any[] }>(
          '/employees?status=ACTIVE&page_size=200'
        );
        return ((fallbackRes as any)?.data || []).map((emp: any) => ({
          id: emp.employee_id,
          name: `${emp.first_name} ${emp.last_name}`.trim(),
        }));
      }

      // Step 2: fetch employees in that department.
      const empRes = await request<{ success: boolean; data: any[] }>(
        `/employees?department_id=${bdDept.department_id}&status=ACTIVE&page_size=200`
      );
      return ((empRes as any)?.data || []).map((emp: any) => ({
        id: emp.employee_id,
        name: `${emp.first_name} ${emp.last_name}`.trim(),
      }));
    } catch {
      return [];
    }
  },
  /**
   * Convert a contact to a lead.
   * Uses POST /contacts-leads/contacts/convert-to-lead
   */
  async convertContactToLead(payload: ConvertContactToLeadPayload): Promise<ApiResponse<any>> {
    return request<ApiResponse<any>>('/contacts-leads/contacts/convert-to-lead', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // ─── Lead CRUD ──────────────────────────────────────────────

  /**
   * Fetch all leads from the dedicated leads endpoint.
   * Returns rich data including assigned_to_name, estimated_value, etc.
   */
  async getLeads(): Promise<Lead[]> {
    const res = await request<ApiResponse<{ leads: BackendLeadListItem[] }>>(
      '/contacts-leads/leads?limit=200'
    );
    const items = (res as any)?.data?.leads || [];
    return items.map(mapLeadListItemToFrontend);
  },

  /**
   * Fetch a single lead by ID.
   */
  async getLead(leadId: string): Promise<Lead> {
    const res = await request<ApiResponse<BackendLeadDetail>>(
      `/contacts-leads/leads/${leadId}`
    );
    return mapLeadDetailToFrontend(res.data);
  },

  /**
   * Update a lead.
   */
  async updateLead(leadId: string, payload: Record<string, any>): Promise<Lead> {
    const res = await request<ApiResponse<any>>(
      `/contacts-leads/leads/${leadId}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
    // The update response returns the raw lead; map it if needed.
    return mapLeadDetailToFrontend(res.data);
  },

  /**
   * Delete a lead.
   */
  async deleteLead(leadId: string): Promise<void> {
    await request(`/contacts-leads/leads/${leadId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Convert a lead to a client.
   */
  async convertLeadToClient(payload: { lead_id: string; contract_id: string; estimated_value: number; currency?: string }): Promise<any> {
    const res = await request<ApiResponse<any>>(
      `/contacts-leads/leads/convert-to-client`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return res.data;
  },
};


