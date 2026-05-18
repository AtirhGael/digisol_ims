import React, { useEffect, useRef, useState } from "react";
import { Upload, User, Monitor, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { uploadEmployeePhoto, type HrUploadedPicture } from "../hrApi";
import { useFetchHook } from "../../../Hooks/UseFetchHook";
import type {
  OnboardingFormValues,
  OnboardingRecord,
  OnboardingType,
  OnboardingWorkflow,
  DeviceEntry,
} from "./onboardingData";

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30";
const labelCls = "mb-1 block text-sm font-medium text-gray-700";
const apiBaseUrl = (import.meta as any).env.VITE_BASE_URL;

const PRESET_DEVICES = [
  "Laptop",
  "Laptop Charger",
  "Laptop Bag",
  "Mouse",
  "Keyboard",
  "Monitor",
  "Headset",
  "Access Card / Badge",
  "Office Phone",
];

function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-gray-100 bg-white p-6 ${className}`}>
      {children}
    </div>
  );
}

interface OnboardingFormProps {
  initialType?: OnboardingType;
  initialRecord?: OnboardingRecord | null;
  departmentOptions: { value: string; label: string }[];
  departmentPositionsMap?: Record<string, string[]>;
  isSubmitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: OnboardingFormValues) => void | Promise<void>;
}

export function OnboardingForm({
  initialType = "employee",
  initialRecord = null,
  departmentOptions,
  departmentPositionsMap = {},
  isSubmitting = false,
  onCancel,
  onSubmit,
}: OnboardingFormProps) {
  const nameParts = initialRecord?.name.trim().split(/\s+/) ?? [];
  const [onboardingType, setOnboardingType] = useState<OnboardingType>(
    initialRecord?.onboardingType ?? initialType
  );
  const [firstName, setFirstName] = useState(nameParts[0] ?? "");
  const [lastName, setLastName] = useState(nameParts.slice(1).join(" "));
  const [email, setEmail] = useState(initialRecord?.email ?? "");
  const [phoneNumber, setPhoneNumber] = useState(initialRecord?.phone ?? "");
  const [nationalId, setNationalId] = useState(initialRecord?.nationalId ?? "");
  const [nationalIdType, setNationalIdType] = useState<
    "PASSPORT" | "NATIONAL_ID" | "DRIVER_LICENSE"
  >((initialRecord?.nationalIdType as "PASSPORT" | "NATIONAL_ID" | "DRIVER_LICENSE") || "NATIONAL_ID");
  const [dateOfBirth, setDateOfBirth] = useState(initialRecord?.dateOfBirth?.slice(0, 10) ?? "");
  const [gender, setGender] = useState<"MALE" | "FEMALE">(initialRecord?.gender ?? "MALE");
  const [maritalStatus, setMaritalStatus] = useState<
    "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED"
  >(initialRecord?.maritalStatus ?? "SINGLE");
  const [position, setPosition] = useState(initialRecord?.role ?? "");
  const [departmentId, setDepartmentId] = useState(initialRecord?.departmentId ?? "");
  const [workflow, setWorkflow] = useState<OnboardingWorkflow>(
    initialRecord?.workflow || (initialType === "intern" ? "Hybrid" : "Onsite")
  );
  const [startDate, setStartDate] = useState(initialRecord?.startDate ?? "");
  const [address, setAddress] = useState(initialRecord?.addressStreet ?? "");
  const [city, setCity] = useState(initialRecord?.addressCity ?? "");
  const [region, setRegion] = useState(initialRecord?.addressRegion ?? "");
  const [country, setCountry] = useState(initialRecord?.addressCountry ?? "Cameroon");
  const [postalCode, setPostalCode] = useState(initialRecord?.addressPostalCode ?? "");
  const [emergencyContactName, setEmergencyContactName] = useState(
    initialRecord?.emergencyContactName ?? ""
  );
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState(
    initialRecord?.emergencyContactRelationship ?? ""
  );
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(
    initialRecord?.emergencyContactPhone ?? ""
  );
  const [school, setSchool] = useState(initialRecord?.school ?? "");
  const [speciality, setSpeciality] = useState(initialRecord?.speciality ?? "");
  const [level, setLevel] = useState(initialRecord?.level ?? "");
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(
    initialRecord?.avatarUrl ?? null
  );
  const [profilePictureUrl, setProfilePictureUrl] = useState(initialRecord?.avatarUrl ?? "");
  const [uploadedPhoto, setUploadedPhoto] = useState<HrUploadedPicture | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Devices
  const [devices, setDevices] = useState<DeviceEntry[]>(
    initialRecord ? [] : []
  );
  const [customDeviceName, setCustomDeviceName] = useState("");

  const { data: positionsData } = useFetchHook<{ success: boolean; data: string[] }>(
    '/employees/positions',
    'hr-employee-positions',
    { staleTime: 5 * 60 * 1000 }
  );
  const allPositionOptions: string[] = positionsData?.data ?? [];

  // Show positions for the selected department; fall back to all positions
  const positionOptions: string[] =
    departmentId && departmentPositionsMap[departmentId]?.length
      ? departmentPositionsMap[departmentId]
      : allPositionOptions;

  const selectedDepartment =
    departmentOptions.find((option) => option.value === departmentId)?.label ?? "Not selected";

  useEffect(() => {
    return () => {
      if (photoPreviewUrl && photoPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Photo must be 10MB or smaller.");
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    setPhotoPreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      return nextPreviewUrl;
    });
    setUploadingPhoto(true);

    try {
      const response = await uploadEmployeePhoto(file);
      setUploadedPhoto(response.data);
      setProfilePictureUrl(`${apiBaseUrl}/pictures/${response.data.picture_id}`);
      toast.success("Photo uploaded successfully.");
    } catch (error: any) {
      setUploadedPhoto(null);
      toast.error(error?.response?.data?.message || "Failed to upload photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = () => {
    onSubmit({
      onboardingType,
      firstName,
      lastName,
      email,
      phoneNumber,
      nationalId,
      nationalIdType,
      dateOfBirth,
      gender,
      maritalStatus,
      position,
      departmentId,
      workflow,
      startDate,
      address: "",
      city,
      region,
      country,
      postalCode: "",
      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactPhone,
      school,
      speciality,
      level,
      profilePictureUrl,
      devices,
    });
  };

  return (
    <div className="flex flex-col gap-4 p-1 md:gap-5 md:p-0">
      <nav className="flex items-center gap-1 text-sm text-gray-400">
        <button onClick={onCancel} className="transition-colors hover:text-primary">
          Staff & Interns Onboarding
        </button>
        <span>/</span>
        <span className="font-medium text-gray-700">
          {initialRecord ? "Edit Onboarding" : "New Onboarding"}
        </span>
      </nav>

      <h1 className="text-lg font-semibold text-gray-900 sm:text-xl md:text-2xl">
        {initialRecord ? "Edit Onboarding Record" : "Start New Onboarding"}
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionCard>
            <div className="mb-6 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              <h2 className="text-base font-semibold text-gray-800">Onboarding Form</h2>
            </div>

            <div className="space-y-6">
              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                  Onboarding Details
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className={labelCls}>Onboarding Type</label>
                    <select
                      value={onboardingType}
                      disabled
                      className={`${inputCls} appearance-none cursor-not-allowed bg-gray-50 pr-3`}
                    >
                      <option value="employee">Employee onboarding</option>
                      <option value="intern">Intern onboarding</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Workflow</label>
                    <select
                      className={inputCls}
                      value={workflow}
                      onChange={(e) => setWorkflow(e.target.value as OnboardingWorkflow)}
                    >
                      <option value="Onsite">Onsite</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Department</label>
                    <select className={inputCls} value={departmentId} onChange={(e) => {
                      setDepartmentId(e.target.value);
                      setPosition(""); // reset position when department changes
                    }}>
                      <option value="">Select department</option>
                      {departmentOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Position</label>
                    <select
                      className={inputCls}
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                    >
                      <option value="">
                        {!departmentId ? "Select department first" : "Select position"}
                      </option>
                      {positionOptions.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Start Date</label>
                    <input type="date" className={inputCls} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                </div>

                {onboardingType === "intern" ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="space-y-1">
                      <label className={labelCls}>School</label>
                      <input className={inputCls} value={school} onChange={(e) => setSchool(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className={labelCls}>Speciality</label>
                      <input className={inputCls} value={speciality} onChange={(e) => setSpeciality(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className={labelCls}>Level</label>
                      <input className={inputCls} value={level} onChange={(e) => setLevel(e.target.value)} />
                    </div>
                  </div>
                ) : null}
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className={labelCls}>First Name</label>
                    <input className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Last Name</label>
                    <input className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Email</label>
                    <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Telephone Number</label>
                    <input className={inputCls} value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>National ID</label>
                    <input className={inputCls} value={nationalId} onChange={(e) => setNationalId(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>National ID Type</label>
                    <select
                      className={inputCls}
                      value={nationalIdType}
                      onChange={(e) =>
                        setNationalIdType(e.target.value as "PASSPORT" | "NATIONAL_ID" | "DRIVER_LICENSE")
                      }
                    >
                      <option value="NATIONAL_ID">National ID</option>
                      <option value="PASSPORT">Passport</option>
                      <option value="DRIVER_LICENSE">Driver License</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Date of Birth</label>
                    <input type="date" className={inputCls} value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Gender</label>
                    <select className={inputCls} value={gender} onChange={(e) => setGender(e.target.value as "MALE" | "FEMALE")}>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Marital Status</label>
                    <select
                      className={inputCls}
                      value={maritalStatus}
                      onChange={(e) =>
                        setMaritalStatus(e.target.value as "SINGLE" | "MARRIED" | "DIVORCED" | "WIDOWED")
                      }
                    >
                      <option value="SINGLE">Single</option>
                      <option value="MARRIED">Married</option>
                      <option value="DIVORCED">Divorced</option>
                      <option value="WIDOWED">Widowed</option>
                    </select>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                  Address & Contacts
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className={labelCls}>City</label>
                    <input className={inputCls} value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Region</label>
                    <select className={inputCls} value={region} onChange={(e) => setRegion(e.target.value)}>
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
                  <div className="space-y-1">
                    <label className={labelCls}>Country</label>
                    <input className={inputCls} value={country} onChange={(e) => setCountry(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Emergency Contact Name</label>
                    <input
                      className={inputCls}
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Emergency Relationship</label>
                    <input
                      className={inputCls}
                      value={emergencyContactRelationship}
                      onChange={(e) => setEmergencyContactRelationship(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Emergency Phone</label>
                    <input
                      className={inputCls}
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value)}
                    />
                  </div>
                </div>
              </section>
              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                  Company Devices
                </h3>
                <p className="text-xs text-gray-500 -mt-2">
                  Select devices being issued to this employee. You can also add custom items.
                </p>

                {/* Preset device checkboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {PRESET_DEVICES.map((preset) => {
                    const existing = devices.find((d) => d.name === preset);
                    const isChecked = Boolean(existing);
                    return (
                      <div key={preset} className="space-y-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 accent-primary"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setDevices((prev) => prev.filter((d) => d.name !== preset));
                              } else {
                                setDevices((prev) => [...prev, { name: preset, serialNumber: "" }]);
                              }
                            }}
                          />
                          <span className="text-sm text-gray-700">{preset}</span>
                        </label>
                        {isChecked && (
                          <input
                            className={`${inputCls} ml-6`}
                            placeholder="Serial number (optional)"
                            value={existing?.serialNumber ?? ""}
                            onChange={(e) =>
                              setDevices((prev) =>
                                prev.map((d) =>
                                  d.name === preset ? { ...d, serialNumber: e.target.value } : d
                                )
                              )
                            }
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Custom device entries */}
                {devices
                  .filter((d) => !PRESET_DEVICES.includes(d.name))
                  .map((d, i) => (
                    <div key={`custom-${i}`} className="flex items-start gap-2">
                      <div className="flex-1 space-y-1">
                        <input
                          className={inputCls}
                          placeholder="Device name"
                          value={d.name}
                          onChange={(e) =>
                            setDevices((prev) =>
                              prev.map((item) =>
                                item === d ? { ...item, name: e.target.value } : item
                              )
                            )
                          }
                        />
                        <input
                          className={inputCls}
                          placeholder="Serial number (optional)"
                          value={d.serialNumber}
                          onChange={(e) =>
                            setDevices((prev) =>
                              prev.map((item) =>
                                item === d ? { ...item, serialNumber: e.target.value } : item
                              )
                            )
                          }
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setDevices((prev) => prev.filter((item) => item !== d))}
                        className="mt-1 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Remove device"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                {/* Add custom device */}
                <div className="flex items-center gap-2">
                  <input
                    className={`${inputCls} flex-1`}
                    placeholder="Add a device not in the list…"
                    value={customDeviceName}
                    onChange={(e) => setCustomDeviceName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customDeviceName.trim()) {
                        e.preventDefault();
                        setDevices((prev) => [...prev, { name: customDeviceName.trim(), serialNumber: "" }]);
                        setCustomDeviceName("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={!customDeviceName.trim()}
                    onClick={() => {
                      if (!customDeviceName.trim()) return;
                      setDevices((prev) => [...prev, { name: customDeviceName.trim(), serialNumber: "" }]);
                      setCustomDeviceName("");
                    }}
                    className="flex items-center gap-1 rounded-lg border border-primary/30 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                {devices.length > 0 && (
                  <div className="rounded-lg bg-primary/5 border border-primary/10 px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Monitor className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-primary">
                        {devices.length} device{devices.length !== 1 ? "s" : ""} selected
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {devices.map((d) => (
                        <span
                          key={d.name}
                          className="inline-flex items-center gap-1 rounded-full bg-white border border-primary/20 px-2.5 py-0.5 text-xs text-gray-700"
                        >
                          {d.name}
                          {d.serialNumber && (
                            <span className="text-gray-400">· {d.serialNumber}</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </div>

            <div className="flex flex-col-reverse justify-end gap-3 pt-6 sm:flex-row">
              <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : initialRecord ? "Update" : "Save"}
              </Button>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Profile Photo
              </h3>
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                  {photoPreviewUrl ? (
                    <img
                      src={photoPreviewUrl}
                      alt="Profile preview"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <User size={36} className="text-gray-400" />
                  )}
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-primary/30 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={uploadingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={14} /> {uploadingPhoto ? "Uploading..." : uploadedPhoto ? "Change Photo" : "Upload Photo"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
                <p className="text-center text-xs text-gray-400">
                  JPG, PNG, GIF, or WEBP up to 10MB.
                </p>
                {uploadedPhoto ? (
                  <p className="max-w-full truncate text-center text-xs text-green-600">
                    Uploaded: {uploadedPhoto.file_name}
                  </p>
                ) : null}
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Quick Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-600">Name</span>
                  <span className="font-medium text-gray-800">
                    {[firstName, lastName].filter(Boolean).join(" ") || "Not provided"}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-600">Department</span>
                  <span className="font-medium text-gray-800">{selectedDepartment}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-600">Workflow</span>
                  <span className="font-medium text-gray-800">{workflow}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium capitalize text-gray-800">{onboardingType}</span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
