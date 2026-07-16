import { Chip } from "@mui/material";
import { STATUS_LABELS } from "@/shared/constants/statuses";

interface StatusChipProps {
  value?: string | null;
  size?: "small" | "medium";
}

export function StatusChip({ value, size = "small" }: StatusChipProps) {
  if (!value) return <Chip size={size} variant="outlined" label="Unknown" sx={chipSx("neutral")} />;
  const tone = toneForStatus(value);
  return (
    <Chip
      size={size}
      variant="filled"
      label={STATUS_LABELS[value] ?? value}
      sx={chipSx(tone)}
    />
  );
}

function toneForStatus(value: string) {
  const normalized = value.toLowerCase();
  if (["active", "approved", "verified", "delivered", "completed", "resolved", "paid", "success"].some((item) => normalized.includes(item))) return "safe";
  if (["pending", "assigned", "submitted", "review", "in_progress", "in progress", "en_route", "in_transit", "shipped"].some((item) => normalized.includes(item))) return "water";
  if (["high", "urgent", "warning", "low_stock", "paused"].some((item) => normalized.includes(item))) return "warning";
  if (["critical", "rejected", "failed", "cancelled", "closed", "error"].some((item) => normalized.includes(item))) return "critical";
  return "neutral";
}

function chipSx(tone: string) {
  const tones: Record<string, { bg: string; color: string; border: string }> = {
    water: { bg: "rgba(103,232,249,.12)", color: "#cffafe", border: "rgba(103,232,249,.26)" },
    safe: { bg: "rgba(52,211,153,.14)", color: "#bbf7d0", border: "rgba(52,211,153,.28)" },
    warning: { bg: "rgba(245,184,91,.16)", color: "#ffd07a", border: "rgba(245,184,91,.30)" },
    critical: { bg: "rgba(248,113,113,.16)", color: "#fecaca", border: "rgba(248,113,113,.30)" },
    neutral: { bg: "rgba(255,255,255,.075)", color: "rgba(247,253,255,.72)", border: "rgba(255,255,255,.14)" },
  };
  const selected = tones[tone] ?? tones.neutral;
  return {
    bgcolor: selected.bg,
    color: selected.color,
    border: `1px solid ${selected.border}`,
    fontWeight: 850,
    "& .MuiChip-label": { px: 1.15 },
  };
}
