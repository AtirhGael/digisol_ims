import { GoHomeFill } from "react-icons/go";
import {
  FaUsers,
  FaUserLock,
  FaFile,
  FaWarehouse,
  FaProjectDiagram,
  FaLayerGroup,
  FaWallet,
  FaBell,
  FaComments,
  FaUserTie,
  FaUserShield,
  FaClipboardList,
} from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { financeNavLinks } from "../Dashbaord/Finance/financeRoutes";

/** Shape used by the sidebar for permission-gated items. */
export interface SidebarPermission {
  module: string;
  resource: string;
  action: string;
}

export const sideBar = [
  {
    name: "Dashboard",
    link: "/dashboard",
    icon: <GoHomeFill className="icon-active text-xl" />,
    // No permission — every authenticated user can see the main dashboard
  },
  {
    subHeading: "MANAGEMENT",
    nestedLinksNames: [
      {
        name: "Human Resource",
        icon: <FaUsers className="icon-active text-textColor text-xl" />,
        permission: {
          module: "hr",
          resource: "employee",
          action: "READ",
        } as SidebarPermission,
        nestedLinks: [
          {
            name: "Dashboard",
            link: "/dashboard/humanresource",
            permission: { module: "hr", resource: "employee", action: "READ" },
          },
          {
            name: "Employees",
            link: "/dashboard/employees",
            permission: { module: "hr", resource: "employee", action: "READ" },
          },
          {
            name: "Departments",
            link: "/dashboard/departments",
            permission: { module: "hr", resource: "employee", action: "READ" },
          },
          {
            name: "Onboarding",
            link: "/dashboard/onboarding",
            permission: {
              module: "hr",
              resource: "onboarding",
              action: "READ",
            },
          },
          {
            name: "Leave Management",
            link: "/dashboard/leavemanagement",
            permission: {
              module: "hr",
              resource: "leave_management",
              action: "READ",
            },
          },
          {
            name: "Attendance",
            link: "/dashboard/attendance",
            permission: {
              module: "hr",
              resource: "attendance",
              action: "READ",
            },
          },
          {
            name: "Performance",
            link: "/dashboard/performance",
            permission: {
              module: "hr",
              resource: "performance",
              action: "READ",
            },
          },
          {
            name: "Queries",
            link: "/dashboard/queries",
            permission: { module: "hr", resource: "queries", action: "READ" },
          },
          {
            name: "Reports",
            link: "/dashboard/reports",
            permission: { module: "hr", resource: "reports", action: "READ" },
          },
          {
            name: "Tasks",
            link: "/dashboard/tasks",
            permission: { module: "hr", resource: "tasks", action: "READ" },
          },
        ],
      },
      {
        name: "Finance",
        icon: <FaWallet className="icon-active text-textColor text-xl" />,
        permission: {
          module: "finance",
          resource: "transactions",
          action: "READ",
        } as SidebarPermission,
        // Finance navigation is derived from the finance routing table.
        nestedLinks: financeNavLinks,
      },
    ],
  },
  {
    name: "Users",
    link: "/dashboard/users",
    icon: <FaUserLock className="icon-active text-xl" />,
    permission: {
      module: "admin",
      resource: "users",
      action: "READ",
    } as SidebarPermission,
  },
  {
    name: "Role Management",
    link: "/dashboard/rolemanagement",
    icon: <FaUserShield className="icon-active text-xl" />,
    permission: {
      module: "admin",
      resource: "roles",
      action: "READ",
    } as SidebarPermission,
  },
  {
    name: "Audit Logs",
    link: "/dashboard/audit-logs",
    icon: <FaClipboardList className="icon-active text-xl" />,
    superAdminOnly: true,
  },
  {
    name: "Projects",
    link: "/dashboard/projects",
    icon: <FaLayerGroup className="icon-active text-xl" />,
    permission: {
      module: "projects",
      resource: "projects",
      action: "READ",
    } as SidebarPermission,
  },
  {
    name: "Documents",
    link: "/dashboard/documents",
    icon: <FaFile className="icon-active text-xl" />,
    permission: {
      module: "documents",
      resource: "documents",
      action: "READ",
    } as SidebarPermission,
  },
  {
    subHeading: "BUSINESS DEVELOPMENT",
    nestedLinksNames: [
      {
        name: "Business Development",
        icon: <FaUserTie className="icon-active text-textColor text-xl" />,
        permission: {
          module: "business_development",
          resource: "clients",
          action: "READ",
        } as SidebarPermission,
        nestedLinks: [
          {
            name: "Dashboard",
            link: "/dashboard/businessdevelopment",
            permission: {
              module: "business_development",
              resource: "clients",
              action: "READ",
            },
          },
          {
            name: "Prospection Planning",
            link: "/dashboard/prospectionplanning",
            permission: {
              module: "business_development",
              resource: "leads",
              action: "READ",
            },
          },
          {
            name: "Contacts & Leads",
            link: "/dashboard/contactsleads",
            permission: {
              module: "business_development",
              resource: "leads",
              action: "READ",
            },
          },
          {
            name: "Clients",
            link: "/dashboard/clients",
            permission: {
              module: "business_development",
              resource: "clients",
              action: "READ",
            },
          },
          {
            name: "Proposals & Contracts",
            link: "/dashboard/proposalscontracts",
            permission: {
              module: "business_development",
              resource: "proposals",
              action: "READ",
            },
          },
        ],
      },
    ],
  },
  {
    subHeading: "MANAGEMENT & PRO SERVICE",
    nestedLinksNames: [
      {
        name: "Development",
        icon: (
          <FaProjectDiagram className="icon-active text-textColor text-xl" />
        ),
        permission: {
          module: "development",
          resource: "tasks",
          action: "READ",
        } as SidebarPermission,
        nestedLinks: [
          {
            name: "Dashboard",
            link: "/dashboard/development",
            permission: {
              module: "development",
              resource: "tasks",
              action: "READ",
            },
          },
          {
            name: "Tasks",
            link: "/dashboard/devtasks",
            permission: {
              module: "development",
              resource: "tasks",
              action: "READ",
            },
          },
        ],
      },
      {
        name: "Facility",
        icon: <FaWarehouse className="icon-active text-textColor text-lg" />,
        permission: {
          module: "facility",
          resource: "construction",
          action: "READ",
        } as SidebarPermission,
        nestedLinks: [
          {
            name: "Construction",
            link: "/dashboard/construction",
            permission: {
              module: "facility",
              resource: "construction",
              action: "READ",
            },
          },
          {
            name: "Power",
            link: "/dashboard/power",
            permission: {
              module: "facility",
              resource: "power",
              action: "READ",
            },
          },
          {
            name: "Inventory",
            link: "/dashboard/inventory",
            permission: {
              module: "facility",
              resource: "inventory",
              action: "READ",
            },
          },
        ],
      },
    ],
  },
  {
    name: "Settings",
    link: "/dashboard/settings",
    icon: <FaGear className="icon-active text-xl" />,
    // No permission — every authenticated user can access settings
  },
  {
    name: "Notifications",
    link: "/dashboard/notifications",
    icon: <FaBell className="icon-active text-xl" />,
    // No permission — every authenticated user can see notifications
  },
  {
    name: "Messages",
    link: "/dashboard/messages",
    icon: <FaComments className="icon-active text-xl" />,
    // No permission — every authenticated user can see messages
  },
  {
    name: "Tasks",
    link: "/dashboard/generaltasks",
    icon: <FaLayerGroup className="icon-active text-xl" />,
    // No permission — every authenticated user can see general tasks
  },
];
