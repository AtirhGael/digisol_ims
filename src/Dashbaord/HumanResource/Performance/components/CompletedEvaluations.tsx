import React, { useEffect, useState } from "react";
import ReusableTable from "../../../../components/other/ReusableTable/ReusableTable";
import { createCompletedEvaluationColumns } from "../../../../components/Columns/PerformanceColumns";
import type { CompletedEvaluation } from "../data";
import {
  downloadEvaluationReport,
  type EvaluationDownloadFormat,
} from "./downloadEvaluationReport";
import { DownloadFormatDialog } from "./DownloadFormatDialog";

interface CompletedEvaluationsProps {
  data: CompletedEvaluation[];
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
}

export const CompletedEvaluations: React.FC<CompletedEvaluationsProps> = ({ data, onView, onEdit }) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [downloadModalId, setDownloadModalId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleDownload = (id: string) => {
    setDownloadModalId(id);
    setOpenMenuId(null);
  };

  const downloadInFormat = (format: EvaluationDownloadFormat) => {
    if (!downloadModalId) return;

    const evaluation = data.find((item) => item.id === downloadModalId);
    if (!evaluation) return;

    downloadEvaluationReport({
      name: evaluation.name,
      department: evaluation.department,
      position: evaluation.position,
      evaluator: evaluation.evaluator,
      date: new Date(evaluation.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      rating: evaluation.rating,
      status: evaluation.status,
    }, format);
    setDownloadModalId(null);
  };

  return (
    <>
      <ReusableTable
        heading="Completed Evaluations"
        columns={createCompletedEvaluationColumns({
          openMenuId,
          onToggleMenu: setOpenMenuId,
          onView,
          onEdit,
          onDownload: handleDownload,
          showDelete: false,
        })}
        data={data}
        filterKey="status"
        filterOptions={[
          { key: "reviewed", value: "Reviewed", label: "Reviewed" },
          { key: "completed", value: "Completed", label: "Completed" },
        ]}
        searchKeys={["name", "department", "position", "evaluator"]}
      />
      <DownloadFormatDialog
        open={Boolean(downloadModalId)}
        onOpenChange={(open) => {
          if (!open) setDownloadModalId(null);
        }}
        onSelect={downloadInFormat}
      />
    </>
  );
};
