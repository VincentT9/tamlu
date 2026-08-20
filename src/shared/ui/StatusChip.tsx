import { Chip } from "@mui/material";
import { STATUS_LABELS } from "@/shared/constants/statuses";

interface StatusChipProps {
  value?: string | null;
  size?: "small" | "medium";
}

export function StatusChip({ value, size = "small" }: StatusChipProps) {
  if (!value) return <Chip size={size} variant="outlined" label="Không rõ" sx={chipSx("neutral")} />;
  const normalized = normalizeStatus(value);
  const tone = toneForStatus(normalized);
  return (
    <Chip
      size={size}
      variant="filled"
      label={STATUS_LABELS[normalized] ?? value}
      sx={chipSx(tone)}
    />
  );
}

function toneForStatus(value: string) {
  if (["PENDING", "DRAFT", "SUBMITTED", "OPEN", "REVIEW", "INITIATED", "PREPARING", "PENDING_APPROVAL", "WAITING_APPROVAL", "AWAITING_APPROVAL", "UNDER_REVIEW", "IN_REVIEW"].includes(value)) return "pending";
  if (["VERIFIED", "APPROVED", "MEDIUM", "LOW", "DISMISSED", "CHECK_IN", "CHECK_OUT", "CHECKIN", "CHECKOUT"].includes(value)) return "verified";
  if (["ASSIGNED", "INVESTIGATING", "RESERVED"].includes(value)) return "assigned";
  if (["IN_PROGRESS", "IN_TRANSIT", "IN_USE", "EN_ROUTE", "ON_SITE", "DISPATCHED", "SHIPPED", "PROCESSING", "DISTRIBUTING"].includes(value)) return "progress";
  if (["COMPLETED", "DELIVERED", "CONFIRMED", "ACTIVE", "RESOLVED", "CLOSED", "PAID", "SUCCESS", "AVAILABLE", "EXECUTED", "READY", "DONE", "IDLE", "SAN_SANG", "PAYMENT_COMPLETED"].includes(value)) return "success";
  if (["REJECTED", "CANCELLED", "CANCELED", "SUSPENDED", "FAILED", "ERROR", "INACTIVE", "CRITICAL"].includes(value)) return "danger";
  if (["HIGH", "URGENT", "WARNING", "LOW_STOCK", "PAUSED", "MAINTENANCE", "HELD", "BUDGET_HELD", "BUDGET_LOCKED"].includes(value)) return "warning";
  return "neutral";
}

function normalizeStatus(value: string) {
  return value.trim().toUpperCase().replace(/[\s-]+/g, "_");
}

function chipSx(tone: string) {
  const tones: Record<string, { bg: string; color: string; border: string }> = {
    pending: { bg: "var(--status-pending-bg)", color: "var(--status-pending-text)", border: "var(--status-pending-border)" },
    verified: { bg: "var(--status-verified-bg)", color: "var(--status-verified-text)", border: "var(--status-verified-border)" },
    assigned: { bg: "var(--status-assigned-bg)", color: "var(--status-assigned-text)", border: "var(--status-assigned-border)" },
    progress: { bg: "var(--status-progress-bg)", color: "var(--status-progress-text)", border: "var(--status-progress-border)" },
    success: { bg: "var(--status-success-bg)", color: "var(--status-success-text)", border: "var(--status-success-border)" },
    danger: { bg: "var(--status-danger-bg)", color: "var(--status-danger-text)", border: "var(--status-danger-border)" },
    warning: { bg: "var(--status-pending-bg)", color: "var(--status-pending-text)", border: "var(--status-pending-border)" },
    neutral: { bg: "var(--status-neutral-bg)", color: "var(--status-neutral-text)", border: "var(--status-neutral-border)" },
  };
  const selected = tones[tone] ?? tones.neutral;
  return {
    bgcolor: selected.bg,
    color: selected.color,
    border: `1px solid ${selected.border}`,
    borderRadius: "8px",
    fontWeight: 700,
    letterSpacing: 0,
    "& .MuiChip-label": { px: 1.25 },
  };
}
