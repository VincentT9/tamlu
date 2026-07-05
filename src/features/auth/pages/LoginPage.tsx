import LockOpenIcon from "@mui/icons-material/LockOpen";
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
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2, bgcolor: "background.default" }}>
      <Paper variant="outlined" sx={{ width: "100%", maxWidth: 460, p: 4, borderRadius: 2 }}>
        <Stack spacing={2.5}>
          <Stack spacing={1}>
            <LockOpenIcon color="primary" />
            <Typography variant="h4" fontWeight={900}>
              Sign in
            </Typography>
            <Typography color="text.secondary">Access rescue coordination, donation records, and citizen services.</Typography>
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
            <MuiLink component={Link} to="/register">
              Create account
            </MuiLink>
            <MuiLink component={Link} to="/forgot-password">
              Forgot password?
            </MuiLink>
          </Stack>
          <MuiLink component={Link} to="/" textAlign="center">
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
