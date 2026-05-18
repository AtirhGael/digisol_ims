import React from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import ReusableTable from "../../../../components/other/ReusableTable/ReusableTable";
import { createPendingLeaveColumns } from "../../../../components/Columns/LeaveColumns";
import LeaveActionsModal from "../components/leaveActionsModal";

const statusFilterOptions = [
  { key: "present", value: "Present", label: "Present" },
  { key: "absent", value: "Absent", label: "Absent" },
  { key: "late", value: "Late", label: "Late" },
  { key: "on-leave", value: "On Leave", label: "On Leave" },
  { key: "no-record", value: "No Record", label: "No Record" },
];

export const PendingRequests: React.FC<any> = ({
  employees,
  processingRequestId,
  onApproveRequest,
  onRejectRequest,
  approvedRequests = [],
}) => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"approve" | "reject" | null>(
    null,
  );
  const [currentId, setCurrentId] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const currentRequest = employees.find((e: any) => e.id === currentId) ?? null;

  const deptOnLeaveCount = currentRequest
    ? approvedRequests.filter(
        (r: any) =>
          r.department === currentRequest.department &&
          r.id !== currentRequest.id
      ).length
    : 0;

  const handleApprove = (id: string) => {
    setCurrentId(id);
    setModalMode("approve");
    setModalOpen(true);
  };

  const handleReject = (id: string) => {
    setCurrentId(id);
    setModalMode("reject");
    setModalOpen(true);
  };

  return (
    <div className="bg-white rounded-2xl py-4 px-2">
      <ReusableTable
        columns={createPendingLeaveColumns({
          onApprove: handleApprove,
          onReject: handleReject,
          onEdit: (id) => navigate("/dashboard/leavemanagement/request", { state: { editId: id } }),
        })}
        data={employees}
        searchKeys={["name", "employeeId", "department", "role"]}
        filterKey="status"
        filterOptions={statusFilterOptions}
        heading="Pending Requests"
      />

      <LeaveActionsModal
        open={modalOpen}
        mode={modalMode}
        isSubmitting={isSubmitting || processingRequestId === currentId}
        request={currentRequest ? {
          name: currentRequest.name,
          role: currentRequest.role,
          department: currentRequest.department,
          reason: currentRequest.reason,
        } : null}
        deptOnLeaveCount={deptOnLeaveCount}
        onClose={() => setModalOpen(false)}
        onConfirm={async (comment) => {
          if (!currentId || !modalMode) return;

          if (modalMode === "reject" && !comment?.trim()) {
            toast.error("Please provide a reason for rejecting this leave request.");
            return;
          }

          try {
            setIsSubmitting(true);
            if (modalMode === "approve" && onApproveRequest) {
              await onApproveRequest(currentId, comment);
            }

            if (modalMode === "reject" && onRejectRequest) {
              await onRejectRequest(currentId, comment);
            }

            setModalOpen(false);
          } finally {
            setIsSubmitting(false);
          }
        }}
      />
    </div>
  );
};

export default PendingRequests;
