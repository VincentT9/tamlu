import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Box, Button, Card, CardActions, CardContent, CardMedia, Grid, LinearProgress, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { donationApi } from "@/features/donations/api";
import { formatDate, formatMoney, percent, truncate } from "@/shared/utils/format";
import { QueryState } from "@/shared/ui/QueryState";
import { StatusChip } from "@/shared/ui/StatusChip";

const pageTheme = {
  bg: "#031014",
  panel: "rgba(6,26,34,.86)",
  panelSoft: "rgba(255,255,255,.045)",
  line: "rgba(103,232,249,.18)",
  lineStrong: "rgba(45,212,191,.34)",
  text: "#f7fdff",
  muted: "rgba(224,247,250,.66)",
  faint: "rgba(224,247,250,.48)",
  water: "#2dd4bf",
  waterSoft: "#67e8f9",
  amber: "#f5b85b",
  amberHover: "#ffd07a",
  amberInk: "#102126",
};

export function CampaignListPage() {
  const campaigns = useQuery({
    queryKey: ["public-campaigns"],
    queryFn: () => donationApi.publicCampaigns({ page: 1, limit: 12 }),
  });

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
          `radial-gradient(circle at 78% 0%, rgba(45,212,191,.18), transparent 30%), linear-gradient(180deg, ${pageTheme.bg} 0%, #04181d 100%)`,
        "& .MuiSkeleton-root": {
          bgcolor: "rgba(45,212,191,.10)",
          backgroundImage: "linear-gradient(90deg, rgba(45,212,191,.08), rgba(103,232,249,.18), rgba(45,212,191,.08))",
        },
        "& .MuiAlert-root": {
          borderRadius: 4,
          bgcolor: "rgba(127,29,29,.22)",
          color: pageTheme.text,
          border: "1px solid rgba(248,113,113,.28)",
        },
      }}
    >
      <Box sx={{ mx: "auto", maxWidth: 1500 }}>
        <Stack spacing={1.4} sx={{ mb: { xs: 3, md: 4 }, maxWidth: 820 }}>
          <Typography sx={{ color: pageTheme.waterSoft, fontSize: 13, fontWeight: 950, letterSpacing: ".12em", textTransform: "uppercase" }}>
            Public Donation Portal
          </Typography>
          <Typography component="h1" sx={{ fontSize: { xs: 34, md: 52 }, lineHeight: 1, fontWeight: 950, letterSpacing: "-.035em" }}>
            Active flood relief campaigns
          </Typography>
          <Typography sx={{ color: pageTheme.muted, fontSize: { xs: 16, md: 18 }, lineHeight: 1.65 }}>
            Every donation is connected to public financial ledgers, inventory movement, and field evidence.
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
                    borderRadius: 5,
                    borderColor: pageTheme.line,
                    bgcolor: pageTheme.panel,
                    color: pageTheme.text,
                    boxShadow: "0 24px 80px rgba(0,0,0,.28)",
                    backdropFilter: "blur(18px)",
                  }}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={campaign.coverImageUrl || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"}
                    alt={campaign.name}
                    sx={{
                      bgcolor: "rgba(103,232,249,.10)",
                      objectFit: "cover",
                      filter: "saturate(.78) contrast(1.03)",
                    }}
                  />
                  <CardContent sx={{ flex: 1, p: { xs: 2.5, md: 3 } }}>
                    <Stack spacing={1.2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <StatusChip value={campaign.status} />
                        <Typography variant="caption" sx={{ color: pageTheme.faint, fontWeight: 700 }}>
                          Ends {formatDate(campaign.endDate)}
                        </Typography>
                      </Stack>
                      <Typography variant="h6" fontWeight={950} sx={{ color: pageTheme.text, lineHeight: 1.25 }}>
                        {campaign.name}
                      </Typography>
                      <Typography sx={{ color: pageTheme.muted, lineHeight: 1.6 }}>{truncate(campaign.description, 130)}</Typography>
                      <Box>
                        <Stack direction="row" justifyContent="space-between">
                          <Typography fontWeight={950}>{formatMoney(campaign.currentAmount)}</Typography>
                          <Typography sx={{ color: pageTheme.muted }}>{percent(progress)}</Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(progress, 100)}
                          sx={{
                            mt: 1,
                            height: 8,
                            borderRadius: 999,
                            bgcolor: "rgba(255,255,255,.12)",
                            "& .MuiLinearProgress-bar": { bgcolor: pageTheme.amber },
                          }}
                        />
                        <Typography variant="caption" sx={{ color: pageTheme.faint }}>
                          Target {formatMoney(campaign.targetAmount)}
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
                        borderRadius: 999,
                        px: 2,
                        color: pageTheme.waterSoft,
                        fontWeight: 900,
                        "&:hover": { bgcolor: "rgba(45,212,191,.12)", color: pageTheme.text },
                        "&:focus-visible": { outline: `3px solid ${pageTheme.waterSoft}`, outlineOffset: 3 },
                      }}
                    >
                      View
                    </Button>
                    <Button
                      component={Link}
                      to={`/donor/donate/${campaign.id}`}
                      variant="contained"
                      sx={{
                        minHeight: 44,
                        borderRadius: 999,
                        px: 2.5,
                        bgcolor: pageTheme.amber,
                        color: pageTheme.amberInk,
                        fontWeight: 950,
                        boxShadow: "0 14px 34px rgba(245,184,91,.20)",
                        "&:hover": { bgcolor: pageTheme.amberHover, color: pageTheme.amberInk },
                        "&:focus-visible": { outline: `3px solid ${pageTheme.waterSoft}`, outlineOffset: 3 },
                      }}
                    >
                      Donate
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
