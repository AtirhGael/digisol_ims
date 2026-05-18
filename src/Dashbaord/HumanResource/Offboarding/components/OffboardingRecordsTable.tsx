import ReusableTable from "../../../../components/other/ReusableTable/ReusableTable";
import { createOffboardingColumns } from "../../../../components/Columns/OffboardingColumns";
import type { OffboardingFilter, OffboardingRecord } from "../offboardingData";
import { OFFBOARDING_HEADINGS } from "../offboardingUtils";

const TYPE_FILTER_OPTIONS = [
  { key: "employee", value: "employee", label: "Employee" },
  { key: "intern", value: "intern", label: "Intern" },
];

type OffboardingRecordsTableProps = {
  activeFilter: OffboardingFilter;
  data: OffboardingRecord[];
  openMenuId: string | null;
  onToggleMenu: (id: string | null) => void;
  onView: (id: string) => void;
  onOffboard: (id: string) => void;
};

export function OffboardingRecordsTable({
  activeFilter,
  data,
  openMenuId,
  onToggleMenu,
  onView,
  onOffboard,
}: OffboardingRecordsTableProps) {
  return (
    <ReusableTable
      heading={OFFBOARDING_HEADINGS[activeFilter]}
      columns={createOffboardingColumns({
        openMenuId,
        onToggleMenu,
        onView,
        onOffboard,
      })}
      data={data}
      filterKey="offboardingType"
      filterOptions={TYPE_FILTER_OPTIONS}
      searchKeys={["name", "role", "departmentName", "startDate"]}
    />
  );
}
