import { Alert, Button, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { monitoringApi } from "@/features/monitoring/api";
import { getErrorMessage } from "@/shared/api/client";
import { formatDate } from "@/shared/utils/format";
import { PageHeader } from "@/shared/ui/PageHeader";
import { QueryState } from "@/shared/ui/QueryState";
import { SectionPaper } from "@/shared/ui/SectionPaper";
import { StatusChip } from "@/shared/ui/StatusChip";
import { useToast } from "@/shared/ui/toast";

const complaintTypeLabels: Record<string, string> = {
  FRAUD: "Gian lận",
  MISSING_AID: "Thiếu hàng cứu trợ",
  DELAY: "Chậm trễ",
  QUALITY: "Chất lượng hỗ trợ",
  OTHER: "Khác",
};

export function CitizenComplaintsPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const [form, setForm] = useState({ title: "", description: "", complaintType: "QUALITY", referenceType: "EMERGENCY_CASE", referenceId: "" });
  const rows = useQuery({ queryKey: ["my-complaints"], queryFn: () => monitoringApi.myComplaints({ page: 1, limit: 20 }) });
  const create = useMutation({
    mutationFn: () => monitoringApi.createComplaint({ ...form, referenceId: form.referenceId || null }),
    onSuccess: () => {
      showToast("Phản ánh đã được gửi.", "success");
      queryClient.invalidateQueries({ queryKey: ["my-complaints"] });
    },
  });
  return (
    <>
      <PageHeader title="Khiếu nại và phản ánh" description="Gửi phản ánh về gian lận, thiếu hỗ trợ, chậm trễ hoặc vấn đề chất lượng." />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 5 }}>
          <SectionPaper>
            {create.error ? <Alert severity="error">{getErrorMessage(create.error)}</Alert> : null}
            <Stack spacing={2} sx={{ mt: create.error ? 2 : 0 }}>
              <Typography variant="h6" fontWeight={900}>Gửi phản ánh</Typography>
              <Alert severity="info">Phản ánh giúp điều phối viên bảo vệ tính minh bạch của cứu trợ và xử lý vấn đề cộng đồng.</Alert>
              <TextField label="Tiêu đề" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <TextField label="Mô tả" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline minRows={4} />
              <TextField select label="Loại phản ánh" value={form.complaintType} onChange={(e) => setForm({ ...form, complaintType: e.target.value })}>
                {["FRAUD", "MISSING_AID", "DELAY", "QUALITY", "OTHER"].map((item) => <MenuItem key={item} value={item}>{complaintTypeLabels[item]}</MenuItem>)}
              </TextField>
              <TextField label="Mã tham chiếu" value={form.referenceId} onChange={(e) => setForm({ ...form, referenceId: e.target.value })} />
              <Button variant="contained" onClick={() => create.mutate()} disabled={create.isPending}>Gửi phản ánh</Button>
            </Stack>
          </SectionPaper>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <QueryState isLoading={rows.isLoading} error={rows.error} empty={!rows.data?.data.length} refetch={rows.refetch}>
            <Stack spacing={1.5}>
              {rows.data?.data.map((item) => (
                <Paper key={item.id} variant="outlined" sx={{ p: 2.25, borderRadius: 0 }}>
                  <Stack spacing={0.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight={900}>{item.title}</Typography>
                      <StatusChip value={item.status} />
                    </Stack>
                    <Typography color="text.secondary">{item.description}</Typography>
                    <Typography variant="caption">{formatDate(item.createdAt)}</Typography>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </QueryState>
        </Grid>
      </Grid>
    </>
  );
}
