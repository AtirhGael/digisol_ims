import React from "react";

const EmploymentTab: React.FC = () => {
  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-bold mb-6">Employment Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Employment Type
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#42417E]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Start Date<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="mm/dd/yy"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#42417E]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Department<span className="text-red-500">*</span>
          </label>
          <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#42417E] appearance-none bg-white" aria-label="Department" required>
            <option value="">Select gender</option>
            <option value="Development">Development</option>
            <option value="Finance">Finance</option>
            <option value="HR">HR</option>
            <option value="Sales">Sales</option>
            <option value="Operations">Operations</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Position/Title<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#42417E]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Reporting Manager
          </label>
          <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#42417E] appearance-none bg-white" aria-label="Reporting Manager">
            <option value="">Select manager</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Work Location<span className="text-red-500">*</span>
          </label>
          <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#42417E] appearance-none bg-white" aria-label="Work Location" required>
            <option value="">Select location</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Employment Status<span className="text-red-500">*</span>
          </label>
          <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#42417E] appearance-none bg-white" aria-label="Employment Status" required>
            <option value="">Select status</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Probation">Probation</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Probation End Date
          </label>
          <input
            type="text"
            placeholder="mm/dd/yy"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#42417E]"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Work Email<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="@digisol.com"
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#42417E]"
          required
        />
        <span className="text-xs text-gray-500 mt-1 block">Suggested: @digisol.com</span>
      </div>
    </div>
  );
};

export default EmploymentTab;
