import MyLocationIcon from "@mui/icons-material/MyLocation";
import SosIcon from "@mui/icons-material/Sos";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Button, FormControlLabel, Grid, MenuItem, Stack, Switch, TextField, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { sosApi } from "@/features/sos/api";
import { useAuthStore } from "@/features/auth/store";
import { getErrorMessage } from "@/shared/api/client";
import { TamLuMap } from "@/shared/maps/TamLuMap";
import { PageHeader } from "@/shared/ui/PageHeader";
import { SectionPaper } from "@/shared/ui/SectionPaper";
import { useToast } from "@/shared/ui/toast";

const urgencyLevels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

const schema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  urgencyLevel: z.enum(urgencyLevels),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  address: z.string().optional(),
  emergencyType: z.string().min(2),
  numPeople: z.coerce.number().int().positive(),
  hasElderly: z.boolean(),
  hasChildren: z.boolean(),
  hasInjured: z.boolean(),
  hasDisabled: z.boolean(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
});

type SosInput = z.input<typeof schema>;
type SosForm = z.output<typeof schema>;

export function CreateSosPage() {
  const navigate = useNavigate();
  const showToast = useToast((state) => state.showToast);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [files, setFiles] = useState<FileList | null>(null);
  const form = useForm<SosInput, unknown, SosForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      urgencyLevel: "HIGH",
      latitude: 16.4637,
      longitude: 107.5909,
      address: "",
      emergencyType: "FLOOD",
      numPeople: 1,
      hasElderly: false,
      hasChildren: false,
      hasInjured: false,
      hasDisabled: false,
      contactName: "",
      contactPhone: "",
    },
  });
  const mutation = useMutation({
    mutationFn: (values: SosForm) => {
      const { urgencyLevel, ...payload } = values;
      return sosApi.create({
        ...payload,
        description: `[Urgency: ${urgencyLevel}] ${payload.description}`,
        files: files ?? undefined,
      });
    },
    onSuccess: (sos) => {
      showToast("SOS request submitted.", "success");
      navigate(isAuthenticated ? `/citizen/sos/${sos.id}` : "/", { replace: true });
    },
  });

  const useLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        form.setValue("latitude", Number(position.coords.latitude.toFixed(6)));
        form.setValue("longitude", Number(position.coords.longitude.toFixed(6)));
      },
      () => showToast("Unable to read current location.", "warning"),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };
  const latitude = Number(form.watch("latitude"));
  const longitude = Number(form.watch("longitude"));
  const mapMarkers = Number.isFinite(latitude) && Number.isFinite(longitude)
    ? [{ id: "sos-location", title: "SOS location", subtitle: form.watch("address") || "Selected rescue point", latitude, longitude, type: "sos" as const }]
    : [];

  return (
    <>
      <PageHeader
        eyebrow="Emergency SOS"
        title="Request rescue support"
        description="Anonymous submissions require contact name and phone. Logged-in citizens can submit for themselves or nearby victims."
      />
      <SectionPaper>
        {mutation.error ? <Alert severity="error">{getErrorMessage(mutation.error)}</Alert> : null}
        <Stack component="form" spacing={2.5} sx={{ mt: mutation.error ? 2 : 0 }} onSubmit={form.handleSubmit((values) => mutation.mutate(values))}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Title" {...form.register("title")} error={Boolean(form.formState.errors.title)} helperText={form.formState.errors.title?.message} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Emergency type" {...form.register("emergencyType")} error={Boolean(form.formState.errors.emergencyType)} helperText={form.formState.errors.emergencyType?.message} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth multiline minRows={4} label="Situation description" {...form.register("description")} error={Boolean(form.formState.errors.description)} helperText={form.formState.errors.description?.message} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth select label="Urgency level" {...form.register("urgencyLevel")} error={Boolean(form.formState.errors.urgencyLevel)}>
                {urgencyLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField fullWidth label="Latitude" type="number" {...form.register("latitude")} />
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <TextField fullWidth label="Longitude" type="number" {...form.register("longitude")} />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button fullWidth variant="outlined" startIcon={<MyLocationIcon />} onClick={useLocation} sx={{ height: "100%" }}>
                GPS
              </Button>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth label="Address" {...form.register("address")} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}>
                <Stack spacing={1.5}>
                  <Typography fontWeight={900}>Map picker preview</Typography>
                  <TamLuMap markers={mapMarkers} />
                  <Typography variant="body2" color="text.secondary">
                    Use current GPS or enter coordinates manually, then confirm the marker before submitting.
                  </Typography>
                </Stack>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField fullWidth label="People needing rescue" type="number" {...form.register("numPeople")} />
            </Grid>
            {(["hasElderly", "hasChildren", "hasInjured", "hasDisabled"] as const).map((name) => (
              <Grid size={{ xs: 6, md: 2 }} key={name}>
                <Controller
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormControlLabel control={<Switch checked={field.value} onChange={(_, checked) => field.onChange(checked)} />} label={name.replace("has", "")} />
                  )}
                />
              </Grid>
            ))}
            {!isAuthenticated ? (
              <>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Contact name" {...form.register("contactName")} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth label="Contact phone" {...form.register("contactPhone")} helperText="9-11 digits for anonymous SOS" />
                </Grid>
              </>
            ) : null}
            <Grid size={{ xs: 12 }}>
              <Stack spacing={1}>
                <Typography fontWeight={800}>Evidence media</Typography>
                <Button component="label" variant="outlined">
                  Select files
                  <input hidden multiple type="file" accept="image/*,video/*" onChange={(event) => setFiles(event.target.files)} />
                </Button>
                <Typography variant="body2" color="text.secondary">
                  {files?.length ? `${files.length} file(s) selected. Backend limit is 5 files, 50MB each.` : "Photos or videos help coordinators verify the situation."}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          <Box>
            <Button type="submit" variant="contained" color="error" size="large" startIcon={<SosIcon />} disabled={mutation.isPending}>
              Submit SOS
            </Button>
          </Box>
        </Stack>
      </SectionPaper>
    </>
  );
}
