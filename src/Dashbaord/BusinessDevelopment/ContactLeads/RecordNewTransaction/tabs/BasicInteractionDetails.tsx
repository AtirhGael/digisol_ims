import { useState } from "react";
import { Input } from "../../../../../components/ui/input";
import SkeletonLoading from "../../../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import {
  FaPhone,
  FaEnvelope,
  FaUsers,
  FaVideo,
  FaMapMarkerAlt,
  FaCheckCircle,
} from "react-icons/fa";

type BasicInteractionDetailsProps = {
  isLoading?: boolean;
  interaction?: {
    interaction_name: string;
    interaction_date: string;
    duration_minutes: number;
    people_involved: string[];
    summary: string;
    next_steps?: any[];
  };
  updateInteraction?: (field: string, value: any) => void;
};

const BasicInteractionDetails = ({
  isLoading = false,
  interaction,
  updateInteraction,
}: BasicInteractionDetailsProps) => {
  // Extract date and time from ISO string
  const getDateFromISO = (isoString: string) => {
    if (!isoString) return "";
    return isoString.split("T")[0];
  };

  const getTimeFromISO = (isoString: string) => {
    if (!isoString) return "";
    return isoString.split("T")[1]?.substring(0, 5) || "";
  };

  const selectedType = (interaction?.interaction_name ?? "").toUpperCase();
  const discussionSummary = interaction?.summary || "";
  const interactionDate = getDateFromISO(interaction?.interaction_date || "");
  const interactionTime = getTimeFromISO(interaction?.interaction_date || "");
  const duration = interaction?.duration_minutes || 0;

  if (isLoading) {
    return <SkeletonLoading />;
  }

  const interactionTypes = [
    {
      id: "CALL",
      label: "Phone Call",
      description: "Telephone conversation",
      icon: FaPhone,
      color: "text-blue-500",
    },
    {
      id: "EMAIL",
      label: "Email",
      description: "Email correspondence",
      icon: FaEnvelope,
      color: "text-orange-500",
    },
    {
      id: "MEETING",
      label: "Meeting",
      description: "In-person or virtual meeting",
      icon: FaUsers,
      color: "text-purple-500",
    },
    {
      id: "DEMO",
      label: "Product Demo",
      description: "Product/service demonstration",
      icon: FaVideo,
      color: "text-green-500",
    },
    {
      id: "SITE_VISIT",
      label: "Site Visit",
      description: "Visit to client location",
      icon: FaMapMarkerAlt,
      color: "text-pink-500",
    },
    {
      id: "FOLLOWUP",
      label: "Follow-up",
      description: "Follow-up interaction",
      icon: FaCheckCircle,
      color: "text-teal-500",
    },
  ];

  const handleTypeChange = (type: string) => {
    updateInteraction?.("interaction_name", type);
  };

  const handleDateTimeChange = (date: string, time: string) => {
    if (date && time) {
      const isoString = `${date}T${time}:00Z`;
      updateInteraction?.("interaction_date", isoString);
    }
  };

  const handleSummaryChange = (summary: string) => {
    updateInteraction?.("summary", summary);
  };

  const handleDurationChange = (minutes: number) => {
    updateInteraction?.("duration_minutes", minutes);
  };

  return (
    <div className="space-y-6">
      {/* Interaction Type */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Interaction Type <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Select the type of interaction you had with the lead
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {interactionTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => handleTypeChange(type.id)}
                className={`p-4 border rounded-lg text-left transition-all ${
                  selectedType === type.id
                    ? "border-primary bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-1 ${type.color}`} />
                  <div>
                    <h4 className="font-medium text-gray-900">{type.label}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {type.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date, Time & Duration */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">
          Date, Time & Duration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              placeholder="Date"
              className="block w-full"
              value={interactionDate}
              onChange={(e) =>
                handleDateTimeChange(e.target.value, interactionTime)
              }
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Time <span className="text-red-500">*</span>
            </label>
            <Input
              type="time"
              placeholder="Time"
              className="block w-full"
              value={interactionTime}
              onChange={(e) =>
                handleDateTimeChange(interactionDate, e.target.value)
              }
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Duration(minutes) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              placeholder="e.g., 30"
              value={duration}
              onChange={(e) =>
                handleDurationChange(parseInt(e.target.value) || 0)
              }
            />
          </div>
        </div>
      </div>

      {/* Interaction Summary */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Interaction Summary
        </label>
        <label className="block text-sm text-gray-700 mb-2">
          Discussion Summary <span className="text-red-500">*</span>
        </label>
        <textarea
          value={discussionSummary}
          onChange={(e) => handleSummaryChange(e.target.value)}
          maxLength={2000}
          rows={4}
          placeholder="Provide a detailed summary of the interaction, key points discussed, and any important information..."
          className="w-full rounded-sm border border-gray-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary focus-visible:border-gray-900"
        />
        <p className="text-xs text-gray-500 mt-1 text-right">
          {discussionSummary.length}/2000 characters
        </p>
      </div>
    </div>
  );
};

export default BasicInteractionDetails;
