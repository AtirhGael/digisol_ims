import React, { useEffect, useState } from "react";
import { employeeData } from "../../../../data/employeeData";
import type { Employee } from "../../../../Types/Types";
import ReusableTable from "../../../../components/other/ReusableTable/ReusableTable";
import { EmployeeColumns } from "../../../../components/Columns/Employee";

const statusStyles: Record<string, string> = {
  Active: "bg-green-100 text-green-700",
  "On Leave": "bg-yellow-100 text-yellow-700",
};

interface EmployeeTableProps {
  selected: string[];
  onSelect: (id: string) => void;
  onSelectAll: () => void;
  selectAll: boolean;
  onView: (id: string) => void;
  EmployeeColumns: typeof EmployeeColumns;
}

// table heads
// const tableHeaders = [
//   { label: "Employee Name", key: "name" },
//   { label: "Employee ID", key: "employeeId" },
//   { label: "Department", key: "department" },
//   { label: "Role", key: "role" },
//   { label: "Status", key: "status" },
//   { label: "Hire Date", key: "hireDate" },
// ];

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  selected,
  onSelect,
  onSelectAll,
  selectAll,
  onView,
  EmployeeColumns,
}) => {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleToggleMenu = (id: number | null) => {
    setOpenMenuId(id);
  };

  return (
    <>
      <ReusableTable
        heading={"Employee Table"}
        columns={EmployeeColumns(openMenuId, handleToggleMenu)}
        data={employeeData}
      />
    </>
  );
};

export default EmployeeTable;
