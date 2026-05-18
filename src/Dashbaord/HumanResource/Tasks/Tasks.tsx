import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/other/Card";
import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import ReusableTable from "../../../components/other/ReusableTable/ReusableTable";
import { createTaskColumns } from "../../../components/Columns/TaskColumns";
import { AddHRTaskForm } from "./AddHRTaskForm";
import TaskDetail from "../../../components/tasks/TaskDetail";
import { useFetchHook } from "../../../Hooks/UseFetchHook";
import { useDeleteHook } from "../../../Hooks/UseDeleteHook";
import usePost from "../../../Hooks/UsePostHook";
import useUpdate from "../../../Hooks/UseUpdateHook";
import {
  type HrTask,
  type HrEmployee,
  type HrDepartment,
} from "../hrApi";
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

type PageView = "list" | "detail" | "add";
type TaskStatus = "todo" | "in_progress" | "in_review" | "completed";

type TaskRow = {
  id: string;
  title: string;
  assignedBy: string;
  assignedTo: string;
  assignee: string;
  projectName: string;
  projectCategory: string;
  progress: number;
  deadline: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: TaskStatus;
  name: string;
  description: string;
  notes: string;
  startDate: string;
  dueDate: string;
  // Raw values needed when sending update payloads
  assignedToIds: string[];
  rawDepartmentId: string;
};

const statusSections: { key: TaskStatus; label: string; color: string }[] = [
  { key: "todo", label: "To Do", color: "bg-gray-400" },
  { key: "in_progress", label: "In Progress", color: "bg-amber-400" },
  { key: "in_review", label: "In Review", color: "bg-purple-400" },
  { key: "completed", label: "Completed", color: "bg-emerald-400" },
];

