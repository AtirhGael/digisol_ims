import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Calendar,
  ClipboardList,
  FileText,
  CheckCircle,
  Printer,
  Clock,
  Bell,
  MoreVertical,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '../../../components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { Card } from '../../../components/other/Card';
import SkeletonLoading from '../../../components/other/Loader/SkeletonLoading/SkeletonLoading';
import { useFetchHook } from '../../../Hooks/UseFetchHook';
import { useDeleteHook } from '../../../Hooks/UseDeleteHook';
import ReusableTable from '../../../components/other/ReusableTable/ReusableTable';
import { ChartLineLabelCustom } from '../../Finance/Dashboard/component/ChartLineLabelCustom';
import { ChartPieLabelCustom } from '../../Finance/Dashboard/component/ChartPieLabelCustom';
import { ChartBarHorizontal } from './component/ChartBarHorizontal';
import {
  type HrAttendanceRecord,
  type HrEmployee,
  type HrEmployeeEvaluation,
  type HrEvaluationPeriod,
  type HrLeaveRequest,
  type HrRecruitmentPipelineSummary,
  type HrTask,
} from '../hrApi';
import { escapeHtml, openHrPrintPreview } from '../utils/print';

type PaginatedResponse<T> = {
  success: boolean;
  message: string;
  data: T[];
};

type TasksResponse = {
  data: HrTask[];
  pagination?: {
    page: number;
    page_size: number;
    total_count: number;
    total_pages: number;
  };
};

type EmployeeEvaluationsResponse = {
  success: boolean;
  message: string;
  data: HrEmployeeEvaluation[];
};

type EmployeeRow = {
  id: string;
  name: string;
  department: string;
  role: string;
  status: 'Active' | 'On Leave';
  hireDate: string;
};

type LeaveRequestCard = {
  name: string;
  type: string;
  date: string;
};

type PerformanceReviewCard = {
  name: string;
  department: string;
  due: string;
  status: 'Pending' | 'Scheduled' | 'Overdue';
};

type RecentActivityItem = {
  icon: typeof Users;
  title: string;
  subtitle: string;
  time: string;
};

const emptyAttendanceTrendData = [{ month: 'N/A', absent: 0, leaves: 0, present: 0 }];
const emptyLeaveStatusData = [
  { name: 'Pending', value: 100, fill: '#F59E0B', count: 0 },
  { name: 'Approved', value: 0, fill: '#10B981', count: 0 },
  { name: 'Rejected', value: 0, fill: '#EF4444', count: 0 },
];

