import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CampaignIcon from "@mui/icons-material/Campaign";
import SosIcon from "@mui/icons-material/Sos";
import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { donationApi } from "@/features/donations/api";
import { formatMoney } from "@/shared/utils/format";
import { MetricCard } from "@/shared/ui/MetricCard";
import { QueryState } from "@/shared/ui/QueryState";
import { SectionPaper } from "@/shared/ui/SectionPaper";

export function LandingPage() {
  const campaigns = useQuery({ queryKey: ["landing-campaigns"], queryFn: () => donationApi.publicCampaigns({ page: 1, limit: 3 }) });
  const totals = campaigns.data?.data.reduce(
    (acc, campaign) => ({ raised: acc.raised + campaign.currentAmount, target: acc.target + campaign.targetAmount }),
    { raised: 0, target: 0 },
  );

  return (
    <Stack spacing={5}>
      <Box
        sx={{
          minHeight: { xs: 520, md: 620 },
          mx: { xs: -2, md: -4 },
          mt: -2,
          px: { xs: 2, md: 8 },
          py: { xs: 5, md: 8 },
          display: "flex",
          alignItems: "end",
          color: "white",
          backgroundImage:
            "linear-gradient(180deg, rgba(3,24,38,.18), rgba(3,24,38,.82)), url(https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=85)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Stack spacing={2.5} sx={{ maxWidth: 850 }}>
          <Typography variant="overline" fontWeight={900}>TamLu Flood Relief Transparency Platform</Typography>
          <Typography variant="h2" fontWeight={900} letterSpacing={0} sx={{ fontSize: { xs: 42, md: 68 } }}>
            Rescue coordination and public trust in one operational system
          </Typography>
          <Typography variant="h6" sx={{ maxWidth: 760 }}>
            Create SOS requests, coordinate rescue missions, move relief supplies, and publish donation ledgers the public can audit.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button component={Link} to="/sos/new" size="large" variant="contained" color="error" startIcon={<SosIcon />}>
              Send SOS
            </Button>
            <Button component={Link} to="/campaigns" size="large" variant="contained" color="secondary" startIcon={<CampaignIcon />}>
              Donate transparently
            </Button>
          </Stack>
        </Stack>
      </Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}><MetricCard label="Active campaigns" value={campaigns.data?.totalCount ?? 0} /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><MetricCard label="Publicly raised" value={formatMoney(totals?.raised)} tone="green" /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><MetricCard label="Target aid funding" value={formatMoney(totals?.target)} tone="orange" /></Grid>
      </Grid>
      <SectionPaper>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} alignItems={{ md: "center" }}>
          <Box>
            <Typography variant="h5" fontWeight={900}>Campaigns accepting donations</Typography>
            <Typography color="text.secondary">All campaign detail pages include public ledgers, spending breakdown, inventory movement, and field evidence.</Typography>
          </Box>
          <Button component={Link} to="/campaigns" endIcon={<ArrowForwardIcon />}>View all campaigns</Button>
        </Stack>
        <QueryState isLoading={campaigns.isLoading} error={campaigns.error} empty={!campaigns.data?.data.length} refetch={campaigns.refetch}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {campaigns.data?.data.map((campaign) => (
              <Grid size={{ xs: 12, md: 4 }} key={campaign.id}>
                <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2, height: "100%" }}>
                  <Typography fontWeight={900}>{campaign.name}</Typography>
                  <Typography color="text.secondary" variant="body2">{campaign.affectedArea}</Typography>
                  <Typography sx={{ mt: 1 }}>{formatMoney(campaign.currentAmount)}</Typography>
                  <Button component={Link} to={`/campaigns/${campaign.id}`} sx={{ mt: 1 }}>Open</Button>
                </Box>
              </Grid>
            ))}
          </Grid>
        </QueryState>
      </SectionPaper>
    </Stack>
  );
}
