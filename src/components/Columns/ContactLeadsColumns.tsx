// Contact Leads: table column definitions and row action renderers.
import React from "react";
import { InterestBadge, RowActionsMenu } from "../../Dashbaord/BusinessDevelopment/ContactLeads/components/ContactLeads.shared";
import type {
  Contact,
  InterestLevel,
  Lead,
  LeadStatus,
} from "../../Dashbaord/BusinessDevelopment/ContactLeads/types";

// Badge colors for lead pipeline status.
const leadStatusConfig: Record<LeadStatus, { textClass: string; bgClass: string; dotClass: string }> = {
  QUALIFIED: { textClass: "text-blue-700", bgClass: "bg-blue-50", dotClass: "bg-blue-400" },
  CONTACTED: { textClass: "text-sky-700", bgClass: "bg-sky-50", dotClass: "bg-sky-400" },
  NEW: { textClass: "text-gray-500", bgClass: "bg-gray-100", dotClass: "bg-gray-400" },
  WON: { textClass: "text-green-700", bgClass: "bg-green-50", dotClass: "bg-green-500" },
  LOST: { textClass: "text-red-700", bgClass: "bg-red-50", dotClass: "bg-red-500" },
};

// Small pill used in the leads pipeline table.
function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const cfg = leadStatusConfig[status] || { textClass: "text-gray-500", bgClass: "bg-gray-100", dotClass: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 ${cfg.bgClass} ${cfg.textClass} text-[11px] font-bold px-2.5 py-0.5 rounded-full tracking-wider`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass} shrink-0`} />
      {status || "UNKNOWN"}
    </span>
  );
}

// Column factory for contacts list.
export const createContactsColumns = ({
  onViewContact,
  onEditContact,
  onDeleteContact,
}: {
  onViewContact: (contact: Contact) => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
}) => [
  {
    key: "firstName",
    header: "Name",
    render: (_value: string, row: Contact) => {
      const fullName = `${row.firstName || ""} ${row.lastName || ""}`.trim();
      const firstWord = fullName.split(/\s+/).filter(Boolean)[0] || fullName || row.firstName || "";
      return (
        <span className="block">
          <span className="block sm:hidden">{firstWord}</span>
          <span className="hidden sm:block truncate max-w-[130px] font-medium">{fullName || row.firstName}</span>
        </span>
      );
    },
  },
  {
    key: "company",
    header: "Company",
    render: (value: string) => {
      const firstWord = (value || "").split(/\s+/).filter(Boolean)[0] || value;
      return (
        <span className="block">
          <span className="block sm:hidden">{firstWord}</span>
          <span className="hidden sm:block truncate max-w-[150px]">{value}</span>
        </span>
      );
    },
  },
  {
    key: "phone",
    header: "Phone",
    render: (value: string) => {
      const digits = (value || "").replace(/\D/g, "");
      const short = digits.slice(0, 6);
      return (
        <span className="block">
          <span className="block sm:hidden">{short || value}</span>
          <span className="hidden sm:block truncate max-w-[130px]">{value}</span>
        </span>
      );
    },
  },
  {
    key: "email",
    header: "Email",
    render: (value: string) => {
      const firstWord = (value || "").split("@")[0].split(/\s+/).filter(Boolean)[0] || value;
      return (
        <span className="block">
          <span className="block sm:hidden">{firstWord}</span>
          <span className="hidden sm:block truncate max-w-[150px]">{value}</span>
        </span>
      );
    },
  },
  {
    key: "interestLevel",
    header: "Interest Level",
    truncate: false,
    render: (value: InterestLevel) => <InterestBadge level={value} small />,
  },
  {
    key: "source",
    header: "Source",
    render: (value: string) => {
      if (value.startsWith("PROSP:")) {
        const code = value.split(" - ")[0].replace("PROSP:", "");
        return (
          <span className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100 uppercase tracking-tighter" title={value.split(" - ")[1]}>
            {code}
          </span>
        );
      }
      return <span className="block truncate max-w-[120px] text-gray-500">{value}</span>;
    },
  },
  {
    key: "date",
    header: "Date",
    render: (value: string) => <span className="block truncate max-w-[110px]">{value}</span>,
  },
  {
    key: "id",
    header: "Actions",
    truncate: false,
    render: (_value: string, row: Contact) => (
      <RowActionsMenu
        onView={() => onViewContact(row)}
        onEdit={() => onEditContact(row)}
        onDelete={() => onDeleteContact(row.id)}
      />
    ),
  },
];

