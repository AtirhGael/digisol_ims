import React, { useEffect, useState } from "react";
import ReusableTable from "../../../../components/other/ReusableTable/ReusableTable";
import { createCompletedEvaluationColumns } from "../../../../components/Columns/PerformanceColumns";
import type { CompletedEvaluation } from "../data";

interface CompletedEvaluationsProps {
  data: CompletedEvaluation[];
  onView: (id: string) => void;
}

export const CompletedEvaluations: React.FC<CompletedEvaluationsProps> = ({ data, onView }) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleDownload = (id: string) => {
    // Download evaluation (future)
  };

  const handleDelete = (id: string) => {
    // Delete evaluation (future)
  };

  return (
    <ReusableTable
      heading="Completed Evaluations"
      columns={createCompletedEvaluationColumns({
        openMenuId,
        onToggleMenu: setOpenMenuId,
        onView,
        onDownload: handleDownload,
        onDelete: handleDelete,
      })}
      data={data}
      filterKey="status"
      filterOptions={[
        { key: "reviewed", value: "Reviewed", label: "Reviewed" },
        { key: "completed", value: "Completed", label: "Completed" },
      ]}
      searchKeys={["name", "department", "position", "evaluator"]}
    />
  );
};
