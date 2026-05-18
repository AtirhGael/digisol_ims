import { lazy } from "react";

// ── Lazy-loaded Finance page components ─────────────────────────────
const FinanceDashboard = lazy(() => import("./Dashboard/FinanceDashboard").then(m => ({ default: m.FinanceDashboard })));
const Transactions = lazy(() => import("./Transactions/Transactions").then(m => ({ default: m.Transactions })));
const AddTransaction = lazy(() => import("./Transactions/AddTransaction").then(m => ({ default: m.AddTransaction })));
const TransactionDetails = lazy(() => import("./Transactions/TransactionDetails").then(m => ({ default: m.TransactionDetails })));
const Budgeting = lazy(() => import("./Budgeting/Budgeting").then(m => ({ default: m.Budgeting })));
const AddBudget = lazy(() => import("./Budgeting/AddBudget").then(m => ({ default: m.AddBudget })));
const ViewBudget = lazy(() => import("./Budgeting/ViewBudget").then(m => ({ default: m.ViewBudget })));
const Expenses = lazy(() => import("./Expenses/Expenses").then(m => ({ default: m.Expenses })));
const AddExpense = lazy(() => import("./Expenses/AddExpense").then(m => ({ default: m.AddExpense })));
const ViewExpense = lazy(() => import("./Expenses/ViewExpense").then(m => ({ default: m.ViewExpense })));
const Payroll = lazy(() => import("./Payroll/Payroll").then(m => ({ default: m.Payroll })));
const AddPayroll = lazy(() => import("./Payroll/AddPayroll").then(m => ({ default: m.AddPayroll })));
const ViewPayroll = lazy(() => import("./Payroll/ViewPayroll").then(m => ({ default: m.ViewPayroll })));
const Invoice = lazy(() => import("./Invoice/Invoice").then(m => ({ default: m.Invoice })));
const CreateInvoice = lazy(() => import("./Invoice/CreateInvoice").then(m => ({ default: m.CreateInvoice })));
const EditInvoice = lazy(() => import("./Invoice/EditInvoice").then(m => ({ default: m.EditInvoice })));
const ViewInvoice = lazy(() => import("./Invoice/ViewInvoice").then(m => ({ default: m.ViewInvoice })));
const FinanceReports = lazy(() => import("./Reports/FinanceReports").then(m => ({ default: m.FinanceReports })));

type FinanceRouteConfig = {
  // Path is relative to `/dashboard` to keep routing consistent across modules.
  path: string;
  element: JSX.Element;
  // Add a label to expose the route in the sidebar navigation.
  navLabel?: string;
  // The finance resource that guards this route (module: "finance", action: "READ").
  // Defaults to "transactions" if omitted so existing behaviour is preserved for
  // routes that don't have a more specific resource.
  permissionResource?: string;
};

// Centralized finance routing table.
// Add/adjust finance pages here to keep `App.tsx` and the sidebar in sync.
export const financeRoutes: FinanceRouteConfig[] = [
  {
    path: "finance",
    element: <FinanceDashboard />,
    navLabel: "Dashboard",
    permissionResource: "transactions",
  },
  {
    path: "transactions",
    element: <Transactions />,
    navLabel: "Transactions",
    permissionResource: "transactions",
  },
  {
    path: "transactions/add",
    element: <AddTransaction />,
    permissionResource: "transactions",
  },
  {
    path: "transactions/:id",
    element: <TransactionDetails />,
    permissionResource: "transactions",
  },
  {
    path: "budgeting",
    element: <Budgeting />,
    navLabel: "Budgeting",
    permissionResource: "budgeting",
  },
  {
    path: "budgeting/add",
    element: <AddBudget />,
    permissionResource: "budgeting",
  },
  {
    path: "budgeting/:id",
    element: <ViewBudget />,
    permissionResource: "budgeting",
  },
  {
    path: "expenses",
    element: <Expenses />,
    navLabel: "Expenses",
    permissionResource: "expenses",
  },
  {
    path: "expenses/add",
    element: <AddExpense />,
    permissionResource: "expenses",
  },
  {
    path: "expenses/:id",
    element: <ViewExpense />,
    permissionResource: "expenses",
  },
  {
    path: "payroll",
    element: <Payroll />,
    navLabel: "Payroll",
    permissionResource: "payroll",
  },
  {
    path: "payroll/add",
    element: <AddPayroll />,
    permissionResource: "payroll",
  },
  {
    path: "payroll/:id",
    element: <ViewPayroll />,
    permissionResource: "payroll",
  },
  {
    path: "invoice",
    element: <Invoice />,
    navLabel: "Invoice & Payments",
    permissionResource: "invoice_payments",
  },
  {
    path: "invoice/add",
    element: <CreateInvoice />,
    permissionResource: "invoice_payments",
  },
  {
    path: "invoice/edit/:id",
    element: <EditInvoice />,
    permissionResource: "invoice_payments",
  },
  {
    path: "invoice/:id",
    element: <ViewInvoice />,
    permissionResource: "invoice_payments",
  },
  {
    path: "financereports",
    element: <FinanceReports />,
    navLabel: "Reports",
    permissionResource: "reports",
  },
];

// Sidebar-ready links derived from the same routing table.
export const financeNavLinks = financeRoutes
  .filter((route) => route.navLabel)
  .map((route) => ({
    name: route.navLabel as string,
    link: `/dashboard/${route.path}`,
  }));
