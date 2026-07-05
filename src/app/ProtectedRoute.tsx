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
          <Alert severity="warning">You do not have access to this workspace.</Alert>
          <Button href="/">Return home</Button>
        </Stack>
      </Box>
    );
  }

  return <>{children}</>;
}
