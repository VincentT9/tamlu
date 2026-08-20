import { Paper } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import type { ReactNode } from "react";

export function SectionPaper({ children, sx }: { children: ReactNode; sx?: SxProps<Theme> }) {
  return (
    <Paper
      variant="outlined"
      sx={[
        {
          p: { xs: 2.25, md: 3 },
          borderRadius: "var(--radius-panel)",
          borderColor: "var(--color-border)",
          bgcolor: "var(--color-surface)",
          color: "var(--color-text)",
          boxShadow: "none",
          overflow: "visible",
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </Paper>
  );
}
