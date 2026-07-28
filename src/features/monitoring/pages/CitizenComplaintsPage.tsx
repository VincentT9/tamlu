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

const complaintTargets = [
  { value: "APP", label: "Về ứng dụng", complaintType: "OTHER", referenceType: "APPLICATION" },
  { value: "RESCUE_TEAM", label: "Về đội cứu trợ", complaintType: "QUALITY", referenceType: "RESCUE_TEAM" },
  { value: "COORDINATION", label: "Về điều phối cứu trợ", complaintType: "DELAY", referenceType: "OPERATION" },
  { value: "CAMPAIGN", label: "Về chiến dịch cứu trợ", complaintType: "MISSING_AID", referenceType: "CAMPAIGN" },
  { value: "EMERGENCY_CASE", label: "Về yêu cầu SOS", complaintType: "DELAY", referenceType: "EMERGENCY_CASE" },
  { value: "DONATION", label: "Về quyên góp", complaintType: "OTHER", referenceType: "DONATION" },
  { value: "OTHER", label: "Nội dung khác", complaintType: "OTHER", referenceType: "GENERAL" },
];

const complaintTypeLabels: Record<string, string> = {
  FRAUD: "Gian lận",
  MISSING_AID: "Thiếu hàng cứu trợ",
  DELAY: "Chậm trễ",
  QUALITY: "Chất lượng hỗ trợ",
  OTHER: "Khác",
  ...Object.fromEntries(complaintTargets.map((item) => [item.value, item.label])),
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function CitizenComplaintsPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const [form, setForm] = useState({
    title: "",
    description: "",
    complaintType: "APP",
    referenceId: "",
  });

  const rows = useQuery({
    queryKey: ["my-complaints"],
    queryFn: () => monitoringApi.myComplaints({ page: 1, limit: 20 }),
  });

  const selectedTarget = complaintTargets.find((item) => item.value === form.complaintType) ?? complaintTargets[0];
  const trimmedReferenceId = form.referenceId.trim();
  const hasValidReferenceId = uuidPattern.test(trimmedReferenceId);
  const hasInvalidReferenceId = Boolean(trimmedReferenceId && !hasValidReferenceId);
  const normalizedDescription = [
    `[Đối tượng phản ánh: ${selectedTarget.label}]`,
    form.description.trim(),
    hasInvalidReferenceId ? `Mã tham chiếu người dùng nhập: ${trimmedReferenceId}` : "",
  ].filter(Boolean).join("\n");

  const create = useMutation({
    mutationFn: () =>
      monitoringApi.createComplaint({
        title: form.title.trim(),
        description: normalizedDescription,
        complaintType: selectedTarget.complaintType,
        referenceType: hasValidReferenceId ? selectedTarget.referenceType : undefined,
        referenceId: hasValidReferenceId ? trimmedReferenceId : null,
      }),
    onSuccess: () => {
      showToast("Phản ánh đã được gửi đến quản trị viên.", "success");
      setForm({ title: "", description: "", complaintType: "APP", referenceId: "" });
      queryClient.invalidateQueries({ queryKey: ["my-complaints"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });

  return (
    <>
      <PageHeader
        title="Phản ánh và góp ý"
        description="Gửi phản ánh về ứng dụng, đội cứu trợ, chiến dịch, quyên góp hoặc các vấn đề phát sinh để quản trị viên tiếp nhận và xử lý."
      />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 5 }}>
          <SectionPaper>
            {create.error ? <Alert severity="error">{getErrorMessage(create.error)}</Alert> : null}
            <Stack spacing={2} sx={{ mt: create.error ? 2 : 0 }}>
              <Typography variant="h6" fontWeight={900}>Gửi phản ánh</Typography>
              <Alert severity="info">
                Phản ánh được gửi tới quản trị viên. Nếu phản ánh liên quan đến một SOS, chiến dịch hoặc đội cứu trợ cụ thể, quý vị có thể nhập mã tham chiếu.
              </Alert>
              <TextField
                select
                label="Đối tượng phản ánh"
                value={form.complaintType}
                onChange={(event) => setForm({ ...form, complaintType: event.target.value })}
              >
                {complaintTargets.map((item) => (
                  <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Tiêu đề"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
              <TextField
                label="Nội dung phản ánh"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                multiline
                minRows={4}
              />
              <TextField
                label="Mã tham chiếu UUID nếu có"
                value={form.referenceId}
                onChange={(event) => setForm({ ...form, referenceId: event.target.value })}
                helperText={
                  hasInvalidReferenceId
                    ? "Mã này không phải UUID nên sẽ được lưu trong nội dung phản ánh, không gửi vào trường tham chiếu hệ thống."
                    : "Có thể để trống nếu phản ánh chung về ứng dụng hoặc trải nghiệm sử dụng."
                }
              />
              <Button
                variant="contained"
                onClick={() => create.mutate()}
                disabled={!form.title.trim() || !form.description.trim() || create.isPending}
              >
                Gửi phản ánh
              </Button>
            </Stack>
          </SectionPaper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <QueryState
            isLoading={rows.isLoading}
            error={rows.error}
            empty={!rows.data?.data.length}
            emptyTitle="Chưa có phản ánh nào"
            emptyText="Các phản ánh đã gửi sẽ hiển thị tại đây để quý vị theo dõi trạng thái xử lý."
            refetch={rows.refetch}
          >
            <Stack spacing={1.5}>
              {rows.data?.data.map((item) => (
                <Paper key={item.id} variant="outlined" sx={{ p: 2.25, borderRadius: 0 }}>
                  <Stack spacing={0.75}>
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                      <Typography fontWeight={900}>{item.title}</Typography>
                      <StatusChip value={item.status} />
                    </Stack>
                    <Typography variant="body2" fontWeight={800} color="text.secondary">
                      {complaintTypeLabels[item.complaintType] ?? item.complaintType}
                    </Typography>
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
