import { Chip } from "@mui/material";
import { STATUS_LABELS } from "@/shared/constants/statuses";

interface StatusChipProps {
  value?: string | null;
  size?: "small" | "medium";
}

export function StatusChip({ value, size = "small" }: StatusChipProps) {
  if (!value) return <Chip size={size} variant="outlined" label="Không rõ" sx={chipSx("neutral")} />;
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
    water: { bg: "var(--color-green-100)", color: "var(--color-green-800)", border: "var(--color-border)" },
    safe: { bg: "var(--color-green-100)", color: "var(--color-green-800)", border: "var(--color-border)" },
    warning: { bg: "var(--color-cream-100)", color: "var(--color-green-800)", border: "var(--color-border-strong)" },
    critical: { bg: "#fff1f2", color: "#b91c1c", border: "#fecdd3" },
    neutral: { bg: "#ffffff", color: "var(--color-text-muted)", border: "var(--color-border)" },
  };
  const selected = tones[tone] ?? tones.neutral;
  return {
    bgcolor: selected.bg,
    color: selected.color,
    border: `1px solid ${selected.border}`,
    borderRadius: 0,
    fontWeight: 850,
    "& .MuiChip-label": { px: 1.15 },
  };
}
