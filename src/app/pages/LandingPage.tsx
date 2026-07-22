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
const heroRescueImageUrl = "/images/flood-family-rescue.png";

const reliefTheme = {
  bg: "var(--color-cream-50)",
  frame: "var(--color-cream-50)",
  panel: "var(--color-surface)",
  panelSoft: "var(--color-green-50)",
  creamPanel: "var(--color-cream-100)",
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
  shadow: "rgba(37,77,9,.08)",
};

const reliefShape = {
  cardRadius: 3,
  compactRadius: 2.5,
  cardPadding: { xs: 3, md: 3.5 },
  compactPadding: { xs: 2.5, md: 3 },
};

const primaryButtonSx = {
  borderRadius: 2,
  bgcolor: reliefTheme.amber,
  color: reliefTheme.amberInk,
  fontWeight: 950,
  border: `1px solid ${reliefTheme.lineStrong}`,
  boxShadow: "none",
  "&:hover": { bgcolor: reliefTheme.amberHover, color: reliefTheme.amberInk, borderColor: reliefTheme.text },
  "&:focus-visible": { outline: `3px solid ${reliefTheme.waterSoft}`, outlineOffset: 3 },
  "&:active": { transform: "translateY(1px)" },
  "&.Mui-disabled": { bgcolor: "var(--color-green-200)", color: "var(--color-text-muted)" },
};

const secondaryButtonSx = {
  borderRadius: 2,
  bgcolor: "#ffffff",
  color: reliefTheme.text,
  border: `1px solid ${reliefTheme.lineStrong}`,
  fontWeight: 900,
  boxShadow: "none",
  "&:hover": { bgcolor: reliefTheme.panel, borderColor: reliefTheme.waterSoft, color: reliefTheme.text },
  "&:focus-visible": { outline: `3px solid ${reliefTheme.waterSoft}`, outlineOffset: 3 },
  "&:active": { transform: "translateY(1px)" },
  "&.Mui-disabled": { bgcolor: "#ffffff", color: "var(--color-text-muted)", borderColor: "var(--color-border)" },
};

