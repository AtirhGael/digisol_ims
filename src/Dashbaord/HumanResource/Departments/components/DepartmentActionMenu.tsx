import React, { useState } from "react";
import { MdOutlineMoreHoriz } from "react-icons/md";
import { GrFormView } from "react-icons/gr";
import { FaTrash } from "react-icons/fa6";
import type { Department } from "../types";

interface DepartmentActionMenuProps {
  department: Department;
  rowId: string;
  openMenuId: string | null;
  onToggle: (id: string | null) => void;
  onView: (department: Department) => void;
  onDelete: (departmentId: string) => void;
}

const DepartmentActionMenu: React.FC<DepartmentActionMenuProps> = ({
  department,
  rowId,
  openMenuId,
  onToggle,
  onView,
  onDelete,
}) => {
  const isOpen = openMenuId === rowId;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(isOpen ? null : rowId);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggle(null);
    onDelete(department.department_id);
  };

  const handleView = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggle(null);
    onView(department);
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
              onClick={handleView}
              className="hover:bg-gray-200/50 px-3 py-1 rounded-md flex items-center gap-2 w-full text-left"
            >
              <GrFormView className="w-4 h-4" /> View
            </button>
            <button
              onClick={handleDelete}
              className="hover:bg-gray-200/50 px-3 py-1 rounded-md flex items-center gap-2 text-red-600 w-full text-left"
            >
              <FaTrash className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentActionMenu;