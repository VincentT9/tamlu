import LockOpenIcon from "@mui/icons-material/LockOpen";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, Link as MuiLink, Paper, Stack, TextField, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
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
  const setSession = useAuthStore((state) => state.setSession);
  const showToast = useToast((state) => state.showToast);
  const form = useForm<LoginForm>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });
  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      if (!data.token) {
        showToast(data.message ?? "Tài khoản của quý vị đang chờ quản trị viên phê duyệt.", "warning");
        return;
      }
      setSession({ token: data.token, user: data.user, roles: data.roles });
      showToast("Chào mừng quý vị quay lại Tâm Lũ.", "success");
      navigate("/dashboard", { replace: true });
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
          maxWidth: 1060,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.08fr .92fr" },
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
            minHeight: { xs: 260, md: 620 },
            p: { xs: 3, md: 5 },
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
          <Box sx={{ position: "relative", zIndex: 1 }}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box component="img" src="/images/tam-lu-logo-transparent.png" alt="Logo Tâm Lũ" sx={{ width: 72, height: 72, objectFit: "contain" }} />
              <Box>
                <Typography fontWeight={950}>Tâm Lũ</Typography>
                <Typography variant="caption" sx={{ color: "var(--color-text-muted)", fontWeight: 750 }}>
                  Kết nối yêu thương, cứu trợ lũ lụt
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Stack spacing={2} sx={{ position: "relative", zIndex: 1, maxWidth: 500 }}>
            <Typography sx={{ fontSize: { xs: 34, md: 52 }, lineHeight: 1, fontWeight: 950, letterSpacing: "-.035em" }}>
              Truy cập bảo mật cho lực lượng cứu trợ.
            </Typography>
            <Typography sx={{ color: "var(--color-text-muted)", lineHeight: 1.65 }}>
              Điều phối cứu hộ, minh bạch quyên góp và phục hồi cộng đồng trong một không gian làm việc được bảo vệ.
            </Typography>
          </Stack>
        </Box>
        <Stack spacing={2.5} sx={{ p: { xs: 3, sm: 4, md: 5 }, justifyContent: "center" }}>
          <Stack spacing={1}>
            <Box sx={{ display: "grid", placeItems: "center", width: 48, height: 48, borderRadius: 2, bgcolor: "var(--color-green-50)", color: "var(--color-green-700)", border: "1px solid var(--color-border)" }}>
              <LockOpenIcon />
            </Box>
            <Typography variant="h4" fontWeight={950}>
              Đăng nhập
            </Typography>
            <Typography sx={{ color: "var(--color-text-muted)" }}>Truy cập điều phối cứu hộ, hồ sơ đóng góp và dịch vụ công dân.</Typography>
          </Stack>
          {mutation.error ? <Alert severity="error">{getErrorMessage(mutation.error)}</Alert> : null}
          <Stack component="form" spacing={2} onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
            <TextField label="Email" type="email" {...form.register("email")} error={Boolean(form.formState.errors.email)} helperText={form.formState.errors.email?.message} />
            <TextField label="Mật khẩu" type="password" {...form.register("password")} error={Boolean(form.formState.errors.password)} helperText={form.formState.errors.password?.message} />
            <Button type="submit" variant="contained" size="large" disabled={mutation.isPending}>
              Đăng nhập
            </Button>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <MuiLink component={Link} to="/register" sx={{ color: "var(--color-green-700)", fontWeight: 800 }}>
              Tạo tài khoản
            </MuiLink>
            <MuiLink component={Link} to="/forgot-password" sx={{ color: "var(--color-green-700)", fontWeight: 800 }}>
              Quên mật khẩu?
            </MuiLink>
          </Stack>
          <MuiLink component={Link} to="/" textAlign="center" sx={{ color: "var(--color-text-muted)", fontWeight: 800 }}>
            <ShieldOutlinedIcon sx={{ mr: .75, fontSize: 18, verticalAlign: "text-bottom" }} />
            Tiếp tục xem trang công khai
          </MuiLink>
        </Stack>
      </Paper>
    </Box>
  );
}
