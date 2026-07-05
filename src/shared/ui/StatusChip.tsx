import { Chip } from "@mui/material";
import { STATUS_COLORS, STATUS_LABELS } from "@/shared/constants/statuses";

interface StatusChipProps {
  value?: string | null;
  size?: "small" | "medium";
}

export function StatusChip({ value, size = "small" }: StatusChipProps) {
  if (!value) return <Chip size={size} label="Unknown" />;
  return <Chip size={size} color={STATUS_COLORS[value] ?? "default"} label={STATUS_LABELS[value] ?? value} />;
}
