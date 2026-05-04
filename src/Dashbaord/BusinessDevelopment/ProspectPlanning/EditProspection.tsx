"use client";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import useFetchHook from "../../../Hooks/UseFetchHook";
import { useUpdate } from "../../../Hooks/UseUpdateHook";
import { useUserStore } from "../../../Store/UserStore";
import { Loader } from "../../../components/other/Loader/Loader";
import type { BasicInfo, ExpenseLine, TeamMember } from "../../../Types/Types";
import { STEPS } from "../../../data/prospectionData";
import { StepBasicInfo } from "./Tabs/StepBasicInfo";
import { StepBudgetTeam } from "./Tabs/StepBudgetTeam";
import { StepReview } from "./Tabs/StepReview";
import { PROSPECTION_PLANS } from "./prospectionMockData";
import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { getApiErrorMessage } from "../../../utils/apiErrorMessage";

interface EditProspectionPlanProps {
  onCancel?: () => void;
  editId: string;
}

export const EditProspectionPlan = ({
  onCancel,
  editId,
}: EditProspectionPlanProps) => {
  const [step, setStep] = useState(0);
  const queryClient = useQueryClient();

  // Hooks for data operations
  const {
    data: updateResult,
    loading: isUpdating,
    error: updateError,
    updateData,
  } = useUpdate();

  // Get user store at component level
  const { accessToken, user } = useUserStore();

  // Fetch individual prospection data - make it optional since the endpoint might not exist
  const {
    data: fetchedEditData,
    isLoading: isLoadingEdit,
    error: editError,
  } = useFetchHook(
    `/business-development/prospections/${editId}`,
    `prospection-edit-${editId}`,
    {
      enabled: !!editId,
      refetchOnWindowFocus: false,
    },
  );

  // Process edit data using useMemo to ensure proper dependency tracking
  const editData = useMemo(() => {
    // Prioritize API data over mock data
    if (editId && fetchedEditData?.success && fetchedEditData?.data) {
      try {
        

        // Helper function to format date for HTML date input (yyyy-MM-dd)
        const formatDateForInput = (dateString: string) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          return date.toISOString().split("T")[0]; // Gets "yyyy-MM-dd" format
        };

        return {
          id: fetchedEditData.data.prospection_id || fetchedEditData.data.id,
          title: fetchedEditData.data.title || "",
          description: fetchedEditData.data.description || "",
          city: fetchedEditData.data.location_city || "",
          region: fetchedEditData.data.location_region || "",
          venue: fetchedEditData.data.location_venue || "",
          address: fetchedEditData.data.location_address || "",
          plannedStart: formatDateForInput(
            fetchedEditData.data.planned_start_date ||
              fetchedEditData.data.startDate,
          ),
          plannedEnd: formatDateForInput(
            fetchedEditData.data.planned_end_date ||
              fetchedEditData.data.endDate,
          ),
          targetAudience: fetchedEditData.data.target_audience || "",
          expectedContacts: fetchedEditData.data.expected_contacts || 0,
          successCriteria: fetchedEditData.data.success_criteria || "",
          status: fetchedEditData.data.status || "DRAFT",
          teamMembers: [],
        };
      } catch (error) {
        
      }
    }

    // Fallback to mock data only if API data is not available
    if (editId && !fetchedEditData) {
      
      const mockData = PROSPECTION_PLANS.find(
        (p: any) => p.id === Number(editId),
      );
      if (mockData) {
        
        return {
          id: mockData.id,
          title: mockData.title,
          description: mockData.description,
          city: mockData.city,
          region: mockData.region,
          venue: mockData.venue,
          plannedStart: mockData.plannedStart,
          plannedEnd: mockData.plannedEnd,
          targetAudience: mockData.targetAudience,
          expectedContacts: mockData.expectedContacts,
          teamMembers: mockData.teamMembers || [],
        };
      }
    }

    // Fallback to API data if available
    if (editId && fetchedEditData?.success && fetchedEditData?.data) {
      try {

        // Helper function to format date for HTML date input (yyyy-MM-dd)
        const formatDateForInput = (dateString: string) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          return date.toISOString().split("T")[0]; // Gets "yyyy-MM-dd" format
        };

        return {
          id: fetchedEditData.data.prospection_id || fetchedEditData.data.id,
          title: fetchedEditData.data.title || "",
          description: fetchedEditData.data.description || "",
          city: fetchedEditData.data.location_city || "",
          region: fetchedEditData.data.location_region || "",
          venue: fetchedEditData.data.location_venue || "",
          address: fetchedEditData.data.location_address || "",
          plannedStart: formatDateForInput(
            fetchedEditData.data.planned_start_date ||
              fetchedEditData.data.startDate,
          ),
          plannedEnd: formatDateForInput(
            fetchedEditData.data.planned_end_date ||
              fetchedEditData.data.endDate,
          ),
          targetAudience: fetchedEditData.data.target_audience || "",
          expectedContacts: fetchedEditData.data.expected_contacts || 0,
          successCriteria: fetchedEditData.data.success_criteria || "",
          status: fetchedEditData.data.status || "DRAFT",
          teamMembers: [],
        };
      } catch (error) {
        console.error("Error processing API data:", error);
        return null;
      }
    }

    return null;
  }, [editId, fetchedEditData]);

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

  // Update basicInfo when edit data is loaded
  useEffect(() => {
    if (editData) {
      try {
        setBasicInfo({
          title: editData.title || "",
          description: editData.description || "",
          city: editData.city || "",
          region: editData.region || "",
          venue: editData.venue || "",
          address: editData.address || "",
          startDate: editData.plannedStart || "",
          endDate: editData.plannedEnd || "",
          targetAudience: editData.targetAudience || "",
          expectedContacts: editData.expectedContacts?.toString() || "0",
          successCriteria: editData.successCriteria || "",
          status: editData.status || "DRAFT",
        });

        // Update team data if available from raw API data
        if (
          fetchedEditData?.data?.team_members &&
          fetchedEditData.data.team_members.length > 0
        ) {
          setTeam(
            fetchedEditData.data.team_members.map(
              (member: any, index: number) => ({
                id: index + 1,
                department: member.department || "",
                name: member.name || "",
              }),
            ),
          );
        }

        // Update expenses data if available from raw API data
        if (
          fetchedEditData?.data?.expenses &&
          fetchedEditData.data.expenses.length > 0
        ) {
          setExpenses(
            fetchedEditData.data.expenses.map((exp: any, index: number) => ({
              id: Date.now() + index, // Use timestamp-based IDs to avoid conflicts
              expense_id: exp.expense_id, // Store original expense ID for backend
              description: exp.description || "",
              amount: exp.amount?.toString() || "0",
              type: exp.category || "General",
            })),
          );
        }
      } catch (error) {
        console.error("Error setting basicInfo:", error);
      }
    }
  }, [editData]);

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

      if (!accessToken) {
        toast.error("You are not authenticated. Please log in again.", {
          duration: 4000,
        });
        return;
      }

      // Helper function to convert date input to ISO format
      const formatDateForAPI = (dateString: string) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          console.error("Invalid date:", dateString);
          return null;
        }
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
        .map((expense) => {
          const expenseDate = formatDateForAPI(basicInfo.startDate);
          return {
            expense_date: expenseDate || new Date().toISOString(),
            category: expense.type || "General",
            description: expense.description.trim(),
            amount: Number(expense.amount),
            currency: "XAF",
          };
        });

      // Calculate total budget from the same filtered expenses that will be sent
      const totalExpenseBudget = expensesData.reduce((sum, expense) => {
        return sum + expense.amount;
      }, 0);

      // Validate required fields
      if (!basicInfo.title || basicInfo.title.trim().length < 3) {
        toast.error("Title must be at least 3 characters long.", {
          duration: 4000,
        });
        return;
      }

      if (!basicInfo.city || basicInfo.city.trim().length < 2) {
        toast.error("City must be at least 2 characters long.", {
          duration: 4000,
        });
        return;
      }

      const startDate = formatDateForAPI(basicInfo.startDate);
      const endDate = formatDateForAPI(basicInfo.endDate);

      if (!startDate || !endDate) {
        toast.error("Please provide valid start and end dates.", {
          duration: 4000,
        });
        return;
      }

      if (new Date(startDate) >= new Date(endDate)) {
        toast.error("End date must be after start date.", { duration: 4000 });
        return;
      }

      const updatePayload = {
        title: basicInfo.title.trim(),
        description: basicInfo.description?.trim() || "",
        location_city: basicInfo.city.trim(),
        location_region: basicInfo.region?.trim() || "",
        location_venue: basicInfo.venue?.trim() || "",
        location_address: basicInfo.address?.trim() || "",
        planned_start_date: startDate,
        planned_end_date: endDate,
        target_audience: basicInfo.targetAudience?.trim() || "",
        expected_contacts: Math.max(
          0,
          parseInt(basicInfo.expectedContacts) || 0,
        ),
        success_criteria: basicInfo.successCriteria?.trim() || "",
        status: basicInfo.status || "DRAFT",
        budget_requested: Math.max(0, totalExpenseBudget || 0),
        currency: "XAF",
        team_members: teamMembersData.length > 0 ? teamMembersData : [],
        expenses: expensesData.length > 0 ? expensesData : [],
      };

      const result = await updateData(
        `/business-development/prospections/${editId}`,
        updatePayload,
      );

      // Invalidate relevant queries to force refetch of fresh data
      await queryClient.invalidateQueries({ queryKey: ["prospect-data"] });
      await queryClient.invalidateQueries({
        queryKey: [`prospection-edit-${editId}`],
      });
      await queryClient.invalidateQueries({
        queryKey: [`prospection-detail-${editId}`],
      });

      // Small delay to allow backend to process, then verify the update
      setTimeout(async () => {
        try {
          await queryClient.refetchQueries({
            queryKey: [`prospection-edit-${editId}`],
          });
        } catch (verifyError) {
        }
      }, 500);

      toast.success("Prospection plan updated successfully!", {
        duration: 4000,
      });
      onCancel?.();
    } catch (error: any) {
      console.error("Failed to update prospection plan:", error);

      const detail = getApiErrorMessage(error);
      if (detail) {
        toast.error(detail, { duration: 5000 });
        return;
      }

      let errorMessage = "Failed to update prospection plan. Please try again.";

      if (error?.response?.status === 401) {
        errorMessage = "You are not authorized to perform this action.";
      } else if (error?.response?.status === 404) {
        errorMessage = "Prospection plan not found.";
      } else if (error?.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      }

      toast.error(errorMessage, { duration: 4000 });
    }
  };

  return (
    <div className="flex flex-col gap-4 md:gap-5 p-1 md:p-0">
      {/* Loading state for edit mode */}
      {isLoadingEdit && !editError && !editData && <SkeletonLoading />}

      {/* Show form when not loading or when there's data available */}
      {(!isLoadingEdit || editData || editError) && (
        <>
          {/* Header with title and cancel button */}
          <div className="flex items-center justify-between flex-wrap gap-2 md:gap-0">
            <div className="min-w-0 flex-1 pr-2">
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 break-all">
                Edit prospection plan{" "}
                {editData?.title ? `"${editData.title}"` : ""}
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
              isSubmitting={isUpdating}
              canSubmit={isBasicInfoValid()}
            />
          )}
        </>
      )}
    </div>
  );
};
