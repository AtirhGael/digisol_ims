"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, DollarSign, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import useFetchHook from "../../../Hooks/UseFetchHook";
import useDeleteHook from "../../../Hooks/UseDeleteHook";
import { useUserStore } from "../../../Store/UserStore";
import type { ProspectionPlan } from "./prospectionMockData";
import { Card } from "../../../components/other/Card";
import { ApprovalModal } from "./ApprovalModal";
import ReusableTable from "../../../components/other/ReusableTable/ReusableTable";
import { createProspectionColumns } from "../../../components/Columns/ProspectionColumn";
import SkeletonLoading from "../../../components/other/Loader/SkeletonLoading/SkeletonLoading";
import { Error } from "../../../components/other/Error/Error";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export const ProspectionPlanning = () => {
  const navigate = useNavigate();
  const roles = useUserStore((state) => state.roles);
  const permissions = useUserStore((state) => state.permissions);

  const checkPermission = (action: string) => {
    if (roles.includes("SUPER_ADMIN")) return true;
    return permissions.some(
      (p) =>
        p.module === "business_development" &&
        p.resource_type === "leads" &&
        p.action === action,
    );
  };
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedProspectionForApproval, setSelectedProspectionForApproval] =
    useState<any>(null);

  const {
    data: fetchedProspections,
    isLoading,
    error,
    isError,
    refetch,
  } = useFetchHook("/business-development/prospections", "prospect-data", {
    enabled: true,
    refetchOnWindowFocus: false,
  });

  const { mutateAsync: deleteProspection } = useDeleteHook(
    "/business-development/prospections",
    ["prospect-data"],
  );

  let PROSPECTIONS: ProspectionPlan[] = [];

  if (fetchedProspections) {
    if (fetchedProspections.success && fetchedProspections.data?.prospections) {
      PROSPECTIONS = fetchedProspections.data.prospections.map(
        (item: any, index: number) => {
          const prospection = {
            id: index + 1, // Display ID for table
            uuid: item.prospection_id || item.id, // Keep original UUID for API calls
            code: item.prospection_code || `PROSP-${index + 1}`,
            title: item.title,
            description: item.description || "",
            createdBy: item.created_by || "Unknown",
            plannedStart: new Date(
              item.planned_start_date || item.startDate,
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            plannedEnd: new Date(
              item.planned_end_date || item.endDate,
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            contactsCollected:
              item.actual_contacts || item.contactsCollected || 0,
            expectedContacts: item.expected_contacts || 0,
            contactBreakdown: { normal: 0, potential: 0, client: 0 },
            teamMembers: [],
            budgetApproved: item.budget_approved || 0, // Keep the actual approved budget amount
            budgetAllocated: item.budget_requested || item.budget || 0, // Store actual budget amount
            budgetSpent: "-",
            city: item.location_city || "",
            region: item.location_region || "",
            venue: item.location_venue || "",
            targetAudience: item.target_audience || "",
            status:
              item.status === "PENDING_APPROVAL" ? "PENDING" : item.status,
          };
          return prospection;
        },
      );
    } else if (Array.isArray(fetchedProspections)) {
      PROSPECTIONS = fetchedProspections;
    }
  }

  const handleAddProspection = () => {
    if (!checkPermission("CREATE")) {
      navigate("/dashboard/unauthorized");
      return;
    }
    navigate("/dashboard/prospectionplanning/add");
  };

  const totalProspections = PROSPECTIONS.length;
  const pendingApproval = PROSPECTIONS.filter(
    (p) => p.status === "PENDING",
  ).length;
  const activeProspections = PROSPECTIONS.filter(
    (p) => p.status === "ACTIVE",
  ).length;

  // Calculate total budget from real API data
  const totalBudget = PROSPECTIONS.reduce((sum, p) => {
    // Use actual budgetAllocated amount
    return (
      sum + (typeof p.budgetAllocated === "number" ? p.budgetAllocated : 0)
    );
  }, 0);

  // Format budget for display
  const formattedTotalBudget = totalBudget.toLocaleString();

  // Action handlers
  const handleView = (prospection: ProspectionPlan) => {
    navigate(`/dashboard/prospectionplanning/view/${prospection.uuid}`);
  };

  const handleEdit = (prospection: ProspectionPlan) => {
    if (!checkPermission("UPDATE")) {
      navigate("/dashboard/unauthorized");
      return;
    }
    if (!prospection.uuid) {
      const errorMessage = "Error: No valid ID found for this prospection";
      console.error("No UUID found for prospection:", prospection);
      toast.error(errorMessage, { duration: 4000 });
      return;
    }
    const editUrl = `/dashboard/prospectionplanning/edit/${prospection.uuid}`;
    navigate(editUrl);
  };

  const handleDelete = (prospection: ProspectionPlan) => {
    if (prospection.uuid) {
      setDeleteModalId(prospection.uuid);
      setDeleteModalOpen(true);
    }
  };

  const handleApprove = (prospection: ProspectionPlan) => {
    // Get the original budget from the API data (not the divided display value)
    const originalProspectionData =
      fetchedProspections?.data?.prospections?.find(
        (item: any) => item.prospection_id === prospection.uuid,
      );

    const prospectionData = {
      prospection_id: prospection.uuid || "",
      title: prospection.title,
      description: prospection.description,
      location_city: prospection.city,
      planned_start_date: prospection.plannedStart,
      planned_end_date: prospection.plannedEnd,
      budget_requested: originalProspectionData?.budget_requested || 0,
      status: prospection.status,
    };
    setSelectedProspectionForApproval(prospectionData);
    setApprovalModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteModalId || isDeleting) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await deleteProspection(deleteModalId);
      toast.success("Prospection plan deleted successfully!", {
        duration: 4000,
      });
      await refetch();
      setDeleteModalOpen(false);
      setDeleteModalId(null);
    } catch (error: any) {
      const statusCode = error?.response?.status;
      const backendMessage = error?.response?.data?.message as
        | string
        | undefined;
      const loweredMessage = (backendMessage || "").toLowerCase();
      const isStatusRestriction =
        statusCode === 400 ||
        statusCode === 409 ||
        loweredMessage.includes("status") ||
        loweredMessage.includes("cannot delete") ||
        loweredMessage.includes("can't delete");

      const message = isStatusRestriction
        ? backendMessage ||
          "This prospection record cannot be deleted in its current status."
        : backendMessage || "Failed to delete prospection. Please try again.";
      setDeleteError(message);
      toast.error(message, { duration: 4000 });
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    if (isDeleting) return;
    setDeleteModalId(null);
    setDeleteModalOpen(false);
    setDeleteError(null);
  };

  // Create columns for ReusableTable
  const columns = createProspectionColumns({
    onViewProspection: handleView,
    onEditProspection: handleEdit,
    onDeleteProspection: handleDelete,
    onApproveProspection: handleApprove,
  });

  // Status filter options
  const statusFilterOptions = [
    { key: "draft", value: "draft", label: "Draft" },
    { key: "submitted", value: "submitted", label: "Submitted" },
    { key: "pending", value: "pending", label: "Pending" },
    { key: "active", value: "active", label: "Active" },
    { key: "completed", value: "completed", label: "Completed" },
    { key: "rejected", value: "rejected", label: "Rejected" },
    { key: "cancelled", value: "cancelled", label: "Cancelled" },
  ];

  // loading
  if (isLoading) {
    return <SkeletonLoading />;
  }
  // error
  if (isError) {
    return (
      <Error
        message={
          error?.message ||
          "Failed to load prospection plans. Please try again."
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Header */}
      <header>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg lg:text-2xl font-semibold text-gray-900 truncate">
              Prospection Planning & Management
            </h1>
            <p className="text-xs sm:text-sm text-gray-500">
              Plan, track and analyze prospection activities
            </p>
          </div>
          <div className="shrink-0">
            <Button
              buttonType="add"
              className="text-xs sm:text-sm w-full sm:w-auto"
              onClick={handleAddProspection}
            >
              <span className="hidden sm:inline">New Prospection Plan</span>
              <span className="sm:hidden">Add Plan</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ overflow: "visible" }}>
        {/* Stats Cards using Card component */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-6">
          <Card
            heading="Total Prospections"
            amount={totalProspections.toString()}
            icons={
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
            }
            currency="Active prospection plans"
          />
          <Card
            heading="Pending Approval"
            amount={pendingApproval.toString()}
            icons={
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
            }
            currency="Awaiting approval"
          />
          <Card
            heading="Active Prospections"
            amount={activeProspections.toString()}
            icons={
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
            }
            currency="Currently active"
          />
          <Card
            heading="Total Budget"
            amount={formattedTotalBudget}
            icons={
              <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-white" />
            }
            currency="XAF allocated"
          />
        </div>

        {/* Table */}
        {!isLoading && !error && (
          <ReusableTable
            columns={columns}
            data={PROSPECTIONS}
            heading="Prospection Plans"
            filterOptions={statusFilterOptions}
            filterKey="status"
            searchKeys={["title", "plannedStart", "plannedEnd"]}
            itemsPerPage={8}
            showSearch={true}
            showFilter={true}
          />
        )}
      </main>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog
        open={deleteModalOpen}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeleteModalOpen(false);
            setDeleteModalId(null);
            setDeleteError(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prospection Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this prospection plan? This action
              cannot be undone.
            </AlertDialogDescription>
            {deleteError && (
              <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {deleteError}
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <button
              onClick={cancelDelete}
              disabled={isDeleting}
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 mt-2 sm:mt-0"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={isDeleting}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-red-700 disabled:pointer-events-none disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Approval Modal */}
      {selectedProspectionForApproval && (
        <ApprovalModal
          prospection={selectedProspectionForApproval}
          isOpen={approvalModalOpen}
          onClose={() => {
            setApprovalModalOpen(false);
            setSelectedProspectionForApproval(null);
          }}
          onSuccess={() => {
            refetch(); // Refresh the data
          }}
        />
      )}
    </div>
  );
};