export const Tasks: React.FC = () => {
  const queryClient = useQueryClient();

  const [view, setView] = useState<PageView>("list");
  const [selectedTask, setSelectedTask] = useState<TaskRow | null>(null);
  const [taskMode, setTaskMode] = useState<"view" | "edit">("view");
  const [openMenuTaskId, setOpenMenuTaskId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<
    Record<TaskStatus, boolean>
  >({
    todo: true,
    in_progress: true,
    in_review: true,
    completed: true,
  });
  const [deleteTaskTarget, setDeleteTaskTarget] = useState<string | null>(null);

  const {
    data: tasksResponse,
    isLoading: loading,
    error,
  } = useFetchHook<{ success: boolean; data: HrTask[] }>(
    "/tasks?page_size=100",
    "hr-tasks"
  );

  const {
    data: employeesResponse,
    isLoading: employeesLoading,
  } = useFetchHook<{ success: boolean; data: HrEmployee[] }>(
    "/employees?page_size=200",
    "hr-tasks-employees"
  );

  const {
    data: departmentsResponse,
    isLoading: departmentsLoading,
  } = useFetchHook<{ success: boolean; data: HrDepartment[] }>(
    "/users/departments",
    "hr-tasks-departments"
  );

  const { mutateAsync: deleteTaskById } = useDeleteHook("/tasks", ["hr-tasks"]);

  const { postData: createTaskData } = usePost();
  const { updateData: updateTaskData } = useUpdate();

  // Close menus on outside click.
  useEffect(() => {
    const close = () => setOpenMenuTaskId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    if (error) {
      toast.error(
        (error as any).response?.data?.message || "Failed to load tasks."
      );
    }
  }, [error]);

  const employeeNameMap = Object.fromEntries(
    (employeesResponse?.data ?? []).map((employee) => [
      employee.user_id,
      `${employee.first_name} ${employee.last_name}`.trim(),
    ])
  );

  const departmentNameMap = Object.fromEntries(
    (departmentsResponse?.data ?? []).map((department) => [
      department.department_id,
      department.department_name,
    ])
  );

  const tasks: TaskRow[] = (tasksResponse?.data ?? []).map((task) => {
    // assigned_to is string[] from listTasks; normalise to always work with IDs
    const assignedToIds: string[] = Array.isArray(task.assigned_to)
      ? task.assigned_to.map((a) => (typeof a === "string" ? a : a.user_id))
      : [];
    const assigneeId = assignedToIds[0] ?? "";
    const mappedStatus: TaskStatus =
      task.status === "DONE"
        ? "completed"
        : task.status === "FOR_REVIEW"
          ? "in_review"
          : task.status === "IN_PROGRESS"
            ? "in_progress"
            : task.status === "TO_DO"
              ? "todo"
              : "todo";
    const progress =
      mappedStatus === "completed"
        ? 100
        : mappedStatus === "in_review"
          ? 85
          : mappedStatus === "in_progress"
            ? 50
            : 0;

    return {
      id: task.task_id,
      title: task.title,
      assignedBy: "System",
      assignedTo: employeeNameMap[assigneeId] ?? "Unassigned",
      assignee: employeeNameMap[assigneeId] ?? "Unassigned",
      projectName:
        departmentNameMap[task.department_id ?? ""] ?? "HR Department",
      projectCategory:
        departmentNameMap[task.department_id ?? ""] ?? "HR Department",
      progress,
      deadline: task.deadline
        ? new Date(task.deadline).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "No deadline",
      priority:
        task.priority === "CRITICAL"
          ? "Critical"
          : task.priority === "HIGH"
            ? "High"
            : task.priority === "LOW"
              ? "Low"
              : "Medium",
      status: mappedStatus,
      name: task.title,
      description: task.description ?? "",
      notes: task.description ?? "",
      startDate: task.created_at
        ? new Date(task.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "N/A",
      dueDate: task.deadline
        ? new Date(task.deadline).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "No deadline",
      assignedToIds: assignedToIds,
      rawDepartmentId: task.department_id ?? "",
    };
  });

  // Derived counts.
  const countByStatus = (s: TaskStatus) => tasks.filter((t) => t.status === s).length;
  const totalTasks = tasks.length;
  const todoCount = countByStatus("todo");
  const inProgressCount = countByStatus("in_progress");
  const completedCount = countByStatus("completed");
  const pageLoading = loading || employeesLoading || departmentsLoading;

  // Handlers.
  const handleViewTask = (task: TaskRow) => {
    setSelectedTask(task);
    setTaskMode("view");
    setView("detail");
    setOpenMenuTaskId(null);
  };

  const handleEditTask = (task: TaskRow) => {
    setSelectedTask(task);
    setTaskMode("edit");
    setView("detail");
    setOpenMenuTaskId(null);
  };

  const handleDeleteTask = (task: TaskRow) => {
    setOpenMenuTaskId(null);
    setDeleteTaskTarget(task.id);
  };

  const confirmDeleteTask = async () => {
    if (!deleteTaskTarget) return;
    try {
      await deleteTaskById(deleteTaskTarget);
      toast.success("Task deleted successfully.");
      if (selectedTask?.id === deleteTaskTarget) {
        setSelectedTask(null);
        setView("list");
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to delete task.");
    } finally {
      setDeleteTaskTarget(null);
    }
  };

  const handleBackToList = () => {
    setView("list");
    setSelectedTask(null);
  };

  const handleAddTask = () => {
    setView("add");
  };

  const handleUpdateNotes = async (notes: string) => {
    if (!selectedTask) return;
    if (selectedTask.assignedToIds.length === 0) {
      toast.error("Cannot update: task has no assigned employee.");
      return;
    }
    if (!selectedTask.rawDepartmentId) {
      toast.error("Cannot update: task has no department assigned.");
      return;
    }
    try {
      await updateTaskData(`/tasks/${selectedTask.id}`, {
        title: selectedTask.title,
        description: notes,
        assigned_to: selectedTask.assignedToIds,
        department_id: selectedTask.rawDepartmentId,
      }, 'patch');
      await queryClient.invalidateQueries({ queryKey: ["hr-tasks"] });
      toast.success("Notes updated.");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to update notes.");
    }
  };

  // Add Task form.
  if (view === "add") {
    if (employeesLoading || departmentsLoading) {
      return <SkeletonLoading />;
    }

    return (
      <AddHRTaskForm
        onBack={handleBackToList}
        departmentOptions={(departmentsResponse?.data ?? []).map(
          (department) => ({
            value: department.department_id,
            label: department.department_name,
          })
        )}
        employeeOptions={(employeesResponse?.data ?? []).map((employee) => ({
          value: employee.user_id,
          label: `${employee.first_name} ${employee.last_name}`.trim(),
        }))}
        onSubmit={async (taskData) => {
          try {
            await createTaskData('/tasks/task', {
              title: taskData.taskName,
              description: taskData.taskDescription
                + (taskData.notes ? `\n\nNotes: ${taskData.notes}` : ""),
              assigned_to: [taskData.assignedTo],
              department_id: taskData.departmentId,
              deadline: taskData.endDate,
              priority:
                taskData.priority === "High"
                  ? "HIGH"
                  : taskData.priority === "Low"
                    ? "LOW"
                    : taskData.priority === "Critical"
                      ? "CRITICAL"
                      : "MEDIUM",
            });
            await queryClient.invalidateQueries({ queryKey: ["hr-tasks"] });
            toast.success("Task created successfully.");
            handleBackToList();
          } catch (createError: any) {
            toast.error(
              createError.response?.data?.message || "Failed to create task."
            );
          }
        }}
      />
    );
  }

  // Task detail view.
  if (view === "detail" && selectedTask) {
    return (
      <TaskDetail
        task={selectedTask}
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

        {/* Summary Cards + Task Sections */}
        {pageLoading ? (
          <SkeletonLoading />
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 w-full md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card
                heading="Total Tasks"
                amount={String(totalTasks)}
                icons={<ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
                currency={`${completedCount} completed`}
              />
              <Card
                heading="To Do"
                amount={String(todoCount)}
                icons={<AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
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
                icons={<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />}
                currency="Finished tasks"
              />
            </div>

            {/* Task Sections */}
            <div className="space-y-6">
            {statusSections.map((section) => {
              const sectionTasks = tasks.filter(
                (t) => t.status === section.key
              );
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
                        onToggleMenu: (id) =>
                          setOpenMenuTaskId(id != null ? String(id) : null),
                        onViewTask: (task) => handleViewTask(task as TaskRow),
                        onEditTask: (task) => handleEditTask(task as TaskRow),
                        onDeleteTask: (task) =>
                          handleDeleteTask(task as TaskRow),
                      })}
                      searchKeys={[
                        "title",
                        "assignee",
                        "projectName",
                        "deadline",
                      ]}
                      filterKey="priority"
                      filterOptions={[
                        { key: "priority", value: "Critical", label: "Critical" },
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
          </>
        )}
      </div>
    </div>
  );
};
