import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import ReusableTable from "../../../../components/other/ReusableTable/ReusableTable";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";
import { createLeaveColumns } from "../../../../components/Columns/LeaveColumns";
import type { LeaveStatus } from "../../../../components/Columns/LeaveColumns";
import { useDeleteHook } from "../../../../Hooks/UseDeleteHook";

type LeaveEmployee = {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  role: string;
  status: LeaveStatus;
  hireDate: string;
  approvalStatus?: string;
  leaveType?: string;
  startDate?: string;
  endDate?: string;
  rejectionReason?: string;
  isFallback?: boolean;
};

const statusFilterOptions = [
  { key: "present", value: "Present", label: "Present" },
  { key: "absent", value: "Absent", label: "Absent" },
  { key: "late", value: "Late", label: "Late" },
  { key: "on-leave", value: "On Leave", label: "On Leave" },
  { key: "no-record", value: "No Record", label: "No Record" },
];

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-gray-100 bg-white p-4">
    <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p>
    <p className="mt-1 text-sm font-medium text-gray-900">{value}</p>
  </div>
);

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  return date.toISOString().slice(0, 10);
};

const rejectedLeaveColumns = ({
  openMenuId,
  onToggleMenu,
  onView,
  onEdit,
  onDelete,
}: {
  openMenuId: string | null;
  onToggleMenu: (id: string | null) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) => [
  ...createLeaveColumns({
    openMenuId,
    onToggleMenu,
    onView,
    onEdit,
    onDelete,
    showEdit: true,
  }).filter((column) => !["status", "hireDate", "id"].includes(column.key)),
  {
    key: "leaveType",
    header: "Leave Type",
    render: (value: string) => <span className="text-sm text-gray-600">{value || "-"}</span>,
  },
  {
    key: "startDate",
    header: "Period",
    render: (_value: string, row: LeaveEmployee) => (
      <span className="text-sm text-gray-600 whitespace-nowrap">
        {formatDate(row.startDate)} - {formatDate(row.endDate)}
      </span>
    ),
  },
  {
    key: "rejectionReason",
    header: "Rejection Reason",
    render: (value: string) => (
      <span className="block max-w-55 truncate text-sm text-gray-600" title={value || "-"}>
        {value || "-"}
      </span>
    ),
  },
  createLeaveColumns({
    openMenuId,
    onToggleMenu,
    onView,
    onEdit,
    onDelete,
    showEdit: true,
  }).at(-1)!,
];

export const RejectedLeaves: React.FC<{ employees: LeaveEmployee[] }> = ({ employees }) => {
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewingRecord, setViewingRecord] = useState<LeaveEmployee | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<LeaveEmployee | null>(null);
  const deleteLeaveRequest = useDeleteHook("/leaves/request", ["hr-leaves"]);
  const tableData = employees;

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const selectedRecord = tableData.find((record) => record.id === viewingRecord?.id) ?? viewingRecord;

  const handleDelete = (id: string) => {
    const record = tableData.find((item) => item.id === id);
    if (!record) return;

    if (record.isFallback) {
      toast.info("This is sample rejected leave data.");
      setOpenMenuId(null);
      return;
    }

    setRecordToDelete(record);
    setDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    try {
      await deleteLeaveRequest.mutateAsync(recordToDelete.id);
      setDeleteModalOpen(false);
      setRecordToDelete(null);
      if (viewingRecord?.id === recordToDelete.id) {
        setViewingRecord(null);
      }
      toast.success("Rejected leave deleted successfully.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete rejected leave.");
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setRecordToDelete(null);
  };

  if (selectedRecord) {
    return (
      <div className="rounded-2xl bg-white px-6 py-5">
        <button
          onClick={() => setViewingRecord(null)}
          className="mb-5 flex items-center gap-2 text-sm text-gray-500 hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Rejected Leaves
        </button>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{selectedRecord.name}</h2>
            <p className="text-sm text-gray-500">Rejected leave employee details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DetailRow label="Employee ID" value={selectedRecord.employeeId} />
          <DetailRow label="Department" value={selectedRecord.department} />
          <DetailRow label="Role" value={selectedRecord.role} />
          <DetailRow label="Status" value={selectedRecord.status} />
          <DetailRow label="Hire Date" value={selectedRecord.hireDate} />
          <DetailRow label="Approval Status" value={selectedRecord.approvalStatus || "Rejected"} />
          <DetailRow label="Leave Type" value={selectedRecord.leaveType || "-"} />
          <DetailRow
            label="Leave Period"
            value={`${formatDate(selectedRecord.startDate)} - ${formatDate(selectedRecord.endDate)}`}
          />
          <DetailRow label="Rejection Reason" value={selectedRecord.rejectionReason || "No reason provided"} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl py-4 px-2">
      <ReusableTable
        columns={rejectedLeaveColumns({
          openMenuId,
          onToggleMenu: setOpenMenuId,
          onView: (id) => {
            const record = tableData.find((item) => item.id === id);
            if (record) setViewingRecord(record);
            setOpenMenuId(null);
          },
          onEdit: (id) => {
            navigate("/dashboard/leavemanagement/request", { state: { editId: id } });
            setOpenMenuId(null);
          },
          onDelete: handleDelete,
        })}
        data={tableData}
        searchKeys={["name", "employeeId", "department", "role", "leaveType", "rejectionReason"]}
        filterKey="status"
        filterOptions={statusFilterOptions}
        heading="Rejected Leaves"
      />

      <AlertDialog
        open={deleteModalOpen}
        onOpenChange={(open) => {
          if (!open) cancelDelete();
        }}
      >
        <AlertDialogContent onOverlayClick={cancelDelete}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rejected Leave</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {recordToDelete?.name ?? "this rejected leave"}? This action cannot be undone.
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
              disabled={deleteLeaveRequest.isLoading}
              className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              {deleteLeaveRequest.isLoading ? "Deleting..." : "Delete"}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RejectedLeaves;
