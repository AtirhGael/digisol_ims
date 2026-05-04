import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useUserStore } from "./Store/UserStore";
import { setNavigate } from "./utils/navigationService";
import { Login } from "./Authentication/Login/Login";
import { ResetPassword } from "./Authentication/RestPassword/ResetPassword";
import { Otp } from "./Authentication/Otp/Otp";
import { NewPassword } from "./Authentication/NewPassword/NewPassword";
import { MainDashboard } from "./Dashbaord/MainDashboard/MainDashboard";
import { Layout } from "./components/Menu/Layout";
import { HumanResourceDashboard } from "./Dashbaord/HumanResource/Dashboard/HumanResourceDashboard";
import { Employees } from "./Dashbaord/HumanResource/Employees/Employees";
import Departments from "./Dashbaord/HumanResource/Departments/Departments";
import { Onboarding } from "./Dashbaord/HumanResource/Onboarding/Onboarding";
import { LeaveManagement } from "./Dashbaord/HumanResource/Leave Management/Leavemanagement";
import { Attendance } from "./Dashbaord/HumanResource/Attendance/Attendance";
import { Performance } from "./Dashbaord/HumanResource/Performance/Performance";
import Queries from "./Dashbaord/HumanResource/Queries/Queries";
import { HumanResourceReports } from "./Dashbaord/HumanResource/Reports/HumanResourceReports";
import { Tasks } from "./Dashbaord/HumanResource/Tasks/Tasks";
import { financeRoutes } from "./Dashbaord/Finance/financeRoutes";
import { Users } from "./Dashbaord/Users/Users";
import { RoleManagement } from "./Dashbaord/role managment/roleManagment";
import { Projects } from "./Dashbaord/Projects/Projects";
import { Documents } from "./Dashbaord/Documents/Documents";
import { DevelopmentDashboard } from "./Dashbaord/Development/Dashboard/DevelopmentDashboard";
import { DevelopmentTask } from "./Dashbaord/Development/Tasks/DevelopmentTask";
import { Construction } from "./Dashbaord/Facilities/Constructions/Construction";
import { Power } from "./Dashbaord/Facilities/Power/Power";
import { NotFound } from "./components/NotFound/NotFound";
import { Inventory } from "./Dashbaord/Facilities/Inventory/Inventory";
import { Settings } from "./Dashbaord/Settings/Settings";
import { Notification } from "./Dashbaord/Notification/Notification";
import { Messages } from "./Dashbaord/Message/Messages";
import GeneralTasks from "./Dashbaord/Tasks/GeneralTasks.js";
import { PayrollProvider } from "./Store/PayrollStore";
import { BusinessDevelopmentDashboard } from "./Dashbaord/BusinessDevelopment/Dashboard/BusinessDevelopmentDashboard.js";
import { ProspectionPlanning } from "./Dashbaord/BusinessDevelopment/ProspectPlanning/ProspectionPlanning.js";
import { AddProspectionWrapper } from "./Dashbaord/BusinessDevelopment/ProspectPlanning/AddProspectionWrapper.tsx";
import { EditProspectionWrapper } from "./Dashbaord/BusinessDevelopment/ProspectPlanning/EditProspectionWrapper.tsx";
import ContactsLeads from "./Dashbaord/BusinessDevelopment/ContactLeads/ContactsLeads.js";
import { Clients } from "./Dashbaord/BusinessDevelopment/Clients/Clients.js";
import { ProposalsContracts } from "./Dashbaord/BusinessDevelopment/ProposalContracts/ProposalsContracts.js";
import ViewLeads from "./Dashbaord/BusinessDevelopment/ContactLeads/ViewLeadsDetails/ViewLeads.js";
import { ClientDetailsPage } from "./Dashbaord/BusinessDevelopment/Clients/ClientDetailsPage.js";
import RecordClientInteraction from "./Dashbaord/BusinessDevelopment/Clients/RecordClientInteraction/RecordClientInteraction";
import DepartmentDetails from "./Dashbaord/HumanResource/Departments/DepartmentDetails";
import ViewProspection from "./Dashbaord/BusinessDevelopment/ProspectPlanning/ViewProspection";
import { Authenticate } from "./Hooks/UseAuthenticate.tsx";
import { Loader } from "./components/other/Loader/Loader.tsx";
import RecordNewTransaction from "./Dashbaord/BusinessDevelopment/ContactLeads/RecordNewTransaction/RecordNewTransaction";
import { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute";
import { Unauthorized } from "./Dashbaord/Unauthorized/Unauthorized";
import EditRole from "./Dashbaord/role managment/EditRole";
import ViewRole from "./Dashbaord/role managment/ViewRole";
import CreateRole from "./Dashbaord/role managment/CreateRole";
import { AuditLogs } from "./Dashbaord/AuditLogs/AuditLogs";

function App() {
  const navigate = useNavigate();
  const initializeAuth = useUserStore((state) => state.initializeAuth);
  const isInitialized = useUserStore((state) => state.isInitialized);
  const user = useUserStore((state) => state.user);
  const accessToken = useUserStore((state) => state.accessToken);
  const passwordMustChange = useUserStore((state) => state.passwordMustChange);

  // Register the navigate function so Axios interceptors can use React
  // Router navigation instead of window.location.href (no page reload).
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (!isInitialized) {
    return (
      <>
        <Loader />
      </>
    ); // Prevent flickering or redirecting too early
  }

  return (
    <PayrollProvider>
      <Routes>
        {/* ************* Authentication Routes ************ */}
        {/* Login route */}
        <Route
          path="/"
          element={
            user && accessToken ? (
              passwordMustChange ? (
                <Navigate to="/dashboard/settings?changePassword=true" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              <Login />
            )
          }
        />
        {/* rest password */}
        <Route path="/restpassword" element={<ResetPassword />} />
        {/* verify otp code */}
        <Route path="/otp" element={<Otp />} />
        {/* New password  */}
        <Route path="/newpassword" element={<NewPassword />} />

        {/* ************** dashboard routes ************** */}
        <Route
          path="dashboard"
          element={
            <Authenticate>
              <Layout />
            </Authenticate>
          }
        >
          <Route path="" index element={<MainDashboard />} />
          {/* Unauthorized access page */}
          <Route path="unauthorized" element={<Unauthorized />} />
          {/* Human resource routes */}
          <Route
            path="humanresource"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "hr",
                  resource: "employee",
                  action: "READ",
                }}
              >
                <HumanResourceDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="employees"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "hr",
                  resource: "employee",
                  action: "READ",
                }}
              >
                <Employees />
              </ProtectedRoute>
            }
          />
          <Route
            path="departments"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "hr",
                  resource: "employee",
                  action: "READ",
                }}
              >
                <Departments />
              </ProtectedRoute>
            }
          />
          <Route
            path="departments/:id"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "hr",
                  resource: "employee",
                  action: "READ",
                }}
              >
                <DepartmentDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="onboarding"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "hr",
                  resource: "onboarding",
                  action: "READ",
                }}
              >
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="leavemanagement"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "hr",
                  resource: "leave_management",
                  action: "READ",
                }}
              >
                <LeaveManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="attendance"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "hr",
                  resource: "attendance",
                  action: "READ",
                }}
              >
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="performance"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "hr",
                  resource: "performance",
                  action: "READ",
                }}
              >
                <Performance />
              </ProtectedRoute>
            }
          />
          <Route
            path="queries"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "hr",
                  resource: "queries",
                  action: "READ",
                }}
              >
                <Queries />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "hr",
                  resource: "reports",
                  action: "READ",
                }}
              >
                <HumanResourceReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="tasks"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "hr",
                  resource: "tasks",
                  action: "READ",
                }}
              >
                <Tasks />
              </ProtectedRoute>
            }
          />

          {/* ******** finance routes ********* */}
          {/* Each finance route is protected by its own resource permission so
              a user who has (e.g.) expenses:READ is not blocked from the
              Expenses page just because they don't have transactions:READ. */}
          {financeRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <ProtectedRoute
                  requiredPermission={{
                    module: "finance",
                    resource: route.permissionResource ?? "transactions",
                    action: "READ",
                  }}
                >
                  {route.element}
                </ProtectedRoute>
              }
            />
          ))}
          {/* users routes */}
          <Route
            path="users"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "admin",
                  resource: "users",
                  action: "READ",
                }}
              >
                <Users />
              </ProtectedRoute>
            }
          />
          {/* role management routes */}
          <Route
            path="rolemanagement/create"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "admin",
                  resource: "roles",
                  action: "CREATE",
                }}
              >
                <CreateRole />
              </ProtectedRoute>
            }
          />
          <Route
            path="rolemanagement"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "admin",
                  resource: "roles",
                  action: "READ",
                }}
              >
                <RoleManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="rolemanagement/edit/:id"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "admin",
                  resource: "roles",
                  action: "UPDATE",
                }}
              >
                <EditRole />
              </ProtectedRoute>
            }
          />
          <Route
            path="rolemanagement/view/:id"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "admin",
                  resource: "roles",
                  action: "READ",
                }}
              >
                <ViewRole />
              </ProtectedRoute>
            }
          />
          {/* audit logs — Super Admin only */}
          <Route
            path="audit-logs"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "admin",
                  resource: "users",
                  action: "READ",
                }}
                superAdminOnly
              >
                <AuditLogs />
              </ProtectedRoute>
            }
          />
          {/* projects routes */}
          <Route
            path="projects"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "projects",
                  resource: "projects",
                  action: "READ",
                }}
              >
                <Projects />
              </ProtectedRoute>
            }
          />
          {/* documents routes */}
          <Route
            path="documents"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "documents",
                  resource: "documents",
                  action: "READ",
                }}
              >
                <Documents />
              </ProtectedRoute>
            }
          />
          {/* BUSINESS DEVELOPMENT */}
          <Route
            path="businessdevelopment"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "business_development",
                  resource: "clients",
                  action: "READ",
                }}
              >
                <BusinessDevelopmentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="prospectionplanning"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "business_development",
                  resource: "leads",
                  action: "READ",
                }}
              >
                <ProspectionPlanning />
              </ProtectedRoute>
            }
          />
          <Route
            path="prospectionplanning/add"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "business_development",
                  resource: "leads",
                  action: "CREATE",
                }}
              >
                <AddProspectionWrapper />
              </ProtectedRoute>
            }
          />
          <Route
            path="prospectionplanning/edit/:id"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "business_development",
                  resource: "leads",
                  action: "UPDATE",
                }}
              >
                <EditProspectionWrapper />
              </ProtectedRoute>
            }
          />
          <Route
            path="prospectionplanning/view/:id"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "business_development",
                  resource: "leads",
                  action: "READ",
                }}
              >
                <ViewProspection />
              </ProtectedRoute>
            }
          />
          <Route
            path="contactsleads"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "business_development",
                  resource: "leads",
                  action: "READ",
                }}
              >
                <ContactsLeads />
              </ProtectedRoute>
            }
          />
          <Route
            path="contactsleads/:id/view"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "business_development",
                  resource: "leads",
                  action: "READ",
                }}
              >
                <ContactsLeads />
              </ProtectedRoute>
            }
          />
          <Route
            path="contactsleads/:id/edit"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "business_development",
                  resource: "leads",
                  action: "UPDATE",
                }}
              >
                <ContactsLeads />
              </ProtectedRoute>
            }
          />
          <Route
            path="contactsleads/view-leads/:id"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "business_development",
                  resource: "leads",
                  action: "READ",
                }}
              >
                <ViewLeads />
              </ProtectedRoute>
            }
          />
          <Route
            path="recordnewinteraction"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "business_development",
                  resource: "clients",
                  action: "CREATE",
                }}
              >
                <RecordNewTransaction />
              </ProtectedRoute>
            }
          />
          <Route
            path="recordnewinteraction/:id"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "business_development",
                  resource: "clients",
                  action: "CREATE",
                }}
              >
                <RecordNewTransaction />
              </ProtectedRoute>
            }
          />
          <Route
            path="clients"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "business_development",
                  resource: "clients",
                  action: "READ",
                }}
              >
                <Clients />
              </ProtectedRoute>
            }
          />
          <Route
            path="clients/:id"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "business_development",
                  resource: "clients",
                  action: "READ",
                }}
              >
                <ClientDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="clients/:id/record-interaction"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "business_development",
                  resource: "clients",
                  action: "CREATE",
                }}
              >
                <RecordClientInteraction />
              </ProtectedRoute>
            }
          />
          <Route
            path="proposalscontracts"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "business_development",
                  resource: "proposals",
                  action: "READ",
                }}
              >
                <ProposalsContracts />
              </ProtectedRoute>
            }
          />

          {/* MANAGEMENT & PRO SERVICE */}
          {/* development routes */}
          <Route
            path="development"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "development",
                  resource: "tasks",
                  action: "READ",
                }}
              >
                <DevelopmentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="devtasks"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "development",
                  resource: "tasks",
                  action: "READ",
                }}
              >
                <DevelopmentTask />
              </ProtectedRoute>
            }
          />

          {/* facilities routes */}
          <Route
            path="construction"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "facility",
                  resource: "construction",
                  action: "READ",
                }}
              >
                <Construction />
              </ProtectedRoute>
            }
          />
          <Route
            path="power"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "facility",
                  resource: "power",
                  action: "READ",
                }}
              >
                <Power />
              </ProtectedRoute>
            }
          />
          <Route
            path="inventory"
            element={
              <ProtectedRoute
                requiredPermission={{
                  module: "facility",
                  resource: "inventory",
                  action: "READ",
                }}
              >
                <Inventory />
              </ProtectedRoute>
            }
          />

          {/* other routes — open to all authenticated users */}
          <Route path="settings" element={<Settings />} />
          <Route path="notifications" element={<Notification />} />
          <Route path="messages" element={<Messages />} />
          <Route path="generaltasks" element={<GeneralTasks />} />
          <Route path="generaltasks/:id/view" element={<GeneralTasks />} />
          <Route path="generaltasks/:id/edit" element={<GeneralTasks />} />
        </Route>

        {/* no route found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PayrollProvider>
  );
}

export default App;
