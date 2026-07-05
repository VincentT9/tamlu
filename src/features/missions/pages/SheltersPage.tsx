import { Button, Grid, Stack, TextField, Typography } from "@mui/material";
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
      showToast("Shelter check-in recorded.", "success");
      queryClient.invalidateQueries({ queryKey: ["shelters"] });
    },
  });
  const markers = shelters.data?.data.map((shelter) => ({ id: shelter.id, title: shelter.name, subtitle: `${shelter.currentOccupancy}/${shelter.capacity}`, latitude: shelter.latitude, longitude: shelter.longitude, type: "shelter" as const })) ?? [];
  return (
    <>
      <PageHeader title="Shelters" description="View shelter capacity and record citizen check-ins." />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 8 }}><QueryState isLoading={shelters.isLoading} error={shelters.error} refetch={shelters.refetch}><TamLuMap markers={markers} /></QueryState></Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionPaper>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={900}>Check in</Typography>
              <TextField label="Shelter ID" value={form.shelterId} onChange={(event) => setForm({ ...form, shelterId: event.target.value })} />
              <TextField label="Person/household" value={form.personName} onChange={(event) => setForm({ ...form, personName: event.target.value })} />
              <TextField label="People" type="number" value={form.numPeople} onChange={(event) => setForm({ ...form, numPeople: Number(event.target.value) })} />
              <Button variant="contained" disabled={!form.shelterId || !form.personName || checkIn.isPending} onClick={() => checkIn.mutate()}>Check in</Button>
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
                <Typography>{shelter.currentOccupancy}/{shelter.capacity} occupied</Typography>
              </Stack>
            </SectionPaper>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
