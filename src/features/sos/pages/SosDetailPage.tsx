import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, Grid, ImageList, ImageListItem, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { missionApi } from "@/features/missions/api";
import { sosApi } from "@/features/sos/api";
import { volunteerApi } from "@/features/volunteers/api";
import { useAuthStore } from "@/features/auth/store";
import { getErrorMessage } from "@/shared/api/client";
import { ROLES } from "@/shared/constants/roles";
import { SOS_STATUS } from "@/shared/constants/statuses";
import { TamLuMap } from "@/shared/maps/TamLuMap";
import { formatDate } from "@/shared/utils/format";
import { PageHeader } from "@/shared/ui/PageHeader";
import { QueryState } from "@/shared/ui/QueryState";
import { SectionPaper } from "@/shared/ui/SectionPaper";
import { StatusChip } from "@/shared/ui/StatusChip";
import { useToast } from "@/shared/ui/toast";

export function SosDetailPage() {
  const { id = "" } = useParams();
  const [note, setNote] = useState("");
  const [assignment, setAssignment] = useState({ rescueTeamId: "", destinationShelterId: "", volunteerProfileIds: [] as string[] });
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const hasAnyRole = useAuthStore((state) => state.hasAnyRole);
  const canCoordinate = hasAnyRole([ROLES.admin, ROLES.coordinator]);
  const detail = useQuery({ queryKey: ["sos", id], queryFn: () => sosApi.byId(id), enabled: Boolean(id), refetchInterval: 30000 });
  const teams = useQuery({ queryKey: ["rescue-teams", "sos-detail"], queryFn: () => missionApi.rescueTeams({ page: 1, limit: 50 }), enabled: canCoordinate });
  const shelters = useQuery({ queryKey: ["shelters", "sos-detail"], queryFn: () => missionApi.shelters({ page: 1, limit: 50 }), enabled: canCoordinate });
  const missions = useQuery({ queryKey: ["ops-missions", "sos-detail"], queryFn: () => missionApi.coordinatorList({ page: 1, limit: 50 }), enabled: canCoordinate });
  const volunteers = useQuery({ queryKey: ["coordinator-volunteers", "sos-detail"], queryFn: () => volunteerApi.coordinatorList({ page: 1, limit: 50 }), enabled: canCoordinate });
  const activeMissionTeamIds = new Set((missions.data?.data ?? [])
    .filter((mission) => !["COMPLETED", "CANCELLED", "CANCELED", "FAILED"].includes(normalizeStatusValue(mission.status)))
    .map((mission) => mission.rescueTeamId)
    .filter(Boolean));
  const availableTeams = (teams.data?.data ?? []).filter((team) => {
    return isAvailableRescueTeamStatus(team.status) && !activeMissionTeamIds.has(team.id);
  });
  const availableShelters = (shelters.data?.data ?? []).filter((shelter) => {
    const remainingCapacity = shelter.capacity - shelter.currentOccupancy;
    return isActiveShelterStatus(shelter.status) && remainingCapacity >= (detail.data?.numPeople ?? 1);
  });
  const verifiedVolunteers = (volunteers.data?.data ?? []).filter((volunteer) => volunteer.idVerified || volunteer.status?.toUpperCase() === "VERIFIED");
  const confirm = useMutation({
    mutationFn: () => sosApi.confirm(id, note),
    onSuccess: () => {
      showToast("Đã xác nhận hoàn tất cứu hộ. Cảm ơn bạn.", "success");
      detail.refetch();
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });
  const verify = useMutation({
    mutationFn: (result: "APPROVED" | "REJECTED") => sosApi.verify(id, { result }),
    onSuccess: () => {
      showToast("Trạng thái xác minh SOS đã được cập nhật.", "success");
      queryClient.invalidateQueries({ queryKey: ["sos", id] });
      queryClient.invalidateQueries({ queryKey: ["ops-sos"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });
  const assign = useMutation({
    mutationFn: async () => {
      if (!detail.data) throw new Error("Không tìm thấy yêu cầu SOS.");
      return missionApi.create({
        emergencyCaseId: detail.data.id,
        title: detail.data.title,
        priority: detail.data.priorityLevel,
        rescueTeamId: assignment.rescueTeamId,
        vehicleIds: [],
        destinationShelterId: assignment.destinationShelterId,
        volunteerProfileIds: assignment.volunteerProfileIds,
      });
    },
    onSuccess: () => {
      showToast("Đã phân công cứu hộ. Trạng thái SOS đã được backend cập nhật theo nhiệm vụ mới.", "success");
      setAssignment({ rescueTeamId: "", destinationShelterId: "", volunteerProfileIds: [] });
      queryClient.invalidateQueries({ queryKey: ["sos", id] });
      queryClient.invalidateQueries({ queryKey: ["ops-sos"] });
      queryClient.invalidateQueries({ queryKey: ["ops-missions"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });
  const item = detail.data;
  const canAssign = canCoordinate && isVerifiedSosStatus(item?.status);

  return (
    <>
      <PageHeader title={item?.title ?? "Chi tiết SOS"} description={item?.description} />
      <QueryState isLoading={detail.isLoading} error={detail.error} refetch={detail.refetch}>
        {item ? (
          <Stack spacing={2.5}>
            <Grid container spacing={2.5} alignItems="stretch">
              <Grid size={{ xs: 12, lg: 8.6 }}>
                <SectionPaper sx={{ p: 0, overflow: "hidden", height: "100%" }}>
                  <TamLuMap
                    markers={[{ id: item.id, title: item.title, subtitle: item.address ?? item.contactPhone, latitude: item.latitude, longitude: item.longitude, type: "sos" }]}
                    height={500}
                  />
                  <Box sx={{ borderTop: "1px solid var(--color-border)", px: { xs: 2, md: 2.5 }, py: 1.5 }}>
                    <Grid container spacing={1.5} alignItems="center">
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={800}>Liên hệ</Typography>
                        <Typography sx={{ color: "var(--color-green-800)", fontWeight: 900 }}>{item.contactName}</Typography>
                        <Typography variant="body2" color="text.secondary">{item.contactPhone}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 5 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={800}>Vị trí</Typography>
                        <Typography sx={{ color: "var(--color-green-800)", fontWeight: 900 }}>{item.address ?? "Vị trí GPS"}</Typography>
                        <Typography variant="body2" color="text.secondary">{item.latitude}, {item.longitude}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={800}>Thời điểm tạo</Typography>
                        <Typography sx={{ color: "var(--color-green-800)", fontWeight: 900 }}>{formatDate(item.createdAt)}</Typography>
                      </Grid>
                    </Grid>
                  </Box>
                </SectionPaper>
              </Grid>
              <Grid size={{ xs: 12, lg: 3.4 }}>
                <Stack spacing={2.5} sx={{ height: "100%" }}>
                  <SectionPaper sx={{ flex: 1, minHeight: { lg: 285 }, overflow: "hidden" }}>
                    <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>Dòng thời gian trạng thái</Typography>
                    <Stack
                      spacing={1.5}
                      sx={{
                        maxHeight: { xs: "none", lg: 240 },
                        overflowY: { xs: "visible", lg: "auto" },
                        pr: { lg: 0.75 },
                      }}
                    >
                      {item.statusLogs.map((log, index) => (
                        <Stack key={log.id} direction="row" spacing={1.5}>
                          <Stack alignItems="center">
                            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "primary.main", mt: 0.75 }} />
                            {index < item.statusLogs.length - 1 ? <Box sx={{ width: 2, flex: 1, bgcolor: "divider", mt: 0.5 }} /> : null}
                          </Stack>
                          <Box sx={{ pb: 1.5, minWidth: 0 }}>
                            <StatusChip value={log.status} />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, overflowWrap: "anywhere" }}>{log.note}</Typography>
                            <Typography variant="caption">{formatDate(log.createdAt)}</Typography>
                          </Box>
                        </Stack>
                      ))}
                    </Stack>
                  </SectionPaper>
                  <SectionPaper sx={{ flex: 1, minHeight: { lg: 240 } }}>
                    <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>Hình ảnh và tài liệu</Typography>
                    {item.media.length ? (
                      <ImageList cols={1} gap={10} sx={{ m: 0 }}>
                        {item.media.map((media) => (
                          <ImageListItem key={media.id}>
                            <img src={media.fileUrl} alt={media.fileType} loading="lazy" style={{ borderRadius: 12, width: "100%", height: 180, objectFit: "cover", objectPosition: "center", display: "block" }} />
                          </ImageListItem>
                        ))}
                      </ImageList>
                    ) : (
                      <Typography variant="body2" color="text.secondary">Chưa có tệp đính kèm.</Typography>
                    )}
                  </SectionPaper>
                </Stack>
              </Grid>
            </Grid>

            {canCoordinate ? (
              <SectionPaper>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, lg: 3 }}>
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="h6" fontWeight={900}>Điều phối cứu hộ</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Xác minh và phân công lực lượng phản ứng.
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <StatusChip value={item.status} />
                        <StatusChip value={item.priorityLevel} />
                        <Typography color="text.secondary">
                          {item.numPeople} người cần hỗ trợ
                          {item.hasElderly ? " · có người cao tuổi" : ""}
                          {item.hasChildren ? " · có trẻ em" : ""}
                          {item.hasInjured ? " · có người bị thương" : ""}
                          {item.hasDisabled ? " · có người khuyết tật" : ""}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                  {isPendingSosStatus(item.status) ? (
                    <Grid size={{ xs: 12, lg: 2.5 }}>
                      <Stack direction={{ xs: "column", sm: "row", lg: "column" }} spacing={1}>
                        <Button size="small" startIcon={<CheckIcon />} onClick={() => verify.mutate("APPROVED")} disabled={verify.isPending}>
                          Xác minh
                        </Button>
                        <Button size="small" color="error" startIcon={<CloseIcon />} onClick={() => verify.mutate("REJECTED")} disabled={verify.isPending}>
                          Từ chối
                        </Button>
                      </Stack>
                    </Grid>
                  ) : null}
                   <Grid size={{ xs: 12, md: 6, lg: isPendingSosStatus(item.status) ? 2.5 : 3 }}>
                    <TextField
                      fullWidth
                      select
                      label="Đội cứu hộ"
                      value={assignment.rescueTeamId}
                      onChange={(event) => setAssignment({ ...assignment, rescueTeamId: event.target.value })}
                      disabled={!canAssign}
                      helperText={canAssign ? "Chỉ hiển thị đội đang khả dụng và chưa có nhiệm vụ đang mở." : "Chỉ phân công sau khi SOS đã xác minh."}
                    >
                      <MenuItem value="" disabled>
                        {teams.isLoading || missions.isLoading ? "Đang tải đội cứu hộ..." : availableTeams.length ? "Chọn đội cứu hộ khả dụng" : "Không có đội cứu hộ khả dụng"}
                      </MenuItem>
                      {availableTeams.map((team) => (
                        <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6, lg: isPendingSosStatus(item.status) ? 2.5 : 3 }}>
                    <TextField
                      fullWidth
                      select
                      label="Điểm trú tạm tiếp nhận"
                      value={assignment.destinationShelterId}
                      onChange={(event) => setAssignment({ ...assignment, destinationShelterId: event.target.value })}
                      disabled={!canAssign}
                      helperText={canAssign ? "Chỉ hiển thị điểm đang hoạt động và còn đủ chỗ." : "Chỉ chọn điểm trú sau khi SOS đã xác minh."}
                    >
                      <MenuItem value="" disabled>
                        {shelters.isLoading ? "Đang tải điểm trú tạm..." : availableShelters.length ? "Chọn điểm trú tạm còn chỗ" : "Không có điểm trú tạm còn đủ chỗ"}
                      </MenuItem>
                      {availableShelters.map((shelter) => (
                        <MenuItem key={shelter.id} value={shelter.id}>
                          {shelter.name} - còn {Math.max(shelter.capacity - shelter.currentOccupancy, 0)} chỗ
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                   <Grid size={{ xs: 12, md: 6, lg: isPendingSosStatus(item.status) ? 2.5 : 3 }}>
                    <TextField
                      fullWidth
                      select
                      label="Tình nguyện viên hỗ trợ"
                      value={assignment.volunteerProfileIds}
                      onChange={(event) => {
                        const value = event.target.value;
                        setAssignment({ ...assignment, volunteerProfileIds: typeof value === "string" ? value.split(",") : value });
                      }}
                      SelectProps={{ multiple: true }}
                      disabled={!canAssign}
                      helperText="Chỉ hiển thị hồ sơ đã xác minh."
                    >
                      {verifiedVolunteers.length ? verifiedVolunteers.map((volunteer) => (
                        <MenuItem key={volunteer.id} value={volunteer.id}>
                          {getVolunteerDisplayName(volunteer)}
                        </MenuItem>
                      )) : (
                        <MenuItem disabled>Chưa có tình nguyện viên đã xác minh</MenuItem>
                      )}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, lg: item.status === SOS_STATUS.pending ? 1.5 : 3 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AddIcon />}
                      disabled={!canAssign || !assignment.rescueTeamId || !assignment.destinationShelterId || assign.isPending}
                      onClick={() => assign.mutate()}
                      sx={{ minHeight: 48 }}
                    >
                      Phân công
                    </Button>
                  </Grid>
                  {item.status === SOS_STATUS.completed ? (
                    <Grid size={{ xs: 12 }}>
                      <Stack spacing={1}>
                        <TextField label="Ghi chú xác nhận" value={note} onChange={(event) => setNote(event.target.value)} multiline minRows={2} />
                        <Button startIcon={<CheckCircleIcon />} variant="contained" color="success" onClick={() => confirm.mutate()} disabled={confirm.isPending}>
                          Xác nhận đã hoàn tất cứu hộ
                        </Button>
                      </Stack>
                    </Grid>
                  ) : null}
                </Grid>
              </SectionPaper>
            ) : null}
          </Stack>
        ) : null}
      </QueryState>
    </>
  );
}

function normalizeStatusValue(value: string) {
  return value
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]+/g, "_");
}

function isAvailableRescueTeamStatus(status?: string | null) {
  if (!status) return false;
  return ["AVAILABLE", "READY", "ACTIVE", "IDLE", "SAN_SANG"].includes(normalizeStatusValue(status));
}

function isActiveShelterStatus(status?: string | null) {
  return ["ACTIVE", "OPEN", "AVAILABLE", "READY", "DANG_HOAT_DONG"].includes(normalizeStatusValue(status ?? ""));
}

function isPendingSosStatus(status?: string | null) {
  return normalizeStatusValue(status ?? "") === "PENDING";
}

function isVerifiedSosStatus(status?: string | null) {
  return ["VERIFIED", "APPROVED", "CONFIRMED"].includes(normalizeStatusValue(status ?? ""));
}

function getVolunteerDisplayName(volunteer: { id: string; skills?: string | null; availableAreas?: string | null; userName?: string | null; fullName?: string | null; name?: string | null; phone?: string | null }) {
  const name = volunteer.fullName ?? volunteer.userName ?? volunteer.name ?? volunteer.phone ?? `Tình nguyện viên ${volunteer.id.slice(0, 8)}`;
  const area = volunteer.availableAreas ? ` - ${volunteer.availableAreas}` : "";
  return `${name}${area}`;
}
