import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { useUserStore } from "../../../Store/UserStore";
import { Card } from "../../../components/other/Card";
import ReusableTable from "../../../components/other/ReusableTable/ReusableTable";
import { createTaskColumns } from "../../../components/Columns/TaskColumns";
import { AddHRTaskForm } from "./AddHRTaskForm";
import TaskDetail from "../../../components/tasks/TaskDetail";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";

// HR-specific sample tasks.
const hrSampleTasks = [
  {
    id: 1,
    title: "Complete onboarding for new interns",
    assignedBy: "Mrs. Egbe",
    assignedTo: "Prescilia",
    assignee: "Prescilia Ebeh",
    projectName: "HR Operations",
    progress: 60,
    deadline: "April 20 2026",
    priority: "High" as const,
    status: "in_progress",
    name: "Complete onboarding for new interns",
    description:
      "Finalize orientation materials and IT setup for incoming interns",
    startDate: "April 1 2026",
    dueDate: "April 20 2026",
  },
  {
    id: 2,
    title: "Process March payroll adjustments",
    assignedBy: "Mr. Fongang",
    assignedTo: "Grace",
    assignee: "Grace Phillips",
    projectName: "Payroll",
    progress: 100,
    deadline: "April 5 2026",
    priority: "High" as const,
    status: "completed",
    name: "Process March payroll adjustments",
    description: "Review and apply overtime and deductions for the March cycle",
    startDate: "March 28 2026",
    dueDate: "April 5 2026",
  },
  {
    id: 3,
    title: "Schedule Q2 performance reviews",
    assignedBy: "Mrs. Egbe",
    assignedTo: "Ateh",
    assignee: "Ateh Gael",
    projectName: "Performance Management",
    progress: 40,
    deadline: "April 25 2026",
    priority: "Medium" as const,
    status: "todo",
    name: "Schedule Q2 performance reviews",
    description:
      "Coordinate with department heads to schedule evaluation sessions for all employees",
    startDate: "April 10 2026",
    dueDate: "April 25 2026",
  },
  {
    id: 4,
    title: "Update employee handbook policies",
    assignedBy: "Mr. Ateh",
    assignedTo: "Sophie",
    assignee: "Sophie Martin",
    projectName: "HR Operations",
    progress: 75,
    deadline: "April 18 2026",
    priority: "Medium" as const,
    status: "in_progress",
    name: "Update employee handbook policies",
    description:
      "Revise leave policies and remote work guidelines in the employee handbook",
    startDate: "April 2 2026",
    dueDate: "April 18 2026",
  },
  {
    id: 5,
    title: "Conduct exit interview for departing staff",
    assignedBy: "Mrs. Egbe",
    assignedTo: "Amanda",
    assignee: "Amanda Williams",
    projectName: "HR Operations",
    progress: 0,
    deadline: "April 15 2026",
    priority: "Low" as const,
    status: "todo",
    name: "Conduct exit interview for departing staff",
    description: "Prepare exit interview questionnaire and schedule meetings",
    startDate: "April 12 2026",
    dueDate: "April 15 2026",
  },
  {
    id: 6,
    title: "Review and approve leave requests",
    assignedBy: "Mr. Fongang",
    assignedTo: "Lisa",
    assignee: "Lisa Rodriguez",
    projectName: "Leave Management",
    progress: 90,
    deadline: "April 10 2026",
    priority: "High" as const,
    status: "in_review",
    name: "Review and approve leave requests",
    description: "Process all pending leave applications for April",
    startDate: "April 1 2026",
    dueDate: "April 10 2026",
  },
  {
    id: 7,
    title: "Organize team-building event",
    assignedBy: "Mrs. Egbe",
    assignedTo: "Emily",
    assignee: "Emily Nelson",
    projectName: "Employee Engagement",
    progress: 30,
    deadline: "April 30 2026",
    priority: "Low" as const,
    status: "todo",
    name: "Organize team-building event",
    description:
      "Plan and coordinate a team-building activity for all departments",
    startDate: "April 15 2026",
    dueDate: "April 30 2026",
  },
  {
    id: 8,
    title: "Verify attendance records for March",
    assignedBy: "Mr. Ateh",
    assignedTo: "Kevin",
    assignee: "Kevin Park",
    projectName: "Attendance",
    progress: 85,
    deadline: "April 8 2026",
    priority: "Medium" as const,
    status: "in_review",
    name: "Verify attendance records for March",
    description:
      "Cross-check attendance logs with biometric data and resolve discrepancies",
    startDate: "April 1 2026",
    dueDate: "April 8 2026",
  },
  {
    id: 9,
    title: "Prepare training needs assessment",
    assignedBy: "Mrs. Egbe",
    assignedTo: "Rachel",
    assignee: "Rachel Brown",
    projectName: "Training & Development",
    progress: 55,
    deadline: "April 22 2026",
    priority: "Medium" as const,
    status: "in_progress",
    name: "Prepare training needs assessment",
    description:
      "Survey department heads and compile training requirements for Q2",
    startDate: "April 5 2026",
    dueDate: "April 22 2026",
  },
  {
    id: 10,
    title: "Audit employee benefits enrollment",
    assignedBy: "Mr. Fongang",
    assignedTo: "David",
    assignee: "David Thompson",
    projectName: "Benefits",
    progress: 100,
    deadline: "April 3 2026",
    priority: "High" as const,
    status: "completed",
    name: "Audit employee benefits enrollment",
    description:
      "Verify all employees are enrolled in the correct benefits plans",
    startDate: "March 25 2026",
    dueDate: "April 3 2026",
  },
  {
    id: 11,
    title: "Draft recruitment plan for Q2",
    assignedBy: "Mrs. Egbe",
    assignedTo: "Oliver",
    assignee: "Oliver Taylor",
    projectName: "Recruitment",
    progress: 20,
    deadline: "April 28 2026",
    priority: "High" as const,
    status: "todo",
    name: "Draft recruitment plan for Q2",
    description:
      "Identify open positions and prepare job descriptions for upcoming hiring",
    startDate: "April 14 2026",
    dueDate: "April 28 2026",
  },
  {
    id: 12,
    title: "Update HRIS employee records",
    assignedBy: "Mr. Ateh",
    assignedTo: "Charlotte",
    assignee: "Charlotte Hall",
    projectName: "HR Operations",
    progress: 92,
    deadline: "April 9 2026",
    priority: "Low" as const,
    status: "in_review",
    name: "Update HRIS employee records",
    description:
      "Ensure all employee personal and job data is current in the system",
    startDate: "April 1 2026",
    dueDate: "April 9 2026",
  },
  {
    id: 13,
    title: "File quarterly compliance reports",
    assignedBy: "Mr. Fongang",
    assignedTo: "Daniel",
    assignee: "Daniel Martinez",
    projectName: "Compliance",
    progress: 100,
    deadline: "April 2 2026",
    priority: "Medium" as const,
    status: "completed",
    name: "File quarterly compliance reports",
    description:
      "Submit all required labor law and compliance documents for Q1",
    startDate: "March 26 2026",
    dueDate: "April 2 2026",
  },
  {
    id: 14,
    title: "Conduct workplace safety inspection",
    assignedBy: "Mrs. Egbe",
    assignedTo: "Mia",
    assignee: "Mia Robinson",
    projectName: "Health & Safety",
    progress: 50,
    deadline: "April 16 2026",
    priority: "Medium" as const,
    status: "in_progress",
    name: "Conduct workplace safety inspection",
    description:
      "Inspect office facilities and document any safety hazards or improvements needed",
    startDate: "April 7 2026",
    dueDate: "April 16 2026",
  },
  {
    id: 15,
    title: "Resolve employee grievance #HR-042",
    assignedBy: "Mr. Ateh",
    assignedTo: "Noah",
    assignee: "Noah Walker",
    projectName: "Employee Relations",
    progress: 88,
    deadline: "April 11 2026",
    priority: "High" as const,
    status: "in_review",
    name: "Resolve employee grievance #HR-042",
    description: "Investigate and mediate the reported workplace conflict",
    startDate: "April 3 2026",
    dueDate: "April 11 2026",
  },
  {
    id: 16,
    title: "Set up probation review meetings",
    assignedBy: "Mrs. Egbe",
    assignedTo: "Isabella",
    assignee: "Isabella Garcia",
    projectName: "Performance Management",
    progress: 10,
    deadline: "April 27 2026",
    priority: "Low" as const,
    status: "todo",
    name: "Set up probation review meetings",
    description:
      "Schedule and prepare review materials for employees ending their probation",
    startDate: "April 18 2026",
    dueDate: "April 27 2026",
  },
];

