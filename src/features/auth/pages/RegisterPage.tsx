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
  role: z.enum([ROLES.citizen, ROLES.donor, ROLES.volunteer, ROLES.coordinator, ROLES.rescueTeam]),
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
      showToast("Đăng ký đã được tạo. Vui lòng kiểm tra email để nhận mã OTP.", "success");
    },
  });
  const otpMutation = useMutation({
    mutationFn: (values: OtpForm) => authApi.verifyOtp({ email, otp: values.otp }),
    onSuccess: (data) => {
      if (data.token) {
        setSession({ token: data.token, user: data.user, roles: data.roles });
        navigate("/dashboard", { replace: true });
      } else {
        showToast("Email đã được xác minh. Tài khoản vận hành đang chờ quản trị viên phê duyệt.", "warning");
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
        bgcolor: "var(--color-cream-50)",
        color: "var(--color-text)",
        background: "var(--color-cream-50)",
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
          borderRadius: 3,
          borderColor: "var(--color-border)",
          bgcolor: "var(--color-surface)",
          color: "var(--color-text)",
          boxShadow: "var(--shadow-surface)",
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
              "linear-gradient(90deg, rgba(246,248,232,.92), rgba(246,248,232,.54)), url(/images/flood-rescue-boat.png)",
            backgroundSize: "cover",
            backgroundPosition: "43% 50%",
          }}
        >
          <Stack spacing={2} sx={{ position: "relative", zIndex: 1, maxWidth: 460 }}>
            <Chip label="Quyền truy cập đã xác minh" sx={{ alignSelf: "flex-start", bgcolor: "var(--color-green-100)", color: "var(--color-green-800)", fontWeight: 900, borderRadius: 999 }} />
            <Typography sx={{ fontSize: { xs: 34, md: 52 }, lineHeight: 1, fontWeight: 950, letterSpacing: "-.035em" }}>
              Tham gia mạng lưới cứu trợ với vai trò phù hợp để hành động.
            </Typography>
            <Typography sx={{ color: "var(--color-text-muted)", lineHeight: 1.65 }}>
              Người dân, nhà hảo tâm, điều phối viên và đội cứu hộ cùng sử dụng một nền tảng minh bạch cho ứng phó lũ lụt.
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ position: "relative", zIndex: 1, flexWrap: "wrap", gap: 1 }}>
            {["Sổ công khai", "Bằng chứng hiện trường", "Phê duyệt vai trò"].map((item) => (
              <Chip key={item} label={item} sx={{ bgcolor: "#ffffff", color: "var(--color-green-800)", border: "1px solid var(--color-border)", fontWeight: 800, borderRadius: 999 }} />
            ))}
          </Stack>
        </Box>
        <Stack spacing={2.5} sx={{ p: { xs: 3, sm: 4, md: 5 }, justifyContent: "center" }}>
          <Box>
            <Typography variant="h4" fontWeight={950}>
              Tạo tài khoản Tâm Lũ
            </Typography>
            <Typography sx={{ mt: 1, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
              Đăng ký một lần, xác minh email và tiếp tục theo quy trình phê duyệt hiện có.
            </Typography>
          </Box>
          {registerMutation.error ? <Alert severity="error">{getErrorMessage(registerMutation.error)}</Alert> : null}
          {otpMutation.error ? <Alert severity="error">{getErrorMessage(otpMutation.error)}</Alert> : null}
          {!email ? (
            <Stack component="form" spacing={2} onSubmit={registerForm.handleSubmit((values) => registerMutation.mutate(values))}>
              <TextField label="Họ và tên" {...registerForm.register("fullName")} error={Boolean(registerForm.formState.errors.fullName)} helperText={registerForm.formState.errors.fullName?.message} />
              <TextField label="Email" type="email" {...registerForm.register("email")} error={Boolean(registerForm.formState.errors.email)} helperText={registerForm.formState.errors.email?.message} />
              <TextField label="Số điện thoại" {...registerForm.register("phone")} error={Boolean(registerForm.formState.errors.phone)} helperText={registerForm.formState.errors.phone?.message} />
              <TextField label="Mật khẩu" type="password" {...registerForm.register("password")} error={Boolean(registerForm.formState.errors.password)} helperText="Tối thiểu 6 ký tự, có chữ hoa, số và ký tự đặc biệt" />
              <Controller
                name="role"
                control={registerForm.control}
                render={({ field }) => (
                  <FormControl>
                    <InputLabel>Vai trò</InputLabel>
                    <Select {...field} label="Vai trò">
                      {[ROLES.citizen, ROLES.donor, ROLES.volunteer, ROLES.coordinator, ROLES.rescueTeam].map((role) => (
                        <MenuItem key={role} value={role}>
                          {ROLE_LABELS[role]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
              <Button type="submit" variant="contained" size="large" disabled={registerMutation.isPending}>
                Đăng ký
              </Button>
            </Stack>
          ) : (
            <Stack component="form" spacing={2} onSubmit={otpForm.handleSubmit((values) => otpMutation.mutate(values))}>
              <Alert severity="info">Nhập mã OTP 6 chữ số đã được gửi đến {email}.</Alert>
              <TextField label="OTP" {...otpForm.register("otp")} error={Boolean(otpForm.formState.errors.otp)} helperText={otpForm.formState.errors.otp?.message} />
              <Stack direction="row" spacing={1}>
                <Button type="submit" variant="contained" disabled={otpMutation.isPending}>
                  Xác minh
                </Button>
                <Button onClick={() => authApi.resendOtp({ email }).then(() => showToast("Đã gửi lại mã OTP.", "success"))}>Gửi lại OTP</Button>
              </Stack>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
