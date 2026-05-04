import { useState, useMemo, useEffect } from "react";
import { Card } from "../../../components/other/Card";
import { AiFillInteraction } from "react-icons/ai";
import { IoCallSharp } from "react-icons/io5";
import { GoOrganization } from "react-icons/go";
import { TbSitemapFilled } from "react-icons/tb";
import { FaBuildingColumns } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import useFetchHook from "../../../Hooks/UseFetchHook";
import { Error as ErrorMessage } from "../../../components/other/Error/Error";
import SkeletonLoading from "@/components/other/Loader/SkeletonLoading/SkeletonLoading";
import TableSkeleton from "@/components/other/Loader/TableSkeleton";
import { getAllContracts } from "../ProposalContracts/Contracts/api";
import { formatDate } from "../ProposalContracts/utils/dateTime";
import ReusableTable from "../../../components/other/ReusableTable/ReusableTable";
import { MoreVertical, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useUserStore } from "../../../Store/UserStore";
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
import { Button } from "../../../components/ui/button";

export const Clients = () => {
  // Local UI state.
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [contractSummary, setContractSummary] = useState<
    Record<string, { count: number; lastDate?: string; totalValue: number }>
  >({});
  const [isContractSummaryLoading, setIsContractSummaryLoading] = useState(true);
  const navigate = useNavigate();
  const accessToken = useUserStore((state) => state.accessToken);
  const API_BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:4000";

  // Fetch client stats + list from the API.
  const { data, error, isError, isLoading, refetch } = useFetchHook(
    "/client-management/stats",
    "clients",
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteClientTarget, setDeleteClientTarget] = useState<any>(null);

  // Fetch all contracts once and build a summary lookup per client.
  useEffect(() => {
    let isMounted = true;
    const loadContracts = async () => {
      try {
        setIsContractSummaryLoading(true);
        const response = await getAllContracts();
        const responseAny = response as any;
        const contracts = Array.isArray(responseAny?.data)
          ? responseAny.data
          : Array.isArray(responseAny?.data?.data)
          ? responseAny.data.data
          : [];

        const summary: Record<string, { count: number; lastDate?: string; totalValue: number }> = {};
        contracts.forEach((contract: any) => {
          const clientId =
            contract?.client_id ||
            contract?.clients?.client_id ||
            contract?.clients?.id ||
            contract?.clients?.clientId;
          if (!clientId) return;
          const key = String(clientId);

          const contractDate =
            contract?.signed_date ||
            contract?.start_date ||
            contract?.created_at ||
            contract?.updated_at;
          if (!summary[key]) {
            summary[key] = { count: 0, lastDate: contractDate, totalValue: 0 };
          }
          summary[key].count += 1;
          const rawValue =
            contract?.contract_value ??
            contract?.contractValue ??
            contract?.value ??
            0;
          const numericValue =
            typeof rawValue === "number" ? rawValue : parseFloat(rawValue);
          if (!Number.isNaN(numericValue)) {
            summary[key].totalValue += numericValue;
          }
          if (contractDate) {
            const current = summary[key].lastDate ? new Date(summary[key].lastDate).getTime() : 0;
            const next = new Date(contractDate).getTime();
            if (!Number.isNaN(next) && next >= current) {
              summary[key].lastDate = contractDate;
            }
          }
        });

        if (isMounted) {
          setContractSummary(summary);
          setIsContractSummaryLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setContractSummary({});
          setIsContractSummaryLoading(false);
        }
      }
    };

    loadContracts();
    return () => {
      isMounted = false;
    };
  }, []);


  // Helpers to normalize client data for display.
  const resolveClientKey = (client: any) =>
    String(client?.id ?? client?.client_id ?? client?.clientId ?? client?.client_code ?? "");

  const resolveContractsCount = (client: any) => {
    const key = resolveClientKey(client);
    if (key && contractSummary[key]) return contractSummary[key].count;
    const fallback =
      client?.total_contracts ?? client?.contractsCount ?? client?.contracts_count ?? null;
    if (fallback !== null && fallback !== undefined) return fallback;
    return isContractSummaryLoading ? null : 0;
  };

  const resolveLastContract = (client: any) => {
    const key = resolveClientKey(client);
    const raw =
      (key && contractSummary[key]?.lastDate) ||
      client?.last_contract_date ||
      client?.lastContractDate ||
      client?.lastContactDate ||
      null;
    if (!raw && isContractSummaryLoading) return null;
    return formatDate(raw, "N/A");
  };

  const resolveTotalValue = (client: any) => {
    const key = resolveClientKey(client);
    const summaryValue = key ? contractSummary[key]?.totalValue : undefined;
    if (typeof summaryValue === "number" && !Number.isNaN(summaryValue)) {
      return summaryValue;
    }
    const fallback =
      client?.total_contract_value ??
      client?.totalContractValue ??
      client?.total_value ??
      client?.value;
    if (fallback !== undefined && fallback !== null && fallback !== "") return fallback;
    return isContractSummaryLoading ? null : 0;
  };

  const formatValue = (rawValue: any) => {
    if (rawValue === null || rawValue === undefined) return "—";
    if (typeof rawValue === "number") {
      return `${rawValue.toLocaleString()} XAF`;
    }
    if (rawValue === null || rawValue === undefined || rawValue === "") return "N/A";
    return rawValue;
  };

  // Client list for the table view.
  const filteredClients = useMemo(() => {
    return data?.data?.clients || [];
  }, [data?.data?.clients]);

  const confirmDeleteClient = async () => {
    if (!deleteClientTarget) return;
    const clientId = deleteClientTarget?.id ?? deleteClientTarget?.client_id ?? deleteClientTarget?.clientId;
    if (!clientId) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`${API_BASE_URL}/client-management/clients/${clientId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message || "Failed to delete client.");
      }
      toast.success("Client deleted successfully.");
      await refetch();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete client.");
    } finally {
      setIsDeleting(false);
      setDeleteClientTarget(null);
    }
  };
  // Shape data for the reusable table.
  const clientTableData = useMemo(() => {
    return filteredClients.map((client: any) => {
      const formattedValue = formatValue(resolveTotalValue(client));
      return {
        id: client?.id ?? client?.client_id ?? client?.clientId,
        client,
        name: client.client_name,
        industry: client.client_type || client.industry,
        contactPerson: client.contact_person,
        contracts: resolveContractsCount(client) ?? "—",
        value: formattedValue,
        lastContract: resolveLastContract(client) ?? "—",
        status: client.status || "Active",
      };
    });
  }, [filteredClients, resolveContractsCount, resolveLastContract, resolveTotalValue, isContractSummaryLoading]);

  // Column definitions for the table view.
  const clientColumns = useMemo(
    () => [
      {
        key: "name",
        header: "Client",
        render: (_value: string, row: any) => (
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-white font-medium shrink-0">
              {row?.client?.client_name?.charAt(0)?.toUpperCase() || "C"}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-gray-900 flex items-center gap-1 min-w-0">
                {(() => {
                  const fullName = row?.client?.client_name || "";
                  const parts = fullName.trim().split(/\s+/).filter(Boolean);
                  const rawFirstName = parts[0] || fullName;
                  const firstName = rawFirstName.length > 6 ? rawFirstName.slice(0, 6) : rawFirstName;
                  const rest = parts.slice(1).join(" ");
                  return (
                    <>
                      <span className="shrink-0">{firstName}</span>
                      {rest ? (
                        <span className="truncate max-w-35 sm:max-w-50 min-w-0">
                          {" "}{rest}
                        </span>
                      ) : null}
                    </>
                  );
                })()}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-35 sm:max-w-50">
                {row?.client?.clientId || row?.client?.id}
              </p>
            </div>
          </div>
        ),
        truncate: false,
      },
      {
        key: "industry",
        header: "Industry",
        render: (_value: string, row: any) => (
          <div className="flex items-center gap-1 min-w-0">
            <FaBuildingColumns className="text-gray-400 shrink-0" />
            <span className="text-sm text-gray-600 truncate">{row?.industry || "N/A"}</span>
          </div>
        ),
      },
      {
        key: "contactPerson",
        header: "Contact Person",
        render: (_value: string, row: any) => (
          <div className="flex items-center gap-2 min-w-0">
            <span className="bg-primary text-white py-1 px-2 text-xs rounded-full shrink-0">
              {row?.contactPerson
                ?.split(" ")
                .map((n: string) => n.charAt(0))
                .join("")
                .slice(0, 2) || "CP"}
            </span>
            <span className="text-sm text-gray-900 flex items-center gap-1 min-w-0">
              {(() => {
                const fullName = row?.contactPerson || "N/A";
                const parts = fullName.trim().split(/\s+/).filter(Boolean);
                const firstName = parts[0] || fullName;
                const rest = parts.slice(1).join(" ");
                return (
                  <>
                    <span className="shrink-0">{firstName}</span>
                    {rest ? (
                      <span className="truncate max-w-35 sm:max-w-50 min-w-0">
                        {" "}{rest}
                      </span>
                    ) : null}
                  </>
                );
              })()}
            </span>
          </div>
        ),
        truncate: false,
      },
      { key: "contracts", header: "Contracts" },
      { key: "value", header: "Value" },
      { key: "lastContract", header: "Last Contract" },
      {
        key: "status",
        header: "Status",
        
        render: (value: string) => {
          const statusLower = (value || "").toLowerCase();
          const isActive = statusLower === "active";
          const isSuspended = statusLower === "suspended";
          const dotClass = isActive ? "bg-green-500" : isSuspended ? "bg-red-500" : "bg-gray-400";
          const textClass = isActive ? "text-green-700" : isSuspended ? "text-red-600" : "text-gray-700";
          return (
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 ${dotClass} rounded-full`}></span>
              <span className={`text-sm ${textClass}`}>{value || "Active"}</span>
            </div>
          );
        },
        truncate: false,
      },
      {
        key: "actions",
        header: "Actions",
        render: (_value: any, row: any) => (
          <div className="relative flex justify-center">
            <button
              type="button"
              className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId((prev) => (prev === row.id ? null : row.id));
              }}
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            {openMenuId === row.id && (
              <div
                className="absolute right-0 top-9 z-10 min-w-30 rounded-md border border-gray-200 bg-white py-1 shadow-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => navigate(`/dashboard/clients/${row.id}`)}
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-60"
                  onClick={() => setDeleteClientTarget(row.client)}
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        ),
        truncate: false,
      },
    ],
    [isDeleting, navigate, openMenuId],
  );

  // loading screeen
  if (isLoading) {
    return <SkeletonLoading />;
  }
  // if error
  if (isError) {
    return (
      <ErrorMessage
        message={
          error?.message || "Failed to load client data. Please try again."
        }
      />
    );
  }

  return (
    <div>
      <AlertDialog
        open={deleteClientTarget !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeleteClientTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteClientTarget?.client_name || "this client"}? This action cannot be undone and all associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="outline" disabled={isDeleting}>Cancel</Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={(e) => {
                  e.preventDefault();
                  confirmDeleteClient();
                }}
                disabled={isDeleting}
                loading={isDeleting}
              >
                Delete Client
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Client Management
          </h1>
          <p className="text-textColor mt-1">
            Manage confirmed clients and track relationships
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <Card
          heading="Total Interactions"
          amount={data?.data?.stats?.totalInteractions?.toString() ?? "0"}
          icons={<AiFillInteraction className="text-white" />}
        />
        <Card
          heading="Meetings"
          amount={data?.data?.stats?.meetings?.toString() ?? "0"}
          icons={<GoOrganization className="text-white" />}
        />
        <Card
          heading="Call"
          amount={data?.data?.stats?.calls?.toString() ?? "0"}
          icons={<IoCallSharp className="text-white" />}
        />
        <Card
          heading="Site Visits"
          amount={data?.data?.stats?.siteVisits?.toString() ?? "0"}
          icons={<TbSitemapFilled className="text-white" />}
        />
        <Card
          heading="Total clients"
          amount={data?.data?.stats?.totalClients?.toString() ?? "0"}
          icons={<FaBuildingColumns className="text-white" />}
        />
      </div>

      {/* Clients table */}
      <div className="mt-5 animate-in fade-in duration-500">
        {isContractSummaryLoading ? (
          <TableSkeleton rows={7} columns={6} showHeader={true} showSearch={false} showFilters={false} />
        ) : filteredClients.length > 0 ? (
          <div
            className="bg-white rounded-lg shadow-sm overflow-hidden"
            onClick={() => setOpenMenuId(null)}
          >
            <ReusableTable
              columns={clientColumns}
              data={clientTableData}
              heading="Clients"
              searchKeys={["name", "industry", "contactPerson", "status"]}
              itemsPerPage={8}
              showSearch={false}
              showFilter={false}
            />
          </div>
        ) : (
          <div className="w-full text-center py-8 animate-in fade-in duration-500">
            <p className="text-gray-500 text-lg">
              No clients found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
