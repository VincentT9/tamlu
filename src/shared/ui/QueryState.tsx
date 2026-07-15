import { Alert, Box, Button, Skeleton, Stack, Typography } from "@mui/material";
import { getErrorMessage } from "@/shared/api/client";

interface QueryStateProps {
  isLoading?: boolean;
  error?: unknown;
  empty?: boolean;
  emptyTitle?: string;
  emptyText?: string;
  refetch?: () => void;
  children: React.ReactNode;
}

export function QueryState({ isLoading, error, empty, emptyTitle, emptyText, refetch, children }: QueryStateProps) {
  if (isLoading) {
    return (
      <Stack spacing={1.25} sx={{ minHeight: 220, py: 2 }} aria-label="Loading content">
        <Skeleton variant="rounded" height={64} sx={{ borderRadius: 4, bgcolor: "rgba(45,212,191,.10)" }} />
        <Skeleton variant="rounded" height={64} sx={{ borderRadius: 4, bgcolor: "rgba(45,212,191,.08)" }} />
        <Skeleton variant="rounded" height={64} sx={{ borderRadius: 4, bgcolor: "rgba(45,212,191,.06)" }} />
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          refetch ? (
            <Button color="inherit" onClick={refetch}>
              Retry
            </Button>
          ) : null
        }
      >
        {getErrorMessage(error)}
      </Alert>
    );
  }

  if (empty) {
    return (
      <Box sx={{ py: 7, px: 2, textAlign: "center", color: "#f7fdff" }}>
        <Box
          aria-hidden="true"
          sx={{
            mx: "auto",
            mb: 2,
            width: 56,
            height: 56,
            borderRadius: 4,
            border: "1px solid",
            borderColor: "rgba(103,232,249,.20)",
            bgcolor: "rgba(45,212,191,.12)",
          }}
        />
        <Typography variant="h6" fontWeight={800}>
          {emptyTitle ?? "No data yet"}
        </Typography>
        <Typography sx={{ mt: 0.5, color: "rgba(224,247,250,.62)" }}>
          {emptyText ?? "When data is available, it will appear here."}
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
