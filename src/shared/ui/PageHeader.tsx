import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Box, Button, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  eyebrow?: string;
  description?: string;
  actions?: ReactNode;
  showBack?: boolean;
  backTo?: string;
}

export function PageHeader({ title, eyebrow, description, actions, showBack = true, backTo }: PageHeaderProps) {
  const navigate = useNavigate();
  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
      return;
    }
    if (window.history.length > 1) navigate(-1);
    else navigate("/dashboard");
  };

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
      <Stack spacing={1.25} sx={{ minWidth: 0 }}>
        {showBack ? (
          <Button
            type="button"
            variant="outlined"
            size="small"
            startIcon={<ArrowBackIcon fontSize="small" />}
            onClick={handleBack}
            sx={{
              alignSelf: "flex-start",
              minHeight: 38,
              px: 1.6,
              borderRadius: 999,
              bgcolor: "rgba(255,255,255,.58)",
              borderColor: "var(--color-border)",
              color: "var(--color-green-800)",
              fontWeight: 700,
              boxShadow: "none",
              "&:hover": {
                bgcolor: "#ffffff",
                borderColor: "var(--color-green-600)",
              },
            }}
          >
            Quay lại
          </Button>
        ) : null}
        <Box>
          {eyebrow ? (
            <Typography variant="body2" sx={{ color: "var(--color-green-700)", fontWeight: 700 }}>
              {eyebrow}
            </Typography>
          ) : null}
          <Typography component="h1" variant="h4" fontWeight={800} letterSpacing={0} sx={{ lineHeight: 1.12, color: "var(--color-green-800)" }}>
            {title}
          </Typography>
          {description ? (
            <Typography variant="body1" sx={{ mt: 1, maxWidth: 820, lineHeight: 1.65, color: "var(--color-text-muted)" }}>
              {description}
            </Typography>
          ) : null}
        </Box>
      </Stack>
      {actions ? <Box sx={{ width: { xs: "100%", md: "auto" } }}>{actions}</Box> : null}
    </Stack>
  );
}
