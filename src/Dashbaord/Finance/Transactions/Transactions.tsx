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
import { MoreVertical, Eye, Trash2 } from "lucide-react";
import {
  FaMoneyBillWave,
  FaArrowTrendUp,
  FaArrowTrendDown,
  FaClipboardCheck,
  FaDollarSign,
} from "react-icons/fa6";
import { type Transaction, voidTransaction } from "../financeApi";
import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { toast } from "sonner";
import useFetchHook from "../../../Hooks/UseFetchHook";

interface RecentTransaction {
  id: string;
  title: string;
  date: string;
  amount: string;
  type: "income" | "expense";
}

interface AccountPayable {
  vendor: string;
  poNumber: string;
  amount: string;
  dueDate: string;
  status: "Approve" | "Approved";
}

export const Transactions = () => {
  // Navigation + paging state.
  const navigate = useNavigate();
  const roles = useUserStore((state) => state.roles);
  const permissions = useUserStore((state) => state.permissions);

  const checkPermission = (action: string) => {
    if (roles.includes("SUPER_ADMIN")) return true;
    return permissions.some(
      (p) =>
        p.module === "finance" &&
        p.resource_type === "transactions" &&
        p.action === action,
    );
  };
  const [currentPage, setCurrentPage] = useState(1);
  // Data state (local copy allows optimistic updates for deletes).
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState("");

  const endpoint = `/finance/transactions?page=${currentPage}&page_size=10`;
  const {
    data: transactionsResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useFetchHook<{
    data: Transaction[];
    pagination?: { total_count: number; total_pages: number };
  }>(endpoint, "finance-transactions");

  useEffect(() => {
    if (transactionsResponse?.data) {
      setTransactions(transactionsResponse.data);
    }
  }, [transactionsResponse?.data]);

  const meta = useMemo(() => {
    const pagination = transactionsResponse?.pagination;
    return {
      total: pagination?.total_count ?? transactions.length,
      totalPages: pagination?.total_pages ?? 1,
    };
  }, [transactionsResponse?.pagination, transactions.length]);

  // Aggregate stats derived from the fetched transactions.
  const stats = {
    totalExpense: 0,
    totalIncome: 0,
    pending: 0,
    completed: 0,
  };

  // Compute summary stats for the KPI cards.
  transactions.forEach((t) => {
    if (t.transaction_type === "Expense") {
      stats.totalExpense += Number(t.amount);
    } else {
      stats.totalIncome += Number(t.amount);
    }
    if (["PENDING", "RECORDED", "VERIFIED"].includes(t.status)) stats.pending++;
    if (["COMPLETED", "POSTED"].includes(t.status)) stats.completed++;
  });

  // Recent transactions list (top 4 entries).
  const recentTransactions: RecentTransaction[] = transactions
    .slice(0, 4)
    .map((t) => ({
      id: t.transaction_id,
      title:
        t.description?.substring(0, 40) ||
        `${t.transaction_type} - ${t.category}`,
      date: new Date(t.transaction_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      amount: `${t.transaction_type === "Income" ? "" : "--"}${Number(t.amount).toLocaleString()}`,
      type: t.transaction_type === "Income" ? "income" : "expense",
    }));

  // Accounts payable list from pending transactions.
  const accountsPayable: AccountPayable[] = transactions
    .slice(0, 3)
    .map((t, index) => ({
      vendor: t.category || "Unknown",
      poNumber: t.reference_number || t.transaction_number,
      amount: `${t.currency || "XAF"} ${Number(t.amount).toLocaleString()}`,
      dueDate: new Date(t.transaction_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      status: index === 0 ? "Approved" : "Approve",
    }));

  // Route to add transaction.
  const handleAddTransaction = () => {
    if (!checkPermission("CREATE")) {
      navigate("/dashboard/unauthorized");
      return;
    }
    navigate("/dashboard/transactions/add");
  };

  // Route to transaction detail page.
  const handleViewTransaction = (transactionId: string) => {
    navigate(`/dashboard/transactions/${transactionId}`);
  };

  const handleDeleteTransaction = (transactionId: string) => {
    setDeleteId(transactionId);
    setDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    if (deleteReason.trim().length < 10) {
      toast.error("Please provide a reason of at least 10 characters.");
      return;
    }

    try {
      await voidTransaction(deleteId, deleteReason.trim());
      setTransactions((prev) =>
        prev.filter((t) => t.transaction_id !== deleteId),
      );
      toast.success("Transaction voided successfully.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to void transaction.");
    } finally {
      setDeleteModalOpen(false);
      setDeleteId(null);
      setDeleteReason("");
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setDeleteId(null);
    setDeleteReason("");
  };

  const tableColumns = useMemo(
    () => [
      {
        key: "transaction_number",
        header: "Transaction ID",
        render: (value: string) => (
          <span className="text-blue-600 font-medium">{value}</span>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        render: (_value: number, row: Transaction) => (
          <span className="text-gray-900">
            {row.currency || "XAF"} {Number(row.amount).toLocaleString()}
          </span>
        ),
      },
      { key: "category", header: "Category" },
      {
        key: "transaction_type",
        header: "Type",
        render: (value: string) => (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              value === "Expense"
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {value}
          </span>
        ),
        truncate: false,
      },
      {
        key: "transaction_date",
        header: "Date",
        render: (value: string) => new Date(value).toLocaleDateString("en-GB"),
      },
      {
        key: "status",
        header: "Status",
        render: (value: string) => (
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              ["PENDING", "RECORDED", "VERIFIED"].includes(value)
                ? "bg-yellow-100 text-yellow-700"
                : value === "VOIDED"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
            }`}
          >
            {value}
          </span>
        ),
        truncate: false,
      },
      {
        key: "actions",
        header: "Actions",
        render: (_value: any, row: Transaction) => (
          <div className="relative flex justify-center">
            <button
              type="button"
              className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId((prev) =>
                  prev === row.transaction_id ? null : row.transaction_id,
                );
              }}
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            {openMenuId === row.transaction_id && (
              <div
                className="absolute right-0 top-9 z-10 min-w-30 rounded-md border border-gray-200 bg-white py-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => {
                    setOpenMenuId(null);
                    handleViewTransaction(row.transaction_id);
                  }}
                >
                  <Eye className="w-4 h-4" />
                  View
                </button>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => handleDeleteTransaction(row.transaction_id)}
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
    [handleDeleteTransaction, handleViewTransaction, openMenuId],
  );

  // Format values for KPI cards.
  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k`;
    }
    return amount.toLocaleString();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Transactions</h1>
          <p className="text-sm text-gray-500">
            Manage and record transactions to keep track of spendings
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="primary"
            buttonType="add"
            onClick={handleAddTransaction}
            className="bg-primary text-white hover:bg-primary/90"
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {isLoading ? (
        // Consistent loading experience across finance pages.
        <SkeletonLoading />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-4">
            {(error as any)?.response?.data?.message ||
              "Failed to load transactions"}
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card
              heading="Total Expense"
              amount={formatCurrency(stats.totalExpense)}
              currency="XAF"
              icons={<FaMoneyBillWave />}
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
              heading="Total Income"
              amount={formatCurrency(stats.totalIncome)}
              currency="XAF"
              icons={<FaArrowTrendUp className="text-white text-xl" />}
            />
            <Card
              heading="Pending"
              amount={stats.pending.toString()}
              currency="Transactions"
              icons={<FaArrowTrendDown className="text-white text-xl" />}
            />
            <Card
              heading="Completed"
              amount={stats.completed.toString()}
              currency="Transactions"
              icons={<FaClipboardCheck className="text-white text-xl" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-1">
                Recent Transactions
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Latest financial activities
              </p>
              {recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {recentTransactions.map((transaction, index) => (
                    <div
                      key={index}
                      onClick={() => handleViewTransaction(transaction.id)}
                      className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${transaction.type === "income" ? "bg-green-100" : "bg-red-100"}`}
                        >
                          {transaction.type === "income" ? (
                            <FaArrowTrendUp className="text-green-600" />
                          ) : (
                            <FaArrowTrendDown className="text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {transaction.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction.date}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-semibold ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}
                      >
                        {transaction.amount}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No recent transactions
                </p>
              )}
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Accounts Payable
                  </h3>
                  <p className="text-sm text-gray-500">Vendor payments due</p>
                </div>
                <div className="p-2 rounded-md bg-gray-50">
                  <FaDollarSign className="text-lg text-gray-600" />
                </div>
              </div>
              {accountsPayable.length > 0 ? (
                <div className="space-y-3">
                  {accountsPayable.map((account, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-gray-200 p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-800">
                          {account.vendor}
                        </p>
                        <p className="text-sm text-gray-500">
                          {account.poNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          Due: {account.dueDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">
                          {account.amount}
                        </p>
                        <button
                          className={`mt-2 px-4 py-1 text-sm rounded ${
                            account.status === "Approved"
                              ? "bg-green-600 text-white"
                              : "bg-green-600 text-white hover:bg-green-500"
                          }`}
                        >
                          {account.status}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No pending payments
                </p>
              )}
            </div>
          </div>

          <div className="w-full rounded-2xl py-4 px-5 bg-white border border-gray-100">
            <ReusableTable
              columns={tableColumns}
              data={transactions}
              heading="All Transaction Records"
              showToolbar
              showHeading
              showSearch
              showFilter
              filterKey="status"
              filterOptions={[
                { key: "status", value: "PENDING", label: "Pending" },
                { key: "status", value: "COMPLETED", label: "Completed" },
              ]}
              searchKeys={[
                "transaction_number",
                "category",
                "transaction_type",
                "status",
              ]}
              serverPagination
              externalCurrentPage={currentPage}
              totalPages={meta.totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </>
      )}

      <AlertDialog
        open={deleteModalOpen}
        onOpenChange={(open) => {
          if (!open) cancelDelete();
        }}
      >
        <AlertDialogContent onOverlayClick={cancelDelete}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-2">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Reason for voiding
            </label>
            <textarea
              value={deleteReason}
              onChange={(event) => setDeleteReason(event.target.value)}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              rows={3}
              placeholder="Provide a short reason (min 10 characters)"
            />
          </div>
          <AlertDialogFooter>
            <button
              onClick={cancelDelete}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Delete
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
