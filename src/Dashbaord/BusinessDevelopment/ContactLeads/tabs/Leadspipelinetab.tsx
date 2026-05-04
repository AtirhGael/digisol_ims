// Contact Leads: feature UI logic and helpers
import { LuClipboardList } from "react-icons/lu";
import { createLeadsPipelineColumns } from "../../../../components/Columns/ContactLeadsColumns";
import { Card } from "../../../../components/other/Card";
import ReusableTable from "../../../../components/other/ReusableTable/ReusableTable";
import { type Lead } from "../types";

export default function Leadspipelinetab({
  leads,
  onViewLead,
  onEditLead,
  onDeleteLead,
}: {
  leads: Lead[];
  onViewLead: (lead: Lead) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
}) {
  // Summary counts for pipeline status cards.
  const pipelineCounts = {
    QUALIFIED: leads.filter((lead) => lead.status === "QUALIFIED").length,
    CONTACTED: leads.filter((lead) => lead.status === "CONTACTED").length,
    NEW: leads.filter((lead) => lead.status === "NEW").length,
    WON: leads.filter((lead) => lead.status === "WON").length,
    LOST: leads.filter((lead) => lead.status === "LOST").length,
    UNKNOWN: leads.filter((lead) => !["QUALIFIED", "CONTACTED", "NEW", "WON", "LOST"].includes(lead.status as string)).length,
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
        {[
          { label: "QUALIFIED", count: pipelineCounts.QUALIFIED },
          { label: "CONTACTED", count: pipelineCounts.CONTACTED, textColor: "#b45309", iconBackgroundColor: "#f59e0b", cardBackgroundColor: "#fffbeb" },
          { label: "NEW", count: pipelineCounts.NEW, textColor: "#1d4ed8", iconBackgroundColor: "#3b82f6", cardBackgroundColor: "#eff6ff" },
          { label: "WON", count: pipelineCounts.WON, textColor: "#16a34a", iconBackgroundColor: "#16a34a", cardBackgroundColor: "#dcfce7" },
          { label: "LOST", count: pipelineCounts.LOST, textColor: "#dc2626", iconBackgroundColor: "#dc2626", cardBackgroundColor: "#fee2e2" },
        ].map((item) => (
          <div key={item.label} className="transition-all duration-200 hover:-translate-y-0.5  rounded-3xl">
            <Card
              heading={item.label}
              amount={String(item.count)}
              icons={<LuClipboardList className="text-white text-base" />}
              textColor={item.textColor}
              iconBackgroundColor={item.iconBackgroundColor}
              cardBackgroundColor={item.cardBackgroundColor}
            />
          </div>
        ))}
      </div>

      <ReusableTable
        heading="Leads Pipeline"
        data={leads}
        columns={createLeadsPipelineColumns({
          onViewLead,
          onEditLead,
          onDeleteLead,
        })}
        searchKeys={["contactName", "company", "industry", "assignedTo", "nextFollowUp", "estimatedValue"]}
        filterKey="status"
        filterOptions={[
          { key: "status", value: "QUALIFIED", label: "Qualified" },
          { key: "status", value: "CONTACTED", label: "Contacted" },
          { key: "status", value: "NEW", label: "New" },
          { key: "status", value: "WON", label: "Won" },
          { key: "status", value: "LOST", label: "Lost" },
        ]}
      />
    </div>
  );
}



