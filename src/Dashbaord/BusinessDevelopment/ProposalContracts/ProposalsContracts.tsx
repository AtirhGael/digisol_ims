import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useUserStore } from "../../../Store/UserStore";
import { FileText, FileCheck2, TrendingUp, Wallet } from "lucide-react";
import { Card } from "../../../components/other/Card";
import ReusableTable from "../../../components/other/ReusableTable/ReusableTable";
import { createProposalsColumns } from "../../../components/Columns/ProposalColumn";
import { Button } from "../../../components/ui/button";
import { ContractsTab } from "./Contracts/ContractsTab";
import { ProformaTab } from "./Proforma/ProformaTab";
import { MemorandumTab } from "./Memorandum/MemorandumTab";
import { useMemorandumStore } from "./Memorandum/Memorandum.store";
import { NewProposalForm } from "./Proposals/NewProposalForm";
import { ProposalDetail } from "./Proposals/ProposalDetail";
import { NewProformaForm } from "./Proforma/NewProformaForm";
import { NewContractForm } from "./Contracts/NewContractForm";
import useFetchHook from "../../../Hooks/UseFetchHook";
import useDeleteHook from "../../../Hooks/UseDeleteHook";
import usePost from "../../../Hooks/UsePostHook";
import useUpdate from "../../../Hooks/UseUpdateHook";
import type { Proposal, View } from "./types";
import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { formatDate } from "./utils/dateTime";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  PENDING: {
    label: "PENDING",
    cls: "text-yellow-600  bg-yellow-50   border border-yellow-200",
  },
  ACCEPTED: {
    label: "ACCEPTED",
    cls: "text-emerald-600 bg-emerald-50 border border-emerald-200",
  },
  REJECTED: {
    label: "REJECTED",
    cls: "text-red-500    bg-red-50     border border-red-200",
  },
};

