import SkeletonLoading from "../../../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { Button } from "../../../../../components/ui/button";
import { FaEdit, FaCheckCircle } from "react-icons/fa";
import { MdEmail, MdPhone } from "react-icons/md";
import type { Lead } from "../../types";

type OverviewProps = {
  lead: Lead;
  isLoading?: boolean;
  onEdit?: () => void;
  onConvert?: () => void;
};

const Overview = ({ lead, isLoading = false, onEdit, onConvert }: OverviewProps) => {
  if (isLoading) {
    return <SkeletonLoading />;
  }

  // Status badge color mapping
  const statusColors: Record<string, string> = {
    QUALIFIED: "bg-purple-100 text-purple-700",
    CONTACTED: "bg-sky-100 text-sky-700",
    NEW: "bg-gray-100 text-gray-600",
    WON: "bg-green-100 text-green-700",
    LOST: "bg-red-100 text-red-700",
  };
  const statusBadge = statusColors[lead.status] || "bg-gray-100 text-gray-600";
  const canConvertToClient = String(lead.status || "").toUpperCase() !== "LOST";

  return (
    <div className="space-y-6">
      {/* Lead Info Card */}
      <div className="bg-white rounded-lg  p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                {lead.leadCode && (
                  <span className="text-gray-600 text-sm">{lead.leadCode}:</span>
                )}
                <span className="text-lg font-semibold">{lead.company || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-700">{lead.contactName || "N/A"}</span>
                {lead.position && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-700">{lead.position}</span>
                  </>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge}`}>
                  {lead.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="default"
              className="gap-2 w-full sm:w-auto"
              onClick={onEdit}
            >
              <FaEdit className="w-4 h-4" />
              Edit
            </Button>
            <div className="relative group w-full sm:w-auto">
              <Button
                variant="primary"
                size="default"
                className={`gap-2 w-full bg-primary hover:bg-primary sm:w-auto ${!canConvertToClient ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={canConvertToClient ? onConvert : undefined}
                disabled={!canConvertToClient}
              >
                <FaCheckCircle className="w-4 h-4" />
                Convert to Client
              </Button>
              {!canConvertToClient && (
                <span className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-56 text-center bg-gray-900 text-white text-xs rounded-md px-3 py-1.5  z-10">
                  Lead was lost and cannot be converted to a client
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Details */}
        <div className="bg-white rounded-lg  p-6">
          <h3 className="text-lg font-semibold mb-4">Contact Details</h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-gray-600">Primary Contact</span>
              <span className="text-gray-900 font-medium">{lead.contactName || "N/A"}</span>
            </div>
            {lead.position && (
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-gray-600">Role</span>
                <span className="text-gray-900 font-medium">{lead.position}</span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="text-gray-600">Email</span>
              {lead.email ? (
                <a
                  href={`mailto:${lead.email}`}
                  className="text-blue-600 hover:underline flex items-center gap-2 break-all"
                >
                  <MdEmail className="w-4 h-4" />
                  {lead.email}
                </a>
              ) : (
                <span className="text-gray-400">N/A</span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
              <span className="text-gray-600">Phone</span>
              {lead.phone ? (
                <a
                  href={`tel:${lead.phone}`}
                  className="text-blue-600 hover:underline flex items-center gap-2"
                >
                  <MdPhone className="w-4 h-4" />
                  {lead.phone}
                </a>
              ) : (
                <span className="text-gray-400">N/A</span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-gray-600">Industry</span>
              <span className="text-gray-900 font-medium">{lead.industry || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* General Details */}
        <div className="bg-white rounded-lg  p-6">
          <h3 className="text-lg font-semibold mb-4">General Details</h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-gray-600">Assigned To</span>
              <span className="text-gray-900 font-medium">{lead.assignedTo || "Unassigned"}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-gray-600">Created At</span>
              <span className="text-gray-900 font-medium">{lead.createdAt || "N/A"}</span>
            </div>
            {lead.lastContactDate && (
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                <span className="text-gray-600">Last Contact</span>
                <span className="text-gray-900 font-medium">{lead.lastContactDate}</span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-gray-600">Next Follow-up</span>
              <span className="text-gray-900 font-medium">{lead.nextFollowUp || "TBD"}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-gray-600">Est. Value</span>
              <span className="text-gray-900 font-medium">{lead.estimatedValue || "0 XAF"}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-gray-600">Source Type</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {lead.sourceType || "Unknown"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Needs Description (if available) */}
      {lead.needsDescription && (
        <div className="bg-white rounded-lg  p-6">
          <h3 className="text-lg font-semibold mb-4">Needs Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{lead.needsDescription}</p>
        </div>
      )}

      {/* Follow-up Notes (if available) */}
      {lead.followUpNotes && (
        <div className="bg-white rounded-lg  p-6">
          <h3 className="text-lg font-semibold mb-4">Follow-up Notes</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{lead.followUpNotes}</p>
        </div>
      )}
    </div>
  );
};

export default Overview;

