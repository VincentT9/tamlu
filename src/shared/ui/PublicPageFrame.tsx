import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import type { ReactNode } from "react";

interface PublicPageFrameProps {
  children: ReactNode;
  maxWidth?: number;
  sx?: SxProps<Theme>;
}

export function PublicPageFrame({ children, maxWidth = 1500, sx }: PublicPageFrameProps) {
  return (
    <Box
      sx={[
        {
          width: "100%",
          maxWidth,
          mx: "auto",
          boxSizing: "border-box",
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 3.5, md: 5 },
          overflowX: "clip",
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </Box>
  );
}