function ProposalsList({
  proposals,
  onNew,
  onView,
  onNewProforma,
  onNewContract,
  onDelete,
  onEdit,
  dashboardSummary,
}: {
  proposals: Proposal[];
  onNew: () => void;
  onView: (p: Proposal) => void;
  onNewProforma: () => void;
  onNewContract: () => void;
  onDelete: (p: Proposal) => void;
  onEdit: (p: Proposal) => void;
  dashboardSummary?: {
    pending_proposals?: number;
    active_contracts?: number;
    conversion_rate?: number;
    total_portfolio?: number;
  };
}) {
  const [activeTab, setActiveTab] = useState<
    "proposals" | "proforma" | "contracts" | "memorandum"
  >("proposals");
  const [triggerNewProforma, setTriggerNewProforma] = useState(false);
  const [triggerNewContract, setTriggerNewContract] = useState(false);
  const [triggerNewMemorandum, setTriggerNewMemorandum] = useState(false);

  const navigate = useNavigate();
  const roles = useUserStore((state) => state.roles);
  const permissions = useUserStore((state) => state.permissions);
  const isSuperAdmin = roles.includes("SUPER_ADMIN");

  const checkPermission = (resource: string, action: string = "CREATE") => {
    if (isSuperAdmin) return true;
    return permissions.some(
      (p: any) =>
        p.module === "business_development" &&
        p.resource_type === resource &&
        p.action === action,
    );
  };
  const [contractSearch, setContractSearch] = useState("");
  const [contractStatus, setContractStatus] = useState<string>("");
  const [proformaSearch, setProformaSearch] = useState("");
  const [proformaStatus, setProformaStatus] = useState<string>("All");
  const [memorandumSearch, setMemorandumSearch] = useState("");
  const [memorandumStatus, setMemorandumStatus] = useState<string>("All");

  const pending = Number(dashboardSummary?.pending_proposals || 0);
  const activeContracts = Number(dashboardSummary?.active_contracts || 0);
  const conversion = Number(dashboardSummary?.conversion_rate || 0).toFixed(1);
  const portfolio = Number(dashboardSummary?.total_portfolio || 0);
  const fmtPortfolio = (n: number) => {
    if (n >= 1_000_000) return `XAF ${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `XAF ${(n / 1_000).toFixed(1)}k`;
    return `XAF ${n.toLocaleString()}`;
  };

  const proposalsCount = proposals.length;
  const proformaCount =
    typeof (window as any).proformaCount === "number"
      ? (window as any).proformaCount
      : 0;
  const contractsCount =
    typeof (window as any).contractsCount === "number"
      ? (window as any).contractsCount
      : 0;
  const { memorandums: memorandumsList } = useMemorandumStore();
  const memorandumCount = memorandumsList.length;

  const tableData = proposals.map((p) => ({
    ...p,
    id: String(p.id),
  }));

  const tabData = tableData;

  const handleExportContracts = () => {};

  const handleExportProforma = () => {};

  const handleExportMemorandum = () => {};

  const handleViewProposal = (id: string) => {
    const proposal = proposals.find((p) => String(p.id) === id);
    if (proposal) onView(proposal);
  };

  const handleEditProposal = (id: string) => {
    if (!checkPermission("proposals", "UPDATE")) {
      navigate("/dashboard/unauthorized");
      return;
    }
    const proposal = proposals.find((p) => String(p.id) === id);
    if (proposal) {
      onEdit(proposal);
    }
  };

  const handleDeleteProposal = (id: string) => {
    const proposal = proposals.find((p) => String(p.id) === id);
    if (proposal) {
      onDelete(proposal);
    }
  };

  const getButtonText = () => {
    switch (activeTab) {
      case "proposals":
        return "New Proposal";
      case "proforma":
        return "New Proforma";
      case "contracts":
        return "New Contract";
      case "memorandum":
        return "New Memorandum";
      default:
        return "New Proposal";
    }
  };

  const columns = createProposalsColumns({
    onViewProposal: handleViewProposal,
    onEditProposal: handleEditProposal,
    onDeleteProposal: handleDeleteProposal,
  });

  const statusFilterOptions = [
    { key: "PENDING", value: "PENDING", label: "Pending" },
    { key: "ACCEPTED", value: "ACCEPTED", label: "Accepted" },
    { key: "REJECTED", value: "REJECTED", label: "Rejected" },
    { key: "CANCELLED", value: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <div className="min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight m-0">
            Proposals &amp; Contracts
          </h1>
          <p className="text-sm text-gray-500 mt-1 mb-0">
            Track proposals and contracts from each prospection
          </p>
        </div>
        <Button
          variant="default"
          buttonType="add"
          onClick={() => {
            if (activeTab === "proforma") {
              if (!checkPermission("contracts")) {
                navigate("/dashboard/unauthorized");
                return;
              }
              setTriggerNewProforma(true);
              setTimeout(() => setTriggerNewProforma(false), 100);
            } else if (activeTab === "contracts") {
              if (!checkPermission("contracts")) {
                navigate("/dashboard/unauthorized");
                return;
              }
              setTriggerNewContract(true);
              setTimeout(() => setTriggerNewContract(false), 100);
            } else if (activeTab === "memorandum") {
              if (!checkPermission("memorandum")) {
                navigate("/dashboard/unauthorized");
                return;
              }
              setTriggerNewMemorandum(true);
              setTimeout(() => setTriggerNewMemorandum(false), 100);
            } else {
              if (!checkPermission("proposals")) {
                navigate("/dashboard/unauthorized");
                return;
              }
              onNew();
            }
          }}
          className="w-full sm:w-auto"
        >
          {getButtonText()}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card
          heading="Pending Proposals"
          amount={String(pending)}
          textColor="#111827"
          iconBackgroundColor="#111827"
          icons={<FileText size={17} className="text-white" />}
        />
        <Card
          heading="Active Contracts"
          amount={String(activeContracts)}
          textColor="#10b981"
          iconBackgroundColor="#10b981"
          icons={<FileCheck2 size={17} className="text-white" />}
        />
        <Card
          heading="Conversion Rate"
          amount={conversion}
          currency="%"
          textColor="#f59e0b"
          iconBackgroundColor="#f59e0b"
          icons={<TrendingUp size={17} className="text-white" />}
        />
        <Card
          heading="Total Portfolio"
          amount={fmtPortfolio(portfolio)}
          textColor="#06b6d4"
          iconBackgroundColor="#06b6d4"
          icons={<Wallet size={17} className="text-white" />}
        />
      </div>

      <div className="flex gap-2 sm:gap-0 border-b-2 border-gray-200 mb-6 bg-gray-50 rounded-t-md overflow-x-auto no-scrollbar w-full min-w-full snap-x snap-mandatory pb-1">
        {(["proposals", "proforma", "contracts", "memorandum"] as const).map(
          (tab) => {
            const getCount = () => {
              switch (tab) {
                case "proposals":
                  return proposalsCount;
                case "proforma":
                  return proformaCount;
                case "contracts":
                  return contractsCount;
                case "memorandum":
                  return memorandumCount;
                default:
                  return 0;
              }
            };
            const getLabel = () => {
              switch (tab) {
                case "proposals":
                  return "All Proposals";
                case "proforma":
                  return "All Proforma";
                case "contracts":
                  return "All Contracts";
                case "memorandum":
                  return "All Memorandum";
                default:
                  return "All Proposals";
              }
            };
            const count = getCount();
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative snap-start flex items-center gap-2 px-4 sm:px-8 py-3 sm:py-4 text-xs sm:text-sm font-medium cursor-pointer border-none bg-transparent transition-colors whitespace-nowrap capitalize
                ${
                  active
                    ? "text-primary font-semibold after:absolute after:left-0 after:-bottom-0.5 after:h-1 after:w-full after:bg-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {getLabel()}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${active ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-600"}`}
                >
                  {count}
                </span>
              </button>
            );
          },
        )}
      </div>

      <div className={activeTab === "proposals" ? "mb-4 block" : "hidden"}>
        <ReusableTable
          columns={columns}
          data={tabData}
          heading="All Proposals"
          filterOptions={statusFilterOptions}
          filterKey="status"
          searchKeys={["title", "company", "createdBy"]}
          itemsPerPage={8}
          showSearch={true}
          showFilter={true}
        />
      </div>

      <div className={activeTab === "proforma" ? "mb-4 block" : "hidden"}>
        <ProformaTab
          searchTerm={proformaSearch}
          onSearchChange={setProformaSearch}
          statusFilter={proformaStatus}
          onStatusChange={setProformaStatus}
          onExport={handleExportProforma}
          onNewProforma={onNewProforma}
          triggerNewProforma={triggerNewProforma}
        />
      </div>

      <div className={activeTab === "contracts" ? "mb-4 block" : "hidden"}>
        <ContractsTab
          searchTerm={contractSearch}
          onSearchChange={setContractSearch}
          statusFilter={contractStatus}
          onStatusChange={setContractStatus}
          onExport={handleExportContracts}
          onNewContract={onNewContract}
          triggerNewContract={triggerNewContract}
        />
      </div>

      <div className={activeTab === "memorandum" ? "mb-4 block" : "hidden"}>
        <MemorandumTab
          searchTerm={memorandumSearch}
          onSearchChange={setMemorandumSearch}
          statusFilter={memorandumStatus}
          onStatusChange={setMemorandumStatus}
          onExport={handleExportMemorandum}
          onNewMemorandum={() => {}}
          triggerNewMemorandum={triggerNewMemorandum}
        />
      </div>
    </div>
  );
}

