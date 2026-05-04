// ─── Prospection Planning Mock Data ───────────────────────────────

export type ProspectionPlan = {
  id: number;
  uuid?: string; // Original UUID from backend for API calls
  code: string;
  title: string;
  status: "DRAFT" | "SUBMITTED" | "PENDING" | "ACTIVE" | "COMPLETED" | "REJECTED" | "CANCELLED";
  description: string;
  createdBy: string;
  plannedStart: string;
  plannedEnd: string;
  contactsCollected: number;
  expectedContacts: number;
  contactBreakdown: {
    normal: number;
    potential: number;
    client: number;
  };
  teamMembers: Array<{
    id: number;
    name: string;
    department: string;
    initials: string;
    color: string;
  }>;
  budgetApproved: number;
  city: string;
  region: string;
  venue: string;
  targetAudience: string;
  // Table columns
  budgetAllocated: string;
  budgetSpent: string;
}

export const PROSPECTION_PLANS: ProspectionPlan[] = [
  {
    id: 1,
    code: "PROSP-2026-001",
    title: "Q1 Tech Outreach",
    status: "ACTIVE",
    description: "Tech event for Q1 outreach.",
    createdBy: "Jean Kamga",
    plannedStart: "2/1/2026",
    plannedEnd: "2/5/2026",
    contactsCollected: 37,
    expectedContacts: 60,
    contactBreakdown: { normal: 15, potential: 18, client: 4 },
    teamMembers: [
      { id: 1, name: "John Smith", department: "Sales", initials: "JS", color: "bg-[#4a5fa5]" },
      { id: 2, name: "Nelson", department: "Marketing", initials: "N", color: "bg-[#3a7a6a]" },
    ],
    budgetApproved: 500000,
    city: "Yaounde",
    region: "Centre",
    venue: "Palais",
    targetAudience: "Tech",
    budgetAllocated: "500",
    budgetSpent: "450",
  },
  {
    id: 2,
    code: "PROSP-2026-002",
    title: "Enterprise Push",
    status: "COMPLETED",
    description: "Enterprise client acquisition drive.",
    createdBy: "Aminata Diallo",
    plannedStart: "2/10/2026",
    plannedEnd: "2/12/2026",
    contactsCollected: 0,
    expectedContacts: 40,
    contactBreakdown: { normal: 0, potential: 0, client: 0 },
    teamMembers: [
      { id: 3, name: "Fatima", department: "Sales", initials: "F", color: "bg-[#a55f4a]" },
    ],
    budgetApproved: 800000,
    city: "Douala",
    region: "Littoral",
    venue: "Hotel Akwa Palace",
    targetAudience: "Enterprise",
    budgetAllocated: "800",
    budgetSpent: "800",
  },
  {
    id: 3,
    code: "PROSP-2026-003",
    title: "SME Segment",
    status: "PENDING",
    description: "Targeting SMEs in the region.",
    createdBy: "Jean Kamga",
    plannedStart: "3/1/2026",
    plannedEnd: "3/3/2026",
    contactsCollected: 0,
    expectedContacts: 30,
    contactBreakdown: { normal: 0, potential: 0, client: 0 },
    teamMembers: [
      { id: 4, name: "Paul", department: "Operations", initials: "P", color: "bg-[#4aa55f]" },
    ],
    budgetApproved: 350000,
    city: "Bafoussam",
    region: "West",
    venue: "SME Center",
    targetAudience: "SMEs",
    budgetAllocated: "350",
    budgetSpent: "-",
  },
  {
    id: 4,
    code: "PROSP-2026-004",
    title: "Retail Drive",
    status: "PENDING",
    description: "Retail market expansion.",
    createdBy: "Aminata Diallo",
    plannedStart: "3/15/2026",
    plannedEnd: "3/17/2026",
    contactsCollected: 0,
    expectedContacts: 25,
    contactBreakdown: { normal: 0, potential: 0, client: 0 },
    teamMembers: [
      { id: 5, name: "Linda", department: "Marketing", initials: "L", color: "bg-[#a54a7a]" },
    ],
    budgetApproved: 420000,
    city: "Garoua",
    region: "North",
    venue: "Grand Market",
    targetAudience: "Retailers",
    budgetAllocated: "420",
    budgetSpent: "-",
  },
  {
    id: 5,
    code: "PROSP-2026-005",
    title: "Year-End Blitz",
    status: "PENDING",
    description: "End of year sales blitz.",
    createdBy: "Jean Kamga",
    plannedStart: "12/10/2025",
    plannedEnd: "12/15/2025",
    contactsCollected: 92,
    expectedContacts: 100,
    contactBreakdown: { normal: 30, potential: 50, client: 12 },
    teamMembers: [
      { id: 6, name: "John Smith", department: "Sales", initials: "JS", color: "bg-[#4a5fa5]" },
    ],
    budgetApproved: 600000,
    city: "Bamenda",
    region: "North West",
    venue: "City Hall",
    targetAudience: "General Public",
    budgetAllocated: "600",
    budgetSpent: "550",
  },
];
