import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  UserCog,
  User,
  ShieldCheck,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/other/Card";
import ReusableTable from "../../components/other/ReusableTable/ReusableTable";
import { createUsersColumns } from "../../components/Columns/UserColumns";
import { NewUserForm } from "./NewUserForm";
import { EditUserForm } from "./EditUserForm";
import { UserDetails } from "./UserDetails";
import { useFetchHook } from "../../Hooks/UseFetchHook";
import { useDeleteHook } from "../../Hooks/UseDeleteHook";
import Skeleton from "../../components/other/Loader/Skeleton";
import SkeletonLoading from "../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { toast } from "sonner";
import { useUserStore } from "../../Store/UserStore";

// Type definitions
interface UserRole {
  id: string;
  name: string;
  code: string;
  is_primary: boolean;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

interface UserProps {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  phone?: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING_ACTIVATION";
  department: Department | null;
  roles: UserRole[];
  created_at: string;
  updated_at: string;
  avatar_url?: string;
}

type View = "list" | "new" | "edit" | "detail";

export const Users = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("list");
  const [selectedUser, setSelectedUser] = useState<UserProps | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProps | null>(null);
  const loggedInUserId = useUserStore((s) => s.user?.id);
  const roles = useUserStore((s) => s.roles);
  const permissions = useUserStore((s) => s.permissions);

  const checkPermission = (action: string) => {
    if (roles.includes("SUPER_ADMIN")) return true;
    return permissions.some(
      (p) =>
        p.module === "admin" &&
        p.resource_type === "users" &&
        p.action === action,
    );
  };

  // Fetch users data - only fetch ACTIVE users by default
  const {
    data: usersResponse,
    isLoading: usersLoading,
    isError: usersError,
    error: usersErrorMessage,
    refetch: refetchUsers,
  } = useFetchHook("/users", "users");

  // Delete mutation
  const { mutateAsync: deleteUser, isLoading: deleting } = useDeleteHook(
    "/users",
    ["users"],
  );

  const users = usersResponse?.data?.users || [];
  const pagination = usersResponse?.data?.pagination;

  // Action handlers
  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setView("detail");
  };

  const handleEditUser = (userId: string) => {
    if (!checkPermission("UPDATE")) {
      navigate("/dashboard/unauthorized");
      return;
    }
    const user = users.find((u: UserProps) => u.user_id === userId);
    if (user) {
      setSelectedUser(user);
      setView("edit");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const user = users.find((u: UserProps) => u.user_id === userId);
    if (!user) return;

    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      console.log("Deleting user:", userToDelete.user_id);
      const result = await deleteUser(`/${userToDelete.user_id}`);
      console.log("Delete result:", result);
      toast.success("User deactivated successfully");
      setShowDeleteModal(false);
      setUserToDelete(null);
      refetchUsers();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Error deleting user");
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleNewUser = () => {
    if (!checkPermission("CREATE")) {
      navigate("/dashboard/unauthorized");
      return;
    }
    setView("new");
  };

  const handleBack = () => {
    setView("list");
    setSelectedUser(null);
    setSelectedUserId(null);
  };

  const handleUserCreated = () => {
    setView("list");
    refetchUsers();
  };

  const handleUserUpdated = () => {
    setView("list");
    setSelectedUser(null);
    setSelectedUserId(null);
    refetchUsers();
  };

  // Calculate stats from real data
  const totalUsers = users.length;
  const activeUsers = users.filter(
    (u: UserProps) => u.status === "ACTIVE",
  ).length;
  const inactiveUsers = users.filter(
    (u: UserProps) => u.status === "INACTIVE",
  ).length;
  const totalAdmins = users.filter((u: UserProps) =>
    u.roles.some((role) => role.code === "SUPER_ADMIN"),
  ).length;

  // Transform data for table display — exclude the currently logged-in user
  const tableData = users
    .filter((user: UserProps) => user.user_id !== loggedInUserId)
    .map((user: UserProps) => ({
      id: user.user_id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      role:
        user.roles.find((r) => r.is_primary)?.name ||
        user.roles[0]?.name ||
        "No Role",
      department: user.department?.name || "No Department",
      status:
        user.status === "ACTIVE"
          ? "Active"
          : user.status === "INACTIVE"
            ? "Inactive"
            : "Pending",
      avatar:
        user.avatar_url ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.first_name}`,
      createdOn: new Date(user.created_at).toLocaleDateString("en-GB"),
      user_id: user.user_id,
    }));

  console.log(usersErrorMessage, usersError, "usersErrorMessage");

  if (usersLoading) {
    return <SkeletonLoading />;
  }

  if (usersError) {
    toast.error(`Failed to load users`);
  }

  return (
    <div className="min-h-screen">
      {view === "list" && (
        <div className="min-h-screen w-full">
          {/* Page Title */}
          <div className="mb-2 sm:mb-2 md:mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
                Users
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                System users and their roles
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full sm:w-auto">
              <Button
                variant="ghost"
                size="md"
                onClick={() => navigate("/dashboard/rolemanagement")}
                className="flex items-center justify-center gap-3 px-6 py-3 font-medium text-base transition-all duration-200 bg-white border-2 border-gray-800 text-gray-800 hover:bg-gray-50"
              >
                <UserCog size={18} />
                Manage Roles
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleNewUser}
                className="flex items-center justify-center gap-3 px-6 py-3 font-medium text-base transition-all duration-200 bg-primary text-white hover:bg-primary-dark focus:ring-4 focus:ring-primary/30"
              >
                <Plus size={18} />
                Add User
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-6 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <Card
              heading="Total Users"
              amount={totalUsers.toString()}
              icons={<User size={20} className="text-white" />}
              textColor="#3b82f6"
              iconBackgroundColor="#3b82f6"
            />
            <Card
              heading="Active Users"
              amount={activeUsers.toString()}
              icons={<User size={20} className="text-white" />}
              textColor="#10b981"
              iconBackgroundColor="#10b981"
            />
            <Card
              heading="Inactive Users"
              amount={inactiveUsers.toString()}
              icons={<User size={20} className="text-white" />}
              textColor="#ef4444"
              iconBackgroundColor="#ef4444"
            />
            <Card
              heading="Super Admins"
              amount={totalAdmins.toString()}
              icons={<ShieldCheck size={20} className="text-white" />}
              textColor="#8b5cf6"
              iconBackgroundColor="#8b5cf6"
            />
          </div>

          {/* Users Table */}
          <ReusableTable
            data={tableData}
            columns={createUsersColumns({
              onViewUser: handleViewUser,
              onEditUser: handleEditUser,
              onDeleteUser: handleDeleteUser,
            })}
            searchKeys={["name", "email", "role", "department"]}
            filterKey="status"
            filterOptions={[
              { key: "active", value: "Active", label: "Active" },
              { key: "inactive", value: "Inactive", label: "Inactive" },
              { key: "pending", value: "Pending", label: "Pending" },
            ]}
            heading="All Users"
          />
        </div>
      )}
      {view === "new" && (
        <NewUserForm onCancel={handleBack} onSuccess={handleUserCreated} />
      )}
      {view === "edit" && selectedUser && (
        <EditUserForm
          user={selectedUser}
          onCancel={handleBack}
          onSuccess={handleUserUpdated}
        />
      )}
      {view === "detail" && selectedUserId && (
        <UserDetails userId={selectedUserId} onBack={handleBack} />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        user={userToDelete}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isLoading={deleting}
      />
    </div>
  );
};

export default Users;
