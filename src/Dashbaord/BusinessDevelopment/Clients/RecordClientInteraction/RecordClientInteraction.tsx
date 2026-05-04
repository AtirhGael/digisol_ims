import { useMemo, useState } from "react";
import { Button } from "../../../../components/ui/button";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import BasicInteractionDetails from "../../ContactLeads/RecordNewTransaction/tabs/BasicInteractionDetails";
import OtherInformation from "../../ContactLeads/RecordNewTransaction/tabs/OtherInformation";
import { createInteraction } from "../interactionsApi";
import useFetchHook from "../../../../Hooks/UseFetchHook";
import SkeletonLoading from "@/components/other/Loader/SkeletonLoading/SkeletonLoading";
import { toast } from "sonner";

const RecordClientInteraction = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const tabTitles = ["Basic Interaction Details", "Other Information"];

  // Local interaction draft state (sent to the API on save).
  const [interaction, setInteraction] = useState({
    interaction_name: "MEETING",
    interaction_date: new Date().toISOString().slice(0, 19) + "Z",
    duration_minutes: 60,
    people_involved: [],
    summary: "",
    next_steps: [
      {
        plan_name: "",
        date: "",
        status: "PENDING",
      },
    ],
  });


  // Fetch client details to show name and build people options.
  const { data, isLoading } = useFetchHook(
    `/client-management/clients/${id}/details`,
    `client-${id}-details`,
    { enabled: Boolean(id) },
  );
  // Build selectable people list from client contacts.
  const peopleOptions = useMemo(() => {
    const list = new Set<string>();
    if (data?.data?.contact_person) list.add(data.data.contact_person);
    const contacts = data?.data?.primary_contacts || data?.data?.client_contacts || [];
    contacts.forEach((c: any) => {
      if (c?.full_name) list.add(c.full_name);
      if (c?.name) list.add(c.name);
    });
    return Array.from(list).filter(Boolean);
  }, [data?.data]);

  // Update the interaction state from child tabs.
  const updateInteraction = (field: string, value: any) => {
    setInteraction((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const renderTabContent = () => {
    if (activeTab === 0) {
      return (
        <BasicInteractionDetails
          interaction={interaction}
          updateInteraction={updateInteraction}
        />
      );
    }
    return (
      <OtherInformation
        interaction={interaction}
        updateInteraction={updateInteraction}
        peopleOptions={peopleOptions}
      />
    );
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

  // Validate + submit to backend.
  const handleSave = async () => {
    if (!id) {
      setError("Client ID is missing.");
      return;
    }
    if (!interaction.interaction_name || interaction.interaction_name.length < 3) {
      setError("Please select an interaction type.");
      return;
    }
    if (!interaction.interaction_date) {
      setError("Please select a valid date and time.");
      return;
    }
    const parsedInteractionDate = new Date(interaction.interaction_date);
    if (isNaN(parsedInteractionDate.getTime())) {
      setError("Please select a valid date and time.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const cleanedPeople = (interaction.people_involved || [])
        .map((name) => name?.trim())
        .filter((name) => name && name.length >= 2);
      const cleanedNextSteps = (interaction.next_steps || [])
        .filter(
          (step: any) =>
            step?.plan_name?.trim()?.length >= 3 && Boolean(step?.date),
        )
        .map((step: any) => ({
          ...step,
          date: new Date(step.date).toISOString(),
        }))
        .filter((step: any) => !isNaN(new Date(step.date).getTime()));
      const payload = {
        client_id: id,
        interaction_name: interaction.interaction_name,
        interaction_date: parsedInteractionDate.toISOString(),
        duration_minutes:
          interaction.duration_minutes && interaction.duration_minutes >= 1
            ? interaction.duration_minutes
            : undefined,
        people_involved: cleanedPeople.length ? cleanedPeople : undefined,
        summary: interaction.summary,
        next_steps: cleanedNextSteps.length ? cleanedNextSteps : undefined,
      };
      const response = await createInteraction("client", id, payload as any);
      if (response?.success) {
        toast.success("Interaction created successfully.");
        navigate(`/dashboard/clients/${id}?tab=interactions`, {
          state: { tab: "interactions", refreshInteractions: Date.now() },
        });
      } else {
        setError(response?.message || "Failed to record interaction.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to record interaction.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <SkeletonLoading />;
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl">
            Client Management
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <button
              onClick={() => navigate("/dashboard/clients")}
              className="hover:text-primary"
            >
              Clients
            </button>
            <span className="text-gray-300">/</span>
            <button
              onClick={() =>
                navigate(`/dashboard/clients/${id}/record-interaction`)
              }
              className="hover:text-primary"
            >
              Record New Interaction
            </button>
          </div>
        </div>
        <Button
          variant="outline"
          size="default"
          className="gap-2 w-full sm:w-auto"
          onClick={() =>
            navigate(`/dashboard/clients/${id}?tab=interactions`, {
              state: { tab: "interactions" },
            })
          }
        >
          <FaArrowLeft className="w-4 h-4" />
          Back to Client
        </Button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow p-5 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-2">
          Record New Interaction
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Track all communications and activities with{" "}
          {data?.data?.client_name || "this client"}
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
            >
              {title}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mb-6">{renderTabContent()}</div>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center pt-4 border-t">
          <Button
            variant="outline"
            size="default"
            onClick={() =>
              navigate(`/dashboard/clients/${id}?tab=interactions`, {
                state: { tab: "interactions" },
              })
            }
            className="w-full sm:w-auto"
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
              >
                Next
              </Button>
            ) : (
              <Button
                variant="primary"
                size="default"
                onClick={handleSave}
                className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordClientInteraction;
