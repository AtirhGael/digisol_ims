import { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { LuLoader } from "react-icons/lu";
import BasicInteractionDetails from "./tabs/BasicInteractionDetails";
import OtherInformation from "./tabs/OtherInformation";
import { createInteraction } from "../../Clients/interactionsApi";

const RecordNewTransaction = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const tabTitles = ["Basic Interaction Details", "Other Information"];

  // Get lead info from navigation state
  const navState = location.state as { leadId?: string; leadData?: any } | undefined;
  const leadId = navState?.leadId || "";
  const leadData = navState?.leadData;
  const companyName = leadData?.company || leadData?.company_name || "this lead";

  const [interaction, setInteraction] = useState({
    interaction_name: "MEETING",
    interaction_date: new Date().toISOString(),
    duration_minutes: 60,
    people_involved: [""],
    summary: "",
    next_steps: [
      {
        plan_name: "",
        date: "",
        status: "PENDING",
      },
    ],
  });

  const updateInteraction = (field: string, value: any) => {
    setInteraction((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <BasicInteractionDetails
            interaction={interaction}
            updateInteraction={updateInteraction}
          />
        );
      case 1:
        return (
          <OtherInformation
            interaction={interaction}
            updateInteraction={updateInteraction}
          />
        );
      default:
        return (
          <BasicInteractionDetails
            interaction={interaction}
            updateInteraction={updateInteraction}
          />
        );
    }
  };

  const handleNext = () => {
    if (activeTab < tabTitles.length - 1) {
      setActiveTab(activeTab + 1);
    }
  };

  const handlePrevious = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  const handleSave = async () => {
    // Validate required fields
    if (!interaction.interaction_name) {
      toast.error("Please select an interaction type.");
      return;
    }
    if (!interaction.interaction_date) {
      toast.error("Please provide an interaction date.");
      return;
    }
    if (!interaction.summary?.trim()) {
      toast.error("Please provide a discussion summary.");
      return;
    }
    if (!leadId) {
      toast.error("No lead ID found. Please go back and try again.");
      return;
    }

    // Clean up next_steps: only include items with plan_name
    const cleanedNextSteps = (interaction.next_steps || [])
      .filter((step) => step.plan_name?.trim())
      .map((step) => ({
        plan_name: step.plan_name,
        date: step.date || new Date().toISOString(),
        status: step.status || "PENDING",
      }));

    // Clean up people_involved
    const cleanedPeople = (interaction.people_involved || []).filter(
      (p) => p?.trim()
    );

    setIsSaving(true);
    try {
      await createInteraction("lead", leadId, {
        lead_id: leadId,
        interaction_name: interaction.interaction_name,
        interaction_date: interaction.interaction_date,
        duration_minutes: interaction.duration_minutes || undefined,
        people_involved: cleanedPeople.length > 0 ? cleanedPeople : undefined,
        summary: interaction.summary,
        next_steps: cleanedNextSteps.length > 0 ? cleanedNextSteps : undefined,
      });

      toast.success("Interaction recorded successfully!");
      navigate(-1);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Failed to record interaction.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl">
            Contacts & Leads Management
          </h1>
          <p className="text-gray-500 text-sm">
            Contacts & Leads / Record New Interaction
          </p>
        </div>
        <Button
          variant="outline"
          size="default"
          className="gap-2 w-full sm:w-auto"
          onClick={() => navigate(-1)}
          disabled={isSaving}
        >
          <FaArrowLeft className="w-4 h-4" />
          Back to Leads
        </Button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg  p-5 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-2">
          Record New Interaction
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Track all communications and activities with {companyName}
        </p>

        {/* Tabs Navigation */}
        <div className="flex gap-2 sm:gap-0 overflow-x-auto no-scrollbar border-b-2 border-gray-200 mb-6">
          {tabTitles.map((title, index) => (
            <button
              key={index}
              className={`px-4 sm:px-6 py-3 text-xs sm:text-sm font-medium whitespace-nowrap ${
                activeTab === index
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-500 hover:opacity-70"
              } duration-100 cursor-pointer`}
              onClick={() => setActiveTab(index)}
              disabled={isSaving}
            >
              {title}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mb-6">{renderTabContent()}</div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center pt-4 border-t">
          <Button
            variant="outline"
            size="default"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {activeTab > 0 && (
              <Button
                variant="outline"
                size="default"
                onClick={handlePrevious}
                className="w-full sm:w-auto"
                disabled={isSaving}
              >
                Previous
              </Button>
            )}
            {activeTab < tabTitles.length - 1 ? (
              <Button
                variant="primary"
                size="default"
                onClick={handleNext}
                className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                disabled={isSaving}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="primary"
                size="default"
                onClick={handleSave}
                className="bg-primary hover:bg-primary/90 w-full sm:w-auto gap-2 min-w-[120px]"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <LuLoader className="animate-spin text-sm" />
                    Saving…
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordNewTransaction;

