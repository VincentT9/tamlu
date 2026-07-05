import { Alert, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { donationApi } from "@/features/donations/api";
import { transparencyApi } from "@/features/transparency/api";
import { TamLuMap } from "@/shared/maps/TamLuMap";
import { PageHeader } from "@/shared/ui/PageHeader";
import { QueryState } from "@/shared/ui/QueryState";
import { SectionPaper } from "@/shared/ui/SectionPaper";
import { StatusChip } from "@/shared/ui/StatusChip";

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
    <>
      <PageHeader
        eyebrow="Public Relief Map"
        title="Verified campaign logistics"
        description="This public map intentionally displays only backend-public transparency data. Raw SOS locations are not exposed by the current backend."
      />
      <SectionPaper>
        <Stack spacing={2}>
          <TextField select label="Campaign" value={selectedId} onChange={(event) => setCampaignId(event.target.value)}>
            <MenuItem value="" disabled>
              {campaigns.isLoading ? "Loading campaigns..." : "No campaign selected"}
            </MenuItem>
            {(campaigns.data?.data ?? []).map((campaign) => (
              <MenuItem key={campaign.id} value={campaign.id}>
                {campaign.name}
              </MenuItem>
            ))}
          </TextField>
          <Alert severity="info">Area needs and route summaries may not include coordinates in the current API, so warehouses are the reliable public map markers.</Alert>
          <QueryState isLoading={campaigns.isLoading || inventory.isLoading} error={campaigns.error || inventory.error}>
            <TamLuMap markers={markers} />
          </QueryState>
          <Stack spacing={1}>
            <Typography variant="h6" fontWeight={900}>
              Route summaries
            </Typography>
            {map.data?.activeRoutes.map((route) => (
              <Stack key={route.id} direction={{ xs: "column", md: "row" }} justifyContent="space-between" sx={{ py: 1, borderBottom: "1px solid", borderColor: "divider" }}>
                <Typography fontWeight={800}>{route.sourceWarehouse} to field distribution</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <StatusChip value={route.status} />
                  <Button size="small" disabled>
                    {route.driver}
                  </Button>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </SectionPaper>
    </>
  );
}
