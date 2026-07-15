import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { authApi } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/store";
import { getErrorMessage } from "@/shared/api/client";
import { ROLE_LABELS, ROLES } from "@/shared/constants/roles";
import { useToast } from "@/shared/ui/toast";

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^\d{9,11}$/),
  password: z.string().min(6).regex(/[A-Z]/).regex(/[0-9]/).regex(/[\p{P}\p{S}]/u),
  role: z.enum([ROLES.citizen, ROLES.donor, ROLES.coordinator, ROLES.rescueTeam]),
});

const otpSchema = z.object({
  otp: z.string().length(6),
});

type RegisterForm = z.infer<typeof registerSchema>;
type OtpForm = z.infer<typeof otpSchema>;

export function RegisterPage() {
  const [email, setEmail] = useState("");
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();
  const showToast = useToast((state) => state.showToast);
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: "", email: "", phone: "", password: "", role: ROLES.citizen },
  });
  const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema), defaultValues: { otp: "" } });
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (_, variables) => {
      setEmail(variables.email);
      showToast("Registration created. Check your email for the OTP.", "success");
    },
  });
  const otpMutation = useMutation({
    mutationFn: (values: OtpForm) => authApi.verifyOtp({ email, otp: values.otp }),
    onSuccess: (data) => {
      if (data.token) {
        setSession({ token: data.token, user: data.user, roles: data.roles });
        navigate("/citizen/sos", { replace: true });
      } else {
        showToast("Email verified. Your operational account is waiting for admin approval.", "warning");
        navigate("/login", { replace: true });
      }
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
          maxWidth: 1120,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: ".9fr 1.1fr" },
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
            p: { xs: 3, md: 5 },
            minHeight: { xs: 260, lg: 680 },
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden",
            backgroundImage:
              "linear-gradient(90deg, rgba(3,16,20,.88), rgba(3,16,20,.50)), url(/images/flood-rescue-boat.png)",
            backgroundSize: "cover",
            backgroundPosition: "43% 50%",
          }}
        >
          <Stack spacing={2} sx={{ position: "relative", zIndex: 1, maxWidth: 460 }}>
            <Chip label="Verified access" sx={{ alignSelf: "flex-start", bgcolor: "rgba(45,212,191,.14)", color: "#67e8f9", fontWeight: 900 }} />
            <Typography sx={{ fontSize: { xs: 34, md: 52 }, lineHeight: 1, fontWeight: 950, letterSpacing: "-.035em" }}>
              Join the relief network with a role built for action.
            </Typography>
            <Typography sx={{ color: "rgba(224,247,250,.72)", lineHeight: 1.65 }}>
              Citizens, donors, coordinators, and rescue teams share one transparent platform for flood response.
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ position: "relative", zIndex: 1, flexWrap: "wrap", gap: 1 }}>
            {["Public ledgers", "Field evidence", "Role approval"].map((item) => (
              <Chip key={item} label={item} sx={{ bgcolor: "rgba(255,255,255,.08)", color: "#f7fdff", border: "1px solid rgba(255,255,255,.14)", fontWeight: 800 }} />
            ))}
          </Stack>
        </Box>
        <Stack spacing={2.5} sx={{ p: { xs: 3, sm: 4, md: 5 }, justifyContent: "center" }}>
          <Box>
            <Typography variant="h4" fontWeight={950}>
              Create TamLu account
            </Typography>
            <Typography sx={{ mt: 1, color: "rgba(224,247,250,.66)", lineHeight: 1.6 }}>
              Register once, verify your email, then continue through the existing approval flow.
            </Typography>
          </Box>
          {registerMutation.error ? <Alert severity="error">{getErrorMessage(registerMutation.error)}</Alert> : null}
          {otpMutation.error ? <Alert severity="error">{getErrorMessage(otpMutation.error)}</Alert> : null}
          {!email ? (
            <Stack component="form" spacing={2} onSubmit={registerForm.handleSubmit((values) => registerMutation.mutate(values))}>
              <TextField label="Full name" {...registerForm.register("fullName")} error={Boolean(registerForm.formState.errors.fullName)} helperText={registerForm.formState.errors.fullName?.message} />
              <TextField label="Email" type="email" {...registerForm.register("email")} error={Boolean(registerForm.formState.errors.email)} helperText={registerForm.formState.errors.email?.message} />
              <TextField label="Phone" {...registerForm.register("phone")} error={Boolean(registerForm.formState.errors.phone)} helperText={registerForm.formState.errors.phone?.message} />
              <TextField label="Password" type="password" {...registerForm.register("password")} error={Boolean(registerForm.formState.errors.password)} helperText="At least 6 chars, uppercase, number, special character" />
              <Controller
                name="role"
                control={registerForm.control}
                render={({ field }) => (
                  <FormControl>
                    <InputLabel>Role</InputLabel>
                    <Select {...field} label="Role">
                      {[ROLES.citizen, ROLES.donor, ROLES.coordinator, ROLES.rescueTeam].map((role) => (
                        <MenuItem key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
              <Button type="submit" variant="contained" size="large" disabled={registerMutation.isPending}>
                Register
              </Button>
            </Stack>
          ) : (
            <Stack component="form" spacing={2} onSubmit={otpForm.handleSubmit((values) => otpMutation.mutate(values))}>
              <Alert severity="info">Enter the 6-digit OTP sent to {email}.</Alert>
              <TextField label="OTP" {...otpForm.register("otp")} error={Boolean(otpForm.formState.errors.otp)} helperText={otpForm.formState.errors.otp?.message} />
              <Stack direction="row" spacing={1}>
                <Button type="submit" variant="contained" disabled={otpMutation.isPending}>
                  Verify
                </Button>
                <Button onClick={() => authApi.resendOtp({ email }).then(() => showToast("OTP resent.", "success"))}>Resend OTP</Button>
              </Stack>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
