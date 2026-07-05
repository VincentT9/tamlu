import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Alert, CssBaseline, Snackbar, ThemeProvider, createTheme } from "@mui/material";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { isBackendConnectionError } from "@/shared/api/client";
import { useToast } from "@/shared/ui/toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchOnWindowFocus: true,
      retry: (failureCount, error) => !isBackendConnectionError(error) && failureCount < 1,
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  const { open, message, severity, closeToast } = useToast();
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          primary: { main: "#0b6fb3", dark: "#064f82" },
          secondary: { main: "#e87624", dark: "#b95715" },
          success: { main: "#197f5b" },
          background: { default: "#f5f8fb" },
        },
        typography: {
          fontFamily: "Inter, system-ui, sans-serif",
          h1: { letterSpacing: 0 },
          h2: { letterSpacing: 0 },
          h3: { letterSpacing: 0 },
          h4: { letterSpacing: 0 },
          h5: { letterSpacing: 0 },
          h6: { letterSpacing: 0 },
        },
        shape: { borderRadius: 8 },
        components: {
          MuiButton: {
            styleOverrides: { root: { textTransform: "none", fontWeight: 700 } },
          },
          MuiCard: {
            styleOverrides: { root: { borderRadius: 8 } },
          },
        },
      }),
    [],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        {children}
        <Snackbar open={open} autoHideDuration={4200} onClose={closeToast} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert severity={severity} variant="filled" onClose={closeToast}>
            {message}
          </Alert>
        </Snackbar>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
