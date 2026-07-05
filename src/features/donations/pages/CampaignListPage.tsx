import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Button, Card, CardActions, CardContent, CardMedia, Grid, LinearProgress, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { donationApi } from "@/features/donations/api";
import { formatDate, formatMoney, percent, truncate } from "@/shared/utils/format";
import { PageHeader } from "@/shared/ui/PageHeader";
import { QueryState } from "@/shared/ui/QueryState";
import { StatusChip } from "@/shared/ui/StatusChip";

export function CampaignListPage() {
  const campaigns = useQuery({
    queryKey: ["public-campaigns"],
    queryFn: () => donationApi.publicCampaigns({ page: 1, limit: 12 }),
  });

  return (
    <>
      <PageHeader
        eyebrow="Public Donation Portal"
        title="Active flood relief campaigns"
        description="Every donation is connected to public financial ledgers, inventory movement, and field evidence."
      />
      <QueryState isLoading={campaigns.isLoading} error={campaigns.error} empty={!campaigns.data?.data.length} refetch={campaigns.refetch}>
        <Grid container spacing={2.5}>
          {campaigns.data?.data.map((campaign) => {
            const progress = campaign.stats?.progressPct ?? (campaign.targetAmount ? (campaign.currentAmount / campaign.targetAmount) * 100 : 0);
            return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={campaign.id}>
                <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={campaign.coverImageUrl || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"}
                    alt={campaign.name}
                  />
                  <CardContent sx={{ flex: 1 }}>
                    <Stack spacing={1.2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <StatusChip value={campaign.status} />
                        <Typography variant="caption" color="text.secondary">
                          Ends {formatDate(campaign.endDate)}
                        </Typography>
                      </Stack>
                      <Typography variant="h6" fontWeight={900}>
                        {campaign.name}
                      </Typography>
                      <Typography color="text.secondary">{truncate(campaign.description, 130)}</Typography>
                      <Box>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography fontWeight={800}>{formatMoney(campaign.currentAmount)}</Typography>
                          <Typography color="text.secondary">{percent(progress)}</Typography>
                        </Stack>
                        <LinearProgress variant="determinate" value={Math.min(progress, 100)} sx={{ mt: 1, height: 8, borderRadius: 8 }} />
                        <Typography variant="caption" color="text.secondary">
                          Target {formatMoney(campaign.targetAmount)}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button component={Link} to={`/campaigns/${campaign.id}`} endIcon={<ArrowForwardIcon />}>
                      View
                    </Button>
                    <Button component={Link} to={`/donor/donate/${campaign.id}`} variant="contained" color="secondary">
                      Donate
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </QueryState>
    </>
  );
}
