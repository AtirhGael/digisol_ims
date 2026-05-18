import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, FileText, X } from "lucide-react";

import { Label } from "../../../../components/ui/label";
import { Input } from "../../../../components/ui/input";
import SkeletonLoading from "../../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { useFetchHook } from "../../../../Hooks/UseFetchHook";
import type { HrAttendanceRecord, HrEmployee } from "../../hrApi";
import { buildHrPrintDocument, escapeHtml, openHrPrintPreview } from "../../utils/print";

type PaginatedResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
};

const REPORT_TYPES = [
  "Daily Attendance Summary",
  "Monthly Attendance Report",
  "Department Attendance Analysis",
  "Individual Attendance Report",
  "Late Arrival Report",
  "Absence Trends Report",
];

const summaryCardClass =
  "rounded-xl border border-gray-200 bg-white p-4 shadow-sm";

const statusLabel = (status: string) => {
  if (status === "PRESENT") return "Present";
  if (status === "ABSENT") return "Absent";
  if (status === "LATE") return "Late";
  return status || "Unknown";
};

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "-";

export const AttendanceReportsTab: React.FC = () => {
  const [selectedReportType, setSelectedReportType] = useState(REPORT_TYPES[0]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const {
    data: attendanceResponse,
    isLoading: attendanceLoading,
    error: attendanceError,
  } = useFetchHook<PaginatedResponse<HrAttendanceRecord>>(
    "/attendance?page_size=500",
    "hr-attendance-reports"
  );
  const {
    data: employeesResponse,
    isLoading: employeesLoading,
    error: employeesError,
  } = useFetchHook<PaginatedResponse<HrEmployee>>(
    "/employees?page_size=200",
    "hr-attendance-reports-employees"
  );

  useEffect(() => {
    if (attendanceError) {
      toast.error(attendanceError.response?.data?.message || "Failed to load attendance reports.");
    }
  }, [attendanceError]);

  useEffect(() => {
    if (employeesError) {
      toast.error(employeesError.response?.data?.message || "Failed to load employees.");
    }
  }, [employeesError]);

  const attendance = attendanceResponse?.data ?? [];
  const employees = employeesResponse?.data ?? [];
  const filteredAttendance = useMemo(
    () =>
      attendance.filter((record) => {
        const recordDate = record.attendance_date?.slice(0, 10);
        if (!recordDate) return false;
        if (startDate && recordDate < startDate) return false;
        if (endDate && recordDate > endDate) return false;
        return true;
      }),
    [attendance, endDate, startDate]
  );

  const summary = {
    total: filteredAttendance.length,
    employees: employees.length,
    present: filteredAttendance.filter((record) => record.status === "PRESENT").length,
    absent: filteredAttendance.filter((record) => record.status === "ABSENT").length,
    late: filteredAttendance.filter((record) => record.status === "LATE").length,
    latestRecordDate: filteredAttendance[0]?.attendance_date
      ? formatDate(filteredAttendance[0].attendance_date)
      : "No records",
  };

  const attendanceByDepartment = (() => {
    const departments = filteredAttendance.reduce<Record<string, number>>((accumulator, record) => {
      const name = record.department?.department_name ?? "Unassigned";
      accumulator[name] = (accumulator[name] ?? 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(departments)
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => right.count - left.count);
  })();

  const reportRows = filteredAttendance.map((record) => ({
    date: formatDate(record.attendance_date),
    employee: record.employee_name,
    department: record.department?.department_name ?? "Unassigned",
    status: statusLabel(record.status),
    checkIn: record.check_in_time
      ? new Date(record.check_in_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      : "-",
    checkOut: record.check_out_time
      ? new Date(record.check_out_time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      : "-",
    hours: record.working_hours ?? 0,
  }));

  const reportTitle = `${selectedReportType} - ${startDate || "All"} to ${endDate || "Today"}`;

  const buildReportBody = () => {
    const rows = reportRows
      .map(
        (row) => `
          <tr>
            <td>${escapeHtml(row.date)}</td>
            <td>${escapeHtml(row.employee)}</td>
            <td>${escapeHtml(row.department)}</td>
            <td>${escapeHtml(row.status)}</td>
            <td>${escapeHtml(row.checkIn)}</td>
            <td>${escapeHtml(row.checkOut)}</td>
            <td>${escapeHtml(row.hours)}</td>
          </tr>
        `
      )
      .join("");

    const descriptionLine = description.trim()
      ? `<p>${escapeHtml(description)}</p>`
      : "";

    return `
      <h1>${escapeHtml(reportTitle)}</h1>
      ${descriptionLine}
      <p>Total: ${summary.total} | Present: ${summary.present} | Absent: ${summary.absent} | Late: ${summary.late}</p>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Employee</th>
            <th>Department</th>
            <th>Status</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Hours</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="7">No records found.</td></tr>'}</tbody>
      </table>
    `;
  };

  const previewReport = () => {
    setShowPreview(true);
    toast.success("Report preview generated.");
  };

  const downloadPdf = () => {
    const opened = openHrPrintPreview(reportTitle, buildReportBody());
    if (opened) {
      toast.success("PDF print preview opened.");
    } else {
      toast.error("Unable to open the print preview.");
    }
  };

  const downloadExcel = () => {
    const blob = new Blob([buildHrPrintDocument(reportTitle, buildReportBody())], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "attendance-report.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    toast.success("Excel report downloaded.");
  };

  if (attendanceLoading || employeesLoading) {
    return <SkeletonLoading />;
  }

  return (
    <div className="flex flex-col gap-6 rounded-lg bg-white p-4">
      <div>
        <h1 className="text-lg font-medium">Generate Attendance Report</h1>
        <p className="text-sm text-gray-500">Built from live attendance and employee records.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className={summaryCardClass}>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Total records</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{summary.total}</p>
        </div>
        <div className={summaryCardClass}>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Employees</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{summary.employees}</p>
        </div>
        <div className={summaryCardClass}>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Latest record</p>
          <p className="mt-2 text-sm font-medium text-gray-900">{summary.latestRecordDate}</p>
        </div>
        <div className={summaryCardClass}>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Late arrivals</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{summary.late}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-400">Report Type</p>
          <div className="space-y-2">
            {REPORT_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={`flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition ${
                  selectedReportType === type
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => setSelectedReportType(type)}
              >
                <span className="h-3 w-3 rounded-full bg-primary" />
                <span>{type}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-400">
            Department Breakdown
          </p>
          <div className="space-y-3">
            {attendanceByDepartment.length ? (
              attendanceByDepartment.map((department) => (
                <div key={department.name} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{department.name}</span>
                  <span className="font-medium text-gray-900">{department.count}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No attendance data yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <Label className="text-gray-400 font-normal">Start Date</Label>
          <Input
            type="date"
            className="mt-2 border border-gray-400"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>
        <div>
          <Label className="text-gray-400 font-normal">End Date</Label>
          <Input
            type="date"
            className="mt-2 border border-gray-400"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <Label className="text-gray-400 font-normal">Description</Label>
          <Input
            type="text"
            className="mt-2 border border-gray-400"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional report notes"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-primary bg-primary px-7 py-3 text-sm text-white transition hover:opacity-80"
          onClick={previewReport}
        >
          <FileText className="h-4 w-4" />
          Preview Report
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-gray-400 bg-white px-7 py-3 text-sm text-black transition hover:bg-gray-50"
          onClick={downloadPdf}
        >
          <Download className="h-4 w-4" />
          Download PDF
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-gray-400 bg-white px-7 py-3 text-sm text-black transition hover:bg-gray-50"
          onClick={downloadExcel}
        >
          <Download className="h-4 w-4" />
          Download Excel
        </button>
      </div>

      {showPreview ? (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-gray-900">{reportTitle}</h2>
              {description.trim() ? <p className="text-sm text-gray-500">{description}</p> : null}
            </div>
            <button
              type="button"
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              onClick={() => setShowPreview(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-xs uppercase text-gray-500">
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Employee</th>
                  <th className="px-3 py-2">Department</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Check In</th>
                  <th className="px-3 py-2">Check Out</th>
                  <th className="px-3 py-2">Hours</th>
                </tr>
              </thead>
              <tbody>
                {reportRows.length ? (
                  reportRows.map((row, index) => (
                    <tr key={`${row.employee}-${row.date}-${index}`} className="border-b last:border-0">
                      <td className="px-3 py-2">{row.date}</td>
                      <td className="px-3 py-2">{row.employee}</td>
                      <td className="px-3 py-2">{row.department}</td>
                      <td className="px-3 py-2">{row.status}</td>
                      <td className="px-3 py-2">{row.checkIn}</td>
                      <td className="px-3 py-2">{row.checkOut}</td>
                      <td className="px-3 py-2">{row.hours}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-3 py-4 text-center text-gray-500" colSpan={7}>
                      No attendance records found for this report range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AttendanceReportsTab;
