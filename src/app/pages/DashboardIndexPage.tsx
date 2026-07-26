import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import CrisisAlertOutlinedIcon from "@mui/icons-material/CrisisAlertOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import { Link, Navigate } from "react-router-dom";
import { OpsDashboardPage } from "@/features/admin/pages/OpsPages";
import { useAuthStore } from "@/features/auth/store";
import { ROLES } from "@/shared/constants/roles";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Card } from "@/components/Card";

const citizenActions = [
  {
    title: "Yêu cầu cứu hộ",
    description: "Gửi yêu cầu SOS mới hoặc theo dõi các yêu cầu đã tạo.",
    to: "/citizen/sos",
    icon: <CrisisAlertOutlinedIcon />,
  },
  {
    title: "Chiến dịch cứu trợ",
    description: "Xem các chiến dịch đã xác minh và thông tin sử dụng nguồn lực.",
    to: "/campaigns",
    icon: <CampaignOutlinedIcon />,
  },
  {
    title: "Bản đồ cứu trợ",
    description: "Theo dõi khu vực cần hỗ trợ, tuyến vận chuyển và điểm phân phối.",
    to: "/relief-map",
    icon: <MapOutlinedIcon />,
  },
  {
    title: "Hồ sơ tình nguyện",
    description: "Cập nhật kỹ năng và khu vực có thể tham gia hỗ trợ cộng đồng.",
    to: "/citizen/volunteer-profile",
    icon: <FavoriteBorderOutlinedIcon />,
  },
];

function normalizeDashboardRole(value: string) {
  return value
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]+/g, "_");
}

function hasFinanceRole(roles: string[]) {
  const normalized = roles.map(normalizeDashboardRole);
  return ["FINANCIAL_OFFICER", "FINANCE", "FINANCIAL", "ACCOUNTANT", "ACCOUNTING", "KE_TOAN", "KETOAN"].some((role) => normalized.includes(role));
}

export function DashboardIndexPage() {
  const roles = useAuthStore((state) => state.roles);

  if (roles.includes(ROLES.rescueTeam)) return <Navigate to="/team/missions" replace />;
  if (roles.includes(ROLES.admin) || roles.includes(ROLES.coordinator) || hasFinanceRole(roles)) {
    return <OpsDashboardPage />;
  }
  if (roles.includes(ROLES.donor) && !roles.includes(ROLES.citizen) && !roles.includes(ROLES.volunteer)) {
    return <Navigate to="/donor/donations" replace />;
  }

  return (
    <>
      <PageHeader
        eyebrow="Tổng quan"
        title="Trung tâm hỗ trợ cá nhân"
        description="Theo dõi cứu hộ, xem chiến dịch đã xác minh và cập nhật khả năng đồng hành trong hệ thống Tâm Lũ."
      />
      <Grid container spacing={2.5}>
        {citizenActions.map((item) => (
          <Grid key={item.to} size={{ xs: 12, md: 6, xl: 3 }}>
            <Card className="h-full">
              <Stack spacing={2} className="h-full">
                <Box className="grid h-11 w-11 place-items-center rounded-full bg-white text-[var(--color-green-700)] ring-1 ring-[var(--color-border)]">
                  {item.icon}
                </Box>
                <Box className="flex-1">
                  <Typography fontWeight={950} sx={{ color: "var(--color-green-800)" }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.75, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                    {item.description}
                  </Typography>
                </Box>
                <Button component={Link} to={item.to} variant="outlined">
                  Mở mục này
                </Button>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
