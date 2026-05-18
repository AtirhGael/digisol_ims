import React from "react";

type LeaveRequestInfo = {
  name: string;
  role?: string;
  department?: string;
  reason?: string;
};

type Props = {
  open: boolean;
  mode: "approve" | "reject" | null;
  isSubmitting?: boolean;
  request?: LeaveRequestInfo | null;
  deptOnLeaveCount?: number;
  onClose: () => void;
  onConfirm: (comment?: string) => void;
};

export const LeaveActionsModal: React.FC<Props> = ({
  open,
  mode,
  isSubmitting = false,
  request,
  deptOnLeaveCount = 0,
  onClose,
  onConfirm,
}) => {
  const [comment, setComment] = React.useState("");

  React.useEffect(() => {
    if (!open) setComment("");
  }, [open]);

  if (!open || !mode) return null;

  const isReject = mode === "reject";
  const isBlocked = !isReject && deptOnLeaveCount >= 4;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isReject ? "Reject Leave Request" : "Approve Leave Request"}
        </h3>

        <div className="mb-4 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div>
              <div className="font-medium">{request?.name ?? "—"}</div>
              <div className="text-xs text-gray-500">
                {request?.role ?? ""}
                {request?.department ? ` · ${request.department}` : ""}
              </div>
            </div>
          </div>
          {request?.reason && (
            <p className="mt-3 text-sm text-gray-700">
              <span className="font-medium">Reason:</span> {request.reason}
            </p>
          )}
        </div>

        {isBlocked && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
            ⚠️ Cannot approve: {deptOnLeaveCount} employee{deptOnLeaveCount !== 1 ? "s" : ""} from{" "}
            {request?.department ?? "this department"} are already on approved leave. It is not
            possible to approve this request at this time.
          </div>
        )}

        {!isBlocked && deptOnLeaveCount > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700">
            ⚠️ {deptOnLeaveCount} other team member{deptOnLeaveCount !== 1 ? "s are" : " is"} on
            leave during this period.
          </div>
        )}

        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comments/Feedback{" "}
          {isReject ? <span className="text-red-500">*</span> : null}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            isReject
              ? "Please provide reason for rejection..."
              : "Optional feedback..."
          }
          className="w-full border border-gray-300 rounded-md p-3 text-sm mb-4 h-28"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2 rounded-md border border-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(comment)}
            disabled={isSubmitting || isBlocked}
            title={isBlocked ? "Cannot approve: too many team members on leave" : undefined}
            className={`px-6 py-2 rounded-md text-white disabled:cursor-not-allowed disabled:opacity-60 ${isReject ? "bg-red-600" : "bg-green-600"}`}
          >
            {isSubmitting ? "Processing..." : isReject ? "Reject Request" : "Approve Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveActionsModal;
