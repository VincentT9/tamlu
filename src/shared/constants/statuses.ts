import type { ChipProps } from "@mui/material";

export const SOS_STATUS = {
  pending: "PENDING",
  verified: "VERIFIED",
  rejected: "REJECTED",
  assigned: "ASSIGNED",
  inProgress: "IN_PROGRESS",
  completed: "COMPLETED",
  confirmed: "CONFIRMED",
} as const;

export const MISSION_STATUS = {
  assigned: "ASSIGNED",
  enRoute: "EN_ROUTE",
  onSite: "ON_SITE",
  inProgress: "IN_PROGRESS",
  completed: "COMPLETED",
  closed: "CLOSED",
  cancelled: "CANCELLED",
} as const;

export const SHIPMENT_STATUS = {
  preparing: "PREPARING",
  shipped: "SHIPPED",
  inTransit: "IN_TRANSIT",
  delivered: "DELIVERED",
  verified: "VERIFIED",
} as const;

export const CAMPAIGN_STATUS = {
  draft: "DRAFT",
  active: "ACTIVE",
  paused: "PAUSED",
  completed: "COMPLETED",
  closed: "CLOSED",
} as const;

export const PRIORITY = {
  critical: "CRITICAL",
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
} as const;

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
  ASSIGNED: "Assigned",
  EN_ROUTE: "En route",
  ON_SITE: "On site",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CONFIRMED: "Confirmed",
  CLOSED: "Closed",
  CANCELLED: "Cancelled",
  PREPARING: "Preparing",
  SHIPPED: "Shipped",
  IN_TRANSIT: "In transit",
  DELIVERED: "Delivered",
  ACTIVE: "Active",
  PAUSED: "Paused",
  DRAFT: "Draft",
  EXECUTED: "Executed",
  FAILED: "Failed",
  INITIATED: "Initiated",
  PROCESSING: "Processing",
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
  OPEN: "Open",
  INVESTIGATING: "Investigating",
  RESOLVED: "Resolved",
  SUSPENDED: "Suspended",
  INACTIVE: "Inactive",
};

export const STATUS_COLORS: Record<string, ChipProps["color"]> = {
  PENDING: "warning",
  VERIFIED: "info",
  ASSIGNED: "secondary",
  EN_ROUTE: "info",
  ON_SITE: "info",
  IN_PROGRESS: "primary",
  COMPLETED: "success",
  CONFIRMED: "success",
  CLOSED: "default",
  CANCELLED: "error",
  REJECTED: "error",
  PREPARING: "warning",
  SHIPPED: "info",
  IN_TRANSIT: "primary",
  DELIVERED: "success",
  ACTIVE: "success",
  PAUSED: "warning",
  DRAFT: "default",
  EXECUTED: "success",
  FAILED: "error",
  CRITICAL: "error",
  HIGH: "warning",
  MEDIUM: "info",
  LOW: "success",
  OPEN: "warning",
  INVESTIGATING: "info",
  RESOLVED: "success",
  SUSPENDED: "error",
  INACTIVE: "default",
};
