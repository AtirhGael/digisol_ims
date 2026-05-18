import { useEffect, useState } from "react";
import { toast } from "sonner";

import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import useUpdate from "../../../Hooks/UseUpdateHook";
import { OffboardingDialog } from "./components/OffboardingDialog";
import { OffboardingHeader } from "./components/OffboardingHeader";
import { OffboardingRecordsTable } from "./components/OffboardingRecordsTable";
import { OffboardingSummaryCards } from "./components/OffboardingSummaryCards";
import { useOffboardingData } from "./hooks/useOffboardingData";
import { StartOffboardingProcess } from "./StartOffboardingProcess";
import { ViewOffboarding } from "./ViewOffboarding";
import type {
  OffboardingFilter,
  OffboardingRecord,
  OffboardingType,
  OffboardingView,
  OffboardReason,
} from "./offboardingData";

export default function Offboarding() {
  const [view, setView] = useState<OffboardingView>("list");
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [processType, setProcessType] = useState<OffboardingType>("employee");
  const [activeFilter, setActiveFilter] = useState<OffboardingFilter>("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewingRecord, setViewingRecord] = useState<OffboardingRecord | null>(null);
  const [offboardingRecord, setOffboardingRecord] = useState<OffboardingRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { counts, records, filteredRecords, isLoading, refetchEmployees } =
    useOffboardingData(activeFilter);

  const { updateData } = useUpdate();

  useEffect(() => {
    const closeMenus = () => {
      setOpenMenuId(null);
      setShowTypeSelector(false);
    };
    document.addEventListener("click", closeMenus);
    return () => document.removeEventListener("click", closeMenus);
  }, []);

  const handleStartOffboarding = (type: OffboardingType) => {
    setProcessType(type);
    setView("process");
    setShowTypeSelector(false);
  };

  const handleView = (id: string) => {
    const record = records.find((r) => r.id === id);
    if (!record) return;
    setViewingRecord(record);
    setView("view");
    setOpenMenuId(null);
  };

  const handleOffboard = (id: string) => {
    const record = records.find((r) => r.id === id);
    if (!record) return;
    setOffboardingRecord(record);
    setOpenMenuId(null);
  };

  const handleConfirmOffboard = async (reason: OffboardReason) => {
    if (!offboardingRecord) return;
    setIsSubmitting(true);
    try {
      await updateData(
        `/employees/${offboardingRecord.id}`,
        { employment_info: { employment_status: reason } },
        "patch"
      );
      toast.success(`${offboardingRecord.name} has been offboarded successfully.`);
      setOffboardingRecord(null);
      if (viewingRecord?.id === offboardingRecord.id) {
        setViewingRecord(null);
        setView("list");
      }
      await refetchEmployees();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to offboard. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <SkeletonLoading />;
  }

  if (view === "process") {
    return (
      <StartOffboardingProcess
        type={processType}
        records={records}
        isLoadingRecords={isLoading}
        onBack={() => setView("list")}
        onDone={async () => { setView("list"); await refetchEmployees(); }}
      />
    );
  }

  if (view === "view" && viewingRecord) {
    return (
      <>
        <ViewOffboarding
          record={viewingRecord}
          onBack={() => {
            setViewingRecord(null);
            setView("list");
          }}
          onOffboard={() => handleOffboard(viewingRecord.id)}
        />
        {offboardingRecord ? (
          <OffboardingDialog
            record={offboardingRecord}
            isSubmitting={isSubmitting}
            onClose={() => setOffboardingRecord(null)}
            onConfirm={handleConfirmOffboard}
          />
        ) : null}
      </>
    );
  }

  return (
    <div className="min-h-screen">
      <OffboardingHeader
        showTypeSelector={showTypeSelector}
        onToggleTypeSelector={() => setShowTypeSelector((v) => !v)}
        onStartOffboarding={handleStartOffboarding}
      />
      <OffboardingSummaryCards
        activeFilter={activeFilter}
        counts={counts}
        onChange={setActiveFilter}
      />
      <OffboardingRecordsTable
        activeFilter={activeFilter}
        data={filteredRecords}
        openMenuId={openMenuId}
        onToggleMenu={setOpenMenuId}
        onView={handleView}
        onOffboard={handleOffboard}
      />
      {offboardingRecord ? (
        <OffboardingDialog
          record={offboardingRecord}
          isSubmitting={isSubmitting}
          onClose={() => setOffboardingRecord(null)}
          onConfirm={handleConfirmOffboard}
        />
      ) : null}
    </div>
  );
}
