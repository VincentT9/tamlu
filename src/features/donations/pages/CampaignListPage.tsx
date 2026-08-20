import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Button, Card, CardActions, CardContent, Grid, LinearProgress, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { donationApi } from "@/features/donations/api";
import { formatDate, formatMoney, percent, truncate } from "@/shared/utils/format";
import { CampaignMedia } from "@/shared/ui/CampaignMedia";
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
  amber: "var(--color-green-700)",
  amberHover: "var(--color-green-800)",
  amberInk: "#ffffff",
};

export function CampaignListPage() {
  const navigate = useNavigate();
  const campaigns = useQuery({
    queryKey: ["public-campaigns"],
    queryFn: () => donationApi.publicCampaigns({ page: 1, limit: 12 }),
  });

  return (
    <Box
      sx={{
        mx: 0,
        mt: { xs: -1, md: -2 },
        boxSizing: "border-box",
        width: "100%",
        overflowX: "hidden",
        minHeight: "calc(100dvh - 88px)",
        px: { xs: 2, md: 4 },
        py: { xs: 4, md: 6 },
        color: pageTheme.text,
        background: pageTheme.bg,
        "& .MuiSkeleton-root": {
          bgcolor: pageTheme.panel,
          backgroundImage: "none",
        },
        "& .MuiAlert-root": {
          borderRadius: 3,
          bgcolor: "#fff1f2",
          color: "#b91c1c",
          border: "1px solid rgba(248,113,113,.28)",
        },
      }}
    >
      <Box sx={{ mx: "auto", maxWidth: 1500 }}>
        <Button
          type="button"
          variant="outlined"
          size="small"
          startIcon={<ArrowBackIcon fontSize="small" />}
          onClick={() => {
            if (window.history.length > 1) navigate(-1);
            else navigate("/");
          }}
          sx={{
            mb: 2,
            minHeight: 38,
            px: 1.6,
            borderRadius: 999,
            bgcolor: "rgba(255,255,255,.58)",
            borderColor: pageTheme.line,
            color: pageTheme.text,
            fontWeight: 800,
            "&:hover": { bgcolor: "#ffffff", borderColor: pageTheme.waterSoft },
          }}
        >
          Quay lại
        </Button>
        <Stack spacing={1.6} sx={{ mb: { xs: 3, md: 4 }, maxWidth: 900 }}>
          <Typography sx={{ display: "none", color: pageTheme.waterSoft, fontSize: 13, fontWeight: 800, letterSpacing: 0, textTransform: "uppercase" }}>
            Cổng ủng hộ công khai
          </Typography>
          <Typography component="h1" sx={{ fontSize: { xs: 34, md: 52 }, lineHeight: 1.08, fontWeight: 800 }}>
            Các chiến dịch cứu trợ lũ lụt đang hoạt động
          </Typography>
          <Typography sx={{ color: pageTheme.muted, fontSize: { xs: 16, md: 18 }, lineHeight: 1.65 }}>
            Mỗi khoản ủng hộ đều được liên kết với sổ tài chính công khai, luân chuyển hàng hóa và bằng chứng hiện trường.
          </Typography>
        </Stack>
      <QueryState isLoading={campaigns.isLoading} error={campaigns.error} empty={!campaigns.data?.data.length} refetch={campaigns.refetch}>
        <Grid container spacing={2.5}>
          {campaigns.data?.data.map((campaign) => {
            const progress = campaign.stats?.progressPct ?? (campaign.targetAmount ? (campaign.currentAmount / campaign.targetAmount) * 100 : 0);
            return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={campaign.id}>
                <Card
                  variant="outlined"
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    borderRadius: "var(--radius-panel)",
                    borderColor: pageTheme.line,
                    bgcolor: pageTheme.panel,
                    color: pageTheme.text,
                    boxShadow: "none",
                    transition: "transform var(--transition-ui), box-shadow var(--transition-ui), border-color var(--transition-ui)",
                    "&:hover": { transform: "translateY(-2px)", boxShadow: "var(--shadow-surface-hover)", borderColor: pageTheme.lineStrong },
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: { xs: 220, md: 238 },
                      overflow: "hidden",
                      bgcolor: pageTheme.panel,
                    }}
                  >
                    <CampaignMedia
                      src={campaign.coverImageUrl}
                      alt={campaign.name || "Chiến dịch cứu trợ lũ lụt"}
                      height={{ xs: 220, md: 238 }}
                    />
                  </Box>
                  <CardContent sx={{ flex: 1, p: { xs: 2.5, md: 3 } }}>
                    <Stack spacing={1.2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <StatusChip value={campaign.status} />
                        <Typography variant="caption" sx={{ color: pageTheme.faint, fontWeight: 700 }}>
                          Kết thúc {formatDate(campaign.endDate)}
                        </Typography>
                      </Stack>
                      <Typography variant="h6" fontWeight={800} sx={{ color: pageTheme.text, lineHeight: 1.3 }}>
                        {campaign.name}
                      </Typography>
                      <Typography sx={{ color: pageTheme.muted, lineHeight: 1.6 }}>{truncate(campaign.description, 130)}</Typography>
                      <Box>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography fontWeight={800}>{formatMoney(campaign.currentAmount)}</Typography>
                          <Typography sx={{ color: pageTheme.muted }}>{percent(progress)}</Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(progress, 100)}
                          sx={{
                            mt: 1,
                            height: 8,
                            borderRadius: 999,
                            bgcolor: "var(--color-progress-track)",
                            "& .MuiLinearProgress-bar": { bgcolor: "var(--color-progress-fill)" },
                          }}
                        />
                        <Typography variant="caption" sx={{ color: pageTheme.faint }}>
                          Mục tiêu {formatMoney(campaign.targetAmount)}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ p: { xs: 2.5, md: 3 }, pt: 0, gap: 1 }}>
                    <Button
                      component={Link}
                      to={`/campaigns/${campaign.id}`}
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        minHeight: 44,
                        borderRadius: 2,
                        px: 2,
                        color: pageTheme.waterSoft,
                        fontWeight: 800,
                        "&:hover": { bgcolor: pageTheme.panel, color: pageTheme.text },
                        "&:focus-visible": { outline: `3px solid ${pageTheme.waterSoft}`, outlineOffset: 3 },
                      }}
                    >
                      Xem
                    </Button>
                    <Button
                      component={Link}
                      to={`/donor/donate/${campaign.id}`}
                      variant="contained"
                      sx={{
                        minHeight: 44,
                        borderRadius: 2,
                        px: 2.5,
                        bgcolor: pageTheme.amber,
                        color: pageTheme.amberInk,
                        fontWeight: 800,
                        boxShadow: "none",
                        "&:hover": { bgcolor: pageTheme.amberHover, color: pageTheme.amberInk },
                        "&:focus-visible": { outline: `3px solid ${pageTheme.waterSoft}`, outlineOffset: 3 },
                      }}
                    >
                      Ủng hộ
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </QueryState>
      </Box>
    </Box>
  );
}
