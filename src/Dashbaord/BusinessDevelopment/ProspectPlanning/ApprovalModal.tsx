import React, { useState } from "react";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";
import { useUpdate } from "../../../Hooks/UseUpdateHook";
import { useUserStore } from "../../../Store/UserStore";

interface ApprovalModalProps {
  prospection: {
    prospection_id: string;
    title: string;
    description?: string;
    location_city: string;
    planned_start_date: string;
    planned_end_date: string;
    budget_requested: number;
    status: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  prospection,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [rejectionReason, setRejectionReason] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const { updateData } = useUpdate();
  const { user } = useUserStore();

  // Check if user can approve (super admin or manager only)
  const canApprove =
    user?.email?.includes("admin") || user?.email?.includes("manager") || false;

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      
      const result = await updateData(
        `/business-development/prospections/${prospection.prospection_id}/approve`,
        {},
      );
      
      onSuccess?.();
      onClose();
    } catch (error) {
      
      toast.error("Failed to approve prospection. Please try again.", {
        duration: 4000,
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsRejecting(true);
      
      const result = await updateData(
        `/business-development/prospections/${prospection.prospection_id}/reject`,
        {
          reason: rejectionReason,
        },
      );
      
      onSuccess?.();
      onClose();
    } catch (error) {
      
      toast.error("Failed to reject prospection. Please try again.", {
        duration: 4000,
      });
    } finally {
      setIsRejecting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      {/* Modal content */}
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Prospection Approval
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle size={24} />
          </button>
        </div>

        {/* Prospection Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-800 mb-3">
            {prospection.title}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Location:</span>
              <p className="font-medium">{prospection.location_city}</p>
            </div>
            <div>
              <span className="text-gray-500">Budget Requested:</span>
              <p className="font-medium">
                {(prospection.budget_requested || 0).toLocaleString()} XAF
              </p>
            </div>
            <div>
              <span className="text-gray-500">Start Date:</span>
              <p className="font-medium">
                {new Date(prospection.planned_start_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-gray-500">End Date:</span>
              <p className="font-medium">
                {new Date(prospection.planned_end_date).toLocaleDateString()}
              </p>
            </div>
          </div>

          {prospection.description && (
            <div className="mt-4">
              <span className="text-gray-500">Description:</span>
              <p className="text-sm text-gray-800 mt-1">
                {prospection.description}
              </p>
            </div>
          )}
        </div>

        {!canApprove && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Only Super Admins and Managers can approve prospections.
            </p>
          </div>
        )}

        {/* Rejection Reason (appears when user clicks reject) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rejection Reason (if rejecting):
          </label>
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none h-20"
            placeholder="Provide a reason if you plan to reject this prospection..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          {canApprove && (
            <>
              <button
                onClick={handleApprove}
                disabled={isApproving || isRejecting}
                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors min-w-30"
              >
                <CheckCircle size={18} className="mr-2 shrink-0" />
                <span className="truncate">
                  {isApproving ? "Approving..." : "Approve"}
                </span>
              </button>

              <button
                onClick={handleReject}
                disabled={isApproving || isRejecting || !rejectionReason.trim()}
                className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors min-w-30"
              >
                <XCircle size={18} className="mr-2 shrink-0" />
                <span className="truncate">
                  {isRejecting ? "Rejecting..." : "Reject"}
                </span>
              </button>
            </>
          )}

          <button
            onClick={onClose}
            disabled={isApproving || isRejecting}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-colors min-w-20"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
