import { Alert, Box, Button, Grid, Stack, TextField, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { volunteerApi } from "@/features/volunteers/api";
import { getErrorMessage } from "@/shared/api/client";
import { PageHeader } from "@/shared/ui/PageHeader";
import { QueryState } from "@/shared/ui/QueryState";
import { SectionPaper } from "@/shared/ui/SectionPaper";
import { StatusChip } from "@/shared/ui/StatusChip";
import { useToast } from "@/shared/ui/toast";

export function VolunteerProfilePage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const profile = useQuery({ queryKey: ["my-volunteer-profile"], queryFn: volunteerApi.my, retry: false });
  const [form, setForm] = useState({ skills: "", experience: "", availableAreas: "" });
  useEffect(() => {
    if (profile.data) setForm({ skills: profile.data.skills, experience: profile.data.experience ?? "", availableAreas: profile.data.availableAreas ?? "" });
  }, [profile.data]);
  const save = useMutation({
    mutationFn: () => (profile.data ? volunteerApi.updateMy(form) : volunteerApi.create(form)),
    onSuccess: () => {
      showToast("Hồ sơ tình nguyện viên đã được lưu.", "success");
      queryClient.invalidateQueries({ queryKey: ["my-volunteer-profile"] });
    },
  });
  return (
    <>
      <PageHeader title="Hồ sơ tình nguyện viên" description="Cập nhật kỹ năng và khu vực có thể hỗ trợ để điều phối viên phân công nhiệm vụ phù hợp." />
      <QueryState isLoading={profile.isLoading} error={undefined}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <SectionPaper
              sx={{
                height: "100%",
                borderTop: "3px solid var(--color-green-600)",
                bgcolor: "var(--color-green-50)",
              }}
            >
              <Stack spacing={2}>
                <Box>
                  <Typography variant="overline" sx={{ color: "var(--color-green-700)", fontWeight: 800 }}>Khả năng tham gia</Typography>
                  <Typography variant="h5" fontWeight={800}>Mức sẵn sàng tình nguyện</Typography>
                  <Typography color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>
                    Hãy giữ thông tin kỹ năng và khu vực hỗ trợ luôn chính xác để được phân công nhiệm vụ an toàn, phù hợp.
                  </Typography>
                </Box>
                {profile.data ? (
                  <Stack spacing={0.75} alignItems="flex-start">
                    <StatusChip value={profile.data.idVerified ? profile.data.status : "PENDING"} />
                    {!profile.data.idVerified ? (
                      <Typography variant="body2" color="text.secondary">Hồ sơ đang chờ quản trị viên xác minh trước khi được điều phối.</Typography>
                    ) : null}
                  </Stack>
                ) : <Alert severity="info">Bạn chưa có hồ sơ tình nguyện. Vui lòng tạo hồ sơ bên dưới.</Alert>}
              </Stack>
            </SectionPaper>
          </Grid>
          <Grid size={{ xs: 12, lg: 8 }}>
            <SectionPaper>
              {save.error ? <Alert severity="error">{getErrorMessage(save.error)}</Alert> : null}
              <Stack spacing={2} sx={{ mt: save.error ? 2 : 0 }}>
                <Typography variant="h6" fontWeight={800}>Kỹ năng và khả năng tham gia</Typography>
                <TextField label="Kỹ năng" value={form.skills} onChange={(event) => setForm({ ...form, skills: event.target.value })} />
                <TextField label="Kinh nghiệm" value={form.experience} onChange={(event) => setForm({ ...form, experience: event.target.value })} multiline minRows={3} />
                <TextField label="Khu vực có thể hỗ trợ" value={form.availableAreas} onChange={(event) => setForm({ ...form, availableAreas: event.target.value })} />
                <Box>
                  <Button variant="contained" onClick={() => save.mutate()} disabled={save.isPending}>Lưu hồ sơ</Button>
                </Box>
              </Stack>
            </SectionPaper>
          </Grid>
        </Grid>
      </QueryState>
    </>
  );
}
