import React, { useEffect, useState } from "react";
import { PerformanceHeader } from "./components/PerformanceHeader";
import { PerformanceTabs, type PerformanceTabKey } from "./components/PerformanceTabs";
import { PendingEvaluations } from "./components/PendingEvaluations";
import { CompletedEvaluations } from "./components/CompletedEvaluations";
import { EvaluationTemplates } from "./components/EvaluationTemplates";
import { PerformanceAnalytics } from "./components/PerformanceAnalytics";
import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { useFetchHook } from "../../../Hooks/UseFetchHook";
import { PerformanceEvaluationForm } from "./components/PerformanceEvaluationForm";
import { ViewEvaluation } from "./components/ViewEvaluation";
import { ScheduleEvaluation } from "./components/ScheduleEvaluation";
import type { PendingEvaluation, CompletedEvaluation, EvaluationTemplate } from "./data";
import {
  type HrEmployee,
  type HrEmployeeEvaluation,
  type HrEvaluationPeriod,
} from "../hrApi";
import { toast } from "sonner";
import { useUserStore } from "../../../Store/UserStore";

type PaginatedResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
};

type EmployeeEvaluationsResponse = {
  success: boolean;
  message: string;
  data: HrEmployeeEvaluation[];
};

type PerformanceView = "list" | "form" | "viewPending" | "viewCompleted" | "schedule" | "editCompleted";

const buildPendingPreview = (evaluation: PendingEvaluation): CompletedEvaluation => ({
  id: evaluation.id,
  name: evaluation.name,
  department: evaluation.department,
  position: evaluation.position,
  date: evaluation.dueDate,
  evaluator: evaluation.evaluator,
  rating: 0,
  status: "Reviewed",
});

