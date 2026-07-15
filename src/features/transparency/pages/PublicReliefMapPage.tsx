import { Alert, Box, Button, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { donationApi } from "@/features/donations/api";
import { transparencyApi } from "@/features/transparency/api";
import { TamLuMap } from "@/shared/maps/TamLuMap";
import { QueryState } from "@/shared/ui/QueryState";
import { StatusChip } from "@/shared/ui/StatusChip";

const pageTheme = {
  bg: "#031014",
  panel: "rgba(6,26,34,.88)",
  panelSoft: "rgba(255,255,255,.045)",
  line: "rgba(103,232,249,.18)",
  lineStrong: "rgba(45,212,191,.34)",
  text: "#f7fdff",
  muted: "rgba(224,247,250,.66)",
  faint: "rgba(224,247,250,.48)",
  water: "#2dd4bf",
  waterSoft: "#67e8f9",
  amber: "#f5b85b",
};

export function PublicReliefMapPage() {
  const campaigns = useQuery({ queryKey: ["public-campaigns", "map"], queryFn: () => donationApi.publicCampaigns({ page: 1, limit: 50 }) });
  const [campaignId, setCampaignId] = useState("");
  const selectedId = campaignId || campaigns.data?.data[0]?.id || "";
  const inventory = useQuery({
    queryKey: ["public-map-inventory", selectedId],
    queryFn: () => transparencyApi.inventory(selectedId),
    enabled: Boolean(selectedId),
  });
  const map = useQuery({
    queryKey: ["public-map-routes", selectedId],
    queryFn: () => transparencyApi.map(selectedId),
    enabled: Boolean(selectedId),
    refetchInterval: 60000,
  });
  const markers = useMemo(
    () =>
      inventory.data?.warehouses.map((warehouse) => ({
        id: warehouse.id,
        title: warehouse.name,
        subtitle: warehouse.address,
        latitude: warehouse.latitude,
        longitude: warehouse.longitude,
        type: "warehouse" as const,
      })) ?? [],
    [inventory.data],
  );

  return (
    <Box
      sx={{
        mx: "calc(50% - 50vw)",
        mt: { xs: -1, md: -2 },
        minHeight: "calc(100dvh - 88px)",
        px: { xs: 2, md: 4 },
        py: { xs: 4, md: 6 },
        color: pageTheme.text,
        background:
          `radial-gradient(circle at 70% 0%, rgba(45,212,191,.18), transparent 30%), linear-gradient(180deg, ${pageTheme.bg} 0%, #04181d 100%)`,
        "& .MuiSkeleton-root": {
          bgcolor: "rgba(45,212,191,.10)",
          backgroundImage: "linear-gradient(90deg, rgba(45,212,191,.08), rgba(103,232,249,.18), rgba(45,212,191,.08))",
        },
        "& .MuiAlert-root.MuiAlert-standardError": {
          borderRadius: 4,
          bgcolor: "rgba(127,29,29,.22)",
          color: pageTheme.text,
          border: "1px solid rgba(248,113,113,.28)",
        },
      }}
    >
      <Box sx={{ mx: "auto", maxWidth: 1500 }}>
        <Stack spacing={1.4} sx={{ mb: { xs: 3, md: 4 }, maxWidth: 880 }}>
          <Typography sx={{ color: pageTheme.waterSoft, fontSize: 13, fontWeight: 950, letterSpacing: ".12em", textTransform: "uppercase" }}>
            Public Relief Map
          </Typography>
          <Typography component="h1" sx={{ fontSize: { xs: 34, md: 52 }, lineHeight: 1, fontWeight: 950, letterSpacing: "-.035em" }}>
            Verified campaign logistics
          </Typography>
          <Typography sx={{ color: pageTheme.muted, fontSize: { xs: 16, md: 18 }, lineHeight: 1.65 }}>
            This public map intentionally displays only backend-public transparency data. Raw SOS locations are not exposed by the current backend.
          </Typography>
        </Stack>
      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: { xs: 4, md: 6 },
          border: `1px solid ${pageTheme.line}`,
          bgcolor: pageTheme.panel,
          color: pageTheme.text,
          boxShadow: "0 30px 90px rgba(0,0,0,.32)",
          backdropFilter: "blur(18px)",
          overflow: "hidden",
        }}
      >
        <Stack spacing={2.5}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <TextField
                fullWidth
                select
                label="Campaign"
                value={selectedId}
                onChange={(event) => setCampaignId(event.target.value)}
                sx={{
                  "& .MuiInputLabel-root": { color: pageTheme.faint },
                  "& .MuiInputLabel-root.Mui-focused": { color: pageTheme.waterSoft },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 4,
                    bgcolor: "rgba(255,255,255,.06)",
                    color: pageTheme.text,
                    "& fieldset": { borderColor: pageTheme.line },
                    "&:hover fieldset": { borderColor: pageTheme.lineStrong },
                    "&.Mui-focused fieldset": { borderColor: pageTheme.waterSoft, borderWidth: 2 },
                  },
                  "& .MuiSelect-icon": { color: pageTheme.waterSoft },
                }}
              >
                <MenuItem value="" disabled>
                  {campaigns.isLoading ? "Loading campaigns..." : "No campaign selected"}
                </MenuItem>
                {(campaigns.data?.data ?? []).map((campaign) => (
                  <MenuItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Alert
                severity="info"
                sx={{
                  borderRadius: 4,
                  border: `1px solid ${pageTheme.line}`,
                  bgcolor: "rgba(45,212,191,.10)",
                  color: pageTheme.text,
                  "& .MuiAlert-icon": { color: pageTheme.waterSoft },
                }}
              >
                Public markers only show verified transparency data.
              </Alert>
            </Grid>
          </Grid>
          <QueryState isLoading={campaigns.isLoading || inventory.isLoading} error={campaigns.error || inventory.error}>
            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: { xs: 4, md: 5 },
                border: `1px solid ${pageTheme.line}`,
                bgcolor: pageTheme.panelSoft,
                "& .leaflet-container": { borderRadius: { xs: 4, md: 5 } },
              }}
            >
              <TamLuMap markers={markers} height={560} />
              <Paper
                variant="outlined"
                sx={{
                  position: { xs: "static", md: "absolute" },
                  left: 16,
                  top: 16,
                  mt: { xs: 2, md: 0 },
                  width: { xs: "100%", md: 300 },
                  p: 2.25,
                  borderRadius: 4,
                  bgcolor: "rgba(6,26,34,.86)",
                  color: pageTheme.text,
                  borderColor: pageTheme.lineStrong,
                  backdropFilter: "blur(14px)",
                  boxShadow: "0 20px 60px rgba(0,0,0,.32)",
                }}
              >
                <Stack spacing={1.5}>
                  <Typography fontWeight={900}>Map layers</Typography>
                  {[
                    { label: "Verified warehouses", color: pageTheme.waterSoft, value: markers.length },
                    { label: "Active route summaries", color: pageTheme.amber, value: map.data?.activeRoutes.length ?? 0 },
                    { label: "Public privacy filter", color: pageTheme.water, value: "On" },
                  ].map((item) => (
                    <Stack key={item.label} direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: item.color }} />
                        <Typography variant="body2" fontWeight={800}>{item.label}</Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ color: pageTheme.muted }}>{item.value}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            </Box>
          </QueryState>
          <Stack spacing={1}>
            <Typography variant="h6" fontWeight={900} sx={{ color: pageTheme.text }}>
              Route summaries
            </Typography>
            {map.data?.activeRoutes.map((route) => (
              <Paper
                key={route.id}
                variant="outlined"
                sx={{
                  p: { xs: 1.75, md: 2 },
                  borderRadius: 4,
                  borderColor: pageTheme.line,
                  bgcolor: pageTheme.panelSoft,
                  color: pageTheme.text,
                  boxShadow: "none",
                }}
              >
              <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
                <Typography fontWeight={800}>{route.sourceWarehouse} to field distribution</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <StatusChip value={route.status} />
                  <Button size="small" disabled sx={{ color: pageTheme.faint }}>
                    {route.driver}
                  </Button>
                </Stack>
              </Stack>
              </Paper>
            ))}
          </Stack>
        </Stack>
      </Paper>
      </Box>
    </Box>
  );
}
