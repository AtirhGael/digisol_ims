import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import {
  fetchEmployeeById,
  type HrEmployee,
} from "../hrApi";
import usePost from "../../../Hooks/UsePostHook";
import useUpdate from "../../../Hooks/UseUpdateHook";
import { DeleteOnboardingDialog } from "./components/DeleteOnboardingDialog";
import { OnboardingHeader } from "./components/OnboardingHeader";
import { OnboardingRecordsTable } from "./components/OnboardingRecordsTable";
import { OnboardingSummaryCards } from "./components/OnboardingSummaryCards";
import { useOnboardingData } from "./hooks/useOnboardingData";
import { OnboardingForm } from "./OnboardingForm";
import type {
  OnboardingFilter,
  OnboardingFormValues,
  OnboardingRecord,
  OnboardingType,
  OnboardingView,
} from "./onboardingData";
import {
  createOnboardingPayload,
  mapEmployeeDetailToOnboardingRecord,
  ONBOARDING_EMPLOYEES_ENDPOINT,
  ONBOARDING_QUERY_KEYS,
  type PaginatedResponse,
} from "./onboardingUtils";
import { ViewOnboarding } from "./ViewOnboarding";

const removeBlankFields = (value: any): any => {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== "");
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce<Record<string, any>>((cleaned, [key, entry]) => {
      const nextValue = removeBlankFields(entry);

      if (
        nextValue !== "" &&
        nextValue !== undefined &&
        !(nextValue && typeof nextValue === "object" && !Array.isArray(nextValue) && Object.keys(nextValue).length === 0)
      ) {
        cleaned[key] = nextValue;
      }

      return cleaned;
    }, {});
  }

  return value;
};

