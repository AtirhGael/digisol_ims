import { useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';

// Note: Import this component in your Projects.tsx file

type ProjectStatus = 'Active' | 'Pending' | 'On Hold' | 'Completed';
type ProjectPriority = 'Low' | 'Medium' | 'High';

interface ClientDetails {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  location: string;
  addressLine: string;
  emergencyContact: string;
}

interface ProjectDetails {
  name: string;
  department: string;
  location: string;
  startDate: string;
  endDate: string;
  typeOfProject: string;
  projectCategory: string;
}

interface BillingDetails {
  projectBudget: string;
  expectedExpenses: string;
  reasonsForExpenses: string;
}

interface TeamMember {
  projectLead: string;
  teamMembers: string[];
}

type TabType = 'project' | 'client' | 'billing' | 'team';

export const CreateProject = ({ onBack }: { onBack: () => void }) => {
  // Wizard-like tab state + quick status/priority controls.
  const [activeTab, setActiveTab] = useState<TabType>('project');
  const [status, setStatus] = useState<ProjectStatus>('Active');
  const [priority, setPriority] = useState<ProjectPriority>('Low');
  
  // Form sections state.
  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({
    name: '',
    department: '',
    location: '',
    startDate: '',
    endDate: '',
    typeOfProject: '',
    projectCategory: ''
  });
  
  const [clientDetails, setClientDetails] = useState<ClientDetails>({
    firstName: '',
    lastName: '',
    email: '',
    telephone: '',
    location: '',
    addressLine: '',
    emergencyContact: ''
  });

  const [billingDetails, setBillingDetails] = useState<BillingDetails>({
    projectBudget: '',
    expectedExpenses: '',
    reasonsForExpenses: ''
  });

  const [teamMember, setTeamMember] = useState<TeamMember>({
    projectLead: '',
    teamMembers: []
  });

  // Sample employees list (in a real app, this would come from an API).
  const employees = [
    'Mbongo elvis',
    'Mr Partemus',
    'Gael Atirh',
    'Cecilia Enow',
    'John Doe',
    'Jane Smith',
    'Michael Brown',
    'Sarah Johnson'
  ];

  // Field change handlers by section.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClientDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleProjectInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProjectDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleBillingInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBillingDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleProjectLeadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTeamMember(prev => ({ ...prev, projectLead: e.target.value }));
  };

  const handleTeamMemberToggle = (member: string) => {
    setTeamMember(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(member)
        ? prev.teamMembers.filter(m => m !== member)
        : [...prev.teamMembers, member]
    }));
  };

  const handleRemoveTeamMember = (member: string) => {
    setTeamMember(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(m => m !== member)
    }));
  };

  // Submit handler (replace with API call).
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    toast.success('Project created successfully!');
    onBack();
  };

  // Tab metadata for the header.
  const tabs = [
    { id: 'project' as TabType, label: 'Project Details' },
    { id: 'client' as TabType, label: 'Client Details' },
    { id: 'billing' as TabType, label: 'Billing Details' },
    { id: 'team' as TabType, label: 'Team Members' }
  ];

  return (
    <div className="min-h-screen w-full ">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Projects</h1>
        </div>
        <p className="text-sm text-gray-500 ml-11">Project/Create</p>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Form Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">Create new Project</h2>
          <p className="text-sm text-gray-500">Create new project by filling the from below</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
            {/* Left Column - Form Content */}
            <div>
              {/* Tabs */}
              <div className="border-b border-gray-200 px-4 sm:px-6">
                <div className="flex gap-6 overflow-x-auto no-scrollbar">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-3 sm:py-4 px-1 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-4 sm:p-6">
                {activeTab === 'client' && (
                  <div className="space-y-4 sm:space-y-5">
                    {/* First Name & Last Name */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={clientDetails.firstName}
                          onChange={handleInputChange}
                          placeholder="First Name"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={clientDetails.lastName}
                          onChange={handleInputChange}
                          placeholder="Last Name"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={clientDetails.email}
                        onChange={handleInputChange}
                        placeholder="Enter email"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                        required
                      />
                    </div>

                    {/* Telephone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Telephone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="telephone"
                        value={clientDetails.telephone}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                        required
                      />
                    </div>

                    {/* Location & Address Line */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Location <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={clientDetails.location}
                          onChange={handleInputChange}
                          placeholder="Provide Client Location"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Address Line <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="addressLine"
                          value={clientDetails.addressLine}
                          onChange={handleInputChange}
                          placeholder="Enter address line"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                          required
                        />
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Emergency Contact
                      </label>
                      <textarea
                        name="emergencyContact"
                        value={clientDetails.emergencyContact}
                        onChange={handleInputChange}
                        placeholder="Provide details"
                        rows={4}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none"
                      />
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        onClick={() => setActiveTab('project')}
                        className="px-6 py-2.5 bg-transparent border-0 font-medium text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 w-full sm:w-auto"
                      >
                        Previous
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setActiveTab('billing')}
                        className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-indigo-700 w-full sm:w-auto"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'project' && (
                  <div className="space-y-4 sm:space-y-5">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={projectDetails.name}
                        onChange={handleProjectInputChange}
                        placeholder="Project Name"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                        required
                      />
                    </div>

                    {/* Department & Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Department <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="department"
                          value={projectDetails.department}
                          onChange={handleProjectInputChange}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
                          required
                        >
                          <option value="">Development</option>
                          <option value="Development">Development</option>
                          <option value="Design">Design</option>
                          <option value="Marketing">Marketing</option>
                          <option value="Sales">Sales</option>
                          <option value="HR">HR</option>
                          <option value="Finance">Finance</option>
                          <option value="Operations">Operations</option>
                          <option value="Facility">Facility</option>
                          <option value="Construction">Construction</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Location <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={projectDetails.location}
                          onChange={handleProjectInputChange}
                          placeholder="Project Location"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                          required
                        />
                      </div>
                    </div>

                    {/* Start Date & End Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Start Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={projectDetails.startDate}
                          onChange={handleProjectInputChange}
                          placeholder="12/09/2025"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          End Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="endDate"
                          value={projectDetails.endDate}
                          onChange={handleProjectInputChange}
                          placeholder="09/05/2039"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                          required
                        />
                      </div>
                    </div>

                    {/* Type of Project */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Type of Project <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="typeOfProject"
                        value={projectDetails.typeOfProject}
                        onChange={handleProjectInputChange}
                        placeholder="Project Name"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                        required
                      />
                    </div>

                    {/* Project Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Project Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="projectCategory"
                        value={projectDetails.projectCategory}
                        onChange={handleProjectInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
                        required
                      >
                        <option value="">SW</option>
                        <option value="SW">SW - Software</option>
                        <option value="HW">HW - Hardware</option>
                        <option value="CN">CN - Construction</option>
                        <option value="MK">MK - Marketing</option>
                        <option value="FN">FN - Finance</option>
                        <option value="HR">HR - Human Resources</option>
                        <option value="FC">FC - Facility</option>
                        <option value="OT">OT - Other</option>
                      </select>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        onClick={onBack}
                        className="px-6 py-2.5 bg-transparent border-0 font-medium text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setActiveTab('client')}
                        className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-indigo-700 w-full sm:w-auto"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'billing' && (
                  <div className="space-y-4 sm:space-y-5">
                    {/* Project Budget */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Project Budget <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="projectBudget"
                        value={billingDetails.projectBudget}
                        onChange={handleBillingInputChange}
                        placeholder="Enter Project budget"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                        required
                      />
                    </div>

                    {/* Expected Expenses */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Expected Expenses <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="expectedExpenses"
                        value={billingDetails.expectedExpenses}
                        onChange={handleBillingInputChange}
                        placeholder="Enter Project budget"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                        required
                      />
                    </div>

                    {/* Reasons for Expenses */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Reasons for Expenses
                      </label>
                      <textarea
                        name="reasonsForExpenses"
                        value={billingDetails.reasonsForExpenses}
                        onChange={handleBillingInputChange}
                        placeholder="Expense Breakdown"
                        rows={8}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none"
                      />
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        onClick={() => setActiveTab('client')}
                        className="px-6 py-2.5 bg-transparent border-0 font-medium text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 w-full sm:w-auto"
                      >
                        Previous
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setActiveTab('team')}
                        className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-indigo-700 w-full sm:w-auto"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'team' && (
                  <div className="space-y-4 sm:space-y-5">
                    {/* Project Lead */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Project Lead <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={teamMember.projectLead}
                        onChange={handleProjectLeadChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white text-gray-500"
                        required
                      >
                        <option value="">Select from employees</option>
                        {employees.map((employee) => (
                          <option key={employee} value={employee}>
                            {employee}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Select Team Members */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Select Team Members <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <select
                          onChange={(e) => {
                            if (e.target.value && !teamMember.teamMembers.includes(e.target.value)) {
                              handleTeamMemberToggle(e.target.value);
                            }
                            e.target.value = '';
                          }}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 outline-none text-sm bg-white text-gray-500"
                        >
                          <option value="">Select from employees</option>
                          {employees
                            .filter(emp => !teamMember.teamMembers.includes(emp))
                            .map((employee) => (
                              <option key={employee} value={employee}>
                                {employee}
                              </option>
                            ))}
                        </select>
                      </div>

                      {/* Selected Team Members Tags */}
                      {teamMember.teamMembers.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {teamMember.teamMembers.map((member) => (
                            <div
                              key={member}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary border border-gray-300 rounded-lg text-sm text-gray-700"
                            >
                              <span>{member}</span>
                              <Button
                                type="button"
                                onClick={() => handleRemoveTeamMember(member)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X size={16} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        onClick={() => setActiveTab('billing')}
                        className="px-6 py-2.5 bg-transparent border-0 font-medium text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 w-full sm:w-auto"
                      >
                        Previous
                      </Button>
                      <Button
                        type="submit"
                        className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium text-sm hover:bg-indigo-700 w-full sm:w-auto"
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Status & Priority */}
            <div className="border-t lg:border-t-0 lg:border-l border-gray-200 p-4 sm:p-6 space-y-6 mt-6 lg:mt-0">
              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 outline-none text-sm bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ProjectPriority)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 outline-none text-sm bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
