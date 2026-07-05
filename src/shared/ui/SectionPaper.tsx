import { Paper } from "@mui/material";
import type { ReactNode } from "react";

export function SectionPaper({ children }: { children: ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
      {children}
    </Paper>
  );
}