const glassCardSx = {
  border: `1px solid ${reliefTheme.line}`,
  bgcolor: reliefTheme.panel,
  color: reliefTheme.text,
  boxShadow: "none",
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
    { value: "230+", label: "hộ gia đình được kết nối hỗ trợ trong mùa lũ", icon: <GroupsIcon fontSize="small" /> },
    { value: campaigns.data?.totalCount ?? 0, label: "chiến dịch cứu trợ có thông tin xác minh", icon: <ShieldOutlinedIcon fontSize="small" /> },
  ];

  const metrics = [
    { value: "18k+", label: "người dân được hỗ trợ", detail: "Cứu hộ, nhu yếu phẩm, nơi trú tạm và phục hồi sinh kế", icon: <WaterDropIcon /> },
    { value: percent(progress), label: "tiến độ gây quỹ", detail: `${formatMoney(totals?.raised)} được công khai theo dõi`, icon: <ReceiptLongIcon /> },
    { value: "98%", label: "tỷ lệ bàn giao xác minh", detail: "Dòng cứu trợ có chứng từ và bằng chứng hiện trường", icon: <LocalShippingIcon /> },
  ];

  const topPageSections = [
    {
      title: "Về Tâm Lũ",
      text: "Nền tảng công khai phục vụ điều phối cứu hộ, chiến dịch minh bạch và phục hồi cộng đồng sau thiên tai.",
      action: "Xem sứ mệnh",
      to: "/#mission",
      icon: <ShieldOutlinedIcon />,
    },
    {
      title: "Hoạt động cứu trợ",
      text: "Kết nối đội phản ứng, tình nguyện viên, nhu yếu phẩm và điểm trú tạm đến đúng khu vực bị ảnh hưởng.",
      action: "Xem hoạt động",
      to: "/campaigns",
      icon: <VolunteerActivismIcon />,
    },
    {
      title: "Biểu mẫu khẩn cấp",
      text: "Ghi nhận nhu cầu SOS, tình trạng hộ gia đình và thông tin hiện trường để điều phối nhanh hơn.",
      action: "Gửi yêu cầu",
      to: "/sos/new",
      icon: <SosIcon />,
    },
    {
      title: "Khu vực cứu trợ",
      text: "Theo dõi điểm phân phối, tuyến hỗ trợ và dữ liệu minh bạch trên bản đồ cứu trợ.",
      action: "Mở bản đồ",
      to: "/relief-map",
      icon: <LocalShippingIcon />,
    },
    {
      title: "Đồng hành",
      text: "Ủng hộ tài chính, đóng góp hiện vật hoặc đăng ký tình nguyện cho các chiến dịch đã xác minh.",
      action: "Đồng hành ngay",
      to: donateHref,
      icon: <FavoriteIcon />,
    },
  ];

  const reliefServices = [
    { title: "Cứu hộ khẩn cấp", text: "Thông tin SOS đã xác minh giúp đội cứu hộ ưu tiên đúng trường hợp nguy cấp.", icon: <SosIcon /> },
    { title: "Lương thực và nơi trú", text: "Chiến dịch điều phối suất ăn, nước sạch, chăn màn và điểm trú tạm an toàn.", icon: <Inventory2Icon /> },
    { title: "Hỗ trợ y tế", text: "Nhu cầu thuốc men, vật tư vệ sinh và chăm sóc hiện trường được chuyển tới điều phối viên.", icon: <MedicalServicesIcon /> },
    { title: "Tái thiết nhà cửa", text: "Nguồn phục hồi hỗ trợ gia đình sửa chữa nhà ở và ổn định đời sống sau lũ.", icon: <VolunteerActivismIcon /> },
  ];

  const partners = ["Đội phản ứng địa phương", "Lực lượng cứu hộ", "Mạng lưới trú tạm", "Hỗ trợ y tế", "Tình nguyện viên"];

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
          borderRadius: { xs: 3, md: 5 },
          border: `1px solid ${reliefTheme.lineStrong}`,
          background:
            `radial-gradient(circle at 62% 12%, ${reliefTheme.shadow}, transparent 28%), linear-gradient(180deg, ${reliefTheme.frame} 0%, ${reliefTheme.bg} 100%)`,
          boxShadow: "none",
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
            borderRadius: { xs: 3, md: 5 },
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
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
              objectPosition: { xs: "47% 50%", md: "53% 50%", xl: "55% 50%" },
              opacity: 1,
              filter: "saturate(.86) contrast(.98) brightness(1.06)",
              transform: { xs: "scale(1.48)", md: "scale(1.08)" },
              transformOrigin: { xs: "47% 50%", md: "53% 50%" },
            }}
          />
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 56% 48%, rgba(246,248,232,.08) 0%, rgba(246,248,232,.30) 42%, rgba(246,248,232,.82) 78%, rgba(246,248,232,.96) 100%), linear-gradient(90deg, rgba(246,248,232,.98) 0%, rgba(246,248,232,.88) 42%, rgba(246,248,232,.54) 68%, rgba(246,248,232,.84) 100%), linear-gradient(180deg, rgba(246,248,232,.80) 0%, rgba(246,248,232,.22) 46%, rgba(246,248,232,.96) 100%)",
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
                "radial-gradient(circle, rgba(247,249,216,.70) 0%, rgba(77,141,22,.08) 34%, transparent 68%)",
              filter: "blur(18px)",
            }}
          />
          <Grid container spacing={{ xs: 4, lg: 6 }} alignItems="center" sx={{ position: "relative", zIndex: 1, width: "100%" }}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Stack spacing={3} sx={{ maxWidth: 720 }}>
                <Chip
                  icon={<ShieldOutlinedIcon />}
                  label="Chiến dịch cứu trợ lũ lụt đã xác minh"
                  sx={{
                    alignSelf: "flex-start",
                    border: `1px solid ${reliefTheme.lineStrong}`,
                    bgcolor: reliefTheme.panel,
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
                    Kết nối
                    <Box component="span" sx={{ display: "block" }}>
                      yêu thương
                    </Box>
                    <Box component="span" sx={{ display: "block", color: reliefTheme.waterSoft }}>
                      cứu trợ sau lũ
                    </Box>
                  </Typography>
                </Box>
                <Typography sx={{ maxWidth: 560, color: reliefTheme.muted, fontSize: { xs: 16, md: 18 }, lineHeight: 1.7 }}>
                  Tâm Lũ kết nối cộng đồng với các chiến dịch cứu trợ đã xác minh, giúp nguồn lực khẩn cấp đến đúng gia đình cần hỗ trợ và được theo dõi bằng hồ sơ công khai.
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
                    Xem chiến dịch
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
                    Đồng hành ngay
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
                        bgcolor: reliefTheme.panel,
                        borderColor: reliefTheme.lineStrong,
                        boxShadow: "none",
                      }}
                    >
                      <Stack spacing={1.25} alignItems="center" textAlign="center">
                        <Box sx={{ display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: 1.5, bgcolor: "#ffffff", color: reliefTheme.waterSoft }}>
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
                      bgcolor: reliefTheme.panel,
                      borderColor: reliefTheme.lineStrong,
                      boxShadow: "none",
                    }}
                  >
                    <Stack spacing={1.4} alignItems="center" textAlign="center">
                      <Typography sx={{ fontSize: 13, color: reliefTheme.faint }}>Nguồn quỹ cứu trợ được công khai</Typography>
                      <Typography sx={{ fontSize: { xs: 24, sm: 28 }, lineHeight: 1.08, fontWeight: 950, overflowWrap: "anywhere" }}>{formatMoney(totals?.raised)}</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 7,
                          borderRadius: 999,
                          bgcolor: "var(--color-progress-track)",
                          width: "100%",
                          "& .MuiLinearProgress-bar": { bgcolor: "var(--color-progress-fill)" },
                        }}
                      />
                      <Button
                        component={Link}
                        to={donateHref}
                        variant="contained"
                        size="small"
                        sx={{ ...primaryButtonSx, minHeight: 40, width: "100%" }}
                      >
                        Đồng hành ngay
                      </Button>
                    </Stack>
                  </Paper>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box
          sx={{
            px: { xs: 2, sm: 3, md: 6, lg: 8 },
            py: { xs: 5, md: 7 },
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              inset: 0,
              opacity: .1,
              backgroundImage: `url(${heroRescueImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "55% 50%",
            }}
          />
          <Typography
            sx={{
              position: "relative",
              zIndex: 1,
              mb: { xs: 1.5, md: 2 },
              fontSize: 13,
              fontWeight: 950,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              color: reliefTheme.faint,
            }}
          >
            Cổng thông tin cứu trợ cộng đồng
          </Typography>
          <Grid container spacing={1.5} sx={{ position: "relative", zIndex: 1, width: "100%", mb: { xs: 1.5, md: 2.5 } }}>
            {topPageSections.map((item) => (
              <Grid size={{ xs: 12, sm: 6, lg: 2.4 }} key={item.title}>
                <Paper
                  sx={{
                    height: "100%",
                    p: { xs: 2.25, md: 2.5 },
                    borderRadius: reliefShape.compactRadius,
                    border: `1px solid ${reliefTheme.line}`,
                    bgcolor: "var(--color-green-50)",
                    color: reliefTheme.text,
                    boxShadow: "none",
                  }}
                >
                  <Stack spacing={1.25} sx={{ height: "100%" }}>
                    <Box sx={{ display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 2, bgcolor: "#ffffff", color: reliefTheme.waterSoft }}>
                      {item.icon}
                    </Box>
                    <Typography sx={{ fontSize: 19, fontWeight: 950, lineHeight: 1.15 }}>{item.title}</Typography>
                    <Typography sx={{ color: reliefTheme.faint, lineHeight: 1.55, flex: 1 }}>{item.text}</Typography>
                    <Button
                      component={Link}
                      to={item.to}
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        alignSelf: "flex-start",
                        px: 0,
                        minWidth: "auto",
                        color: reliefTheme.text,
                        fontWeight: 950,
                        "&:hover": { bgcolor: "transparent", color: "var(--color-green-700)" },
                      }}
                    >
                      {item.action}
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={1.5} sx={{ position: "relative", zIndex: 1, width: "100%", mt: { xs: 1.5, md: 2 } }}>
            {metrics.map((item) => (
              <Grid size={{ xs: 12, md: 4 }} key={item.label}>
                <Paper
                  sx={{
                    height: "100%",
                    p: { xs: 2.25, md: 2.5 },
                    borderRadius: reliefShape.compactRadius,
                    border: `1px solid ${reliefTheme.line}`,
                    bgcolor: "var(--color-cream-100)",
                    color: reliefTheme.text,
                    boxShadow: "none",
                  }}
                >
                  <Stack spacing={1}>
                    <Box sx={{ display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: 2, bgcolor: "#ffffff", color: reliefTheme.waterSoft }}>
                      {item.icon}
                    </Box>
                    <Typography sx={{ fontSize: { xs: 30, md: 36 }, fontWeight: 950, lineHeight: 1 }}>{item.value}</Typography>
                    <Typography sx={{ fontWeight: 900 }}>{item.label}</Typography>
                    <Typography sx={{ color: reliefTheme.faint, lineHeight: 1.5 }}>{item.detail}</Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box id="mission" sx={{ px: { xs: 2, sm: 3, md: 6, lg: 8 }, py: { xs: 5, md: 8 } }}>
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <Chip label="Sứ mệnh của chúng tôi" sx={{ mb: 2, bgcolor: reliefTheme.panel, color: reliefTheme.waterSoft, fontWeight: 900, borderRadius: 999 }} />
              <Typography sx={{ fontSize: { xs: 34, md: 52 }, lineHeight: 1.03, fontWeight: 950, letterSpacing: "-0.035em" }}>
                Chúng tôi hỗ trợ cộng đồng <Box component="span" sx={{ color: reliefTheme.waterSoft }}>cứu hộ</Box>, <Box component="span" sx={{ color: reliefTheme.waterSoft }}>phục hồi</Box> và <Box component="span" sx={{ color: reliefTheme.waterSoft }}>tái thiết</Box> trên nền tảng niềm tin công khai.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography sx={{ color: reliefTheme.muted, fontSize: { xs: 17, md: 20 }, lineHeight: 1.75 }}>
                Tâm Lũ kết nối nguồn đóng góp với nhu cầu thực địa khẩn cấp thông qua chiến dịch đã xác minh, sổ công khai, bằng chứng bàn giao và điều phối đối tác. Người ủng hộ theo dõi được dòng hỗ trợ. Đơn vị vận hành nắm được việc cần xử lý. Các gia đình có thêm con đường trở lại an toàn.
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ px: { xs: 2, sm: 3, md: 6, lg: 8 }, py: { xs: 5, md: 8 } }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper
                sx={{
                  height: "100%",
                  minHeight: { xs: 360, md: 390 },
                  p: reliefShape.cardPadding,
                  borderRadius: reliefShape.cardRadius,
                  border: `1px solid ${reliefTheme.line}`,
                  bgcolor: reliefTheme.panel,
                  background: reliefTheme.panel,
                  color: reliefTheme.text,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <Stack spacing={2} sx={{ maxWidth: 520, position: "relative", zIndex: 1 }}>
                  <Typography sx={{ color: reliefTheme.faint, fontWeight: 800 }}>Phối hợp cùng các đối tác cứu trợ địa phương</Typography>
                  <Typography sx={{ fontSize: { xs: 28, md: 36 }, lineHeight: 1.08, fontWeight: 950 }}>
                    Hỗ trợ các gia đình vùng lũ bằng nguồn lực minh bạch và có trách nhiệm.
                  </Typography>
                  <Button
                    component={Link}
                    to={donateHref}
                    variant="contained"
                    sx={{ alignSelf: "flex-start", ...primaryButtonSx }}
                  >
                    Hỗ trợ ngay
                  </Button>
                </Stack>
                <Box
                  role="img"
                  aria-label="Minh họa bàn giao hàng cứu trợ trong ánh sáng phục hồi"
                  sx={{
                    position: "absolute",
                    left: { xs: 18, md: 32 },
                    right: { xs: 18, md: 32 },
                    bottom: { xs: 18, md: 28 },
                    width: "auto",
                    height: { xs: 160, md: 180 },
                    borderRadius: 3,
                    boxShadow: "none",
                    background:
                      "linear-gradient(135deg, rgba(246,248,232,.86), rgba(238,242,206,.76)), repeating-linear-gradient(90deg, rgba(77,141,22,.10) 0 1px, transparent 1px 34px)",
                    overflow: "visible",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: "12%",
                      bottom: "24%",
                      width: "76%",
                      height: "30%",
                      borderRadius: 2,
                      background: "var(--color-green-100)",
                      border: `1px solid ${reliefTheme.line}`,
                    },
                  }}
                />
                <Box aria-hidden="true" sx={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 20% 80%, rgba(247,249,216,.58), transparent 38%)" }} />
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Stack spacing={2}>
                <Paper sx={{ ...glassCardSx, p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
                  <Typography sx={{ color: reliefTheme.faint, fontWeight: 800 }}>Gia đình được hỗ trợ qua các chiến dịch đã xác minh</Typography>
                  <Typography sx={{ mt: 1, fontSize: { xs: 64, md: 92 }, lineHeight: 1, fontWeight: 950 }}>500+</Typography>
                  <Typography sx={{ mt: 1.5, color: reliefTheme.text, letterSpacing: 1 }}>5/5 mức độ tin cậy cộng đồng</Typography>
                </Paper>
                <Paper sx={{ ...glassCardSx, p: { xs: 2.5, md: 3 }, borderRadius: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      aria-label="Ảnh đại diện tình nguyện viên cứu trợ"
                      role="img"
                      sx={{
                        display: "grid",
                        width: 78,
                        height: 96,
                        flex: "0 0 auto",
                        placeItems: "center",
                        borderRadius: reliefShape.compactRadius,
                        bgcolor: "#ffffff",
                        color: reliefTheme.waterSoft,
                        fontWeight: 950,
                        fontSize: 24,
                        border: `1px solid ${reliefTheme.line}`,
                      }}
                    >
                      MT
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 18, lineHeight: 1.45, fontWeight: 800 }}>
                        “Nguồn ủng hộ được ghi nhận rõ ràng, hàng cứu trợ đến đúng nơi. Điều đó giúp khu dân cư của chúng tôi có thêm hy vọng.”
                      </Typography>
                      <Typography sx={{ mt: 1, color: reliefTheme.faint, fontSize: 13 }}>
                        Mai Trần, tình nguyện viên cộng đồng
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
                Được hỗ trợ bởi các tổ chức và lực lượng đối tác
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
                        borderRadius: 2,
                        border: `1px solid ${reliefTheme.line}`,
                        color: reliefTheme.faint,
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
            <Chip label="Dịch vụ cứu trợ" sx={{ alignSelf: "flex-start", bgcolor: reliefTheme.panel, color: reliefTheme.waterSoft, fontWeight: 900, borderRadius: 999 }} />
            <Typography sx={{ fontSize: { xs: 38, md: 60 }, lineHeight: 1, fontWeight: 950, letterSpacing: "-0.04em" }}>
              Hỗ trợ toàn trình từ những giờ đầu khẩn cấp đến giai đoạn phục hồi lâu dài.
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
                    bgcolor: reliefTheme.panelSoft,
                    color: reliefTheme.text,
                    boxShadow: "none",
                  }}
                >
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box sx={{ display: "grid", placeItems: "center", width: 46, height: 46, borderRadius: 2, bgcolor: "#ffffff", color: reliefTheme.waterSoft }}>
                        {service.icon}
                      </Box>
                      <Typography sx={{ color: "var(--color-text-muted)", fontWeight: 950, opacity: .62 }}>{String(index + 1).padStart(2, "0")}</Typography>
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
                <Typography sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 950, lineHeight: 1.1 }}>Các chiến dịch cứu trợ lũ lụt đang hoạt động</Typography>
                <Typography sx={{ mt: 1, color: reliefTheme.muted, maxWidth: 650 }}>
                  Lựa chọn chiến dịch, xem sổ công khai và đồng hành cùng hoạt động cứu trợ bằng sự tin tưởng.
                </Typography>
              </Box>
              <Button component={Link} to="/campaigns" endIcon={<ArrowForwardIcon />} sx={{ alignSelf: { xs: "stretch", md: "center" }, borderRadius: 2, color: reliefTheme.waterSoft, fontWeight: 950 }}>
                Xem tất cả chiến dịch
              </Button>
            </Stack>
            <Box sx={{ mt: 3 }}>
              <QueryState
                isLoading={campaigns.isLoading}
                error={campaigns.error}
                empty={!campaigns.data?.data.length}
                emptyTitle="Chưa có chiến dịch đang hoạt động"
                emptyText="Các chiến dịch đã xác minh sẽ hiển thị khi điều phối viên công bố."
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
                            overflow: "visible",
                            borderRadius: reliefShape.cardRadius,
                            border: `1px solid ${reliefTheme.line}`,
                            bgcolor: reliefTheme.panel,
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
                                `linear-gradient(180deg, rgba(246,248,232,.08), rgba(246,248,232,.78)), url(${campaign.coverImageUrl || fallbackCampaignImage})`,
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
                              sx={{ height: 7, borderRadius: 999, bgcolor: "var(--color-progress-track)", "& .MuiLinearProgress-bar": { bgcolor: "var(--color-progress-fill)" } }}
                            />
                            <Stack direction="row" justifyContent="space-between" spacing={1}>
                              <Typography fontWeight={950}>{formatMoney(campaign.currentAmount)}</Typography>
                              <Typography variant="body2" sx={{ color: reliefTheme.faint }}>Mục tiêu {formatMoney(campaign.targetAmount)}</Typography>
                            </Stack>
                            <Button component={Link} to={`/campaigns/${campaign.id}`} variant="contained" fullWidth sx={{ ...secondaryButtonSx, minHeight: 46 }}>
                              Xem chiến dịch
                            </Button>
                            <Button component={Link} to={`/donor/donate/${campaign.id}`} variant="contained" fullWidth sx={{ ...primaryButtonSx, minHeight: 46 }}>
                              Ủng hộ ngay
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
              background: reliefTheme.panel,
              color: reliefTheme.text,
              boxShadow: "none",
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography sx={{ fontSize: { xs: 34, md: 54 }, lineHeight: 1, fontWeight: 950, letterSpacing: "-0.04em" }}>
                  Sự hỗ trợ đến nhanh hơn khi cộng đồng cùng hành động.
                </Typography>
                <Typography sx={{ mt: 2, color: reliefTheme.muted, maxWidth: 700, lineHeight: 1.7 }}>
                  Ủng hộ, tham gia tình nguyện hoặc chia sẻ chiến dịch đã xác minh để đội cứu hộ và điều phối viên tập trung hỗ trợ những người đang cần giúp đỡ.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={1.5}>
                  <Button component={Link} to={donateHref} variant="contained" size="large" startIcon={<FavoriteIcon />} sx={primaryButtonSx}>
                    Ủng hộ ngay
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
                    Tham gia cứu trợ
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
