import AddIcon from "@mui/icons-material/Add";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import { Alert, Box, Button, Grid, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { aidApi } from "@/features/aid/api";
import { donationApi } from "@/features/donations/api";
import { inventoryApi } from "@/features/inventory/api";
import { missionApi } from "@/features/missions/api";
import { sosApi } from "@/features/sos/api";
import { getErrorMessage } from "@/shared/api/client";
import { MISSION_STATUS, SHIPMENT_STATUS, STATUS_LABELS } from "@/shared/constants/statuses";
import { TamLuMap } from "@/shared/maps/TamLuMap";
import { formatDate } from "@/shared/utils/format";
import { PageHeader } from "@/shared/ui/PageHeader";
import { QueryState } from "@/shared/ui/QueryState";
import { SectionPaper } from "@/shared/ui/SectionPaper";
import { StatusChip } from "@/shared/ui/StatusChip";
import { useToast } from "@/shared/ui/toast";

export function TeamMissionsPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const missions = useQuery({ queryKey: ["team-missions"], queryFn: () => missionApi.teamList({ page: 1, limit: 50 }), refetchInterval: 30000 });
  const accept = useMutation({
    mutationFn: async (id: string) => {
      const coords = await getCurrentCoords();
      return missionApi.update(id, { status: MISSION_STATUS.enRoute, note: "Đội cứu hộ đã nhận nhiệm vụ.", ...coords });
    },
    onSuccess: () => {
      showToast("Đã nhận nhiệm vụ.", "success");
      queryClient.invalidateQueries({ queryKey: ["team-missions"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });

  return (
    <>
      <PageHeader title="Nhiệm vụ được phân công" description="Danh sách nhiệm vụ hiện trường dành cho đội cứu hộ." />
      <QueryState isLoading={missions.isLoading} error={missions.error} empty={!missions.data?.data.length} refetch={missions.refetch}>
        <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Nhiệm vụ</TableCell><TableCell>Ưu tiên</TableCell><TableCell>Trạng thái</TableCell><TableCell>Điểm trú tạm</TableCell><TableCell /></TableRow></TableHead><TableBody>
          {missions.data?.data.map((mission) => (
            <TableRow key={mission.id}><TableCell>{mission.code}</TableCell><TableCell><StatusChip value={mission.priority} /></TableCell><TableCell><StatusChip value={mission.status} /></TableCell><TableCell>{mission.destinationShelterName}</TableCell><TableCell align="right"><Stack direction="row" spacing={1} justifyContent="flex-end">{mission.status === MISSION_STATUS.assigned ? <Button size="small" variant="contained" onClick={() => accept.mutate(mission.id)} disabled={accept.isPending}>Nhận nhiệm vụ</Button> : null}<Button component={Link} to={`/team/missions/${mission.id}`}>Mở</Button></Stack></TableCell></TableRow>
          ))}
        </TableBody></Table></Paper>
      </QueryState>
    </>
  );
}

async function getCurrentCoords() {
  if (!navigator.geolocation) return { latitude: 16.4637, longitude: 107.5909 };
  return new Promise<{ latitude: number; longitude: number }>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ latitude: Number(position.coords.latitude.toFixed(6)), longitude: Number(position.coords.longitude.toFixed(6)) }),
      () => resolve({ latitude: 16.4637, longitude: 107.5909 }),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  });
}

