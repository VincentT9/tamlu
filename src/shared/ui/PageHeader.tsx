import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  eyebrow?: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, eyebrow, description, actions }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2.5}
      alignItems={{ xs: "flex-start", md: "center" }}
      justifyContent="space-between"
      sx={{
        mb: 3,
        px: { xs: 0, md: 0.5 },
      }}
    >
      <Box>
        {eyebrow ? (
          <Typography variant="overline" sx={{ color: "var(--color-green-600)", fontWeight: 950, letterSpacing: 1.2 }}>
            {eyebrow}
          </Typography>
        ) : null}
        <Typography variant="h4" fontWeight={950} letterSpacing={0} sx={{ lineHeight: 1.04, color: "var(--color-green-800)" }}>
          {title}
        </Typography>
        {description ? (
          <Typography variant="body1" sx={{ mt: 1, maxWidth: 820, lineHeight: 1.65, color: "var(--color-text-muted)" }}>
            {description}
          </Typography>
        ) : null}
      </Box>
      {actions ? <Box sx={{ width: { xs: "100%", md: "auto" } }}>{actions}</Box> : null}
    </Stack>
  );
}
