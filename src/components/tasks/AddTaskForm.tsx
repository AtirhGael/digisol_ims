import React, { useRef,useEffect, useState } from 'react';
import {X} from 'lucide-react'
import { Button } from '../ui/button';

interface TaskFormData {
  taskName: string;
  taskDescription: string;
  assignedTo: string;
  assignee: string;
  startDate: string;
  endDate: string;
  projectName: string;
  projectCategory: string;
  progress: number;
  priority: string;
  notes: string;
}
interface AddTaskFormProps {
  onClose?: () => void;
  onSubmit?: (data: TaskFormData) => void;
}

const AddTaskForm: React.FC <AddTaskFormProps>= ({ onClose, onSubmit }) => {
  // Local form state for the new task modal.
  const [formData, setFormData] = useState<TaskFormData>({
    taskName: '',
    taskDescription: '',
    assignedTo: '',
    assignee: '',
    startDate: '',
    endDate: '',
    projectName: '',
    projectCategory: 'SW',
    progress: 0,
    priority: 'Low',
    notes: ''
  });

  // Close when clicking outside the dialog.
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        if (onClose) {
          onClose();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  
  }, [onClose]);

  // Prevent background scroll while modal is open.
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto'
    };
  }, []);

  // Generic input change handler for the form fields.
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updatedValue = name === 'progress' ? parseInt(value, 10) || 0 : value;
    setFormData(prev => ({
      ...prev,
      [name]: updatedValue
    }));
  };

  // Submit handler: pass data up and close the dialog.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }

    if (onClose) {
      onClose();
    }
  };

  // Cancel/close without saving.
  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="min-h-screen w-full fixed top-0 left-0 bg-white-50/5 backdrop-blur-sm p-4 sm:p-6">
      <div ref = {dialogRef}
        className="max-w-3xl max-h-125 mx-auto bg-white overflow-y-scroll rounded-lg shadow-sm p-4 sm:p-8">
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-8 py-6 border-b border-gray-200'>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Add New Task</h1>
          <Button
            variant='outline'
            size='md'
            onClick={handleCancel}
            aria-label='Close dialog'
          >
            < X size ={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} id = 'add-task-form'>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Task Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="taskName"
                  value={formData.taskName}
                  onChange={handleInputChange}
                  placeholder="Task Name"
                  className="w-full px-4 py-2 border border-gray-30 rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-blue-300 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Task Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="taskDescription"
                  value={formData.taskDescription}
                  onChange={handleInputChange}
                  placeholder="Describe the task"
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned To <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  >
                    <option value="">Select Name</option>
                    <option value="john">John Doe</option>
                    <option value="jane">Jane Smith</option>
                    <option value="mbongo">Mbongo Elvis</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignee <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="assignee"
                    value={formData.assignee}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  >
                    <option value="">Select Assignee</option>
                    <option value="john">John Doe</option>
                    <option value="jane">Jane Smith</option>
                    <option value="mbongo">Mbongo Elvis</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <select
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                >
                  <option value="">Project Name</option>
                  <option value="project1">Project Alpha</option>
                  <option value="project2">Project Beta</option>
                  <option value="project3">Project Gamma</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="projectCategory"
                  value={formData.projectCategory}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                >
                  <option value="SW">SW</option>
                  <option value="HW">HW</option>
                  <option value="Design">Design</option>
                  <option value="Testing">Testing</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Progress</label>
                <input
                  type="number"
                  name="progress"
                  value={formData.progress}
                  onChange={handleInputChange}
                  min={0}
                  max={100}
                  placeholder="%"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={8}
                  placeholder="Describe notes"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
            <Button
              variant='outline'
              size = 'md'
              type="button"
              onClick={handleCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant='primary'
              size = 'md'
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
            >
              Add Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskForm;
