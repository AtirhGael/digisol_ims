import { useMemo, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../components/other/Card";
import { AiFillProject } from "react-icons/ai";
import { ProspectActivity } from "@/components/other/ProspectActivity";
import { FaPersonCircleCheck } from "react-icons/fa6";
import { FaPersonCircleExclamation } from "react-icons/fa6";
import { IoIosDocument } from "react-icons/io";
import { ProgressBar } from "../../../components/other/ProgressBar";
import ReusableTable from "../../../components/other/ReusableTable/ReusableTable";
import useFetchHook from "../../../Hooks/UseFetchHook";
import { Loader } from "../../../components/other/Loader/Loader";
import { Error } from "../../../components/other/Error/Error";
import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { formatDateWithoutTime } from "@/lib/utils";
import type { ApiResponse, ContactsLeadsListResponse } from "../ContactLeads/ContactLeads.api";
import { contactLeadsApi, mapContactsLeadsListToFrontend } from "../ContactLeads/ContactLeads.api";
import type { Contact } from "../ContactLeads/types";
import { createContactsColumns } from "../../../components/Columns/ContactLeadsColumns";
import { toast } from "sonner";
import { useContactLeadsStore } from "../ContactLeads/ContactLeads.store";

export const BusinessDevelopmentDashboard = () => {
  const navigate = useNavigate();
  // hook to fetch the data from the backend
  const { data, isLoading, isError, error } = useFetchHook(
    "business-development/overview",
    "business-dashboard",
  );
  const {
    data: contactsResponse,
    isLoading: isContactsLoading,
    isError: isContactsError,
    refetch: refetchContacts,
  } = useFetchHook<ApiResponse<ContactsLeadsListResponse>>(
    "contacts-leads?type=contacts&page=1&limit=200",
    "business-dashboard-contacts",
  );

  const { contacts: storeContacts, setContacts } = useContactLeadsStore();

  const apiContacts = useMemo<Contact[]>(() => {
    if (!contactsResponse) return [];
    return mapContactsLeadsListToFrontend(contactsResponse).contacts || [];
  }, [contactsResponse]);

  useEffect(() => {
    if (storeContacts.length > 0) return;
    if (apiContacts.length === 0) return;
    // Keep store aligned with the Contacts & Leads page dataset.
    setContacts(apiContacts);
  }, [apiContacts, setContacts, storeContacts.length]);

  const contacts = storeContacts.length > 0 ? storeContacts : apiContacts;

  const handleViewContact = useCallback((contact: Contact) => {
    navigate(`/dashboard/contactsleads/${contact.id}/view`);
  }, [navigate]);

  const handleEditContact = useCallback((contact: Contact) => {
    navigate(`/dashboard/contactsleads/${contact.id}/edit`);
  }, [navigate]);

  const handleDeleteContact = useCallback(async (id: string) => {
    try {
      await contactLeadsApi.deleteContact(id);
      toast.success("Contact deleted successfully");
      refetchContacts();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete contact");
    }
  }, [refetchContacts]);

  const contactColumns = useMemo(
    () =>
      createContactsColumns({
        onViewContact: handleViewContact,
        onEditContact: handleEditContact,
        onDeleteContact: handleDeleteContact,
      }),
    [handleViewContact, handleEditContact, handleDeleteContact],
  );

  const handleSeeMore = () => {
    navigate("/dashboard/prospectionplanning");
  };

  // loading and error state
  if (isLoading) {
    return <SkeletonLoading />;
  }

  if (isError) {
    return (
      <Error
        message={error?.message || "Failed to load data. Please try again."}
      />
    );
  }

  // Get the 5 most recent prospection activities
  const recentActivities =
    data?.data?.recentProspectionActivities?.slice(0, 5) || [];

  return (
    <>
      <div>
        {/* heading */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Business Development Overview
          </h1>
          <p className="text-gray-600 mt-2">
            Track prospections, leads, clients and performance metrics
          </p>
        </div>

        {/* dashboard cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
          <Card
            heading="Active Projects"
            amount={data?.data?.activeProjects?.count}
            icons={<AiFillProject className="text-white" />}
          />
          <Card
            heading="Active Clients"
            amount={data?.data?.activeClients?.count}
            iconBackgroundColor={"#008236"}
            textColor={"#008236"}
            icons={<FaPersonCircleCheck className="text-white" />}
          />
          <Card
            heading="Potential Clients"
            amount={data?.data?.potentialClients?.count}
            iconBackgroundColor="#FE9A0E"
            textColor="#FE9A0E"
            icons={<FaPersonCircleExclamation className="text-white" />}
          />
          <Card
            heading="Documents"
            amount={data?.data?.documentsCount}
            iconBackgroundColor="#37A5DC"
            textColor="#37A5DC"
            icons={<IoIosDocument className="text-white" />}
          />
        </div>

        {/* prospect section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="px-4 md:px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                Recent Prospection Activities
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Latest 5 prospection activities
              </p>
            </div>
            <div className="divide-y divide-gray-100">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity: any, key: number) => (
                  <ProspectActivity
                    key={key}
                    FBN={activity.FBN || activity.prospection_code}
                    location={`${activity.location_city || activity.location || ""}, ${activity.location_region || ""}`.trim()}
                    date={formatDateWithoutTime(
                      activity.date || activity.planned_start_date || "",
                    )}
                    status={activity.status}
                    amount={`${activity.budget_requested?.toLocaleString() || activity.amount?.toLocaleString() || 0} XAF`}
                  />
                ))
              ) : (
                <div className="px-4 md:px-6 py-8 text-center">
                  <p className="text-gray-500 text-sm">
                    No prospection activities found
                  </p>
                </div>
              )}
            </div>
            {/* see more button */}
            <div className="px-4 md:px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-center">
              <button
                onClick={handleSeeMore}
                className="text-primary font-medium hover:underline transition-all duration-200 py-2 px-4 rounded-md hover:bg-primary/10"
              >
                See More Prospections →
              </button>
            </div>
          </div>
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="px-4 md:px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                Lead Pipeline Overview
              </h2>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <ProgressBar
                percentage={data.data.leadPipeline.new}
                heading="New"
                subHeading={`${data.data.leadPipeline.new} Lead(s)`}
              />
              <ProgressBar
                percentage={data.data.leadPipeline.contacted}
                heading="Contacted"
                subHeading={`${data.data.leadPipeline.contacted} Lead(s)`}
              />
              <ProgressBar
                percentage={20}
                heading="Lead Conversion"
                subHeading="20% Completed"
              />
              <ProgressBar
                percentage={80}
                heading="Lead Conversion"
                subHeading="80% Completed"
              />
              <ProgressBar
                percentage={40}
                heading="Lead Conversion"
                subHeading="40% Completed"
              />
            </div>
          </div>
        </div>
        {/* contacts table section */}
        <div className="w-full min-h-fit mt-8">
          {isContactsLoading ? (
            <div className="flex justify-center items-center py-10 bg-white rounded-md">
              <Loader />
            </div>
          ) : isContactsError ? (
            <div className="bg-white rounded-md p-6 text-center text-sm text-gray-500">
              Unable to load contacts right now.
            </div>
          ) : (
            <ReusableTable
              heading="All Contacts"
              data={contacts}
              columns={contactColumns}
              searchKeys={["name", "company", "phone", "email", "source"]}
              itemsPerPage={8}
              showSearch={true}
              showFilter={true}
              filterKey="interestLevel"
              filterOptions={[
                { key: "High", value: "High", label: "High" },
                { key: "Medium", value: "Medium", label: "Medium" },
                { key: "Low", value: "Low", label: "Low" },
                { key: "Lead", value: "Lead", label: "Lead" },
              ]}
            />
          )}
        </div>
      </div>
    </>
  );
};
