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
  if (["PENDING", "DRAFT", "SUBMITTED", "OPEN", "REVIEW", "INITIATED", "PREPARING"].includes(value)) return "pending";
  if (["VERIFIED", "APPROVED"].includes(value)) return "verified";
  if (["ASSIGNED", "INVESTIGATING", "RESERVED"].includes(value)) return "assigned";
  if (["IN_PROGRESS", "IN_TRANSIT", "IN_USE", "EN_ROUTE", "ON_SITE", "SHIPPED", "PROCESSING"].includes(value)) return "progress";
  if (["COMPLETED", "DELIVERED", "CONFIRMED", "ACTIVE", "RESOLVED", "CLOSED", "PAID", "SUCCESS", "AVAILABLE", "EXECUTED"].includes(value)) return "success";
  if (["REJECTED", "CANCELLED", "CANCELED", "SUSPENDED", "FAILED", "ERROR", "INACTIVE", "CRITICAL"].includes(value)) return "danger";
  if (["HIGH", "URGENT", "WARNING", "LOW_STOCK", "PAUSED"].includes(value)) return "warning";
  return "neutral";
}

function normalizeStatus(value: string) {
  return value.trim().toUpperCase().replace(/[\s-]+/g, "_");
}

function chipSx(tone: string) {
  const tones: Record<string, { bg: string; color: string; border: string }> = {
    pending: { bg: "var(--status-pending-bg)", color: "var(--status-pending-text)", border: "#ddd5c1" },
    verified: { bg: "var(--status-verified-bg)", color: "var(--status-verified-text)", border: "#c4dce6" },
    assigned: { bg: "var(--status-assigned-bg)", color: "var(--status-assigned-text)", border: "#d5cfeb" },
    progress: { bg: "var(--status-progress-bg)", color: "var(--status-progress-text)", border: "#efd3b2" },
    success: { bg: "var(--status-success-bg)", color: "var(--status-success-text)", border: "#c7e0cd" },
    danger: { bg: "var(--status-danger-bg)", color: "var(--status-danger-text)", border: "#efc6c2" },
    warning: { bg: "var(--status-progress-bg)", color: "var(--status-progress-text)", border: "#efd3b2" },
    neutral: { bg: "var(--color-surface-subtle)", color: "var(--color-text-muted)", border: "var(--color-border)" },
  };
  const selected = tones[tone] ?? tones.neutral;
  return {
    bgcolor: selected.bg,
    color: selected.color,
    border: `1px solid ${selected.border}`,
    borderRadius: "999px",
    fontWeight: 850,
    letterSpacing: 0,
    "& .MuiChip-label": { px: 1.25 },
  };
}
