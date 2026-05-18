import React, { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import LeaveCards from "./components/leaveCards";
import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { useFetchHook } from "../../../Hooks/UseFetchHook";
import { usePatchHook } from "../../../Hooks/usePatchHook";
import PendingRequests from "./tabs/pendingRequests";
import ApprovedLeaves from "./tabs/approvedLeaves";
import LeaveCalendarTab from "./tabs/leaveCalendar";
import RejectedLeaves from "./tabs/rejectedLeaves";
import LeavePolicies from "./tabs/leavePolicies";
import type { HrAttendanceRecord, HrLeaveRequest } from "../hrApi";
import type { LeaveStatus } from "../../../components/Columns/LeaveColumns";

type PaginatedResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
  pagination?: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
  };
};

const LEAVE_TABS = [
  { name: "Pending Requests" },
  { name: "Approved Leaves", badge: null },
  { name: "Leave Calendar", badge: null },
  { name: "Rejected Leaves", badge: null },
  { name: "Leave Policies", badge: null },
];

const WEEK_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const LEAVE_TYPE_COLORS: Record<string, string> = {
  annual: "#6B7280",
  annual_leave: "#6B7280",
  vacation: "#6B7280",
  sick: "#4F46E5",
  sick_leave: "#4F46E5",
  personal: "#06B6D4",
  personal_leave: "#06B6D4",
  training: "#F97316",
  unpaid: "#F87171",
  unpaid_leave: "#F87171",
  attend_event: "#22C55E",
  event: "#22C55E",
  maternity: "#F472B6",
  maternity_leave: "#F472B6",
  paternity: "#8B5CF6",
  paternity_leave: "#8B5CF6",
};

const getLeaveHexColor = (type: string): string => {
  const normalized = type.toLowerCase().replace(/[\s-]+/g, "_");
  return LEAVE_TYPE_COLORS[normalized] ?? "#F59E0B";
};

// Keep Tailwind class version for any remaining uses
const getLeaveColor = (type: string): string => {
  const normalized = type.toLowerCase().replace(/[\s-]+/g, "_");
  switch (normalized) {
    case "annual":
    case "annual_leave":
    case "vacation":
      return "bg-gray-500";
    case "sick":
    case "sick_leave":
      return "bg-indigo-600";
    case "personal":
    case "personal_leave":
      return "bg-cyan-400";
    case "training":
      return "bg-orange-500";
    case "unpaid":
    case "unpaid_leave":
      return "bg-red-400";
    case "attend_event":
    case "event":
      return "bg-green-500";
    case "maternity":
    case "maternity_leave":
      return "bg-pink-400";
    case "paternity":
    case "paternity_leave":
      return "bg-violet-500";
    default:
      return "bg-amber-400";
  }
};

