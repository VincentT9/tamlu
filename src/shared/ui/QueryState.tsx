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
      <Stack spacing={1.25} sx={{ minHeight: 220, py: 2 }} aria-label="Đang tải nội dung">
        <Skeleton variant="rectangular" height={64} sx={{ borderRadius: 0, bgcolor: "var(--color-green-100)" }} />
        <Skeleton variant="rectangular" height={64} sx={{ borderRadius: 0, bgcolor: "var(--color-green-50)" }} />
        <Skeleton variant="rectangular" height={64} sx={{ borderRadius: 0, bgcolor: "var(--color-cream-100)" }} />
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
              Thử lại
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
      <Box sx={{ py: 7, px: 2, textAlign: "center", color: "var(--color-text)" }}>
        <Box
          aria-hidden="true"
          sx={{
            mx: "auto",
            mb: 2,
            width: 56,
            height: 56,
            borderRadius: 0,
            border: "1px solid",
            borderColor: "var(--color-border)",
            bgcolor: "var(--color-green-50)",
          }}
        />
        <Typography variant="h6" fontWeight={800}>
          {emptyTitle ?? "Chưa có dữ liệu"}
        </Typography>
        <Typography sx={{ mt: 0.5, color: "var(--color-text-muted)" }}>
          {emptyText ?? "Khi có dữ liệu, thông tin sẽ hiển thị tại đây."}
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
