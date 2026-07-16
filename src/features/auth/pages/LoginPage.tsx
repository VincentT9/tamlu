import LockOpenIcon from "@mui/icons-material/LockOpen";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, Link as MuiLink, Paper, Stack, TextField, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { authApi } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/store";
import { getErrorMessage } from "@/shared/api/client";
import { useToast } from "@/shared/ui/toast";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type LoginForm = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((state) => state.setSession);
  const showToast = useToast((state) => state.showToast);
  const form = useForm<LoginForm>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });
  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      if (!data.token) {
        showToast(data.message ?? "Your account is waiting for admin approval.", "warning");
        return;
      }
      setSession({ token: data.token, user: data.user, roles: data.roles });
      showToast("Welcome back to TamLu.", "success");
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from ?? defaultRoute(data.roles), { replace: true });
    },
  });

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        p: { xs: 2, md: 4 },
        bgcolor: "#031014",
        color: "#f7fdff",
        background:
          "radial-gradient(circle at 16% 4%, rgba(45,212,191,.18), transparent 30%), radial-gradient(circle at 82% 12%, rgba(245,184,91,.11), transparent 28%), linear-gradient(180deg, #031014 0%, #04181d 100%)",
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          width: "100%",
          maxWidth: 1060,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.08fr .92fr" },
          overflow: "hidden",
          borderRadius: { xs: 5, md: 7 },
          borderColor: "rgba(103,232,249,.20)",
          bgcolor: "rgba(6,26,34,.88)",
          color: "#f7fdff",
          boxShadow: "0 40px 120px rgba(0,0,0,.45)",
        }}
      >
        <Box
          sx={{
            minHeight: { xs: 260, md: 620 },
            p: { xs: 3, md: 5 },
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden",
            backgroundImage:
              "linear-gradient(90deg, rgba(3,16,20,.86), rgba(3,16,20,.42)), url(/images/flood-rescue-boat.png)",
            backgroundSize: "cover",
            backgroundPosition: "43% 50%",
          }}
        >
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box sx={{ display: "grid", placeItems: "center", width: 42, height: 42, borderRadius: "50%", bgcolor: "#2dd4bf", color: "#031014", fontWeight: 950 }}>
                TL
              </Box>
              <Box>
                <Typography fontWeight={950}>Tam Lu Relief</Typography>
                <Typography variant="caption" sx={{ color: "rgba(224,247,250,.62)", fontWeight: 750 }}>
                  Flood rescue and recovery
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Stack spacing={2} sx={{ position: "relative", zIndex: 1, maxWidth: 500 }}>
            <Typography sx={{ fontSize: { xs: 34, md: 52 }, lineHeight: 1, fontWeight: 950, letterSpacing: "-.035em" }}>
              Trusted access for relief operators.
            </Typography>
            <Typography sx={{ color: "rgba(224,247,250,.72)", lineHeight: 1.65 }}>
              Coordinate rescue activity, donation transparency, and community recovery from one protected workspace.
            </Typography>
          </Stack>
        </Box>
        <Stack spacing={2.5} sx={{ p: { xs: 3, sm: 4, md: 5 }, justifyContent: "center" }}>
          <Stack spacing={1}>
            <Box sx={{ display: "grid", placeItems: "center", width: 48, height: 48, borderRadius: 3, bgcolor: "rgba(45,212,191,.12)", color: "#67e8f9" }}>
              <LockOpenIcon />
            </Box>
            <Typography variant="h4" fontWeight={950}>
              Sign in
            </Typography>
            <Typography sx={{ color: "rgba(224,247,250,.66)" }}>Access rescue coordination, donation records, and citizen services.</Typography>
          </Stack>
          {mutation.error ? <Alert severity="error">{getErrorMessage(mutation.error)}</Alert> : null}
          <Stack component="form" spacing={2} onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <TextField label="Email" type="email" {...form.register("email")} error={Boolean(form.formState.errors.email)} helperText={form.formState.errors.email?.message} />
            <TextField label="Password" type="password" {...form.register("password")} error={Boolean(form.formState.errors.password)} helperText={form.formState.errors.password?.message} />
            <Button type="submit" variant="contained" size="large" disabled={mutation.isPending}>
              Sign in
            </Button>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <MuiLink component={Link} to="/register" sx={{ color: "#67e8f9", fontWeight: 800 }}>
              Create account
            </MuiLink>
            <MuiLink component={Link} to="/forgot-password" sx={{ color: "#67e8f9", fontWeight: 800 }}>
              Forgot password?
            </MuiLink>
          </Stack>
          <MuiLink component={Link} to="/" textAlign="center" sx={{ color: "rgba(224,247,250,.62)", fontWeight: 800 }}>
            <ShieldOutlinedIcon sx={{ mr: .75, fontSize: 18, verticalAlign: "text-bottom" }} />
            Continue public
          </MuiLink>
        </Stack>
      </Paper>
    </Box>
  );
}

function defaultRoute(roles: string[]) {
  if (roles.includes("RESCUE_TEAM")) return "/team/missions";
  if (roles.includes("ADMIN") || roles.includes("COORDINATOR") || roles.includes("FINANCIAL_OFFICER")) return "/ops";
  if (roles.includes("DONOR")) return "/donor/donations";
  return "/citizen/sos";
}