export const Onboarding = () => {
  const queryClient = useQueryClient();
  // Coordinate list/detail/form modes while extracted components handle display.
  const [view, setView] = useState<OnboardingView>("list");
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [onboardingType, setOnboardingType] = useState<OnboardingType>("employee");
  const [activeFilter, setActiveFilter] = useState<OnboardingFilter>("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewingRecord, setViewingRecord] = useState<OnboardingRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<OnboardingRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<OnboardingRecord | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isHydratingRecord, setIsHydratingRecord] = useState(false);

  const {
    counts,
    records,
    filteredRecords,
    departmentOptions,
    deleteEmployeeMutation,
    isLoading,
    refetchEmployees,
  } = useOnboardingData(activeFilter);

  const { postData: createEmployee } = usePost();
  const { updateData: updateEmployee } = useUpdate();

  useEffect(() => {
    const closeMenus = () => {
      setOpenMenuId(null);
      setShowTypeSelector(false);
    };

    document.addEventListener("click", closeMenus);
    return () => document.removeEventListener("click", closeMenus);
  }, []);

  const loadRecord = async (employeeId: string) => {
    const response = await fetchEmployeeById(employeeId);
    return mapEmployeeDetailToOnboardingRecord(response.data);
  };

  // Table rows are lightweight; view/edit actions hydrate the full employee detail first.
  const withLoadedRecord = async (
    employeeId: string,
    onLoaded: (record: OnboardingRecord) => void
  ) => {
    try {
      setIsHydratingRecord(true);
      onLoaded(await loadRecord(employeeId));
    } catch (fetchError: any) {
      toast.error(fetchError.response?.data?.message || "Failed to load onboarding record.");
    } finally {
      setOpenMenuId(null);
      setIsHydratingRecord(false);
    }
  };

  const startForm = (type: OnboardingType) => {
    setOnboardingType(type);
    setEditingRecord(null);
    setView("form");
    setShowTypeSelector(false);
  };

  const handleView = (id: string) => {
    withLoadedRecord(id, (record) => {
      setViewingRecord(record);
      setView("view");
    });
  };

  const handleEdit = (id: string) => {
    withLoadedRecord(id, (record) => {
      setEditingRecord(record);
      setOnboardingType(record.onboardingType);
      setViewingRecord(null);
      setView("form");
    });
  };

  const handleDelete = (id: string) => {
    const record = records.find((item) => item.id === id);
    if (!record) return;

    setRecordToDelete(record);
    setOpenMenuId(null);
  };

  const invalidateOnboardingQueries = () =>
    Promise.all(
      ONBOARDING_QUERY_KEYS.map(async (queryKey) => {
        await queryClient.invalidateQueries({ queryKey: [queryKey] });
        queryClient.removeQueries({ queryKey: [queryKey], type: "inactive" });
      })
    );

  const handleSubmit = async (values: OnboardingFormValues) => {
    setIsSaving(true);
    try {
      const sharedPayload = createOnboardingPayload(values);

      if (editingRecord) {
        const { department_id, ...employmentInfo } = sharedPayload.employment_info;
        const nextEmail = values.email.trim();
        const currentEmail = editingRecord.email?.trim() ?? "";
        const emailChanged = nextEmail.toLowerCase() !== currentEmail.toLowerCase();
        const updatePayload = removeBlankFields({
          ...(emailChanged ? { email: nextEmail } : {}),
          first_name: values.firstName.trim(),
          last_name: values.lastName.trim(),
          phone: values.phoneNumber || undefined,
          avatar_url: values.profilePictureUrl || undefined,
          status: "ACTIVE",
          ...sharedPayload,
          employment_info: {
            ...employmentInfo,
            ...(department_id ? { department_id } : {}),
            employment_status:
              editingRecord.employmentStatus && editingRecord.employmentStatus !== "TERMINATED"
                ? editingRecord.employmentStatus
                : "ACTIVE",
          },
        });

        await updateEmployee(`/employees/${editingRecord.id}`, updatePayload, 'patch');
        toast.success("Onboarding record updated successfully.");
      } else {
        const createResponse: any = await createEmployee('/employees', {
          user: {
            email: values.email,
            first_name: values.firstName,
            last_name: values.lastName,
            phone: values.phoneNumber || undefined,
            avatar_url: values.profilePictureUrl || undefined,
            status: "ACTIVE",
            roles: ["STAFF_MEMBER"],
          },
          ...sharedPayload,
        });

        // Assign selected devices to the newly created employee
        const newEmployeeId: string | undefined =
          createResponse?.data?.employee_id ?? createResponse?.employee_id;

        if (newEmployeeId && values.devices?.length) {
          await Promise.allSettled(
            values.devices.map((device) =>
              createEmployee('/assets', {
                name: device.name,
                asset_type: 'EQUIPMENT',
                serial_number: device.serialNumber || undefined,
                assigned_to_employee: newEmployeeId,
              })
            )
          );
        }

        toast.success("Onboarding record created successfully.");
      }

      await invalidateOnboardingQueries();
      await refetchEmployees();
      setEditingRecord(null);
      setView("list");
    } catch (saveError: any) {
      const errorMessage =
        saveError.response?.data?.error ||
        saveError.response?.data?.message ||
        "Failed to save onboarding record.";

      toast.error(
        errorMessage.toLowerCase().includes("unique constraint failed") &&
          errorMessage.toLowerCase().includes("email")
          ? "That email is already assigned to another user."
          : errorMessage
      );
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;

    try {
      await deleteEmployeeMutation.mutateAsync(recordToDelete.id);
      queryClient.setQueryData<PaginatedResponse<HrEmployee>>(
        ["hr-onboarding-employees", ONBOARDING_EMPLOYEES_ENDPOINT],
        (current) =>
          current
            ? {
                ...current,
                data: current.data.filter((employee) => employee.employee_id !== recordToDelete.id),
                pagination: current.pagination
                  ? {
                      ...current.pagination,
                      total_count: Math.max(0, current.pagination.total_count - 1),
                    }
                  : current.pagination,
              }
            : current
      );
      if (viewingRecord?.id === recordToDelete.id) {
        setViewingRecord(null);
        setView("list");
      }
      setRecordToDelete(null);
      toast.success("Onboarding record deleted successfully.");
    } catch (deleteError: any) {
      toast.error(deleteError.response?.data?.message || "Failed to delete onboarding record.");
    }
  };

  const closeForm = () => {
    setEditingRecord(null);
    setView("list");
  };

  if (isLoading || isHydratingRecord) {
    return <SkeletonLoading />;
  }

  if (view === "view" && viewingRecord) {
    return (
      <ViewOnboarding
        record={viewingRecord}
        onBack={() => {
          setViewingRecord(null);
          setView("list");
        }}
        onEdit={() => handleEdit(viewingRecord.id)}
      />
    );
  }

  if (view === "form") {
    // Build a map of departmentId → unique positions from existing records
    const departmentPositionsMap: Record<string, string[]> = {};
    for (const record of records) {
      if (record.departmentId && record.role) {
        if (!departmentPositionsMap[record.departmentId]) {
          departmentPositionsMap[record.departmentId] = [];
        }
        if (!departmentPositionsMap[record.departmentId].includes(record.role)) {
          departmentPositionsMap[record.departmentId].push(record.role);
        }
      }
    }

    return (
      <OnboardingForm
        initialType={onboardingType}
        initialRecord={editingRecord}
        departmentOptions={departmentOptions}
        departmentPositionsMap={departmentPositionsMap}
        isSubmitting={isSaving}
        onCancel={closeForm}
        onSubmit={handleSubmit}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <OnboardingHeader
        showTypeSelector={showTypeSelector}
        onToggleTypeSelector={() => setShowTypeSelector((current) => !current)}
        onStartForm={startForm}
      />
      <OnboardingSummaryCards
        activeFilter={activeFilter}
        counts={counts}
        onChange={setActiveFilter}
      />
      <OnboardingRecordsTable
        activeFilter={activeFilter}
        data={filteredRecords}
        openMenuId={openMenuId}
        onToggleMenu={setOpenMenuId}
        onView={handleView}
        onDelete={handleDelete}
      />
      <DeleteOnboardingDialog
        open={recordToDelete !== null}
        record={recordToDelete}
        isDeleting={deleteEmployeeMutation.isLoading}
        onCancel={() => setRecordToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};
