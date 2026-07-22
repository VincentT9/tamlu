import { zodResolver } from "@hookform/resolvers/zod";
import { Alert } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { authApi } from "@/features/auth/api";
import { getErrorMessage } from "@/shared/api/client";
import { useToast } from "@/shared/ui/toast";
import { Button, Card, Input } from "@/components";

const requestSchema = z.object({
  email: z.string().email("Vui lòng nhập địa chỉ email hợp lệ."),
});

const resetSchema = z.object({
  otp: z.string().min(4, "Vui lòng nhập mã OTP trong email."),
  newPassword: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự."),
});

type RequestForm = z.infer<typeof requestSchema>;
type ResetForm = z.infer<typeof resetSchema>;

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const showToast = useToast((state) => state.showToast);
  const requestForm = useForm<RequestForm>({ resolver: zodResolver(requestSchema), defaultValues: { email: "" } });
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(resetSchema), defaultValues: { otp: "", newPassword: "" } });

  const requestMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: (_, values) => {
      setEmail(values.email);
      showToast("Mã OTP đặt lại mật khẩu đã được gửi.", "success");
    },
  });

  const resetMutation = useMutation({
    mutationFn: (values: ResetForm) => authApi.resetPassword({ email, ...values }),
    onSuccess: () => {
      showToast("Đặt lại mật khẩu thành công. Quý vị có thể đăng nhập.", "success");
      resetForm.reset();
    },
  });

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[var(--color-cream-50)] px-4 py-10 text-[var(--color-text)]">
      <Card className="w-full max-w-md border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div className="mb-6">
          <p className="text-sm font-black uppercase tracking-wide text-[var(--color-green-600)]">Khôi phục tài khoản</p>
          <h1 className="mt-2 text-3xl font-black text-[var(--color-green-800)]">Đặt lại mật khẩu</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">Sử dụng email đã đăng ký để nhận mã OTP, sau đó tạo mật khẩu mới.</p>
        </div>

        {requestMutation.error ? <Alert severity="error">{getErrorMessage(requestMutation.error)}</Alert> : null}
        {resetMutation.error ? <Alert severity="error">{getErrorMessage(resetMutation.error)}</Alert> : null}

        {!email ? (
          <form className="mt-4 space-y-4" onSubmit={requestForm.handleSubmit((values) => requestMutation.mutate(values))}>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              {...requestForm.register("email")}
              error={requestForm.formState.errors.email?.message}
            />
            <Button type="submit" className="w-full" disabled={requestMutation.isPending}>
              Gửi mã OTP đặt lại
            </Button>
          </form>
        ) : (
          <form className="mt-4 space-y-4" onSubmit={resetForm.handleSubmit((values) => resetMutation.mutate(values))}>
            <Alert severity="info">Mã OTP đã được gửi đến {email}.</Alert>
            <Input label="OTP" {...resetForm.register("otp")} error={resetForm.formState.errors.otp?.message} />
            <Input
              label="Mật khẩu mới"
              type="password"
              autoComplete="new-password"
              {...resetForm.register("newPassword")}
              error={resetForm.formState.errors.newPassword?.message}
            />
            <Button type="submit" className="w-full" disabled={resetMutation.isPending}>
              Đặt lại mật khẩu
            </Button>
          </form>
        )}

        <Link to="/login" className="mt-5 block text-center text-sm font-bold text-[var(--color-green-700)] hover:text-[var(--color-green-800)]">
          Quay lại đăng nhập
        </Link>
      </Card>
    </main>
  );
}
