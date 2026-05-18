import { lazy } from "react";

// ── Lazy-loaded HR page components ──────────────────────────────────
const HumanResourceDashboard = lazy(() => import("./Dashboard/HumanResourceDashboard").then(m => ({ default: m.HumanResourceDashboard })));
const RecruitmentPipelineDetails = lazy(() => import("./Dashboard/RecruitmentPipelineDetails").then(m => ({ default: m.RecruitmentPipelineDetails })));
const Employees = lazy(() => import("./Employees/Employees").then(m => ({ default: m.Employees })));
const EmployeeEditPage = lazy(() => import("./Employees/EmployeeEditPage").then(m => ({ default: m.EmployeeEditPage })));
const Departments = lazy(() => import("./Departments/Departments"));
const DepartmentDetails = lazy(() => import("./Departments/DepartmentDetails"));
const Onboarding = lazy(() => import("./Onboarding/Onboarding").then(m => ({ default: m.Onboarding })));
const LeaveManagement = lazy(() => import("./Leave Management/Leavemanagement").then(m => ({ default: m.LeaveManagement })));
const RequestLeave = lazy(() => import("./Leave Management/RequestLeave").then(m => ({ default: m.RequestLeave })));
const Attendance = lazy(() => import("./Attendance/Attendance").then(m => ({ default: m.Attendance })));
const Performance = lazy(() => import("./Performance/Performance").then(m => ({ default: m.Performance })));
const Queries = lazy(() => import("./Queries/Queries"));
const SubmitQuery = lazy(() => import("./Queries/SubmitQuery").then(m => ({ default: m.SubmitQuery })));
const HumanResourceReports = lazy(() => import("./Reports/HumanResourceReports").then(m => ({ default: m.HumanResourceReports })));
const Tasks = lazy(() => import("./Tasks/Tasks").then(m => ({ default: m.Tasks })));
const Interns = lazy(() => import("./Interns/Interns").then(m => ({ default: m.default })));
const Offboarding = lazy(() => import("./Offboarding/Offboarding").then(m => ({ default: m.default })));

export type HrPermission = {
  module: string;
  resource: string;
  action: string;
};

type HrRouteConfig = {
  // Path is relative to `/dashboard` so the module plugs into App.tsx cleanly.
  path: string;
  element: JSX.Element;
  permission: HrPermission;
  // When present, the route becomes a sidebar link using the same permission gate.
  navLabel?: string;
};

// Centralized HR routing keeps the router and sidebar aligned.
export const hrRoutes: HrRouteConfig[] = [
  {
    path: "humanresource",
    element: <HumanResourceDashboard />,
    permission: { module: "hr", resource: "employee", action: "READ" },
    navLabel: "Dashboard",
  },
  {
    path: "humanresource/recruitment-pipeline",
    element: <RecruitmentPipelineDetails />,
    permission: { module: "hr", resource: "employee", action: "READ" },
  },
  {
    path: "employees",
    element: <Employees />,
    permission: { module: "hr", resource: "employee", action: "READ" },
    navLabel: "Employees",
  },
  {
    path: "employees/:id/edit",
    element: <EmployeeEditPage />,
    permission: { module: "hr", resource: "employee", action: "UPDATE" },
  },
  {
    path: "interns",
    element: <Interns />,
    permission: { module: "hr", resource: "employee", action: "READ" },
    navLabel: "Interns",
  },
  {
    path: "departments",
    element: <Departments />,
    permission: { module: "hr", resource: "employee", action: "READ" },
    navLabel: "Departments",
  },
  {
    path: "departments/:id",
    element: <DepartmentDetails />,
    permission: { module: "hr", resource: "employee", action: "READ" },
  },
  {
    path: "onboarding",
    element: <Onboarding />,
    permission: { module: "hr", resource: "onboarding", action: "READ" },
    navLabel: "Staff & Interns Onboarding",
  },
  {
    path: "offboarding",
    element: <Offboarding />,
    permission: { module: "hr", resource: "employee", action: "UPDATE" },
    navLabel: "Offboarding",
  },
  {
    path: "leavemanagement",
    element: <LeaveManagement />,
    permission: { module: "hr", resource: "leave_management", action: "READ" },
    navLabel: "Leave Management",
  },
  {
    path: "leavemanagement/request",
    element: <RequestLeave />,
    permission: { module: "hr", resource: "leave_management", action: "CREATE" },
  },
  {
    path: "attendance/*",
    element: <Attendance />,
    permission: { module: "hr", resource: "attendance", action: "READ" },
    navLabel: "Attendance",
  },
  {
    path: "performance",
    element: <Performance />,
    permission: { module: "hr", resource: "performance", action: "READ" },
    navLabel: "Performance",
  },
  {
    path: "queries",
    element: <Queries />,
    permission: { module: "hr", resource: "queries", action: "READ" },
    navLabel: "Queries",
  },
  {
    path: "queries/add",
    element: <SubmitQuery />,
    permission: { module: "hr", resource: "queries", action: "CREATE" },
  },
  {
    path: "reports",
    element: <HumanResourceReports />,
    permission: { module: "hr", resource: "reports", action: "READ" },
    navLabel: "Reports",
  },
  {
    path: "tasks",
    element: <Tasks />,
    permission: { module: "hr", resource: "tasks", action: "READ" },
    navLabel: "Tasks",
  },
];

export const hrNavLinks = hrRoutes
  .filter((route) => route.navLabel)
  .map((route) => ({
    name: route.navLabel as string,
    link: `/dashboard/${route.path.replace(/\/\*$/, "")}`,
    permission: route.permission,
  }));
