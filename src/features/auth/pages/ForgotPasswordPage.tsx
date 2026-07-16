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
  email: z.string().email("Enter a valid email address."),
});

const resetSchema = z.object({
  otp: z.string().min(4, "Enter the OTP from your email."),
  newPassword: z.string().min(6, "Password must be at least 6 characters."),
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
      showToast("Password reset OTP sent.", "success");
    },
  });

  const resetMutation = useMutation({
    mutationFn: (values: ResetForm) => authApi.resetPassword({ email, ...values }),
    onSuccess: () => {
      showToast("Password reset successfully. You can sign in now.", "success");
      resetForm.reset();
    },
  });

  return (
    <main className="grid min-h-[100dvh] place-items-center bg-[radial-gradient(circle_at_16%_4%,rgba(45,212,191,.18),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(245,184,91,.11),transparent_28%),linear-gradient(180deg,#031014_0%,#04181d_100%)] px-4 py-10 text-white">
      <Card className="w-full max-w-md border-cyan-200/20 bg-[#061a22]/90">
        <div className="mb-6">
          <p className="text-sm font-black uppercase tracking-wide text-[#67e8f9]">Account recovery</p>
          <h1 className="mt-2 text-3xl font-black text-white">Reset password</h1>
          <p className="mt-2 text-sm leading-6 text-white/62">Use your registered email to receive an OTP, then create a new password.</p>
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
              Send reset OTP
            </Button>
          </form>
        ) : (
          <form className="mt-4 space-y-4" onSubmit={resetForm.handleSubmit((values) => resetMutation.mutate(values))}>
            <Alert severity="info">OTP sent to {email}.</Alert>
            <Input label="OTP" {...resetForm.register("otp")} error={resetForm.formState.errors.otp?.message} />
            <Input
              label="New password"
              type="password"
              autoComplete="new-password"
              {...resetForm.register("newPassword")}
              error={resetForm.formState.errors.newPassword?.message}
            />
            <Button type="submit" className="w-full" disabled={resetMutation.isPending}>
              Reset password
            </Button>
          </form>
        )}

        <Link to="/login" className="mt-5 block text-center text-sm font-bold text-[#67e8f9] hover:text-white">
          Back to login
        </Link>
      </Card>
    </main>
  );
}
