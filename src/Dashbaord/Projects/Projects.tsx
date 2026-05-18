import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Box } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/Button";
import { useUserStore } from "../../Store/UserStore";
import { Card } from "../../components/other/Card";
import { CreateProject } from "./CreateProject";
import { EditProjects } from "./EditProjects";
import ReusableTable from "../../components/other/ReusableTable/ReusableTable";
import { createProjectsColumns } from "../../components/Columns/ProjectsColumn";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/Dialog";

// Type definitions
type ProjectStatus = "Pending" | "Active" | "On Hold" | "Completed";
type ProjectPriority = "Low" | "Medium" | "High";
type ProjectCategory =
  | "Software"
  | "Facility"
  | "Marketing"
  | "Finance"
  | "HR"
  | "construction"
  | "Other";

interface ProjectProps {
  id: string;
  projectId: string;
  name: string;
  category: ProjectCategory;
  priority: ProjectPriority;
  department: string;
  team: string;
  progress: number;
  createdOn: string;
  status: ProjectStatus;
}

// Sample data (replace with API data when available).
const sampleProjects: ProjectProps[] = [
  {
    id: "1",
    projectId: "SW12040094",
    name: "Project Alpha",
    category: "Software",
    priority: "Low",
    department: "Software Development",
    team: "6 members",
    progress: 60,
    createdOn: "21/09/2025",
    status: "Pending",
  },
  {
    id: "2",
    projectId: "CN16100094",
    name: "School Building",
    category: "construction",
    priority: "Medium",
    department: "Facility",
    team: "1 members",
    progress: 0,
    createdOn: "21/09/2025",
    status: "Active",
  },
  {
    id: "3",
    projectId: "SW12040094",
    name: "Project DIGISOL",
    category: "Software",
    priority: "High",
    department: "Software Development",
    team: "1 members",
    progress: 60,
    createdOn: "21/09/2025",
    status: "Active",
  },
  {
    id: "8",
    projectId: "SW12040102",
    name: "Project Nova",
    category: "Software",
    priority: "Medium",
    department: "Software Development",
    team: "4 members",
    progress: 70,
    createdOn: "21/09/2025",
    status: "Active",
  },
  {
    id: "4",
    projectId: "SW12040095",
    name: "Project Beta",
    category: "Software",
    priority: "Low",
    department: "Software Development",
    team: "6 members",
    progress: 60,
    createdOn: "21/09/2025",
    status: "Pending",
  },
  {
    id: "5",
    projectId: "SW12040096",
    name: "Project Gamma",
    category: "Software",
    priority: "Low",
    department: "Software Development",
    team: "6 members",
    progress: 60,
    createdOn: "21/09/2025",
    status: "Active",
  },
  {
    id: "6",
    projectId: "SW12040097",
    name: "Project Delta",
    category: "Software",
    priority: "Low",
    department: "Software Development",
    team: "6 members",
    progress: 60,
    createdOn: "21/09/2025",
    status: "Completed",
  },
  {
    id: "7",
    projectId: "SW12040101",
    name: "Project Orion",
    category: "Software",
    priority: "Low",
    department: "Software Development",
    team: "6 members",
    progress: 45,
    createdOn: "21/09/2025",
    status: "Active",
  },
  {
    id: "10",
    projectId: "SW12040104",
    name: "Project Zenith",
    category: "Software",
    priority: "Medium",
    department: "Software Development",
    team: "5 members",
    progress: 100,
    createdOn: "21/09/2025",
    status: "Completed",
  },
  {
    id: "9",
    projectId: "SW12040103",
    name: "Project Atlas",
    category: "Software",
    priority: "High",
    department: "Software Development",
    team: "8 members",
    progress: 85,
    createdOn: "21/09/2025",
    status: "On Hold",
  },
];

