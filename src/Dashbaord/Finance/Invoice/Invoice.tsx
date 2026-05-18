import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../components/other/Card";
import { Button } from "../../../components/ui/button";
import { useUserStore } from "../../../Store/UserStore";
import ReusableTable from "../../../components/other/ReusableTable/ReusableTable";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import {
  FaFileInvoice,
  FaClock,
  FaMoneyBillWave,
  FaDollarSign,
} from "react-icons/fa";
import { type Invoice } from "../financeApi";
import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import ChartSkeleton from "../../../components/other/Loader/ChartSkeleton";
import { toast } from "sonner";
import useFetchHook from "../../../Hooks/UseFetchHook";

const normalizeInvoiceStatus = (status?: string) =>
  String(status ?? "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

const formatInvoiceStatus = (status?: string) => {
  const normalizedStatus = normalizeInvoiceStatus(status);
  const statusLabels: Record<string, string> = {
    PENDING: "Pending",
    SENT: "Sent",
    DRAFT: "Pending",
    PAID: "Paid",
    OVERDUE: "Overdue",
    CANCELLED: "Cancelled",
    PARTIALLY_PAID: "Partially Paid",
  };

  return statusLabels[normalizedStatus] || status || "N/A";
};

// Register chart.js components once.
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export const Invoice = () => {
  // Navigation + UI state.
  const navigate = useNavigate();
  const roles = useUserStore((state) => state.roles);
  const permissions = useUserStore((state) => state.permissions);

  const checkPermission = (action: string) => {
    if (roles.includes("SUPER_ADMIN")) return true;
    return permissions.some(
      (p) =>
        p.module === "finance" &&
        p.resource_type === "invoice_payments" &&
        p.action === action,
    );
  };
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeletingInvoice, setIsDeletingInvoice] = useState(false);

  const {
    data: invoicesResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useFetchHook<{ data: Invoice[] }>(
    "/finance/invoices?page=1&page_size=50",
    "finance-invoices",
  );

  useEffect(() => {
    if (invoicesResponse?.data) {
      setInvoices(invoicesResponse.data);
    }
  }, [invoicesResponse?.data]);

  const { data: clientsData } = useFetchHook(
    "/client-management/clients",
    "clients-data",
  );
  const clientMap = useMemo(() => {
    const payload = clientsData?.data ?? clientsData;
    const candidates = Array.isArray(payload?.clients)
      ? payload.clients
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload)
            ? payload
            : [];

    return new Map<string, string>(
      candidates
        .filter((client: any) => client?.client_id || client?.id)
        .map((client: any) => [
          String(client.client_id ?? client.id),
          client.client_name || client.name || client.company_name || "Unknown",
        ]),
    );
  }, [clientsData]);

  const invoiceStats = useMemo(
    () =>
      invoices.reduce(
        (stats, inv) => {
          const status = normalizeInvoiceStatus(inv.status);

          stats.totalInvoices += 1;
          stats.totalAmount += Number(inv.total_amount) || 0;
          if (status === "PENDING" || status === "DRAFT") stats.pending += 1;
          if (status === "PARTIALLY_PAID") stats.partiallyPaid += 1;

          return stats;
        },
        {
          totalInvoices: 0,
          pending: 0,
          partiallyPaid: 0,
          totalAmount: 0,
        },
      ),
    [invoices],
  );

  const invoiceTrend = useMemo(() => {
    const issuedTotals = new Map<string, number>();
    const collectedTotals = new Map<string, number>();
    invoices.forEach((invoice) => {
      if (!invoice.invoice_date) return;
      const invoiceDate = new Date(invoice.invoice_date);
      if (Number.isNaN(invoiceDate.getTime())) return;
      const key = `${invoiceDate.getFullYear()}-${invoiceDate.getMonth()}`;
      const issued = Number(invoice.total_amount) || 0;
      const collected = Number(invoice.amount_paid) || 0;
      issuedTotals.set(key, (issuedTotals.get(key) || 0) + issued);
      collectedTotals.set(key, (collectedTotals.get(key) || 0) + collected);
    });

    const now = new Date();
    const labels: string[] = [];
    const issuedSeries: number[] = [];
    const collectedSeries: number[] = [];
    for (let i = 5; i >= 0; i -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      labels.push(date.toLocaleString("en-US", { month: "short" }));
      issuedSeries.push(issuedTotals.get(key) || 0);
      collectedSeries.push(collectedTotals.get(key) || 0);
    }
    return { labels, issuedSeries, collectedSeries };
  }, [invoices]);

  const hasTrendData =
    invoiceTrend.issuedSeries.some((value) => value > 0) ||
    invoiceTrend.collectedSeries.some((value) => value > 0);

  const invoiceTableData = useMemo(
    () =>
      invoices.map((invoice) => {
        const normalizedStatus = normalizeInvoiceStatus(invoice.status);

        return {
          ...invoice,
          display_status: normalizedStatus === "DRAFT" ? "PENDING" : normalizedStatus,
        };
      }),
    [invoices],
  );

  // Chart config for invoice vs collection trend.
  const chartData = {
    labels: invoiceTrend.labels,
    datasets: [
      {
        label: "Collected (XAF)",
        data: invoiceTrend.collectedSeries,
        borderColor: "#10B981",
        backgroundColor: "#10B981",
        tension: 0.4,
      },
      {
        label: "Issued (XAF)",
        data: invoiceTrend.issuedSeries,
        borderColor: "#3B82F6",
        backgroundColor: "#3B82F6",
        tension: 0.4,
      },
    ],
  };

  // Chart display options.
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom" as const,
        labels: {
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function (value: any) {
            return value / 1000000 + "M";
          },
        },
        grid: {
          drawBorder: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Status badge styling helper.
  const getStatusBadge = (status: string) => {
    const normalizedStatus = normalizeInvoiceStatus(status);
    const statusStyles: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-700",
      SENT: "bg-blue-100 text-blue-700",
      DRAFT: "bg-yellow-100 text-yellow-700",
      PAID: "bg-green-100 text-green-700",
      OVERDUE: "bg-red-100 text-red-700",
      CANCELLED: "bg-gray-100 text-gray-700",
      PARTIALLY_PAID: "bg-red-100 text-red-700",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          statusStyles[normalizedStatus] || "bg-gray-100 text-gray-700"
        }`}
      >
        {formatInvoiceStatus(status)}
      </span>
    );
  };

  // Route to add invoice.
  const handleAddInvoice = () => {
    if (!checkPermission("CREATE")) {
      navigate("/dashboard/unauthorized");
      return;
    }
    navigate("/dashboard/invoice/add");
  };

  // Route to view invoice.
  const handleViewInvoice = (id: string) => {
    navigate(`/dashboard/invoice/${id}`);
  };

  const handleEditInvoice = (id: string) => {
    if (!checkPermission("UPDATE")) {
      navigate("/dashboard/unauthorized");
      return;
    }
    navigate(`/dashboard/invoice/edit/${id}`);
  };

  const handleDeleteInvoice = (id: string) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeletingInvoice(true);
    try {
      setInvoices((prev) => prev.filter((inv) => inv.invoice_id !== deleteId));
      toast.success("Invoice deleted successfully.");
      setDeleteModalOpen(false);
      setDeleteId(null);
    } finally {
      setIsDeletingInvoice(false);
    }
  };

  const cancelDelete = () => {
    if (isDeletingInvoice) return;
    setDeleteModalOpen(false);
    setDeleteId(null);
  };

  const invoiceColumns = useMemo(
    () => [
      {
        key: "client_id",
        header: "Client",
        render: (_value: string, row: Invoice) =>
          clientMap.get(row.client_id) || row.client_name || "N/A",
      },
      {
        key: "total_amount",
        header: "Amount",
        render: (_value: number, row: Invoice) => (
          <span className="text-gray-900">
            {row.currency || "XAF"} {Number(row.total_amount).toLocaleString()}
          </span>
        ),
      },
      {
        key: "amount_paid",
        header: "Paid",
        render: (_value: number, row: Invoice) => (
          <span className="text-green-600">
            {row.currency || "XAF"} {Number(row.amount_paid).toLocaleString()}
          </span>
        ),
      },
      {
        key: "invoice_date",
        header: "Invoice Date",
        render: (value: string) => new Date(value).toLocaleDateString("en-GB"),
      },
      {
        key: "due_date",
        header: "Due Date",
        render: (value: string) => new Date(value).toLocaleDateString("en-GB"),
      },
      {
        key: "display_status",
        header: "Status",
        render: (value: string) => getStatusBadge(value),
        truncate: false,
      },
      {
        key: "actions",
        header: "Actions",
        render: (_value: any, row: Invoice) => (
          <div className="relative flex justify-center">
            <button
              type="button"
              className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId((prev) =>
                  prev === row.invoice_id ? null : row.invoice_id,
                );
              }}
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            {openMenuId === row.invoice_id && (
              <div
                className="absolute right-0 top-9 z-10 min-w-32 rounded-md border border-gray-200 bg-white py-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => {
                    setOpenMenuId(null);
                    handleViewInvoice(row.invoice_id);
                  }}
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => {
                    setOpenMenuId(null);
                    handleEditInvoice(row.invoice_id);
                  }}
                >
                  <Pencil className="w-4 h-4" />
                  Edit
                </button>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => handleDeleteInvoice(row.invoice_id)}
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
    [
      clientMap,
      handleDeleteInvoice,
      handleEditInvoice,
      handleViewInvoice,
      openMenuId,
    ],
  );

  // Format values for metric cards.
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k`;
    }
    return amount.toLocaleString();
  };

  if (isLoading) {
    // Consistent loading experience across finance pages.
    return <SkeletonLoading />;
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-red-500 mb-4">
          {(error as any)?.response?.data?.message || "Failed to load invoices"}
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-primary text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col gap-6 overflow-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoice</h1>
          <p className="text-sm text-gray-500">Invoice and payment tracking</p>
        </div>
        <div className="flex items-center gap-4">
          <Button buttonType="add" onClick={handleAddInvoice}>
            Add Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          heading="Total Invoices"
          amount={invoiceStats.totalInvoices.toString()}
          currency="Invoices"
          icons={<FaFileInvoice />}
          cardStyle={{
            background: "linear-gradient(135deg, #4f46a1 0%, #2f71b7 100%)",
          }}
          cardClassName="min-h-[120px]"
          headingClassName="text-white/90"
          amountClassName="text-white text-4xl font-semibold"
          currencyClassName="text-white/80 text-sm"
          iconBackgroundColor="#ffffff"
          iconClassName="text-gray-900 text-lg"
        />

        <Card
          heading="Pending"
          amount={invoiceStats.pending.toString()}
          currency="Invoices"
          icons={<FaClock className="text-white text-sm" />}
        />

        <Card
          heading="Partially Paid"
          amount={invoiceStats.partiallyPaid.toString()}
          currency="Invoices"
          icons={<FaMoneyBillWave className="text-white text-sm" />}
        />

        <Card
          heading="Total Amount"
          amount={formatCurrency(invoiceStats.totalAmount)}
          currency="XAF"
          icons={<FaDollarSign className="text-white text-sm" />}
        />
      </div>

      <div className="bg-white p-6 rounded-xl ">
        <h3 className="text-lg font-semibold mb-4">
          Invoice vs Collection Trend
        </h3>
        <div className="h-80">
          {hasTrendData ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <ChartSkeleton bodyClassName="h-64" />
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl ">
        <ReusableTable
          columns={invoiceColumns}
          data={invoiceTableData}
          heading="Invoices And Payments"
          showToolbar
          showHeading
          showSearch
          showFilter
          filterKey="display_status"
          filterOptions={[
            { key: "status", value: "PENDING", label: "Pending" },
            { key: "status", value: "SENT", label: "Sent" },
            { key: "status", value: "PAID", label: "Paid" },
            { key: "status", value: "PARTIALLY_PAID", label: "Partially Paid" },
            { key: "status", value: "OVERDUE", label: "Overdue" },
            { key: "status", value: "CANCELLED", label: "Cancelled" },
          ]}
          searchKeys={["invoice_number", "client_name", "display_status"]}
          itemsPerPage={Math.max(1, invoices.length)}
        />
      </div>

      <AlertDialog
        open={deleteModalOpen}
        onOpenChange={(open) => {
          if (!open) cancelDelete();
        }}
      >
        <AlertDialogContent onOverlayClick={cancelDelete}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <button
              onClick={cancelDelete}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={isDeletingInvoice}
              className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              {isDeletingInvoice ? 'Deleting...' : 'Delete'}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
