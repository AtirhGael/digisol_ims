import React, { useState } from "react";
import { toast } from "sonner";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "../../../components/ui/button";
import LeaveCards from "./components/leaveCards";
import PendingRequests from "./tabs/pendingRequests";
import ApprovedLeaves from "./tabs/approvedLeaves";
import LeaveCalendarTab from "./tabs/leaveCalendar";
import RejectedLeaves from "./tabs/rejectedLeaves";
import LeavePolicies from "./tabs/leavePolicies";

export const LeaveManagement = () => {
  const [activeTab, setActiveTab] = useState("Pending Requests");
  const [currentMonth, setCurrentMonth] = useState("September 2024");

  const tabs = [
    { name: "Pending Requests", badge: 3 },
    { name: "Approved Leaves", badge: null },
    { name: "Leave Calendar", badge: null },
    { name: "Rejected Leaves", badge: null },
    { name: "Leave Policies", badge: null },
  ];

  const employees = [
    {
      id: "EMP-001",
      name: "Mr Gael A.",
      employeeId: "EMP-001",
      department: "Development",
      role: "Senior Developer",
      status: "Active",
      hireDate: "2020-01-15",
      approvalStatus: "Approved",
    },
    {
      id: "EMP-002",
      name: "Mme Ebenezer P.",
      employeeId: "EMP-002",
      department: "Finance",
      role: "Accountant",
      status: "Active",
      hireDate: "2019-05-20",
      approvalStatus: "Approved",
    },
    {
      id: "EMP-003",
      name: "Mr Eugene N.",
      employeeId: "EMP-003",
      department: "Sales",
      role: "Sales Manager",
      status: "Active",
      hireDate: "2021-03-10",
      approvalStatus: "Approved",
    },
    {
      id: "EMP-004",
      name: "Ms Favour M.",
      employeeId: "EMP-004",
      department: "HR",
      role: "HR Specialist",
      status: "Active",
      hireDate: "2018-11-30",
      approvalStatus: "Approved",
    },
    {
      id: "EMP-005",
      name: "Mr Elvis M.",
      employeeId: "EMP-005",
      department: "Development",
      role: "Junior Developer",
      status: "On Leave",
      hireDate: "2022-07-01",
      approvalStatus: "Approved",
    },
  ];

  const calendarDays = [
    { day: 29, leaves: [{ type: "personal", count: 1, text: "1 on leave" }] },
    { day: 30, leaves: [] },
    { day: 1, leaves: [] },
    { day: 2, leaves: [] },
    { day: 3, leaves: [] },
    { day: 4, leaves: [] },
    { day: 5, leaves: [] },
    { day: 6, leaves: [] },
    { day: 7, leaves: [] },
    { day: 8, leaves: [] },
    {
      day: 9,
      leaves: [{ type: "annual", count: 2, text: "2 on leave" }],
      isToday: true,
    },
    { day: 10, leaves: [] },
    { day: 11, leaves: [] },
    { day: 12, leaves: [{ type: "sick", count: 2, text: "2 on leave" }] },
    { day: 13, leaves: [] },
    { day: 14, leaves: [] },
    { day: 15, leaves: [] },
    { day: 16, leaves: [] },
    { day: 17, leaves: [] },
    { day: 18, leaves: [] },
    { day: 19, leaves: [] },
    { day: 20, leaves: [] },
    { day: 21, leaves: [] },
    { day: 22, leaves: [] },
    { day: 23, leaves: [{ type: "annual", count: 4, text: "4 on leave" }] },
    { day: 24, leaves: [] },
    { day: 25, leaves: [{ type: "sick", count: 7, text: "7 on leave" }] },
    { day: 26, leaves: [] },
    { day: 27, leaves: [] },
    { day: 28, leaves: [] },
    { day: 29, leaves: [] },
    { day: 30, leaves: [{ type: "personal", count: 7, text: "7 on leave" }] },
    { day: 31, leaves: [] },
    { day: 1, leaves: [], nextMonth: true },
    { day: 2, leaves: [], nextMonth: true },
  ];

  const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const toggleEmployee = (id: string) => {};
  const toggleSelectAll = () => {};

  const handleApprove = (id: string) => {
    toast.success(`Approved leave request for ${id}`, { duration: 4000 });
  };

  const handleReject = (id: string) => {
    toast.error(`Rejected leave request for ${id}`, { duration: 4000 });
  };

  const getLeaveColor = (type: string) => {
    switch (type) {
      case "annual":
        return "bg-gray-500";
      case "sick":
        return "bg-indigo-600";
      case "personal":
        return "bg-cyan-400";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1">
              Leave Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Manage all employee leave requests and balances
            </p>
          </div>
          <Button buttonType="add">Request Leave (Self)</Button>
        </div>

        <LeaveCards />

        {/* Tabs */}
        <div className="border-b-2 border-gray-200 overflow-hidden">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`relative px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  activeTab === tab.name
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.name}
                {tab.badge && (
                  <span className="absolute top-1 sm:top-2 right-1 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "Pending Requests" && (
        <PendingRequests employees={employees} />
      )}

      {activeTab === "Approved Leaves" && (
        <ApprovedLeaves employees={employees} />
      )}

      {activeTab === "Leave Calendar" && (
        <LeaveCalendarTab
          weekDays={weekDays}
          calendarDays={calendarDays}
          getLeaveColor={getLeaveColor}
        />
      )}

      {activeTab === "Rejected Leaves" && (
        <RejectedLeaves employees={employees} />
      )}

      {activeTab === "Leave Policies" && <LeavePolicies />}
    </div>
  );
};
