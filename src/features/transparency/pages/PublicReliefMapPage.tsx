import { Alert, Box, Button, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { donationApi } from "@/features/donations/api";
import { transparencyApi } from "@/features/transparency/api";
import { TamLuMap } from "@/shared/maps/TamLuMap";
import { QueryState } from "@/shared/ui/QueryState";
import { StatusChip } from "@/shared/ui/StatusChip";

const pageTheme = {
  bg: "var(--color-cream-50)",
  panel: "var(--color-surface)",
  panelSoft: "var(--color-green-50)",
  line: "var(--color-border)",
  lineStrong: "var(--color-border-strong)",
  text: "var(--color-green-800)",
  muted: "var(--color-text-muted)",
  faint: "var(--color-text-muted)",
  water: "var(--color-green-700)",
  waterSoft: "var(--color-green-600)",
  amber: "var(--color-cream-100)",
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
        background: pageTheme.bg,
        "& .MuiSkeleton-root": {
          bgcolor: pageTheme.panel,
          backgroundImage: "none",
        },
        "& .MuiAlert-root.MuiAlert-standardError": {
          borderRadius: 2,
          bgcolor: "#fff1f2",
          color: "#b91c1c",
          border: "1px solid rgba(248,113,113,.28)",
        },
      }}
    >
      <Box sx={{ mx: "auto", maxWidth: 1500 }}>
        <Stack spacing={1.4} sx={{ mb: { xs: 3, md: 4 }, maxWidth: 880 }}>
          <Typography sx={{ color: pageTheme.waterSoft, fontSize: 13, fontWeight: 800, letterSpacing: 0, textTransform: "uppercase" }}>
            Bản đồ cứu trợ công khai
          </Typography>
          <Typography component="h1" sx={{ fontSize: { xs: 34, md: 52 }, lineHeight: 1.08, fontWeight: 800, letterSpacing: 0 }}>
            Luồng hậu cần của chiến dịch đã xác minh
          </Typography>
          <Typography sx={{ color: pageTheme.muted, fontSize: { xs: 16, md: 18 }, lineHeight: 1.65 }}>
            Bản đồ công khai chỉ hiển thị dữ liệu minh bạch được phép công bố. Vị trí SOS thô không được hiển thị ra bên ngoài.
          </Typography>
        </Stack>
      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 2,
          border: `1px solid ${pageTheme.line}`,
          bgcolor: pageTheme.panel,
          color: pageTheme.text,
          overflow: "hidden",
          boxShadow: "var(--shadow-surface)",
        }}
      >
        <Stack spacing={2.5}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <TextField
                fullWidth
                select
                label="Chiến dịch"
                value={selectedId}
                onChange={(event) => setCampaignId(event.target.value)}
                sx={{
                  "& .MuiInputLabel-root": { color: pageTheme.faint },
                  "& .MuiInputLabel-root.Mui-focused": { color: pageTheme.waterSoft },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    bgcolor: "#ffffff",
                    color: pageTheme.text,
                    "& fieldset": { borderColor: pageTheme.line },
                    "&:hover fieldset": { borderColor: pageTheme.lineStrong },
                    "&.Mui-focused fieldset": { borderColor: pageTheme.waterSoft, borderWidth: 2 },
                  },
                  "& .MuiSelect-icon": { color: pageTheme.waterSoft },
                }}
              >
                <MenuItem value="" disabled>
                  {campaigns.isLoading ? "Đang tải chiến dịch..." : "Chưa chọn chiến dịch"}
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
                  borderRadius: 2,
                  border: `1px solid ${pageTheme.line}`,
                  bgcolor: pageTheme.panel,
                  color: pageTheme.text,
                  "& .MuiAlert-icon": { color: pageTheme.waterSoft },
                }}
              >
                Các điểm đánh dấu công khai chỉ hiển thị dữ liệu minh bạch đã xác minh.
              </Alert>
            </Grid>
          </Grid>
          <QueryState isLoading={campaigns.isLoading || inventory.isLoading} error={campaigns.error || inventory.error}>
            <Box
              sx={{
                position: "relative",
                overflow: "visible",
                borderRadius: 2,
                border: `1px solid ${pageTheme.line}`,
                bgcolor: pageTheme.panelSoft,
                "& .leaflet-container": { borderRadius: 2 },
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
                  borderRadius: 2,
                  bgcolor: pageTheme.panel,
                  color: pageTheme.text,
                  borderColor: pageTheme.lineStrong,
                  boxShadow: "var(--shadow-surface)",
                }}
              >
                <Stack spacing={1.5}>
                  <Typography fontWeight={800}>Lớp bản đồ</Typography>
                  {[
                    { label: "Kho hàng đã xác minh", color: pageTheme.waterSoft, value: markers.length },
                    { label: "Tuyến phân phối đang hoạt động", color: pageTheme.amber, value: map.data?.activeRoutes.length ?? 0 },
                    { label: "Bộ lọc bảo mật công khai", color: pageTheme.water, value: "Bật" },
                  ].map((item) => (
                    <Stack key={item.label} direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: item.color, flex: "0 0 auto" }} />
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
            <Typography variant="h6" fontWeight={800} sx={{ color: pageTheme.text }}>
              Tóm tắt tuyến phân phối
            </Typography>
            {map.data?.activeRoutes.map((route) => (
              <Paper
                key={route.id}
                variant="outlined"
                sx={{
                  p: { xs: 1.75, md: 2 },
                  borderRadius: 2,
                  borderColor: pageTheme.line,
                  bgcolor: pageTheme.panelSoft,
                  color: pageTheme.text,
                  boxShadow: "none",
                }}
              >
              <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1}>
                <Typography fontWeight={800}>{route.sourceWarehouse} đến điểm phân phối hiện trường</Typography>
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
