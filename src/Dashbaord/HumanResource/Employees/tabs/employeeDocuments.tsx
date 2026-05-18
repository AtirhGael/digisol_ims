import React, { useRef } from "react";
import { FileText, Upload } from "lucide-react";

type UploadedDocument = {
  document_id: string;
  document_name: string;
  file_url: string;
  file_size: string;
  file_type: string;
  created_at: string;
};

interface EmployeeDocumentsTabProps {
  uploadedDocuments: Record<string, UploadedDocument>;
  uploadingDocumentKey: string | null;
  onDocumentSelected: (documentKey: string, file: File) => Promise<void>;
  summary: {
    name: string;
    department: string;
    position: string;
    startDate: string;
    email: string;
  };
  confirmed: boolean;
  onConfirmedChange: (confirmed: boolean) => void;
}

const DOCUMENT_FIELDS = [
  { key: "CV/Resume", required: true },
  { key: "ID Card Copy", required: true },
  { key: "Certificates", required: false },
  { key: "Other Documents", required: false },
] as const;

const EmployeeDocumentsTab: React.FC<EmployeeDocumentsTabProps> = ({
  uploadedDocuments,
  uploadingDocumentKey,
  onDocumentSelected,
  summary,
  confirmed,
  onConfirmedChange,
}) => {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileChange =
    (documentKey: string) => async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      await onDocumentSelected(documentKey, file);
      event.target.value = "";
    };

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-bold mb-6">Documents & Final Review</h2>
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Document Uploads
        </h3>
        <div className="space-y-4">
          {DOCUMENT_FIELDS.map(({ key, required }) => {
            const uploadedDocument = uploadedDocuments[key];
            const isUploading = uploadingDocumentKey === key;

            return (
              <div
                key={key}
                className="border border-gray-300 rounded-lg p-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <span className="text-sm font-medium text-gray-900">
                    {key}
                    {required ? <span className="text-red-500">*</span> : null}
                  </span>
                  {uploadedDocument ? (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-700">
                      <FileText className="w-4 h-4 shrink-0" />
                      <a
                        href={uploadedDocument.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate hover:underline"
                      >
                        {uploadedDocument.document_name}
                      </a>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">
                      No file uploaded yet.
                    </p>
                  )}
                </div>
                <div className="shrink-0">
                  <input
                    ref={(node) => {
                      inputRefs.current[key] = node;
                    }}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.txt,.zip,.rar"
                    onChange={handleFileChange(key)}
                  />
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                    onClick={() => inputRefs.current[key]?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="w-4 h-4" />
                    {isUploading
                      ? "Uploading..."
                      : uploadedDocument
                      ? "Replace"
                      : "Upload"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-gray-500">
          Supported files include PDF, Word, Excel, PowerPoint, images, text,
          ZIP, and RAR up to 50MB.
        </p>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Summary Review
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Name:</span>
            <span className="text-gray-900 font-medium">
              {summary.name || "Not specified"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Department:</span>
            <span className="text-gray-900 font-medium">
              {summary.department || "Not specified"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Position:</span>
            <span className="text-gray-900 font-medium">
              {summary.position || "Not specified"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Start Date:</span>
            <span className="text-gray-900 font-medium">
              {summary.startDate || "Not specified"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Work Email:</span>
            <span className="text-gray-900 font-medium">
              {summary.email || "Not specified"}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg">
        <input
          type="checkbox"
          id="confirm"
          className="mt-1"
          checked={confirmed}
          onChange={(event) => onConfirmedChange(event.target.checked)}
          required
        />
        <label htmlFor="confirm" className="text-sm text-gray-700">
          I confirm that all the information provided is accurate and complete. I
          agree to the terms and conditions of employment.
          <span className="text-red-500">*</span>
        </label>
      </div>
    </div>
  );
};

export default EmployeeDocumentsTab;
