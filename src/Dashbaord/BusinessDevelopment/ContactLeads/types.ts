// Contact Leads: feature UI logic and helpers
export type InterestLevel =
  | "High"
  | "Medium"
  | "Low"
  | "Lead";
// Shared types for Contacts & Leads.
export type LeadStatus = "QUALIFIED" | "CONTACTED" | "NEW" | "WON" | "LOST";
export type Tab = "contacts" | "pipeline" | "converted";
export type FormStep = "personal" | "company" | "engagement";
export type View = "list" | "add" | "detail";

export interface Contact {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  secondaryPhone: string;
  email: string;
  interestLevel: InterestLevel;
  source: string;
  date: string;
  position: string;
  industrySector: string;
  address: string;
  location: string;
  collectedFrom: string;
  collectedDate: string;
  contactSource: string;
  firstContactDate: string;
  createdBy: string;
  createdAt: string;
  lastUpdated: string;
  notes: string;
  businessCardImage: string | null;
  prospectionId?: string;
  leadData?: Lead;
}

export interface Lead {
  id: string;
  contactName: string;
  company: string;
  industry: string;
  assignedTo: string;
  nextFollowUp: string;
  estimatedValue: string;
  status: LeadStatus;
  // Optional detail fields (populated when fetching by ID)
  leadCode?: string;
  email?: string;
  phone?: string;
  position?: string;
  address?: string;
  city?: string;
  country?: string;
  sourceType?: string;
  sourceDetails?: string;
  currency?: string;
  needsDescription?: string;
  followUpNotes?: string;
  decisionMakers?: string[];
  createdAt?: string;
  updatedAt?: string;
  lastContactDate?: string;
  convertedToClient?: boolean;
  assignedToId?: string;
}

export const INITIAL_CONTACTS: Contact[] = [
  {
    id: "1", name: "Samuel Njoya", firstName: "Samuel", lastName: "Njoya",
    company: "Tech Solution Ltd", phone: "+237 677 123 456", secondaryPhone: "+237 699 987 654",
    email: "samuel.njoya@techsolutions.cm", interestLevel: "Medium",
    source: "PROSP-2026-001", date: "28/01/2026", position: "Chief Technology Officer",
    industrySector: "Technology", address: "123 Boulevard de la Liberte, Bonanjo",
    location: "Douala, Cameroon", collectedFrom: "Douala Industrial Zone Prospection",
    collectedDate: "2/5/2026, 3:30:00 PM", contactSource: "Event",
    firstContactDate: "2/5/2026, 3:30:00 PM", createdBy: "Jean Kamga",
    createdAt: "2/5/2026, 3:35:00 PM", lastUpdated: "2/5/2026, 3:35:00 PM",
    notes: "Expressed strong interest in solar installation for new office building. Mentioned budget is approved for Q2 2026. Wants detailed proposal by end of February. Key decision maker along with CFO.",
    businessCardImage: null,
  },
  {
    id: "2", name: "Mballa Christine", firstName: "Mballa", lastName: "Christine",
    company: "Swift Logistic", phone: "+237680234567", secondaryPhone: "",
    email: "c.mballa@logistics.cm", interestLevel: "High",
    source: "PROSP-2026-001", date: "28/01/2026", position: "Operations Manager",
    industrySector: "Logistics", address: "45 Rue de la Joie, Akwa",
    location: "Douala, Cameroon", collectedFrom: "Douala Industrial Zone Prospection",
    collectedDate: "2/5/2026, 2:00:00 PM", contactSource: "Referral",
    firstContactDate: "2/5/2026, 2:00:00 PM", createdBy: "Jean Kamga",
    createdAt: "2/5/2026, 2:10:00 PM", lastUpdated: "2/5/2026, 2:10:00 PM",
    notes: "Interested in fleet management solutions.", businessCardImage: null,
  },
  {
    id: "3", name: "Pierre Mvondo", firstName: "Pierre", lastName: "Mvondo",
    company: "Industrial Metals", phone: "+237690345678", secondaryPhone: "",
    email: "p.mvondo@indmet.cm", interestLevel: "Low",
    source: "PROSP-2026-001", date: "28/01/2026", position: "Procurement Director",
    industrySector: "Manufacturing", address: "Zone Industrielle de Bassa",
    location: "Douala, Cameroon", collectedFrom: "Douala Industrial Zone Prospection",
    collectedDate: "2/5/2026, 1:00:00 PM", contactSource: "Cold Call",
    firstContactDate: "2/5/2026, 1:00:00 PM", createdBy: "Jean Kamga",
    createdAt: "2/5/2026, 1:05:00 PM", lastUpdated: "2/5/2026, 1:05:00 PM",
    notes: "Looking for industrial equipment suppliers.", businessCardImage: null,
  },
];