export const HumanResourceDashboard = () => {
  const navigate = useNavigate();
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeStatusFilter, setEmployeeStatusFilter] = useState('');
  const [openActionId, setOpenActionId] = useState<string | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeRow | null>(null);

  React.useEffect(() => {
    if (!openActionId) return;
    const handleClickOutside = () => setOpenActionId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openActionId]);

  const {
    data: employeesResponse,
    isLoading: employeesLoading,
    error: employeesError,
  } = useFetchHook<PaginatedResponse<HrEmployee>>(
    '/employees?page_size=200',
    'hr-dashboard-employees'
  );
  const {
    data: attendanceResponse,
    isLoading: attendanceLoading,
    error: attendanceError,
  } = useFetchHook<PaginatedResponse<HrAttendanceRecord>>(
    '/attendance?page_size=5000',
    'hr-dashboard-attendance'
  );
  const {
    data: leaveRequestsResponse,
    isLoading: leaveRequestsLoading,
    error: leaveRequestsError,
  } = useFetchHook<PaginatedResponse<HrLeaveRequest>>(
    '/leaves/requests?page_size=200',
    'hr-dashboard-leaves'
  );
  const {
    data: tasksResponse,
    isLoading: tasksLoading,
    error: tasksError,
  } = useFetchHook<TasksResponse>(
    '/tasks?page_size=100',
    'hr-dashboard-tasks'
  );
  const {
    data: periodsResponse,
    isLoading: periodsLoading,
    error: periodsError,
  } = useFetchHook<{ success: boolean; message: string; data: HrEvaluationPeriod[] }>(
    '/evaluation-periods',
    'hr-dashboard-periods'
  );
  const {
    data: recruitmentPipelineResponse,
    isLoading: recruitmentPipelineLoading,
    error: recruitmentPipelineError,
  } = useFetchHook<{ success: boolean; message: string; data: HrRecruitmentPipelineSummary }>(
    '/employees/recruitment/pipeline-summary',
    'hr-dashboard-recruitment-pipeline'
  );
  const {
    data: evaluationsResponse,
    isLoading: evaluationsLoading,
    error: evaluationsError,
  } = useFetchHook<EmployeeEvaluationsResponse>(
    '/evaluations?page_size=500',
    'hr-dashboard-evaluations'
  );
  const deleteEmployeeMutation = useDeleteHook('/employees', [
    'hr-dashboard-employees',
    'hr-employees',
    'employees',
    'hr-onboarding-employees',
    'hr-attendance-employees',
    'hr-performance-employees',
  ]);

  const employeesSource = employeesResponse?.data ?? [];
  const attendanceRecords = attendanceResponse?.data ?? [];
  const leaveRequestsSource = leaveRequestsResponse?.data ?? [];
  const tasksSource = tasksResponse?.data ?? [];
  const periods = periodsResponse?.data ?? [];
  const recruitmentPipeline = recruitmentPipelineResponse?.data;
  const recruitmentPipelineData = recruitmentPipeline?.stages ?? [];

  const evaluations = evaluationsResponse?.data ?? [];
  const firstError =
    employeesError ??
    attendanceError ??
    leaveRequestsError ??
    tasksError ??
    periodsError ??
    recruitmentPipelineError ??
    evaluationsError;

  useEffect(() => {
    if (firstError) {
      toast.error(firstError.response?.data?.message || 'Failed to load HR dashboard data.');
    }
  }, [firstError]);

  const employees = employeesSource.map((employee) => ({
    id: employee.employee_id,
    name: `${employee.first_name} ${employee.last_name}`.trim(),
    department: employee.department?.department_name ?? 'Unassigned',
    role: employee.position,
    status: employee.employment_status === 'ACTIVE' ? 'Active' : 'On Leave',
    hireDate: employee.start_date
      ? new Date(employee.start_date).toISOString().slice(0, 10)
      : '-',
  }));

  const handleDeleteEmployee = (employeeId: string) => {
    const row = employees.find((item) => item.id === employeeId);
    if (!row) return;
    setEmployeeToDelete(row as typeof employeeToDelete);
    setOpenActionId(null);
  };

  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;

    try {
      await deleteEmployeeMutation.mutateAsync(employeeToDelete.id);
      setEmployeeToDelete(null);
      toast.success('Employee record deleted successfully.');
    } catch (deleteError: any) {
      toast.error(deleteError.response?.data?.message || 'Failed to delete employee.');
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const attendanceToday = attendanceRecords.filter(
    (record) => record.attendance_date.slice(0, 10) === today
  );

  const leaveCounts = leaveRequestsSource.reduce<Record<string, number>>((accumulator, request) => {
    accumulator[request.status] = (accumulator[request.status] ?? 0) + 1;
    return accumulator;
  }, {});

  // Convert live leave totals into percentages for the pie chart, with an empty-state fallback.
  const leaveRequestStatusData = (() => {
    const total = leaveRequestsSource.length;

    if (!total) return { chart: emptyLeaveStatusData, summary: emptyLeaveStatusData };

    const all = [
      { name: 'Approved', count: leaveCounts.APPROVED ?? 0, fill: '#10B981' },
      { name: 'Pending',  count: leaveCounts.PENDING  ?? 0, fill: '#F59E0B' },
      { name: 'Rejected', count: leaveCounts.REJECTED ?? 0, fill: '#EF4444' },
    ];

    const summary = all.map((item) => ({
      name: item.name,
      value: Number(((item.count / total) * 100).toFixed(1)),
      fill: item.fill,
      count: item.count,
    }));

    // Chart only shows slices for categories that have at least one request
    const chart = summary.filter((item) => item.count > 0);

    return { chart, summary };
  })();

  const leaveRequests = leaveRequestsSource
    .filter((request) => request.status === 'PENDING')
    .slice(0, 3)
    .map((request) => ({
      name: request.employee_name,
      type: request.leave_type,
      date: `${new Date(request.start_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })} - ${new Date(request.end_date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })} (${request.duration_days} day${request.duration_days > 1 ? 's' : ''})`,
    }));

  // Roll daily attendance records into month buckets for the dashboard trend chart.
  const attendanceTrendData = (() => {
    const attendanceByMonth = attendanceRecords.reduce<
      Record<string, { total: number; present: number; absent: number; late: number; sortKey: number }>
    >((accumulator, record) => {
      const date = new Date(record.attendance_date);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const sortKey = date.getFullYear() * 100 + date.getMonth();
      const current = accumulator[monthKey] ?? { total: 0, present: 0, absent: 0, late: 0, sortKey };
      current.total += 1;
      if (record.status === 'PRESENT') current.present += 1;
      if (record.status === 'ABSENT') current.absent += 1;
      if (record.status === 'LATE') current.late += 1;
      accumulator[monthKey] = current;
      return accumulator;
    }, {});

    const trendData = Object.entries(attendanceByMonth)
      .sort(([, a], [, b]) => a.sortKey - b.sortKey)
      .map(([month, counts]) => ({
        month,
        absent: counts.total ? Math.round((counts.absent / counts.total) * 100) : 0,
        leaves: counts.total ? Math.round((counts.late / counts.total) * 100) : 0,
        present: counts.total ? Math.round((counts.present / counts.total) * 100) : 0,
      }));

    return trendData.length ? trendData : emptyAttendanceTrendData;
  })();

  const activePeriod = periods.find((period) => period.is_active);

  const evaluationsByEmployee = employeesSource.map((employee) => ({
    employee,
    evaluations: evaluations.filter((evaluation) => evaluation.employee_id === employee.employee_id),
  }));

  const performanceReviews = evaluationsByEmployee
    .filter(({ evaluations }) =>
      activePeriod
        ? !evaluations.some((evaluation) => evaluation.period === activePeriod.period_name)
        : evaluations.length === 0
    )
    .slice(0, 4)
    .map(({ employee }) => ({
      name: `${employee.first_name} ${employee.last_name}`.trim(),
      department: employee.department?.department_name ?? 'Unassigned',
      due: activePeriod
        ? new Date(activePeriod.end_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : 'TBD',
      status: 'Pending',
    } satisfies PerformanceReviewCard));

  const recentActivities = [
    ...(employees[0]
      ? [{ icon: Users, title: 'Employee records synced', subtitle: employees[0].name, time: 'Today' }]
      : []),
    ...(leaveRequestsSource[0]
      ? [{ icon: FileText, title: 'Leave requests refreshed', subtitle: leaveRequestsSource[0].employee_name, time: 'Today' }]
      : []),
    ...(tasksSource[0]
      ? [{ icon: ClipboardList, title: 'Task data refreshed', subtitle: tasksSource[0].title, time: 'Recent' }]
      : []),
    ...(attendanceToday[0]
      ? [{ icon: CheckCircle, title: 'Attendance updated', subtitle: attendanceToday[0].employee_name, time: 'Today' }]
      : []),
  ] as RecentActivityItem[];

  const stats = {
    totalEmployees: employees.length,
    presentToday: attendanceToday.filter((record) => record.status === 'PRESENT').length,
    pendingRequests: leaveCounts.PENDING ?? 0,
    openTasks: tasksSource.filter((task) => task.status !== 'DONE').length,
  };

  const loading =
    employeesLoading ||
    attendanceLoading ||
    leaveRequestsLoading ||
    tasksLoading ||
    periodsLoading ||
    recruitmentPipelineLoading ||
    evaluationsLoading;

  const employeeTableColumns = [
    {
      key: 'name',
      header: 'Employee Name',
      render: (_value: unknown, row: EmployeeRow) => (
        <div className="flex items-center gap-2">
          <input type="checkbox" className="w-3 h-3 sm:w-4 sm:h-4 rounded border-gray-300" />
          <span className="text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">
            {row.name}
          </span>
        </div>
      ),
      truncate: false,
    },
    { key: 'department', header: 'Department' },
    { key: 'role', header: 'Role' },
    {
      key: 'status',
      header: 'Status',
      render: (_value: unknown, row: EmployeeRow) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
            row.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {row.status}
        </span>
      ),
      truncate: false,
    },
    { key: 'hireDate', header: 'Hire Date' },
    {
      key: 'actions',
      header: 'Actions',
      cellClassName: 'relative',
      render: (_value: unknown, row: EmployeeRow) => (
        <div className="relative">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setOpenActionId(openActionId === row.id ? null : row.id);
            }}
          >
            <MoreVertical className="w-4 h-4" />
          </div>
          {openActionId === row.id && (
            <div
              className="absolute right-0 mt-2 w-32 bg-white shadow rounded-lg z-50 border"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 hover:rounded-t-lg"
                onClick={() => {
                  setOpenActionId(null);
                  navigate(`/dashboard/employees/${row.id}/edit`);
                }}
              >
                View
              </button>
              <button
                type="button"
                className="block w-full text-left px-4 py-2 hover:bg-gray-100 hover:rounded-b-lg"
                onClick={() => handleDeleteEmployee(row.id)}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      ),
      truncate: false,
    },
  ];

  const exportEmployeesCsv = (data: typeof employees, filename: string) => {
    const header = ['Employee ID', 'Name', 'Department', 'Role', 'Status', 'Hire Date'];
    const rows = data.map((e) =>
      [e.id, e.name, e.department, e.role, e.status, e.hireDate]
        .map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success('Exported successfully.');
  };

  const handleExportAll = () => exportEmployeesCsv(employees, 'hr-employees.csv');

  const handleExportFiltered = () => {
    const filtered = employees.filter((e) => {
      const matchesStatus = !employeeStatusFilter || e.status === employeeStatusFilter;
      const search = employeeSearch.toLowerCase();
      const matchesSearch =
        !search ||
        e.name.toLowerCase().includes(search) ||
        e.department.toLowerCase().includes(search) ||
        e.role.toLowerCase().includes(search) ||
        e.id.toLowerCase().includes(search);
      return matchesStatus && matchesSearch;
    });
    exportEmployeesCsv(filtered, 'hr-employees-filtered.csv');
  };

  const handlePrintDashboard = () => {
    const rows = employees
      .map(
        (employee) => `
          <tr>
            <td>${escapeHtml(employee.name)}</td>
            <td>${escapeHtml(employee.department)}</td>
            <td>${escapeHtml(employee.role)}</td>
            <td>${escapeHtml(employee.status)}</td>
            <td>${escapeHtml(employee.hireDate)}</td>
          </tr>
        `
      )
      .join('');

    const opened = openHrPrintPreview(
      'Human Resources Dashboard',
      `
        <h1>Human Resources Dashboard</h1>
        <p>Exported on ${escapeHtml(new Date().toLocaleDateString())}</p>
        <div class="summary">
          <div class="summary-card"><span>Total Employees</span><strong>${escapeHtml(stats.totalEmployees)}</strong></div>
          <div class="summary-card"><span>Present Today</span><strong>${escapeHtml(stats.presentToday)}</strong></div>
          <div class="summary-card"><span>Pending Requests</span><strong>${escapeHtml(stats.pendingRequests)}</strong></div>
          <div class="summary-card"><span>Open Tasks</span><strong>${escapeHtml(stats.openTasks)}</strong></div>
        </div>
        <h2>Employee Records</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Role</th>
              <th>Status</th>
              <th>Hire Date</th>
            </tr>
          </thead>
          <tbody>${rows || '<tr><td colspan="5">No employee records found.</td></tr>'}</tbody>
        </table>
      `
    );

    if (opened) {
      toast.success('Print dialog opened successfully.');
    } else {
      toast.error('Unable to open print preview. Please allow pop-ups for this site.');
    }
  };

  if (loading) {
    return <SkeletonLoading />;
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Human Resources Dashboard</h1>
            <p className="text-xs sm:text-sm text-gray-500">Dashboard Overview</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="text-xs sm:text-sm" onClick={() => navigate('/dashboard/attendance')}>
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Mark Attendance</span>
              <span className="sm:hidden">Attendance</span>
            </Button>
            <Button variant="outline" buttonType="download" className="text-xs sm:text-sm" onClick={handleExportAll}>
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button variant="outline" className="text-xs sm:text-sm" onClick={handlePrintDashboard}>
              <Printer className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button buttonType="add" className="text-xs sm:text-sm" onClick={() => navigate('/dashboard/employees')}>
              <span className="hidden sm:inline">Add employee</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </header>

      <main style={{ overflow: 'visible' }}>
        <div className="mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 w-full fit md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <button onClick={() => navigate('/dashboard/employees')} className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 text-center">
              <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Add Employee</span>
            </button>
            <button onClick={() => navigate('/dashboard/leavemanagement')} className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 text-center">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Manage Leave</span>
            </button>
            <button onClick={() => navigate('/dashboard/performance')} className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 text-center">
              <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Performance Review</span>
            </button>
            <button onClick={() => navigate('/dashboard/reports')} className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 text-center">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary mx-auto mb-2" />
              <span className="text-xs sm:text-sm font-medium text-gray-700">Generate Report</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 w-full fit md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Card
            heading="Total Employees"
            amount={String(stats.totalEmployees)}
            icons={<Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
            currency="Live employee count"
          />
          <Card
            heading="Present Today"
            amount={String(stats.presentToday)}
            icons={<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
            currency="Based on attendance records"
          />
          <Card
            heading="Pending Requests"
            amount={String(stats.pendingRequests)}
            icons={<Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
            currency="Awaiting approval"
          />
          <Card
            heading="Open Tasks"
            amount={String(stats.openTasks)}
            icons={<ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
            currency="Active HR work items"
          />
        </div>

        <div className="w-full rounded-2xl py-4 px-5 bg-white mb-4 sm:mb-6 relative" style={{ overflow: 'visible' }}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6">
            <div>
              <h3 className="font-medium text-lg">Employee Records</h3>
              <p className="text-xs sm:text-sm text-gray-500">All employee records</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
              <select
                className="border border-gray-200 rounded-sm px-2 py-1 text-sm text-gray-500"
                value={employeeStatusFilter}
                onChange={(e) => setEmployeeStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
              </select>
              <input
                type="text"
                className="border border-gray-200 rounded-lg px-2 py-1 text-sm w-full sm:w-48 text-gray-500"
                placeholder="Search by name, department, or role..."
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
              />
              <Button variant="outline" buttonType="download" className="text-xs sm:text-sm" onClick={handleExportFiltered}>
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button buttonType="add" className="text-xs sm:text-sm" onClick={() => navigate('/dashboard/employees')}>
                <span className="hidden md:inline">Add Employee</span>
                <span className="md:hidden">Add</span>
              </Button>
            </div>
          </div>
          <div className="mt-6">
            <ReusableTable
              columns={employeeTableColumns}
              data={employees}
              itemsPerPage={5}
              searchKeys={['name', 'department', 'role', 'id', 'status', 'hireDate']}
              filterKey="status"
              filterOptions={[
                { key: 'status', value: 'Active', label: 'Active' },
                { key: 'status', value: 'On Leave', label: 'On Leave' },
              ]}
              showToolbar={false}
              showHeading={false}
              showSearch={false}
              showFilter={false}
              searchTerm={employeeSearch}
              onSearchChange={setEmployeeSearch}
              selectedFilter={employeeStatusFilter}
              onFilterChange={setEmployeeStatusFilter}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6 items-stretch">
          <div className="bg-white rounded-lg p-5 border border-gray-100 h-full" id="hr-chart-attendance">
            <ChartLineLabelCustom
              chartData={attendanceTrendData}
              title="Attendance Trends"
              description="Monthly attendance patterns and leave trends"
              showCard={false}
              showRangeSelector={false}
              series={[
                { dataKey: 'absent', label: 'Absent %', color: '#FF4D4F' },
                { dataKey: 'leaves', label: 'Late %', color: '#F59E0B' },
                { dataKey: 'present', label: 'Present %', color: '#10B981' },
              ]}
              yAxisTicks={[0, 25, 50, 75, 100]}
              yAxisDomain={[0, 100]}
              xTickFormatter={(value) => value}
              yTickFormatter={(value) => `${value}`}
            />
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-100 h-full" id="hr-chart-leave-status">
            <ChartPieLabelCustom
              data={leaveRequestStatusData.chart}
              summaryData={leaveRequestStatusData.summary}
              showCard={false}
              title="Leave Request Status"
              description={leaveRequestsSource.length ? `${leaveRequestsSource.length} total request${leaveRequestsSource.length !== 1 ? 's' : ''}` : "No requests yet"}
              outerRadius={78}
              showSummaryList
              chartClassName="mx-auto h-56"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-5 items-stretch">
          <div className="bg-white rounded-lg w-full h-full p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Pending Leave Requests</h3>
                <p className="text-sm text-gray-500">Requires approval</p>
              </div>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {leaveRequests.map((request, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{request.name}</p>
                      <p className="text-sm text-gray-600">{request.type}</p>
                      <p className="text-xs text-gray-500 mt-1">{request.date}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="text-xs" onClick={() => navigate('/dashboard/leavemanagement')}>
                        Approve
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate('/dashboard/leavemanagement')}>
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg w-full h-full p-5 border border-gray-100" id="hr-chart-recruitment">
            <ChartBarHorizontal
              data={recruitmentPipelineData}
              showCard={false}
              title="Recruitment Pipeline"
              description="Live HR intake summary from backend records"
              ctaLabel="View Details"
              ctaTo="/dashboard/humanresource/recruitment-pipeline"
              maxValue={Math.max(...recruitmentPipelineData.map((item) => item.value), 1)}
              xAxisTicks={undefined}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
          <div className="bg-white rounded-lg p-5 border border-gray-100 h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Performance Reviews</h3>
                <p className="text-sm text-gray-500">Upcoming evaluations</p>
              </div>
              <ClipboardList className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {performanceReviews.map((review, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{review.name}</p>
                    <p className="text-sm text-gray-600">{review.department}</p>
                    <p className="text-xs text-gray-500 mt-1">Due: {review.due}</p>
                  </div>
                  <span className="px-3 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                    {review.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-100 h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
                <p className="text-sm text-gray-500">Latest HR activities</p>
              </div>
              <div className="relative">
                <div className="w-2 h-2 bg-red-500 rounded-full absolute -top-1 -right-1" />
                <Bell className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <activity.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.subtitle}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <AlertDialog
        open={employeeToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setEmployeeToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {employeeToDelete?.name ?? 'this employee'}?
              This will terminate the employee record and mark the linked user inactive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel type="button" onClick={() => setEmployeeToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              type="button"
              onClick={confirmDeleteEmployee}
              className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600"
            >
              {deleteEmployeeMutation.isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
