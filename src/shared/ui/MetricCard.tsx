import { Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  tone?: "blue" | "orange" | "green" | "red" | "neutral";
}

const tones = {
  blue: "var(--color-green-600)",
  orange: "var(--brand-green)",
  green: "var(--color-green-700)",
  red: "#f87171",
  neutral: "var(--color-text-muted)",
};

export function MetricCard({ label, value, helper, tone = "blue" }: MetricCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        position: "relative",
        overflow: "visible",
        p: 2.75,
        borderRadius: 3,
        borderColor: "var(--color-border)",
        bgcolor: "var(--color-surface)",
        color: "var(--color-text)",
        boxShadow: "var(--shadow-surface)",
        backdropFilter: "blur(18px)",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: "0 auto 0 0",
          width: 5,
          bgcolor: tones[tone],
          opacity: 0.9,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          right: -32,
          top: -32,
          width: 96,
          height: 96,
          borderRadius: "50%",
          bgcolor: tones[tone],
          opacity: 0.12,
        },
      }}
    >
      <Stack spacing={0.75} sx={{ position: "relative" }}>
        <Typography variant="body2" sx={{ color: "var(--color-text-muted)", fontWeight: 850 }}>
          {label}
        </Typography>
        <Typography variant="h5" fontWeight={950} sx={{ lineHeight: 1.05, color: "var(--color-green-800)" }}>
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
