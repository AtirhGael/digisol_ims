import React from "react";
import { Upload } from "lucide-react";

const EmployeeDocumentsTab: React.FC = () => {
  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-bold mb-6">Documents & Final Review</h2>
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-4">Document Uploads</h3>
        <div className="space-y-4">
          <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900">CV/Resume<span className="text-red-500">*</span></span>
            </div>
            <button type="button" className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>
          <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900">ID Card Copy<span className="text-red-500">*</span></span>
            </div>
            <button type="button" className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>
          <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900">Certificates</span>
            </div>
            <button type="button" className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>
          <div className="border border-gray-300 rounded-lg p-4 flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-900">Other Documents</span>
            </div>
            <button type="button" className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Summary Review</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Name:</span>
            <span className="text-gray-900 font-medium">Not specified</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Department:</span>
            <span className="text-gray-900 font-medium">Not specified</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Position:</span>
            <span className="text-gray-900 font-medium">Not specified</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Start Date:</span>
            <span className="text-gray-900 font-medium">Not specified</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Work Email:</span>
            <span className="text-gray-900 font-medium">Not specified</span>
          </div>
        </div>
      </div>
      <div className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg">
        <input type="checkbox" id="confirm" className="mt-1" required />
        <label htmlFor="confirm" className="text-sm text-gray-700">
          I confirm that all the information provided is accurate and complete. I agree to the terms and conditions of employment.<span className="text-red-500">*</span>
        </label>
      </div>
    </div>
  );
};

export default EmployeeDocumentsTab;
