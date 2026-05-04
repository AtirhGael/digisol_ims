import React, { useState } from "react";
import { Upload, User } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { OnboardingType } from "./onboardingData";

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 bg-white transition";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-6 ${className}`}>
      {children}
    </div>
  );
}

interface OnboardingFormProps {
  initialType?: OnboardingType;
  onCancel: () => void;
  onSuccess: () => void;
}

export const OnboardingForm: React.FC<OnboardingFormProps> = ({
  initialType = "employee",
  onCancel,
  onSuccess,
}) => {
  const [onboardingType, setOnboardingType] = useState<OnboardingType>(initialType);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("Active");

  return (
    <div className="flex flex-col gap-4 md:gap-5 p-1 md:p-0">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-400">
        <button onClick={onCancel} className="hover:text-primary transition-colors">
          Staff Onboarding
        </button>
        <span>/</span>
        <span className="text-gray-700 font-medium">
          {onboardingType === "intern" ? "Interns Onboarding" : "Employee Onboarding"}
        </span>
      </nav>

      {/* Header */}
      <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
        {onboardingType === "intern" ? "Interns Onboarding" : "Employee Onboarding"}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form - 2/3 */}
        <div className="lg:col-span-2">
          <SectionCard>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <h2 className="text-base font-semibold text-gray-800">
                {onboardingType === "intern" ? "Intern Onboarding Form" : "Employee Onboarding Form"}
              </h2>
            </div>

            <div className="space-y-6">
              {/* Onboarding Details */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Onboarding Details
                </h3>
                <div className="space-y-1">
                  <label className={labelCls}>
                    Type of onboarding <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={onboardingType}
                    onChange={(e) => setOnboardingType(e.target.value as OnboardingType)}
                    className={inputCls}
                  >
                    <option value="employee">Employee onboarding</option>
                    <option value="intern">Interns onboarding</option>
                  </select>
                </div>

                {onboardingType === "intern" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className={labelCls}>
                        School <span className="text-red-500">*</span>
                      </label>
                      <input type="text" placeholder="Enter your School" className={inputCls} />
                    </div>
                    <div className="space-y-1">
                      <label className={labelCls}>
                        Department <span className="text-red-500">*</span>
                      </label>
                      <input type="text" placeholder="Enter Department" className={inputCls} />
                    </div>
                    <div className="space-y-1">
                      <label className={labelCls}>
                        Speciality <span className="text-red-500">*</span>
                      </label>
                      <input type="text" placeholder="Enter your Speciality" className={inputCls} />
                    </div>
                    <div className="space-y-1">
                      <label className={labelCls}>
                        Level <span className="text-red-500">*</span>
                      </label>
                      <input type="text" placeholder="Enter your Level" className={inputCls} />
                    </div>
                  </div>
                )}

                {onboardingType === "employee" && (
                  <div className="space-y-1">
                    <label className={labelCls}>
                      Department <span className="text-red-500">*</span>
                    </label>
                    <input type="text" placeholder="Enter Department" className={inputCls} />
                  </div>
                )}
              </section>

              {/* Personal Information */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={labelCls}>First Name</label>
                    <input
                      type="text"
                      className={inputCls}
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>Last Name</label>
                    <input
                      type="text"
                      className={inputCls}
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    className={inputCls}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>
                    Telephone Number <span className="text-red-500">*</span>
                  </label>
                  <input type="tel" className={inputCls} />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>
                    Address <span className="text-red-500">*</span>
                  </label>
                  <input type="text" placeholder="Enter your Address" className={inputCls} />
                </div>
              </section>

              {/* Progress & Documentation */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Progress & Documentation
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={labelCls}>
                      Progress <span className="text-red-500">*</span>
                    </label>
                    <input type="text" placeholder="Enter the Progress" className={inputCls} />
                  </div>
                  <div className="space-y-1">
                    <label className={labelCls}>
                      ID Card Number <span className="text-red-500">*</span>
                    </label>
                    <input type="text" className={inputCls} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>
                    Document <span className="text-red-500">*</span>
                  </label>
                  <input type="text" placeholder="Upload Document" className={inputCls} />
                </div>
              </section>
            </div>

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button onClick={onSuccess}>Save</Button>
            </div>
          </SectionCard>
        </div>

        {/* Right Sidebar - 1/3 */}
        <div className="space-y-6">
          {/* Profile Photo */}
          <SectionCard>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Profile Photo</h3>
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                  <User size={36} className="text-gray-400" />
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
                >
                  <Upload size={14} /> Upload Photo
                </button>
                <p className="text-xs text-gray-400 text-center">JPG, PNG or GIF. Max 2MB</p>
              </div>
            </div>
          </SectionCard>

          {/* Status */}
          <SectionCard>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Status</h3>
              <div className="space-y-1">
                <label className={labelCls}>Onboarding Status</label>
                <select
                  className={inputCls}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Active:</strong> Currently in onboarding process
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  <strong>Pending:</strong> Onboarding not yet started
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  <strong>Completed:</strong> Onboarding process finished
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Quick Info */}
          <SectionCard>
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Quick Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">
                    {firstName && lastName ? `${firstName} ${lastName}` : "Not provided"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium truncate ml-2">{email || "Not provided"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{onboardingType}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${
                    status === "Active" ? "text-green-600" :
                    status === "Pending" ? "text-yellow-600" :
                    status === "Completed" ? "text-blue-600" : "text-gray-600"
                  }`}>{status}</span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};
