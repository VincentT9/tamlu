import { Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  tone?: "blue" | "orange" | "green" | "red" | "neutral";
}

const tones = {
  blue: "var(--status-progress-text)",
  orange: "var(--status-pending-text)",
  green: "var(--color-green-700)",
  red: "var(--status-danger-text)",
  neutral: "var(--color-text-muted)",
};

export function MetricCard({ label, value, helper, tone = "blue" }: MetricCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        position: "relative",
        overflow: "hidden",
        p: 2.75,
        borderRadius: "var(--radius-panel)",
        borderColor: "var(--color-border)",
        bgcolor: "var(--color-surface)",
        color: "var(--color-text)",
        boxShadow: "none",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: "0 auto 0 0",
          width: 4,
          bgcolor: tones[tone],
          opacity: 0.9,
        },
      }}
    >
      <Stack spacing={0.75} sx={{ position: "relative" }}>
        <Typography variant="body2" sx={{ color: "var(--color-text-muted)", fontWeight: 700 }}>
          {label}
        </Typography>
        <Typography variant="h5" fontWeight={800} className="tamlu-data" sx={{ lineHeight: 1.08, color: "var(--color-green-800)" }}>
          {value}
        </Typography>
        {helper ? (
          <Typography variant="caption" sx={{ lineHeight: 1.5, color: "var(--color-text-muted)" }}>
            {helper}
          </Typography>
        ) : null}
      </Stack>
    </Paper>
  );
}