function isVideoEvidence(fileType?: string | null, fileUrl?: string | null) {
  const type = fileType?.toLowerCase() ?? "";
  const url = fileUrl?.toLowerCase() ?? "";
  return type.includes("video") || /\.(mp4|webm|mov|m4v)(\?|#|$)/.test(url);
}

function normalizeTeamStatus(status?: string | null) {
  return (status ?? "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]+/g, "_");
}

const teamMissionStatusOptions = [
  { value: MISSION_STATUS.assigned, label: "Đang nhận nhiệm vụ" },
  { value: MISSION_STATUS.enRoute, label: "Đang đi đến điểm cứu hộ" },
  { value: MISSION_STATUS.onSite, label: "Đã đến hiện trường" },
  { value: MISSION_STATUS.inProgress, label: "Đang xử lý cứu hộ" },
  { value: MISSION_STATUS.completed, label: "Đã hoàn thành" },
  { value: MISSION_STATUS.cancelled, label: "Cứu hộ thất bại / hủy" },
];

function isFinalMissionStatus(status?: string | null) {
  return ["COMPLETED", "CLOSED", "CANCELLED", "CANCELED", "FAILED"].includes(normalizeTeamStatus(status));
}

export function TeamMissionDetailPage() {
  const { id = "" } = useParams();
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const [status, setStatus] = useState<string>(MISSION_STATUS.inProgress);
  const [note, setNote] = useState("");
  const [coords, setCoords] = useState({ latitude: 16.4637, longitude: 107.5909 });
  const mission = useQuery({ queryKey: ["team-mission", id], queryFn: () => missionApi.teamById(id), enabled: Boolean(id), refetchInterval: 30000 });
  const emergencyCaseId = mission.data?.emergencyCaseId;
  const emergencyCase = useQuery({
    queryKey: ["team-mission-sos", emergencyCaseId],
    queryFn: () => sosApi.byId(emergencyCaseId ?? ""),
    enabled: Boolean(emergencyCaseId),
    refetchInterval: 30000,
  });
  const update = useMutation({
    mutationFn: () => missionApi.update(id, { status, note, ...coords }),
    onSuccess: () => {
      showToast("Đã gửi cập nhật nhiệm vụ.", "success");
      queryClient.invalidateQueries({ queryKey: ["team-mission", id] });
      queryClient.invalidateQueries({ queryKey: ["team-missions"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });
  const complete = useMutation({
    mutationFn: async () => {
      try {
        return await missionApi.complete(id, { peopleRescued: 1, notes: note });
      } catch {
        return missionApi.update(id, {
          status: MISSION_STATUS.completed,
          note: note.trim() || "Đội cứu hộ xác nhận đã hoàn tất nhiệm vụ.",
          ...coords,
        });
      }
    },
    onSuccess: () => {
      showToast("Nhiệm vụ đã hoàn tất.", "success");
      queryClient.invalidateQueries({ queryKey: ["team-mission", id] });
      queryClient.invalidateQueries({ queryKey: ["team-missions"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });
  useEffect(() => {
    if (mission.data?.status) setStatus(mission.data.status);
  }, [mission.data?.status]);
  const locate = () => {
    if (isFinalMissionStatus(mission.data?.status)) return;
    if (!navigator.geolocation) {
      showToast("Thiết bị không hỗ trợ đọc GPS.", "warning");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ latitude: Number(position.coords.latitude.toFixed(6)), longitude: Number(position.coords.longitude.toFixed(6)) });
        showToast("Đã cập nhật tọa độ GPS hiện tại.", "success");
      },
      () => showToast("Không thể đọc vị trí GPS hiện tại.", "warning"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };
  const lastUpdate = mission.data?.updates.at(-1);
  const sos = emergencyCase.data;
  const supportSummary = sos
    ? [
        `${sos.numPeople} người cần hỗ trợ`,
        sos.hasElderly ? "có người cao tuổi" : null,
        sos.hasChildren ? "có trẻ em" : null,
        sos.hasInjured ? "có người bị thương" : null,
        sos.hasDisabled ? "có người khuyết tật" : null,
      ].filter(Boolean).join(" · ")
    : "";
  const mapMarkers = sos
    ? [{
        id: sos.id,
        title: sos.title,
        subtitle: sos.address ?? sos.contactPhone,
        latitude: sos.latitude,
        longitude: sos.longitude,
        type: "sos" as const,
      }]
    : lastUpdate
      ? [{ id: lastUpdate.id, title: mission.data?.code ?? "Nhiệm vụ", subtitle: lastUpdate.note ?? undefined, latitude: lastUpdate.latitude, longitude: lastUpdate.longitude, type: "team" as const }]
      : [];
  const mapCenter = sos && Number.isFinite(sos.latitude) && Number.isFinite(sos.longitude)
    ? [sos.latitude, sos.longitude] as [number, number]
    : lastUpdate && Number.isFinite(lastUpdate.latitude) && Number.isFinite(lastUpdate.longitude)
      ? [lastUpdate.latitude, lastUpdate.longitude] as [number, number]
      : undefined;
  const missionIsFinal = isFinalMissionStatus(mission.data?.status);
  const updateDisabled = missionIsFinal || update.isPending || complete.isPending;
  const submitMissionUpdate = () => {
    if (status === MISSION_STATUS.completed) {
      complete.mutate();
      return;
    }
    update.mutate();
  };

  return (
    <>
      <PageHeader title={mission.data?.code ?? "Chi tiết nhiệm vụ"} description="Cập nhật GPS và trạng thái nhiệm vụ khi tình hình hiện trường thay đổi." />
      <QueryState isLoading={mission.isLoading} error={mission.error} refetch={mission.refetch}>
        {mission.data ? (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <SectionPaper>
                <Stack spacing={2}>
                  <TamLuMap markers={mapMarkers} center={mapCenter} height={500} />
                  <Stack direction="row" spacing={1}>
                    <StatusChip value={mission.data.status} />
                    <StatusChip value={mission.data.priority} />
                    <Typography color="text.secondary">{mission.data.destinationShelterName}</Typography>
                  </Stack>
                  {emergencyCase.isLoading ? (
                    <Typography variant="body2" color="text.secondary">Đang tải thông tin yêu cầu SOS...</Typography>
                  ) : null}
                  {emergencyCase.error ? (
                    <Alert severity="warning">Không tải được thông tin SOS: {getErrorMessage(emergencyCase.error)}</Alert>
                  ) : null}
                  {sos ? (
                    <>
                      <Grid container spacing={1.5}>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Box sx={{ height: "100%", p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2.5, bgcolor: "rgba(255,255,255,.42)" }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={800}>Liên hệ</Typography>
                            <Typography sx={{ color: "var(--color-green-800)", fontWeight: 900, overflowWrap: "anywhere" }}>{sos.contactName}</Typography>
                            <Typography variant="body2" color="text.secondary">{sos.contactPhone}</Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }}>
                          <Box sx={{ height: "100%", p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2.5, bgcolor: "rgba(255,255,255,.42)" }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={800}>Vị trí</Typography>
                            <Typography sx={{ color: "var(--color-green-800)", fontWeight: 900, overflowWrap: "anywhere" }}>{sos.address || "Chưa có địa chỉ mô tả"}</Typography>
                            <Typography variant="body2" color="text.secondary">{sos.latitude}, {sos.longitude}</Typography>
                          </Box>
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                          <Box sx={{ height: "100%", p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2.5, bgcolor: "rgba(255,255,255,.42)" }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={800}>Thời điểm tạo</Typography>
                            <Typography sx={{ color: "var(--color-green-800)", fontWeight: 900 }}>{formatDate(sos.createdAt)}</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      {supportSummary ? (
                        <Typography color="text.secondary" sx={{ fontSize: { xs: 16, md: 18 }, lineHeight: 1.7 }}>
                          {supportSummary}
                        </Typography>
                      ) : null}
                      <Box sx={{ pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
                        <Typography variant="h6" fontWeight={900} sx={{ mb: 1.5 }}>Hình ảnh và tài liệu đính kèm</Typography>
                        {sos.media.length ? (
                          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 1.5 }}>
                            {sos.media.map((media) => (
                              <Box
                                key={media.id}
                                component="a"
                                href={media.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Mở tệp minh chứng SOS"
                                sx={{
                                  display: "block",
                                  overflow: "hidden",
                                  border: "1px solid",
                                  borderColor: "divider",
                                  borderRadius: 2.5,
                                  bgcolor: "rgba(255,255,255,.5)",
                                }}
                              >
                                {isVideoEvidence(media.fileType, media.fileUrl) ? (
                                  <Box component="video" src={media.fileUrl} controls sx={{ display: "block", width: "100%", height: 210, objectFit: "cover", objectPosition: "center" }} />
                                ) : (
                                  <Box component="img" src={media.fileUrl} alt={`Minh chứng SOS: ${sos.title}`} loading="lazy" sx={{ display: "block", width: "100%", height: 210, objectFit: "cover", objectPosition: "center" }} />
                                )}
                              </Box>
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">Chưa có tệp đính kèm cho yêu cầu SOS này.</Typography>
                        )}
                      </Box>
                    </>
                  ) : null}
                </Stack>
              </SectionPaper>
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <SectionPaper>
                <Stack spacing={2}>
                  <Typography variant="h6" fontWeight={900}>Gửi cập nhật hiện trường</Typography>
                  {missionIsFinal ? (
                    <Alert severity="success">Nhiệm vụ đã kết thúc. Các trường cập nhật đã được khóa để giữ nguyên hồ sơ hiện trường.</Alert>
                  ) : null}
                  <TextField select label="Trạng thái" value={status} onChange={(event) => setStatus(event.target.value)} disabled={missionIsFinal}>
                    {teamMissionStatusOptions.map((item) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}
                  </TextField>
                  <TextField label="Vĩ độ" type="number" value={coords.latitude} onChange={(event) => setCoords({ ...coords, latitude: Number(event.target.value) })} disabled={missionIsFinal} />
                  <TextField label="Kinh độ" type="number" value={coords.longitude} onChange={(event) => setCoords({ ...coords, longitude: Number(event.target.value) })} disabled={missionIsFinal} />
                  <TextField label="Ghi chú" multiline minRows={3} value={note} onChange={(event) => setNote(event.target.value)} disabled={missionIsFinal} />
                  <Button startIcon={<GpsFixedIcon />} onClick={locate} disabled={missionIsFinal}>Dùng GPS hiện tại</Button>
                  <Button variant="contained" onClick={submitMissionUpdate} disabled={updateDisabled}>
                    {status === MISSION_STATUS.completed ? "Hoàn tất nhiệm vụ" : "Gửi cập nhật"}
                  </Button>
                </Stack>
              </SectionPaper>
            </Grid>
          </Grid>
        ) : null}
      </QueryState>
    </>
  );
}

export function TeamShipmentsPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const shipments = useQuery({ queryKey: ["team-shipments"], queryFn: () => inventoryApi.shipments({ page: 1, limit: 50 }), refetchInterval: 30000 });
  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => inventoryApi.updateShipmentStatus(id, { status }),
    onSuccess: () => {
      showToast("Chuyến hàng đã được cập nhật.", "success");
      queryClient.invalidateQueries({ queryKey: ["team-shipments"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });
  return (
    <>
      <PageHeader title="Chuyến hàng hiện trường" description="Cập nhật chuyến hàng được phân công từ khâu chuẩn bị đến bàn giao." />
      <QueryState isLoading={shipments.isLoading} error={shipments.error} empty={!shipments.data?.data.length} refetch={shipments.refetch}>
        <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Chuyến hàng</TableCell><TableCell>Trạng thái</TableCell><TableCell>Thao tác</TableCell></TableRow></TableHead><TableBody>
          {shipments.data?.data.map((shipment) => (
            <TableRow key={shipment.id}><TableCell>{shipment.emergencyCaseTitle ?? shipment.id}</TableCell><TableCell><StatusChip value={shipment.status} /></TableCell><TableCell><Stack direction="row" spacing={1}>
              {[SHIPMENT_STATUS.shipped, SHIPMENT_STATUS.inTransit, SHIPMENT_STATUS.delivered].map((status) => <Button key={status} size="small" onClick={() => update.mutate({ id: shipment.id, status })}>{STATUS_LABELS[status]}</Button>)}
            </Stack></TableCell></TableRow>
          ))}
        </TableBody></Table></Paper>
      </QueryState>
    </>
  );
}

type AreaNeedDraft = { itemType: string; quantity: number; unit: string; notes: string };

const emptyAreaNeedDraft: AreaNeedDraft = { itemType: "", quantity: 0, unit: "", notes: "" };

function hasAnyAreaNeedDraftValue(need: AreaNeedDraft) {
  return Boolean(need.itemType.trim() || need.unit.trim() || need.notes.trim() || Number(need.quantity) > 0);
}

function isCompleteAreaNeedDraft(need: AreaNeedDraft) {
  return Boolean(need.itemType.trim() && Number(need.quantity) > 0 && need.unit.trim());
}

export function TeamAreaAssessmentsPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const [form, setForm] = useState({ campaignId: "", areaName: "", province: "", district: "", ward: "", householdsAffected: 1, floodSeverity: "HIGH", priorityLevel: "HIGH", notes: "" });
  const [needs, setNeeds] = useState<AreaNeedDraft[]>([]);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const fieldLabels: Record<keyof typeof form, string> = {
    campaignId: "Mã chiến dịch",
    areaName: "Tên khu vực",
    province: "Tỉnh/Thành phố",
    district: "Quận/Huyện",
    ward: "Phường/Xã",
    householdsAffected: "Số hộ bị ảnh hưởng",
    floodSeverity: "Mức độ ngập lụt",
    priorityLevel: "Mức ưu tiên",
    notes: "Ghi chú",
  };
  const campaigns = useQuery({ queryKey: ["public-campaigns", "area-assessment-team"], queryFn: () => donationApi.publicCampaigns({ page: 1, limit: 50 }) });
  const rows = useQuery({ queryKey: ["area-assessments-team"], queryFn: () => aidApi.areaAssessments({ page: 1, limit: 50 }) });
  const create = useMutation({
    mutationFn: async () => {
      const assessment = await aidApi.createAreaAssessment(form);
      await Promise.all(needs
        .filter(isCompleteAreaNeedDraft)
        .map((need) => aidApi.addAreaNeed(assessment.id, {
          itemType: need.itemType.trim(),
          quantity: Number(need.quantity),
          unit: need.unit.trim(),
          notes: need.notes.trim(),
        })));
      return assessment;
    },
    onSuccess: () => {
      showToast("Đánh giá khu vực và nhu cầu cứu trợ đã được gửi.", "success");
      setForm({ campaignId: "", areaName: "", province: "", district: "", ward: "", householdsAffected: 1, floodSeverity: "HIGH", priorityLevel: "HIGH", notes: "" });
      setNeeds([]);
      setShowAssessmentForm(false);
      queryClient.invalidateQueries({ queryKey: ["area-assessments-team"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });
  const hasValidNeeds = needs.every((need) => !hasAnyAreaNeedDraftValue(need) || isCompleteAreaNeedDraft(need));
  return (
    <>
      <PageHeader title="Đánh giá khu vực" description="Ghi nhận nhu cầu hiện trường để lập kế hoạch phân bổ cứu trợ." />
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setShowAssessmentForm((value) => !value)}
        sx={{ mb: 2, alignSelf: { xs: "stretch", md: "flex-start" } }}
      >
        {showAssessmentForm ? "Ẩn form đánh giá" : "Tạo đánh giá khu vực"}
      </Button>
      <Grid container spacing={2.5}>
        {showAssessmentForm ? (
        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionPaper>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={900}>Đánh giá mới</Typography>
              <TextField select label="Chiến dịch" value={form.campaignId} onChange={(event) => setForm({ ...form, campaignId: event.target.value })}>
                <MenuItem value="" disabled>{campaigns.isLoading ? "Đang tải chiến dịch..." : "Chọn chiến dịch cứu trợ"}</MenuItem>
                {(campaigns.data?.data ?? []).map((campaign) => <MenuItem key={campaign.id} value={campaign.id}>{campaign.name}</MenuItem>)}
              </TextField>
              {Object.keys(form).filter((key) => key !== "campaignId").map((key) => (
                <TextField key={key} label={fieldLabels[key as keyof typeof form]} value={String(form[key as keyof typeof form])} onChange={(event) => setForm({ ...form, [key]: key === "householdsAffected" ? Number(event.target.value) : event.target.value })} />
              ))}
              <Typography variant="subtitle2" fontWeight={900}>Nhu cầu khẩn cấp</Typography>
              {!needs.length ? (
                <Alert severity="info">Không bắt buộc nhập nhu cầu khẩn cấp. Quý vị có thể gửi khảo sát trước và bổ sung nhu cầu sau nếu cần.</Alert>
              ) : null}
              {needs.map((need, index) => (
                <Stack key={index} spacing={1}>
                  <TextField label="Loại vật tư/nhu cầu" value={need.itemType} onChange={(event) => {
                    const next = [...needs];
                    next[index] = { ...need, itemType: event.target.value };
                    setNeeds(next);
                  }} />
                  <Grid container spacing={1}>
                    <Grid size={6}>
                      <TextField fullWidth label="Số lượng" type="number" value={need.quantity} onChange={(event) => {
                        const next = [...needs];
                        next[index] = { ...need, quantity: Number(event.target.value) };
                        setNeeds(next);
                      }} />
                    </Grid>
                    <Grid size={6}>
                      <TextField fullWidth label="Đơn vị" value={need.unit} onChange={(event) => {
                        const next = [...needs];
                        next[index] = { ...need, unit: event.target.value };
                        setNeeds(next);
                      }} />
                    </Grid>
                  </Grid>
                  <TextField label="Ghi chú nhu cầu" value={need.notes} onChange={(event) => {
                    const next = [...needs];
                    next[index] = { ...need, notes: event.target.value };
                    setNeeds(next);
                  }} />
                  <Button size="small" color="error" onClick={() => setNeeds(needs.filter((_, needIndex) => needIndex !== index))}>Xóa nhu cầu</Button>
                </Stack>
              ))}
              <Button variant="outlined" startIcon={<DoneAllIcon />} onClick={() => setNeeds([...needs, { ...emptyAreaNeedDraft }])}>Thêm nhu cầu</Button>
              <Button variant="contained" onClick={() => create.mutate()} disabled={!form.campaignId || !hasValidNeeds || create.isPending}>Gửi khảo sát</Button>
            </Stack>
          </SectionPaper>
        </Grid>
        ) : null}
        <Grid size={{ xs: 12, lg: showAssessmentForm ? 8 : 12 }}>
          <QueryState isLoading={rows.isLoading} error={rows.error} empty={!rows.data?.data.length} refetch={rows.refetch}>
            <Stack spacing={1.5}>
              {rows.data?.data.map((row) => (
                <Paper key={row.id} variant="outlined" sx={{ p: 2, borderRadius: 0 }}>
                  <Stack spacing={1.5}>
                    <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
                      <Box>
                        <Typography fontWeight={950} sx={{ color: "var(--color-green-800)" }}>
                          {row.areaName || "Chưa đặt tên khu vực"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "var(--color-text-muted)", lineHeight: 1.55 }}>
                          {[row.ward, row.district, row.province].filter(Boolean).join(", ") || "Chưa nhập địa bàn"}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <StatusChip value={row.status} />
                        <StatusChip value={row.priorityLevel} />
                        <StatusChip value={row.floodSeverity} />
                      </Stack>
                    </Stack>

                    <Grid container spacing={1.25}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Box sx={{ border: "1px solid var(--color-border)", bgcolor: "var(--color-bg-page)", p: 1.25 }}>
                          <Typography variant="caption" fontWeight={900} sx={{ color: "var(--color-text-muted)" }}>Hộ bị ảnh hưởng</Typography>
                          <Typography fontWeight={950}>{row.householdsAffected}</Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Box sx={{ border: "1px solid var(--color-border)", bgcolor: "var(--color-bg-page)", p: 1.25 }}>
                          <Typography variant="caption" fontWeight={900} sx={{ color: "var(--color-text-muted)" }}>Ngày gửi</Typography>
                          <Typography fontWeight={950}>{formatDate(row.createdAt)}</Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <Box sx={{ border: "1px solid var(--color-border)", bgcolor: "var(--color-bg-page)", p: 1.25 }}>
                          <Typography variant="caption" fontWeight={900} sx={{ color: "var(--color-text-muted)" }}>Mã khảo sát</Typography>
                          <Typography fontWeight={950}>{row.id.slice(0, 8).toUpperCase()}</Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Box sx={{ borderTop: "1px solid var(--color-border)", pt: 1.25 }}>
                      <Typography variant="caption" fontWeight={900} sx={{ color: "var(--color-text-muted)" }}>Nhu cầu khẩn cấp</Typography>
                      <Stack spacing={0.75} sx={{ mt: 0.75 }}>
                        {row.needs.length ? row.needs.map((need) => (
                          <Box key={need.id} sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, alignItems: "baseline" }}>
                            <Typography fontWeight={900}>{need.itemType}</Typography>
                            <Typography variant="body2" sx={{ color: "var(--color-text-muted)" }}>
                              {need.quantity} {need.unit}
                            </Typography>
                            {need.notes ? (
                              <Typography variant="body2" sx={{ color: "var(--color-text-muted)" }}>
                                {need.notes}
                              </Typography>
                            ) : null}
                          </Box>
                        )) : (
                          <Typography variant="body2" sx={{ color: "var(--color-text-muted)" }}>
                            Chưa nhập nhu cầu chi tiết.
                          </Typography>
                        )}
                      </Stack>
                    </Box>

                    {row.notes ? (
                      <Box sx={{ borderTop: "1px solid var(--color-border)", pt: 1.25 }}>
                        <Typography variant="caption" fontWeight={900} sx={{ color: "var(--color-text-muted)" }}>Ghi chú hiện trường</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                          {row.notes}
                        </Typography>
                      </Box>
                    ) : null}
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

export function TeamProofsPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const [showProofForm, setShowProofForm] = useState(false);
  const [form, setForm] = useState({
    missionId: "",
    fileUrls: "",
    fileType: "IMAGE",
    caption: "Minh chứng trao hỗ trợ tại hiện trường",
    latitude: 16.4637,
    longitude: 107.5909,
    signerName: "",
    signerRole: "Người nhận hỗ trợ",
    signatureUrl: "",
  });
  const missions = useQuery({ queryKey: ["team-missions", "proofs"], queryFn: () => missionApi.teamList({ page: 1, limit: 50 }), refetchInterval: 30000 });
  const createProof = useMutation({
    mutationFn: async () => {
      const noteParts = [form.caption];
      if (form.fileUrls.trim()) noteParts.push(`Media: ${form.fileUrls.trim()}`);
      if (form.signerName.trim()) noteParts.push(`Người ký nhận: ${form.signerName.trim()} (${form.signerRole})`);
      if (form.signatureUrl.trim()) noteParts.push(`Chữ ký/biên nhận: ${form.signatureUrl.trim()}`);
      return missionApi.update(form.missionId, {
        status: MISSION_STATUS.completed,
        note: noteParts.join("\n"),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
      });
    },
    onSuccess: () => {
      showToast("Minh chứng hiện trường đã được nộp vào nhật ký nhiệm vụ.", "success");
      setForm({
        missionId: "",
        fileUrls: "",
        fileType: "IMAGE",
        caption: "Minh chứng trao hỗ trợ tại hiện trường",
        latitude: 16.4637,
        longitude: 107.5909,
        signerName: "",
        signerRole: "Người nhận hỗ trợ",
        signatureUrl: "",
      });
      setShowProofForm(false);
      queryClient.invalidateQueries({ queryKey: ["team-missions"] });
      queryClient.invalidateQueries({ queryKey: ["team-missions", "proofs"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });
  const locate = () => {
    if (!navigator.geolocation) {
      showToast("Thiết bị không hỗ trợ đọc GPS.", "warning");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => setForm({
        ...form,
        latitude: Number(position.coords.latitude.toFixed(6)),
        longitude: Number(position.coords.longitude.toFixed(6)),
      }),
      () => showToast("Không thể đọc vị trí GPS hiện tại.", "warning"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <>
      <PageHeader title="Minh chứng hiện trường" description="Nộp ảnh, tọa độ GPS và thông tin ký nhận sau khi đội cứu hộ trao vật tư hoặc hỗ trợ người dân." />
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setShowProofForm((value) => !value)}
        sx={{ mb: 2, alignSelf: { xs: "stretch", md: "flex-start" } }}
      >
        {showProofForm ? "Ẩn form minh chứng" : "Nộp minh chứng"}
      </Button>
      <Grid container spacing={2.5}>
        {showProofForm ? (
        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionPaper>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={900}>Nộp minh chứng thực địa</Typography>
              <Alert severity="info">
                Minh chứng được ghi vào nhật ký nhiệm vụ của đội cứu hộ, không phụ thuộc vào danh sách giải ngân nên tránh lỗi không có quyền truy cập.
              </Alert>
              <TextField select label="Nhiệm vụ đã được phân công" value={form.missionId} onChange={(event) => setForm({ ...form, missionId: event.target.value })}>
                <MenuItem value="" disabled>{missions.isLoading ? "Đang tải nhiệm vụ..." : "Chọn nhiệm vụ"}</MenuItem>
                {(missions.data?.data ?? []).map((mission) => (
                  <MenuItem key={mission.id} value={mission.id}>{mission.code} - {STATUS_LABELS[mission.status] ?? mission.status}</MenuItem>
                ))}
              </TextField>
              <TextField label="Link ảnh/video minh chứng" multiline minRows={3} value={form.fileUrls} onChange={(event) => setForm({ ...form, fileUrls: event.target.value })} helperText="Có thể nhập nhiều link, mỗi link một dòng hoặc phân tách bằng dấu phẩy." />
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField select fullWidth label="Loại media" value={form.fileType} onChange={(event) => setForm({ ...form, fileType: event.target.value })}>
                    <MenuItem value="IMAGE">Hình ảnh</MenuItem>
                    <MenuItem value="VIDEO">Video</MenuItem>
                    <MenuItem value="DOCUMENT">Tài liệu</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Chú thích" value={form.caption} onChange={(event) => setForm({ ...form, caption: event.target.value })} />
                </Grid>
              </Grid>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Vĩ độ" type="number" value={form.latitude} onChange={(event) => setForm({ ...form, latitude: Number(event.target.value) })} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Kinh độ" type="number" value={form.longitude} onChange={(event) => setForm({ ...form, longitude: Number(event.target.value) })} />
                </Grid>
              </Grid>
              <Button startIcon={<GpsFixedIcon />} onClick={locate}>Dùng GPS hiện tại</Button>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Tên người ký nhận" value={form.signerName} onChange={(event) => setForm({ ...form, signerName: event.target.value })} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Vai trò người ký" value={form.signerRole} onChange={(event) => setForm({ ...form, signerRole: event.target.value })} />
                </Grid>
              </Grid>
              <TextField label="Link chữ ký/biên nhận" value={form.signatureUrl} onChange={(event) => setForm({ ...form, signatureUrl: event.target.value })} placeholder="https://..." />
              <Button variant="contained" startIcon={<DoneAllIcon />} disabled={!form.missionId || (!form.fileUrls && !form.signatureUrl && !form.caption) || createProof.isPending} onClick={() => createProof.mutate()}>
                Nộp minh chứng
              </Button>
            </Stack>
          </SectionPaper>
        </Grid>
        ) : null}
        <Grid size={{ xs: 12, lg: showProofForm ? 7 : 12 }}>
          <QueryState isLoading={missions.isLoading} error={missions.error} empty={!missions.data?.data.length} refetch={missions.refetch}>
            <Paper variant="outlined">
              <Table size="small">
                <TableHead><TableRow><TableCell>Nhiệm vụ</TableCell><TableCell>Ưu tiên</TableCell><TableCell>Trạng thái</TableCell><TableCell>Cập nhật gần nhất</TableCell></TableRow></TableHead>
                <TableBody>
                  {missions.data?.data.map((mission) => (
                    <TableRow key={mission.id}>
                      <TableCell>{mission.code}</TableCell>
                      <TableCell><StatusChip value={mission.priority} /></TableCell>
                      <TableCell><StatusChip value={mission.status} /></TableCell>
                      <TableCell>{mission.updates.at(-1)?.createdAt ? formatDate(mission.updates.at(-1)?.createdAt) : "Chưa có cập nhật"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </QueryState>
        </Grid>
      </Grid>
    </>
  );
}
export function TeamProfilePage() {
  const team = useQuery({ queryKey: ["my-team"], queryFn: missionApi.myTeam });
  return (
    <>
      <PageHeader title="Đội cứu hộ của tôi" description="Hồ sơ đội hiện tại được đồng bộ từ hệ thống." />
      <QueryState isLoading={team.isLoading} error={team.error} refetch={team.refetch}>
        <SectionPaper>
          <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{JSON.stringify(team.data, null, 2)}</pre>
        </SectionPaper>
      </QueryState>
    </>
  );
}

