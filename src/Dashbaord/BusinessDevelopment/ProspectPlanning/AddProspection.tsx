"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { usePost } from "../../../Hooks/UsePostHook";
import { useUserStore } from "../../../Store/UserStore";
import type { BasicInfo, ExpenseLine, TeamMember } from "../../../Types/Types";
import { STEPS } from "../../../data/prospectionData";
import { StepBasicInfo } from "./Tabs/StepBasicInfo";
import { StepBudgetTeam } from "./Tabs/StepBudgetTeam";
import { StepReview } from "./Tabs/StepReview";
import { getApiErrorToastMessage } from "../../../utils/apiErrorMessage";

// ─── Main Component ───────────────────────────────────────────────────────────

interface NewProspectionPlanProps {
  onCancel?: () => void;
}

export const NewProspectionPlan = ({ onCancel }: NewProspectionPlanProps) => {
  const [step, setStep] = useState(0);
  const queryClient = useQueryClient();

  // Get user info from store
  const { user } = useUserStore();

  // Hook for creating new prospection
  const {
    data: createResult,
    loading: isCreating,
    error: createError,
    postData,
  } = usePost();

  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    title: "",
    description: "",
    city: "",
    region: "",
    venue: "",
    address: "",
    startDate: "",
    endDate: "",
    targetAudience: "",
    expectedContacts: "",
    successCriteria: "",
    status: "DRAFT",
  });

  const [expenses, setExpenses] = useState<ExpenseLine[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([
    { id: 1, department: "", name: "" },
  ]);

  // Helper functions
  const addExpense = () => {
    const newId = Date.now(); // Use timestamp to ensure unique IDs
    setExpenses((prev) => [
      ...prev,
      { id: newId, type: "", amount: "", description: "" },
    ]);
  };

  const removeExpense = (id: number) =>
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  const changeExpense = (
    id: number,
    field: keyof Omit<ExpenseLine, "id">,
    value: string,
  ) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
  };

  const addTeamMember = () => {
    const newId = team.length > 0 ? Math.max(...team.map((m) => m.id)) + 1 : 1;
    setTeam((prev) => [...prev, { id: newId, department: "", name: "" }]);
  };

  const removeTeamMember = (id: number) =>
    setTeam((prev) => prev.filter((m) => m.id !== id));
  const changeTeam = (
    id: number,
    field: keyof Omit<TeamMember, "id">,
    value: string,
  ) =>
    setTeam((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );

  const handleBasicInfoChange = (field: keyof BasicInfo, value: string) => {
    setBasicInfo((prev) => ({ ...prev, [field]: value }));
  };

  const isBasicInfoValid = () => {
    const hasRequiredText =
      basicInfo.title.trim().length >= 3 &&
      basicInfo.description.trim().length > 0 &&
      basicInfo.region.trim().length > 0 &&
      basicInfo.city.trim().length > 0 &&
      basicInfo.targetAudience.trim().length > 0 &&
      basicInfo.status.trim().length > 0;

    if (!hasRequiredText || !basicInfo.startDate || !basicInfo.endDate) {
      return false;
    }

    const start = new Date(basicInfo.startDate);
    const end = new Date(basicInfo.endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return false;
    }

    return start < end;
  };

  const handleSubmit = async () => {
    try {
      if (!isBasicInfoValid()) {
        toast.error("Please complete all required fields before submitting.", {
          duration: 4000,
        });
        return;
      }

      // Helper function to generate a simple UUID
      const generateUUID = () => {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
          /[xy]/g,
          function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          },
        );
      };

      // Helper function to convert date input to ISO format
      const formatDateForAPI = (dateString: string) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toISOString();
      };

      // Prepare team members data (only include valid entries)
      const teamMembersData = team
        .filter((member) => member.name && member.name.trim())
        .map((member) => ({
          user_id: generateUUID(), // Always generate unique UUID for each team member
          role_in_prospection: `${member.department} - ${member.name}`, // Include name in role since we can't map to real users yet
        }));

      // Prepare expenses data (only include valid entries)
      const expensesData = expenses
        .filter(
          (expense) =>
            expense.description &&
            expense.description.trim().length >= 3 &&
            expense.amount &&
            Number(expense.amount) > 0,
        )
        .map((expense) => ({
          expense_date:
            formatDateForAPI(basicInfo.startDate) || new Date().toISOString(), // Default to start date
          category: expense.type || "General",
          description: expense.description,
          amount: Number(expense.amount) || 0,
          currency: "XAF",
        }));

      // Calculate total budget from the same filtered expenses that will be sent
      const totalExpenseBudget = expensesData.reduce((sum, expense) => {
        return sum + expense.amount;
      }, 0);

      const createPayload = {
        title: basicInfo.title,
        description: basicInfo.description,
        location_city: basicInfo.city,
        location_region: basicInfo.region,
        location_venue: basicInfo.venue,
        location_address: basicInfo.address,
        planned_start_date: formatDateForAPI(basicInfo.startDate),
        planned_end_date: formatDateForAPI(basicInfo.endDate),
        target_audience: basicInfo.targetAudience,
        expected_contacts: parseInt(basicInfo.expectedContacts) || 0,
        success_criteria: basicInfo.successCriteria,
        status: basicInfo.status || "DRAFT",
        budget_requested: Math.max(1, totalExpenseBudget), // Use calculated budget or minimum 1
        currency: "XAF", // Default currency
        team_members: teamMembersData.length > 0 ? teamMembersData : undefined,
        expenses: expensesData.length > 0 ? expensesData : undefined,
      };

      await postData(
        "/business-development/prospections",
        createPayload,
      );

      // Invalidate the main prospections list query to force refresh
      await queryClient.invalidateQueries({ queryKey: ["prospect-data"] });

      toast.success("Prospection plan created successfully!", {
        duration: 4000,
      });
      onCancel?.();
    } catch (error) {
      toast.error(
        getApiErrorToastMessage(
          error,
          "Failed to create prospection plan. Please try again.",
        ),
        { duration: 5000 },
      );
    }
  };

  return (
    <div className="flex flex-col gap-4 md:gap-5 p-1 md:p-0">
      {/* Header with title and cancel button */}
      <div className="flex items-center justify-between flex-wrap gap-2 md:gap-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 break-all">
            Create new Prospection Plan
          </h1>
        </div>
        <button
          onClick={onCancel}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-1.5 md:py-1 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap shrink-0"
        >
          Cancel
        </button>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-0 border-b border-gray-200 overflow-x-auto scrollbar-hide">
        {STEPS.map((label, idx) => (
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

      {/* Step content */}
      {step === 0 && (
        <StepBasicInfo
          data={basicInfo}
          onChange={handleBasicInfoChange}
          onNext={() => setStep(1)}
          formMode="create"
        />
      )}
      {step === 1 && (
        <StepBudgetTeam
          expenses={expenses}
          team={team}
          onExpenseChange={changeExpense}
          onTeamChange={changeTeam}
          onRemoveExpense={removeExpense}
          onRemoveTeamMember={removeTeamMember}
          onAddExpense={addExpense}
          onAddTeamMember={addTeamMember}
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <StepReview
          basicInfo={basicInfo}
          expenses={expenses}
          team={team}
          onBack={() => setStep(1)}
          onSubmit={handleSubmit}
          isSubmitting={isCreating}
          canSubmit={isBasicInfoValid()}
        />
      )}
    </div>
  );
};
