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
  PENDING: "Đang chờ",
  VERIFIED: "Đã xác minh",
  REJECTED: "Từ chối",
  ASSIGNED: "Đã phân công",
  EN_ROUTE: "Đang di chuyển",
  ON_SITE: "Tại hiện trường",
  IN_PROGRESS: "Đang xử lý",
  COMPLETED: "Hoàn tất",
  CONFIRMED: "Đã xác nhận",
  CLOSED: "Đã đóng",
  CANCELLED: "Đã hủy",
  PREPARING: "Đang chuẩn bị",
  SHIPPED: "Đã gửi",
  IN_TRANSIT: "Đang vận chuyển",
  DELIVERED: "Đã bàn giao",
  ACTIVE: "Đang hoạt động",
  PAUSED: "Tạm dừng",
  DRAFT: "Bản nháp",
  EXECUTED: "Đã thực hiện",
  FAILED: "Thất bại",
  INITIATED: "Đã khởi tạo",
  PROCESSING: "Đang xử lý",
  CRITICAL: "Nguy cấp",
  HIGH: "Cao",
  MEDIUM: "Trung bình",
  LOW: "Thấp",
  OPEN: "Đang mở",
  INVESTIGATING: "Đang xác minh",
  RESOLVED: "Đã xử lý",
  SUSPENDED: "Tạm khóa",
  INACTIVE: "Không hoạt động",
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
