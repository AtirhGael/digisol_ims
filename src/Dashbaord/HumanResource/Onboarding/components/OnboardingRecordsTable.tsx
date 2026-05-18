import ReusableTable from "../../../../components/other/ReusableTable/ReusableTable";
import { createOnboardingColumns } from "../../../../components/Columns/OnboardingColumns";
import type { OnboardingFilter, OnboardingRecord } from "../onboardingData";
import { ONBOARDING_HEADINGS, WORKFLOW_FILTER_OPTIONS } from "../onboardingUtils";

type OnboardingRecordsTableProps = {
  activeFilter: OnboardingFilter;
  data: OnboardingRecord[];
  openMenuId: string | null;
  onToggleMenu: (id: string | null) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
};

export function OnboardingRecordsTable({
  activeFilter,
  data,
  openMenuId,
  onToggleMenu,
  onView,
  onDelete,
}: OnboardingRecordsTableProps) {
  return (
    <ReusableTable
      heading={ONBOARDING_HEADINGS[activeFilter]}
      columns={createOnboardingColumns({
        openMenuId,
        onToggleMenu,
        onView,
        onDelete,
        showDelete: true,
      })}
      data={data}
      filterKey="workflow"
      filterOptions={WORKFLOW_FILTER_OPTIONS}
      searchKeys={["name", "role", "workflow", "startDate", "departmentName"]}
    />
  );
}
