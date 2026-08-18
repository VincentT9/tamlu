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
        borderRadius: 1.5,
        borderColor: "var(--color-border)",
        bgcolor: "var(--color-surface)",
        boxShadow: "0 6px 20px rgba(14, 92, 107, 0.05)",
        "&:focus-visible": {
          outline: "3px solid rgba(14, 92, 107, 0.2)",
          outlineOffset: 2,
        },
      }}
    >
      {children}
    </Paper>
  );
}
