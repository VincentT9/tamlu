import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Box, Button, Grid, ImageList, ImageListItem, Stack, TextField, Typography } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { sosApi } from "@/features/sos/api";
import { SOS_STATUS } from "@/shared/constants/statuses";
import { TamLuMap } from "@/shared/maps/TamLuMap";
import { formatDate } from "@/shared/utils/format";
import { MetricCard } from "@/shared/ui/MetricCard";
import { PageHeader } from "@/shared/ui/PageHeader";
import { QueryState } from "@/shared/ui/QueryState";
import { SectionPaper } from "@/shared/ui/SectionPaper";
import { StatusChip } from "@/shared/ui/StatusChip";
import { useToast } from "@/shared/ui/toast";

export function SosDetailPage() {
  const { id = "" } = useParams();
  const [note, setNote] = useState("");
  const showToast = useToast((state) => state.showToast);
  const detail = useQuery({ queryKey: ["sos", id], queryFn: () => sosApi.byId(id), enabled: Boolean(id), refetchInterval: 30000 });
  const confirm = useMutation({
    mutationFn: () => sosApi.confirm(id, note),
    onSuccess: () => {
      showToast("Rescue confirmed. Thank you.", "success");
      detail.refetch();
    },
  });
  const item = detail.data;

  return (
    <>
      <PageHeader title={item?.title ?? "SOS Detail"} description={item?.description} />
      <QueryState isLoading={detail.isLoading} error={detail.error} refetch={detail.refetch}>
        {item ? (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <SectionPaper>
                <Stack spacing={2}>
                  <TamLuMap markers={[{ id: item.id, title: item.title, subtitle: item.address ?? item.contactPhone, latitude: item.latitude, longitude: item.longitude, type: "sos" }]} height={360} />
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <StatusChip value={item.status} />
                    <StatusChip value={item.priorityLevel} />
                    <Typography color="text.secondary">{item.numPeople} people</Typography>
                  </Stack>
                  {item.status === SOS_STATUS.completed ? (
                    <Stack spacing={1}>
                      <TextField label="Confirmation note" value={note} onChange={(event) => setNote(event.target.value)} multiline minRows={2} />
                      <Button startIcon={<CheckCircleIcon />} variant="contained" color="success" onClick={() => confirm.mutate()} disabled={confirm.isPending}>
                        Confirm rescue completed
                      </Button>
                    </Stack>
                  ) : null}
                </Stack>
              </SectionPaper>
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <Stack spacing={2}>
                <MetricCard label="Contact" value={item.contactName} helper={item.contactPhone} />
                <MetricCard label="Location" value={item.address ?? "GPS location"} helper={`${item.latitude}, ${item.longitude}`} />
                <MetricCard label="Created" value={formatDate(item.createdAt)} />
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionPaper>
                <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>Status timeline</Typography>
                <Stack spacing={1.5}>
                  {item.statusLogs.map((log, index) => (
                    <Stack key={log.id} direction="row" spacing={1.5}>
                      <Stack alignItems="center">
                        <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "primary.main", mt: 0.75 }} />
                        {index < item.statusLogs.length - 1 ? <Box sx={{ width: 2, flex: 1, bgcolor: "divider", mt: 0.5 }} /> : null}
                      </Stack>
                      <Box sx={{ pb: 1.5 }}>
                        <StatusChip value={log.status} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{log.note}</Typography>
                        <Typography variant="caption">{formatDate(log.createdAt)}</Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </SectionPaper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <SectionPaper>
                <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>Media</Typography>
                <ImageList cols={2} gap={8}>
                  {item.media.map((media) => (
                    <ImageListItem key={media.id}>
                      <img src={media.fileUrl} alt={media.fileType} loading="lazy" style={{ borderRadius: 8 }} />
                    </ImageListItem>
                  ))}
                </ImageList>
              </SectionPaper>
            </Grid>
          </Grid>
        ) : null}
      </QueryState>
    </>
  );
}
