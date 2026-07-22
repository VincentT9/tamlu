import { Alert, Box, Button, Stack } from "@mui/material";
import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuthStore } from "@/features/auth/store";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, hasAnyRole } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles?.length && !hasAnyRole(roles)) {
    return (
      <Box sx={{ p: 4 }}>
        <Stack spacing={2}>
          <Alert severity="warning">Bạn không có quyền truy cập khu vực làm việc này.</Alert>
          <Button href="/">Quay về trang chủ</Button>
        </Stack>
      </Box>
    );
  }

  return <>{children}</>;
}
