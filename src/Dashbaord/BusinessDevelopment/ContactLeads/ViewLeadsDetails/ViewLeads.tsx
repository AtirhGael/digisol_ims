import { useEffect, useState } from "react";
import { Button } from "../../../../components/ui/button";
import { FaArrowLeft } from "react-icons/fa";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import Overview from "./tabs/Overview";
import InteractionHistory from "./tabs/InteractionHistory";
import SkeletonLoading from "../../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import {
  ConvertToClientModal
} from "../components/ContactLeads.shared";
import type { Lead } from "../types";
import { contactLeadsApi, mapLeadDetailToFrontend } from "../ContactLeads.api";
import useFetchHook from "../../../../Hooks/UseFetchHook";

const ViewLeads = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lead, setLead] = useState<Lead | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { id: leadId } = useParams<{ id: string }>();
  const tabTitles = ["Overview", "Interactions History"];

  // Try to get lead from navigation state first (faster), then fetch from API
  const stateFromNav = (location.state as { lead?: Lead } | undefined)?.lead;

  const {
    data: leadResponse,
    isLoading: isLeadLoading,
    isError: isLeadError,
    error: leadError,
  } = useFetchHook<any>(
    leadId ? `contacts-leads/leads/${leadId}` : "",
    `contacts-lead-detail-${leadId || "none"}`,
    {
      enabled: Boolean(leadId),
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
    }
  );

  useEffect(() => {
    if (!leadId) {
      toast.error("No lead ID provided.");
      navigate("/dashboard/contactsleads", { state: { tab: "pipeline" }, replace: true });
      return;
    }

    setIsLoading(isLeadLoading);
  }, [leadId, isLeadLoading, navigate]);

  useEffect(() => {
    if (!leadResponse) return;

    try {
      const normalizedLead = mapLeadDetailToFrontend(
        leadResponse.data || leadResponse
      );
      setLead(normalizedLead);
      setIsLoading(false);
    } catch {
      if (stateFromNav) {
        setLead(stateFromNav);
        setIsLoading(false);
      }
    }
  }, [leadResponse, stateFromNav]);

  useEffect(() => {
    if (!isLeadError) return;

    if (stateFromNav) {
      setLead(stateFromNav);
      setIsLoading(false);
      return;
    }

    toast.error(leadError?.message || "Failed to load lead details.");
    navigate("/dashboard/contactsleads", { state: { tab: "pipeline" }, replace: true });
  }, [isLeadError, leadError, navigate, stateFromNav]);



  if (isLoading) {
    return <SkeletonLoading />;
  }

  if (!lead) {
    return <SkeletonLoading />;
  }

  const handleEdit = () => {
    navigate(`/dashboard/contactsleads/${lead.id}/edit`, { state: { fromLead: true, lead } });
  };

  const handleConvertToClientClick = () => {
    if (String(lead.status || "").toUpperCase() === "LOST") {
      toast.error("Lost leads cannot be converted to clients.");
      return;
    }
    setIsConvertOpen(true);
  };

  const handleConfirmConvert = async (payload: { contractId: string; paymentTerms: string; estimatedValue: number; currency: string }) => {
    setIsSubmitting(true);
    try {
      await contactLeadsApi.convertLeadToClient({
        lead_id: lead.id,
        contract_id: payload.contractId,
        estimated_value: payload.estimatedValue,
        currency: payload.currency,
      });

      setIsConvertOpen(false);
      toast.success("Lead converted to client successfully.");
      navigate("/dashboard/contactsleads", {
        state: {
          convertLead: lead,
          tab: "converted",
          contractId: payload.contractId,
          paymentTerms: payload.paymentTerms,
        },
      });
    } catch (error: any) {
      toast.error(error?.message || "Failed to convert lead to client.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <Overview lead={lead} onEdit={handleEdit} onConvert={handleConvertToClientClick} />;
      case 1:
        return <InteractionHistory onEdit={handleEdit} leadId={lead.id} leadData={lead} />;
      default:
        return <Overview lead={lead} onEdit={handleEdit} onConvert={handleConvertToClientClick} />;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {isConvertOpen && lead && (
        <ConvertToClientModal
          lead={lead}
          onConfirm={handleConfirmConvert}
          onCancel={() => setIsConvertOpen(false)}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-bold text-xl sm:text-2xl">Contacts & Leads Management</h1>
          <p className="text-gray-500 text-sm">
            View lead details of {lead.company || lead.contactName}
          </p>
        </div>
        <Button
          variant="outline"
          size="default"
          className="gap-2 w-full sm:w-auto"
          onClick={() => navigate("/dashboard/contactsleads", { state: { tab: "pipeline" } })}
        >
          <FaArrowLeft className="w-4 h-4" />
          Back to Leads
        </Button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 sm:gap-0 overflow-x-auto no-scrollbar border-b-2 border-gray-200 bg-white">
        {tabTitles.map((title, index) => (
          <button
            key={index}
            className={`px-4 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-medium whitespace-nowrap ${
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
      <div>{renderTabContent()}</div>
    </div>
  );
};

export default ViewLeads;
