import { MdOutlineMoreHoriz } from "react-icons/md";
import { Link } from "react-router-dom";
import { GrFormView } from "react-icons/gr";
import { FaTrash } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import React from "react";

interface ActionMenuProps {
  rowId: number;
  openMenuId: number | null;
  onToggle: (id: number | null) => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({
  rowId,
  openMenuId,
  onToggle,
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
            <Link
              to="#"
              className="hover:bg-gray-200/50 px-3 py-1 rounded-md flex items-center gap-2"
              onClick={() => onToggle(null)}
            >
              <GrFormView className="w-4 h-4" /> View
            </Link>
            <Link
              to="#"
              className="hover:bg-gray-200/50 px-3 py-1 rounded-md flex items-center gap-2"
              onClick={() => onToggle(null)}
            >
              <FaEdit className="w-4 h-4" /> Edit
            </Link>
            <Link
              to="#"
              className="hover:bg-gray-200/50 px-3 py-1 rounded-md flex items-center gap-2 text-red-600"
              onClick={() => onToggle(null)}
            >
              <FaTrash className="w-4 h-4" /> Delete
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

// Function to generate columns with state management
export const createBusinessColumns = (
  openMenuId: number | null,
  onToggleMenu: (id: number | null) => void,
) => [
  { header: "Name", key: "name" },
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
  {
    header: "Progress",
    key: "progress",
    render: (value: any) => (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary h-full rounded-full"
          style={{ width: `${value}%` }}
        ></div>
      </div>
    ),
  },
  {
    header: "Action",
    key: "id",
    render: (value: any, row: any) => (
      <ActionMenu
        rowId={row.id}
        openMenuId={openMenuId}
        onToggle={onToggleMenu}
      />
    ),
  },
];
