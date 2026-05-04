import SkeletonLoading from "../../../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { Button } from "../../../../../components/ui/button";
import { FaEdit, FaPhone, FaCalendar, FaUsers, FaMapMarkerAlt, FaEnvelope, FaDesktop } from "react-icons/fa";
import { MdPhone } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { type Interaction } from "../../../Clients/interactionsApi";
import { toast } from "sonner";
import useFetchHook from "../../../../../Hooks/UseFetchHook";

type InteractionHistoryProps = {
  isLoading?: boolean;
  onEdit?: () => void;
  leadId?: string;
  leadData?: {
    id?: string;
    leadCode?: string;
    company?: string;
    contactName?: string;
    position?: string;
    status?: string;
    assignedTo?: string;
    assignedToId?: string;
    createdAt?: string;
    nextFollowUp?: string;
    estimatedValue?: string;
    sourceType?: string;
    [key: string]: any;
  };
};

const getInteractionIcon = (type: string) => {
  switch (type?.toUpperCase()) {
    case 'MEETING':
    case 'WORKSHOP':
      return <FaUsers className="text-white" size={14} />
    case 'CALL':
    case 'VIDEO_CALL':
      return type?.toUpperCase() === 'VIDEO_CALL' ? <FaDesktop className="text-white" size={14} /> : <FaPhone className="text-white" size={14} />
    case 'EMAIL':
      return <FaEnvelope className="text-white" size={14} />
    case 'SITE_VISIT':
      return <FaMapMarkerAlt className="text-white" size={14} />
    case 'DEMO':
      return <FaDesktop className="text-white" size={14} />
    case 'FOLLOWUP':
      return <FaCalendar className="text-white" size={14} />
    default: return <FaUsers className="text-white" size={14} />
  }
}

const getInteractionColor = (type: string) => {
  switch (type?.toUpperCase()) {
    case 'MEETING':
    case 'WORKSHOP':
      return 'bg-blue-500'
    case 'CALL':
    case 'VIDEO_CALL':
      return 'bg-green-500'
    case 'EMAIL':
      return 'bg-purple-500'
    case 'DEMO':
      return 'bg-orange-500'
    case 'SITE_VISIT':
      return 'bg-red-500'
    case 'FOLLOWUP':
      return 'bg-teal-500'
    default: return 'bg-indigo-600'
  }
}

const getInteractionTypeLabel = (type: string) => {
  switch (type?.toUpperCase()) {
    case 'MEETING': return 'Meeting'
    case 'WORKSHOP': return 'Workshop'
    case 'CALL': return 'Phone Call'
    case 'VIDEO_CALL': return 'Video Call'
    case 'EMAIL': return 'Email'
    case 'DEMO': return 'Demo'
    case 'SITE_VISIT': return 'Site Visit'
    case 'FOLLOWUP': return 'Follow-up'
    default: return type || 'Interaction'
  }
}

