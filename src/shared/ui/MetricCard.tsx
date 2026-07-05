import { Paper, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  tone?: "blue" | "orange" | "green" | "red" | "neutral";
}

const tones = {
  blue: "#0b6fb3",
  orange: "#e87624",
  green: "#197f5b",
  red: "#c62828",
  neutral: "#52616f",
};

export function MetricCard({ label, value, helper, tone = "blue" }: MetricCardProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderTop: `4px solid ${tones[tone]}` }}>
      <Stack spacing={0.5}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h5" fontWeight={800}>
          {value}
        </Typography>
        {helper ? (
          <Typography variant="caption" color="text.secondary">
            {helper}
          </Typography>
        ) : null}
      </Stack>
    </Paper>
  );
}