export const Projects = () => {
  const navigate = useNavigate();
  const roles = useUserStore((state) => state.roles);
  const permissions = useUserStore((state) => state.permissions);

  const checkPermission = (action: string) => {
    if (roles.includes("SUPER_ADMIN")) return true;
    return permissions.some(
      (p) =>
        p.module === "projects" &&
        p.resource_type === "projects" &&
        p.action === action,
    );
  };
  // Local page state.
  const [projects, setProjects] = useState<ProjectProps[]>(sampleProjects);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // Category dialog state
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [newCategoryPrefix, setNewCategoryPrefix] = useState("");

  // Close any open action menu when clicking outside.
  useEffect(() => {
    const handleOutsideClick = () => {
      setOpenActionMenuId(null);
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // If showing create project page, render that instead
  if (showCreateProject) {
    return <CreateProject onBack={() => setShowCreateProject(false)} />;
  }

  // If showing edit project page, render that instead
  if (showEditProject) {
    return <EditProjects onBack={() => setShowEditProject(false)} />;
  }

  // Page-level handlers.
  const handleOpenNewProject = () => {
    if (!checkPermission("CREATE")) {
      navigate("/dashboard/unauthorized");
      return;
    }
    setShowCreateProject(true);
  };

  const handleEditProject = (projectId: string) => {
    if (!checkPermission("UPDATE")) {
      navigate("/dashboard/unauthorized");
      return;
    }
    setSelectedProjectId(projectId);
    setShowEditProject(true);
    setOpenActionMenuId(null);
  };

  const handleViewProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setShowEditProject(true);
    setOpenActionMenuId(null);
  };

  const handleDeleteProject = (projectId: string) => {
    setOpenActionMenuId(null);
    toast("Delete this project?", {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: () =>
          setProjects((prev) =>
            prev.filter((project) => project.id !== projectId),
          ),
      },
      cancel: { label: "Cancel", onClick: () => {} },
      duration: 8000,
    });
  };

  // Category dialog helpers.
  const handleOpenCategoryDialog = () => {
    setShowCategoryDialog(true);
  };

  // Close and reset dialog input.
  const handleCloseCategoryDialog = () => {
    setShowCategoryDialog(false);
    setNewCategoryPrefix("");
  };

  // Persist a new category (placeholder for backend integration).
  const handleSaveCategory = () => {
    if (newCategoryPrefix.trim()) {
      // Here you would typically save the category to your backend
      // Close the dialog after saving
      handleCloseCategoryDialog();
    }
  };

  // Summary stats for the top cards.
  const totalFilteredProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "Active").length;
  const pendingProjects = projects.filter((p) => p.status === "Pending").length;
  const completedProjects = projects.filter(
    (p) => p.status === "Completed",
  ).length;

  return (
    <div className="min-h-screen w-full">
      {/* Page Title - Responsive */}
      <div className="mb-4 sm:mb-6 md:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Projects
        </h1>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
          <Button
            variant="ghost"
            size="md"
            className="flex items-center justify-center gap-3 px-6 py-3 rounded-full font-medium text-base transition-all duration-200 bg-white border-2 border-gray-800 text-gray-800 hover:bg-gray-50"
            onClick={handleOpenCategoryDialog}
          >
            <Box size={24} strokeWidth={2} />
            <span>Project Category</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex items-center justify-center gap-3 bg-primary text-white hover:text-white hover:bg-indigo-800 duration-200 px-6 py-3 rounded-full font-medium text-base"
            onClick={handleOpenNewProject}
          >
            <Plus size={24} strokeWidth={2} />
            <span>New Projects</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3  mb-4 sm:mb-6 md:mb-8">
        {/* Total Projects */}
        <Card
          heading="Total Projects"
          amount={totalFilteredProjects.toString()}
          icons={
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
              <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          }
        />

        {/* Active Projects */}
        <Card
          heading="Active"
          amount={activeProjects.toString()}
          icons={
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
              <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          }
        />

        {/* Pending Projects */}
        <Card
          heading="Pending"
          amount={pendingProjects.toString()}
          icons={
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
              <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          }
        />

        {/* Completed Projects */}
        <Card
          heading="Completed"
          amount={completedProjects.toString()}
          icons={
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
              <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          }
        />
      </div>

      {/* Projects Table */}
      <ReusableTable
        heading="Projects"
        data={projects}
        columns={createProjectsColumns({
          openMenuId: openActionMenuId,
          onToggleMenu: setOpenActionMenuId,
          onViewProject: handleViewProject,
          onEditProject: handleEditProject,
          onDeleteProject: handleDeleteProject,
        })}
        searchKeys={["name", "projectId", "department"]}
        filterKey="status"
        filterOptions={[
          { key: "status", value: "Pending", label: "Pending" },
          { key: "status", value: "Active", label: "Active" },
          { key: "status", value: "On Hold", label: "On Hold" },
          { key: "status", value: "Completed", label: "Completed" },
        ]}
        itemsPerPage={5}
      />

      {/* Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="sm:max-w-md rounded-br-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-semibold">
              Create New Category
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Enter Prefix
            </label>
            <input
              type="text"
              value={newCategoryPrefix}
              onChange={(e) => setNewCategoryPrefix(e.target.value)}
              placeholder="e.g. SW"
              className="w-full px-4 py-3 border-2 border-indigo-500 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-base"
            />
          </div>

          <DialogFooter className="gap-3 sm:gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCloseCategoryDialog}
              className="flex-1 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleSaveCategory}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
