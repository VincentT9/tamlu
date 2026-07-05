import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaidIcon from "@mui/icons-material/Paid";
import { Button, Grid, LinearProgress, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { donationApi } from "@/features/donations/api";
import type { PublicCampaignDetail } from "@/shared/api/domain";
import { formatDate, formatMoney, percent } from "@/shared/utils/format";
import { MetricCard } from "@/shared/ui/MetricCard";
import { PageHeader } from "@/shared/ui/PageHeader";
import { QueryState } from "@/shared/ui/QueryState";
import { SectionPaper } from "@/shared/ui/SectionPaper";
import { StatusChip } from "@/shared/ui/StatusChip";

export function CampaignDetailPage() {
  const { id = "" } = useParams();
  const detail = useQuery({ queryKey: ["public-campaign", id], queryFn: () => donationApi.publicCampaign(id), enabled: Boolean(id) });

  return (
    <QueryState isLoading={detail.isLoading} error={detail.error} refetch={detail.refetch}>
      {detail.data ? <CampaignDetailContent data={detail.data} /> : null}
    </QueryState>
  );
}

function CampaignDetailContent({ data }: { data: PublicCampaignDetail }) {
  const campaign = data.campaign;
  const progress = campaign.stats?.progressPct ?? (campaign.targetAmount ? (campaign.currentAmount / campaign.targetAmount) * 100 : 0);
  return (
    <>
      <PageHeader
        eyebrow={campaign.affectedArea ?? "Relief campaign"}
        title={campaign.name}
        description={campaign.description ?? undefined}
        actions={
          <Stack direction="row" spacing={1}>
            <Button component={Link} to={`/campaigns/${campaign.id}/transparency`} startIcon={<AccountBalanceIcon />} variant="outlined">
              Transparency
            </Button>
            <Button component={Link} to={`/donor/donate/${campaign.id}`} startIcon={<PaidIcon />} variant="contained" color="secondary">
              Donate
            </Button>
          </Stack>
        }
      />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <SectionPaper>
            <Stack spacing={2}>
              <img
                src={campaign.coverImageUrl || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80"}
                alt={campaign.name}
                style={{ width: "100%", maxHeight: 380, objectFit: "cover", borderRadius: 8 }}
              />
              <Stack direction="row" spacing={1} alignItems="center">
                <StatusChip value={campaign.status} />
                <Typography color="text.secondary">
                  {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                </Typography>
              </Stack>
              <LinearProgress variant="determinate" value={Math.min(progress, 100)} sx={{ height: 10, borderRadius: 8 }} />
              <Typography fontWeight={800}>
                {formatMoney(campaign.currentAmount)} raised of {formatMoney(campaign.targetAmount)} ({percent(progress)})
              </Typography>
            </Stack>
          </SectionPaper>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2}>
            <MetricCard label="Income" value={formatMoney(data.ledgerSummary.totalIncome)} tone="green" />
            <MetricCard label="Expense" value={formatMoney(data.ledgerSummary.totalExpense)} tone="orange" />
            <MetricCard label="Remaining balance" value={formatMoney(data.ledgerSummary.balance)} />
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}
