import React from "react";
import { FileEdit, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "../../../../components/ui/button";

export const LeavePolicies: React.FC = () => {
  return (
    <div className="bg-white rounded-lg">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header with Edit Button */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Leave Policies</h2>
          <Button className="text-xs sm:text-sm">Edit Policies</Button>
        </div>

        {/* Annual Leave Policy */}
        <div className="mb-6 p-5 sm:p-6 border border-gray-200 rounded-xl bg-white">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Annual Leave Policy</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-700">
                Employees are entitled to <span className="font-semibold">30 days</span> of annual leave per year
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-700">
                Annual leave accrues monthly at a rate of 2.5 days per month
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-700">
                Maximum carry-over: 5 days to the following year
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-700">
                Minimum notice period: 2 weeks for planned leave
              </p>
            </div>
          </div>
        </div>

        {/* Personal Leave Policy */}
        <div className="mb-6 p-5 sm:p-6 border border-gray-200 rounded-xl bg-white">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Personal Leave Policy</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-700">
                Employees are entitled to 5 days of personal leave per year
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-700">
                Personal leave can be taken for personal matters, family emergencies, or religious observances
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-700">
                Minimum notice period: 3 days where possible
              </p>
            </div>
          </div>
        </div>

        {/* General Leave Policies */}
        <div className="mb-6 p-5 sm:p-6 border border-gray-200 rounded-xl bg-white">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">General Leave Policies</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-700">
                All leave requests must be submitted through the HR system
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-700">
                Leave approval is subject to business needs and team availability
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-700">
                Emergency leave may be granted on a case-by-case basis
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-sm text-gray-700">
                Policy effective date: January 1, 2025
              </p>
            </div>
          </div>
        </div>

        {/* View Policy History Link */}
        <button className="text-primary hover:text-primary/60 duration-100 font-medium text-sm flex items-center gap-2 transition-colors">
          View Policy History
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default LeavePolicies;
