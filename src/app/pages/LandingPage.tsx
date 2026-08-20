import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CrisisAlertOutlinedIcon from "@mui/icons-material/CrisisAlertOutlined";
import FoodBankOutlinedIcon from "@mui/icons-material/FoodBankOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import HomeRepairServiceOutlinedIcon from "@mui/icons-material/HomeRepairServiceOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import SosIcon from "@mui/icons-material/Sos";
import { useGSAP } from "@gsap/react";
import { Box, Button, Chip, Grid, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { donationApi } from "@/features/donations/api";
import { formatMoney, percent } from "@/shared/utils/format";
import { CampaignMedia } from "@/shared/ui/CampaignMedia";
import { QueryState } from "@/shared/ui/QueryState";
import { StatusChip } from "@/shared/ui/StatusChip";

const heroRescueImageUrl = "/images/flood-family-rescue.png";

gsap.registerPlugin(ScrollTrigger);

const landingTheme = {
  page: "var(--color-cream-50)",
  surface: "var(--color-surface)",
  surfaceSoft: "var(--color-green-50)",
  cream: "var(--color-cream-100)",
  border: "var(--color-border)",
  borderStrong: "var(--color-border-strong)",
  text: "var(--color-green-800)",
  muted: "var(--color-text-muted)",
  brand: "var(--color-green-700)",
  brandSoft: "var(--color-green-600)",
  brandHover: "var(--color-green-800)",
};

const sectionPadding = {
  px: { xs: 2, sm: 3, md: 6, lg: 8 },
  py: { xs: 7, md: 10 },
};

const primaryButtonSx = {
  minHeight: 44,
  borderRadius: 1,
  px: 3,
  bgcolor: landingTheme.brand,
  color: "#ffffff",
  border: `1px solid ${landingTheme.brand}`,
  boxShadow: "none",
  fontWeight: 800,
  "&:hover": { bgcolor: landingTheme.brandHover, borderColor: landingTheme.brandHover, color: "#ffffff" },
  "&:focus-visible": { outline: `3px solid ${landingTheme.brandSoft}`, outlineOffset: 3 },
};

const secondaryButtonSx = {
  minHeight: 44,
  borderRadius: 1,
  px: 3,
  bgcolor: "#ffffff",
  color: landingTheme.text,
  border: `1px solid ${landingTheme.borderStrong}`,
  boxShadow: "none",
  fontWeight: 800,
  "&:hover": { bgcolor: landingTheme.surfaceSoft, borderColor: landingTheme.brandSoft, color: landingTheme.text },
  "&:focus-visible": { outline: `3px solid ${landingTheme.brandSoft}`, outlineOffset: 3 },
};

const reliefServices = [
  {
    title: "Cứu hộ khẩn cấp",
    text: "Thông tin SOS giúp lực lượng phản ứng xác minh tình hình và ưu tiên đúng trường hợp nguy cấp.",
    icon: CrisisAlertOutlinedIcon,
  },
  {
    title: "Lương thực và nơi trú",
    text: "Nguồn lực được điều phối tới kho, điểm phân phối và nơi trú tạm gần khu vực bị ảnh hưởng.",
    icon: FoodBankOutlinedIcon,
  },
  {
    title: "Hỗ trợ y tế",
    text: "Nhu cầu thuốc men, vật tư vệ sinh và chăm sóc hiện trường được chuyển tới đơn vị phụ trách.",
    icon: MedicalServicesOutlinedIcon,
  },
  {
    title: "Phục hồi sau lũ",
    text: "Chiến dịch hỗ trợ cộng đồng khôi phục nhà ở, sinh kế và những điều kiện sống thiết yếu.",
    icon: HomeRepairServiceOutlinedIcon,
  },
];

const publicProcess = [
  {
    step: "01",
    title: "Xác minh nhu cầu",
    text: "Yêu cầu cứu hộ và chiến dịch được kiểm tra trước khi chuyển sang điều phối.",
  },
  {
    step: "02",
    title: "Điều phối nguồn lực",
    text: "Đội cứu hộ, nơi trú tạm, phương tiện và hàng cứu trợ được kết nối theo tình hình thực địa.",
  },
  {
    step: "03",
    title: "Công khai kết quả",
    text: "Người dân và nhà hảo tâm có thể theo dõi chiến dịch, dòng tiền và hoạt động cứu trợ.",
  },
];

export function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const campaigns = useQuery({
    queryKey: ["landing-campaigns"],
    queryFn: () => donationApi.publicCampaigns({ page: 1, limit: 3 }),
  });

  const totals = campaigns.data?.data.reduce(
    (acc, campaign) => ({
      raised: acc.raised + campaign.currentAmount,
      target: acc.target + campaign.targetAmount,
    }),
    { raised: 0, target: 0 },
  );
  const progress = totals?.target ? Math.min((totals.raised / totals.target) * 100, 100) : 0;
  const hasCampaignData = Boolean(campaigns.data);

  const liveMetrics = [
    {
      label: "Chiến dịch công khai",
      value: hasCampaignData ? String(campaigns.data?.totalCount ?? 0) : "Đang tải",
    },
    {
      label: "Đã ghi nhận từ các chiến dịch hiển thị",
      value: hasCampaignData ? formatMoney(totals?.raised) : "Đang tải",
    },
    {
      label: "Tiến độ của nhóm chiến dịch hiển thị",
      value: hasCampaignData ? percent(progress) : "Đang tải",
    },
  ];

  useGSAP(
    () => {
      const media = gsap.matchMedia();

      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-landing-hero-item]", {
          y: 28,
          opacity: 0,
          duration: 0.9,
          stagger: 0.11,
          ease: "power3.out",
        });

        gsap.from("[data-landing-live-panel]", {
          x: 32,
          opacity: 0,
          duration: 1,
          delay: 0.25,
          ease: "power3.out",
        });

        gsap.utils.toArray<HTMLElement>("[data-landing-reveal]").forEach((element) => {
          gsap.from(element, {
            y: 34,
            opacity: 0,
            duration: 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 86%",
              once: true,
            },
          });
        });

        gsap.fromTo(
          "[data-landing-mission-copy]",
          { opacity: 0.28, y: 18 },
          {
            opacity: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-landing-mission-copy]",
              start: "top 82%",
              end: "bottom 48%",
              scrub: 0.7,
            },
          },
        );
      });

      media.add("(min-width: 1200px) and (prefers-reduced-motion: no-preference)", () => {
        ScrollTrigger.create({
          trigger: "[data-landing-work]",
          start: "top top+=112",
          end: "bottom bottom-=112",
          pin: "[data-landing-work-heading]",
          pinSpacing: false,
          invalidateOnRefresh: true,
        });
      });

      return () => media.revert();
    },
    { scope: pageRef },
  );

  return (
    <Box ref={pageRef} sx={{ bgcolor: landingTheme.page, color: landingTheme.text, overflowX: "hidden" }}>
      <Box
        component="section"
        aria-labelledby="landing-hero-title"
        sx={{
          position: "relative",
          minHeight: { xs: "calc(100dvh - 80px)", lg: "calc(100dvh - 88px)" },
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box
          component="img"
          src={heroRescueImageUrl}
          alt="Đội cứu hộ đưa người dân ra khỏi khu vực ngập lụt"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: { xs: "49% 50%", md: "55% 50%" },
            filter: "saturate(.88) contrast(1.04)",
          }}
        />
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(247,249,240,.98) 0%, rgba(247,249,240,.91) 34%, rgba(247,249,240,.38) 69%, rgba(247,249,240,.72) 100%), linear-gradient(180deg, rgba(247,249,240,.42) 0%, rgba(247,249,240,.12) 48%, rgba(247,249,240,.88) 100%)",
          }}
        />

        <Box sx={{ position: "relative", zIndex: 1, width: "100%", mx: "auto", maxWidth: 1500, ...sectionPadding }}>
          <Grid container spacing={{ xs: 6, lg: 8 }} alignItems="center">
            <Grid size={{ xs: 12, lg: 7 }}>
              <Stack spacing={3} sx={{ maxWidth: 760 }}>
                <Chip
                  data-landing-hero-item
                  icon={<ShieldOutlinedIcon />}
                  label="Nền tảng cứu trợ cộng đồng minh bạch"
                  sx={{
                    alignSelf: "flex-start",
                    bgcolor: landingTheme.surface,
                    color: landingTheme.text,
                    border: `1px solid ${landingTheme.borderStrong}`,
                    fontWeight: 800,
                    "& .MuiChip-icon": { color: landingTheme.brandSoft },
                  }}
                />
                <Typography
                  data-landing-hero-item
                  id="landing-hero-title"
                  component="h1"
                  sx={{
                    maxWidth: 760,
                    fontSize: { xs: 48, sm: 68, md: 82, xl: 92 },
                    lineHeight: { xs: 1.02, md: .98 },
                    letterSpacing: 0,
                    fontWeight: 900,
                    color: landingTheme.text,
                  }}
                >
                  Kết nối cứu trợ,
                  <Box component="span" sx={{ display: "block", color: landingTheme.brandSoft }}>
                    phục hồi sau lũ.
                  </Box>
                </Typography>
                <Typography data-landing-hero-item sx={{ maxWidth: 570, color: landingTheme.muted, fontSize: { xs: 16, md: 18 }, lineHeight: 1.7 }}>
                  Gửi yêu cầu khẩn cấp, theo dõi chiến dịch đã xác minh và đồng hành cùng cộng đồng bị ảnh hưởng bởi lũ lụt.
                </Typography>
                <Stack data-landing-hero-item direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
                  <Button component={Link} to="/sos/new" variant="contained" size="large" startIcon={<SosIcon />} sx={primaryButtonSx}>
                    Gửi yêu cầu SOS
                  </Button>
                  <Button component={Link} to="/campaigns" variant="outlined" size="large" sx={secondaryButtonSx}>
                    Xem chiến dịch
                  </Button>
                  <Button
                    component={Link}
                    to="/relief-map"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ color: landingTheme.text, fontWeight: 800, minHeight: 48, px: 1.5 }}
                  >
                    Mở bản đồ cứu trợ
                  </Button>
                </Stack>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 5 }}>
              <Paper
                data-landing-live-panel
                sx={{
                  ml: { lg: "auto" },
                  maxWidth: { lg: 440 },
                  p: { xs: 3, md: 4 },
                  borderRadius: 2,
                  border: `1px solid ${landingTheme.borderStrong}`,
                  bgcolor: "rgba(255,255,255,.92)",
                  backdropFilter: "blur(14px)",
                  boxShadow: "var(--shadow-surface)",
                }}
              >
                <Stack spacing={2.5}>
                  <Box>
                    <Typography component="h2" sx={{ fontSize: 24, fontWeight: 900 }}>
                      Dữ liệu chiến dịch công khai
                    </Typography>
                    <Typography sx={{ mt: .75, color: landingTheme.muted, lineHeight: 1.55 }}>
                      Số liệu được tổng hợp trực tiếp từ các chiến dịch đang công bố trên hệ thống.
                    </Typography>
                  </Box>
                  <Stack divider={<Box sx={{ borderTop: `1px solid ${landingTheme.border}` }} />}>
                    {liveMetrics.map((metric) => (
                      <Box key={metric.label} sx={{ display: "flex", gap: 2, justifyContent: "space-between", py: 2 }}>
                        <Typography sx={{ maxWidth: 220, color: landingTheme.muted, lineHeight: 1.45 }}>{metric.label}</Typography>
                        <Typography className="tamlu-data" sx={{ textAlign: "right", fontSize: 20, fontWeight: 900, overflowWrap: "anywhere" }}>
                          {metric.value}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={hasCampaignData ? progress : 0}
                    aria-label="Tiến độ gây quỹ của các chiến dịch đang hiển thị"
                    sx={{ height: 7, bgcolor: "var(--color-progress-track)", "& .MuiLinearProgress-bar": { bgcolor: "var(--color-progress-fill)" } }}
                  />
                  {campaigns.isError ? (
                    <Typography role="status" sx={{ color: "var(--status-danger-text)", fontSize: 13 }}>
                      Chưa thể tải dữ liệu chiến dịch. Danh sách chiến dịch vẫn có thể được mở từ nút bên trái.
                    </Typography>
                  ) : null}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>

      <Box
        component="section"
        id="mission"
        aria-labelledby="mission-title"
        sx={{
          scrollMarginTop: { xs: "88px", md: "96px" },
          position: "relative",
          isolation: "isolate",
          overflow: "hidden",
          minHeight: { lg: 780 },
          mx: "auto",
          maxWidth: 1500,
          bgcolor: landingTheme.page,
          borderBlock: `1px solid ${landingTheme.border}`,
        }}
      >
        <Box
          component="figure"
          sx={{
            position: { xs: "relative", lg: "absolute" },
            zIndex: 1,
            top: 0,
            left: 0,
            width: { xs: "100%", md: "78%", lg: "55%" },
            height: { xs: 260, md: 390, lg: 520 },
            m: 0,
            overflow: "hidden",
            clipPath: {
              xs: "polygon(0 0, 100% 0, 96% 78%, 74% 94%, 42% 100%, 0 88%)",
              lg: "polygon(0 0, 100% 0, 95% 65%, 80% 86%, 48% 100%, 0 88%)",
            },
            filter: "drop-shadow(24px 30px 34px rgba(47, 82, 16, 0.2))",
          }}
        >
          <Box
            component="img"
            src="/images/rescue-carry.png"
            alt="Nhân viên cứu hộ cõng người dân di chuyển qua vùng nước lũ."
            sx={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: { xs: "50% center", md: "48% center", lg: "52% center" },
            }}
          />
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              inset: 0,
              background: {
                xs: `linear-gradient(180deg, transparent 54%, ${landingTheme.page} 100%)`,
                lg: `linear-gradient(145deg, transparent 48%, rgba(246,248,232,0.32) 66%, rgba(246,248,232,0.96) 94%), linear-gradient(180deg, transparent 52%, rgba(246,248,232,0.96) 100%)`,
              },
            }}
          />
        </Box>

        <Box
          sx={{
            ...sectionPadding,
            position: "relative",
            zIndex: 2,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 5fr) minmax(420px, 7fr)" },
            alignItems: "start",
            gap: { xs: 6, md: 8, lg: 10 },
            minHeight: { lg: 780 },
            mt: { xs: -3, md: -6, lg: 0 },
          }}
        >
          <Stack
            data-landing-reveal
            spacing={2}
            sx={{
              position: "relative",
              maxWidth: 610,
              pt: { xs: 0, md: 0, lg: 38 },
              pr: { lg: 2 },
            }}
          >
            <Chip label="Sứ mệnh của chúng tôi" sx={{ alignSelf: "flex-start", bgcolor: landingTheme.surface, color: landingTheme.brandSoft, fontWeight: 800 }} />
            <Typography id="mission-title" component="h2" sx={{ fontSize: { xs: 36, md: 58 }, lineHeight: 1.06, fontWeight: 900, letterSpacing: 0 }}>
              Nguồn lực cần đến đúng nơi, đúng lúc và có thể kiểm chứng.
            </Typography>
            <Typography data-landing-mission-copy sx={{ maxWidth: 760, color: landingTheme.muted, fontSize: { xs: 17, md: 19 }, lineHeight: 1.75 }}>
              Tâm Lũ kết nối nhu cầu thực địa với lực lượng cứu hộ, chiến dịch cộng đồng và hồ sơ công khai để mỗi hoạt động hỗ trợ có trách nhiệm hơn.
            </Typography>
          </Stack>

          <Box
            component="ol"
            aria-label="Quy trình công khai cứu trợ"
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr",
              alignContent: "start",
              mt: { xs: 0, lg: 8 },
              mInline: 0,
              mb: 0,
              p: 0,
              listStyle: "none",
            }}
          >
            {publicProcess.map((item, index) => (
              <Box
                component="li"
                data-landing-reveal
                key={item.title}
                sx={{
                  position: "relative",
                  display: "grid",
                  gridTemplateColumns: { xs: "48px minmax(0, 1fr)", md: "64px minmax(0, 1fr)" },
                  alignItems: "start",
                  gap: { xs: 2, md: 3 },
                  minWidth: 0,
                  width: index === 1 ? { xs: "100%", lg: "calc(100% - 56px)" } : index === 2 ? { xs: "100%", lg: "calc(100% - 16px)" } : "100%",
                  ml: index === 1 ? { xs: 0, lg: 7 } : index === 2 ? { xs: 0, lg: 2 } : 0,
                  mt: index === 0 ? 0 : index === 1 ? { xs: 2, md: 3, lg: 5 } : { xs: 3, md: 5, lg: 8 },
                  py: index === 1 ? { xs: 2.5, md: 4 } : { xs: 2, md: 3 },
                  "&::after": index < publicProcess.length - 1 ? {
                    content: '\"\"',
                    position: "absolute",
                    zIndex: 0,
                    bgcolor: landingTheme.borderStrong,
                    left: { xs: 23, md: 31 },
                    top: { xs: 60, md: 74 },
                    bottom: index === 0 ? { xs: -28, md: -42, lg: -58 } : { xs: -36, md: -58, lg: -82 },
                    width: "1px",
                    transform: index === 0 ? { xs: "none", lg: "rotate(-14deg)" } : { xs: "none", lg: "rotate(9deg)" },
                    transformOrigin: "top center",
                  } : undefined,
                }}
              >
                <Typography
                  className="tamlu-data"
                  aria-hidden="true"
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    display: "grid",
                    placeItems: "center",
                    width: { xs: 46, md: 62 },
                    height: { xs: 46, md: 62 },
                    borderRadius: "50%",
                    border: `1px solid ${index === 0 ? landingTheme.brandSoft : landingTheme.borderStrong}`,
                    bgcolor: "rgba(255,255,255,0.92)",
                    color: index === 0 ? landingTheme.brand : landingTheme.muted,
                    fontSize: 14,
                    fontWeight: 800,
                    lineHeight: 1,
                  }}
                >
                  {item.step}
                </Typography>
                <Box
                  sx={{
                    gridColumn: 2,
                    minWidth: 0,
                    maxWidth: 560,
                    pt: { xs: 0.25, md: 0.75 },
                    pb: { xs: 1.5, md: 2.5 },
                  }}
                >
                  <Typography component="h3" sx={{ color: landingTheme.text, fontSize: { xs: 22, md: 28 }, fontWeight: 900 }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ mt: 1.25, color: landingTheme.muted, lineHeight: 1.7 }}>{item.text}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box
        component="section"
        id="our-work"
        aria-labelledby="our-work-title"
        sx={{ bgcolor: landingTheme.surfaceSoft, scrollMarginTop: { xs: "88px", md: "96px" } }}
      >
        <Box data-landing-work sx={{ ...sectionPadding, mx: "auto", maxWidth: 1500 }}>
          <Box
            data-landing-work-heading
            sx={{
              width: "100%",
              maxWidth: 800,
              mx: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <Chip label="Phạm vi hỗ trợ" sx={{ mb: 2, bgcolor: landingTheme.surface, color: landingTheme.brandSoft, fontWeight: 800 }} />
            <Typography
              id="our-work-title"
              component="h2"
              sx={{
                fontSize: { xs: 36, md: 56 },
                lineHeight: 1.06,
                fontWeight: 900,
                letterSpacing: 0,
              }}
            >
              Đồng hành từ
              <Box component="span" sx={{ display: 'block' }}>
                khẩn cấp đến phục hồi.
              </Box>
            </Typography>
            <Typography sx={{ mt: 2, color: landingTheme.muted, fontSize: 17, lineHeight: 1.7 }}>
              Kết nối thông tin, con người và nguồn lực để cứu trợ nhanh hơn, phối hợp hiệu quả hơn.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))" },
              gridAutoFlow: "dense",
              gap: { xs: 2, sm: 3 },
              mt: { xs: 4, md: 6 },
            }}
          >
            {reliefServices.map((service) => {
              const ServiceIcon = service.icon;
              return (
                <Box
                  component="article"
                  data-landing-reveal
                  key={service.title}
                  sx={{
                    display: "flex",
                    minWidth: 0,
                    flexDirection: "column",
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: "var(--radius-panel)",
                    bgcolor: "var(--color-cream-100)",
                    boxShadow: "inset 0 0 0 1px transparent",
                    transition: "transform 220ms ease, background-color 220ms ease, box-shadow 220ms ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      bgcolor: "var(--color-green-100)",
                      boxShadow: "inset 0 0 0 1px var(--color-border-strong)",
                    },
                    "&:hover .relief-service-icon": {
                      transform: "translateY(-1px)",
                      bgcolor: "var(--color-green-200)",
                    },
                    "@media (prefers-reduced-motion: reduce)": {
                      transition: "none",
                      "&:hover": { transform: "none" },
                      "&:hover .relief-service-icon": { transform: "none" },
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                    <Box
                      className="relief-service-icon"
                      aria-hidden="true"
                      sx={{
                        display: "grid",
                        placeItems: "center",
                        width: { xs: 36, sm: 40 },
                        height: { xs: 36, sm: 40 },
                        flex: "0 0 auto",
                        borderRadius: "10px",
                        bgcolor: "var(--color-green-100)",
                        color: "var(--color-green-700)",
                        transition: "transform 220ms ease, background-color 220ms ease",
                      }}
                    >
                      <ServiceIcon sx={{ fontSize: { xs: 20, sm: 22 }, strokeWidth: 1.5 }} />
                    </Box>
                  </Box>

                  <Box sx={{ minWidth: 0, mt: { xs: 1.5, sm: 2 } }}>
                    <Typography component="h3" sx={{ color: landingTheme.text, fontSize: { xs: 21, md: 24 }, fontWeight: 900, lineHeight: 1.2 }}>
                      {service.title}
                    </Typography>
                    <Typography sx={{ mt: 0.75, color: landingTheme.muted, lineHeight: 1.55 }}>{service.text}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      <Box component="section" id="donate" aria-labelledby="campaigns-title" sx={{ ...sectionPadding, mx: "auto", maxWidth: 1500 }}>
        <Stack
          id="campaigns-preview"
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={2.5}
          alignItems={{ md: "end" }}
          sx={{ scrollMarginTop: { xs: "88px", md: "96px" } }}
        >
          <Box data-landing-reveal sx={{ maxWidth: 760 }}>
            <Chip label="Chiến dịch đang công khai" sx={{ mb: 2, bgcolor: landingTheme.surface, color: landingTheme.brandSoft, fontWeight: 800 }} />
            <Typography id="campaigns-title" component="h2" sx={{ fontSize: { xs: 36, md: 56 }, lineHeight: 1.06, fontWeight: 900, letterSpacing: 0 }}>
              Chọn nơi bạn muốn đồng hành.
            </Typography>
            <Typography sx={{ mt: 2, color: landingTheme.muted, fontSize: 17, lineHeight: 1.7 }}>
              Xem mục tiêu, tiến độ và hồ sơ công khai trước khi quyết định ủng hộ.
            </Typography>
          </Box>
          <Button component={Link} to="/campaigns" endIcon={<ArrowForwardIcon />} sx={{ color: landingTheme.text, fontWeight: 800, minHeight: 48 }}>
            Xem tất cả chiến dịch
          </Button>
        </Stack>

        <Box sx={{ mt: { xs: 4, md: 5 } }}>
          <QueryState
            isLoading={campaigns.isLoading}
            error={campaigns.error}
            empty={!campaigns.data?.data.length}
            emptyTitle="Chưa có chiến dịch đang hoạt động"
            emptyText="Các chiến dịch đã xác minh sẽ hiển thị khi được công bố."
            refetch={campaigns.refetch}
          >
            <Grid container spacing={2.5}>
              {campaigns.data?.data.map((campaign) => {
                const campaignProgress = campaign.stats?.progressPct ?? (campaign.targetAmount ? (campaign.currentAmount / campaign.targetAmount) * 100 : 0);
                return (
                  <Grid size={{ xs: 12, md: 4 }} key={campaign.id}>
                    <Paper
                      className="tamlu-motion-surface"
                      data-landing-reveal
                      sx={{
                        height: "100%",
                        overflow: "hidden",
                        borderRadius: 2,
                        border: `1px solid ${landingTheme.border}`,
                        bgcolor: landingTheme.surface,
                        color: landingTheme.text,
                        boxShadow: "none",
                      }}
                    >
                      <CampaignMedia
                        src={campaign.coverImageUrl}
                        alt={`Hình ảnh chiến dịch ${campaign.name}`}
                        aspectRatio="16 / 9"
                        overlay
                      />
                      <Stack spacing={2} sx={{ p: { xs: 2.5, md: 3 } }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                          <StatusChip value={campaign.status} />
                          <Typography className="tamlu-data" variant="caption" sx={{ color: landingTheme.muted }}>
                            {percent(campaignProgress)}
                          </Typography>
                        </Stack>
                        <Box>
                          <Typography component="h3" sx={{ fontSize: 22, lineHeight: 1.25, fontWeight: 900 }}>
                            {campaign.name}
                          </Typography>
                          <Typography sx={{ mt: .75, color: landingTheme.muted }}>{campaign.affectedArea}</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(campaignProgress, 100)}
                          aria-label={`Tiến độ chiến dịch ${campaign.name}`}
                          sx={{ height: 7, bgcolor: "var(--color-progress-track)", "& .MuiLinearProgress-bar": { bgcolor: "var(--color-progress-fill)" } }}
                        />
                        <Stack direction="row" justifyContent="space-between" spacing={2}>
                          <Box>
                            <Typography variant="caption" sx={{ color: landingTheme.muted }}>Đã ghi nhận</Typography>
                            <Typography className="tamlu-data" sx={{ fontWeight: 900 }}>{formatMoney(campaign.currentAmount)}</Typography>
                          </Box>
                          <Box sx={{ textAlign: "right" }}>
                            <Typography variant="caption" sx={{ color: landingTheme.muted }}>Mục tiêu</Typography>
                            <Typography className="tamlu-data" sx={{ fontWeight: 800 }}>{formatMoney(campaign.targetAmount)}</Typography>
                          </Box>
                        </Stack>
                        <Button component={Link} to={`/campaigns/${campaign.id}`} variant="outlined" fullWidth endIcon={<ArrowForwardIcon />} sx={secondaryButtonSx}>
                          Xem chi tiết
                        </Button>
                      </Stack>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </QueryState>
        </Box>
      </Box>

      <Box component="section" id="contact" aria-labelledby="contact-title" sx={{ px: { xs: 2, sm: 3, md: 6, lg: 8 }, pb: { xs: 7, md: 10 } }}>
        <Paper
          data-landing-reveal
          sx={{
            mx: "auto",
            maxWidth: 1372,
            p: { xs: 3.5, md: 5.5 },
            borderRadius: 2,
            border: `1px solid ${landingTheme.borderStrong}`,
            bgcolor: landingTheme.cream,
            boxShadow: "none",
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography id="contact-title" component="h2" sx={{ fontSize: { xs: 34, md: 50 }, lineHeight: 1.08, fontWeight: 900, letterSpacing: 0 }}>
                Cộng đồng mạnh hơn khi nhiều người cùng góp sức.
              </Typography>
              <Typography sx={{ mt: 2, maxWidth: 720, color: landingTheme.muted, fontSize: 17, lineHeight: 1.7 }}>
                Đăng ký kỹ năng và khu vực có thể hỗ trợ để điều phối viên kết nối bạn với hoạt động phù hợp.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Button
                component={Link}
                to="/citizen/volunteer-profile"
                variant="contained"
                size="large"
                startIcon={<HandshakeOutlinedIcon />}
                fullWidth
                sx={primaryButtonSx}
              >
                Tham gia cứu trợ
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
}
