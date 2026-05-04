import React from "react";

const PersonalInfoTab: React.FC = () => {
  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-bold mb-6">Personal Information</h2>
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Photo Upload
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50">
          <svg
            width="40"
            height="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            className="mb-3 text-gray-400"
          >
            <path d="M12 16V4m0 0l-4 4m4-4l4 4" />
            <rect width="20" height="12" x="2" y="8" rx="2" />
          </svg>
          <span className="text-gray-500 text-sm">
            Drag and drop photo here, or click to browse
          </span>
          <input type="file" className="hidden" accept="image/*" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            First Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#42417E]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Last Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#42417E]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            National ID<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#42417E]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Date of Birth<span className="text-red-500">*</span>
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
            Gender
          </label>
          <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#42417E] appearance-none bg-white" aria-label="Gender">
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Marital Status
          </label>
          <select className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#42417E] appearance-none bg-white" aria-label="Marital Status">
            <option value="">Select status</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Phone Number<span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#42417E]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Personal Email
          </label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#42417E]"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Home Address
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#42417E] resize-none"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Emergency Contact Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#42417E]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Emergency Contact Phone<span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#42417E]"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Emergency Contact Relationship
        </label>
        <input
          type="text"
          placeholder="e.g Spouse, Parent, Sibling"
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#42417E]"
        />
      </div>
    </div>
  );
};

export default PersonalInfoTab;
