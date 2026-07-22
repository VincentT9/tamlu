import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaidIcon from "@mui/icons-material/Paid";
import { Box, Button, Grid, LinearProgress, Paper, Stack, Typography } from "@mui/material";
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
        eyebrow={campaign.affectedArea ?? "Chiến dịch cứu trợ"}
        title={campaign.name}
        description={campaign.description ?? undefined}
        actions={
          <Stack direction="row" spacing={1}>
            <Button component={Link} to={`/campaigns/${campaign.id}/transparency`} startIcon={<AccountBalanceIcon />} variant="outlined">
              Minh bạch
            </Button>
            <Button component={Link} to={`/donor/donate/${campaign.id}`} startIcon={<PaidIcon />} variant="contained" color="secondary">
              Ủng hộ
            </Button>
          </Stack>
        }
      />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <SectionPaper>
            <Stack spacing={2}>
              <Box sx={{ position: "relative", overflow: "visible", borderRadius: 0 }}>
                <img
                  src={campaign.coverImageUrl || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80"}
                  alt={campaign.name}
                  style={{ width: "100%", maxHeight: 420, objectFit: "cover", display: "block" }}
                />
                <Box sx={{ position: "absolute", inset: "auto 0 0 0", p: 2.5, background: "linear-gradient(180deg, transparent, rgba(246,248,232,.90))", color: "var(--color-text)" }}>
                  <Typography fontWeight={900} sx={{ color: "var(--color-green-800)" }}>{campaign.affectedArea}</Typography>
                  <Typography variant="body2" sx={{ color: "var(--color-text-muted)" }}>
                    {formatDate(campaign.startDate)} đến {formatDate(campaign.endDate)}
                  </Typography>
                </Box>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <StatusChip value={campaign.status} />
                <Typography color="text.secondary">
                  Thời gian chiến dịch công khai
                </Typography>
              </Stack>
              <LinearProgress variant="determinate" value={Math.min(progress, 100)} sx={{ height: 10, borderRadius: 0 }} />
              <Typography fontWeight={800}>
                Đã quyên góp {formatMoney(campaign.currentAmount)} trên mục tiêu {formatMoney(campaign.targetAmount)} ({percent(progress)})
              </Typography>
            </Stack>
          </SectionPaper>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2}>
            <MetricCard label="Tổng thu" value={formatMoney(data.ledgerSummary.totalIncome)} tone="green" />
            <MetricCard label="Tổng chi" value={formatMoney(data.ledgerSummary.totalExpense)} tone="orange" />
            <MetricCard label="Số dư còn lại" value={formatMoney(data.ledgerSummary.balance)} />
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 0 }}>
              <Stack spacing={1.5}>
                <Typography variant="h6" fontWeight={900}>Cơ sở tạo dựng niềm tin</Typography>
                {["Sổ thu chi công khai", "Luân chuyển hàng cứu trợ", "Minh chứng hiện trường"].map((item) => (
                  <Stack key={item} direction="row" spacing={1.25} alignItems="center">
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "success.main" }} />
                    <Typography fontWeight={800}>{item}</Typography>
                  </Stack>
                ))}
                <Button component={Link} to={`/campaigns/${campaign.id}/transparency`} variant="outlined" startIcon={<AccountBalanceIcon />}>
                  Xem hồ sơ kiểm toán
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}
