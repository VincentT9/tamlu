import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Grid, Stack, TextField } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authApi } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/store";
import { getErrorMessage } from "@/shared/api/client";
import { PageHeader } from "@/shared/ui/PageHeader";
import { QueryState } from "@/shared/ui/QueryState";
import { SectionPaper } from "@/shared/ui/SectionPaper";
import { useToast } from "@/shared/ui/toast";

const schema = z.object({
  fullName: z.string().min(2),
  phone: z.string().regex(/^\d{9,11}$/),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

type ProfileForm = z.infer<typeof schema>;

export function ProfilePage() {
  const setProfile = useAuthStore((state) => state.setProfile);
  const showToast = useToast((state) => state.showToast);
  const profile = useQuery({ queryKey: ["auth", "me"], queryFn: authApi.me });
  const form = useForm<ProfileForm>({ resolver: zodResolver(schema), defaultValues: { fullName: "", phone: "", avatarUrl: "" } });

  useEffect(() => {
    if (profile.data) {
      setProfile(profile.data);
      form.reset({
        fullName: profile.data.user.fullName,
        phone: profile.data.user.phone,
        avatarUrl: profile.data.user.avatarUrl ?? "",
      });
    }
  }, [form, profile.data, setProfile]);

  const mutation = useMutation({
    mutationFn: (values: ProfileForm) => authApi.updateMe({ ...values, avatarUrl: values.avatarUrl || null }),
    onSuccess: () => {
      showToast("Hồ sơ đã được cập nhật.", "success");
      profile.refetch();
    },
  });

  return (
    <>
      <PageHeader title="Hồ sơ cá nhân" description="Cập nhật thông tin liên hệ để phục vụ cứu hộ, ủng hộ và điều phối." />
      <QueryState isLoading={profile.isLoading} error={profile.error} refetch={profile.refetch}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <SectionPaper>
              {mutation.error ? <Alert severity="error">{getErrorMessage(mutation.error)}</Alert> : null}
              <Stack component="form" spacing={2} sx={{ mt: mutation.error ? 2 : 0 }} onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
                <TextField label="Họ và tên" {...form.register("fullName")} error={Boolean(form.formState.errors.fullName)} helperText={form.formState.errors.fullName?.message} />
                <TextField label="Số điện thoại" {...form.register("phone")} error={Boolean(form.formState.errors.phone)} helperText={form.formState.errors.phone?.message} />
                <TextField label="Đường dẫn ảnh đại diện" {...form.register("avatarUrl")} error={Boolean(form.formState.errors.avatarUrl)} helperText={form.formState.errors.avatarUrl?.message} />
                <Button type="submit" variant="contained" disabled={mutation.isPending}>
                  Lưu hồ sơ
                </Button>
              </Stack>
            </SectionPaper>
          </Grid>
        </Grid>
      </QueryState>
    </>
  );
}
