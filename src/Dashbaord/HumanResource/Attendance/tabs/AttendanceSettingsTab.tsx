import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw, Save } from "lucide-react";
import { toast } from "sonner";

import { Label } from "../../../../components/ui/label";
import { Input } from "../../../../components/ui/input";
import SkeletonLoading from "../../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { useFetchHook } from "../../../../Hooks/UseFetchHook";
import type { HrAttendanceRecord } from "../../hrApi";
import { fetchAttendanceSettings, saveAttendanceSettings } from "../../hrApi";

type PaginatedResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
};

type AttendanceSettingsForm = {
  averageCheckInTime: string;
  averageCheckOutTime: string;
  lateCount: string;
  absentCount: string;
  attendanceMethod: string;
  lateAbsenceRatio: string;
};

const emptySettings: AttendanceSettingsForm = {
  averageCheckInTime: "",
  averageCheckOutTime: "",
  lateCount: "",
  absentCount: "",
  attendanceMethod: "",
  lateAbsenceRatio: "",
};

const timeInputClassName =
  "mt-2 h-9 w-full rounded-md border border-gray-300 px-2 text-sm text-gray-700 focus:border-secondary focus:outline-none";

const toMinutes = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.getUTCHours() * 60 + date.getUTCMinutes();
};

const minutesToTime = (minutes: number | null) => {
  if (minutes === null) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

function TimeSettingInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label className="text-gray-400 font-normal">{label}</Label>
      <input
        type="time"
        className={timeInputClassName}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export const AttendanceSettingsTab: React.FC = () => {
  const {
    data: attendanceResponse,
    isLoading,
    error,
    refetch,
  } = useFetchHook<PaginatedResponse<HrAttendanceRecord>>(
    "/attendance?page_size=500",
    "hr-attendance-settings"
  );

  const [alertDepartmentHead, setAlertDepartmentHead] = useState(true);
  const [alertHrForLateArrivals, setAlertHrForLateArrivals] = useState(true);
  const [alertEmployeeForAbsences, setAlertEmployeeForAbsences] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settingsForm, setSettingsForm] = useState<AttendanceSettingsForm>(emptySettings);
  const [hasManualChanges, setHasManualChanges] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error.response?.data?.message || "Failed to load attendance settings.");
    }
  }, [error]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetchAttendanceSettings();
        const data = response.data;
        setAlertDepartmentHead(data.alert_department_head);
        setAlertHrForLateArrivals(data.alert_hr_late_arrivals);
        setAlertEmployeeForAbsences(data.alert_employee_absences);
      } catch {
        // Defaults already set in state
      } finally {
        setSettingsLoaded(true);
      }
    };
    loadSettings();
  }, []);

  const attendance = useMemo(() => attendanceResponse?.data ?? [], [attendanceResponse]);

  const derivedSettings = useMemo<AttendanceSettingsForm>(() => {
    const checkInMinutes = attendance
      .map((record) => toMinutes(record.check_in_time ?? null))
      .filter((value): value is number => value !== null);
    const checkOutMinutes = attendance
      .map((record) => toMinutes(record.check_out_time ?? null))
      .filter((value): value is number => value !== null);

    const average = (values: number[]) =>
      values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : null;

    return {
      averageCheckInTime: minutesToTime(average(checkInMinutes)),
      averageCheckOutTime: minutesToTime(average(checkOutMinutes)),
      lateCount: String(attendance.filter((record) => record.status === "LATE").length),
      absentCount: String(attendance.filter((record) => record.status === "ABSENT").length),
      lateAbsenceRatio: attendance.filter((record) => record.status === "ABSENT").length
        ? (
            attendance.filter((record) => record.status === "LATE").length /
            attendance.filter((record) => record.status === "ABSENT").length
          ).toFixed(2)
        : "0.00",
      attendanceMethod: attendance.some((record) => record.attendance_type === "AUTOMATIC")
        ? "Automatic and manual"
        : "Manual",
    };
  }, [attendance]);

  useEffect(() => {
    if (!hasManualChanges) {
      setSettingsForm(derivedSettings);
    }
  }, [derivedSettings, hasManualChanges]);

  const updateSetting = (field: keyof AttendanceSettingsForm, value: string) => {
    setHasManualChanges(true);
    setSettingsForm((current) => ({ ...current, [field]: value }));
  };

  if (isLoading || !settingsLoaded) {
    return <SkeletonLoading />;
  }

  const refreshSnapshot = async () => {
    try {
      setRefreshing(true);
      await refetch();
      setHasManualChanges(false);
      toast.success("Attendance snapshot refreshed.");
    } catch (refreshError: any) {
      toast.error(refreshError.response?.data?.message || "Failed to refresh attendance snapshot.");
    } finally {
      setRefreshing(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await saveAttendanceSettings({
        alert_department_head: alertDepartmentHead,
        alert_hr_late_arrivals: alertHrForLateArrivals,
        alert_employee_absences: alertEmployeeForAbsences,
      });
      setHasManualChanges(false);
      toast.success("Attendance settings saved successfully.");
    } catch (saveError: any) {
      toast.error(saveError.response?.data?.message || "Failed to save attendance settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 rounded-lg bg-white p-4">
      <div>
        <h1 className="text-lg font-medium">Attendance Configuration</h1>
        <p className="text-sm text-gray-500">
          Live snapshot derived from attendance records already stored in the backend.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <TimeSettingInput
          label="Check In"
          value={settingsForm.averageCheckInTime}
          onChange={(value) => updateSetting("averageCheckInTime", value)}
        />
        <TimeSettingInput
          label="Check Out"
          value={settingsForm.averageCheckOutTime}
          onChange={(value) => updateSetting("averageCheckOutTime", value)}
        />
        <div>
          <Label className="text-gray-400 font-normal">Late Records</Label>
          <Input
            type="number"
            className="mt-2 border border-gray-400"
            value={settingsForm.lateCount}
            onChange={(e) => updateSetting("lateCount", e.target.value)}
          />
        </div>
        <div>
          <Label className="text-gray-400 font-normal">Absent Records</Label>
          <Input
            type="number"
            className="mt-2 border border-gray-400"
            value={settingsForm.absentCount}
            onChange={(e) => updateSetting("absentCount", e.target.value)}
          />
        </div>
        <div>
          <Label className="text-gray-400 font-normal">Attendance Method</Label>
          <Input
            type="text"
            className="mt-2 border border-gray-400"
            value={settingsForm.attendanceMethod}
            onChange={(e) => updateSetting("attendanceMethod", e.target.value)}
          />
        </div>
        <div>
          <Label className="text-gray-400 font-normal">Late to Absence Ratio</Label>
          <Input
            type="text"
            className="mt-2 border border-gray-400"
            value={settingsForm.lateAbsenceRatio}
            onChange={(e) => updateSetting("lateAbsenceRatio", e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-700">Alert Settings</p>
        <div className="space-y-2">
          <label className="flex items-center gap-3 px-4 py-2.5 text-sm text-black">
            <input
              type="checkbox"
              checked={alertDepartmentHead}
              onChange={(e) => setAlertDepartmentHead(e.target.checked)}
            />
            <span>Alert department head when staff is absent</span>
          </label>
          <label className="flex items-center gap-3 px-4 py-2.5 text-sm text-black">
            <input
              type="checkbox"
              checked={alertHrForLateArrivals}
              onChange={(e) => setAlertHrForLateArrivals(e.target.checked)}
            />
            <span>Alert HR when late arrivals exceed 3 per month</span>
          </label>
          <label className="flex items-center gap-3 px-4 py-2.5 text-sm text-black">
            <input
              type="checkbox"
              checked={alertEmployeeForAbsences}
              onChange={(e) => setAlertEmployeeForAbsences(e.target.checked)}
            />
            <span>Alert employee for consecutive absences</span>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          className="inline-flex items-center gap-2 rounded-xl border border-[#3D3C7A] bg-white px-6 py-3 text-sm text-[#3D3C7A] transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={saveSettings}
          disabled={saving}
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Settings"}
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-xl border bg-[#3D3C7A] px-6 py-3 text-sm text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={refreshSnapshot}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh Snapshot"}
        </button>
      </div>
    </div>
  );
};

export default AttendanceSettingsTab;
