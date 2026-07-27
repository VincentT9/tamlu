import { Alert, Box, Button, Grid, LinearProgress, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuthStore } from "@/features/auth/store";
import { missionApi } from "@/features/missions/api";
import { getErrorMessage } from "@/shared/api/client";
import { ROLES } from "@/shared/constants/roles";
import { TamLuMap } from "@/shared/maps/TamLuMap";
import { formatDate } from "@/shared/utils/format";
import { PageHeader } from "@/shared/ui/PageHeader";
import { QueryState } from "@/shared/ui/QueryState";
import { SectionPaper } from "@/shared/ui/SectionPaper";
import { StatusChip } from "@/shared/ui/StatusChip";
import { useToast } from "@/shared/ui/toast";

export function SheltersPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const roles = useAuthStore((state) => state.roles);
  const canManageShelters = roles.includes(ROLES.admin) || roles.includes(ROLES.coordinator);
  const shelters = useQuery({ queryKey: ["shelters"], queryFn: () => missionApi.shelters({ page: 1, limit: 50 }) });
  const [form, setForm] = useState({ shelterId: "", personName: "", numPeople: 1 });
  const [activeCheckIn, setActiveCheckIn] = useState<{ shelterId: string; personName: string } | null>(null);
  const [showShelterForm, setShowShelterForm] = useState(false);
  const [selectedShelterLogId, setSelectedShelterLogId] = useState("");
  const [shelterForm, setShelterForm] = useState({
    name: "",
    type: "COMMUNITY",
    address: "",
    latitude: 16.4637,
    longitude: 107.5909,
    capacity: 50,
    contactPerson: "",
    contactPhone: "",
  });
  const shelterCheckIns = useQuery({
    queryKey: ["shelter-check-ins", selectedShelterLogId],
    queryFn: () => missionApi.shelterCheckIns(selectedShelterLogId, { page: 1, limit: 20 }),
    enabled: canManageShelters && Boolean(selectedShelterLogId),
  });
  const checkIn = useMutation({
    mutationFn: () => missionApi.checkInShelter(form.shelterId, { personName: form.personName, numPeople: form.numPeople, householdId: null }),
    onSuccess: () => {
      showToast("Đã ghi nhận người dân vào điểm trú tạm.", "success");
      setActiveCheckIn({ shelterId: form.shelterId, personName: form.personName });
      queryClient.invalidateQueries({ queryKey: ["shelters"] });
      queryClient.invalidateQueries({ queryKey: ["shelter-check-ins"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });
  const checkOut = useMutation({
    mutationFn: () => missionApi.checkOutShelter(form.shelterId, { personName: form.personName, householdId: null }),
    onSuccess: () => {
      showToast("Đã ghi nhận rời điểm trú tạm.", "success");
      setActiveCheckIn(null);
      queryClient.invalidateQueries({ queryKey: ["shelters"] });
      queryClient.invalidateQueries({ queryKey: ["shelter-check-ins"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });
  const createShelter = useMutation({
    mutationFn: () => missionApi.createShelter({
      ...shelterForm,
      latitude: Number(shelterForm.latitude),
      longitude: Number(shelterForm.longitude),
      capacity: Number(shelterForm.capacity),
      currentOccupancy: 0,
      hasElectricity: true,
      hasCleanWater: true,
      hasMedical: false,
      status: "ACTIVE",
    }),
    onSuccess: () => {
      showToast("Điểm trú tạm đã được tạo.", "success");
      setShowShelterForm(false);
      setShelterForm({ name: "", type: "COMMUNITY", address: "", latitude: 16.4637, longitude: 107.5909, capacity: 50, contactPerson: "", contactPhone: "" });
      queryClient.invalidateQueries({ queryKey: ["shelters"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });
  const markers = shelters.data?.data.map((shelter) => ({ id: shelter.id, title: shelter.name, subtitle: `${shelter.currentOccupancy}/${shelter.capacity}`, latitude: shelter.latitude, longitude: shelter.longitude, type: "shelter" as const })) ?? [];
  const totalCapacity = shelters.data?.data.reduce((sum, shelter) => sum + shelter.capacity, 0) ?? 0;
  const totalOccupancy = shelters.data?.data.reduce((sum, shelter) => sum + shelter.currentOccupancy, 0) ?? 0;
  const occupancyPct = totalCapacity ? Math.min((totalOccupancy / totalCapacity) * 100, 100) : 0;
  return (
    <>
      <PageHeader title="Điểm trú tạm" description="Theo dõi sức chứa điểm trú tạm và ghi nhận người dân đến nơi an toàn." />
      {canManageShelters ? (
        <Stack spacing={2} sx={{ mb: 2.5 }}>
          <Button variant="contained" onClick={() => setShowShelterForm((value) => !value)} sx={{ alignSelf: { xs: "stretch", md: "flex-start" } }}>
            {showShelterForm ? "Ẩn form tạo điểm trú" : "Tạo điểm trú tạm"}
          </Button>
          {showShelterForm ? (
            <SectionPaper>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={900}>Tạo điểm trú tạm an toàn</Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Tên điểm trú" value={shelterForm.name} onChange={(event) => setShelterForm({ ...shelterForm, name: event.target.value })} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth label="Địa chỉ" value={shelterForm.address} onChange={(event) => setShelterForm({ ...shelterForm, address: event.target.value })} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField fullWidth label="Sức chứa" type="number" value={shelterForm.capacity} onChange={(event) => setShelterForm({ ...shelterForm, capacity: Number(event.target.value) })} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField fullWidth label="Vĩ độ" type="number" value={shelterForm.latitude} onChange={(event) => setShelterForm({ ...shelterForm, latitude: Number(event.target.value) })} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField fullWidth label="Kinh độ" type="number" value={shelterForm.longitude} onChange={(event) => setShelterForm({ ...shelterForm, longitude: Number(event.target.value) })} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <TextField fullWidth label="Liên hệ" value={shelterForm.contactPhone} onChange={(event) => setShelterForm({ ...shelterForm, contactPhone: event.target.value })} />
                  </Grid>
                </Grid>
                <Button variant="contained" disabled={!shelterForm.name || !shelterForm.address || createShelter.isPending} onClick={() => createShelter.mutate()} sx={{ alignSelf: { xs: "stretch", md: "flex-start" } }}>
                  Tạo điểm trú
                </Button>
              </Stack>
            </SectionPaper>
          ) : null}
        </Stack>
      ) : null}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <QueryState isLoading={shelters.isLoading} error={shelters.error} refetch={shelters.refetch}>
            <Box sx={{ position: "relative" }}>
              <TamLuMap markers={markers} height={520} />
              <Paper
                variant="outlined"
                sx={{
                  position: { xs: "static", md: "absolute" },
                  left: 16,
                  bottom: 16,
                  mt: { xs: 2, md: 0 },
                  width: { xs: "100%", md: 320 },
                  p: 2,
                  borderRadius: 0,
                  bgcolor: "var(--color-surface)",
                  backdropFilter: "blur(14px)",
                }}
              >
                <Stack spacing={1.25}>
                  <Typography fontWeight={900}>Sức chứa điểm trú tạm</Typography>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Người đã ghi nhận</Typography>
                    <Typography fontWeight={900}>{totalOccupancy}/{totalCapacity}</Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={occupancyPct} color={occupancyPct > 85 ? "warning" : "success"} />
                </Stack>
              </Paper>
            </Box>
          </QueryState>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionPaper>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={900}>Ghi nhận vào điểm trú</Typography>
              <Typography variant="body2" color="text.secondary">
                Ghi nhận người đến nơi để điều phối viên theo dõi sức chứa an toàn và hướng dẫn gia đình đến điểm còn chỗ.
              </Typography>
              <TextField select label="Điểm trú tạm" value={form.shelterId} onChange={(event) => setForm({ ...form, shelterId: event.target.value })}>
                <MenuItem value="" disabled>{shelters.isLoading ? "Đang tải điểm trú..." : "Chọn điểm trú tạm còn chỗ"}</MenuItem>
                {(shelters.data?.data ?? []).map((shelter) => (
                  <MenuItem key={shelter.id} value={shelter.id}>
                    {shelter.name} - còn {Math.max(shelter.capacity - shelter.currentOccupancy, 0)} chỗ
                  </MenuItem>
                ))}
              </TextField>
              <TextField label="Người/hộ gia đình" value={form.personName} onChange={(event) => setForm({ ...form, personName: event.target.value })} />
              <TextField label="Số người" type="number" value={form.numPeople} onChange={(event) => setForm({ ...form, numPeople: Number(event.target.value) })} />
              <Button
                variant="contained"
                color={activeCheckIn?.shelterId === form.shelterId && activeCheckIn.personName === form.personName ? "error" : "primary"}
                disabled={!form.shelterId || !form.personName || checkIn.isPending || checkOut.isPending}
                onClick={() => activeCheckIn?.shelterId === form.shelterId && activeCheckIn.personName === form.personName ? checkOut.mutate() : checkIn.mutate()}
              >
                {activeCheckIn?.shelterId === form.shelterId && activeCheckIn.personName === form.personName ? "Check-out khỏi điểm trú" : "Check-in vào điểm trú"}
              </Button>
            </Stack>
          </SectionPaper>
        </Grid>
        {canManageShelters ? (
          <Grid size={{ xs: 12 }}>
            <SectionPaper>
              <Stack spacing={1.5}>
                <Typography variant="h6" fontWeight={900}>Danh sách check-in theo điểm trú</Typography>
                <TextField select label="Chọn điểm trú để xem lượt check-in" value={selectedShelterLogId} onChange={(event) => setSelectedShelterLogId(event.target.value)} sx={{ maxWidth: 520 }}>
                  <MenuItem value="">Chưa chọn điểm trú</MenuItem>
                  {(shelters.data?.data ?? []).map((shelter) => <MenuItem key={shelter.id} value={shelter.id}>{shelter.name}</MenuItem>)}
                </TextField>
                {selectedShelterLogId ? (
                  <QueryState isLoading={shelterCheckIns.isLoading} error={shelterCheckIns.error} empty={!shelterCheckIns.data?.data.length} refetch={shelterCheckIns.refetch}>
                    <Paper variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Người/hộ gia đình</TableCell>
                            <TableCell>Số người</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell>Thời gian vào</TableCell>
                            <TableCell>Thao tác</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {shelterCheckIns.data?.data.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.personName ?? item.householdId ?? "Lượt check-in"}</TableCell>
                              <TableCell>{item.numPeople ?? "-"}</TableCell>
                              <TableCell><StatusChip value={item.status ?? "ACTIVE"} /></TableCell>
                              <TableCell>{item.checkedInAt ? formatDate(item.checkedInAt) : "-"}</TableCell>
                              <TableCell>
                                <Button
                                  size="small"
                                  color="error"
                                  disabled={checkOut.isPending || Boolean(item.checkedOutAt)}
                                  onClick={() => missionApi.checkOutShelter(selectedShelterLogId, { checkInId: item.id, personName: item.personName ?? undefined }).then(() => {
                                    showToast("Đã ghi nhận rời điểm trú tạm.", "success");
                                    queryClient.invalidateQueries({ queryKey: ["shelter-check-ins"] });
                                    queryClient.invalidateQueries({ queryKey: ["shelters"] });
                                  }).catch((error) => showToast(getErrorMessage(error), "error"))}
                                >
                                  Check-out
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Paper>
                  </QueryState>
                ) : (
                  <Alert severity="info">Chọn một điểm trú để xem các lượt check-in đang được ghi nhận.</Alert>
                )}
              </Stack>
            </SectionPaper>
          </Grid>
        ) : null}
        {shelters.data?.data.map((shelter) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={shelter.id}>
            <SectionPaper>
              <Stack spacing={1}>
                <Typography fontWeight={900}>{shelter.name}</Typography>
                <Typography color="text.secondary">{shelter.address}</Typography>
                <StatusChip value={shelter.status} />
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                    <Typography fontWeight={800}>Số người lưu trú</Typography>
                    <Typography color="text.secondary">{shelter.currentOccupancy}/{shelter.capacity}</Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={shelter.capacity ? Math.min((shelter.currentOccupancy / shelter.capacity) * 100, 100) : 0} color={shelter.capacity && shelter.currentOccupancy / shelter.capacity > 0.85 ? "warning" : "success"} />
                </Box>
              </Stack>
            </SectionPaper>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
