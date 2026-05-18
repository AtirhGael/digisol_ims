import { useEffect, useMemo } from "react";
import { toast } from "sonner";

import { useDeleteHook } from "../../../../Hooks/UseDeleteHook";
import { useFetchHook } from "../../../../Hooks/UseFetchHook";
import type { HrDepartment, HrEmployee } from "../../hrApi";
import type { OnboardingFilter } from "../onboardingData";
import {
  mapEmployeeToOnboardingRecord,
  ONBOARDING_EMPLOYEES_ENDPOINT,
  ONBOARDING_QUERY_KEYS,
  type PaginatedResponse,
} from "../onboardingUtils";

export function useOnboardingData(activeFilter: OnboardingFilter) {
  const {
    data: employeesResponse,
    isLoading,
    error,
    refetch: refetchEmployees,
  } = useFetchHook<PaginatedResponse<HrEmployee>>(
    ONBOARDING_EMPLOYEES_ENDPOINT,
    "hr-onboarding-employees"
  );
  const { data: departmentsResponse } = useFetchHook<
    { success: boolean; message: string; data: HrDepartment[] }
  >("/users/departments", "hr-onboarding-departments");
  const deleteEmployeeMutation = useDeleteHook("/employees", ONBOARDING_QUERY_KEYS, {
    invalidateQueriesOnSuccess: false,
  });

  useEffect(() => {
    if (error) {
      toast.error(error.response?.data?.message || "Failed to load onboarding data.");
    }
  }, [error]);

  const records = useMemo(
    () =>
      (employeesResponse?.data ?? [])
        .filter((employee) => employee.employment_status !== "TERMINATED")
        .map(mapEmployeeToOnboardingRecord),
    [employeesResponse]
  );

  const filteredRecords = useMemo(
    () =>
      activeFilter === "all"
        ? records
        : records.filter((record) => record.onboardingType === activeFilter),
    [activeFilter, records]
  );

  const counts = useMemo(
    () => ({
      all: records.length,
      employee: records.filter((record) => record.onboardingType === "employee").length,
      intern: records.filter((record) => record.onboardingType === "intern").length,
    }),
    [records]
  );

  const departmentOptions = useMemo(
    () =>
      (departmentsResponse?.data ?? []).map((department) => ({
        value: department.department_id,
        label: department.department_name,
      })),
    [departmentsResponse]
  );

  return {
    counts,
    records,
    filteredRecords,
    departmentOptions,
    deleteEmployeeMutation,
    isLoading,
    refetchEmployees,
  };
}