// Column factory for converted clients list.
export const createConvertedClientsColumns = ({
  onViewContact,
  onEditContact,
  onDeleteContact,
}: {
  onViewContact: (contact: Contact) => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (id: string) => void;
}) => [
  {
    key: "firstName",
    header: "Name",
    render: (_value: string, row: Contact) => {
      const fullName = `${row.firstName || ""} ${row.lastName || ""}`.trim();
      const firstWord = fullName.split(/\s+/).filter(Boolean)[0] || fullName || row.firstName || "";
      return (
        <span className="block">
          <span className="block sm:hidden">{firstWord}</span>
          <span className="hidden sm:block truncate max-w-[130px] font-medium">{fullName || row.firstName}</span>
        </span>
      );
    },
  },
  {
    key: "company",
    header: "Company",
    render: (value: string) => {
      const firstWord = (value || "").split(/\s+/).filter(Boolean)[0] || value;
      return (
        <span className="block">
          <span className="block sm:hidden">{firstWord}</span>
          <span className="hidden sm:block truncate max-w-[150px]">{value}</span>
        </span>
      );
    },
  },
  {
    key: "position",
    header: "Position",
    render: (value: string) => <span className="block truncate max-w-[150px]">{value}</span>,
  },
  {
    key: "phone",
    header: "Phone",
    render: (value: string) => {
      const digits = (value || "").replace(/\D/g, "");
      const short = digits.slice(0, 6);
      return (
        <span className="block">
          <span className="block sm:hidden">{short || value}</span>
          <span className="hidden sm:block truncate max-w-[130px]">{value}</span>
        </span>
      );
    },
  },
  {
    key: "email",
    header: "Email",
    render: (value: string) => {
      const firstWord = (value || "").split("@")[0].split(/\s+/).filter(Boolean)[0] || value;
      return (
        <span className="block">
          <span className="block sm:hidden">{firstWord}</span>
          <span className="hidden sm:block truncate max-w-[150px]">{value}</span>
        </span>
      );
    },
  },
  {
    key: "source",
    header: "Source",
    render: (value: string) => {
      if (value.startsWith("PROSP:")) {
        const code = value.split(" - ")[0].replace("PROSP:", "");
        return (
          <span className="inline-block bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-100 uppercase tracking-tighter" title={value.split(" - ")[1]}>
            {code}
          </span>
        );
      }
      return <span className="block truncate max-w-[120px] text-gray-500">{value}</span>;
    },
  },
  {
    key: "date",
    header: "Date Added",
    render: (value: string) => <span className="block truncate max-w-[110px]">{value}</span>,
  },
  {
    key: "id",
    header: "Actions",
    truncate: false,
    render: (_value: string, row: Contact) => (
      <RowActionsMenu
        onView={() => onViewContact(row)}
        onEdit={() => onEditContact(row)}
        onDelete={() => onDeleteContact(row.id)}
      />
    ),
  },
];

// Column factory for leads pipeline list.
export const createLeadsPipelineColumns = ({
  onViewLead,
  onEditLead,
  onDeleteLead,
}: {
  onViewLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
}) => {
  return [
  {
    key: "contactName",
    header: "Contact Name",
    render: (value: string) => <span className="block truncate max-w-[130px] font-medium">{value}</span>,
  },
  {
    key: "company",
    header: "Company",
    render: (value: string) => <span className="block truncate max-w-[130px]">{value}</span>,
  },
  {
    key: "industry",
    header: "Industry",
    render: (value: string) => <span className="block truncate max-w-[120px]">{value}</span>,
  },
  {
    key: "assignedTo",
    header: "Assigned To",
    render: (value: string) => <span className="block truncate max-w-[130px]">{value}</span>,
  },
  {
    key: "nextFollowUp",
    header: "Next Follow-up",
    render: (value: string) => <span className="block truncate max-w-[110px]">{value}</span>,
  },
  {
    key: "estimatedValue",
    header: "Estimated Value",
    render: (value: string) => <span className="block truncate max-w-[120px] font-medium">{value}</span>,
  },
  {
    key: "status",
    header: "Status",
    truncate: false,
    render: (value: LeadStatus) => <LeadStatusBadge status={value} />,
  },
  {
    key: "id",
    header: "Actions",
    truncate: false,
    render: (_value: string, row: Lead) => (
      <RowActionsMenu
        onView={() => onViewLead(row)}
        onEdit={() => onEditLead(row)}
        onDelete={() => onDeleteLead(row)}
      />
    ),
  },
];
};
