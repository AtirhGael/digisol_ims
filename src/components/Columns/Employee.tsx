import { MdOutlineMoreHoriz } from "react-icons/md";
import { GrFormView } from "react-icons/gr";
import { FaTrash } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import React from "react";

interface ActionMenuProps {
  rowId: string;
  openMenuId: string | null;
  onToggle: (id: string | null) => void;
  onDelete: () => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  rowId,
  openMenuId,
  onToggle,
  onDelete,
}) => {
  const isOpen = openMenuId === rowId;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(isOpen ? null : rowId);
  };

  return (
    <div className="flex justify-center relative">
      <div>
        <MdOutlineMoreHoriz
          onClick={handleToggle}
          className="text-gray-500 cursor-pointer rounded-md text-2xl"
        />
        {isOpen && (
          <div className="py-2 px-1 bg-white shadow-lg absolute top-4 right-5 flex flex-col gap-1 rounded-lg z-10 min-w-120px">
            <button
              type="button"
              className="hover:bg-gray-200/50 px-3 py-1 rounded-md flex items-center gap-2"
              onClick={() => onToggle(null)}
            >
              <GrFormView className="w-4 h-4" /> View
            </button>
            <button
              type="button"
              className="hover:bg-gray-200/50 px-3 py-1 rounded-md flex items-center gap-2"
              onClick={() => onToggle(null)}
            >
              <FaEdit className="w-4 h-4" /> Edit
            </button>
            <button
              type="button"
              className="hover:bg-gray-200/50 px-3 py-1 rounded-md flex items-center gap-2 text-red-600"
              onClick={() => {
                onToggle(null);
                onDelete();
              }}
            >
              <FaTrash className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Function to generate columns with state management
export const EmployeeColumns = (
  openMenuId: string | null,
  onToggleMenu: (id: string | null) => void,
  onDeleteEmployee: (id: string) => void,
) => [
  { header: "Employee Name", key: "name" },
  { header: "Employee ID", key: "employeeId" },
  { header: "Department", key: "department" },
  { header: "Role", key: "role" },
  {
    header: "Status",
    key: "status",
    render: (status: any) => (
      <span
        className={`px-2 py-1 rounded-full text-xs ${
          status === "Active"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {status}
      </span>
    ),
  },
  { header: "Hire Date", key: "hireDate" },
  {
    header: "Action",
    key: "id",
    render: (value: any, row: any) => (
      <ActionMenu
        rowId={row.id}
        openMenuId={openMenuId}
        onToggle={onToggleMenu}
        onDelete={() => onDeleteEmployee(row.id)}
      />
    ),
  },
];
