import React from "react";

type Props = {
  open: boolean;
  mode: "approve" | "reject" | null;
  onClose: () => void;
  onConfirm: (comment?: string) => void;
};

export const LeaveActionsModal: React.FC<Props> = ({
  open,
  mode,
  onClose,
  onConfirm,
}) => {
  const [comment, setComment] = React.useState("");

  React.useEffect(() => {
    if (!open) setComment("");
  }, [open]);

  if (!open || !mode) return null;

  const isReject = mode === "reject";

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
              <div className="font-medium">John Anderson</div>
              <div className="text-xs text-gray-500">Engineering</div>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-700">
            Reason: Family vacation during holiday season
          </p>
        </div>

        <div className="mb-4 p-4 rounded-lg bg-blue-50 text-sm text-blue-700">
          Current Leave Balance — Annual: 18 days · Sick: 8 days · Personal: 4
          days
        </div>
        <div className="mb-4 p-4 rounded-lg bg-yellow-50 text-sm text-yellow-700">
          Team Impact — 2 other team members are on leave during this period
        </div>

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
            className="px-6 py-2 rounded-md border border-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(comment)}
            className={`px-6 py-2 rounded-md text-white ${isReject ? "bg-red-600" : "bg-green-600"}`}
          >
            {isReject ? "Reject Request" : "Approve Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveActionsModal;
