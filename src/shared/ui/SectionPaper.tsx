import { Paper } from "@mui/material";
import type { ReactNode } from "react";

export function SectionPaper({ children }: { children: ReactNode }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2.25, md: 3 },
        borderRadius: 5,
        borderColor: "rgba(103,232,249,.16)",
        bgcolor: "rgba(6,26,34,.86)",
        color: "#f7fdff",
        boxShadow: "0 24px 80px rgba(0,0,0,.24)",
        backdropFilter: "blur(18px)",
        overflow: "hidden",
      }}
    >
      {children}
    </Paper>
  );
}
