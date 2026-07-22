import { Box, Button, Grid, LinearProgress, Paper, Stack, TextField, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { missionApi } from "@/features/missions/api";
import { postData } from "@/shared/api/client";
import { TamLuMap } from "@/shared/maps/TamLuMap";
import { PageHeader } from "@/shared/ui/PageHeader";
import { QueryState } from "@/shared/ui/QueryState";
import { SectionPaper } from "@/shared/ui/SectionPaper";
import { StatusChip } from "@/shared/ui/StatusChip";
import { useToast } from "@/shared/ui/toast";

export function SheltersPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const shelters = useQuery({ queryKey: ["shelters"], queryFn: () => missionApi.shelters({ page: 1, limit: 50 }) });
  const [form, setForm] = useState({ shelterId: "", personName: "", numPeople: 1 });
  const checkIn = useMutation({
    mutationFn: () => postData(`/api/shelters/${form.shelterId}/check-in`, { personName: form.personName, numPeople: form.numPeople, householdId: null }),
    onSuccess: () => {
      showToast("Đã ghi nhận người đến điểm trú tạm.", "success");
      queryClient.invalidateQueries({ queryKey: ["shelters"] });
    },
  });
  const markers = shelters.data?.data.map((shelter) => ({ id: shelter.id, title: shelter.name, subtitle: `${shelter.currentOccupancy}/${shelter.capacity}`, latitude: shelter.latitude, longitude: shelter.longitude, type: "shelter" as const })) ?? [];
  const totalCapacity = shelters.data?.data.reduce((sum, shelter) => sum + shelter.capacity, 0) ?? 0;
  const totalOccupancy = shelters.data?.data.reduce((sum, shelter) => sum + shelter.currentOccupancy, 0) ?? 0;
  const occupancyPct = totalCapacity ? Math.min((totalOccupancy / totalCapacity) * 100, 100) : 0;
  return (
    <>
      <PageHeader title="Điểm trú tạm" description="Theo dõi sức chứa điểm trú tạm và ghi nhận người dân đến nơi an toàn." />
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
              <TextField label="Mã điểm trú tạm" value={form.shelterId} onChange={(event) => setForm({ ...form, shelterId: event.target.value })} />
              <TextField label="Người/hộ gia đình" value={form.personName} onChange={(event) => setForm({ ...form, personName: event.target.value })} />
              <TextField label="Số người" type="number" value={form.numPeople} onChange={(event) => setForm({ ...form, numPeople: Number(event.target.value) })} />
              <Button variant="contained" disabled={!form.shelterId || !form.personName || checkIn.isPending} onClick={() => checkIn.mutate()}>Ghi nhận</Button>
            </Stack>
          </SectionPaper>
        </Grid>
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
