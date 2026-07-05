import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
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
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2, bgcolor: "background.default" }}>
      <Paper variant="outlined" sx={{ width: "100%", maxWidth: 560, p: 4, borderRadius: 2 }}>
        <Stack spacing={2.5}>
          <Typography variant="h4" fontWeight={900}>
            Create TamLu account
          </Typography>
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
