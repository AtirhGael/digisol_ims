import { useEffect, useRef, useState } from "react";
import { FaBuildingColumns } from "react-icons/fa6";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { ClientContracts } from "./ClientContracts";
import { ClientFinancial } from "./ClientFinancial";
import { ClientInteractions } from "./ClientInteractions";
import { ClientOverview } from "./ClientOverview";
import { ClientDocuments } from "./ClientDocuments";
import useFetchHook from "../../../Hooks/UseFetchHook";
import { useLocation, useParams } from "react-router-dom";
import { Error } from "../../../components/other/Error/Error";
import { useNavigate } from "react-router-dom";
import SkeletonLoading from "@/components/other/Loader/SkeletonLoading/SkeletonLoading";
import useUpdate from "../../../Hooks/UseUpdateHook";

export const ClientDetailsPage = () => {
  // Get user id from URL params.
  const { id } = useParams();
  // Active tab + which tabs have been opened at least once.
  const [activeTab, setActiveTab] = useState("overview");
  const [visitedTabs, setVisitedTabs] = useState<Record<string, boolean>>({
    overview: true,
  });
  // Keys force a remount when a tab is stale.
  const [tabKeys, setTabKeys] = useState<Record<string, number>>({
    overview: 0,
    contracts: 0,
    interactions: 0,
    documents: 0,
    financial: 0,
  });
  // Track last active time per tab for refresh logic.
  const [lastActiveAt, setLastActiveAt] = useState<Record<string, number>>({
    overview: Date.now(),
  });
  const [interactionsRefreshKey, setInteractionsRefreshKey] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  
  // Modal states for editing and contracts.
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    client_name: "",
    client_type: "",
    client_code: "",
    industry: "",
    zone: "",
    account_manager: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    client_since: "",
    onboarding_date: "",
    payment_terms: "",
    status: "",
  });
  // Update hook for persisting client edits.
  const { updateData, loading: isUpdating } = useUpdate<any>();
  // Reload a tab if you return after this threshold.
  const TAB_REFRESH_MS = 30_000;
  
  // fetching hook
  // Fetch client details for display and edit prefill.
  const { data, error, isError, isLoading, refetch } = useFetchHook(
    `/client-management/clients/${id}/details`,
    `client-${id}-details`,
  );

  // Allow deep-linking to a specific tab via query/state.
  useEffect(() => {
    const tabFromState = (location.state as any)?.tab;
    const refreshFromState = (location.state as any)?.refreshInteractions;
    const tabFromQuery = new URLSearchParams(location.search).get("tab");
    if (tabFromState) setActiveTab(tabFromState);
    if (tabFromQuery) setActiveTab(tabFromQuery);
    if (refreshFromState) setInteractionsRefreshKey(refreshFromState);
  }, [location.state, location.search]);

  // Mark the active tab as visited so it stays mounted after first open.
  useEffect(() => {
    setVisitedTabs((prev) => ({ ...prev, [activeTab]: true }));
    setLastActiveAt((prev) => ({ ...prev, [activeTab]: Date.now() }));
  }, [activeTab]);

  // Prefill edit form from fetched client data when modal opens.
  useEffect(() => {
    if (!isEditModalOpen) return;
    const client = data?.data;
    setFormData({
      client_name: client?.client_name || "",
      client_type: client?.client_type || "",
      client_code: client?.client_code || "",
      industry: client?.industry || "",
      zone: client?.zone || "",
      account_manager: client?.account_manager || "",
      contact_person: client?.contact_person || "",
      email: client?.email || "",
      phone: client?.phone || "",
      address: client?.address || "",
      city: client?.city || "",
      country: client?.country || "",
      client_since: client?.client_since ? client.client_since.split("T")[0] : "",
      onboarding_date: client?.onboarding_date ? client.onboarding_date.split("T")[0] : "",
      payment_terms: client?.payment_terms || "",
      status: client?.status || "",
    });
  }, [isEditModalOpen, data?.data]);

  // Switch tabs and refresh stale content when needed.
  const handleTabChange = (tab: string) => {
    const now = Date.now();
    const lastSeen = lastActiveAt[tab];
    if (lastSeen && now - lastSeen >= TAB_REFRESH_MS) {
      setTabKeys((prev) => ({ ...prev, [tab]: (prev[tab] || 0) + 1 }));
    }
    setActiveTab(tab);
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Persist edits and refresh the view after save.
  const handleUpdateClient = async () => {
    if (!id) return;
    const payload = {
      client_name: formData.client_name.trim(),
      client_type: formData.client_type.trim(),
      client_code: formData.client_code.trim(),
      industry: formData.industry.trim(),
      zone: formData.zone.trim(),
      account_manager: formData.account_manager.trim(),
      contact_person: formData.contact_person.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      country: formData.country.trim(),
      client_since: formData.client_since ? new Date(formData.client_since).toISOString() : undefined,
      onboarding_date: formData.onboarding_date ? new Date(formData.onboarding_date).toISOString() : undefined,
      payment_terms: formData.payment_terms.trim(),
      status: formData.status.trim(),
    };
    await updateData(`/client-management/clients/${id}`, payload);
    await refetch();
    setIsEditModalOpen(false);
  };

  if (isError) { 
    return <Error message={error?.message || "Failed to load client details. Please try again."} />;
  }
  // loading
  if (isLoading) {
    return <SkeletonLoading />;
  }

  return (
    <div>
      {/* heading section */}
      <div className="">
        <div className="flex items-center gap-2 text-sm text-textColor">
          <button
            onClick={() => navigate("/dashboard/clients")}
            className="hover:text-primary"
          >
            Clients
          </button>
          <span className="text-gray-300">/</span>
          <button
            onClick={() => navigate(`/dashboard/clients/${id}`)}
            className="hover:text-primary"
          >
            {data?.data?.client_code}
          </button>
        </div>
        <div className="mt-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* profile picture */}
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center bg-primary text-white font-bold text-2xl`}
            >
              {data?.data?.client_name?.charAt(0)?.toUpperCase() || "C"}
            </div>
            <div className="flex flex-col gap-2">
              {/* company name */}
              <div>
                <p className="text-xl">
                  {data?.data?.client_name || "Client Name"}
                </p>
                <p className="text-xs text-textColor mt-1">
                  {data?.data?.client_code}
                </p>
              </div>
              <div className="flex mt-4 items-center gap-3">
                {/* status */}
                <div>
                  {data?.data?.status?.toLowerCase() === "active" ? (
                    <p className="text-green-600 font-semibold px-3 py-1 rounded-full bg-green-400/10 text-sm">
                      Active
                    </p>
                  ) : data?.data?.status?.toLowerCase() === "inactive" ? (
                    <p className="text-red-600 font-semibold px-3 py-1 rounded-full bg-red-400/10 text-sm">
                      Inactive
                    </p>
                  ) : (
                    <p className="text-orange-600 font-semibold px-3 py-1 rounded-full bg-orange-400/10 text-sm">
                      {data?.data?.status}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-textColor mt-1">
                  <FaBuildingColumns />
                  <p>{data?.data?.client_type}</p>
                </div>
              </div>
            </div>
          </div>

          {/* button section (varies by active tab) */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {activeTab === "overview" && (
              <>
                <Button
                  variant={"outline"}
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Edit Client
                </Button>
                <Button
                  variant={"outline"}
                  onClick={() =>
                    navigate(`/dashboard/clients/${id}/record-interaction`)
                  }
                >
                  Record Interaction
                </Button>
                <Button
                  onClick={() =>
                    navigate("/dashboard/proposalscontracts", {
                      state: { view: "contract-new" },
                    })
                  }
                >
                  New Contract
                </Button>
              </>
            )}
            {activeTab === "contracts" && (
              <Button
                onClick={() =>
                  navigate("/dashboard/proposalscontracts", {
                    state: { view: "contract-new" },
                  })
                }
              >
                New Contract
              </Button>
            )}
            {activeTab === "interactions" && (
              <Button
                variant={"outline"}
                onClick={() =>
                  navigate(`/dashboard/clients/${id}/record-interaction`)
                }
              >
                Record Interaction
              </Button>
            )}
            {activeTab === "documents" && (
              <Button
                className="flex items-center gap-2"
                onClick={() => uploadInputRef.current?.click()}
              >
                Upload Document
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* tabs section */}
      <div className="mt-12">
        <div className="flex gap-6 sm:gap-12 border-b border-gray-200 overflow-x-auto no-scrollbar">
          <button
            className={`cursor-pointer pb-2 ${
              activeTab === "overview"
                ? "border-b-2 border-primary text-primary font-semibold"
                : "text-textColor hover:text-primary"
            }`}
            onClick={() => handleTabChange("overview")}
          >
            Overview
          </button>
          <button
            className={`cursor-pointer pb-2 ${
              activeTab === "contracts"
                ? "border-b-2 border-primary text-primary font-semibold"
                : "text-textColor hover:text-primary"
            }`}
            onClick={() => handleTabChange("contracts")}
          >
            Contracts & Services
          </button>
          <button
            className={`cursor-pointer pb-2 ${
              activeTab === "interactions"
                ? "border-b-2 border-primary text-primary font-semibold"
                : "text-textColor hover:text-primary"
            }`}
            onClick={() => handleTabChange("interactions")}
          >
            Interactions History
          </button>
          <button
            className={`cursor-pointer pb-2 ${
              activeTab === "documents"
                ? "border-b-2 border-primary text-primary font-semibold"
                : "text-textColor hover:text-primary"
            }`}
            onClick={() => handleTabChange("documents")}
          >
            Documents
          </button>
          <button
            className={`cursor-pointer pb-2 ${
              activeTab === "financial"
                ? "border-b-2 border-primary text-primary font-semibold"
                : "text-textColor hover:text-primary"
            }`}
            onClick={() => handleTabChange("financial")}
          >
            Financial
          </button>
        </div>

        {/* Keep tab content mounted to preserve state between tabs */}
        <div className="mt-6">
          {(activeTab === "overview" || visitedTabs.overview) && (
            <div
              key={`overview-${tabKeys.overview}`}
              className={activeTab === "overview" ? "" : "hidden"}
            >
              <ClientOverview clientData={data?.data} />
            </div>
          )}
          {(activeTab === "contracts" || visitedTabs.contracts) && (
            <div
              key={`contracts-${tabKeys.contracts}`}
              className={activeTab === "contracts" ? "" : "hidden"}
            >
              <ClientContracts clientData={data?.data} clientId={id} />
            </div>
          )}
          {(activeTab === "interactions" || visitedTabs.interactions) && (
            <div
              key={`interactions-${tabKeys.interactions}`}
              className={activeTab === "interactions" ? "" : "hidden"}
            >
              <ClientInteractions
                clientData={data?.data}
                clientId={id}
                refreshKey={interactionsRefreshKey}
                onAddInteraction={() =>
                  navigate(`/dashboard/clients/${id}/record-interaction`)
                }
              />
            </div>
          )}
          {(activeTab === "documents" || visitedTabs.documents) && (
            <div
              key={`documents-${tabKeys.documents}`}
              className={activeTab === "documents" ? "" : "hidden"}
            >
              <ClientDocuments
                clientData={data?.data}
                showHeaderAction={false}
                uploadInputRef={uploadInputRef}
              />
            </div>
          )}
          {(activeTab === "financial" || visitedTabs.financial) && (
            <div
              key={`financial-${tabKeys.financial}`}
              className={activeTab === "financial" ? "" : "hidden"}
            >
              <ClientFinancial clientData={data?.data} />
            </div>
          )}
        </div>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Client Name</label>
              <input
                value={formData.client_name}
                onChange={(e) => handleFormChange("client_name", e.target.value)}
                className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Client Type</label>
              <input
                value={formData.client_type}
                onChange={(e) => handleFormChange("client_type", e.target.value)}
                className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Client Code</label>
              <input
                value={formData.client_code}
                onChange={(e) => handleFormChange("client_code", e.target.value)}
                className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Industry</label>
              <input
                value={formData.industry}
                onChange={(e) => handleFormChange("industry", e.target.value)}
                className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Contact Person</label>
              <input
                value={formData.contact_person}
                onChange={(e) => handleFormChange("contact_person", e.target.value)}
                className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
                className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Phone</label>
              <input
                value={formData.phone}
                onChange={(e) => handleFormChange("phone", e.target.value)}
                className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Account Manager</label>
              <input
                value={formData.account_manager}
                onChange={(e) => handleFormChange("account_manager", e.target.value)}
                className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Status</label>
              <select
                value={formData.status}
                onChange={(e) => handleFormChange("status", e.target.value)}
                className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-gray-500">Address</label>
              <input
                value={formData.address}
                onChange={(e) => handleFormChange("address", e.target.value)}
                className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">City</label>
              <input
                value={formData.city}
                onChange={(e) => handleFormChange("city", e.target.value)}
                className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Country</label>
              <input
                value={formData.country}
                onChange={(e) => handleFormChange("country", e.target.value)}
                className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Zone</label>
              <input
                value={formData.zone}
                onChange={(e) => handleFormChange("zone", e.target.value)}
                className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Client Since</label>
              <input
                type="date"
                value={formData.client_since}
                onChange={(e) => handleFormChange("client_since", e.target.value)}
                className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Onboarding Date</label>
              <input
                type="date"
                value={formData.onboarding_date}
                onChange={(e) => handleFormChange("onboarding_date", e.target.value)}
                className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Payment Terms</label>
              <input
                value={formData.payment_terms}
                onChange={(e) => handleFormChange("payment_terms", e.target.value)}
                className="mt-1 w-full rounded border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateClient} disabled={isUpdating}>
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
