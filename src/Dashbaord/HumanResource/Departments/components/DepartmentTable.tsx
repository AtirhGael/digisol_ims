import React from "react";
import { useNavigate } from "react-router-dom";
import ReusableTable from "../../../../components/other/ReusableTable/ReusableTable";
import type { Department } from "../types";
import { createDepartmentColumns } from "../../../../components/Columns/DepartmentColumn";

interface DepartmentTableProps {
  departments: Department[];
  onView: (department: Department) => void;
  onDelete: (departmentId: string) => void;
  loading?: boolean;
  totalPages?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

const DepartmentTable: React.FC<DepartmentTableProps> = ({
  departments,
  onView,
  onDelete,
  loading = false,
  totalPages,
  currentPage,
  onPageChange,
}) => {
  const navigate = useNavigate();

  const handleViewClick = (department: Department) => {
    navigate(`/dashboard/departments/${department.department_id}`);
  };

  const columns = createDepartmentColumns({
    onViewDepartment: handleViewClick,
    onDeleteDepartment: onDelete,
  });

  return (
    <ReusableTable
      columns={columns}
      data={departments}
      heading="Department List"
      searchKeys={["name", "code"]}
      itemsPerPage={10}
      serverPagination={!!onPageChange}
      totalPages={totalPages}
      externalCurrentPage={currentPage}
      onPageChange={onPageChange}
    />
  );
};

export default DepartmentTable;
