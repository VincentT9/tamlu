import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
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
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 220 }}>
        <CircularProgress />
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
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography variant="h6" fontWeight={800}>
          {emptyTitle ?? "No data yet"}
        </Typography>
        <Typography color="text.secondary">{emptyText ?? "When data is available, it will appear here."}</Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
