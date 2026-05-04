import React, { useState } from 'react';
import { Button } from '../ui/button';


// Type definitions
export interface Task {
  id: string;
  name: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  projectCategory: string;
  projectName: string;
  progress: number;
  startDate: string;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High';
  notes?: string;
}

interface TaskDetailProps {
  task: Task;
  mode?: 'view' | 'edit';
  onEdit?: () => void;
  onView?: () => void;
  onDelete?: () => void;
  onCancel?: () => void;
  onUpdateNotes?: (notes: string) => void;
}

const TaskDetailPage: React.FC<TaskDetailProps> = ({
  task,
  mode = 'view',
  onEdit,
  onView,
  onDelete,
  onCancel,
  onUpdateNotes,
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState(task.notes || '');

  const handleSaveNotes = () => {
    if (onUpdateNotes) {
      onUpdateNotes(notes);
    }
    setIsEditingNotes(false);
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-600';
      case 'Medium':
        return 'bg-cyan-100 text-cyan-600';
      case 'Low':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="flex-1 ">
      {/* Header */}
      <div className=" px-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-semibold text-gray-900">
                {mode === 'edit' ? 'Editing Task' : 'Viewing Task'}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              Edit, delete and print invoice from here
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={mode === 'edit' ? onView : onEdit}
              className="px-8 py-2 bg-indigo-900 text-white rounded-md hover:bg-indigo-800 transition-colors font-medium text-sm"
            >
              {mode === 'edit' ? 'View' : 'Edit'}
            </Button>
            <Button
              variant="primary"
              size = 'md' 
              onClick={onCancel}
              className="px-6 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Task Details - Left Column (2/3 width) */}
          <div className="lg:col-span-2 bg-white rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Task Details
            </h2>

            <div className="grid grid-cols-2 gap-x-20 gap-y-6">
              {/* Left side fields */}
              <div className="space-y-5">
                {/* Assigned To */}
                <div>
                  <label className="text-sm text-gray-500 block mb-1">
                    Assigned to
                  </label>
                  <p className="text-gray-900 font-medium">{task.assignedTo}</p>
                </div>

                {/* Assigned By */}
                <div>
                  <label className="text-sm text-gray-500 block mb-1">
                    Assigned By
                  </label>
                  <p className="text-gray-900 font-medium">{task.assignedBy}</p>
                </div>

                {/* Progress */}
                <div>
                  <label className="text-sm text-gray-500 block mb-1">
                    Progress
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-200px">
                      <div
                        className="bg-indigo-900 h-2 rounded-full transition-all"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <span className="text-gray-900 font-medium text-sm">
                      {task.progress}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Right side fields */}
              <div className="space-y-5">
                {/* Project Category */}
                <div>
                  <label className="text-sm text-gray-500 block mb-1">
                    Project Category
                  </label>
                  <p className="text-gray-900 font-medium">
                    {task.projectCategory}
                  </p>
                </div>

                {/* Project Name */}
                <div>
                  <label className="text-sm text-gray-500 block mb-1">
                    Project Name
                  </label>
                  <p className="text-gray-900 font-medium">{task.projectName}</p>
                </div>

                {/* Start Date */}
                <div>
                  <label className="text-sm text-gray-500 block mb-1">
                    Start Date
                  </label>
                  <p className="text-gray-900 font-medium">{task.startDate}</p>
                </div>

                {/* Due Date */}
                <div>
                  <label className="text-sm text-gray-500 block mb-1">
                    Due Date
                  </label>
                  <p className="text-gray-900 font-medium">{task.dueDate}</p>
                </div>
              </div>
            </div>

            {/* Task Name and Description - Full Width */}
            <div className="mt-8 space-y-5">
              {/* Task Name */}
              <div>
                <label className="text-sm text-gray-500 block mb-1">
                  Task Name
                </label>
                <p className="text-gray-900 font-medium">{task.name}</p>
              </div>

              {/* Task Description */}
              <div>
                <label className="text-sm text-gray-500 block mb-1">
                  Task Description
                </label>
                <p className="text-gray-900 leading-relaxed">{task.description}</p>
              </div>
            </div>
          </div>

          {/* Notes and Delete - Right Column (1/3 width) */}
          <div className="space-y-4">
            {/* Notes Section */}
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
                {!isEditingNotes && (
                  <button
                    onClick={() => setIsEditingNotes(true)}
                    className="text-cyan-500 hover:text-cyan-600 text-sm font-medium"
                  >
                    Edit notes
                  </button>
                )}
              </div>

              {isEditingNotes ? (
                <div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full min-h-100px p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-sm"
                    placeholder="Add your notes here..."
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleSaveNotes}
                      className="flex-1 px-4 py-2 bg-indigo-900 text-white rounded-md hover:bg-indigo-800 transition-colors text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setNotes(task.notes || '');
                        setIsEditingNotes(false);
                      }}
                      className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 text-sm leading-relaxed">
                  {notes || 'No notes added yet.'}
                </p>
              )}
            </div>

            {/* Delete Button */}
            <button
              onClick={onDelete}
              className="w-full px-4 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;
