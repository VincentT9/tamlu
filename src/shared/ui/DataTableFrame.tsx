import { Paper } from "@mui/material";
import type { ReactNode } from "react";

interface DataTableFrameProps {
  children: ReactNode;
  label: string;
}

export function DataTableFrame({ children, label }: DataTableFrameProps) {
  return (
    <Paper
      variant="outlined"
      role="region"
      aria-label={label}
      tabIndex={0}
      sx={{
        overflowX: "auto",
        borderRadius: "var(--radius-panel)",
        borderColor: "var(--color-border)",
        bgcolor: "var(--color-surface)",
        boxShadow: "none",
        "&:focus-visible": {
          outline: "3px solid rgba(83, 159, 5, 0.24)",
          outlineOffset: 2,
        },
      }}
    >
      {children}
    </Paper>
  );
}