type TaskStatus = "todo" | "in_progress" | "in_review" | "completed";
type PageView = "list" | "detail" | "add";

const statusSections: { key: TaskStatus; label: string; color: string }[] = [
  { key: "todo", label: "To Do", color: "bg-gray-400" },
  { key: "in_progress", label: "In Progress", color: "bg-amber-400" },
  { key: "in_review", label: "In Review", color: "bg-purple-400" },
  { key: "completed", label: "Completed", color: "bg-emerald-400" },
];

export const Tasks: React.FC = () => {
  const navigate = useNavigate();
  const roles = useUserStore((state) => state.roles);
  const permissions = useUserStore((state) => state.permissions);

  const checkPermission = (action: string) => {
    if (roles.includes("SUPER_ADMIN")) return true;
    return permissions.some(
      (p) =>
        p.module === "hr" && p.resource_type === "tasks" && p.action === action,
    );
  };
  const [tasks, setTasks] = useState(hrSampleTasks);
  const [view, setView] = useState<PageView>("list");
  const [selectedTask, setSelectedTask] = useState<
    (typeof hrSampleTasks)[0] | null
  >(null);
  const [taskMode, setTaskMode] = useState<"view" | "edit">("view");
  const [openMenuTaskId, setOpenMenuTaskId] = useState<number | null>(null);
  const [expandedSections, setExpandedSections] = useState<
    Record<TaskStatus, boolean>
  >({
    todo: true,
    in_progress: true,
    in_review: true,
    completed: true,
  });
  const [deleteTaskTarget, setDeleteTaskTarget] = useState<number | null>(null);

  // Close menus on outside click.
  useEffect(() => {
    const close = () => setOpenMenuTaskId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  // Derived counts.
  const countByStatus = (s: TaskStatus) =>
    tasks.filter((t) => t.status === s).length;
  const totalTasks = tasks.length;
  const todoCount = countByStatus("todo");
  const inProgressCount = countByStatus("in_progress");
  const completedCount = countByStatus("completed");

  // Handlers.
  const handleViewTask = (task: (typeof hrSampleTasks)[0]) => {
    setSelectedTask(task);
    setTaskMode("view");
    setView("detail");
    setOpenMenuTaskId(null);
  };

  const handleEditTask = (task: (typeof hrSampleTasks)[0]) => {
    if (!checkPermission("UPDATE")) {
      navigate("/dashboard/unauthorized");
      return;
    }
    setSelectedTask(task);
    setTaskMode("edit");
    setView("detail");
    setOpenMenuTaskId(null);
  };

  const handleDeleteTask = (task: (typeof hrSampleTasks)[0]) => {
    setOpenMenuTaskId(null);
    setDeleteTaskTarget(task.id);
  };

  const confirmDeleteTask = () => {
    if (deleteTaskTarget) {
      setTasks((prev) => prev.filter((t) => t.id !== deleteTaskTarget));
      if (selectedTask?.id === deleteTaskTarget) {
        setSelectedTask(null);
        setView("list");
      }
      setDeleteTaskTarget(null);
    }
  };

  const handleBackToList = () => {
    setView("list");
    setSelectedTask(null);
  };

  const handleAddTask = () => {
    if (!checkPermission("CREATE")) {
      navigate("/dashboard/unauthorized");
      return;
    }
    setView("add");
  };

  const handleUpdateNotes = (notes: string) => {
    if (selectedTask) {
      const updated = { ...selectedTask, notes };
      setTasks((prev) =>
        prev.map((t) => (t.id === selectedTask.id ? { ...t, notes } : t)),
      );
      setSelectedTask(updated as any);
    }
  };

  // Add Task form.
  if (view === "add") {
    return (
      <AddHRTaskForm
        onBack={handleBackToList}
        onSubmit={(taskData) => {
          setTasks((prev) => [
            ...prev,
            {
              id: prev.length ? Math.max(...prev.map((t) => t.id)) + 1 : 1,
              title: taskData.taskName,
              assignedBy: "HR Admin",
              assignedTo: taskData.assignedTo,
              assignee: taskData.assignee,
              projectName: taskData.projectName || "HR Operations",
              progress: 0,
              deadline: taskData.endDate || "N/A",
              priority:
                (taskData.priority as "Low" | "Medium" | "High") || "Medium",
              status: "todo",
              name: taskData.taskName,
              description: taskData.taskDescription,
              startDate: taskData.startDate || "N/A",
              dueDate: taskData.endDate || "N/A",
            },
          ]);
          handleBackToList();
        }}
      />
    );
  }

  // Task detail view.
  if (view === "detail" && selectedTask) {
    return (
      <TaskDetail
        task={selectedTask as any}
        mode={taskMode}
        onEdit={() => setTaskMode("edit")}
        onView={() => setTaskMode("view")}
        onDelete={() => setDeleteTaskTarget(selectedTask.id)}
        onCancel={handleBackToList}
        onUpdateNotes={handleUpdateNotes}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <AlertDialog
        open={deleteTaskTarget !== null}
        onOpenChange={(open) => !open && setDeleteTaskTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTask}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">HR Tasks</h1>
            <p className="text-sm text-gray-500">
              Manage and track human resource department tasks
            </p>
          </div>
          <Button onClick={handleAddTask} className="gap-2">
            + Add Task
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 w-full md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card
            heading="Total Tasks"
            amount={String(totalTasks)}
            icons={
              <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            }
            currency={`${completedCount} completed`}
          />
          <Card
            heading="To Do"
            amount={String(todoCount)}
            icons={
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            }
            currency="Pending start"
          />
          <Card
            heading="In Progress"
            amount={String(inProgressCount)}
            icons={<Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />}
            currency="Currently active"
          />
          <Card
            heading="Completed"
            amount={String(completedCount)}
            icons={
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
            }
            currency="Finished tasks"
          />
        </div>

        {/* Task Sections */}
        <div className="space-y-6">
          {statusSections.map((section) => {
            const sectionTasks = tasks.filter((t) => t.status === section.key);
            const isExpanded = expandedSections[section.key];

            return (
              <div
                key={section.key}
                className="bg-white rounded-xl border border-gray-100"
              >
                {/* Section Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-1 h-6 ${section.color} rounded`} />
                    <span className="font-semibold text-gray-700">
                      {section.label}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                      {sectionTasks.length}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedSections((prev) => ({
                          ...prev,
                          [section.key]: !prev[section.key],
                        }))
                      }
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Table */}
                {isExpanded && (
                  <ReusableTable
                    heading=""
                    showHeading={false}
                    data={sectionTasks}
                    columns={createTaskColumns({
                      openMenuId: openMenuTaskId,
                      onToggleMenu: setOpenMenuTaskId,
                      onViewTask: (task) => handleViewTask(task as any),
                      onEditTask: (task) => handleEditTask(task as any),
                      onDeleteTask: (task) => handleDeleteTask(task as any),
                    })}
                    searchKeys={[
                      "title",
                      "assignee",
                      "projectName",
                      "deadline",
                    ]}
                    filterKey="priority"
                    filterOptions={[
                      { key: "priority", value: "High", label: "High" },
                      { key: "priority", value: "Medium", label: "Medium" },
                      { key: "priority", value: "Low", label: "Low" },
                    ]}
                    itemsPerPage={5}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
