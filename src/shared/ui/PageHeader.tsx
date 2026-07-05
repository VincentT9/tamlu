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
      spacing={2}
      alignItems={{ xs: "flex-start", md: "center" }}
      justifyContent="space-between"
      sx={{ mb: 3 }}
    >
      <Box>
        {eyebrow ? (
          <Typography variant="overline" color="primary" fontWeight={800}>
            {eyebrow}
          </Typography>
        ) : null}
        <Typography variant="h4" fontWeight={900} letterSpacing={0}>
          {title}
        </Typography>
        {description ? (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, maxWidth: 820 }}>
            {description}
          </Typography>
        ) : null}
      </Box>
      {actions}
    </Stack>
  );
}
