import React from "react";

const LeaveSetupTab: React.FC = () => {
  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-bold mb-6">Leave & Attendance Setup</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Annual Leave Days<span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#42417E]"
            defaultValue="30"
            required
          />
          <span className="text-xs text-gray-500 mt-1 block">Default: 30 days</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Sick Leave Days<span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#42417E]"
            defaultValue="10"
            required
          />
          <span className="text-xs text-gray-500 mt-1 block">Default: 10 days</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Personal Leave Days<span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#42417E]"
            defaultValue="5"
            required
          />
          <span className="text-xs text-gray-500 mt-1 block">Default: 5 days</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Work Schedule
          </label>
          <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#42417E] appearance-none bg-white" aria-label="Work Schedule">
            <option value="Standard">Standard</option>
            <option value="Shift">Shift</option>
            <option value="Flexible">Flexible</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Weekly Work Hours
          </label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#42417E]"
            defaultValue="40"
          />
          <span className="text-xs text-gray-500 mt-1 block">Default: 40 hours</span>
        </div>
      </div>
    </div>
  );
};

export default LeaveSetupTab;
