import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import PersonalInfoTab from "./tabs/personalInfo";
import EmploymentTab from "./tabs/employment";
import CompensationTab from "./tabs/compensation";
import LeaveSetupTab from "./tabs/leaveSetup";
import EmployeeDocumentsTab from "./tabs/employeeDocuments";

const TABS = [
  "Personal Info",
  "Employment",
  "Compensation",
  "Leave Setup",
  "Documents",
];

const TAB_COMPONENTS = [
  PersonalInfoTab,
  EmploymentTab,
  CompensationTab,
  LeaveSetupTab,
  EmployeeDocumentsTab,
];

interface AddEmployeeFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({
  onCancel,
  onSuccess,
}) => {
  const [step, setStep] = useState(0);

  const CurrentTab = TAB_COMPONENTS[step];

  return (
    <div className="flex flex-col gap-4 md:gap-5 p-1 md:p-0">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
            Add New Employee
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Step {step + 1} of {TABS.length}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onCancel}
          className="whitespace-nowrap shrink-0"
        >
          Cancel
        </Button>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-0 border-b border-gray-200 overflow-x-auto scrollbar-hide">
        {TABS.map((label, idx) => (
          <button
            key={label}
            onClick={() => setStep(idx)}
            className={`px-3 md:px-4 pb-3 text-xs md:text-sm font-medium border-b-2 transition-colors -mb-px cursor-pointer whitespace-nowrap shrink-0 ${
              idx === step
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-lg">
        <CurrentTab />
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between pt-2">
        <Button
          variant="outline"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Back
        </Button>

        {step < TABS.length - 1 ? (
          <Button
            variant="default"
            onClick={() => setStep((s) => Math.min(TABS.length - 1, s + 1))}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={onSuccess}
            className="bg-primary hover:bg-primary/80"
          >
            Create Employee
          </Button>
        )}
      </div>
    </div>
  );
};