export const ProposalsContracts = () => {
  const [view, setView] = useState<View>("list");
  const [selected, setSelected] = useState<Proposal | null>(null);
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: fetchedData,
    isLoading,
    error,
    isError,
    refetch,
  } = useFetchHook("/proposals-contracts/proposals", "proposals-data", {
    enabled: true,
    refetchOnWindowFocus: false,
  });

  const { data: contractsData } = useFetchHook(
    "/proposals-contracts/contracts",
    "contracts-data",
    {
      enabled: true,
      refetchOnWindowFocus: false,
    },
  );

  const { data: dashboardData } = useFetchHook(
    "/proposals-contracts/dashboard",
    "proposals-contracts-dashboard",
    {
      enabled: true,
      refetchOnWindowFocus: false,
    },
  );

  const { data: proformaData } = useFetchHook(
    "/proposals-contracts/proforma-invoices",
    "proforma-data",
    {
      enabled: true,
      refetchOnWindowFocus: false,
    },
  );

  const { mutateAsync: deleteProposal } = useDeleteHook(
    "/proposals-contracts/proposals",
    ["proposals-data"],
  );

  const { postData: createProposal, loading: isCreatingProposal } = usePost();

  const { updateData: updateProposal, loading: isUpdatingProposal } =
    useUpdate();

  let proposals: Proposal[] = [];

  if (fetchedData?.success && Array.isArray(fetchedData.data)) {
    proposals = fetchedData.data.map((item: any) => {
      const targetEntity = item.clients
        ? {
            type: "Client" as const,
            company: item.clients.client_name || "Unknown Client",
            contact: item.clients.contact_person || "N/A",
            email: item.clients.email || "N/A",
            phone: item.clients.phone || "N/A",
            address: item.clients.address || "N/A",
            city: item.clients.city || "N/A",
            industry: item.clients.industry || "N/A",
            status: item.clients.status || "ACTIVE",
            clientSince: formatDate(item.clients.client_since),
          }
        : item.leads
          ? {
              type: "Lead" as const,
              company: item.leads.company_name || "Unknown Lead",
              contact: item.leads.contact_person || "N/A",
              email: item.leads.email || "N/A",
              phone: item.leads.phone || "N/A",
              address: item.leads.address || "N/A",
              city: item.leads.city || "N/A",
              industry: item.leads.industry_sector || "N/A",
              status: item.leads.status || "NEW",
              position: item.leads.position || "N/A",
              lastContactDate: item.leads.last_contact_date
                ? formatDate(item.leads.last_contact_date)
                : "Never",
            }
          : {
              type: "Unknown" as const,
              company: "General Proposal",
              contact: "N/A",
              email: "N/A",
              phone: "N/A",
              address: "N/A",
              city: "N/A",
              industry: "N/A",
              status: "N/A",
            };

      return {
        id: item.proposal_id,
        proposal_number: item.proposal_number || `PROP-${item.proposal_id}`,
        title: item.proposal_title || "Untitled Proposal",
        company: targetEntity.company,
        clientId: item.client_id ? String(item.client_id) : undefined,
        leadId: item.lead_id ? String(item.lead_id) : undefined,
        source: targetEntity.type,
        status: (item.status || "PENDING").toUpperCase(),
        dateAdded: formatDate(item.created_at, formatDate(new Date())),
        validUntil: formatDate(item.validity, ""),
        description: item.description || "",
        services: item.services
          ? Array.isArray(item.services)
            ? item.services
            : item.services.split(",").map((s: string) => s.trim())
          : [],
        sentDate: item.sent_date ? formatDate(item.sent_date) : undefined,
        decisionDate: item.decision_date
          ? formatDate(item.decision_date)
          : undefined,
        documentUrl: item.document_url,
        createdBy: item.users
          ? `${item.users.first_name} ${item.users.last_name}`
          : "Unknown",
        targetEntity,
        contactBreakdown: { normal: 0, potential: 0, client: 0 },
      };
    });
  } else {
    proposals = [];
  }

  useEffect(() => {
    if (!isError) return;
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to load proposals and contracts data.";
    toast.error(message);
  }, [isError, error]);

  const handleView = (p: Proposal) => {
    setSelected(p);
    setView("detail");
  };
  const handleNew = () => {
    setEditingProposal(null);
    setView("new");
  };
  const handleEdit = (p: Proposal) => {
    setEditingProposal(p);
    setView("edit");
  };
  const handleNewProforma = () => setView("proforma-new");
  const handleNewContract = () => setView("contract-new");
  const handleBack = () => {
    setView("list");
    setSelected(null);
    setEditingProposal(null);
  };

  const handleSubmit = async (p: Proposal) => {
    try {
      if (editingProposal) {
        const proposalData = {
          proposal_number: p.proposal_number,
          proposal_title: p.title,
          client_id: p.clientId || null,
          lead_id: p.leadId || null,
          description: p.description || "",
          services: (p.services || []).filter((s) => s && s.trim() !== ""),
          validity: p.validUntil ? new Date(p.validUntil).toISOString() : null,
          document_url: p.documentUrl || null,
          status: p.status || "PENDING",
        };

        await updateProposal(
          `/proposals-contracts/proposals/${editingProposal.id}`,
          proposalData,
        );
        toast.success("Proposal updated successfully!");
      } else {
        const proposalData = {
          proposal_number: p.proposal_number || `PROP-${Date.now()}`,
          proposal_title: p.title,
          client_id: p.clientId || null,
          lead_id: p.leadId || null,
          description: p.description || "",
          services: (p.services || []).filter((s) => s && s.trim() !== ""),
          validity: p.validUntil ? new Date(p.validUntil).toISOString() : null,
          document_url: p.documentUrl || null,
          status: p.status || "PENDING",
        };

        await createProposal("/proposals-contracts/proposals", proposalData);
        toast.success("Proposal created successfully!");
      }
      await refetch();
      setView("list");
      setEditingProposal(null);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        `Failed to ${editingProposal ? "update" : "create"} proposal. Please try again.`;

      toast.error(errorMessage);
    }
  };

  const handleProformaSubmit = (proforma: any) => {
    setView("list");
  };
  const handleContractSubmit = (contract: any) => {
    setView("list");
  };

  const handleDelete = (proposal: Proposal) => {
    if (String(proposal.status || "").toUpperCase() === "ACCEPTED") {
      toast.error("Accepted proposals cannot be deleted.");
      return;
    }
    setDeleteModalId(String(proposal.id));
  };

  const confirmDelete = async () => {
    if (deleteModalId && !isDeleting) {
      setIsDeleting(true);
      try {
        await deleteProposal(deleteModalId);
        toast.success("Proposal deleted successfully!");
        await refetch();
      } catch (error: any) {
        const statusCode = error?.response?.status;
        const backendMessage = error?.response?.data?.message as
          | string
          | undefined;
        const loweredMessage = (backendMessage || "").toLowerCase();
        const isStatusRestriction =
          statusCode === 400 ||
          statusCode === 409 ||
          loweredMessage.includes("status") ||
          loweredMessage.includes("cannot delete") ||
          loweredMessage.includes("can't delete");

        const errorMessage =
          backendMessage ||
          (isStatusRestriction
            ? "This proposal cannot be deleted in its current status."
            : error?.message || "Failed to delete proposal. Please try again.");
        toast.error(errorMessage);
      } finally {
        setIsDeleting(false);
        setDeleteModalId(null);
      }
    }
  };

  const cancelDelete = () => {
    setDeleteModalId(null);
  };

  if (isLoading) {
    return <SkeletonLoading />;
  }

  if (isError && proposals.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="w-16 h-16 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to Load Proposals
            </h3>
            <p className="text-red-600 mb-4">
              {error?.response?.status === 500
                ? "Server error occurred. Please contact support if this persists."
                : error?.message || "Unknown error occurred"}
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const contractsCount =
    contractsData?.success && Array.isArray(contractsData.data)
      ? contractsData.data.length
      : 0;
  const proformaCount =
    proformaData?.success && Array.isArray(proformaData.data)
      ? proformaData.data.length
      : 0;

  // Share counts for tab badges.
  (window as any).contractsCount = contractsCount;
  (window as any).proformaCount = proformaCount;
  const dashboardSummary = dashboardData?.success
    ? dashboardData?.data?.summary
    : undefined;

  return (
    <div className="min-h-screen">
      {isError && (
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => refetch()}
            loading={isLoading}
          >
            Retry Loading Proposals
          </Button>
        </div>
      )}

      {view === "list" && (
        <ProposalsList
          proposals={proposals}
          onNew={handleNew}
          onView={handleView}
          onNewProforma={handleNewProforma}
          onNewContract={handleNewContract}
          onDelete={handleDelete}
          onEdit={handleEdit}
          dashboardSummary={dashboardSummary}
        />
      )}
      {view === "new" && (
        <NewProposalForm onCancel={handleBack} onSubmit={handleSubmit} />
      )}
      {view === "edit" && (
        <NewProposalForm
          onCancel={handleBack}
          onSubmit={handleSubmit}
          editProposal={editingProposal}
        />
      )}
      {view === "proforma-new" && (
        <NewProformaForm
          onCancel={handleBack}
          onSubmit={handleProformaSubmit}
        />
      )}
      {view === "contract-new" && (
        <NewContractForm
          onCancel={handleBack}
          onSubmit={handleContractSubmit}
        />
      )}
      {view === "detail" && selected && (
        <ProposalDetail
          proposal={selected}
          onBack={handleBack}
          onEdit={() => handleEdit(selected)}
        />
      )}

      <AlertDialog
        open={deleteModalId !== null}
        onOpenChange={(open) => !open && cancelDelete()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Proposal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this proposal? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" disabled={isDeleting}>
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={(e) => {
                  e.preventDefault();
                  confirmDelete();
                }}
                disabled={isDeleting}
                loading={isDeleting}
              >
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
