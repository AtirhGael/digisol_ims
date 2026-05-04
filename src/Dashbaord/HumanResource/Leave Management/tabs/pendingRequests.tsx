// This file was renamed from pendinRequests.tsx for spelling consistency.
// Please copy the contents from pendinRequests.tsx here.

// ...existing code from pendinRequests.tsx...
import React from "react";
import { toast } from "sonner";
import ReusableTable from "../../../../components/other/ReusableTable/ReusableTable";
import { createPendingLeaveColumns } from "../../../../components/Columns/LeaveColumns";
import LeaveActionsModal from "../components/leaveActionsModal";

export const PendingRequests: React.FC<any> = ({ employees }) => {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"approve" | "reject" | null>(
    null,
  );
  const [currentId, setCurrentId] = React.useState<string | null>(null);

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
        columns={createPendingLeaveColumns({ onApprove: handleApprove, onReject: handleReject })}
        data={employees}
        searchKeys={["name", "employeeId", "department", "role"]}
        filterKey="status"
        filterOptions={[
          { key: "active", value: "Active", label: "Active" },
          { key: "on-leave", value: "On Leave", label: "On Leave" },
        ]}
        heading="Pending Requests"
      />

      <LeaveActionsModal
        open={modalOpen}
        mode={modalMode}
        onClose={() => setModalOpen(false)}
        onConfirm={(comment) => {
          setModalOpen(false);
          toast.success(
            `${modalMode === "approve" ? "Approved" : "Rejected"} ${currentId} — ${comment || ""}`,
            { duration: 4000 },
          );
        }}
      />
    </div>
  );
};

export default PendingRequests;
