import React from "react";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Props {
  createdEmployeeResult: any;
  onAddAnother: () => void;
  onGoToDashboard: () => void;
}

export const EmployeeSuccessView: React.FC<Props> = ({
  createdEmployeeResult,
  onAddAnother,
  onGoToDashboard,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Employee Successfully Created!
        </h2>
        <p className="text-sm text-gray-600 mb-1">
          Employee ID:{" "}
          {createdEmployeeResult?.employee?.employee_code || "-"}
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Temporary password has been sent to{" "}
          {createdEmployeeResult?.credentialsSentTo ||
            createdEmployeeResult?.employee?.user_info?.email ||
            "the employee email"}
        </p>
        <div className="space-y-3">
          <button
            onClick={() =>
              createdEmployeeResult?.employee?.employee_id
                ? navigate(
                    `/dashboard/employees/${createdEmployeeResult.employee.employee_id}/edit`
                  )
                : onGoToDashboard()
            }
            className="w-full bg-primary hover:bg-[#35345f] text-white rounded-lg px-6 py-3 font-medium"
          >
            View Employee Profile
          </button>
          <button
            onClick={onAddAnother}
            className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg px-6 py-3 font-medium"
          >
            Add Another Employee
          </button>
          <button
            onClick={onGoToDashboard}
            className="w-full text-gray-600 hover:text-gray-900 py-2 font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
