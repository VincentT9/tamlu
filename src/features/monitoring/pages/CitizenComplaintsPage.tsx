import { Alert, Button, Grid, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Fragment, useState } from "react";
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

function normalizeCitizenComplaintStatus(status?: string | null) {
  const normalized = String(status ?? "").trim().toUpperCase();
  return ["OPEN", "PENDING", "INVESTIGATING", "IN_REVIEW", "PROCESSING"].includes(normalized) ? "PROCESSING" : normalized;
}

function getComplaintReporter(record: Record<string, unknown>) {
  const reporter = record.createdByUser ?? record.reporter ?? record.user ?? record.createdBy;
  const person = reporter && typeof reporter === "object" ? reporter as Record<string, unknown> : undefined;
  const name = String(person?.fullName ?? person?.name ?? record.reporterName ?? record.userName ?? "Chưa có tên người phản ánh");
  const contacts = [person?.email ?? record.reporterEmail, person?.phone ?? person?.phoneNumber ?? record.reporterPhone]
    .filter((value) => value !== undefined && value !== null && value !== "")
    .map(String);

  return { name, contact: contacts.length ? contacts.join(" · ") : "Chưa có thông tin liên hệ." };
}

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
  const [expandedComplaintId, setExpandedComplaintId] = useState("");

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
                label="Mã tham chiếu (nếu có)"
                value={form.referenceId}
                onChange={(event) => setForm({ ...form, referenceId: event.target.value })}
                helperText={
                  hasInvalidReferenceId
                    ? "Mã này sẽ được ghi kèm nội dung phản ánh để quản trị viên đối chiếu."
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
            <Paper variant="outlined" sx={{ overflowX: "auto" }}>
              <Table size="small" sx={{ minWidth: 640, tableLayout: "fixed" }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Tiêu đề phản ánh</TableCell>
                    <TableCell sx={{ width: 170 }}>Trạng thái</TableCell>
                    <TableCell sx={{ width: 175 }}>Thời gian tạo</TableCell>
                    <TableCell sx={{ width: 82 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.data?.data.map((item) => {
                    const record = item as typeof item & Record<string, unknown>;
                    const expanded = expandedComplaintId === item.id;
                    const reporter = getComplaintReporter(record);
                    return (
                      <Fragment key={item.id}>
                        <TableRow hover>
                          <TableCell sx={{ verticalAlign: "top" }}>
                            <Button
                              variant="text"
                              onClick={() => setExpandedComplaintId((current) => current === item.id ? "" : item.id)}
                              sx={{ display: "block", maxWidth: "100%", minWidth: 0, p: 0, textAlign: "left", textTransform: "none", fontWeight: 900, whiteSpace: "normal", overflowWrap: "anywhere", lineHeight: 1.45 }}
                            >
                              {item.title}
                            </Button>
                          </TableCell>
                          <TableCell sx={{ width: 170, verticalAlign: "top" }}><StatusChip value={normalizeCitizenComplaintStatus(item.status)} /></TableCell>
                          <TableCell sx={{ width: 175, verticalAlign: "top", whiteSpace: "nowrap" }}>{formatDate(item.createdAt)}</TableCell>
                          <TableCell sx={{ width: 82, verticalAlign: "top" }}>
                            <Button size="small" onClick={() => setExpandedComplaintId((current) => current === item.id ? "" : item.id)}>{expanded ? "Thu gọn" : "Xem"}</Button>
                          </TableCell>
                        </TableRow>
                        {expanded ? (
                          <TableRow>
                            <TableCell colSpan={4} sx={{ bgcolor: "var(--color-surface-muted)", p: 2.25 }}>
                              <Grid container spacing={2.5}>
                                <Grid size={{ xs: 12, md: 7 }}>
                                  <Stack spacing={1.25}>
                                    <Typography variant="overline" color="text.secondary" fontWeight={900}>Nội dung phản ánh</Typography>
                                    <Typography sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", lineHeight: 1.7 }}>{item.description || "Chưa có nội dung chi tiết."}</Typography>
                                    <Typography variant="body2" color="text.secondary">Loại phản ánh: {complaintTypeLabels[item.complaintType] ?? item.complaintType}</Typography>
                                    {item.resolution ? (
                                      <Alert severity={normalizeCitizenComplaintStatus(item.status) === "REJECTED" ? "warning" : "success"}>
                                        <Typography variant="body2" fontWeight={900}>{normalizeCitizenComplaintStatus(item.status) === "REJECTED" ? "Lý do từ chối" : "Phương án xử lý"}</Typography>
                                        <Typography variant="body2">{item.resolution}</Typography>
                                      </Alert>
                                    ) : <Alert severity="info">Đội vận hành đang tiếp nhận phản ánh. Phương án xử lý sẽ được cập nhật tại đây.</Alert>}
                                  </Stack>
                                </Grid>
                                <Grid size={{ xs: 12, md: 5 }}>
                                  <Stack spacing={1.25}>
                                    <Typography variant="overline" color="text.secondary" fontWeight={900}>Thông tin người phản ánh</Typography>
                                    <Typography fontWeight={900}>{reporter.name}</Typography>
                                    <Typography variant="body2" color="text.secondary">{reporter.contact}</Typography>
                                    <Typography variant="body2" color="text.secondary">Trạng thái xử lý: <StatusChip value={normalizeCitizenComplaintStatus(item.status)} /></Typography>
                                  </Stack>
                                </Grid>
                              </Grid>
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </Paper>
          </QueryState>
        </Grid>
      </Grid>
    </>
  );
}
