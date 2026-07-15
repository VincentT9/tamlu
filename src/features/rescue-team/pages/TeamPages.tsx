import DoneAllIcon from "@mui/icons-material/DoneAll";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import { Alert, Button, Grid, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { aidApi } from "@/features/aid/api";
import { inventoryApi } from "@/features/inventory/api";
import { missionApi } from "@/features/missions/api";
import { MISSION_STATUS, SHIPMENT_STATUS } from "@/shared/constants/statuses";
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
      return missionApi.update(id, { status: MISSION_STATUS.enRoute, note: "Mission accepted by rescue team.", ...coords });
    },
    onSuccess: () => {
      showToast("Mission accepted.", "success");
      queryClient.invalidateQueries({ queryKey: ["team-missions"] });
    },
  });

  return (
    <>
      <PageHeader title="Assigned Missions" description="Field mission queue for rescue teams." />
      <QueryState isLoading={missions.isLoading} error={missions.error} empty={!missions.data?.data.length} refetch={missions.refetch}>
        <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Mission</TableCell><TableCell>Priority</TableCell><TableCell>Status</TableCell><TableCell>Shelter</TableCell><TableCell /></TableRow></TableHead><TableBody>
          {missions.data?.data.map((mission) => (
            <TableRow key={mission.id}><TableCell>{mission.code}</TableCell><TableCell><StatusChip value={mission.priority} /></TableCell><TableCell><StatusChip value={mission.status} /></TableCell><TableCell>{mission.destinationShelterName}</TableCell><TableCell align="right"><Stack direction="row" spacing={1} justifyContent="flex-end">{mission.status === MISSION_STATUS.assigned ? <Button size="small" variant="contained" onClick={() => accept.mutate(mission.id)} disabled={accept.isPending}>Accept</Button> : null}<Button component={Link} to={`/team/missions/${mission.id}`}>Open</Button></Stack></TableCell></TableRow>
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
      showToast("Mission update posted.", "success");
      queryClient.invalidateQueries({ queryKey: ["team-mission", id] });
      queryClient.invalidateQueries({ queryKey: ["team-missions"] });
    },
  });
  const complete = useMutation({
    mutationFn: () => missionApi.complete(id, { peopleRescued: 1, notes: note }),
    onSuccess: () => {
      showToast("Mission completed.", "success");
      queryClient.invalidateQueries({ queryKey: ["team-mission", id] });
    },
  });
  const locate = () => {
    navigator.geolocation?.getCurrentPosition((position) => setCoords({ latitude: Number(position.coords.latitude.toFixed(6)), longitude: Number(position.coords.longitude.toFixed(6)) }));
  };
  const lastUpdate = mission.data?.updates.at(-1);

  return (
    <>
      <PageHeader title={mission.data?.code ?? "Mission Detail"} description="Update GPS and mission status as the field situation changes." />
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
                  <Typography variant="h6" fontWeight={900}>Post field update</Typography>
                  <TextField select label="Status" value={status} onChange={(event) => setStatus(event.target.value)}>
                    {Object.values(MISSION_STATUS).map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </TextField>
                  <TextField label="Latitude" type="number" value={coords.latitude} onChange={(event) => setCoords({ ...coords, latitude: Number(event.target.value) })} />
                  <TextField label="Longitude" type="number" value={coords.longitude} onChange={(event) => setCoords({ ...coords, longitude: Number(event.target.value) })} />
                  <TextField label="Note" multiline minRows={3} value={note} onChange={(event) => setNote(event.target.value)} />
                  <Button startIcon={<GpsFixedIcon />} onClick={locate}>Use current GPS</Button>
                  <Button variant="contained" onClick={() => update.mutate()} disabled={update.isPending}>Post update</Button>
                  <Button color="success" startIcon={<DoneAllIcon />} onClick={() => complete.mutate()} disabled={complete.isPending}>Complete mission</Button>
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
      showToast("Shipment updated.", "success");
      queryClient.invalidateQueries({ queryKey: ["team-shipments"] });
    },
  });
  return (
    <>
      <PageHeader title="Field Shipments" description="Advance assigned shipments from preparing through delivery." />
      <QueryState isLoading={shipments.isLoading} error={shipments.error} empty={!shipments.data?.data.length} refetch={shipments.refetch}>
        <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Shipment</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell></TableRow></TableHead><TableBody>
          {shipments.data?.data.map((shipment) => (
            <TableRow key={shipment.id}><TableCell>{shipment.emergencyCaseTitle ?? shipment.id}</TableCell><TableCell><StatusChip value={shipment.status} /></TableCell><TableCell><Stack direction="row" spacing={1}>
              {[SHIPMENT_STATUS.shipped, SHIPMENT_STATUS.inTransit, SHIPMENT_STATUS.delivered].map((status) => <Button key={status} size="small" onClick={() => update.mutate({ id: shipment.id, status })}>{status}</Button>)}
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
  const rows = useQuery({ queryKey: ["area-assessments-team"], queryFn: () => aidApi.areaAssessments({ page: 1, limit: 50 }) });
  const create = useMutation({
    mutationFn: () => aidApi.createAreaAssessment(form),
    onSuccess: () => {
      showToast("Area assessment created.", "success");
      queryClient.invalidateQueries({ queryKey: ["area-assessments-team"] });
    },
  });
  return (
    <>
      <PageHeader title="Area Assessments" description="Report field needs for aid allocation planning." />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionPaper>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={900}>New assessment</Typography>
              {Object.keys(form).map((key) => (
                <TextField key={key} label={key} value={String(form[key as keyof typeof form])} onChange={(event) => setForm({ ...form, [key]: key === "householdsAffected" ? Number(event.target.value) : event.target.value })} />
              ))}
              <Button variant="contained" onClick={() => create.mutate()} disabled={!form.campaignId || create.isPending}>Submit</Button>
            </Stack>
          </SectionPaper>
        </Grid>
        <Grid size={{ xs: 12, lg: 8 }}>
          <QueryState isLoading={rows.isLoading} error={rows.error} empty={!rows.data?.data.length} refetch={rows.refetch}>
            <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Area</TableCell><TableCell>Households</TableCell><TableCell>Priority</TableCell><TableCell>Status</TableCell></TableRow></TableHead><TableBody>
              {rows.data?.data.map((row) => <TableRow key={row.id}><TableCell>{row.areaName}</TableCell><TableCell>{row.householdsAffected}</TableCell><TableCell><StatusChip value={row.priorityLevel} /></TableCell><TableCell><StatusChip value={row.status} /></TableCell></TableRow>)}
            </TableBody></Table></Paper>
          </QueryState>
        </Grid>
      </Grid>
    </>
  );
}

export function TeamProofsPage() {
  return (
    <>
      <PageHeader title="Proof Packages" description="Use the disbursement detail workflow to create proof packages, attach media URLs, geotags, and receiver signatures." />
      <Alert severity="info">The backend exposes proof endpoints under disbursements. This page is intentionally a field checklist surface until a specific disbursement is selected.</Alert>
    </>
  );
}

export function TeamProfilePage() {
  const team = useQuery({ queryKey: ["my-team"], queryFn: missionApi.myTeam });
  return (
    <>
      <PageHeader title="My Rescue Team" description="Current team profile returned by `/api/team/my-team`." />
      <QueryState isLoading={team.isLoading} error={team.error} refetch={team.refetch}>
        <SectionPaper>
          <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{JSON.stringify(team.data, null, 2)}</pre>
        </SectionPaper>
      </QueryState>
    </>
  );
}
