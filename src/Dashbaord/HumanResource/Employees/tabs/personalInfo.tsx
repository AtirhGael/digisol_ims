import React, { useRef } from "react";
import type { HrUploadedPicture } from "../../hrApi";

interface PersonalInfoValues {
  first_name: string;
  last_name: string;
  national_id: string;
  date_of_birth: string;
  gender: string;
  marital_status: string;
  phone: string;
  personal_email: string;
  work_phone: string;
  email: string;
  address_street: string;
  address_city: string;
  address_region: string;
  address_country: string;
  emergency_name: string;
  emergency_phone: string;
  emergency_relationship: string;
}

interface PersonalInfoTabProps {
  photoPreviewUrl: string | null;
  uploadedPhoto: HrUploadedPicture | null;
  uploadingPhoto: boolean;
  onPhotoSelected: (file: File) => Promise<void>;
  values: PersonalInfoValues;
  errors: Partial<Record<keyof PersonalInfoValues, string>>;
  onFieldChange: (field: keyof PersonalInfoValues, value: string) => void;
}

const inputClassName =
  "w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#42417E]";

const errorClassName = "mt-1 text-xs text-red-500";

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({
  photoPreviewUrl,
  uploadedPhoto,
  uploadingPhoto,
  onPhotoSelected,
  values,
  errors,
  onFieldChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await onPhotoSelected(file);
    event.target.value = "";
  };

  const renderError = (field: keyof PersonalInfoValues) =>
    errors[field] ? <p className={errorClassName}>{errors[field]}</p> : null;

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-bold mb-6">Personal Information</h2>
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Photo Upload
        </label>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:border-primary hover:bg-gray-100 transition-colors"
          onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
          onKeyDown={(event) => {
            if (
              !uploadingPhoto &&
              (event.key === "Enter" || event.key === " ")
            ) {
              event.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Upload employee photo"
        >
          {photoPreviewUrl ? (
            <>
              <img
                src={photoPreviewUrl}
                alt="Employee preview"
                className="w-24 h-24 rounded-full object-cover border border-gray-200 mb-4"
              />
              <span className="text-gray-700 text-sm font-medium">
                {uploadingPhoto ? "Uploading photo..." : "Click to change photo"}
              </span>
            </>
          ) : (
            <>
              <svg
                width="40"
                height="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                className="mb-3 text-gray-400"
              >
                <path d="M12 16V4m0 0l-4 4m4-4l4 4" />
                <rect width="20" height="12" x="2" y="8" rx="2" />
              </svg>
              <span className="text-gray-500 text-sm">
                {uploadingPhoto
                  ? "Uploading photo..."
                  : "Click to browse and upload a photo"}
              </span>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        <div className="mt-2 text-xs text-gray-500">
          JPG, PNG, GIF, or WEBP up to 10MB.
        </div>
        {uploadedPhoto ? (
          <p className="mt-2 text-sm text-green-600">
            Uploaded successfully: {uploadedPhoto.file_name}
          </p>
        ) : null}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            First Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={inputClassName}
            value={values.first_name}
            onChange={(event) => onFieldChange("first_name", event.target.value)}
            required
          />
          {renderError("first_name")}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Last Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={inputClassName}
            value={values.last_name}
            onChange={(event) => onFieldChange("last_name", event.target.value)}
            required
          />
          {renderError("last_name")}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            National ID<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={inputClassName}
            value={values.national_id}
            onChange={(event) => onFieldChange("national_id", event.target.value)}
            required
          />
          {renderError("national_id")}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Date of Birth<span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className={inputClassName}
            value={values.date_of_birth}
            onChange={(event) =>
              onFieldChange("date_of_birth", event.target.value)
            }
            required
          />
          {renderError("date_of_birth")}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Gender<span className="text-red-500">*</span>
          </label>
          <select
            className={`${inputClassName} appearance-none bg-white`}
            aria-label="Gender"
            value={values.gender}
            onChange={(event) => onFieldChange("gender", event.target.value)}
          >
            <option value="">Select gender</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
          {renderError("gender")}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Marital Status
          </label>
          <select
            className={`${inputClassName} appearance-none bg-white`}
            aria-label="Marital Status"
            value={values.marital_status}
            onChange={(event) =>
              onFieldChange("marital_status", event.target.value)
            }
          >
            <option value="">Select status</option>
            <option value="SINGLE">Single</option>
            <option value="MARRIED">Married</option>
            <option value="DIVORCED">Divorced</option>
            <option value="WIDOWED">Widowed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Personal Phone Number
          </label>
          <input
            type="tel"
            className={inputClassName}
            value={values.phone}
            onChange={(event) => onFieldChange("phone", event.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Personal Email
          </label>
          <input
            type="email"
            className={inputClassName}
            value={values.personal_email}
            onChange={(event) => onFieldChange("personal_email", event.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Work Phone Number
          </label>
          <input
            type="tel"
            className={inputClassName}
            value={values.work_phone}
            onChange={(event) => onFieldChange("work_phone", event.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Work Email<span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            className={inputClassName}
            value={values.email}
            onChange={(event) => onFieldChange("email", event.target.value)}
            required
          />
          {renderError("email")}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            City<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={inputClassName}
            value={values.address_city}
            onChange={(event) => onFieldChange("address_city", event.target.value)}
            required
          />
          {renderError("address_city")}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Region
          </label>
          <select
            className={`${inputClassName} appearance-none bg-white`}
            value={values.address_region}
            onChange={(event) => onFieldChange("address_region", event.target.value)}
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
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Country
          </label>
          <input
            type="text"
            className={inputClassName}
            value={values.address_country}
            onChange={(event) =>
              onFieldChange("address_country", event.target.value)
            }
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Emergency Contact Name
          </label>
          <input
            type="text"
            className={inputClassName}
            value={values.emergency_name}
            onChange={(event) =>
              onFieldChange("emergency_name", event.target.value)
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Emergency Contact Phone
          </label>
          <input
            type="tel"
            className={inputClassName}
            value={values.emergency_phone}
            onChange={(event) =>
              onFieldChange("emergency_phone", event.target.value)
            }
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Emergency Contact Relationship
        </label>
        <input
          type="text"
          placeholder="e.g Spouse, Parent, Sibling"
          className={inputClassName}
          value={values.emergency_relationship}
          onChange={(event) =>
            onFieldChange("emergency_relationship", event.target.value)
          }
        />
      </div>
    </div>
  );
};

export default PersonalInfoTab;
