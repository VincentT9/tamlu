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
          mode: "dark",
          primary: { main: "#2dd4bf", dark: "#14b8a6", light: "#67e8f9", contrastText: "#031014" },
          secondary: { main: "#f5b85b", dark: "#d9952e", light: "#ffd07a", contrastText: "#102126" },
          success: { main: "#34d399", dark: "#10b981", light: "#bbf7d0", contrastText: "#041812" },
          warning: { main: "#f5b85b", dark: "#d9952e", light: "#fff1c7", contrastText: "#102126" },
          error: { main: "#f87171", dark: "#dc2626", light: "#fecaca", contrastText: "#190b0b" },
          background: { default: "#031014", paper: "#061a22" },
          text: { primary: "#f7fdff", secondary: "rgba(224,247,250,.66)" },
          divider: "rgba(103,232,249,.16)",
        },
        typography: {
          fontFamily: "Inter, system-ui, sans-serif",
          h1: { letterSpacing: 0, fontWeight: 900, color: "#f7fdff" },
          h2: { letterSpacing: 0, fontWeight: 900, color: "#f7fdff" },
          h3: { letterSpacing: 0, fontWeight: 900, color: "#f7fdff" },
          h4: { letterSpacing: 0, fontWeight: 900, color: "#f7fdff" },
          h5: { letterSpacing: 0, fontWeight: 850, color: "#f7fdff" },
          h6: { letterSpacing: 0, fontWeight: 850, color: "#f7fdff" },
          button: { textTransform: "none", fontWeight: 800 },
        },
        shape: { borderRadius: 18 },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: "#031014",
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
                color: "#031014",
                boxShadow: "0 12px 28px rgba(45, 212, 191, 0.20)",
                "&:hover": { boxShadow: "0 16px 36px rgba(45, 212, 191, 0.26)" },
              },
              containedSecondary: {
                color: "#102126",
                boxShadow: "0 12px 28px rgba(245, 184, 91, 0.20)",
                "&:hover": { boxShadow: "0 16px 36px rgba(245, 184, 91, 0.28)" },
              },
              outlined: {
                color: "#f7fdff",
                borderColor: "rgba(103,232,249,.22)",
                backgroundColor: "rgba(255,255,255,.045)",
                "&:hover": { borderColor: "#67e8f9", backgroundColor: "rgba(45,212,191,.12)" },
              },
            },
          },
          MuiCard: {
            styleOverrides: { root: { borderRadius: 24, borderColor: "rgba(103,232,249,.16)", backgroundColor: "rgba(6,26,34,.86)", color: "#f7fdff", boxShadow: "0 24px 70px rgba(0,0,0,.24)" } },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
              },
              outlined: {
                borderColor: "rgba(103,232,249,.16)",
                backgroundColor: "rgba(6,26,34,.86)",
                boxShadow: "0 22px 64px rgba(0,0,0,.24)",
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
                backgroundColor: "rgba(255,255,255,.055)",
                color: "#f7fdff",
                "& fieldset": { borderColor: "rgba(103,232,249,.18)" },
                "&:hover fieldset": { borderColor: "rgba(103,232,249,.48)" },
                "&.Mui-focused fieldset": { borderColor: "#67e8f9", boxShadow: "0 0 0 3px rgba(103,232,249,.14)" },
              },
              input: { color: "#f7fdff" },
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
                backgroundColor: "#09232c",
                color: "rgba(224,247,250,.78)",
                fontSize: 12,
                fontWeight: 900,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              },
              root: {
                borderBottomColor: "rgba(103,232,249,.12)",
              },
            },
          },
          MuiTableRow: {
            styleOverrides: {
              root: {
                "&:last-child td": { borderBottom: 0 },
                "&.MuiTableRow-hover:hover": { backgroundColor: "rgba(45,212,191,.07)" },
                "&.Mui-selected": { backgroundColor: "rgba(45,212,191,.11)" },
                "&.Mui-selected:hover": { backgroundColor: "rgba(45,212,191,.15)" },
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
                backgroundColor: "rgba(6, 47, 79, 0.10)",
              },
              bar: {
                borderRadius: 999,
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
                  color: "#031014",
                  "& + .MuiSwitch-track": { backgroundColor: "#2dd4bf", opacity: 1 },
                },
              },
              track: {
                opacity: 1,
                backgroundColor: "rgba(103,232,249,.18)",
              },
            },
          },
          MuiAlert: {
            styleOverrides: {
              root: { borderRadius: 14, alignItems: "center", border: "1px solid rgba(103,232,249,.14)" },
              standardInfo: { backgroundColor: "rgba(45,212,191,.10)", color: "#dffcff", borderColor: "rgba(103,232,249,.22)" },
              standardSuccess: { backgroundColor: "rgba(52,211,153,.12)", color: "#dcfce7", borderColor: "rgba(52,211,153,.24)" },
              standardWarning: { backgroundColor: "rgba(245,184,91,.13)", color: "#ffefc7", borderColor: "rgba(245,184,91,.28)" },
              standardError: { backgroundColor: "rgba(248,113,113,.13)", color: "#fee2e2", borderColor: "rgba(248,113,113,.28)" },
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