export const LeaveManagement = () => {
  const navigate = useNavigate();
  // The leave page keeps each approval bucket in tabs while sharing one data source.
  const [activeTab, setActiveTab] = useState("Pending Requests");
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const leaveApproval = usePatchHook('/leaves/request', 'patch', ['hr-leaves']);
  const {
    data: leaveRequestsResponse,
    isLoading: loading,
    error,
    refetch,
  } = useFetchHook<PaginatedResponse<HrLeaveRequest>>(
    "/leaves/requests?page_size=200",
    "hr-leaves"
  );
  const {
    data: attendanceResponse,
    isLoading: attendanceLoading,
    error: attendanceError,
  } = useFetchHook<PaginatedResponse<HrAttendanceRecord>>(
    "/attendance?page_size=500",
    "hr-leaves-attendance"
  );
  const pageLoading = loading || attendanceLoading;

  React.useEffect(() => {
    if (error) {
      toast.error(error.response?.data?.message || "Failed to load leave requests.");
    }
  }, [error]);

  React.useEffect(() => {
    if (attendanceError) {
      toast.error(attendanceError.response?.data?.message || "Failed to load attendance records.");
    }
  }, [attendanceError]);

  const today = new Date().toISOString().slice(0, 10);

  const latestAttendanceByEmployee = (attendanceResponse?.data ?? []).reduce<
    Record<string, HrAttendanceRecord>
  >((accumulator, record) => {
    const current = accumulator[record.employee_id];
    if (!current) {
      accumulator[record.employee_id] = record;
      return accumulator;
    }

    if (new Date(record.attendance_date).getTime() > new Date(current.attendance_date).getTime()) {
      accumulator[record.employee_id] = record;
    }

    return accumulator;
  }, {});

  const attendanceToday = (attendanceResponse?.data ?? []).filter(
    (record) => record.attendance_date.slice(0, 10) === today
  );
  const totalAttendanceRecords =
    attendanceResponse?.pagination?.total_count ?? attendanceResponse?.data?.length ?? 0;
  const uniqueAttendanceToday = new Set(attendanceToday.map((record) => record.employee_id));
  const attendanceTodayDetail = (() => {
    const present = attendanceToday.filter((record) => record.status === "PRESENT").length;
    const late = attendanceToday.filter((record) => record.status === "LATE").length;
    const absent = attendanceToday.filter((record) => record.status === "ABSENT").length;

    if (attendanceToday.length === 0) return "Attendance logged";

    return `${present} present, ${late} late, ${absent} absent`;
  })();

  const normalizeAttendanceStatus = React.useCallback((status?: string | null): LeaveStatus => {
    switch (status?.toUpperCase()) {
      case "PRESENT":
        return "Present";
      case "ABSENT":
        return "Absent";
      case "LATE":
        return "Late";
      default:
        return "No Record";
    }
  }, []);

  const requests = (leaveRequestsResponse?.data ?? []).map((request) => ({
    id: request.request_id,
    name: request.employee_name,
    employeeId: request.employee_code,
    department: request.department,
    role: request.role,
    status: (() => {
      const isCurrentlyOnApprovedLeave =
        request.status === "APPROVED" &&
        request.start_date.slice(0, 10) <= today &&
        request.end_date.slice(0, 10) >= today;

      if (isCurrentlyOnApprovedLeave) {
        return "On Leave" as LeaveStatus;
      }

      return normalizeAttendanceStatus(latestAttendanceByEmployee[request.employee_id]?.status);
    })(),
    hireDate: request.hire_date
      ? new Date(request.hire_date).toISOString().slice(0, 10)
      : "-",
    approvalStatus:
      request.status === 'MANAGER_APPROVED'
        ? 'Manager Approved'
        : request.status.charAt(0) + request.status.slice(1).toLowerCase(),
    leaveType: request.leave_type,
    leaveTypeCode: (request.leave_type_code?.toLowerCase() ?? "other").replace(/_leave$/, ""),
    startDate: request.start_date,
    endDate: request.end_date,
    rejectionReason: request.rejection_reason || "No reason provided",
    reason: request.reason || undefined,
  }));

  const calendarDays = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];
    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      const dayDate = new Date(year, month, day);
      const matches = requests.filter((request) => {
        if (request.approvalStatus !== "Approved") return false;
        const start = new Date(request.startDate);
        const end = new Date(request.endDate);
        return dayDate >= start && dayDate <= end;
      });

      days.push({
        day,
        leaves: matches.map((m) => ({
          type: m.leaveTypeCode,
          leaveType: m.leaveType,
          text: m.name,
        })),
        isToday:
          day === now.getDate() &&
          month === now.getMonth() &&
          year === now.getFullYear(),
      });
    }

    const prefix = Array.from({ length: Math.max(0, (firstDay.getDay() + 6) % 7) }).map(
      (_, index) => ({
        day: lastDay.getDate() - (Math.max(0, (firstDay.getDay() + 6) % 7) - index - 1),
        leaves: [],
      })
    );

    return [...prefix, ...days].slice(0, 35);
  })();

  const pendingRequests = requests.filter(
    (request) =>
      request.approvalStatus === "Pending" || request.approvalStatus === "Manager Approved"
  );
  const approvedRequests = requests.filter((request) => request.approvalStatus === "Approved");
  const rejectedRequests = requests.filter((request) => request.approvalStatus === "Rejected");
  const rejectedTabCount = rejectedRequests.length;

  // Build unique leave type options from approved requests for the calendar filter.
  // Normalize codes to strip trailing "_leave" so they match DEFAULT_LEAVE_TYPES keys.
  const normalizeCode = (code: string) => code.replace(/_leave$/, "");
  const leaveTypeOptions = Array.from(
    new Map(
      approvedRequests
        .filter((r) => r.leaveTypeCode && r.leaveType)
        .map((r) => {
          const code = normalizeCode(r.leaveTypeCode);
          return [code, { code, name: r.leaveType }];
        })
    ).values()
  );
  const staffOnLeaveToday = approvedRequests.filter(
    (request) => request.startDate.slice(0, 10) <= today && request.endDate.slice(0, 10) >= today
  );
  const staffOnLeaveDetail =
    staffOnLeaveToday.length > 0
      ? staffOnLeaveToday
          .slice(0, 2)
          .map((request) => request.name)
          .join(", ") + (staffOnLeaveToday.length > 2 ? ` +${staffOnLeaveToday.length - 2} more` : "")
      : "Staff on leave";
  const staffOnLeaveCardValue =
    staffOnLeaveToday.length > 0 ? staffOnLeaveToday.length : approvedRequests.length;
  const attendanceLoggedCardValue =
    uniqueAttendanceToday.size > 0 ? uniqueAttendanceToday.size : totalAttendanceRecords;

  const handleRequestAction = async (
    requestId: string,
    status: "APPROVED" | "REJECTED",
    comments?: string,
  ) => {
    setProcessingRequestId(requestId);
    try {
      const response = await leaveApproval.mutateAsync({ id: requestId, data: { status, comments } });
      await refetch();
      toast.success(
        status === "APPROVED"
          ? "Leave successfully approved"
          : "Leave successfully rejected"
      );
      setActiveTab(status === "APPROVED" ? "Approved Leaves" : "Rejected Leaves");
      return response;
    } catch (error: any) {
      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to update leave request."
      );
      throw error;
    } finally {
      setProcessingRequestId(null);
    }
  };

  if (pageLoading) {
    return <SkeletonLoading />;
  }

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
          <Button buttonType="add" onClick={() => navigate("/dashboard/leavemanagement/request")}>
            Request Leave (Self)
          </Button>
        </div>

        <LeaveCards
          pendingRequests={pendingRequests.length}
          approvedLeaves={approvedRequests.length}
          staffOnLeaveToday={staffOnLeaveCardValue}
          attendanceLoggedToday={attendanceLoggedCardValue}
          staffOnLeaveDetail={staffOnLeaveDetail}
          attendanceTodayDetail={attendanceTodayDetail}
        />

        {/* Tabs */}
        <div className="border-b-2 border-gray-200 overflow-hidden">
          <div className="flex overflow-x-auto scrollbar-hide">
            {/* Tabs drive which HR leave workflow is rendered below. */}
            {LEAVE_TABS.map((tab) => {
              const badge =
                tab.name === "Pending Requests"
                  ? pendingRequests.length
                  : tab.name === "Approved Leaves"
                    ? approvedRequests.length
                    : tab.name === "Rejected Leaves"
                      ? rejectedTabCount
                      : tab.badge;

              return (
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
                  {badge ? (
                    <span className="absolute top-1 sm:top-2 right-1 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center font-bold">
                      {badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "Pending Requests" ? (
        <PendingRequests
          employees={pendingRequests}
          approvedRequests={approvedRequests}
          processingRequestId={processingRequestId}
          onApproveRequest={(id: string, comment?: string) =>
            handleRequestAction(id, "APPROVED", comment)
          }
          onRejectRequest={(id: string, comment?: string) =>
            handleRequestAction(id, "REJECTED", comment)
          }
        />
      ) : activeTab === "Approved Leaves" ? (
        <ApprovedLeaves employees={approvedRequests} />
      ) : activeTab === "Leave Calendar" ? (
        <LeaveCalendarTab
          weekDays={WEEK_DAYS}
          calendarDays={calendarDays}
          getLeaveColor={getLeaveColor}
          getLeaveHexColor={getLeaveHexColor}
          leaveTypeOptions={leaveTypeOptions}
        />
      ) : activeTab === "Rejected Leaves" ? (
        <RejectedLeaves employees={rejectedRequests} />
      ) : (
        <LeavePolicies />
      )}
    </div>
  );
};
