import { FinanceDashboard } from "./Dashboard/FinanceDashboard";
import { Transactions } from "./Transactions/Transactions";
import { AddTransaction } from "./Transactions/AddTransaction";
import { TransactionDetails } from "./Transactions/TransactionDetails";
import { Budgeting } from "./Budgeting/Budgeting";
import { AddBudget } from "./Budgeting/AddBudget";
import { ViewBudget } from "./Budgeting/ViewBudget";
import { Expenses } from "./Expenses/Expenses";
import { AddExpense } from "./Expenses/AddExpense";
import { ViewExpense } from "./Expenses/ViewExpense";
import { Payroll } from "./Payroll/Payroll";
import { AddPayroll } from "./Payroll/AddPayroll";
import { ViewPayroll } from "./Payroll/ViewPayroll";
import { Invoice } from "./Invoice/Invoice";
import { CreateInvoice } from "./Invoice/CreateInvoice";
import { EditInvoice } from "./Invoice/EditInvoice";
import { ViewInvoice } from "./Invoice/ViewInvoice";
import { FinanceReports } from "./Reports/FinanceReports";

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
