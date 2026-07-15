import { Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  tone?: "blue" | "orange" | "green" | "red" | "neutral";
}

const tones = {
  blue: "#67e8f9",
  orange: "#f5b85b",
  green: "#34d399",
  red: "#f87171",
  neutral: "rgba(224,247,250,.60)",
};

export function MetricCard({ label, value, helper, tone = "blue" }: MetricCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        position: "relative",
        overflow: "hidden",
        p: 2.75,
        borderRadius: 5,
        borderColor: "rgba(103,232,249,.16)",
        bgcolor: "rgba(6,26,34,.86)",
        color: "#f7fdff",
        boxShadow: "0 24px 80px rgba(0,0,0,.22)",
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
        <Typography variant="body2" sx={{ color: "rgba(224,247,250,.62)", fontWeight: 850 }}>
          {label}
        </Typography>
        <Typography variant="h5" fontWeight={950} sx={{ lineHeight: 1.05, color: "#f7fdff" }}>
          {value}
        </Typography>
        {helper ? (
          <Typography variant="caption" sx={{ lineHeight: 1.5, color: "rgba(224,247,250,.50)" }}>
            {helper}
          </Typography>
        ) : null}
      </Stack>
    </Paper>
  );
}
