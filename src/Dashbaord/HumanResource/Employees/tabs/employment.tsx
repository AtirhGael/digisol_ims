import React from "react";
import type { HrDepartment } from "../../hrApi";

interface EmploymentValues {
  employment_type: string;
  start_date: string;
  department_id: string;
  position: string;
  manager_id: string;
}

interface EmploymentTabProps {
  values: EmploymentValues;
  errors: Partial<Record<keyof EmploymentValues, string>>;
  departments: HrDepartment[];
  departmentsLoading: boolean;
  onFieldChange: (field: keyof EmploymentValues, value: string) => void;
}

const inputClassName =
  "w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#42417E]";

const EmploymentTab: React.FC<EmploymentTabProps> = ({
  values,
  errors,
  departments,
  departmentsLoading,
  onFieldChange,
}) => {
  const renderError = (field: keyof EmploymentValues) =>
    errors[field] ? <p className="mt-1 text-xs text-red-500">{errors[field]}</p> : null;

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-bold mb-6">Employment Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Employment Type<span className="text-red-500">*</span>
          </label>
          <select
            className={`${inputClassName} appearance-none bg-white`}
            value={values.employment_type}
            onChange={(event) =>
              onFieldChange("employment_type", event.target.value)
            }
          >
            <option value="">Select employment type</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
          </select>
          {renderError("employment_type")}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Start Date<span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className={inputClassName}
            value={values.start_date}
            onChange={(event) => onFieldChange("start_date", event.target.value)}
            required
          />
          {renderError("start_date")}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Department<span className="text-red-500">*</span>
          </label>
          <select
            className={`${inputClassName} appearance-none bg-white`}
            aria-label="Department"
            required
            value={values.department_id}
            onChange={(event) =>
              onFieldChange("department_id", event.target.value)
            }
            disabled={departmentsLoading}
          >
            <option value="">
              {departmentsLoading ? "Loading departments..." : "Select department"}
            </option>
            {departments.map((department) => (
              <option
                key={department.department_id}
                value={department.department_id}
              >
                {department.department_name}
              </option>
            ))}
          </select>
          {renderError("department_id")}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Position/Title<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={inputClassName}
            value={values.position}
            onChange={(event) => onFieldChange("position", event.target.value)}
            required
          />
          {renderError("position")}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Manager / Supervisor
          </label>
          <input
            type="text"
            placeholder="Enter manager name or employee ID"
            className={inputClassName}
            value={values.manager_id}
            onChange={(event) => onFieldChange("manager_id", event.target.value)}
          />
          {renderError("manager_id")}
        </div>
      </div>
      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
        The employee account will be created automatically and the temporary
        password will be emailed to the work email entered in the personal
        information step.
      </div>
    </div>
  );
};

export default EmploymentTab;
