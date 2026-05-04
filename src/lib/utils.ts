import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format ISO datetime string to simple date format (YYYY-MM-DD)
 * Removes time and timezone components
 * @param dateString - ISO datetime string (e.g., "2026-03-27T00:00:00.000Z")
 * @returns Formatted date string (e.g., "2026-03-27")
 */
export function formatDateWithoutTime(dateString: string): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  } catch {
    return dateString;
  }
}

/**
 * Status mapping for prospection activities
 * Maps backend status values to display labels and color codes
 */
export const prospectionStatusMap: Record<
  string,
  { label: string; bgColor: string; textColor: string }
> = {
  DRAFT: {
    label: "Draft",
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
  },
  PENDING_APPROVAL: {
    label: "Pending",
    bgColor: "bg-amber-100",
    textColor: "text-amber-700",
  },
  APPROVED: {
    label: "Approved",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
  ACTIVE: {
    label: "Active",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
  IN_PROGRESS: {
    label: "In Progress",
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
  },
  COMPLETED: {
    label: "Completed",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
  REJECTED: {
    label: "Rejected",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
  },
  CANCELLED: {
    label: "Cancelled",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
  },
};

/**
 * Get status display info based on backend status value
 * @param status - Backend status value
 * @returns Object with label and color classes
 */
export function getProspectionStatusInfo(status: string): {
  label: string;
  bgColor: string;
  textColor: string;
} {
  const upperStatus = status?.toUpperCase();
  return prospectionStatusMap[upperStatus] || prospectionStatusMap.DRAFT;
}
