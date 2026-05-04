import React, { useState } from "react";
import { PerformanceHeader } from "./components/PerformanceHeader";
import { PerformanceTabs, type PerformanceTabKey } from "./components/PerformanceTabs";
import { PendingEvaluations } from "./components/PendingEvaluations";
import { CompletedEvaluations } from "./components/CompletedEvaluations";
import { EvaluationTemplates } from "./components/EvaluationTemplates";
import { PerformanceAnalytics } from "./components/PerformanceAnalytics";
import { PerformanceEvaluationForm } from "./components/PerformanceEvaluationForm";
import { ViewEvaluation } from "./components/ViewEvaluation";
import { ScheduleEvaluation } from "./components/ScheduleEvaluation";
import {
  completedEvaluations,
  evaluationTemplates,
  pendingEvaluations,
} from "./data";
import type { PendingEvaluation, CompletedEvaluation } from "./data";

type PerformanceView = "list" | "form" | "viewPending" | "viewCompleted" | "schedule";

export const Performance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PerformanceTabKey>("pending");
  const [view, setView] = useState<PerformanceView>("list");
  const [selectedEvaluation, setSelectedEvaluation] = useState<PendingEvaluation | null>(null);
  const [viewingCompleted, setViewingCompleted] = useState<CompletedEvaluation | null>(null);
  const [viewingPending, setViewingPending] = useState<PendingEvaluation | null>(null);

  const handleStartEvaluation = (evaluation: PendingEvaluation) => {
    setSelectedEvaluation(evaluation);
    setView("form");
  };

  const handleViewPending = (evaluation: PendingEvaluation) => {
    setViewingPending(evaluation);
    setView("viewPending");
  };

  const handleViewCompleted = (id: string) => {
    const found = completedEvaluations.find((e) => e.id === id);
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
  };

  // Schedule Evaluation
  if (view === "schedule") {
    return <ScheduleEvaluation onBack={handleBackToList} />;
  }

  // View Completed Evaluation details
  if (view === "viewCompleted" && viewingCompleted) {
    return (
      <ViewEvaluation evaluation={viewingCompleted} onBack={handleBackToList} />
    );
  }

  // View Pending Evaluation details (reuse ViewEvaluation with adapted data)
  if (view === "viewPending" && viewingPending) {
    const adapted: CompletedEvaluation = {
      id: viewingPending.id,
      name: viewingPending.name,
      department: viewingPending.department,
      position: viewingPending.position,
      date: viewingPending.dueDate,
      evaluator: viewingPending.evaluator,
      rating: 0,
      status: "Reviewed",
    };
    return (
      <ViewEvaluation evaluation={adapted} onBack={handleBackToList} />
    );
  }

  // Evaluation form
  if (view === "form") {
    return (
      <PerformanceEvaluationForm evaluation={selectedEvaluation} onBack={handleBackToList} />
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
          pendingCount={pendingEvaluations.length}
          onChange={setActiveTab}
        />

        {activeTab === "pending" && (
          <PendingEvaluations
            data={pendingEvaluations}
            onStart={handleStartEvaluation}
            onView={handleViewPending}
          />
        )}
        {activeTab === "completed" && (
          <CompletedEvaluations
            data={completedEvaluations}
            onView={handleViewCompleted}
          />
        )}
        {activeTab === "templates" && <EvaluationTemplates data={evaluationTemplates} />}
        {activeTab === "analytics" && <PerformanceAnalytics />}
      </div>
    </div>
  );
};
