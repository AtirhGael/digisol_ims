import React from "react";
import { Button } from "../../../../components/ui/button";
import { LuTriangleAlert } from "react-icons/lu";

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  departmentName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  isOpen,
  departmentName,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-4 transform transition-all">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <LuTriangleAlert className="w-5 h-5 text-red-600" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Delete Department
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete the <strong>"{departmentName}"</strong> department? 
              This action cannot be undone and may affect employees assigned to this department.
            </p>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete Department"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteDialog;