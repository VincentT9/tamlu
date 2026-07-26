import DoneAllIcon from "@mui/icons-material/DoneAll";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import { Alert, Button, Grid, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { aidApi } from "@/features/aid/api";
import { inventoryApi } from "@/features/inventory/api";
import { missionApi } from "@/features/missions/api";
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

export function TeamMissionDetailPage() {
  const { id = "" } = useParams();
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const [status, setStatus] = useState<string>(MISSION_STATUS.inProgress);
  const [note, setNote] = useState("");
  const [coords, setCoords] = useState({ latitude: 16.4637, longitude: 107.5909 });
  const mission = useQuery({ queryKey: ["team-mission", id], queryFn: () => missionApi.teamById(id), enabled: Boolean(id), refetchInterval: 30000 });
  const update = useMutation({
    mutationFn: () => missionApi.update(id, { status, note, ...coords }),
    onSuccess: () => {
      showToast("Đã gửi cập nhật nhiệm vụ.", "success");
      queryClient.invalidateQueries({ queryKey: ["team-mission", id] });
      queryClient.invalidateQueries({ queryKey: ["team-missions"] });
    },
  });
  const complete = useMutation({
    mutationFn: () => missionApi.complete(id, { peopleRescued: 1, notes: note }),
    onSuccess: () => {
      showToast("Nhiệm vụ đã hoàn tất.", "success");
      queryClient.invalidateQueries({ queryKey: ["team-mission", id] });
    },
  });
  const locate = () => {
    navigator.geolocation?.getCurrentPosition((position) => setCoords({ latitude: Number(position.coords.latitude.toFixed(6)), longitude: Number(position.coords.longitude.toFixed(6)) }));
  };
  const lastUpdate = mission.data?.updates.at(-1);

  return (
    <>
      <PageHeader title={mission.data?.code ?? "Chi tiết nhiệm vụ"} description="Cập nhật GPS và trạng thái nhiệm vụ khi tình hình hiện trường thay đổi." />
      <QueryState isLoading={mission.isLoading} error={mission.error} refetch={mission.refetch}>
        {mission.data ? (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <SectionPaper>
                <Stack spacing={2}>
                  <TamLuMap
                    markers={lastUpdate ? [{ id: lastUpdate.id, title: mission.data.code, subtitle: lastUpdate.note ?? undefined, latitude: lastUpdate.latitude, longitude: lastUpdate.longitude, type: "team" }] : []}
                  />
                  <Stack direction="row" spacing={1}>
                    <StatusChip value={mission.data.status} />
                    <StatusChip value={mission.data.priority} />
                    <Typography color="text.secondary">{mission.data.destinationShelterName}</Typography>
                  </Stack>
                </Stack>
              </SectionPaper>
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <SectionPaper>
                <Stack spacing={2}>
                  <Typography variant="h6" fontWeight={900}>Gửi cập nhật hiện trường</Typography>
                  <TextField select label="Trạng thái" value={status} onChange={(event) => setStatus(event.target.value)}>
                    {Object.values(MISSION_STATUS).map((item) => <MenuItem key={item} value={item}>{STATUS_LABELS[item]}</MenuItem>)}
                  </TextField>
                  <TextField label="Vĩ độ" type="number" value={coords.latitude} onChange={(event) => setCoords({ ...coords, latitude: Number(event.target.value) })} />
                  <TextField label="Kinh độ" type="number" value={coords.longitude} onChange={(event) => setCoords({ ...coords, longitude: Number(event.target.value) })} />
                  <TextField label="Ghi chú" multiline minRows={3} value={note} onChange={(event) => setNote(event.target.value)} />
                  <Button startIcon={<GpsFixedIcon />} onClick={locate}>Dùng GPS hiện tại</Button>
                  <Button variant="contained" onClick={() => update.mutate()} disabled={update.isPending}>Gửi cập nhật</Button>
                  <Button color="success" startIcon={<DoneAllIcon />} onClick={() => complete.mutate()} disabled={complete.isPending}>Hoàn tất nhiệm vụ</Button>
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

export function TeamAreaAssessmentsPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const [form, setForm] = useState({ campaignId: "", areaName: "", province: "", district: "", ward: "", householdsAffected: 1, floodSeverity: "HIGH", priorityLevel: "HIGH", notes: "" });
  const [needs, setNeeds] = useState([{ itemType: "Gạo", quantity: 100, unit: "kg", notes: "" }]);
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
  const rows = useQuery({ queryKey: ["area-assessments-team"], queryFn: () => aidApi.areaAssessments({ page: 1, limit: 50 }) });
  const create = useMutation({
    mutationFn: async () => {
      const assessment = await aidApi.createAreaAssessment(form);
      await Promise.all(needs
        .filter((need) => need.itemType && Number(need.quantity) > 0 && need.unit)
        .map((need) => aidApi.addAreaNeed(assessment.id, {
          itemType: need.itemType,
          quantity: Number(need.quantity),
          unit: need.unit,
          notes: need.notes,
        })));
      return assessment;
    },
    onSuccess: () => {
      showToast("Đánh giá khu vực và nhu cầu cứu trợ đã được gửi.", "success");
      setForm({ campaignId: "", areaName: "", province: "", district: "", ward: "", householdsAffected: 1, floodSeverity: "HIGH", priorityLevel: "HIGH", notes: "" });
      setNeeds([{ itemType: "Gạo", quantity: 100, unit: "kg", notes: "" }]);
      queryClient.invalidateQueries({ queryKey: ["area-assessments-team"] });
    },
  });
  const hasValidNeeds = needs.every((need) => need.itemType && Number(need.quantity) > 0 && need.unit);
  return (
    <>
      <PageHeader title="Đánh giá khu vực" description="Ghi nhận nhu cầu hiện trường để lập kế hoạch phân bổ cứu trợ." />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionPaper>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={900}>Đánh giá mới</Typography>
              {Object.keys(form).map((key) => (
                <TextField key={key} label={fieldLabels[key as keyof typeof form]} value={String(form[key as keyof typeof form])} onChange={(event) => setForm({ ...form, [key]: key === "householdsAffected" ? Number(event.target.value) : event.target.value })} />
              ))}
              <Typography variant="subtitle2" fontWeight={900}>Nhu cầu khẩn cấp</Typography>
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
                  <Button size="small" color="error" disabled={needs.length === 1} onClick={() => setNeeds(needs.filter((_, needIndex) => needIndex !== index))}>Xóa nhu cầu</Button>
                </Stack>
              ))}
              <Button variant="outlined" startIcon={<DoneAllIcon />} onClick={() => setNeeds([...needs, { itemType: "", quantity: 1, unit: "kg", notes: "" }])}>Thêm nhu cầu</Button>
              <Button variant="contained" onClick={() => create.mutate()} disabled={!form.campaignId || !hasValidNeeds || create.isPending}>Gửi khảo sát</Button>
            </Stack>
          </SectionPaper>
        </Grid>
        <Grid size={{ xs: 12, lg: 8 }}>
          <QueryState isLoading={rows.isLoading} error={rows.error} empty={!rows.data?.data.length} refetch={rows.refetch}>
            <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Khu vực</TableCell><TableCell>Hộ ảnh hưởng</TableCell><TableCell>Ưu tiên</TableCell><TableCell>Trạng thái</TableCell></TableRow></TableHead><TableBody>
              {rows.data?.data.map((row) => <TableRow key={row.id}><TableCell>{row.areaName}</TableCell><TableCell>{row.householdsAffected}</TableCell><TableCell><StatusChip value={row.priorityLevel} /></TableCell><TableCell><StatusChip value={row.status} /></TableCell></TableRow>)}
            </TableBody></Table></Paper>
          </QueryState>
        </Grid>
      </Grid>
    </>
  );
}

export function TeamProofsPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const [form, setForm] = useState({
    disbursementId: "",
    fileUrls: "",
    fileType: "IMAGE",
    caption: "Minh chứng trao hỗ trợ tại hiện trường",
    latitude: 16.4637,
    longitude: 107.5909,
    accuracy: 15,
    signerName: "",
    signerRole: "Người nhận hỗ trợ",
    signatureUrl: "",
  });
  const disbursements = useQuery({
    queryKey: ["team-disbursements-for-proofs"],
    queryFn: () => aidApi.disbursements({ page: 1, limit: 50 }),
  });
  const createProof = useMutation({
    mutationFn: async () => {
      const proofPackage = await aidApi.createProof(form.disbursementId) as { id?: string };
      const proofPackageId = proofPackage.id ?? form.disbursementId;
      const mediaUrls = form.fileUrls
        .split(/[\n,]/)
        .map((url) => url.trim())
        .filter(Boolean);

      if (mediaUrls.length) {
        await aidApi.addProofMedia(proofPackageId, mediaUrls, form.fileType, form.caption);
      }
      await aidApi.addProofGeotag(proofPackageId, {
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        accuracy: Number(form.accuracy),
      });
      if (form.signerName && form.signatureUrl) {
        await aidApi.addProofSignature(proofPackageId, {
          signerName: form.signerName,
          signerRole: form.signerRole,
          signatureUrl: form.signatureUrl,
        });
      }
      return proofPackage;
    },
    onSuccess: () => {
      showToast("Minh chứng hiện trường đã được nộp.", "success");
      setForm({
        disbursementId: "",
        fileUrls: "",
        fileType: "IMAGE",
        caption: "Minh chứng trao hỗ trợ tại hiện trường",
        latitude: 16.4637,
        longitude: 107.5909,
        accuracy: 15,
        signerName: "",
        signerRole: "Người nhận hỗ trợ",
        signatureUrl: "",
      });
      queryClient.invalidateQueries({ queryKey: ["team-disbursements-for-proofs"] });
    },
  });
  const locate = () => {
    navigator.geolocation?.getCurrentPosition((position) => setForm({
      ...form,
      latitude: Number(position.coords.latitude.toFixed(6)),
      longitude: Number(position.coords.longitude.toFixed(6)),
      accuracy: Math.round(position.coords.accuracy),
    }));
  };

  return (
    <>
      <PageHeader title="Bộ minh chứng" description="Nộp ảnh, tọa độ GPS và chữ ký xác nhận sau khi trao tiền hoặc vật tư cho người dân." />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <SectionPaper>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={900}>Nộp minh chứng thực địa</Typography>
              <Alert severity="info">
                Chọn khoản giải ngân đã thực hiện, sau đó gửi ảnh/đường dẫn media, vị trí GPS và chữ ký người nhận để phục vụ giám sát công khai.
              </Alert>
              <TextField
                select
                label="Khoản giải ngân"
                value={form.disbursementId}
                onChange={(event) => setForm({ ...form, disbursementId: event.target.value })}
              >
                <MenuItem value="" disabled>{disbursements.isLoading ? "Đang tải khoản giải ngân..." : "Chọn khoản giải ngân"}</MenuItem>
                {(disbursements.data?.data ?? []).map((row) => (
                  <MenuItem key={row.id} value={row.id}>
                    {row.itemName} - {row.amount.toLocaleString("vi-VN")} đ
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Link ảnh/video minh chứng"
                multiline
                minRows={3}
                value={form.fileUrls}
                onChange={(event) => setForm({ ...form, fileUrls: event.target.value })}
                helperText="Có thể nhập nhiều link, mỗi link một dòng hoặc phân tách bằng dấu phẩy."
              />
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField select fullWidth label="Loại media" value={form.fileType} onChange={(event) => setForm({ ...form, fileType: event.target.value })}>
                    <MenuItem value="IMAGE">Hình ảnh</MenuItem>
                    <MenuItem value="VIDEO">Video</MenuItem>
                    <MenuItem value="DOCUMENT">Tài liệu</MenuItem>
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Độ chính xác GPS (m)" type="number" value={form.accuracy} onChange={(event) => setForm({ ...form, accuracy: Number(event.target.value) })} />
                </Grid>
              </Grid>
              <TextField label="Chú thích minh chứng" value={form.caption} onChange={(event) => setForm({ ...form, caption: event.target.value })} />
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
              <Button
                variant="contained"
                startIcon={<DoneAllIcon />}
                disabled={!form.disbursementId || (!form.fileUrls && !form.signatureUrl) || createProof.isPending}
                onClick={() => createProof.mutate()}
              >
                Nộp minh chứng
              </Button>
            </Stack>
          </SectionPaper>
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          <QueryState isLoading={disbursements.isLoading} error={disbursements.error} empty={!disbursements.data?.data.length} refetch={disbursements.refetch}>
            <Paper variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Khoản hỗ trợ</TableCell>
                    <TableCell>Số tiền</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Ngày thực hiện</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {disbursements.data?.data.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.itemName}</TableCell>
                      <TableCell>{row.amount.toLocaleString("vi-VN")} đ</TableCell>
                      <TableCell><StatusChip value={row.status} /></TableCell>
                      <TableCell>{row.executedAt ? formatDate(row.executedAt) : "Chưa thực hiện"}</TableCell>
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
