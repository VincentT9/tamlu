import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CampaignIcon from "@mui/icons-material/Campaign";
import FavoriteIcon from "@mui/icons-material/Favorite";
import GroupsIcon from "@mui/icons-material/Groups";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import SosIcon from "@mui/icons-material/Sos";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import { Box, Button, Chip, Grid, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { donationApi } from "@/features/donations/api";
import { formatMoney, percent } from "@/shared/utils/format";
import { QueryState } from "@/shared/ui/QueryState";
import { StatusChip } from "@/shared/ui/StatusChip";

const fallbackCampaignImage =
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=85";
const heroRescueImageUrl = "/images/flood-rescue-boat.png";

const reliefTheme = {
  bg: "#031014",
  frame: "#061a22",
  panel: "rgba(8,31,40,.78)",
  panelSoft: "rgba(255,255,255,.045)",
  line: "rgba(103,232,249,.16)",
  lineStrong: "rgba(45,212,191,.34)",
  text: "#f7fdff",
  muted: "rgba(224,247,250,.68)",
  faint: "rgba(224,247,250,.52)",
  water: "#2dd4bf",
  waterSoft: "#67e8f9",
  amber: "#f5b85b",
  amberHover: "#ffd07a",
  amberInk: "#102126",
  shadow: "rgba(45,212,191,.22)",
};

const reliefShape = {
  cardRadius: 5,
  compactRadius: 4,
  cardPadding: { xs: 3, md: 3.5 },
  compactPadding: { xs: 2.5, md: 3 },
};

const primaryButtonSx = {
  borderRadius: 999,
  bgcolor: reliefTheme.amber,
  color: reliefTheme.amberInk,
  fontWeight: 950,
  boxShadow: "0 14px 40px rgba(245,184,91,.22)",
  "&:hover": { bgcolor: reliefTheme.amberHover, color: reliefTheme.amberInk },
  "&:focus-visible": { outline: `3px solid ${reliefTheme.waterSoft}`, outlineOffset: 3 },
  "&:active": { transform: "translateY(1px)" },
  "&.Mui-disabled": { bgcolor: "rgba(245,184,91,.32)", color: "rgba(16,33,38,.76)" },
};

const secondaryButtonSx = {
  borderRadius: 999,
  bgcolor: "rgba(6,42,48,.88)",
  color: reliefTheme.text,
  border: `1px solid ${reliefTheme.lineStrong}`,
  fontWeight: 900,
  boxShadow: "none",
  "&:hover": { bgcolor: "rgba(45,212,191,.16)", borderColor: reliefTheme.waterSoft, color: reliefTheme.text },
  "&:focus-visible": { outline: `3px solid ${reliefTheme.waterSoft}`, outlineOffset: 3 },
  "&:active": { transform: "translateY(1px)" },
  "&.Mui-disabled": { bgcolor: "rgba(255,255,255,.06)", color: "rgba(247,253,255,.45)", borderColor: "rgba(255,255,255,.10)" },
};

const glassCardSx = {
  border: `1px solid ${reliefTheme.line}`,
  bgcolor: reliefTheme.panel,
  color: reliefTheme.text,
  boxShadow: "0 28px 80px rgba(0,0,0,.30)",
  backdropFilter: "blur(20px)",
  overflow: "visible",
};

export function LandingPage() {
  const campaigns = useQuery({ queryKey: ["landing-campaigns"], queryFn: () => donationApi.publicCampaigns({ page: 1, limit: 3 }) });
  const totals = campaigns.data?.data.reduce(
    (acc, campaign) => ({ raised: acc.raised + campaign.currentAmount, target: acc.target + campaign.targetAmount }),
    { raised: 0, target: 0 },
  );
  const progress = totals?.target ? Math.min((totals.raised / totals.target) * 100, 100) : 0;
  const featuredCampaign = campaigns.data?.data[0];
  const donateHref = featuredCampaign ? `/donor/donate/${featuredCampaign.id}` : "/campaigns";

  const heroStats = [
    { value: "230+", label: "families reached this season", icon: <GroupsIcon fontSize="small" /> },
    { value: campaigns.data?.totalCount ?? 0, label: "verified relief campaigns", icon: <ShieldOutlinedIcon fontSize="small" /> },
  ];

  const metrics = [
    { value: "18k+", label: "people helped", detail: "Rescue, food, shelter, and recovery support", icon: <WaterDropIcon /> },
    { value: percent(progress), label: "funding progress", detail: `${formatMoney(totals?.raised)} publicly tracked`, icon: <ReceiptLongIcon /> },
    { value: "98%", label: "verified delivery rate", detail: "Evidence-backed relief movement", icon: <LocalShippingIcon /> },
  ];

  const reliefServices = [
    { title: "Emergency Rescue", text: "Verified SOS context helps teams prioritize people in immediate danger.", icon: <SosIcon /> },
    { title: "Food And Shelter", text: "Campaigns coordinate meals, clean water, blankets, and safe temporary housing.", icon: <Inventory2Icon /> },
    { title: "Medical Aid", text: "Urgent medicine, hygiene kits, and field-care requests stay visible to coordinators.", icon: <MedicalServicesIcon /> },
    { title: "Rebuilding Homes", text: "Recovery funds support families as they repair homes and restart daily life.", icon: <VolunteerActivismIcon /> },
  ];

  const partners = ["Local Response", "Rescue Unit", "Shelter Network", "Medical Aid", "Volunteer Corps"];

  return (
    <Box
      sx={{
        bgcolor: reliefTheme.bg,
        color: reliefTheme.text,
        px: { xs: 1.5, md: 2.5 },
        pb: { xs: 1.5, md: 2.5 },
      }}
    >
      <Box
        sx={{
          mx: "auto",
          maxWidth: 1500,
          overflow: "hidden",
          borderRadius: { xs: 4, md: 7 },
          border: `1px solid ${reliefTheme.lineStrong}`,
          background:
            `radial-gradient(circle at 62% 12%, ${reliefTheme.shadow}, transparent 28%), linear-gradient(180deg, ${reliefTheme.frame} 0%, ${reliefTheme.bg} 100%)`,
          boxShadow: "0 0 0 1px rgba(255,255,255,.035), 0 40px 140px rgba(0,0,0,.56)",
        }}
      >
        <Box
          component="section"
          sx={{
            minHeight: { xs: "calc(100dvh - 88px)", lg: "calc(100dvh - 104px)" },
            px: { xs: 2, sm: 3, md: 6, lg: 8 },
            pt: { xs: 7, md: 9, lg: 10 },
            pb: { xs: 7, md: 9, lg: 10 },
            position: "relative",
            overflow: "hidden",
            display: "grid",
            alignItems: "center",
          }}
        >
          <Box
            component="img"
            src={heroRescueImageUrl}
            alt="Rescue team evacuating residents from floodwaters"
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: { xs: "43% 50%", md: "44% 50%", xl: "42% 50%" },
              opacity: 1,
              filter: "saturate(.76) contrast(1.02) brightness(.9)",
              transform: { xs: "scale(1.72)", md: "scale(1.06)" },
              transformOrigin: { xs: "43% 50%", md: "44% 50%" },
            }}
          />
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 56% 48%, rgba(3,16,20,.10) 0%, rgba(3,16,20,.24) 35%, rgba(3,16,20,.72) 73%, rgba(3,16,20,.97) 100%), linear-gradient(90deg, rgba(3,16,20,.98) 0%, rgba(3,16,20,.84) 37%, rgba(3,16,20,.48) 66%, rgba(3,16,20,.78) 100%), linear-gradient(180deg, rgba(3,16,20,.72) 0%, rgba(3,16,20,.22) 46%, rgba(3,16,20,.98) 100%)",
            }}
          />
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              inset: { xs: "18% -42% auto 12%", md: "6% -18% auto 30%" },
              height: { xs: 360, md: 640 },
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(45,212,191,.38) 0%, rgba(103,232,249,.14) 34%, transparent 68%)",
              filter: "blur(18px)",
            }}
          />
          <Grid container spacing={{ xs: 4, lg: 6 }} alignItems="center" sx={{ position: "relative", zIndex: 1, width: "100%" }}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Stack spacing={3} sx={{ maxWidth: 720 }}>
                <Chip
                  icon={<ShieldOutlinedIcon />}
                  label="Verified flood relief campaign"
                  sx={{
                    alignSelf: "flex-start",
                    border: "1px solid rgba(255,255,255,.16)",
                    bgcolor: "rgba(255,255,255,.07)",
                    color: reliefTheme.text,
                    fontWeight: 800,
                    "& .MuiChip-icon": { color: reliefTheme.waterSoft },
                  }}
                />
                <Box>
                  <Typography
                    component="h1"
                    sx={{
                      fontSize: { xs: 48, sm: 66, md: 82, xl: 96 },
                      lineHeight: { xs: .95, md: .9 },
                      letterSpacing: "-0.04em",
                      fontWeight: 950,
                      color: reliefTheme.text,
                    }}
                  >
                    Together We
                    <Box component="span" sx={{ display: "block" }}>
                      Rebuild After
                    </Box>
                    <Box component="span" sx={{ display: "block", color: reliefTheme.waterSoft }}>
                      The Flood
                    </Box>
                  </Typography>
                </Box>
                <Typography sx={{ maxWidth: 560, color: reliefTheme.muted, fontSize: { xs: 16, md: 18 }, lineHeight: 1.7 }}>
                  Your donation helps verified rescue teams, shelters, and volunteers move urgent aid to families with transparent public records.
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button
                    component={Link}
                    to="/campaigns"
                    size="large"
                    variant="outlined"
                    sx={{
                      minHeight: 52,
                      px: 3,
                      ...secondaryButtonSx,
                    }}
                  >
                    See our work
                  </Button>
                  <Button
                    component={Link}
                    to={donateHref}
                    size="large"
                    variant="contained"
                    startIcon={<FavoriteIcon />}
                    sx={{
                      minHeight: 52,
                      px: 3,
                      ...primaryButtonSx,
                    }}
                  >
                    Donate now
                  </Button>
                </Stack>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box sx={{ position: "relative", minHeight: { xs: 430, md: 560 } }}>
                <Stack spacing={1.75} sx={{ position: "absolute", right: { xs: 0, sm: 8, md: 0 }, top: { xs: 0, md: "50%" }, width: { xs: "100%", sm: 276, md: 296 }, maxWidth: { xs: "100%", sm: 296 }, ml: "auto", transform: { md: "translateY(-50%)" } }}>
                  {heroStats.map((item) => (
                    <Paper
                      key={item.label}
                      sx={{
                        ...glassCardSx,
                        borderRadius: reliefShape.compactRadius,
                        p: reliefShape.compactPadding,
                        minHeight: 122,
                        bgcolor: "rgba(6,26,34,.78)",
                        borderColor: "rgba(103,232,249,.22)",
                        boxShadow: "0 24px 90px rgba(0,0,0,.36)",
                      }}
                    >
                      <Stack spacing={1.25} alignItems="center" textAlign="center">
                        <Box sx={{ display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: 2, bgcolor: "rgba(45,212,191,.14)", color: reliefTheme.waterSoft }}>
                          {item.icon}
                        </Box>
                        <Typography sx={{ fontSize: 36, lineHeight: 1, fontWeight: 950 }}>{item.value}</Typography>
                        <Typography sx={{ color: reliefTheme.faint, fontSize: 13, lineHeight: 1.45 }}>{item.label}</Typography>
                      </Stack>
                    </Paper>
                  ))}
                  <Paper
                    sx={{
                      ...glassCardSx,
                      borderRadius: reliefShape.compactRadius,
                      p: reliefShape.compactPadding,
                      bgcolor: "rgba(6,26,34,.82)",
                      borderColor: "rgba(103,232,249,.24)",
                      boxShadow: "0 24px 90px rgba(0,0,0,.38)",
                    }}
                  >
                    <Stack spacing={1.4} alignItems="center" textAlign="center">
                      <Typography sx={{ fontSize: 13, color: reliefTheme.faint }}>Relief funding tracked</Typography>
                      <Typography sx={{ fontSize: { xs: 24, sm: 28 }, lineHeight: 1.08, fontWeight: 950, overflowWrap: "anywhere" }}>{formatMoney(totals?.raised)}</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 7,
                          borderRadius: 999,
                          bgcolor: "rgba(255,255,255,.14)",
                          width: "100%",
                          "& .MuiLinearProgress-bar": { bgcolor: reliefTheme.amber },
                        }}
                      />
                      <Button
                        component={Link}
                        to={donateHref}
                        variant="contained"
                        size="small"
                        sx={{ ...primaryButtonSx, minHeight: 40, width: "100%" }}
                      >
                        Donate now
                      </Button>
                    </Stack>
                  </Paper>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={1.5} sx={{ px: { xs: 2, sm: 3, md: 6, lg: 8 }, pt: { xs: 5, md: 7 }, pb: { xs: 5, md: 8 }, bgcolor: reliefTheme.bg }}>
          {metrics.map((item) => (
            <Grid size={{ xs: 12, md: 4 }} key={item.label}>
              <Paper
                sx={{
                  height: "100%",
                  p: reliefShape.compactPadding,
                  borderRadius: reliefShape.compactRadius,
                  border: `1px solid ${reliefTheme.line}`,
                  bgcolor: reliefTheme.panelSoft,
                  color: reliefTheme.text,
                  boxShadow: "none",
                }}
              >
                <Stack spacing={1.25}>
                  <Box sx={{ display: "grid", placeItems: "center", width: 42, height: 42, borderRadius: 2.5, bgcolor: "rgba(45,212,191,.12)", color: reliefTheme.waterSoft }}>
                    {item.icon}
                  </Box>
                  <Typography sx={{ fontSize: { xs: 34, md: 42 }, fontWeight: 950, lineHeight: 1 }}>{item.value}</Typography>
                  <Typography sx={{ fontWeight: 900 }}>{item.label}</Typography>
                  <Typography sx={{ color: reliefTheme.faint, lineHeight: 1.55 }}>{item.detail}</Typography>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ px: { xs: 2, sm: 3, md: 6, lg: 8 }, py: { xs: 5, md: 8 } }}>
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <Chip label="Our mission" sx={{ mb: 2, bgcolor: "rgba(45,212,191,.14)", color: reliefTheme.waterSoft, fontWeight: 900 }} />
              <Typography sx={{ fontSize: { xs: 34, md: 52 }, lineHeight: 1.03, fontWeight: 950, letterSpacing: "-0.035em" }}>
                We help communities <Box component="span" sx={{ color: reliefTheme.waterSoft }}>rescue</Box>, <Box component="span" sx={{ color: reliefTheme.waterSoft }}>recover</Box>, and <Box component="span" sx={{ color: reliefTheme.waterSoft }}>rebuild</Box> with public trust at the center.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography sx={{ color: reliefTheme.muted, fontSize: { xs: 17, md: 20 }, lineHeight: 1.75 }}>
                Tam Lu connects donations to urgent field needs through verified campaigns, public ledgers, delivery evidence, and partner coordination. Supporters see how help moves. Operators see what still needs action. Families see a path back to safety.
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ px: { xs: 2, sm: 3, md: 6, lg: 8 }, py: { xs: 5, md: 8 } }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 7 }}>
              <Paper
                sx={{
                  height: "100%",
                  minHeight: 430,
                  p: reliefShape.cardPadding,
                  borderRadius: reliefShape.cardRadius,
                  border: `1px solid ${reliefTheme.line}`,
                  bgcolor: "linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.04))",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,.085), rgba(255,255,255,.035))",
                  color: reliefTheme.text,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <Stack spacing={2} sx={{ maxWidth: 520, position: "relative", zIndex: 1 }}>
                  <Typography sx={{ color: reliefTheme.faint, fontWeight: 800 }}>Operating with local relief partners</Typography>
                  <Typography sx={{ fontSize: { xs: 28, md: 40 }, lineHeight: 1.06, fontWeight: 950 }}>
                    Support families in flood-affected communities with accountable aid.
                  </Typography>
                  <Button
                    component={Link}
                    to={donateHref}
                    variant="contained"
                    sx={{ alignSelf: "flex-start", ...primaryButtonSx }}
                  >
                    Support now
                  </Button>
                </Stack>
                <Box
                  role="img"
                  aria-label="Relief supply handoff with calm water light and recovery glow"
                  sx={{
                    position: "absolute",
                    left: { xs: 18, md: 32 },
                    right: { xs: 18, md: 32 },
                    bottom: { xs: 18, md: 28 },
                    width: "auto",
                    height: { xs: 190, md: 230 },
                    borderRadius: 4,
                    boxShadow: "0 26px 80px rgba(0,0,0,.48)",
                    background:
                      "radial-gradient(circle at 25% 28%, rgba(245,184,91,.48), transparent 18%), radial-gradient(circle at 72% 42%, rgba(103,232,249,.18), transparent 20%), linear-gradient(135deg, rgba(45,212,191,.20), rgba(3,16,20,.96) 58%), repeating-linear-gradient(90deg, rgba(103,232,249,.08) 0 1px, transparent 1px 34px)",
                    overflow: "hidden",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: "12%",
                      bottom: "24%",
                      width: "76%",
                      height: "30%",
                      borderRadius: 3,
                      background: "linear-gradient(90deg, rgba(255,255,255,.10), rgba(45,212,191,.28), rgba(245,184,91,.18))",
                      border: "1px solid rgba(255,255,255,.12)",
                    },
                  }}
                />
                <Box aria-hidden="true" sx={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 80%, rgba(45,212,191,.20), transparent 38%)" }} />
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, lg: 5 }}>
              <Stack spacing={2}>
                <Paper sx={{ ...glassCardSx, p: { xs: 2.5, md: 3 }, borderRadius: 5 }}>
                  <Typography sx={{ color: reliefTheme.faint, fontWeight: 800 }}>Families supported through verified campaigns</Typography>
                  <Typography sx={{ mt: 1, fontSize: { xs: 64, md: 92 }, lineHeight: 1, fontWeight: 950 }}>500+</Typography>
                  <Typography sx={{ mt: 1.5, color: reliefTheme.amberHover, letterSpacing: 1 }}>★★★★★</Typography>
                </Paper>
                <Paper sx={{ ...glassCardSx, p: { xs: 2.5, md: 3 }, borderRadius: 5 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      aria-label="Relief volunteer avatar"
                      role="img"
                      sx={{
                        display: "grid",
                        width: 78,
                        height: 96,
                        flex: "0 0 auto",
                        placeItems: "center",
                        borderRadius: reliefShape.compactRadius,
                        bgcolor: "rgba(45,212,191,.14)",
                        color: reliefTheme.waterSoft,
                        fontWeight: 950,
                        fontSize: 24,
                        border: "1px solid rgba(255,255,255,.12)",
                      }}
                    >
                      MT
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 18, lineHeight: 1.45, fontWeight: 800 }}>
                        "People donated, and we could see supplies arrive. That gave our neighborhood hope."
                      </Typography>
                      <Typography sx={{ mt: 1, color: reliefTheme.faint, fontSize: 13 }}>
                        Mai Tran, community volunteer
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ px: { xs: 2, sm: 3, md: 6, lg: 8 }, py: { xs: 4, md: 6 }, borderTop: `1px solid ${reliefTheme.line}`, borderBottom: `1px solid ${reliefTheme.line}` }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography sx={{ color: reliefTheme.faint, fontWeight: 800, maxWidth: 210 }}>
                Supported by our partner organizations
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 9 }}>
              <Grid container spacing={1.5}>
                {partners.map((partner) => (
                  <Grid size={{ xs: 6, sm: 4, md: 2.4 }} key={partner}>
                    <Box
                      sx={{
                        display: "grid",
                        minHeight: 62,
                        placeItems: "center",
                        borderRadius: 3,
                        border: `1px solid ${reliefTheme.line}`,
                        color: "rgba(224,247,250,.55)",
                        fontWeight: 950,
                        letterSpacing: ".01em",
                      }}
                    >
                      {partner}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Box>

        <Box id="our-work" sx={{ px: { xs: 2, sm: 3, md: 6, lg: 8 }, py: { xs: 6, md: 9 } }}>
          <Stack spacing={2} sx={{ maxWidth: 720, mb: 4 }}>
            <Chip label="Relief services" sx={{ alignSelf: "flex-start", bgcolor: "rgba(45,212,191,.14)", color: reliefTheme.waterSoft, fontWeight: 900 }} />
            <Typography sx={{ fontSize: { xs: 38, md: 60 }, lineHeight: 1, fontWeight: 950, letterSpacing: "-0.04em" }}>
              End-to-end support for the first hours and the long recovery.
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            {reliefServices.map((service, index) => (
              <Grid size={{ xs: 12, md: 6, xl: 3 }} key={service.title}>
                <Paper
                  sx={{
                    height: "100%",
                    p: reliefShape.cardPadding,
                    borderRadius: reliefShape.cardRadius,
                    minHeight: { xs: 184, md: 196 },
                    border: `1px solid ${reliefTheme.line}`,
                    bgcolor: index === 0 ? "rgba(45,212,191,.10)" : reliefTheme.panelSoft,
                    color: reliefTheme.text,
                    boxShadow: "none",
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box sx={{ display: "grid", placeItems: "center", width: 46, height: 46, borderRadius: 3, bgcolor: "rgba(45,212,191,.12)", color: reliefTheme.waterSoft }}>
                        {service.icon}
                      </Box>
                      <Typography sx={{ color: "rgba(255,255,255,.28)", fontWeight: 950 }}>{String(index + 1).padStart(2, "0")}</Typography>
                    </Stack>
                    <Typography sx={{ fontSize: 24, fontWeight: 950 }}>{service.title}</Typography>
                    <Typography sx={{ color: reliefTheme.faint, lineHeight: 1.65 }}>{service.text}</Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box id="donate" sx={{ px: { xs: 2, sm: 3, md: 6, lg: 8 }, pb: { xs: 6, md: 9 } }}>
          <Paper
            sx={{
              p: reliefShape.cardPadding,
              borderRadius: reliefShape.cardRadius,
              border: `1px solid ${reliefTheme.line}`,
              bgcolor: reliefTheme.panelSoft,
              color: reliefTheme.text,
              boxShadow: "none",
            }}
          >
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2.5} alignItems={{ md: "center" }}>
              <Box>
                <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 950, lineHeight: 1.1 }}>Active flood relief campaigns</Typography>
                <Typography sx={{ mt: 1, color: "rgba(255,255,255,.62)", maxWidth: 650 }}>
                  Choose a campaign, review its public ledger, and support the response with confidence.
                </Typography>
              </Box>
              <Button component={Link} to="/campaigns" endIcon={<ArrowForwardIcon />} sx={{ alignSelf: { xs: "stretch", md: "center" }, borderRadius: 999, color: reliefTheme.waterSoft, fontWeight: 950 }}>
                View all campaigns
              </Button>
            </Stack>
            <Box sx={{ mt: 3 }}>
              <QueryState
                isLoading={campaigns.isLoading}
                error={campaigns.error}
                empty={!campaigns.data?.data.length}
                emptyTitle="No active campaigns yet"
                emptyText="Verified campaigns will appear here when coordinators publish them."
                refetch={campaigns.refetch}
              >
                <Grid container spacing={2}>
                  {campaigns.data?.data.map((campaign) => {
                    const campaignProgress = campaign.stats?.progressPct ?? (campaign.targetAmount ? (campaign.currentAmount / campaign.targetAmount) * 100 : 0);
                    return (
                      <Grid size={{ xs: 12, md: 4 }} key={campaign.id}>
                        <Paper
                          sx={{
                            height: "100%",
                            overflow: "hidden",
                            borderRadius: reliefShape.cardRadius,
                            border: `1px solid ${reliefTheme.line}`,
                            bgcolor: "rgba(3,16,20,.72)",
                            color: reliefTheme.text,
                            boxShadow: "none",
                          }}
                        >
                          <Box
                            role="img"
                            aria-label={campaign.name}
                            sx={{
                              width: "100%",
                              height: 180,
                              backgroundImage:
                                `linear-gradient(180deg, rgba(3,16,20,.10), rgba(3,16,20,.72)), url(${campaign.coverImageUrl || fallbackCampaignImage})`,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          />
                          <Stack spacing={1.75} sx={{ p: reliefShape.cardPadding }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <StatusChip value={campaign.status} />
                              <Typography variant="caption" sx={{ color: reliefTheme.faint }}>{percent(campaignProgress)}</Typography>
                            </Stack>
                            <Box>
                              <Typography fontWeight={950}>{campaign.name}</Typography>
                              <Typography variant="body2" sx={{ color: reliefTheme.faint }}>{campaign.affectedArea}</Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(campaignProgress, 100)}
                              sx={{ height: 7, borderRadius: 999, bgcolor: "rgba(255,255,255,.12)", "& .MuiLinearProgress-bar": { bgcolor: reliefTheme.amber } }}
                            />
                            <Stack direction="row" justifyContent="space-between" spacing={1}>
                              <Typography fontWeight={950}>{formatMoney(campaign.currentAmount)}</Typography>
                              <Typography variant="body2" sx={{ color: reliefTheme.faint }}>Target {formatMoney(campaign.targetAmount)}</Typography>
                            </Stack>
                            <Button component={Link} to={`/campaigns/${campaign.id}`} variant="contained" fullWidth sx={{ ...secondaryButtonSx, minHeight: 46 }}>
                              Open campaign
                            </Button>
                            <Button component={Link} to={`/donor/donate/${campaign.id}`} variant="contained" fullWidth sx={{ ...primaryButtonSx, minHeight: 46 }}>
                              Donate now
                            </Button>
                          </Stack>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </QueryState>
            </Box>
          </Paper>
        </Box>

        <Box id="contact" sx={{ px: { xs: 2, sm: 3, md: 6, lg: 8 }, pb: { xs: 6, md: 8 } }}>
          <Paper
            sx={{
              p: { xs: 3.25, md: 5 },
              borderRadius: reliefShape.cardRadius,
              border: `1px solid ${reliefTheme.lineStrong}`,
              background: "linear-gradient(135deg, rgba(45,212,191,.15), rgba(255,255,255,.045) 48%, rgba(245,184,91,.08))",
              color: reliefTheme.text,
              boxShadow: "none",
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography sx={{ fontSize: { xs: 34, md: 54 }, lineHeight: 1, fontWeight: 950, letterSpacing: "-0.04em" }}>
                  Help turns faster when communities act together.
                </Typography>
                <Typography sx={{ mt: 2, color: reliefTheme.muted, maxWidth: 700, lineHeight: 1.7 }}>
                  Donate, volunteer, or share a verified campaign so rescue teams and relief coordinators can focus on the people waiting for support.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={1.5}>
                  <Button component={Link} to={donateHref} variant="contained" size="large" startIcon={<FavoriteIcon />} sx={primaryButtonSx}>
                    Donate now
                  </Button>
                  <Button
                    component={Link}
                    to="/citizen/volunteer-profile"
                    variant="outlined"
                    size="large"
                    startIcon={<CampaignIcon />}
                    sx={{
                      ...secondaryButtonSx,
                    }}
                  >
                    Join relief effort
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
