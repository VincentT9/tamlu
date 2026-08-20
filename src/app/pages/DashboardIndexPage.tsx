import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import CrisisAlertOutlinedIcon from "@mui/icons-material/CrisisAlertOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { Box, Button, Grid, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
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
  {
    title: "Điểm trú tạm",
    description: "Xem nơi trú an toàn, sức chứa còn chỗ và check-in / check-out khi di tản.",
    to: "/citizen/shelters",
    icon: <MapOutlinedIcon />,
  },
  {
    title: "Phản ánh và góp ý",
    description: "Gửi phản ánh về ứng dụng, đội cứu trợ, chiến dịch hoặc trải nghiệm hỗ trợ để admin xử lý.",
    to: "/citizen/complaints",
    icon: <CrisisAlertOutlinedIcon />,
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

interface DashboardAction {
  title: string;
  description: string;
  to: string;
  icon: ReactNode;
}

function ActionGrid({ items }: { items: DashboardAction[] }) {
  return (
    <Grid container spacing={2}>
      {items.map((item, index) => {
        const isLastOddItem = items.length % 2 === 1 && index === items.length - 1;
        const isWide = index % 4 === 0 || index % 4 === 3;
        return (
          <Grid key={item.to} size={{ xs: 12, md: 6, xl: isLastOddItem ? 12 : isWide ? 7 : 5 }}>
            <Card className="tamlu-motion-surface h-full overflow-hidden p-0">
              <article className="flex h-full min-h-48 flex-col p-5 sm:p-6">
                <div className="mb-5 flex items-center gap-3 text-[var(--color-green-700)]">
                  <span className="grid h-7 w-7 shrink-0 place-items-center" aria-hidden="true">
                    {item.icon}
                  </span>
                  <Typography component="h2" variant="h6" fontWeight={800} sx={{ color: "var(--color-green-900)" }}>
                    {item.title}
                  </Typography>
                </div>
                <Typography variant="body2" sx={{ maxWidth: 560, flex: 1, color: "var(--color-text-muted)", lineHeight: 1.7 }}>
                  {item.description}
                </Typography>
                <Button component={Link} to={item.to} variant="text" endIcon={<ArrowForwardRoundedIcon />} sx={{ mt: 3, alignSelf: "flex-start", px: 0.25 }}>
                  Mở mục này
                </Button>
              </article>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}

export function DashboardIndexPage() {
  const roles = useAuthStore((state) => state.roles);

  if (roles.includes(ROLES.rescueTeam)) {
    return (
      <>
        <PageHeader
          eyebrow="Tổng quan đội cứu hộ"
          title="Trung tâm nhiệm vụ hiện trường"
          description="Theo dõi nhiệm vụ được phân công, chuyến hàng hiện trường, khảo sát khu vực và minh chứng bàn giao."
        />
        <ActionGrid items={[
            { title: "Nhiệm vụ đội cứu hộ", description: "Nhận nhiệm vụ, cập nhật trạng thái cứu hộ và hoàn tất ca hiện trường.", to: "/team/missions", icon: <CrisisAlertOutlinedIcon /> },
            { title: "Chuyến hàng đội", description: "Cập nhật trạng thái chuyến hàng được giao cho đội.", to: "/team/shipments", icon: <MapOutlinedIcon /> },
            { title: "Đánh giá khu vực", description: "Gửi khảo sát thiệt hại và nhu cầu khẩn cấp tại địa phương.", to: "/team/area-assessments", icon: <FavoriteBorderOutlinedIcon /> },
            { title: "Minh chứng hiện trường", description: "Nộp ảnh, GPS và xác nhận sau khi trao hỗ trợ.", to: "/team/proofs", icon: <CampaignOutlinedIcon /> },
          ]} />
      </>
    );
  }
  if (roles.includes(ROLES.admin) || roles.includes(ROLES.coordinator) || hasFinanceRole(roles)) {
    return <OpsDashboardPage />;
  }
  if (roles.includes(ROLES.donor)) {
    return (
      <>
        <PageHeader
          eyebrow="Tổng quan nhà hảo tâm"
          title="Trung tâm đồng hành cứu trợ"
          description="Theo dõi đóng góp cá nhân, lựa chọn chiến dịch đang hoạt động và kiểm tra việc sử dụng nguồn quỹ công khai."
        />
        <ActionGrid items={[
            { title: "Chiến dịch cứu trợ", description: "Xem chi tiết các chiến dịch đang hoạt động và lựa chọn nơi cần đồng hành.", to: "/donor/campaigns", icon: <CampaignOutlinedIcon /> },
            { title: "Lịch sử quyên góp", description: "Theo dõi các khoản đóng góp đã thực hiện bằng tài khoản này.", to: "/donor/donations", icon: <FavoriteBorderOutlinedIcon /> },
            { title: "Bản đồ cứu trợ", description: "Theo dõi khu vực cứu trợ và thông tin điều phối được công khai.", to: "/relief-map", icon: <MapOutlinedIcon /> },
          ]} />
      </>
    );
  }
  return (
    <>
      <PageHeader
        eyebrow="Tổng quan"
        title="Trung tâm hỗ trợ cá nhân"
        description="Theo dõi cứu hộ, xem chiến dịch đã xác minh và cập nhật khả năng đồng hành trong hệ thống Tâm Lũ."
      />
      <ActionGrid items={citizenActions
          .filter((item) => roles.includes(ROLES.citizen) || item.to !== "/citizen/complaints")
        } />
    </>
  );
}
