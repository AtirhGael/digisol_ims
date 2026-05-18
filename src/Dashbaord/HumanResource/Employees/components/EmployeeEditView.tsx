import React from "react";
import { ArrowLeft } from "lucide-react";
import SkeletonLoading from "../../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { Button } from "../../../../components/ui/button";
import type { EditForm } from "../types";

const inputClass =
  "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 bg-white";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`text-sm text-gray-700 ${className}`}>
      {label}
      {children}
    </label>
  );
}

interface Props {
  editForm: EditForm;
  loading: boolean;
  saving: boolean;
  onFieldChange: (field: keyof EditForm, value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const EmployeeEditView: React.FC<Props> = ({
  editForm,
  loading,
  saving,
  onFieldChange,
  onSave,
  onCancel,
}) => (
  <div className="min-h-screen space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Employee Records
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Employee</h1>
        <p className="text-sm text-gray-500">
          Update the selected employee record.
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave} loading={saving}>
          Save Changes
        </Button>
      </div>
    </div>

    {loading ? (
      <SkeletonLoading />
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-lg border border-gray-200 p-5">
        <Field label="National ID">
          <input
            className={inputClass}
            value={editForm.national_id}
            onChange={(e) => onFieldChange("national_id", e.target.value)}
          />
        </Field>

        <Field label="Position">
          <input
            className={inputClass}
            value={editForm.position}
            onChange={(e) => onFieldChange("position", e.target.value)}
          />
        </Field>

        <Field label="Gender">
          <select
            className={inputClass}
            value={editForm.gender}
            onChange={(e) => onFieldChange("gender", e.target.value)}
          >
            <option value="">Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </Field>

        <Field label="Marital Status">
          <select
            className={inputClass}
            value={editForm.marital_status}
            onChange={(e) => onFieldChange("marital_status", e.target.value)}
          >
            <option value="">Select status</option>
            <option value="SINGLE">Single</option>
            <option value="MARRIED">Married</option>
            <option value="DIVORCED">Divorced</option>
            <option value="WIDOWED">Widowed</option>
          </select>
        </Field>

        <Field label="Employment Type">
          <select
            className={inputClass}
            value={editForm.employment_type}
            onChange={(e) => onFieldChange("employment_type", e.target.value)}
          >
            <option value="">Select type</option>
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
          </select>
        </Field>

        <Field label="Employment Status">
          <select
            className={inputClass}
            value={editForm.employment_status}
            onChange={(e) =>
              onFieldChange("employment_status", e.target.value)
            }
          >
            <option value="">Select status</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="TERMINATED">Terminated</option>
            <option value="RESIGNED">Resigned</option>
          </select>
        </Field>

        <Field label="City">
          <input
            className={inputClass}
            value={editForm.address_city}
            onChange={(e) => onFieldChange("address_city", e.target.value)}
          />
        </Field>

        <Field label="Region">
          <select
            className={inputClass}
            value={editForm.address_region}
            onChange={(e) => onFieldChange("address_region", e.target.value)}
          >
            <option value="">Select a region</option>
            <option value="Adamawa">Adamawa</option>
            <option value="Centre">Centre</option>
            <option value="East">East</option>
            <option value="Far North">Far North</option>
            <option value="Littoral">Littoral</option>
            <option value="North">North</option>
            <option value="North West">North West</option>
            <option value="South">South</option>
            <option value="South West">South West</option>
            <option value="West">West</option>
          </select>
        </Field>

        <Field label="Country" className="md:col-span-2">
          <input
            className={inputClass}
            value={editForm.address_country}
            onChange={(e) => onFieldChange("address_country", e.target.value)}
          />
        </Field>

        <Field label="Emergency Contact Name">
          <input
            className={inputClass}
            value={editForm.emergency_name}
            onChange={(e) => onFieldChange("emergency_name", e.target.value)}
          />
        </Field>

        <Field label="Emergency Contact Relationship">
          <input
            className={inputClass}
            value={editForm.emergency_relationship}
            onChange={(e) =>
              onFieldChange("emergency_relationship", e.target.value)
            }
          />
        </Field>

        <Field label="Emergency Contact Phone" className="md:col-span-2">
          <input
            className={inputClass}
            value={editForm.emergency_phone}
            onChange={(e) => onFieldChange("emergency_phone", e.target.value)}
          />
        </Field>
      </div>
    )}
  </div>
);
