import React, { useEffect, useState } from "react";
import ReusableTable from "../../../../components/other/ReusableTable/ReusableTable";
import { createLeaveColumns } from "../../../../components/Columns/LeaveColumns";

export const ApprovedLeaves: React.FC<any> = ({ employees }) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-2xl py-4 px-2">
      <ReusableTable
        columns={createLeaveColumns({
          openMenuId,
          onToggleMenu: setOpenMenuId,
          onView: (id) => {},
          onEdit: (id) => {},
          onDelete: (id) => {},
        })}
        data={employees}
        searchKeys={["name", "employeeId", "department", "role"]}
        filterKey="status"
        filterOptions={[
          { key: "active", value: "Active", label: "Active" },
          { key: "on-leave", value: "On Leave", label: "On Leave" },
        ]}
        heading="Approved Leaves"
      />
    </div>
  );
};

export default ApprovedLeaves;
