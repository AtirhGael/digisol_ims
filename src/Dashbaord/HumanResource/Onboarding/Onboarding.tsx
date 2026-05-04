import React, { useEffect, useMemo, useState } from "react";
import ReusableTable from "../../../components/other/ReusableTable/ReusableTable";
import { createOnboardingColumns } from "../../../components/Columns/OnboardingColumns";
import { onboardingRecords } from "./onboardingData";
import { OnboardingForm } from "./OnboardingForm";
import { ViewOnboarding } from "./ViewOnboarding";
import type { OnboardingType, OnboardingRecord } from "./onboardingData";

type CardFilter = "all" | "employee" | "intern";

export const Onboarding: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [onboardingType, setOnboardingType] = useState<OnboardingType>("employee");
  const [activeCard, setActiveCard] = useState<CardFilter>("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewingRecord, setViewingRecord] = useState<OnboardingRecord | null>(null);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
      setShowTypeSelector(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const filteredData = useMemo(() => {
    if (activeCard === "all") return onboardingRecords;
    return onboardingRecords.filter((r) => r.onboardingType === activeCard);
  }, [activeCard]);

  const startForm = (type: OnboardingType) => {
    setOnboardingType(type);
    setShowTypeSelector(false);
    setShowForm(true);
  };

  const handleView = (id: string) => {
    const record = onboardingRecords.find((r) => r.id === id);
    if (record) setViewingRecord(record);
  };

  const handleDelete = (id: string) => {
    // Delete onboarding record (future)
  };

  const headingMap: Record<CardFilter, string> = {
    all: "All Onboarding Records",
    employee: "Employee Onboarding Records",
    intern: "Intern Onboarding Records",
  };

  if (viewingRecord) {
    return (
      <ViewOnboarding
        record={viewingRecord}
        onBack={() => setViewingRecord(null)}
        onEdit={() => {
          setOnboardingType(viewingRecord.onboardingType);
          setViewingRecord(null);
          setShowForm(true);
        }}
      />
    );
  }

  if (showForm) {
    return (
      <OnboardingForm
        initialType={onboardingType}
        onCancel={() => setShowForm(false)}
        onSuccess={() => setShowForm(false)}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Staff Onboarding
          </h1>
          <p className="text-sm text-gray-500">
            Track and manage new employee onboarding process
          </p>
        </div>
        <div className="relative flex gap-2 flex-wrap">
          <button
            className="bg-primary hover:bg-[#35345f] text-white rounded px-4 py-2 text-sm font-semibold flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              setShowTypeSelector((prev) => !prev);
            }}
          >
            + Start New Onboarding
          </button>
          {showTypeSelector && (
            <div
              className="absolute right-0 top-full mt-2 z-20 w-56 rounded-lg border border-gray-200 bg-white py-2 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Select Type
              </p>
              <button
                type="button"
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => startForm("employee")}
              >
                Employee Onboarding
              </button>
              <button
                type="button"
                className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => startForm("intern")}
              >
                Intern Onboarding
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {([
          { key: "all" as CardFilter, label: "Total Onboarding" },
          { key: "employee" as CardFilter, label: "Employee Onboarding" },
          { key: "intern" as CardFilter, label: "Interns Onboarding" },
        ]).map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => setActiveCard(card.key)}
            className={`rounded-2xl p-6 text-left shadow-sm transition cursor-pointer ${
              activeCard === card.key
                ? "bg-gradient-to-br from-[#2f5bff] to-[#3b3a7a] text-white ring-2 ring-primary/40"
                : "bg-white border border-gray-100 text-gray-500 hover:border-primary/40 hover:shadow-md"
            }`}
          >
            {card.key === "all" && (
              <p className={`text-sm uppercase tracking-wide ${
                activeCard === "all" ? "opacity-80" : "text-gray-400"
              }`}>Total</p>
            )}
            <p className={`${
              card.key === "all" ? "text-lg font-semibold" : "text-sm"
            } ${
              activeCard === card.key ? "text-white" : "text-gray-500"
            }`}>
              {card.key === "all" ? "Onboarding" : card.label}
            </p>
          </button>
        ))}
      </div>

      <ReusableTable
        heading={headingMap[activeCard]}
        columns={createOnboardingColumns({
          openMenuId,
          onToggleMenu: setOpenMenuId,
          onView: handleView,
          onDelete: handleDelete,
        })}
        data={filteredData}
        filterKey="workflow"
        filterOptions={[
          { key: "hybrid", value: "Hybrid", label: "Hybrid" },
          { key: "onsite", value: "Onsite", label: "Onsite" },
          { key: "remote", value: "Remote", label: "Remote" },
        ]}
        searchKeys={["name", "role", "workflow", "startDate"]}
      />
    </div>
  );
};
