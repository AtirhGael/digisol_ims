import React from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useUserStore } from "../../Store/UserStore";
import AddTaskForm from "../../components/tasks/AddTaskForm";
import TaskDetail from "../../components/tasks/TaskDetail";
import ViewAllTasks from "../../components/tasks/ViewAllTasks";
import { Button } from "../../components/ui/button";
import ReusableTable from "../../components/other/ReusableTable/ReusableTable";
import { createTaskColumns } from "../../components/Columns/TaskColumns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";

// Sample data for demonstration (replace with API data when available).
const sampleTasks = [
  {
    id: 1,
    title: "Migrate server to new infrastructure",
    assignedBy: "Geal",
    assignedTo: "Elvis",
    assignee: "Eugene Nwanosike",
    projectName: "Project Alpha",
    progress: 35,
    deadline: "January 10 2025",
    priority: "Medium",
    status: "todo",
    name: "Migrate server to new infrastructure",
    description:
      "current infrastructure is inconvenient and server needs to be migrated to avoid lost data",
    startDate: "20 November 2025",
    dueDate: "30 November 2025",
  },
  {
    id: 2,
    title: "Design new user dashboard",
    assignedBy: "Mbongo",
    assignedTo: "Sarah",
    assignee: "Sarah Johnson",
    projectName: "Project Beta",
    progress: 50,
    deadline: "January 15 2025",
    priority: "High",
    status: "todo",
    name: "Design new user dashboard",
    description: "Create modern and intuitive dashboard design for end users",
    startDate: "22 November 2025",
    dueDate: "5 December 2025",
  },
  {
    id: 3,
    title: "Implement payment gateway",
    assignedBy: "Cecilia",
    assignedTo: "Marcus",
    assignee: "Marcus Chen",
    projectName: "Project Gamma",
    progress: 25,
    deadline: "January 20 2025",
    priority: "Low",
    status: "todo",
    name: "Implement payment gateway",
    description: "Integrate Stripe payment gateway into the platform",
    startDate: "25 November 2025",
    dueDate: "10 December 2025",
  },
  {
    id: 4,
    title: "Update API documentation",
    assignedBy: "Dre",
    assignedTo: "Lisa",
    assignee: "Lisa Rodriguez",
    projectName: "Project Delta",
    progress: 80,
    deadline: "January 8 2025",
    priority: "Medium",
    status: "in_progress",
    name: "Update API documentation",
    description: "Comprehensive update of all API endpoints documentation",
    startDate: "18 November 2025",
    dueDate: "28 November 2025",
  },
  {
    id: 5,
    title: "Fix mobile responsive issues",
    assignedBy: "John",
    assignedTo: "Kevin",
    assignee: "Kevin Park",
    projectName: "Project Epsilon",
    progress: 55,
    deadline: "January 12 2025",
    priority: "High",
    status: "in_progress",
    name: "Fix mobile responsive issues",
    description:
      "Address all mobile responsiveness bugs across the application",
    startDate: "20 November 2025",
    dueDate: "1 December 2025",
  },
  {
    id: 6,
    title: "Create automated testing suite",
    assignedBy: "Geal",
    assignedTo: "Amanda",
    assignee: "Amanda Williams",
    projectName: "Project Zeta",
    progress: 76,
    deadline: "January 18 2025",
    priority: "Low",
    status: "in_progress",
    name: "Create automated testing suite",
    description: "Build comprehensive automated testing for critical features",
    startDate: "19 November 2025",
    dueDate: "3 December 2025",
  },
  {
    id: 7,
    title: "Optimize database queries",
    assignedBy: "Mbongo",
    assignedTo: "David",
    assignee: "David Thompson",
    projectName: "Project Eta",
    progress: 90,
    deadline: "January 5 2025",
    priority: "Medium",
    status: "in_review",
    name: "Optimize database queries",
    description: "Improve performance of slow-running database queries",
    startDate: "15 November 2025",
    dueDate: "25 November 2025",
  },
  {
    id: 8,
    title: "Implement user authentication",
    assignedBy: "Cecilia",
    assignedTo: "Rachel",
    assignee: "Rachel Brown",
    projectName: "Project Theta",
    progress: 86,
    deadline: "January 9 2025",
    priority: "High",
    status: "in_review",
    name: "Implement user authentication",
    description: "Add OAuth2 and multi-factor authentication support",
    startDate: "17 November 2025",
    dueDate: "27 November 2025",
  },
  {
    id: 9,
    title: "Design email templates",
    assignedBy: "Dre",
    assignedTo: "Emma",
    assignee: "Emma Davis",
    projectName: "Project Iota",
    progress: 89,
    deadline: "January 7 2025",
    priority: "Low",
    status: "in_review",
    name: "Design email templates",
    description: "Create branded email templates for notifications",
    startDate: "16 November 2025",
    dueDate: "26 November 2025",
  },
  {
    id: 10,
    title: "Setup CI/CD pipeline",
    assignedBy: "John",
    assignedTo: "Michael",
    assignee: "Michael Anderson",
    projectName: "Project Kappa",
    progress: 100,
    deadline: "December 30 2024",
    priority: "Medium",
    status: "completed",
    name: "Setup CI/CD pipeline",
    description: "Configure automated deployment pipeline",
    startDate: "10 November 2025",
    dueDate: "20 November 2025",
  },
  {
    id: 11,
    title: "Integrate analytics tracking",
    assignedBy: "Geal",
    assignedTo: "Sophie",
    assignee: "Sophie Martin",
    projectName: "Project Lambda",
    progress: 100,
    deadline: "December 28 2024",
    priority: "High",
    status: "completed",
    name: "Integrate analytics tracking",
    description: "Add Google Analytics and custom event tracking",
    startDate: "12 November 2025",
    dueDate: "22 November 2025",
  },
  {
    id: 12,
    title: "Create admin panel",
    assignedBy: "Mbongo",
    assignedTo: "James",
    assignee: "James Wilson",
    projectName: "Project Mu",
    progress: 100,
    deadline: "December 25 2024",
    priority: "Low",
    status: "completed",
    name: "Create admin panel",
    description: "Build comprehensive admin management interface",
    startDate: "8 November 2025",
    dueDate: "18 November 2025",
  },
  {
    id: 13,
    title: "Refactor legacy codebase",
    assignedBy: "Cecilia",
    assignedTo: "Oliver",
    assignee: "Oliver Taylor",
    projectName: "Project Nu",
    progress: 42,
    deadline: "January 22 2025",
    priority: "Medium",
    status: "todo",
    name: "Refactor legacy codebase",
    description: "Modernize old code sections and improve maintainability",
    startDate: "26 November 2025",
    dueDate: "12 December 2025",
  },
  {
    id: 14,
    title: "Implement real-time notifications",
    assignedBy: "Dre",
    assignedTo: "Isabella",
    assignee: "Isabella Garcia",
    projectName: "Project Xi",
    progress: 38,
    deadline: "January 25 2025",
    priority: "High",
    status: "todo",
    name: "Implement real-time notifications",
    description: "Add WebSocket-based real-time notification system",
    startDate: "28 November 2025",
    dueDate: "15 December 2025",
  },
  {
    id: 15,
    title: "Setup monitoring and alerts",
    assignedBy: "John",
    assignedTo: "Daniel",
    assignee: "Daniel Martinez",
    projectName: "Project Omicron",
    progress: 15,
    deadline: "January 30 2025",
    priority: "Low",
    status: "todo",
    name: "Setup monitoring and alerts",
    description: "Configure monitoring tools and alerting systems",
    startDate: "1 December 2025",
    dueDate: "20 December 2025",
  },
  {
    id: 16,
    title: "Build search functionality",
    assignedBy: "Geal",
    assignedTo: "Mia",
    assignee: "Mia Robinson",
    projectName: "Project Pi",
    progress: 65,
    deadline: "January 14 2025",
    priority: "Medium",
    status: "in_progress",
    name: "Build search functionality",
    description: "Implement full-text search with filters and facets",
    startDate: "21 November 2025",
    dueDate: "2 December 2025",
  },
  {
    id: 17,
    title: "Create data backup system",
    assignedBy: "Mbongo",
    assignedTo: "Ethan",
    assignee: "Ethan Clark",
    projectName: "Project Rho",
    progress: 72,
    deadline: "January 11 2025",
    priority: "High",
    status: "in_progress",
    name: "Create data backup system",
    description: "Automated daily backups with disaster recovery plan",
    startDate: "19 November 2025",
    dueDate: "30 November 2025",
  },
  {
    id: 18,
    title: "Implement file upload feature",
    assignedBy: "Cecilia",
    assignedTo: "Ava",
    assignee: "Ava Lewis",
    projectName: "Project Sigma",
    progress: 68,
    deadline: "January 16 2025",
    priority: "Low",
    status: "in_progress",
    name: "Implement file upload feature",
    description: "Add support for multiple file formats with validation",
    startDate: "22 November 2025",
    dueDate: "4 December 2025",
  },
  {
    id: 19,
    title: "Security audit and fixes",
    assignedBy: "Dre",
    assignedTo: "Noah",
    assignee: "Noah Walker",
    projectName: "Project Tau",
    progress: 92,
    deadline: "January 6 2025",
    priority: "Medium",
    status: "in_review",
    name: "Security audit and fixes",
    description: "Comprehensive security review and vulnerability fixes",
    startDate: "14 November 2025",
    dueDate: "24 November 2025",
  },
  {
    id: 20,
    title: "Localization and i18n support",
    assignedBy: "John",
    assignedTo: "Charlotte",
    assignee: "Charlotte Hall",
    projectName: "Project Upsilon",
    progress: 88,
    deadline: "January 8 2025",
    priority: "High",
    status: "in_review",
    name: "Localization and i18n support",
    description: "Add multi-language support for global users",
    startDate: "16 November 2025",
    dueDate: "26 November 2025",
  },
  {
    id: 21,
    title: "Performance optimization",
    assignedBy: "Geal",
    assignedTo: "Liam",
    assignee: "Liam Allen",
    projectName: "Project Phi",
    progress: 94,
    deadline: "January 4 2025",
    priority: "Low",
    status: "in_review",
    name: "Performance optimization",
    description: "Optimize frontend bundle size and loading times",
    startDate: "13 November 2025",
    dueDate: "23 November 2025",
  },
  {
    id: 22,
    title: "Setup development environment",
    assignedBy: "Mbongo",
    assignedTo: "Harper",
    assignee: "Harper Young",
    projectName: "Project Chi",
    progress: 100,
    deadline: "December 27 2024",
    priority: "Medium",
    status: "completed",
    name: "Setup development environment",
    description: "Configure local and staging development environments",
    startDate: "9 November 2025",
    dueDate: "19 November 2025",
  },
  {
    id: 23,
    title: "Create onboarding flow",
    assignedBy: "Cecilia",
    assignedTo: "Lucas",
    assignee: "Lucas Hernandez",
    projectName: "Project Psi",
    progress: 100,
    deadline: "December 29 2024",
    priority: "High",
    status: "completed",
    name: "Create onboarding flow",
    description: "Design and implement user onboarding experience",
    startDate: "11 November 2025",
    dueDate: "21 November 2025",
  },
  {
    id: 24,
    title: "Integrate third-party APIs",
    assignedBy: "Dre",
    assignedTo: "Amelia",
    assignee: "Amelia King",
    projectName: "Project Omega",
    progress: 100,
    deadline: "December 26 2024",
    priority: "Low",
    status: "completed",
    name: "Integrate third-party APIs",
    description: "Connect to external services and APIs",
    startDate: "7 November 2025",
    dueDate: "17 November 2025",
  },
  {
    id: 25,
    title: "Build reporting dashboard",
    assignedBy: "John",
    assignedTo: "Benjamin",
    assignee: "Benjamin Wright",
    projectName: "Project Alpha Two",
    progress: 48,
    deadline: "January 21 2025",
    priority: "Medium",
    status: "todo",
    name: "Build reporting dashboard",
    description: "Create analytics and reporting visualization dashboard",
    startDate: "27 November 2025",
    dueDate: "13 December 2025",
  },
  {
    id: 26,
    title: "Implement caching strategy",
    assignedBy: "Geal",
    assignedTo: "Evelyn",
    assignee: "Evelyn Lopez",
    projectName: "Project Beta Two",
    progress: 32,
    deadline: "January 24 2025",
    priority: "High",
    status: "todo",
    name: "Implement caching strategy",
    description: "Add Redis caching for improved performance",
    startDate: "29 November 2025",
    dueDate: "16 December 2025",
  },
  {
    id: 27,
    title: "Create mobile application",
    assignedBy: "Mbongo",
    assignedTo: "Alexander",
    assignee: "Alexander Hill",
    projectName: "Project Gamma Two",
    progress: 20,
    deadline: "January 28 2025",
    priority: "Low",
    status: "todo",
    name: "Create mobile application",
    description: "Develop native mobile apps for iOS and Android",
    startDate: "2 December 2025",
    dueDate: "22 December 2025",
  },
  {
    id: 28,
    title: "Setup error tracking",
    assignedBy: "Cecilia",
    assignedTo: "Ella",
    assignee: "Ella Scott",
    projectName: "Project Delta Two",
    progress: 70,
    deadline: "January 13 2025",
    priority: "Medium",
    status: "in_progress",
    name: "Setup error tracking",
    description: "Integrate Sentry for error monitoring and tracking",
    startDate: "20 November 2025",
    dueDate: "1 December 2025",
  },
  {
    id: 29,
    title: "Implement data export feature",
    assignedBy: "Dre",
    assignedTo: "William",
    assignee: "William Green",
    projectName: "Project Epsilon Two",
    progress: 58,
    deadline: "January 17 2025",
    priority: "High",
    status: "in_progress",
    name: "Implement data export feature",
    description: "Allow users to export data in CSV and PDF formats",
    startDate: "23 November 2025",
    dueDate: "5 December 2025",
  },
  {
    id: 30,
    title: "Create API rate limiting",
    assignedBy: "John",
    assignedTo: "Abigail",
    assignee: "Abigail Adams",
    projectName: "Project Zeta Two",
    progress: 64,
    deadline: "January 19 2025",
    priority: "Low",
    status: "in_progress",
    name: "Create API rate limiting",
    description: "Implement rate limiting to prevent API abuse",
    startDate: "24 November 2025",
    dueDate: "6 December 2025",
  },
  {
    id: 31,
    title: "Build content management system",
    assignedBy: "Geal",
    assignedTo: "Henry",
    assignee: "Henry Baker",
    projectName: "Project Eta Two",
    progress: 91,
    deadline: "January 5 2025",
    priority: "Medium",
    status: "in_review",
    name: "Build content management system",
    description: "Create CMS for managing website content",
    startDate: "15 November 2025",
    dueDate: "25 November 2025",
  },
  {
    id: 32,
    title: "Implement video processing",
    assignedBy: "Mbongo",
    assignedTo: "Emily",
    assignee: "Emily Nelson",
    projectName: "Project Theta Two",
    progress: 87,
    deadline: "January 7 2025",
    priority: "High",
    status: "in_review",
    name: "Implement video processing",
    description: "Add video upload, transcoding, and streaming",
    startDate: "16 November 2025",
    dueDate: "26 November 2025",
  },
  {
    id: 33,
    title: "Setup CDN integration",
    assignedBy: "Cecilia",
    assignedTo: "Jack",
    assignee: "Jack Carter",
    projectName: "Project Iota Two",
    progress: 93,
    deadline: "January 6 2025",
    priority: "Low",
    status: "in_review",
    name: "Setup CDN integration",
    description: "Configure CDN for static asset delivery",
    startDate: "14 November 2025",
    dueDate: "24 November 2025",
  },
  {
    id: 34,
    title: "Create customer support portal",
    assignedBy: "Dre",
    assignedTo: "Sofia",
    assignee: "Sofia Mitchell",
    projectName: "Project Kappa Two",
    progress: 100,
    deadline: "December 31 2024",
    priority: "Medium",
    status: "completed",
    name: "Create customer support portal",
    description: "Build ticketing system for customer support",
    startDate: "10 November 2025",
    dueDate: "20 November 2025",
  },
  {
    id: 35,
    title: "Implement social media sharing",
    assignedBy: "John",
    assignedTo: "Sebastian",
    assignee: "Sebastian Perez",
    projectName: "Project Lambda Two",
    progress: 100,
    deadline: "December 28 2024",
    priority: "High",
    status: "completed",
    name: "Implement social media sharing",
    description: "Add social sharing functionality across platforms",
    startDate: "11 November 2025",
    dueDate: "21 November 2025",
  },
  {
    id: 36,
    title: "Build inventory management",
    assignedBy: "Geal",
    assignedTo: "Victoria",
    assignee: "Victoria Roberts",
    projectName: "Project Mu Two",
    progress: 100,
    deadline: "December 27 2024",
    priority: "Low",
    status: "completed",
    name: "Build inventory management",
    description: "Create system for tracking inventory and stock",
    startDate: "9 November 2025",
    dueDate: "19 November 2025",
  },
  {
    id: 37,
    title: "Implement webhook system",
    assignedBy: "Mbongo",
    assignedTo: "Matthew",
    assignee: "Matthew Turner",
    projectName: "Project Nu Two",
    progress: 45,
    deadline: "January 23 2025",
    priority: "Medium",
    status: "todo",
    name: "Implement webhook system",
    description: "Add webhook support for event notifications",
    startDate: "28 November 2025",
    dueDate: "14 December 2025",
  },
  {
    id: 38,
    title: "Create billing and invoicing",
    assignedBy: "Cecilia",
    assignedTo: "Grace",
    assignee: "Grace Phillips",
    projectName: "Project Xi Two",
    progress: 28,
    deadline: "January 26 2025",
    priority: "High",
    status: "todo",
    name: "Create billing and invoicing",
    description: "Build automated billing and invoice generation",
    startDate: "30 November 2025",
    dueDate: "18 December 2025",
  },
  {
    id: 39,
    title: "Setup load balancing",
    assignedBy: "Dre",
    assignedTo: "Christopher",
    assignee: "Christopher Campbell",
    projectName: "Project Omicron Two",
    progress: 18,
    deadline: "January 29 2025",
    priority: "Low",
    status: "todo",
    name: "Setup load balancing",
    description: "Configure load balancers for high availability",
    startDate: "3 December 2025",
    dueDate: "21 December 2025",
  },
  {
    id: 40,
    title: "Implement two-factor authentication",
    assignedBy: "John",
    assignedTo: "Chloe",
    assignee: "Chloe Parker",
    projectName: "Project Pi Two",
    progress: 62,
    deadline: "January 15 2025",
    priority: "Medium",
    status: "in_progress",
    name: "Implement two-factor authentication",
    description: "Add 2FA security feature for user accounts",
    startDate: "21 November 2025",
    dueDate: "3 December 2025",
  },
];

