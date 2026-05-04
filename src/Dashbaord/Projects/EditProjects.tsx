import { useState } from 'react';
import { ArrowLeft, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';

interface ProjectData {
  projectId: string;
  projectName: string;
  projectBudget: string;
  createdDate: string;
  projectLocation: string;
  projectAddress: string;
  projectType: string;
  department: string;
  totalExpense: string;
  totalExpenseAmount: string;
  client: {
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    tel: string;
    address: string;
    avatar?: string;
  };
}

// Sample data - in a real app, this would come from props or API
const sampleProject: ProjectData = {
  projectId: 'SW09342902',
  projectName: 'ALCEF IMS',
  projectBudget: '300,000FCFA',
  createdDate: '12/09/2025',
  projectLocation: 'Douala',
  projectAddress: 'upTown',
  projectType: 'Software',
  department: 'Development',
  totalExpense: '200,000FCFA',
  totalExpenseAmount: '200,000FCFA',
  client: {
    firstName: 'John',
    middleName: 'Doe',
    lastName: 'Brown',
    email: 'Johndoe@gmail.com',
    tel: '67231818201',
    address: 'Molyko',
    avatar: '' // Placeholder for avatar image
  }
};

export const EditProjects = ({ onBack, projectData = sampleProject }: { onBack: () => void; projectData?: ProjectData }) => {
  // Toggle between read-only and edit mode.
  const [isEditMode, setIsEditMode] = useState(true);
  // Local editable copy of the project.
  const [editedProject, setEditedProject] = useState<ProjectData>(projectData);

  // Enable edit mode.
  const handleEditClick = () => {
    setIsEditMode(true);
  };

  // Save updates (replace with API call).
  const handleSaveClick = () => {
    setIsEditMode(false);
    // Here you would typically save to backend/state management
    toast.success('Project updated successfully!');
  };

  // Cancel edits and restore original data.
  const handleCancelEdit = () => {
    setEditedProject(projectData); // Reset to original data
    setIsEditMode(false);
    onBack();
  };

  // Field-level updates for project and client sections.
  const handleProjectChange = (field: string, value: string) => {
    setEditedProject(prev => ({ ...prev, [field]: value }));
  };

  const handleClientChange = (field: string, value: string) => {
    setEditedProject(prev => ({
      ...prev,
      client: { ...prev.client, [field]: value }
    }));
  };

  return (
    <div className="min-h-screen w-full  md:p-6 lg:p-8 ">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-2 hover:bg-white rounded-lg"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </Button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Edit Projects</h1>
              <p className="text-sm text-gray-500 mt-1">Update current project Details.</p>
            </div>
          </div>
          
          {/* Edit/Save/Cancel Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            {isEditMode ? (
              <>
                <Button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 bg-transparent border-0 text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium text-sm w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  variant='primary'
                  onClick={handleSaveClick}
                  className="flex items-center gap-2 bg-primary hover:bg-primary text-white px-4 py-2 rounded-lg font-medium text-sm w-full sm:w-auto"
                >
                  Save Changes
                </Button>
              </>
            ) : (
                <Button
                  variant ="primary"
                onClick={handleEditClick}
                className="flex items-center gap-2 bg-primary hover:bg-primary text-white px-4 py-2 rounded-lg font-medium text-sm w-full sm:w-auto"
              >
                <Edit  size={18} />
                Edit Project
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-200 rounded-lg shadow-sm p-4 sm:p-6">
        {/* Project Details Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Details.</h2>
          
          {/* Unified background container */}
          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Project ID */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">Project ID</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editedProject.projectId}
                    onChange={(e) => handleProjectChange('projectId', e.target.value)}
                    className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-900">{editedProject.projectId}</p>
                )}
              </div>

              {/* Project Name */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">Project Name</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editedProject.projectName}
                    onChange={(e) => handleProjectChange('projectName', e.target.value)}
                    className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-900">{editedProject.projectName}</p>
                )}
              </div>

              {/* Project Budget */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">Project Bugets</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editedProject.projectBudget}
                    onChange={(e) => handleProjectChange('projectBudget', e.target.value)}
                    className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-900">{editedProject.projectBudget}</p>
                )}
              </div>

              {/* Created Date */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">Created Date</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editedProject.createdDate}
                    onChange={(e) => handleProjectChange('createdDate', e.target.value)}
                    className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-900">{editedProject.createdDate}</p>
                )}
              </div>

              {/* Project Location */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">Project Location</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editedProject.projectLocation}
                    onChange={(e) => handleProjectChange('projectLocation', e.target.value)}
                    className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-900">{editedProject.projectLocation}</p>
                )}
              </div>

              {/* Project Address */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">Project Address</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editedProject.projectAddress}
                    onChange={(e) => handleProjectChange('projectAddress', e.target.value)}
                    className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-900">{editedProject.projectAddress}</p>
                )}
              </div>

              {/* Project Type */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">Project Type</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editedProject.projectType}
                    onChange={(e) => handleProjectChange('projectType', e.target.value)}
                    className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-900">{editedProject.projectType}</p>
                )}
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">Department</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editedProject.department}
                    onChange={(e) => handleProjectChange('department', e.target.value)}
                    className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-900">{editedProject.department}</p>
                )}
              </div>

              {/* Total Expense */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">Total expense</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editedProject.totalExpense}
                    onChange={(e) => handleProjectChange('totalExpense', e.target.value)}
                    className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-900">{editedProject.totalExpense}</p>
                )}
              </div>

              {/* Total Expense (duplicate field in design) */}
              <div>
                <label className="block text-xs text-gray-500 mb-2">Total expense</label>
                {isEditMode ? (
                  <input
                    type="text"
                    value={editedProject.totalExpenseAmount}
                    onChange={(e) => handleProjectChange('totalExpenseAmount', e.target.value)}
                    className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <p className="text-sm font-medium text-gray-900">{editedProject.totalExpenseAmount}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Client Details Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Client Details.</h2>
          
          {/* Unified background container */}
          <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Client Avatar */}
              <div className="shrink-0 self-start">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-white">
                  {editedProject.client.avatar ? (
                    <img 
                      src={editedProject.client.avatar} 
                      alt="Client" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-lineatr-to-br from-indigo-100 to-purple-100">
                      <span className="text-3xl sm:text-4xl font-bold text-indigo-600">
                        {editedProject.client.firstName.charAt(0)}{editedProject.client.lastName.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Client Information Grid */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-xs text-gray-500 mb-2">First Name</label>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={editedProject.client.firstName}
                      onChange={(e) => handleClientChange('firstName', e.target.value)}
                      className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{editedProject.client.firstName}</p>
                  )}
                </div>

                {/* Middle Name */}
                <div>
                  <label className="block text-xs text-gray-500 mb-2">Middle Name</label>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={editedProject.client.middleName}
                      onChange={(e) => handleClientChange('middleName', e.target.value)}
                      className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{editedProject.client.middleName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-xs text-gray-500 mb-2">Last Name</label>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={editedProject.client.lastName}
                      onChange={(e) => handleClientChange('lastName', e.target.value)}
                      className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{editedProject.client.lastName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs text-gray-500 mb-2">Email</label>
                  {isEditMode ? (
                    <input
                      type="email"
                      value={editedProject.client.email}
                      onChange={(e) => handleClientChange('email', e.target.value)}
                      className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{editedProject.client.email}</p>
                  )}
                </div>

                {/* Tel */}
                <div>
                  <label className="block text-xs text-gray-500 mb-2">Tel</label>
                  {isEditMode ? (
                    <input
                      type="tel"
                      value={editedProject.client.tel}
                      onChange={(e) => handleClientChange('tel', e.target.value)}
                      className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{editedProject.client.tel}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs text-gray-500 mb-2">Address</label>
                  {isEditMode ? (
                    <input
                      type="text"
                      value={editedProject.client.address}
                      onChange={(e) => handleClientChange('address', e.target.value)}
                      className="w-full text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="text-sm font-medium text-gray-900">{editedProject.client.address}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
