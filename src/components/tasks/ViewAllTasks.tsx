import React, { useEffect, useState } from 'react';
import { ChevronUp, ChevronDown, ArrowLeft, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import ReusableTable from '../../components/other/ReusableTable/ReusableTable';
import { createTaskColumns } from '../Columns/TaskColumns';

type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'completed';

type ExpandedSections = {
  [key in TaskStatus]: boolean;
};

interface Task {
  id: number;
  title: string;
  assignee: string;
  projectName: string;
  progress: number;
  deadline: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'todo' | 'in_progress' | 'in_review' | 'completed';
}

interface ViewAllTasksProps {
  onBack?: () => void;
  onTaskClick?: (taskId: number) => void;
  tasks: Task[];
  initialFilter?: TaskStatus | null;
}

const ViewAllTasks: React.FC<ViewAllTasksProps> = ({ 
  onBack, 
  onTaskClick,
  tasks,
  initialFilter = null
}) => {
  // State to expand/collapse sections
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    todo: true,
    in_progress: true,
    in_review: true,
    completed: true
  });

  // State to track which status is being filtered
  const [filteredStatus, setFilteredStatus] = useState<TaskStatus | null>(initialFilter);
  const [openMenuTaskId, setOpenMenuTaskId] = useState<number | null>(null);

  useEffect(() => {
    const handleOutsideClick = () => setOpenMenuTaskId(null);
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // Filter tasks by status
  const filterTasks = (status: string) => tasks.filter(task => task.status === status);

  // Section configuration
  const sections = [
    { 
      key: 'todo' as TaskStatus, 
      label: 'To Do', 
      color: 'bg-gray-400',
      textColor: 'text-gray-700',
      tasks: filterTasks('todo')
    },
    { 
      key: 'in_progress' as TaskStatus, 
      label: 'In Progress', 
      color: 'bg-yellow-400',
      textColor: 'text-yellow-700',
      tasks: filterTasks('in_progress')
    },
    { 
      key: 'in_review' as TaskStatus, 
      label: 'In Review', 
      color: 'bg-purple-400',
      textColor: 'text-purple-700',
      tasks: filterTasks('in_review')
    },
    { 
      key: 'completed' as TaskStatus, 
      label: 'Completed', 
      color: 'bg-teal-400',
      textColor: 'text-teal-700',
      tasks: filterTasks('completed')
    }
  ];

  // Toggle section expand/collapse
  const toggleSection = (key: keyof ExpandedSections) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Handle "In view" button click
  const handleInViewClick = (status: TaskStatus) => {
    setFilteredStatus(status);
  };

  // Handle "Clear Filter" button click
  const handleClearFilter = () => {
    setFilteredStatus(null);
  };

  // Handle task action
  const handleTaskAction = (taskId: number) => {
    if (onTaskClick) {
      onTaskClick(taskId);
    }
  };

  // Get current sections to display
  const currentSections = filteredStatus 
    ? sections.filter(section => section.key === filteredStatus)
    : sections;

  // Get current section info for badge
  const currentSection = filteredStatus 
    ? sections.find(s => s.key === filteredStatus)
    : null;

  return (
    <div className="min-h-screen w-full">
      
      {/* ========== ADDED: Filter indicator at top (only when filtered) ========== */}
      {filteredStatus && currentSection && (
        <div className="px-6 py-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-sm text-gray-600">Viewing:</span>
            <div className="flex flex-wrap items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full">
              <div className={`w-2 h-2 ${currentSection.color} rounded-full`}></div>
              <span className="text-sm font-medium text-indigo-700">
                {currentSection.label}
              </span>
              <span className="text-sm text-gray-500">
                ({currentSection.tasks.length} task{currentSection.tasks.length !== 1 ? 's' : ''})
              </span>
              <button
                onClick={handleClearFilter}
                className="ml-1 hover:bg-indigo-100 rounded-full p-0.5 transition-colors"
                aria-label="Clear filter"
              >
                <X size={14} className="text-indigo-600" />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================================================================= */}

      {/* Task Sections */}
      <div className="space-y-6">
        {currentSections.map((section, index) => {
          const isExpanded = filteredStatus ? true : expandedSections[section.key];
          const sectionTasks = section.tasks;
          // ========== ADDED: Check if this is the first section ========== 
          const isFirstSection = index === 0;
          // ===============================================================

          return (
            <div key={section.key} className="rounded-lg shadow-sm overflow-hidden">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  {/* ========== ADDED: Back button on first section ========== */}
                  {isFirstSection && onBack && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onBack}
                      className="p-1 mr-2"
                    >
                      <ArrowLeft size={20} />
                    </Button>
                  )}
                  {/* ========================================================= */}
                  <div className={`w-1 h-6 ${section.color} rounded`}></div>
                  <span className={`font-semibold ${section.textColor}`}>
                    {section.label}
                  </span>
                  <span className="text-sm text-gray-500">{sectionTasks.length}</span>
                  {!filteredStatus && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection(section.key)}
                      className="p-1"
                    >
                      {isExpanded ? (
                        <ChevronUp size={18} className="text-gray-500" />
                      ) : (
                        <ChevronDown size={18} className="text-gray-500" />
                      )}
                    </Button>
                  )}
                </div>
                {!filteredStatus && (
                  <button 
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline w-full sm:w-auto"
                    onClick={() => handleInViewClick(section.key)}
                  >
                    In view
                  </button>
                )}
              </div>

              {/* Task Table */}
              {isExpanded && (
                <ReusableTable
                  heading={`${section.label} Tasks`}
                  data={sectionTasks}
                  columns={createTaskColumns({
                    openMenuId: openMenuTaskId,
                    onToggleMenu: setOpenMenuTaskId,
                    onViewTask: (task) => handleTaskAction(task.id),
                    showEditDelete: false,
                  })}
                  searchKeys={["title", "assignee", "projectName", "deadline"]}
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
  );
};

export default ViewAllTasks;
