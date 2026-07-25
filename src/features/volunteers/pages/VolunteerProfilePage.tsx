import { Alert, Box, Button, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
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
  const [form, setForm] = useState({ skills: "", experience: "", availableAreas: "", status: "AVAILABLE" });
  useEffect(() => {
    if (profile.data) setForm({ skills: profile.data.skills, experience: profile.data.experience ?? "", availableAreas: profile.data.availableAreas ?? "", status: profile.data.status });
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
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 0, height: "100%" }}>
              <Stack spacing={2}>
                <Box component="img" src="/images/tam-lu-logo-transparent.png" alt="Logo Tâm Lũ" sx={{ width: 96, height: 96, objectFit: "contain" }} />
                <Box>
                  <Typography variant="h5" fontWeight={900}>Mức sẵn sàng tình nguyện</Typography>
                  <Typography color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>
                    Hãy giữ thông tin kỹ năng và khu vực hỗ trợ luôn chính xác để được phân công nhiệm vụ an toàn, phù hợp.
                  </Typography>
                </Box>
                {profile.data ? <StatusChip value={profile.data.status} /> : <Alert severity="info">Bạn chưa có hồ sơ tình nguyện. Vui lòng tạo hồ sơ bên dưới.</Alert>}
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, lg: 8 }}>
            <SectionPaper>
              {save.error ? <Alert severity="error">{getErrorMessage(save.error)}</Alert> : null}
              <Stack spacing={2} sx={{ mt: save.error ? 2 : 0 }}>
                <Typography variant="h6" fontWeight={900}>Kỹ năng và khả năng tham gia</Typography>
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
