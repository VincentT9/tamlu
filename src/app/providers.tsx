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
          mode: "light",
          primary: { main: "#3d6b1f", dark: "#2f5210", light: "#eef2ce", contrastText: "#ffffff" },
          secondary: { main: "#eef2ce", dark: "#dce6b0", light: "#f6f8e8", contrastText: "#2f5210" },
          success: { main: "#3d6b1f", dark: "#2f5210", light: "#eef2ce", contrastText: "#ffffff" },
          warning: { main: "#8a6400", dark: "#644800", light: "#eef2ce", contrastText: "#ffffff" },
          error: { main: "#c62828", dark: "#981d1d", light: "#ffe1df", contrastText: "#ffffff" },
          background: { default: "#f6f8e8", paper: "#eef2ce" },
          text: { primary: "#2f5210", secondary: "#5d7047" },
          divider: "rgba(37,77,9,.18)",
        },
        typography: {
          fontFamily: "Inter, system-ui, sans-serif",
          h1: { letterSpacing: 0, fontWeight: 900, color: "#2f5210" },
          h2: { letterSpacing: 0, fontWeight: 900, color: "#2f5210" },
          h3: { letterSpacing: 0, fontWeight: 900, color: "#2f5210" },
          h4: { letterSpacing: 0, fontWeight: 900, color: "#2f5210" },
          h5: { letterSpacing: 0, fontWeight: 850, color: "#2f5210" },
          h6: { letterSpacing: 0, fontWeight: 850, color: "#2f5210" },
          button: { textTransform: "none", fontWeight: 800 },
        },
        shape: { borderRadius: 18 },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: "var(--color-cream-50)",
                color: "var(--color-text)",
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                minHeight: 42,
                borderRadius: 14,
                boxShadow: "none",
                textTransform: "none",
                fontWeight: 800,
                transition: "transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease, border-color 160ms ease",
                "&:active": { transform: "translateY(1px)" },
              },
              containedPrimary: {
                color: "#ffffff",
                boxShadow: "none",
                "&:hover": { boxShadow: "none" },
              },
              containedSecondary: {
                color: "var(--color-text)",
                boxShadow: "none",
                "&:hover": { boxShadow: "none" },
              },
              outlined: {
                color: "var(--color-green-800)",
                borderColor: "var(--color-border-strong)",
                backgroundColor: "#ffffff",
                "&:hover": { borderColor: "var(--color-green-600)", backgroundColor: "var(--color-green-50)" },
              },
            },
          },
          MuiCard: {
            styleOverrides: { root: { borderRadius: 18, borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", color: "var(--color-text)", boxShadow: "var(--shadow-surface)" } },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
              outlined: {
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-surface)",
                boxShadow: "none",
              },
            },
          },
          MuiTextField: {
            defaultProps: { variant: "outlined" },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: 14,
                backgroundColor: "#ffffff",
                color: "var(--color-text)",
                "& fieldset": { borderColor: "var(--color-border)" },
                "&:hover fieldset": { borderColor: "var(--color-border-strong)" },
                "&.Mui-focused fieldset": { borderColor: "var(--color-green-600)", boxShadow: "0 0 0 3px rgba(77,141,22,.14)" },
              },
              input: { color: "var(--color-text)" },
            },
          },
          MuiTableContainer: {
            styleOverrides: { root: { borderRadius: 18 } },
          },
          MuiTableCell: {
            styleOverrides: {
              head: {
                position: "sticky",
                top: 0,
                zIndex: 1,
                backgroundColor: "var(--color-green-50)",
                color: "var(--color-green-800)",
                fontSize: 12,
                fontWeight: 900,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              },
              root: {
                borderBottomColor: "var(--color-border)",
              },
            },
          },
          MuiTableRow: {
            styleOverrides: {
              root: {
                "&:last-child td": { borderBottom: 0 },
                "&.MuiTableRow-hover:hover": { backgroundColor: "var(--color-green-50)" },
                "&.Mui-selected": { backgroundColor: "var(--color-green-100)" },
                "&.Mui-selected:hover": { backgroundColor: "var(--color-green-100)" },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: { borderRadius: 999, fontWeight: 800, letterSpacing: 0 },
            },
          },
          MuiLinearProgress: {
            styleOverrides: {
              root: {
                height: 9,
                borderRadius: 999,
                backgroundColor: "var(--color-progress-track)",
              },
              bar: {
                borderRadius: 999,
                backgroundColor: "var(--color-progress-fill)",
              },
            },
          },
          MuiTabs: {
            styleOverrides: {
              root: { minHeight: 44 },
              indicator: { height: 3, borderRadius: 999 },
            },
          },
          MuiTab: {
            styleOverrides: {
              root: {
                minHeight: 44,
                textTransform: "none",
                fontWeight: 800,
              },
            },
          },
          MuiSwitch: {
            styleOverrides: {
              switchBase: {
                "&.Mui-checked": {
                  color: "#ffffff",
                  "& + .MuiSwitch-track": { backgroundColor: "var(--color-green-700)", opacity: 1 },
                },
              },
              track: {
                opacity: 1,
                backgroundColor: "var(--color-green-200)",
              },
            },
          },
          MuiAlert: {
            styleOverrides: {
              root: { borderRadius: 16, alignItems: "center", border: "1px solid var(--color-border)" },
              standardInfo: { backgroundColor: "var(--color-green-50)", color: "var(--color-text)", borderColor: "var(--color-border)" },
              standardSuccess: { backgroundColor: "var(--color-green-50)", color: "var(--color-text)", borderColor: "var(--color-border)" },
              standardWarning: { backgroundColor: "var(--color-cream-100)", color: "var(--color-text)", borderColor: "var(--color-border-strong)" },
              standardError: { backgroundColor: "#fff1f0", color: "#8f1d18", borderColor: "rgba(198,40,40,.28)" },
            },
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
