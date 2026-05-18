import React, { useEffect, useMemo, useState } from "react";
import { Button } from "../../../components/ui/button";
import PersonalInfoTab from "./tabs/personalInfo";
import EmploymentTab from "./tabs/employment";
import CompensationTab from "./tabs/compensation";
import LeaveSetupTab from "./tabs/leaveSetup";
import EmployeeDocumentsTab from "./tabs/employeeDocuments";
import {
  createEmployeeRecord,
  uploadEmployeePhoto,
  type HrDepartment,
  type HrEmployeeDetail,
  type HrUploadedPicture,
} from "../hrApi";
import { uploadDocument } from "../../Documents/api";
import { toast } from "sonner";
import { useFetchHook } from "../../../Hooks/UseFetchHook";
import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading";

const TABS = [
  "Personal Info",
  "Employment",
  "Compensation",
  "Leave Setup",
  "Documents",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type UploadedDocument = {
  document_id: string;
  document_name: string;
  file_url: string;
  file_size: string;
  file_type: string;
  created_at: string;
};

type EmployeeFormValues = {
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
  employment_type: string;
  start_date: string;
  department_id: string;
  position: string;
  manager_id: string;
};

type FormErrors = Partial<Record<keyof EmployeeFormValues | "confirm", string>>;

const INITIAL_FORM_VALUES: EmployeeFormValues = {
  first_name: "",
  last_name: "",
  national_id: "",
  date_of_birth: "",
  gender: "",
  marital_status: "SINGLE",
  phone: "",
  personal_email: "",
  work_phone: "",
  email: "",
  address_street: "",
  address_city: "",
  address_region: "",
  address_country: "Cameroon",
  emergency_name: "",
  emergency_phone: "",
  emergency_relationship: "",
  employment_type: "",
  start_date: "",
  department_id: "",
  position: "",
  manager_id: "",
};

interface AddEmployeeFormProps {
  onCancel: () => void;
  onSuccess: (result: {
    employee: HrEmployeeDetail;
    credentialsSentTo?: string;
  }) => void;
}

export const AddEmployeeForm: React.FC<AddEmployeeFormProps> = ({
  onCancel,
  onSuccess,
}) => {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<EmployeeFormValues>(INITIAL_FORM_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [uploadedPhoto, setUploadedPhoto] = useState<HrUploadedPicture | null>(
    null
  );
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<
    Record<string, UploadedDocument>
  >({});
  const [uploadingDocumentKey, setUploadingDocumentKey] = useState<
    string | null
  >(null);

  const {
    data: departmentsResponse,
    isLoading: loadingDepartments,
    error: departmentsError,
  } = useFetchHook<{ success: boolean; message: string; data: HrDepartment[] }>(
    "/users/departments",
    "hr-departments"
  );

  const departments = departmentsResponse?.data ?? [];

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  useEffect(() => {
    if (departmentsError) {
      toast.error(
        departmentsError.response?.data?.message || "Failed to load departments."
      );
    }
  }, [departmentsError]);

  const selectedDepartmentName = useMemo(
    () =>
      departments.find(
        (department) => department.department_id === values.department_id
      )?.department_name || "",
    [departments, values.department_id]
  );

  const clearError = (field: keyof FormErrors) => {
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleFieldChange = (field: keyof EmployeeFormValues, value: string) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));
    clearError(field);
  };

  const handlePhotoSelected = async (file: File) => {  
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
      toast.success("Employee photo uploaded successfully.");
    } catch (error: any) {
      console.error("Error uploading employee photo:", error);
      setUploadedPhoto(null);
      toast.error(
        error?.response?.data?.message || "Failed to upload employee photo."
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDocumentSelected = async (documentKey: string, file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Document must be 50MB or smaller.");
      return;
    }

    setUploadingDocumentKey(documentKey);

    try {
      const response = await uploadDocument(file, documentKey, []);
      setUploadedDocuments((current) => ({
        ...current,
        [documentKey]: response.data,
      }));
      toast.success(`${documentKey} uploaded successfully.`);
    } catch (error: any) {
      console.error(`Error uploading ${documentKey}:`, error);
      toast.error(
        error?.response?.data?.message || `Failed to upload ${documentKey}.`
      );
    } finally {
      setUploadingDocumentKey(null);
    }
  };

  const validatePersonalInfo = () => {
    const nextErrors: FormErrors = {};
    const firstName = values.first_name.trim();
    const lastName = values.last_name.trim();
    const email = values.email.trim();
    const nationalId = values.national_id.trim();
    const city = values.address_city.trim();
    const birthDate = values.date_of_birth ? new Date(values.date_of_birth) : null;

    if (!firstName) {
      nextErrors.first_name = "First name is required.";
    } else if (firstName.length < 2) {
      nextErrors.first_name = "First name must be at least 2 characters.";
    }
    if (!lastName) {
      nextErrors.last_name = "Last name is required.";
    } else if (lastName.length < 2) {
      nextErrors.last_name = "Last name must be at least 2 characters.";
    }
    if (!email) {
      nextErrors.email = "Work email is required.";
    } else if (!EMAIL_REGEX.test(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!nationalId) {
      nextErrors.national_id = "National ID is required.";
    } else if (nationalId.length < 5) {
      nextErrors.national_id = "National ID must be at least 5 characters.";
    }
    if (!values.date_of_birth) {
      nextErrors.date_of_birth = "Date of birth is required.";
    } else if (birthDate && birthDate > new Date()) {
      nextErrors.date_of_birth = "Date of birth cannot be in the future.";
    }
    if (!values.gender) nextErrors.gender = "Gender is required.";
    if (!city) {
      nextErrors.address_city = "City is required.";
    } else if (city.length < 2) {
      nextErrors.address_city = "City must be at least 2 characters.";
    }

    setErrors((current) => ({ ...current, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const validateEmployment = () => {
    const nextErrors: FormErrors = {};
    const position = values.position.trim();
    const managerId = values.manager_id.trim();

    if (!values.employment_type) {
      nextErrors.employment_type = "Employment type is required.";
    }
    if (!values.start_date) nextErrors.start_date = "Start date is required.";
    if (!values.department_id) {
      nextErrors.department_id = "Department is required.";
    } else if (!UUID_REGEX.test(values.department_id)) {
      nextErrors.department_id = "Please select a valid department.";
    }
    if (!position) {
      nextErrors.position = "Position is required.";
    } else if (position.length < 2) {
      nextErrors.position = "Position must be at least 2 characters.";
    }
    if (managerId && !UUID_REGEX.test(managerId)) {
      nextErrors.manager_id = "Manager ID must be a valid employee UUID.";
    }

    setErrors((current) => ({ ...current, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const validateDocumentsStep = () => {
    const nextErrors: FormErrors = {};

    if (!confirmed) {
      nextErrors.confirm = "Please confirm the employee details before continuing.";
    }

    setErrors((current) => ({ ...current, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const validateCurrentStep = () => {
    if (step === 0) return validatePersonalInfo();
    if (step === 1) return validateEmployment();
    if (step === 4) return validateDocumentsStep();
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return;
    }

    setStep((current) => Math.min(TABS.length - 1, current + 1));
  };

  const handleSubmit = async () => {
    const personalValid = validatePersonalInfo();
    const employmentValid = validateEmployment();
    const documentsValid = validateDocumentsStep();

    if (!personalValid || !employmentValid || !documentsValid) {
      if (!personalValid) setStep(0);
      else if (!employmentValid) setStep(1);
      else setStep(4);
      return;
    }

    setSubmitting(true);

    try {
      const response = await createEmployeeRecord({
        user: {
          email: values.email.trim(),
          first_name: values.first_name.trim(),
          last_name: values.last_name.trim(),
          phone: values.phone.trim() || undefined,
          roles: ["STAFF_MEMBER"],
          status: "ACTIVE",
        },
        national_id: values.national_id.trim(),
        national_id_type: "NATIONAL_ID",
        date_of_birth: values.date_of_birth,
        gender: values.gender as "MALE" | "FEMALE",
        marital_status:
          (values.marital_status as
            | "SINGLE"
            | "MARRIED"
            | "DIVORCED"
            | "WIDOWED") || "SINGLE",
        address: {
          street: values.address_street.trim() || undefined,
          city: values.address_city.trim(),
          region: values.address_region.trim() || undefined,
          country: values.address_country.trim() || undefined,
        },
        emergency_contact: {
          name: values.emergency_name.trim() || undefined,
          relationship: values.emergency_relationship.trim() || undefined,
          phone: values.emergency_phone.trim() || undefined,
        },
        employment_info: {
          position: values.position.trim(),
          department_id: values.department_id || null,
          employment_type: values.employment_type as
            | "FULL_TIME"
            | "PART_TIME"
            | "CONTRACT",
          start_date: values.start_date,
          manager_id: values.manager_id.trim() || undefined,
        },
      });

      toast.success("Employee created successfully.");
      onSuccess({
        employee: response.data,
        credentialsSentTo: response.meta?.credentials_sent_to,
      });
    } catch (error: any) {
      console.error("Error creating employee:", error);
      toast.error(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          "Failed to create employee."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderCurrentTab = () => {
    switch (step) {
      case 0:
        return (
          <PersonalInfoTab
            photoPreviewUrl={photoPreviewUrl}
            uploadedPhoto={uploadedPhoto}
            uploadingPhoto={uploadingPhoto}
            onPhotoSelected={handlePhotoSelected}
            values={values}
            errors={errors}
            onFieldChange={handleFieldChange}
          />
        );
      case 1:
        return (
          <EmploymentTab
            values={values}
            errors={errors}
            departments={departments}
            departmentsLoading={loadingDepartments}
            onFieldChange={handleFieldChange}
          />
        );
      case 2:
        return <CompensationTab />;
      case 3:
        return <LeaveSetupTab />;
      case 4:
        return (
          <EmployeeDocumentsTab
            uploadedDocuments={uploadedDocuments}
            uploadingDocumentKey={uploadingDocumentKey}
            onDocumentSelected={handleDocumentSelected}
            summary={{
              name: `${values.first_name} ${values.last_name}`.trim(),
              department: selectedDepartmentName,
              position: values.position,
              startDate: values.start_date,
              email: values.email,
            }}
            confirmed={confirmed}
            onConfirmedChange={(nextValue) => {
              setConfirmed(nextValue);
              clearError("confirm");
            }}
          />
        );
      default:
        return null;
    }
  };

  if (loadingDepartments) {
    return <SkeletonLoading />;
  }

  return (
    <div className="flex flex-col gap-4 md:gap-5 p-1 md:p-0">
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

      <div className="bg-white rounded-lg">{renderCurrentTab()}</div>

      {errors.confirm ? (
        <p className="text-sm text-red-500">{errors.confirm}</p>
      ) : null}

      <div className="flex justify-between pt-2">
        <Button
          variant="outline"
          disabled={step === 0 || submitting}
          onClick={() => setStep((current) => Math.max(0, current - 1))}
        >
          Back
        </Button>

        {step < TABS.length - 1 ? (
          <Button variant="default" onClick={handleNext} disabled={submitting}>
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            className="bg-primary hover:bg-primary/80"
            loading={submitting}
            disabled={submitting}
          >
            Create Employee
          </Button>
        )}
      </div>
    </div>
  );
};
  
