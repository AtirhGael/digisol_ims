import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { lazy, useEffect } from "react";
import { useUserStore } from "./Store/UserStore";
import { setNavigate } from "./utils/navigationService";
import { Login } from "./Authentication/Login/Login";
import { ResetPassword } from "./Authentication/RestPassword/ResetPassword";
import { Otp } from "./Authentication/Otp/Otp";
import { NewPassword } from "./Authentication/NewPassword/NewPassword";
import { Layout } from "./components/Menu/Layout";
import { hrRoutes } from "./Dashbaord/HumanResource/hrRoutes";
import { financeRoutes } from "./Dashbaord/Finance/financeRoutes";
import { NotFound } from "./components/NotFound/NotFound";
import { PayrollProvider } from "./Store/PayrollStore";
import { Authenticate } from "./Hooks/UseAuthenticate.tsx";
import { Loader } from "./components/other/Loader/Loader.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute";

// ── Lazy-loaded page components (code-split per route) ──────────────
const MainDashboard = lazy(() => import("./Dashbaord/MainDashboard/MainDashboard").then(m => ({ default: m.MainDashboard })));
const Unauthorized = lazy(() => import("./Dashbaord/Unauthorized/Unauthorized").then(m => ({ default: m.Unauthorized })));
const Users = lazy(() => import("./Dashbaord/Users/Users").then(m => ({ default: m.Users })));
const RoleManagement = lazy(() => import("./Dashbaord/role managment/roleManagment").then(m => ({ default: m.RoleManagement })));
const CreateRole = lazy(() => import("./Dashbaord/role managment/CreateRole"));
const EditRole = lazy(() => import("./Dashbaord/role managment/EditRole"));
const ViewRole = lazy(() => import("./Dashbaord/role managment/ViewRole"));
const AuditLogs = lazy(() => import("./Dashbaord/AuditLogs/AuditLogs").then(m => ({ default: m.AuditLogs })));
const Projects = lazy(() => import("./Dashbaord/Projects/Projects").then(m => ({ default: m.Projects })));
const Documents = lazy(() => import("./Dashbaord/Documents/Documents").then(m => ({ default: m.Documents })));
const DevelopmentDashboard = lazy(() => import("./Dashbaord/Development/Dashboard/DevelopmentDashboard").then(m => ({ default: m.DevelopmentDashboard })));
const DevelopmentTask = lazy(() => import("./Dashbaord/Development/Tasks/DevelopmentTask").then(m => ({ default: m.DevelopmentTask })));
const Construction = lazy(() => import("./Dashbaord/Facilities/Constructions/Construction").then(m => ({ default: m.Construction })));
const Power = lazy(() => import("./Dashbaord/Facilities/Power/Power").then(m => ({ default: m.Power })));
const Inventory = lazy(() => import("./Dashbaord/Facilities/Inventory/Inventory").then(m => ({ default: m.Inventory })));
const Settings = lazy(() => import("./Dashbaord/Settings/Settings").then(m => ({ default: m.Settings })));
const Notification = lazy(() => import("./Dashbaord/Notification/Notification").then(m => ({ default: m.Notification })));
const Messages = lazy(() => import("./Dashbaord/Message/Messages").then(m => ({ default: m.Messages })));
const GeneralTasks = lazy(() => import("./Dashbaord/Tasks/GeneralTasks.js"));
const BusinessDevelopmentDashboard = lazy(() => import("./Dashbaord/BusinessDevelopment/Dashboard/BusinessDevelopmentDashboard.js").then(m => ({ default: m.BusinessDevelopmentDashboard })));
const ProspectionPlanning = lazy(() => import("./Dashbaord/BusinessDevelopment/ProspectPlanning/ProspectionPlanning.js").then(m => ({ default: m.ProspectionPlanning })));
const AddProspectionWrapper = lazy(() => import("./Dashbaord/BusinessDevelopment/ProspectPlanning/AddProspectionWrapper.tsx").then(m => ({ default: m.AddProspectionWrapper })));
const EditProspectionWrapper = lazy(() => import("./Dashbaord/BusinessDevelopment/ProspectPlanning/EditProspectionWrapper.tsx").then(m => ({ default: m.EditProspectionWrapper })));
const ContactsLeads = lazy(() => import("./Dashbaord/BusinessDevelopment/ContactLeads/ContactsLeads.js"));
const Clients = lazy(() => import("./Dashbaord/BusinessDevelopment/Clients/Clients.js").then(m => ({ default: m.Clients })));
const ProposalsContracts = lazy(() => import("./Dashbaord/BusinessDevelopment/ProposalContracts/ProposalsContracts.js").then(m => ({ default: m.ProposalsContracts })));
const ViewLeads = lazy(() => import("./Dashbaord/BusinessDevelopment/ContactLeads/ViewLeadsDetails/ViewLeads.js"));
const ClientDetailsPage = lazy(() => import("./Dashbaord/BusinessDevelopment/Clients/ClientDetailsPage.js").then(m => ({ default: m.ClientDetailsPage })));
const RecordClientInteraction = lazy(() => import("./Dashbaord/BusinessDevelopment/Clients/RecordClientInteraction/RecordClientInteraction"));
const ViewProspection = lazy(() => import("./Dashbaord/BusinessDevelopment/ProspectPlanning/ViewProspection"));
const RecordNewTransaction = lazy(() => import("./Dashbaord/BusinessDevelopment/ContactLeads/RecordNewTransaction/RecordNewTransaction"));

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
          {/* HR routes are centralized in one file for simple maintenance. */}
          {hrRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <ProtectedRoute requiredPermission={route.permission}>
                  {route.element}
                </ProtectedRoute>
              }
            />
          ))}

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
