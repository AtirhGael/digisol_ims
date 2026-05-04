import React from "react";
import { Check, X } from "lucide-react";

type Employee = any;

export const LeaveTable: React.FC<{
  employees: Employee[];
  selectedEmployees: string[];
  selectAll: boolean;
  onToggleEmployee: (id: string) => void;
  onToggleSelectAll: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  showActions?: boolean;
}> = ({
  employees,
  selectedEmployees,
  selectAll,
  onToggleEmployee,
  onToggleSelectAll,
  onApprove,
  onReject,
  showActions = true,
}) => {
  return (
    <div className="overflow-x-auto -mx-3 sm:mx-0">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left py-3 px-2 sm:px-4 text-xs font-semibold text-gray-700 whitespace-nowrap">
              <input
                type="checkbox"
                aria-label="Select all employees"
                checked={selectAll}
                onChange={onToggleSelectAll}
                className="w-3 h-3 sm:w-4 sm:h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs font-semibold text-gray-700 whitespace-nowrap">
              Employee Name
            </th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs font-semibold text-gray-700 whitespace-nowrap">
              Employee ID
            </th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs font-semibold text-gray-700 whitespace-nowrap">
              Department
            </th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs font-semibold text-gray-700 whitespace-nowrap">
              Role
            </th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs font-semibold text-gray-700 whitespace-nowrap">
              Status
            </th>
            <th className="text-left py-3 px-2 sm:px-4 text-xs font-semibold text-gray-700 whitespace-nowrap">
              Hire Date
            </th>
            {showActions && (
              <th className="text-left py-3 px-2 sm:px-4 text-xs font-semibold text-gray-700 whitespace-nowrap">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white">
          {employees.map((emp) => (
            <tr
              key={emp.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="py-3 sm:py-4 px-2 sm:px-4">
                <input
                  type="checkbox"
                  aria-label={`Select ${emp.name}`}
                  checked={selectedEmployees.includes(emp.id)}
                  onChange={() => onToggleEmployee(emp.id)}
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </td>
              <td className="py-3 sm:py-4 px-2 sm:px-4">
                <span className="text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">
                  {emp.name}
                </span>
              </td>
              <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                {emp.employeeId || emp.id}
              </td>
              <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                {emp.department}
              </td>
              <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                {emp.role}
              </td>
              <td className="py-3 sm:py-4 px-2 sm:px-4">
                <span
                  className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap`}
                >
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                  {emp.status}
                </span>
              </td>
              <td className="py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">
                {emp.hireDate}
              </td>
              {showActions && (
                <td className="py-3 sm:py-4 px-2 sm:px-4">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => onApprove && onApprove(emp.id)}
                      className="p-1.5 sm:p-2 text-white bg-green-500 hover:bg-green-600 rounded-md transition-colors cursor-pointer"
                      title="Approve"
                    >
                      <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => onReject && onReject(emp.id)}
                      className="p-1.5 sm:p-2 text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors cursor-pointer"
                      title="Reject"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaveTable;