const InteractionHistory = ({ isLoading: propLoading = false, onEdit, leadId, leadData }: InteractionHistoryProps) => {
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate();

  const {
    data: interactionsResponse,
    isLoading,
    isError,
    error: interactionsError,
    refetch: refetchInteractions,
  } = useFetchHook<any>(
    leadId ? `client-management/leads/${leadId}/interactions` : "",
    `lead-interactions-${leadId || "none"}`,
    {
      enabled: Boolean(leadId),
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );

  useEffect(() => {
    if (!interactionsResponse?.success || !Array.isArray(interactionsResponse.data)) return;
    setInteractions(interactionsResponse.data);
    setError(null);
  }, [interactionsResponse]);

  useEffect(() => {
    if (!isError) return;
    const message =
      interactionsError?.response?.data?.message ||
      interactionsError?.message ||
      "Failed to load interactions";
    toast.error(`Failed to load interactions: ${message}`);
    setError(message);
  }, [isError, interactionsError]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '-'
    if (minutes < 60) return `${minutes} minutes`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hour${hours > 1 ? 's' : ''}`
  }

  if (isLoading || propLoading) {
    return <SkeletonLoading />;
  }

  const lastInteraction = interactions.length > 0 ? interactions[0] : null

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg  p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm">{leadData?.leadCode || 'LEAD'}:</span>
                <span className="text-lg font-semibold">{leadData?.company || 'Unknown Company'}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-gray-700">{leadData?.contactName || '-'}</span>
                {leadData?.contactName && <span className="text-gray-400">•</span>}
                <span className="text-gray-700">{leadData?.position || '-'}</span>
                {leadData?.status && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    leadData.status === 'QUALIFIED' ? 'bg-purple-100 text-purple-700' :
                    leadData.status === 'NEW' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {leadData.status}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm" className="gap-2 w-full sm:w-auto" onClick={onEdit}>
              <FaEdit className="w-3.5 h-3.5" />
              Edit
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="gap-2 bg-primary hover:bg-primary w-full sm:w-auto"
              onClick={() => navigate("/dashboard/recordnewinteraction", { state: { leadId, leadData } })}
            >
              <MdPhone className="w-3.5 h-3.5" />
              Record New Interaction
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg  p-6">
          <h3 className="text-lg font-semibold mb-6">Interaction History</h3>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
              <button onClick={() => refetchInteractions()} className="text-sm text-red-600 underline mt-1">
                Retry
              </button>
            </div>
          )}

          {interactions.length > 0 ? (
            <div className="space-y-6">
              {interactions.map((interaction) => (
                <div key={interaction.interaction_id} className="flex gap-4">
                  <div className="shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getInteractionColor(interaction.interaction_type)}`}>
                      {getInteractionIcon(interaction.interaction_type)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                      <h4 className="font-semibold text-gray-900">{getInteractionTypeLabel(interaction.interaction_type)}</h4>
                      <span className="text-sm text-gray-500">
                        {formatDate(interaction.interaction_date)} at {formatTime(interaction.interaction_date)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Duration: {formatDuration(interaction.duration_minutes)}</p>
                    {interaction.summary && (
                      <p className="text-sm text-gray-900 mb-3">{interaction.summary}</p>
                    )}
                    {interaction.next_steps && interaction.next_steps.length > 0 && (
                      <div className="bg-gray-100 p-3 rounded-md mb-2">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Next Steps:</span> {' '}
                          {interaction.next_steps.map((step: any, idx: number) => (
                            <span key={idx}>{step.plan_name}{idx < interaction.next_steps.length - 1 ? ', ' : ''}</span>
                          ))}
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">Recorded by {interaction.recorded_by_name || '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No interactions recorded for this lead.</p>
          )}
        </div>

        <div className="bg-white rounded-lg  p-6">
          <h3 className="text-lg font-semibold mb-4">General Details</h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-gray-600">Assigned To</span>
              <span className="text-gray-900 font-medium">{leadData?.assignedTo || '-'}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-gray-600">Created At</span>
              <span className="text-gray-900 font-medium">
                {leadData?.createdAt ? formatDate(leadData.createdAt) : '-'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-gray-600">Last Contact</span>
              <span className="text-gray-900 font-medium">
                {lastInteraction ? formatDate(lastInteraction.interaction_date) : '-'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-gray-600">Next Follow-up</span>
              <span className="text-gray-900 font-medium">
                {leadData?.nextFollowUp ? formatDate(leadData.nextFollowUp) : '-'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-gray-600">Est. Value</span>
              <span className="text-gray-900 font-medium">
                {leadData?.estimatedValue ? `${Number(leadData.estimatedValue).toLocaleString()} XAF` : '-'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-gray-600">Source Type</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {leadData?.sourceType || 'Prospection'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-gray-600">Total Interactions</span>
              <span className="text-gray-900 font-medium">{interactions.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractionHistory;