export const Performance: React.FC = () => {
  // Performance uses local subviews for schedule, evaluate, detail, and download flows.
  const [activeTab, setActiveTab] = useState<PerformanceTabKey>("pending");
  const [view, setView] = useState<PerformanceView>("list");
  const [selectedEvaluation, setSelectedEvaluation] = useState<PendingEvaluation | null>(null);
  const [viewingCompleted, setViewingCompleted] = useState<CompletedEvaluation | null>(null);
  const [viewingPending, setViewingPending] = useState<PendingEvaluation | null>(null);
  const [editingEvaluation, setEditingEvaluation] = useState<HrEmployeeEvaluation | null>(null);
  const [dismissedPendingIds, setDismissedPendingIds] = useState<Set<string>>(new Set());

  // Current user role detection
  const { user: currentUser, roles: currentRoles } = useUserStore();
  const isSuperAdmin = currentRoles.some((r) => r.toUpperCase() === "SUPER_ADMIN");
  const isHR = !isSuperAdmin && currentRoles.some((r) =>
    ["HR", "HR_MANAGER"].includes(r.toUpperCase())
  );
  const isDepartmentHead = currentRoles.some((r) => r.toUpperCase() === "DEPARTMENT_HEAD");
  // A pure manager is a DEPARTMENT_HEAD who is neither HR nor Super Admin
  const isPureManager = isDepartmentHead && !isHR && !isSuperAdmin;

  const {
    data: employeesResponse,
    isLoading: employeesLoading,
    error: employeesError,
  } = useFetchHook<PaginatedResponse<HrEmployee>>(
    "/employees?page_size=200",
    "hr-performance-employees"
  );
  const {
    data: periodsResponse,
    isLoading: periodsLoading,
    error: periodsError,
    refetch: refetchPeriods,
  } = useFetchHook<{ success: boolean; message: string; data: HrEvaluationPeriod[] }>(
    "/evaluation-periods",
    "hr-performance-periods"
  );
  const {
    data: evaluationsResponse,
    isLoading: evaluationsLoading,
    error: evaluationsError,
  } = useFetchHook<EmployeeEvaluationsResponse>(
    "/evaluations?page_size=500",
    "hr-performance-evaluations"
  );

  const employees = employeesResponse?.data ?? [];
  const periods = periodsResponse?.data ?? [];
  const evaluations = evaluationsResponse?.data ?? [];
  const firstError = employeesError ?? periodsError ?? evaluationsError;

  // Find the logged-in user's own department (from employee record)
  const myEmployeeRecord = employees.find((e) => e.user_id === currentUser?.id);
  const myDepartmentName = myEmployeeRecord?.department?.department_name ?? null;

  useEffect(() => {
    if (firstError) {
      toast.error(firstError.response?.data?.message || "Failed to load performance data.");
    }
  }, [firstError]);

  const activePeriods = periods.filter((period) => period.is_active);
  // Use the most recently ending active period as the default for new pending evaluations
  const primaryActivePeriod = activePeriods.sort(
    (a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
  )[0] ?? null;
  const activePeriodNames = new Set(activePeriods.map((p) => p.period_name));

  const evaluationsByEmployee = employees.map((employee) => ({
    employee,
    evaluations: evaluations.filter((evaluation) => evaluation.employee_id === employee.employee_id),
  }));

  const completedItems = evaluationsByEmployee.flatMap(({ employee, evaluations }) =>
    evaluations.map((evaluation) => ({
      id: evaluation.evaluation_id,
      name: `${employee.first_name} ${employee.last_name}`.trim(),
      department: employee.department?.department_name ?? "Unassigned",
      position: employee.position,
      date: evaluation.created_at,
      evaluator: evaluation.evaluator,
      rating: evaluation.overall_score ?? 0,
      status: evaluation.status === "COMPLETED" ? "Completed" : "Reviewed",
    } satisfies CompletedEvaluation))
  );

  const pendingItems = (() => {
    const evaluatedDuringActivePeriod = new Set(
      evaluationsByEmployee
        .filter(({ evaluations }) =>
          evaluations.some((evaluation) =>
            activePeriodNames.size > 0 ? activePeriodNames.has(evaluation.period) : true
          )
        )
        .map(({ employee }) => employee.employee_id)
    );

    return employees
      .filter((employee) => !evaluatedDuringActivePeriod.has(employee.employee_id) && !dismissedPendingIds.has(employee.employee_id))
      .map((employee) => ({
        id: employee.employee_id,
        name: `${employee.first_name} ${employee.last_name}`.trim(),
        code: employee.employee_code,
        department: employee.department?.department_name ?? "Unassigned",
        position: employee.position,
        period: primaryActivePeriod?.period_name ?? "",
        period_id: primaryActivePeriod?.period_id,
        dueDate: primaryActivePeriod?.end_date ?? new Date().toISOString(),
        evaluator: "HR Department",
        cycle: "Quarterly",
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          `${employee.first_name} ${employee.last_name}`.trim()
        )}&background=E5E7EB&color=374151`,
      } satisfies PendingEvaluation));
  })();

  const templateItems = periods.map((period) => ({
    id: period.period_id,
    title: period.period_name,
    description: `Evaluation period running from ${new Date(period.start_date).toLocaleDateString(
      "en-US",
      { year: "numeric", month: "short", day: "numeric" }
    )} to ${new Date(period.end_date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })}`,
    categories: 5,
    lastModified: new Date(period.created_at ?? period.start_date)
      .toISOString()
      .slice(0, 10),
    isActive: period.is_active,
  } satisfies EvaluationTemplate));

  const analyticsDepartments = (() => {
    const departmentScores = completedItems.reduce<Record<string, { total: number; count: number }>>(
      (accumulator, evaluation) => {
        if (!evaluation.rating) return accumulator;

        const current = accumulator[evaluation.department] ?? { total: 0, count: 0 };
        current.total += evaluation.rating;
        current.count += 1;
        accumulator[evaluation.department] = current;
        return accumulator;
      },
      {}
    );

    const analytics = Object.entries(departmentScores).map(([name, score]) => {
      const average = score.total / score.count;
      return {
        name,
        score: Number(average.toFixed(1)),
        width: `${Math.max(20, Math.min(100, average * 20))}%`,
      };
    });

    return analytics;
  })();

  const ratingDistribution = [
    {
      label: "Excellent(4.5-5.0)",
      count: completedItems.filter((item) => item.rating >= 4.5).length,
      color: "bg-green-500",
    },
    {
      label: "Good(3.5-4.4)",
      count: completedItems.filter((item) => item.rating >= 3.5 && item.rating < 4.5).length,
      color: "bg-indigo-500",
    },
    {
      label: "Satisfactory(2.5-3.4)",
      count: completedItems.filter((item) => item.rating >= 2.5 && item.rating < 3.5).length,
      color: "bg-orange-400",
    },
    {
      label: "Needs Improvement(<2.5)",
      count: completedItems.filter((item) => item.rating < 2.5).length,
      color: "bg-red-500",
    },
  ];

  const loading = employeesLoading || periodsLoading || evaluationsLoading;

  const handleStartEvaluation = (evaluation: PendingEvaluation) => {
    setSelectedEvaluation(evaluation);
    setView("form");
  };

  const handleViewPending = (evaluation: PendingEvaluation) => {
    setViewingPending(evaluation);
    setView("viewPending");
  };

  const handleViewCompleted = (id: string) => {
    const found = completedItems.find((evaluation) => evaluation.id === id);
    if (found) {
      setViewingCompleted(found);
      setView("viewCompleted");
    }
  };

  const handleNewEvaluation = () => {
    setSelectedEvaluation(null);
    setView("form");
  };

  const handleSchedule = () => {
    setView("schedule");
  };

  const handleBackToList = () => {
    setView("list");
    setViewingCompleted(null);
    setViewingPending(null);
    setEditingEvaluation(null);
  };

  const handleEvaluationSaved = () => {
    setView("list");
    setSelectedEvaluation(null);
    setEditingEvaluation(null);
    setActiveTab("completed");
  };

  const handleDeletePending = (id: string) => {
    setDismissedPendingIds((prev) => new Set([...prev, id]));
  };

  const handleEditCompleted = (id: string) => {
    const raw = evaluations.find((e) => e.evaluation_id === id) ?? null;
    if (!raw) {
      toast.error("Could not find evaluation data to edit.");
      return;
    }
    setEditingEvaluation(raw);
    setView("editCompleted");
  };

  const handleStartFromView = () => {
    if (!viewingPending) return;
    setSelectedEvaluation(viewingPending);
    setViewingPending(null);
    setView("form");
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <SkeletonLoading />
      </div>
    );
  }

  // The page uses a small view state machine so the list, form, and detail screens
  // can share the same route while preserving the selected evaluation.
  if (view === "schedule") {
    return <ScheduleEvaluation employeeOptions={pendingItems} onBack={handleBackToList} onSaved={handleEvaluationSaved} />;
  }

  if (view === "viewCompleted" && viewingCompleted) {
    return (
      <ViewEvaluation evaluation={viewingCompleted} onBack={handleBackToList} />
    );
  }

  if (view === "viewPending" && viewingPending) {
    return (
      <ViewEvaluation
        evaluation={buildPendingPreview(viewingPending)}
        onBack={handleBackToList}
        onStartEvaluation={handleStartFromView}
      />
    );
  }

  if (view === "form") {
    return (
      <PerformanceEvaluationForm
        evaluation={selectedEvaluation}
        employeeOptions={pendingItems}
        onBack={handleBackToList}
        onSaved={handleEvaluationSaved}
      />
    );
  }

  if (view === "editCompleted" && editingEvaluation) {
    return (
      <PerformanceEvaluationForm
        editingEvaluation={editingEvaluation}
        employeeOptions={pendingItems}
        onBack={handleBackToList}
        onSaved={handleEvaluationSaved}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <div className="flex flex-col gap-6">
        <PerformanceHeader
          onNewEvaluation={handleNewEvaluation}
          onSchedule={handleSchedule}
        />

        <PerformanceTabs
          active={activeTab}
          pendingCount={pendingItems.length}
          completedCount={completedItems.length}
          onChange={setActiveTab}
        />

        {activeTab === "pending" ? (
          isPureManager ? (
            /* ── Department Manager: only their department ── */
            <div>
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold">M</span>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">
                    {myDepartmentName ? `${myDepartmentName} — Manager Evaluations` : "Manager Evaluations"}
                  </h2>
                  <p className="text-xs text-gray-500">Evaluate employees in your department</p>
                </div>
              </div>
              <PendingEvaluations
                data={pendingItems
                  .filter((item) =>
                    myDepartmentName
                      ? item.department.toLowerCase() === myDepartmentName.toLowerCase()
                      : true
                  )
                  .map((item) => ({ ...item, evaluator: "Department Manager" }))}
                onStart={handleStartEvaluation}
                onView={handleViewPending}
                onDelete={handleDeletePending}
              />
            </div>
          ) : isHR ? (
            /* ── HR: only HR Evaluations section ── */
            <div>
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-xs font-bold">HR</span>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">HR Evaluations</h2>
                  <p className="text-xs text-gray-500">HR department evaluates all employees across the organisation</p>
                </div>
              </div>
              <PendingEvaluations
                data={pendingItems.map((item) => ({ ...item, evaluator: "HR Department" }))}
                onStart={handleStartEvaluation}
                onView={handleViewPending}
                onDelete={handleDeletePending}
              />
            </div>
          ) : (
            /* ── Super Admin: both sections ── */
            <div className="flex flex-col gap-10">
              <div>
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold">M</span>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">Manager Evaluations</h2>
                    <p className="text-xs text-gray-500">Department managers evaluate employees within their team</p>
                  </div>
                </div>
                <PendingEvaluations
                  data={pendingItems.map((item) => ({ ...item, evaluator: "Department Manager" }))}
                  onStart={handleStartEvaluation}
                  onView={handleViewPending}
                  onDelete={handleDeletePending}
                />
              </div>

              <div>
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-xs font-bold">HR</span>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">HR Evaluations</h2>
                    <p className="text-xs text-gray-500">HR department evaluates all employees across the organisation</p>
                  </div>
                </div>
                <PendingEvaluations
                  data={pendingItems.map((item) => ({ ...item, evaluator: "HR Department" }))}
                  onStart={handleStartEvaluation}
                  onView={handleViewPending}
                  onDelete={handleDeletePending}
                />
              </div>
            </div>
          )
        ) : activeTab === "completed" ? (
          <CompletedEvaluations
            data={completedItems}
            onView={handleViewCompleted}
            onEdit={handleEditCompleted}
          />
        ) : activeTab === "templates" ? (
          <EvaluationTemplates
            data={templateItems}
            onActivated={refetchPeriods}
            onCreated={refetchPeriods}
            onDeactivated={refetchPeriods}
            onDeleted={refetchPeriods}
          />
        ) : (
          <PerformanceAnalytics
            analyticsDepartments={analyticsDepartments}
            ratingDistribution={ratingDistribution}
          />
        )}
      </div>
    </div>
  );
};
