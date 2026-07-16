import { Alert, Box, Button, Grid, Paper, Stack, TextField, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { volunteerApi } from "@/features/volunteers/api";
import { getErrorMessage } from "@/shared/api/client";
import { PageHeader } from "@/shared/ui/PageHeader";
import { QueryState } from "@/shared/ui/QueryState";
import { SectionPaper } from "@/shared/ui/SectionPaper";
import { StatusChip } from "@/shared/ui/StatusChip";
import { useToast } from "@/shared/ui/toast";

export function VolunteerProfilePage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const profile = useQuery({ queryKey: ["my-volunteer-profile"], queryFn: volunteerApi.my, retry: false });
  const [form, setForm] = useState({ skills: "", experience: "", availableAreas: "", status: "AVAILABLE" });
  useEffect(() => {
    if (profile.data) setForm({ skills: profile.data.skills, experience: profile.data.experience ?? "", availableAreas: profile.data.availableAreas ?? "", status: profile.data.status });
  }, [profile.data]);
  const save = useMutation({
    mutationFn: () => (profile.data ? volunteerApi.updateMy(form) : volunteerApi.create(form)),
    onSuccess: () => {
      showToast("Volunteer profile saved.", "success");
      queryClient.invalidateQueries({ queryKey: ["my-volunteer-profile"] });
    },
  });
  return (
    <>
      <PageHeader title="Volunteer Profile" description="Register skills and availability so coordinators can add you to rescue missions." />
      <QueryState isLoading={profile.isLoading} error={undefined}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 4, height: "100%" }}>
              <Stack spacing={2}>
                <Box sx={{ display: "grid", placeItems: "center", width: 56, height: 56, borderRadius: 4, bgcolor: "primary.light", color: "primary.main", fontWeight: 900 }}>
                  TL
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={900}>Volunteer readiness</Typography>
                  <Typography color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>
                    Keep your skills and coverage areas current so coordinators can match you with the safest useful assignment.
                  </Typography>
                </Box>
                {profile.data ? <StatusChip value={profile.data.status} /> : <Alert severity="info">No volunteer profile yet. Create one below.</Alert>}
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, lg: 8 }}>
            <SectionPaper>
              {save.error ? <Alert severity="error">{getErrorMessage(save.error)}</Alert> : null}
              <Stack spacing={2} sx={{ mt: save.error ? 2 : 0 }}>
                <Typography variant="h6" fontWeight={900}>Skills and availability</Typography>
                <TextField label="Skills" value={form.skills} onChange={(event) => setForm({ ...form, skills: event.target.value })} />
                <TextField label="Experience" value={form.experience} onChange={(event) => setForm({ ...form, experience: event.target.value })} multiline minRows={3} />
                <TextField label="Available areas" value={form.availableAreas} onChange={(event) => setForm({ ...form, availableAreas: event.target.value })} />
                <Box>
                  <Button variant="contained" onClick={() => save.mutate()} disabled={save.isPending}>Save profile</Button>
                </Box>
              </Stack>
            </SectionPaper>
          </Grid>
        </Grid>
      </QueryState>
    </>
  );
}
