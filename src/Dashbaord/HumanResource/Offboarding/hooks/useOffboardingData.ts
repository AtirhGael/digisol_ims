import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useFetchHook } from "../../../../Hooks/UseFetchHook";
import type { HrEmployee } from "../../hrApi";
import type { OffboardingFilter } from "../offboardingData";
import {
  mapEmployeeToOffboardingRecord,
  OFFBOARDING_EMPLOYEES_ENDPOINT,
  type PaginatedResponse,
} from "../offboardingUtils";

export function useOffboardingData(activeFilter: OffboardingFilter) {
  const {
    data: employeesResponse,
    isLoading,
    error,
    refetch: refetchEmployees,
  } = useFetchHook<PaginatedResponse<HrEmployee>>(
    OFFBOARDING_EMPLOYEES_ENDPOINT,
    "hr-offboarding-employees"
  );

  useEffect(() => {
    if (error) {
      toast.error(error.response?.data?.message || "Failed to load offboarding data.");
    }
  }, [error]);

  const records = useMemo(
    () => (employeesResponse?.data ?? []).map(mapEmployeeToOffboardingRecord),
    [employeesResponse]
  );

  const filteredRecords = useMemo(
    () =>
      activeFilter === "all"
        ? records
        : records.filter((r) => r.offboardingType === activeFilter),
    [activeFilter, records]
  );

  const counts = useMemo(
    () => ({
      all: records.length,
      employee: records.filter((r) => r.offboardingType === "employee").length,
      intern: records.filter((r) => r.offboardingType === "intern").length,
    }),
    [records]
  );

  return {
    counts,
    records,
    filteredRecords,
    isLoading,
    refetchEmployees,
  };
}
