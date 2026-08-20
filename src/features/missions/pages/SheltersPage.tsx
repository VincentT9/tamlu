import {
  Alert,
  Box,
  Button,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/features/auth/store";
import { missionApi } from "@/features/missions/api";
import type { ShelterCheckIn } from "@/features/missions/api";
import { getErrorMessage } from "@/shared/api/client";
import { ROLES } from "@/shared/constants/roles";
import { TamLuMap } from "@/shared/maps/TamLuMap";
import { formatDate } from "@/shared/utils/format";
import { PageHeader } from "@/shared/ui/PageHeader";
import { QueryState } from "@/shared/ui/QueryState";
import { DataTableFrame } from "@/shared/ui/DataTableFrame";
import { SectionPaper } from "@/shared/ui/SectionPaper";
import { StatusChip } from "@/shared/ui/StatusChip";
import { useToast } from "@/shared/ui/toast";

function isCheckedOut(item: ShelterCheckIn) {
  const action = String(item.action ?? item.status ?? "").toUpperCase();
  return Boolean(item.checkedOutAt) || action.includes("CHECK_OUT") || action.includes("CHECKOUT") || action === "OUT";
}

function isCheckedIn(item: ShelterCheckIn) {
  const action = String(item.action ?? item.status ?? "").toUpperCase();
  return Boolean(item.checkedInAt) || action.includes("CHECK_IN") || action.includes("CHECKIN") || action === "IN";
}

function checkInKey(item: ShelterCheckIn) {
  return item.householdId ?? item.personName?.trim().toLowerCase() ?? item.id;
}

function checkInTime(item: ShelterCheckIn) {
  return item.checkedInAt ?? item.createdAt ?? item.checkedOutAt ?? "";
}

function activeCheckInRecords(logs: ShelterCheckIn[]) {
  const latestByPerson = new Map<string, ShelterCheckIn>();
  [...logs]
    .sort((left, right) => new Date(checkInTime(right)).getTime() - new Date(checkInTime(left)).getTime())
    .forEach((item) => {
      const key = checkInKey(item);
      if (!latestByPerson.has(key)) {
        latestByPerson.set(key, item);
      }
    });

  return [...latestByPerson.values()].filter((item) => isCheckedIn(item) && !isCheckedOut(item));
}

export function SheltersPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const user = useAuthStore((state) => state.user);
  const roles = useAuthStore((state) => state.roles);
  const canManageShelters = roles.includes(ROLES.admin) || roles.includes(ROLES.coordinator);

  const shelters = useQuery({
    queryKey: ["shelters"],
    queryFn: () => missionApi.shelters({ page: 1, limit: 50 }),
  });

  const [form, setForm] = useState({ shelterId: "", personName: "", numPeople: 1 });
  const [activeCheckIn, setActiveCheckIn] = useState<{
    shelterId: string;
    shelterName?: string;
    personName: string;
    numPeople: number;
    checkInId?: string | null;
  } | null>(null);
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

  const checkInStorageKey = user?.id ? `tamlu:shelter-check-in:${user.id}` : "";

  useEffect(() => {
    if (!checkInStorageKey) {
      setActiveCheckIn(null);
      return;
    }

    try {
      const saved = localStorage.getItem(checkInStorageKey);
      setActiveCheckIn(saved ? JSON.parse(saved) : null);
    } catch {
      setActiveCheckIn(null);
    }
  }, [checkInStorageKey]);

  const selectedCheckInShelterId = selectedShelterLogId || form.shelterId;
  const shelterCheckIns = useQuery({
    queryKey: ["shelter-check-ins", selectedCheckInShelterId],
    queryFn: () => missionApi.shelterCheckIns(selectedCheckInShelterId, { page: 1, limit: 50 }),
    enabled: canManageShelters && Boolean(selectedCheckInShelterId),
    retry: false,
  });

  const checkIn = useMutation({
    mutationFn: () =>
      missionApi.checkInShelter(form.shelterId, {
        personName: form.personName,
        numPeople: form.numPeople,
        householdId: null,
      }),
    onSuccess: (data) => {
      showToast("Đã ghi nhận người dân vào điểm trú tạm.", "success");
      const nextCheckIn = {
        shelterId: form.shelterId,
        shelterName: shelterOptions.find((shelter) => shelter.id === form.shelterId)?.name,
        personName: form.personName,
        numPeople: Math.max(Number(form.numPeople), 1),
        checkInId: data?.id,
      };
      setActiveCheckIn(nextCheckIn);
      if (checkInStorageKey) {
        localStorage.setItem(checkInStorageKey, JSON.stringify(nextCheckIn));
      }
      queryClient.invalidateQueries({ queryKey: ["shelters"] });
      queryClient.invalidateQueries({ queryKey: ["shelter-check-ins"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });

  const checkOut = useMutation({
    mutationFn: (payload: { shelterId: string; personName?: string | null; numPeople?: number | null }) => {
      const body: { personName?: string; numPeople: number } = {
        numPeople: Math.max(Number(payload.numPeople ?? 1), 1),
      };
      const personName = payload.personName?.trim();
      if (personName) {
        body.personName = personName;
      }
      return missionApi.checkOutShelter(payload.shelterId, body);
    },
    onSuccess: () => {
      showToast("Đã ghi nhận rời điểm trú tạm.", "success");
      setActiveCheckIn(null);
      if (checkInStorageKey) {
        localStorage.removeItem(checkInStorageKey);
      }
      setForm({ shelterId: "", personName: "", numPeople: 1 });
      queryClient.invalidateQueries({ queryKey: ["shelters"] });
      queryClient.invalidateQueries({ queryKey: ["shelter-check-ins"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });

  const createShelter = useMutation({
    mutationFn: () =>
      missionApi.createShelter({
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
      setShelterForm({
        name: "",
        type: "COMMUNITY",
        address: "",
        latitude: 16.4637,
        longitude: 107.5909,
        capacity: 50,
        contactPerson: "",
        contactPhone: "",
      });
      queryClient.invalidateQueries({ queryKey: ["shelters"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });

  const shelterOptions = [...(shelters.data?.data ?? [])].sort((left, right) => {
    const leftAvailable = Math.max(left.capacity - left.currentOccupancy, 0);
    const rightAvailable = Math.max(right.capacity - right.currentOccupancy, 0);
    if (leftAvailable !== rightAvailable) {
      return rightAvailable - leftAvailable;
    }
    return left.name.localeCompare(right.name);
  });
  const markers = shelterOptions.map((shelter) => ({
    id: shelter.id,
    title: shelter.name,
    subtitle: `${shelter.currentOccupancy}/${shelter.capacity}`,
    latitude: shelter.latitude,
    longitude: shelter.longitude,
    type: "shelter" as const,
  }));
  const totalCapacity = shelters.data?.data.reduce((sum, shelter) => sum + shelter.capacity, 0) ?? 0;
  const totalOccupancy = shelters.data?.data.reduce((sum, shelter) => sum + shelter.currentOccupancy, 0) ?? 0;
  const occupancyPct = totalCapacity ? Math.min((totalOccupancy / totalCapacity) * 100, 100) : 0;
  const checkedInRecords = canManageShelters ? activeCheckInRecords(shelterCheckIns.data?.data ?? []) : [];
  const selectedShelter = shelterOptions.find((shelter) => shelter.id === selectedCheckInShelterId);
  const normalizedPersonName = form.personName.trim().toLowerCase();
  const currentCheckInRecord = checkedInRecords.find((item) => {
    if (activeCheckIn?.checkInId && item.id === activeCheckIn.checkInId) return true;
    return Boolean(normalizedPersonName && item.personName?.trim().toLowerCase() === normalizedPersonName);
  });
  const canCheckOutFromForm = Boolean(activeCheckIn || (form.shelterId && form.personName && currentCheckInRecord));

  function handleCheckInAction() {
    if (activeCheckIn) {
      checkOut.mutate({
        shelterId: activeCheckIn.shelterId,
        personName: activeCheckIn.personName,
        numPeople: activeCheckIn.numPeople,
      });
      return;
    }
    if (!form.shelterId || !form.personName.trim()) return;
    checkIn.mutate();
  }

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
                <Typography variant="h6" fontWeight={800}>Tạo điểm trú tạm an toàn</Typography>
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
                  borderRadius: 2,
                  bgcolor: "var(--color-surface)",
                  boxShadow: "var(--shadow-surface)",
                }}
              >
                <Stack spacing={1.25}>
                  <Typography fontWeight={800}>Sức chứa điểm trú tạm</Typography>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Người đã ghi nhận</Typography>
                    <Typography fontWeight={800}>{totalOccupancy}/{totalCapacity}</Typography>
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
              <Typography variant="h6" fontWeight={800}>Ghi nhận vào điểm trú</Typography>
              <Typography variant="body2" color="text.secondary">
                Chọn điểm trú tạm, nhập tên người hoặc hộ gia đình, sau đó check-in hoặc check-out khi rời điểm trú.
              </Typography>
              {activeCheckIn ? (
                <Stack spacing={1.5}>
                  <Alert severity="info">Tài khoản đang lưu trú tại {activeCheckIn.shelterName ?? "điểm trú tạm đã chọn"}. Hãy check-out trước khi chỉnh sửa hoặc check-in điểm mới.</Alert>
                  <Typography fontWeight={800}>{activeCheckIn.personName} · {activeCheckIn.numPeople} người</Typography>
                </Stack>
              ) : <>
              <TextField select label="Điểm trú tạm" value={form.shelterId} onChange={(event) => setForm({ ...form, shelterId: event.target.value })}>
                <MenuItem value="" disabled>{shelters.isLoading ? "Đang tải điểm trú..." : "Chọn điểm trú tạm còn chỗ"}</MenuItem>
                {shelterOptions.map((shelter) => (
                  <MenuItem key={shelter.id} value={shelter.id}>
                    {shelter.name} - còn {Math.max(shelter.capacity - shelter.currentOccupancy, 0)} chỗ
                  </MenuItem>
                ))}
              </TextField>
              <TextField label="Người/hộ gia đình" value={form.personName} onChange={(event) => setForm({ ...form, personName: event.target.value })} />
              <TextField label="Số người" type="number" value={form.numPeople} onChange={(event) => setForm({ ...form, numPeople: Number(event.target.value) })} />
              </>}
              <Button
                variant="contained"
                color={canCheckOutFromForm ? "error" : "primary"}
                disabled={(!activeCheckIn && (!form.shelterId || !form.personName.trim())) || checkIn.isPending || checkOut.isPending}
                onClick={handleCheckInAction}
              >
                {canCheckOutFromForm ? "Check-out khỏi điểm trú" : "Check-in vào điểm trú"}
              </Button>
            </Stack>
          </SectionPaper>
        </Grid>

        {canManageShelters ? (
        <Grid size={{ xs: 12 }}>
          <SectionPaper>
            <Stack spacing={1.5}>
              <Typography variant="h6" fontWeight={800}>
                Danh sách đã check-in{selectedShelter ? ` tại ${selectedShelter.name}` : ""}
              </Typography>
              {canManageShelters ? (
                <TextField
                  select
                  label="Chọn điểm trú để xem lượt check-in"
                  value={selectedShelterLogId}
                  onChange={(event) => setSelectedShelterLogId(event.target.value)}
                  sx={{ maxWidth: 520 }}
                >
                  <MenuItem value="">Dùng điểm trú đang chọn ở form</MenuItem>
                  {shelterOptions.map((shelter) => <MenuItem key={shelter.id} value={shelter.id}>{shelter.name}</MenuItem>)}
                </TextField>
              ) : null}
              {!selectedCheckInShelterId ? (
                <Alert severity="info">Chọn một điểm trú tạm trong form để xem danh sách người đang check-in tại địa điểm đó.</Alert>
              ) : (
                <QueryState
                  isLoading={shelterCheckIns.isLoading}
                  error={shelterCheckIns.error}
                  empty={!checkedInRecords.length}
                  emptyTitle="Chưa có lượt check-in đang hoạt động"
                  emptyText="Khi có người dân check-in tại điểm trú này, danh sách sẽ hiển thị tại đây."
                  refetch={shelterCheckIns.refetch}
                >
                  <DataTableFrame label="Danh sách người đang lưu trú">
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
                        {checkedInRecords.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.personName ?? item.householdId ?? "Lượt check-in"}</TableCell>
                            <TableCell>{item.numPeople ?? "-"}</TableCell>
                            <TableCell><StatusChip value={item.action ?? item.status ?? "CHECK_IN"} /></TableCell>
                            <TableCell>{checkInTime(item) ? formatDate(checkInTime(item)) : "-"}</TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                color="error"
                                disabled={checkOut.isPending}
                                onClick={() => checkOut.mutate({ shelterId: selectedCheckInShelterId, personName: item.personName, numPeople: item.numPeople ?? 1 })}
                              >
                                Check-out
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </DataTableFrame>
                </QueryState>
              )}
            </Stack>
          </SectionPaper>
        </Grid>
        ) : null}

        {shelterOptions.map((shelter) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={shelter.id}>
            <SectionPaper
              sx={{
                height: "100%",
                borderTop: "3px solid var(--color-green-600)",
                transition: "border-color var(--motion-fast), background-color var(--motion-fast)",
                "&:hover": { borderTopColor: "var(--color-green-800)", bgcolor: "var(--color-green-50)" },
              }}
            >
              <Stack spacing={1}>
                <Typography fontWeight={800}>{shelter.name}</Typography>
                <Typography color="text.secondary">{shelter.address}</Typography>
                <StatusChip value={shelter.status} />
                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                    <Typography fontWeight={800}>Số người lưu trú</Typography>
                    <Typography color="text.secondary">{shelter.currentOccupancy}/{shelter.capacity}</Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={shelter.capacity ? Math.min((shelter.currentOccupancy / shelter.capacity) * 100, 100) : 0}
                    color={shelter.capacity && shelter.currentOccupancy / shelter.capacity > 0.85 ? "warning" : "success"}
                  />
                </Box>
              </Stack>
            </SectionPaper>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
