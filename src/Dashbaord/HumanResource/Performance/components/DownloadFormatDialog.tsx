import React from "react";
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";

import type { EvaluationDownloadFormat } from "./downloadEvaluationReport";

interface DownloadFormatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (format: EvaluationDownloadFormat) => void;
}

export const DownloadFormatDialog: React.FC<DownloadFormatDialogProps> = ({
  open,
  onOpenChange,
  onSelect,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Download Evaluation Report</AlertDialogTitle>
          <AlertDialogDescription>
            Choose the format you want to download for this evaluation report.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => onSelect("word")}
            className="border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-700"
          >
            Download Word
          </AlertDialogAction>
          <AlertDialogAction
            onClick={() => onSelect("pdf")}
            className="bg-primary text-white hover:bg-primary/90"
          >
            Download PDF
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