const GeneralTasks = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeId } = useParams();
  const roles = useUserStore((state) => state.roles);
  const permissions = useUserStore((state) => state.permissions);

  const checkPermission = (action: string) => {
    if (roles.includes("SUPER_ADMIN")) return true;
    return permissions.some(
      (p) =>
        p.module === "development" &&
        p.resource_type === "tasks" &&
        p.action === action,
    );
  };
  // Local task list state.
  const [tasks, setTasks] = React.useState(sampleTasks);

  // Expand/collapse state per status section.
  const [expandedSections, setExpandedSections] = React.useState({
    todo: true,
    in_progress: true,
    in_review: true,
    completed: true,
  });

  // Modal toggle for adding a task.
  const [showAddTaskForm, setShowAddTaskForm] = React.useState(false);

  // Selected task for detail/edit routes.
  const [selectedTask, setSelectedTask] = React.useState(null);
  const [openMenuTaskId, setOpenMenuTaskId] = React.useState(null);

  // State for view-all filter.
  const [viewAllStatus, setViewAllStatus] = React.useState(null);

  // Modal target for deletion
  const [deleteTaskTarget, setDeleteTaskTarget] = React.useState(null);

  // Prevent background scrolling when modal is open.
  React.useEffect(() => {
    if (showAddTaskForm) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showAddTaskForm]);

  // Close action menus when clicking outside.
  React.useEffect(() => {
    const handleOutsideClick = () => setOpenMenuTaskId(null);
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // Sync selected task from the route.
  React.useEffect(() => {
    if (!routeId) {
      setSelectedTask(null);
      return;
    }

    const task = tasks.find((item) => String(item.id) === routeId);
    if (!task) {
      navigate("/dashboard/generaltasks", { replace: true });
      return;
    }

    setViewAllStatus(null);
    setSelectedTask(task);
  }, [routeId, tasks, navigate]);

  // Parse view-all filter from query string.
  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const viewAll = searchParams.get("viewall");
    if (
      viewAll === "todo" ||
      viewAll === "in_progress" ||
      viewAll === "in_review" ||
      viewAll === "completed"
    ) {
      setViewAllStatus(viewAll);
      return;
    }
    setViewAllStatus(null);
  }, [location.search]);

  // Utilities.
  const filterTasks = (status) =>
    tasks.filter((task) => task.status === status);

  const sections = [
    {
      key: "todo",
      label: "To Do",
      color: "bg-gray-400",
      count: filterTasks("todo").length,
    },
    {
      key: "in_progress",
      label: "In Progress",
      color: "bg-yellow-400",
      count: filterTasks("in_progress").length,
    },
    {
      key: "in_review",
      label: "In Review",
      color: "bg-purple-400",
      count: filterTasks("in_review").length,
    },
    {
      key: "completed",
      label: "Completed",
      color: "bg-teal-400",
      count: filterTasks("completed").length,
    },
  ];

  // Handlers.
  const toggleSection = (key) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleViewAll = (sectionKey) => {
    navigate(`/dashboard/generaltasks?viewall=${sectionKey}`);
  };

  // Navigate to task detail view.

  const handleTaskAction = (taskId) => {
    navigate(`/dashboard/generaltasks/${taskId}/view`);
    setOpenMenuTaskId(null);
  };

  // Task detail handlers.
  const handleEditTask = () => {
    if (selectedTask) {
      navigate(`/dashboard/generaltasks/${selectedTask.id}/edit`);
    }
  };

  const handleDeleteTask = () => {
    if (selectedTask) {
      setDeleteTaskTarget(selectedTask.id);
    }
  };

  const handleEditTaskFromMenu = (task) => {
    if (!checkPermission("UPDATE")) {
      navigate("/dashboard/unauthorized");
      return;
    }
    navigate(`/dashboard/generaltasks/${task.id}/edit`);
    setOpenMenuTaskId(null);
  };

  const handleDeleteTaskFromMenu = (taskId) => {
    setOpenMenuTaskId(null);
    setDeleteTaskTarget(taskId);
  };

  const confirmDeleteTask = () => {
    if (deleteTaskTarget) {
      setTasks((prev) => prev.filter((task) => task.id !== deleteTaskTarget));
      setSelectedTask((prev) => (prev?.id === deleteTaskTarget ? null : prev));
      if (String(routeId) === String(deleteTaskTarget)) {
        navigate("/dashboard/generaltasks", { replace: true });
      }
      setDeleteTaskTarget(null);
    }
  };

  // Update notes in local state.
  const handleUpdateNotes = (notes) => {
    if (selectedTask) {
      setTasks(
        tasks.map((task) =>
          task.id === selectedTask.id ? { ...task, notes } : task,
        ),
      );
      setSelectedTask({ ...selectedTask, notes });
    }
  };

  // if a task is selected, show TaskDetail
  if (selectedTask) {
    const isEditRoute = location.pathname.endsWith("/edit");
    return (
      <TaskDetail
        task={selectedTask}
        mode={isEditRoute ? "edit" : "view"}
        onEdit={handleEditTask}
        onView={() =>
          navigate(`/dashboard/generaltasks/${selectedTask.id}/view`)
        }
        onDelete={handleDeleteTask}
        onCancel={() => navigate("/dashboard/generaltasks")}
        onUpdateNotes={handleUpdateNotes}
      />
    );
  }

  // add navigation to viewalltask when filter is active
  if (viewAllStatus) {
    return (
      <ViewAllTasks
        tasks={tasks as any}
        initialFilter={viewAllStatus}
        onBack={() => navigate("/dashboard/generaltasks")}
        onTaskClick={handleTaskAction}
      />
    );
  }

  return (
    <div className=" min-h-screen w-full">
      <AlertDialog
        open={deleteTaskTarget !== null}
        onOpenChange={(open) => !open && setDeleteTaskTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTask}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal for AddTaskForm */}
      {showAddTaskForm && (
        <AddTaskForm
          onClose={() => setShowAddTaskForm(false)}
          onSubmit={(taskData) => {
            // Map the form payload to the local task shape.
            setTasks((prev) => [
              ...prev,
              {
                id: prev.length
                  ? Math.max(...prev.map((task) => task.id)) + 1
                  : 1,
                title: taskData.taskName,
                assignedBy: "System",
                assignedTo: taskData.assignedTo,
                assignee: taskData.assignee,
                projectName: taskData.projectName || "General",
                progress: taskData.progress || 0,
                deadline: taskData.endDate || "N/A",
                priority: taskData.priority || "Low",
                status: "todo",
                name: taskData.taskName,
                description: taskData.taskDescription,
                startDate: taskData.startDate || "N/A",
                dueDate: taskData.endDate || "N/A",
              },
            ]);
          }}
        />
      )}

      {/* ========== REMOVED: Back arrow from main header ========== */}
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
            <p className="text-sm text-gray-500">
              Set tasks for employees and track the progress
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              if (!checkPermission("CREATE")) {
                navigate("/dashboard/unauthorized");
                return;
              }
              setShowAddTaskForm(true);
            }}
            className="px-4 py-2 bg-primary  text-white rounded-lg hover:bg-primary font-medium transition-colors w-full sm:w-auto"
          >
            Add Task
          </Button>
        </div>
      </div>
      {/* =========================================================== */}

      {/* Task Sections */}
      <div className="space-y-6">
        {sections.map((section, index) => {
          const sectionTasks = filterTasks(section.key);
          const isExpanded = expandedSections[section.key];
          // ========== ADDED: Check if this is the first section (To Do) ==========
          const isFirstSection = index === 0;
          // ========================================================================

          return (
            <div key={section.key} className="bg-white rounded-lg shadow-sm">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  {/* ========== ADDED: Back arrow only on first section (To Do) ========== */}
                  {/*
                    Back arrow removed per request.
                  */}
                  {/* ===================================================================== */}
                  <div className={`w-1 h-6 ${section.color} rounded`}></div>
                  <span className="font-semibold text-gray-700">
                    {section.label}
                  </span>
                  <span className="text-sm text-gray-500">{section.count}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSection(section.key)}
                    className="p-1"
                  >
                    {isExpanded ? (
                      <ChevronUp size={18} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400" />
                    )}
                  </Button>
                </div>
                {/* ========== CHANGED: Replaced button with Button component ========== */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewAll(section.key)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium w-full sm:w-auto"
                >
                  View All
                </Button>
                {/* ==================================================================== */}
              </div>

              {/* Task Table */}
              {isExpanded && (
                <ReusableTable
                  heading={`${section.label} Tasks`}
                  data={sectionTasks}
                  columns={createTaskColumns({
                    openMenuId: openMenuTaskId,
                    onToggleMenu: setOpenMenuTaskId,
                    onViewTask: (task) => handleTaskAction(task.id),
                    onEditTask: (task) => handleEditTaskFromMenu(task),
                    onDeleteTask: (task) => handleDeleteTaskFromMenu(task.id),
                  })}
                  searchKeys={["title", "assignee", "projectName", "deadline"]}
                  filterKey="priority"
                  filterOptions={[
                    { key: "priority", value: "High", label: "High" },
                    { key: "priority", value: "Medium", label: "Medium" },
                    { key: "priority", value: "Low", label: "Low" },
                  ]}
                  itemsPerPage={5}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GeneralTasks;
