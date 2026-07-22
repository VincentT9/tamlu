import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SearchIcon from "@mui/icons-material/Search";
import { Alert, Avatar, Box, Button, Chip, Grid, IconButton, MenuItem, Paper, Stack, Tab, Table, TableBody, TableCell, TableHead, TableRow, Tabs, TextField, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { adminApi } from "@/features/admin/api";
import { aidApi } from "@/features/aid/api";
import { donationApi } from "@/features/donations/api";
import { inventoryApi } from "@/features/inventory/api";
import { missionApi } from "@/features/missions/api";
import { monitoringApi } from "@/features/monitoring/api";
import { organizationApi } from "@/features/organizations/api";
import { sosApi } from "@/features/sos/api";
import { volunteerApi } from "@/features/volunteers/api";
import { ROLE_IDS, ROLE_LABELS, ROLES } from "@/shared/constants/roles";
import { CAMPAIGN_STATUS, MISSION_STATUS, PRIORITY, SHIPMENT_STATUS, SOS_STATUS, STATUS_LABELS } from "@/shared/constants/statuses";
import { formatDate, formatMoney } from "@/shared/utils/format";
import { MetricCard } from "@/shared/ui/MetricCard";
import { PageHeader } from "@/shared/ui/PageHeader";
import { QueryState } from "@/shared/ui/QueryState";
import { SectionPaper } from "@/shared/ui/SectionPaper";
import { StatusChip } from "@/shared/ui/StatusChip";
import { useToast } from "@/shared/ui/toast";
import { useAuthStore } from "@/features/auth/store";

export function OpsDashboardPage() {
  const dashboard = useQuery({ queryKey: ["dashboard-summary"], queryFn: adminApi.dashboard, refetchInterval: 60000 });
  const user = useAuthStore((state) => state.user);
  const summary = dashboard.data;
  const pending = summary?.pendingRequests ?? 0;
  const missions = summary?.activeMissions ?? 0;
  const stock = summary?.lowStockItems ?? 0;
  const campaigns = summary?.activeCampaigns ?? 0;
  const warehouses = summary?.totalWarehouses ?? 0;
  const donations = summary?.totalDonations ?? 0;
  const readiness = Math.max(12, Math.min(96, Math.round(((missions + campaigns + warehouses) / Math.max(missions + campaigns + warehouses + pending + stock, 1)) * 100)));
  const sosTrend = [
    { day: "T2", value: Math.max(2, pending - 3) },
    { day: "T3", value: Math.max(3, pending + 1) },
    { day: "T4", value: Math.max(4, pending + missions / 2) },
    { day: "T5", value: Math.max(3, pending + 2) },
    { day: "T6", value: Math.max(5, pending + stock + 1) },
    { day: "T7", value: Math.max(4, pending + campaigns) },
    { day: "CN", value: Math.max(6, pending + missions) },
  ];
  const donationBars = [
    { day: "T2", value: Math.max(18, campaigns * 14) },
    { day: "T3", value: Math.max(28, missions * 10) },
    { day: "T4", value: Math.max(24, warehouses * 18) },
    { day: "T5", value: Math.max(42, Math.round(donations / 10000000)) },
    { day: "T6", value: Math.max(22, pending * 12) },
  ];
  const donationShare = [
    { name: "Cứu hộ", value: Math.max(missions, 1), color: "var(--color-green-700)" },
    { name: "Trú tạm", value: Math.max(campaigns, 1), color: "var(--color-green-600)" },
    { name: "Nhu yếu phẩm", value: Math.max(warehouses, 1), color: "var(--color-green-200)" },
  ];
  const taskCompletion = Math.min(100, Math.round(((missions + campaigns) / Math.max(missions + campaigns + pending, 1)) * 100));
  const deliveryTrust = Math.min(99, Math.max(34, 100 - stock * 7));

  return (
    <>
      <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between" spacing={2.5} sx={{ mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: { xs: 34, md: 40 }, lineHeight: 1, fontWeight: 950, letterSpacing: "-.035em" }}>
            Bảng điều phối
          </Typography>
          <Typography sx={{ mt: 1, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
            Trung tâm điều phối cứu trợ khẩn cấp cho tiếp nhận SOS, nhiệm vụ, kho hàng và nguồn quỹ công khai.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <IconButton aria-label="Tìm kiếm trong bảng điều phối" sx={opsIconButtonSx}>
            <SearchIcon />
          </IconButton>
          <IconButton aria-label="Thông báo" sx={opsIconButtonSx}>
            <NotificationsNoneIcon />
          </IconButton>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ pl: 1 }}>
            <Avatar sx={{ width: 38, height: 38, bgcolor: "var(--color-green-700)", color: "#ffffff", fontWeight: 950 }}>
              {(user?.fullName ?? "T").slice(0, 1)}
            </Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography sx={{ fontSize: 13, fontWeight: 950 }}>{user?.fullName ?? "Điều phối viên Tâm Lũ"}</Typography>
              <Typography sx={{ fontSize: 11, color: "var(--color-text-muted)", fontWeight: 750 }}>Quản lý cứu trợ</Typography>
            </Box>
          </Stack>
        </Stack>
      </Stack>
      <QueryState isLoading={dashboard.isLoading} error={dashboard.error} refetch={dashboard.refetch}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" }, gap: 2.25, alignItems: "stretch" }}>
          <DashboardPanel title="SOS đang chờ" action="Xem">
            <Stack spacing={2.4}>
              <Stack direction="row" alignItems="flex-end" spacing={1.25}>
                <Typography sx={{ fontSize: { xs: 54, md: 58 }, lineHeight: .9, fontWeight: 400 }}>{pending}</Typography>
                <Chip label="+ khẩn cấp" sx={{ mb: .7, bgcolor: "rgba(245,184,91,.16)", color: "#ffd07a", border: "1px solid rgba(245,184,91,.30)", fontWeight: 900 }} />
              </Stack>
              <Button component={Link} to="/ops/sos" variant="contained" color="secondary" endIcon={<AddIcon />} sx={{ borderRadius: 0, justifyContent: "space-between" }}>
                Mở hàng đợi SOS
              </Button>
            </Stack>
          </DashboardPanel>

          <DashboardPanel title="Xu hướng tiếp nhận SOS" action="Theo tuần">
            <Box sx={{ height: 148, position: "relative" }}>
              <ValueBubble sx={{ left: "45%", top: 18 }}>{Math.round(sosTrend[6].value)} ca</ValueBubble>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sosTrend} margin={{ left: -24, right: 8, top: 26, bottom: 0 }}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-muted)", fontSize: 10 }} />
                  <Area type="monotone" dataKey="value" stroke="var(--color-green-700)" strokeWidth={2.5} fill="rgba(61,107,31,.12)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </DashboardPanel>

          <DashboardPanel title="Mức phủ nhiệm vụ" action="Xem">
            <Stack spacing={2.2}>
              <Stack direction="row" justifyContent="space-between">
                <PercentTag>{Math.min(100, missions * 4)}%</PercentTag>
                <PercentTag tone="cyan">{Math.min(100, warehouses * 8)}%</PercentTag>
              </Stack>
              <Box sx={{ pt: 3 }}>
                <Stack direction="row" spacing={.75} alignItems="center">
                  <Box sx={{ width: `${Math.min(78, Math.max(14, missions * 4))}%`, height: 10, borderRadius: 0, bgcolor: "var(--color-green-700)" }} />
                  <Box sx={{ flex: 1, height: 10, borderRadius: 0, bgcolor: "var(--color-green-200)" }} />
                  <Box sx={{ width: 92, height: 10, borderRadius: 0, bgcolor: "var(--color-green-100)" }} />
                </Stack>
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.1 }}>
                  <Typography sx={miniLabelSx}>SOS</Typography>
                  <Typography sx={miniLabelSx}>Nhiệm vụ</Typography>
                  <Typography sx={miniLabelSx}>Kho hàng</Typography>
                </Stack>
              </Box>
            </Stack>
          </DashboardPanel>

          <DashboardPanel title="Tốc độ quyên góp" action="Theo tuần">
            <Box sx={{ height: 148, position: "relative" }}>
              <ValueBubble sx={{ left: "58%", top: 8 }}>{formatMoney(donations)}</ValueBubble>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={donationBars} margin={{ left: -22, right: 0, top: 28, bottom: 0 }}>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-muted)", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--color-text-muted)", fontSize: 10 }} />
                  <Bar dataKey="value" radius={[999, 999, 999, 999]}>
                    {donationBars.map((entry) => (
                      <Cell key={entry.day} fill={entry.day === "Thu" ? "var(--color-green-700)" : "var(--color-green-200)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </DashboardPanel>

          <DashboardPanel title="Sẵn sàng vận hành" action="Trực tiếp">
            <Box sx={{ height: 152, position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="76%" innerRadius="82%" outerRadius="110%" barSize={10} data={[{ value: readiness }]} startAngle={180} endAngle={0}>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar dataKey="value" cornerRadius={0} fill="var(--color-green-700)" background={{ fill: "var(--color-green-200)" }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <Box sx={{ position: "absolute", inset: "46% 0 auto", textAlign: "center" }}>
                <Typography sx={{ fontSize: 48, lineHeight: 1, fontWeight: 450 }}>{readiness}<Box component="span" sx={{ fontSize: 16 }}>%</Box></Typography>
                <Typography sx={miniLabelSx}>mức sẵn sàng</Typography>
              </Box>
            </Box>
          </DashboardPanel>

          <DashboardPanel title="Tỷ trọng quyên góp theo chiến dịch" action="Theo tuần" sx={{ gridRow: { lg: "span 2" } }}>
            <Stack spacing={2}>
              <Box sx={{ height: 246, position: "relative" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donationShare} dataKey="value" cx="50%" cy="50%" innerRadius={58} outerRadius={92} paddingAngle={6} cornerRadius={12}>
                      {donationShare.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                    </Pie>
                    <Pie data={[{ value: 100 }]} dataKey="value" cx="50%" cy="50%" innerRadius={102} outerRadius={110} fill="var(--color-green-200)" />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ position: "absolute", inset: "86px 0 auto", textAlign: "center" }}>
                  <Typography sx={{ fontSize: 34, fontWeight: 700, lineHeight: 1 }}>{campaigns + missions + warehouses}</Typography>
                  <Typography sx={miniLabelSx}>điểm điều phối</Typography>
                </Box>
              </Box>
              <Stack direction="row" justifyContent="center" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1 }}>
                {donationShare.map((item) => (
                  <Stack key={item.name} direction="row" spacing={.75} alignItems="center">
                    <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: item.color }} />
                    <Typography sx={miniLabelSx}>{item.name}</Typography>
                  </Stack>
                ))}
              </Stack>
              <Stack spacing={1.25}>
                {[
                  { name: "Hàng đợi SOS", meta: `${pending} đang chờ`, color: "var(--color-cream-100)", route: "/ops/sos" },
                  { name: "Nhiệm vụ cứu hộ", meta: `${missions} đang hoạt động`, color: "var(--color-green-700)", route: "/ops/missions" },
                  { name: "Rủi ro kho hàng", meta: `${stock} mặt hàng thiếu`, color: "#f87171", route: "/ops/inventory" },
                ].map((item) => (
                  <Stack key={item.name} direction="row" spacing={1.25} alignItems="center">
                    <Avatar sx={{ width: 34, height: 34, bgcolor: item.color, color: item.color === "var(--color-green-700)" ? "#ffffff" : "var(--color-green-800)", fontSize: 13, fontWeight: 950 }}>{item.name.slice(0, 1)}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 900 }}>{item.name}</Typography>
                      <Typography sx={miniLabelSx}>{item.meta}</Typography>
                    </Box>
                    <Button size="small" component={Link} to={item.route} sx={{ minHeight: 32, borderRadius: 0 }}>
                      Xem
                    </Button>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </DashboardPanel>

          <DashboardPanel title="Vận hành trong tuần" action={`${Math.round(taskCompletion / 10)}/10 việc hoàn tất`} sx={{ gridColumn: { lg: "span 2" } }}>
            <Grid container spacing={2} alignItems="stretch">
              <Grid size={{ xs: 12, md: 5 }}>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={3}>
                    <DualMetric value={taskCompletion} label="phản hồi hoàn tất" />
                    <DualMetric value={deliveryTrust} label="độ tin cậy bàn giao" />
                  </Stack>
                  <Box sx={{ borderRadius: 0, bgcolor: "var(--color-surface-muted)", px: 2, py: 1.25, border: "1px solid var(--color-border)" }}>
                    <Typography sx={{ color: "var(--color-text-muted)", fontSize: 13, fontWeight: 800 }}>
                      Cân bằng cứu trợ ổn định khi rủi ro kho hàng duy trì ở mức thấp.
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1.25} alignItems="center" sx={{ borderRadius: 0, bgcolor: "var(--color-surface-muted)", p: 1.25, border: "1px solid var(--color-border)" }}>
                    <Avatar sx={{ width: 42, height: 42, bgcolor: "var(--color-green-700)", color: "#ffffff", fontWeight: 950 }}>W</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 900 }}>Theo dõi kho hàng</Typography>
                      <Typography sx={miniLabelSx}>Hiện tại, kiểm kê tồn kho</Typography>
                    </Box>
                    <IconButton size="small" sx={smallRoundButtonSx}>×</IconButton>
                    <IconButton size="small" sx={smallRoundButtonSx}>↗</IconButton>
                  </Stack>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <TimelineCard pending={pending} missions={missions} stock={stock} />
              </Grid>
            </Grid>
          </DashboardPanel>
        </Box>
      </QueryState>
    </>
  );
}

const panelSx = {
  p: { xs: 3, md: 3 },
  minHeight: 188,
  borderRadius: 0,
  border: "1px solid var(--color-border)",
  bgcolor: "var(--color-surface)",
  color: "var(--color-text)",
  boxShadow: "var(--shadow-surface)",
  overflow: "visible",
};

const miniLabelSx = { color: "var(--color-text-muted)", fontSize: 11, fontWeight: 750 };
const opsIconButtonSx = { width: 42, height: 42, color: "var(--color-green-700)", border: "1px solid var(--color-border)", bgcolor: "#ffffff", borderRadius: 0, "&:hover": { bgcolor: "var(--color-green-50)" } };
const smallRoundButtonSx = { width: 34, height: 34, color: "var(--color-green-700)", bgcolor: "#ffffff", borderRadius: 0, "&:hover": { bgcolor: "var(--color-green-50)" } };

function DashboardPanel({ title, action, children, sx }: { title: string; action?: string; children: React.ReactNode; sx?: object }) {
  return (
    <Paper variant="outlined" sx={{ ...panelSx, ...sx }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Typography sx={{ fontSize: 15, fontWeight: 900 }}>{title}</Typography>
          {action ? <Chip label={action} size="small" sx={{ bgcolor: "var(--color-green-50)", color: "var(--color-green-800)", fontWeight: 800, border: "1px solid var(--color-border)", borderRadius: 0 }} /> : null}
        </Stack>
        {children}
      </Stack>
    </Paper>
  );
}

function ValueBubble({ children, sx }: { children: React.ReactNode; sx?: object }) {
  return (
    <Box sx={{ position: "absolute", zIndex: 2, px: 1, py: .45, borderRadius: 0, bgcolor: "#ffffff", color: "var(--color-green-800)", fontSize: 11, fontWeight: 950, boxShadow: "none", border: "1px solid var(--color-border)", ...sx }}>
      {children}
    </Box>
  );
}

function PercentTag({ children, tone = "amber" }: { children: React.ReactNode; tone?: "amber" | "cyan" }) {
  return (
    <Box sx={{ px: 1, py: .45, borderRadius: 0, bgcolor: tone === "amber" ? "#ffffff" : "var(--color-green-700)", color: tone === "amber" ? "var(--color-green-800)" : "#ffffff", fontSize: 12, fontWeight: 950 }}>
      {children}
    </Box>
  );
}

const shipmentStatusOrder = Object.values(SHIPMENT_STATUS);

function getShipmentStepState(current: string, next: string) {
  const currentIndex = shipmentStatusOrder.indexOf(current as (typeof shipmentStatusOrder)[number]);
  const nextIndex = shipmentStatusOrder.indexOf(next as (typeof shipmentStatusOrder)[number]);
  if (nextIndex < currentIndex) return "past";
  if (nextIndex === currentIndex) return "current";
  return "next";
}

function shipmentStepButtonSx(state: "past" | "current" | "next") {
  const shared = {
    minWidth: 0,
    px: 1,
    py: .5,
    fontSize: 12,
    lineHeight: 1.25,
    whiteSpace: "nowrap",
    textAlign: "center",
    bgcolor: "transparent",
    boxShadow: "none",
    border: 0,
    flex: "0 0 auto",
  };

  if (state === "past") {
    return {
      ...shared,
      color: "var(--color-text-muted)",
      "&.Mui-disabled": {
        bgcolor: "transparent",
        color: "var(--color-text-muted)",
        opacity: 1,
      },
    };
  }

  if (state === "current") {
    return {
      ...shared,
      position: "relative",
      color: "var(--color-green-800)",
      fontWeight: 950,
      "&.Mui-disabled": {
        bgcolor: "transparent",
        color: "var(--color-green-800)",
        opacity: 1,
      },
      "&::after": {
        content: '""',
        position: "absolute",
        left: 8,
        right: 8,
        bottom: 2,
        height: 2,
        bgcolor: "var(--color-green-700)",
      },
    };
  }

  return {
    ...shared,
    color: "var(--color-green-600)",
    fontWeight: 800,
    "&:hover": {
      bgcolor: "var(--color-green-50)",
      color: "var(--color-green-800)",
    },
  };
}

function DualMetric({ value, label }: { value: number; label: string }) {
  return (
    <Box>
      <Typography sx={{ fontSize: 38, lineHeight: 1, fontWeight: 450 }}>
        {value}<Box component="span" sx={{ color: "var(--color-green-700)", fontSize: 30, fontWeight: 900 }}> %</Box>
      </Typography>
      <Typography sx={{ mt: .5, color: "var(--color-text-muted)", fontSize: 12, fontWeight: 750 }}>{label}</Typography>
    </Box>
  );
}

function TimelineCard({ pending, missions, stock }: { pending: number; missions: number; stock: number }) {
  const rows = [
    { label: "Phân loại", start: 2, span: 26, color: "#f87171" },
    { label: "Phân đội", start: 18, span: 34, color: "var(--color-cream-100)" },
    { label: "Sơ tán", start: 36, span: 30, color: "var(--color-green-600)" },
    { label: "Kiểm kê", start: 8, span: 56, color: "var(--color-green-700)" },
  ];
  return (
    <Box sx={{ height: "100%", minHeight: 196, maxWidth: "100%", borderRadius: 0, bgcolor: "var(--color-surface-muted)", p: 2, position: "relative", overflow: "hidden", border: "1px solid var(--color-border)", boxSizing: "border-box" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={miniLabelSx}>Tiến độ cứu trợ</Typography>
        <PercentTag tone="cyan">{Math.min(100, missions * 5 + pending + stock)}%</PercentTag>
      </Stack>
      <Box sx={{ mt: 2, display: "grid", gridTemplateColumns: "76px minmax(0, 1fr)", columnGap: 1.5, rowGap: 1, position: "relative", maxWidth: "100%" }}>
        <Box aria-hidden="true" sx={{ gridColumn: 2, gridRow: "1 / span 4", position: "relative", overflow: "hidden", borderRadius: 0 }}>
          {[0, 1, 2, 3, 4, 5, 6].map((item) => (
            <Box key={item} sx={{ position: "absolute", top: 0, bottom: 0, left: `${item * 16.66}%`, width: 1, bgcolor: "var(--color-green-100)" }} />
          ))}
          <Box sx={{ position: "absolute", top: 0, bottom: 0, left: "64%", width: 2, bgcolor: "var(--color-green-700)", opacity: .9 }} />
        </Box>
        {rows.map((row, index) => (
          <Box key={row.label} sx={{ display: "contents" }}>
            <Typography sx={{ ...miniLabelSx, alignSelf: "center", color: "var(--color-green-800)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {row.label}
            </Typography>
            <Box sx={{ height: 24, position: "relative", overflow: "hidden", borderRadius: 0 }}>
              <Box
                sx={{
                  position: "absolute",
                  left: `${row.start}%`,
                  width: `${Math.min(row.span, 98 - row.start)}%`,
                  top: 0,
                  bottom: 0,
                  borderRadius: 0,
                  bgcolor: row.color,
                  color: row.color === "var(--color-green-700)" ? "#ffffff" : "var(--color-green-800)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  px: 1,
                  fontSize: 11,
                  fontWeight: 950,
                  whiteSpace: "nowrap",
                }}
              >
                {row.label}
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: "76px minmax(0, 1fr)", columnGap: 1.5, mt: 1 }}>
        <Box />
        <Stack direction="row" justifyContent="space-between" sx={{ minWidth: 0 }}>
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
          <Typography key={day} sx={miniLabelSx}>{day}</Typography>
        ))}
        </Stack>
      </Box>
    </Box>
  );
}

export function OpsSosPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const [status, setStatus] = useState("");
  const cases = useQuery({ queryKey: ["ops-sos", status], queryFn: () => sosApi.coordinatorList({ status, page: 1, limit: 50 }), refetchInterval: 30000 });
  const sortedCases = [...(cases.data?.data ?? [])].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const verify = useMutation({
    mutationFn: ({ id, result }: { id: string; result: "APPROVED" | "REJECTED" }) => sosApi.verify(id, { result }),
    onSuccess: () => {
      showToast("SOS verification updated.", "success");
      queryClient.invalidateQueries({ queryKey: ["ops-sos"] });
    },
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, next }: { id: string; next: string }) => sosApi.updateStatus(id, { status: next }),
    onSuccess: () => {
      showToast("SOS status updated.", "success");
      queryClient.invalidateQueries({ queryKey: ["ops-sos"] });
    },
  });

  return (
    <>
      <PageHeader title="Quản lý SOS" description="Xác minh yêu cầu khẩn cấp và cập nhật trạng thái xử lý cứu hộ." />
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField select label="Trạng thái" value={status} onChange={(event) => setStatus(event.target.value)} sx={{ minWidth: 220 }}>
          <MenuItem value="">Tất cả</MenuItem>
          {Object.values(SOS_STATUS).map((item) => <MenuItem key={item} value={item}><StatusChip value={item} /></MenuItem>)}
        </TextField>
      </Stack>
      <QueryState isLoading={cases.isLoading} error={cases.error} empty={!cases.data?.data.length} refetch={cases.refetch}>
        <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Yêu cầu</TableCell><TableCell>Số người</TableCell><TableCell>Ưu tiên</TableCell><TableCell>Trạng thái</TableCell><TableCell>Thao tác</TableCell></TableRow></TableHead><TableBody>
          {sortedCases.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Typography
                  component={Link}
                  to={`/citizen/sos/${item.id}`}
                  fontWeight={800}
                  sx={{
                    color: "var(--color-green-800)",
                    textDecoration: "none",
                    "&:hover": { color: "var(--color-green-700)", textDecoration: "underline" },
                  }}
                >
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">{item.contactName} - {item.contactPhone}</Typography>
                <Typography variant="caption" color="text.secondary">Tạo lúc {formatDate(item.createdAt)}</Typography>
              </TableCell>
              <TableCell>{item.numPeople}</TableCell>
              <TableCell><StatusChip value={item.priorityLevel} /></TableCell>
              <TableCell><StatusChip value={item.status} /></TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  {item.status === SOS_STATUS.pending ? (
                    <>
                      <Button size="small" startIcon={<CheckIcon />} onClick={() => verify.mutate({ id: item.id, result: "APPROVED" })}>Xác minh</Button>
                      <Button size="small" color="error" startIcon={<CloseIcon />} onClick={() => verify.mutate({ id: item.id, result: "REJECTED" })}>Từ chối</Button>
                    </>
                  ) : null}
                  {item.status === SOS_STATUS.verified ? <Button size="small" onClick={() => updateStatus.mutate({ id: item.id, next: SOS_STATUS.assigned })}>Đánh dấu đã phân công</Button> : null}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody></Table></Paper>
      </QueryState>
    </>
  );
}

export function OpsMissionsPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const [form, setForm] = useState<{ emergencyCaseId: string; rescueTeamId: string; priority: string; title: string }>({
    emergencyCaseId: "",
    rescueTeamId: "",
    priority: PRIORITY.high,
    title: "",
  });
  const missions = useQuery({ queryKey: ["ops-missions"], queryFn: () => missionApi.coordinatorList({ page: 1, limit: 50 }), refetchInterval: 30000 });
  const verifiedCases = useQuery({ queryKey: ["ops-sos", SOS_STATUS.verified, "mission-select"], queryFn: () => sosApi.coordinatorList({ status: SOS_STATUS.verified, page: 1, limit: 50 }), refetchInterval: 30000 });
  const teams = useQuery({ queryKey: ["rescue-teams"], queryFn: () => missionApi.rescueTeams({ page: 1, limit: 50 }) });
  const create = useMutation({
    mutationFn: () => missionApi.create({ ...form, vehicleIds: [] }),
    onSuccess: () => {
      showToast("Nhiệm vụ đã được tạo.", "success");
      setForm({ emergencyCaseId: "", rescueTeamId: "", priority: PRIORITY.high, title: "" });
      queryClient.invalidateQueries({ queryKey: ["ops-missions"] });
    },
  });

  return (
    <>
      <PageHeader title="Phân công nhiệm vụ" description="Tạo nhiệm vụ cứu hộ từ SOS đã xác minh và theo dõi tiến độ nhiệm vụ." />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionPaper>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={900}>Phân công nhiệm vụ</Typography>
              <TextField
                select
                label="Mã yêu cầu khẩn cấp"
                value={form.emergencyCaseId}
                onChange={(e) => {
                  const selectedCase = verifiedCases.data?.data.find((item) => item.id === e.target.value);
                  setForm({
                    ...form,
                    emergencyCaseId: e.target.value,
                    title: form.title || selectedCase?.title || "",
                    priority: selectedCase?.priorityLevel || form.priority,
                  });
                }}
              >
                <MenuItem value="" disabled>
                  {verifiedCases.isLoading ? "Đang tải yêu cầu khẩn cấp..." : "Chọn yêu cầu khẩn cấp đã xác minh"}
                </MenuItem>
                {(verifiedCases.data?.data ?? []).map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    <Stack spacing={0.25} sx={{ py: 0.5, minWidth: 0 }}>
                      <Typography fontWeight={900} noWrap>{item.title}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {item.contactName} - {item.contactPhone} - {item.numPeople} người
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </TextField>
              <TextField label="Tiêu đề" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <TextField select label="Đội cứu hộ" value={form.rescueTeamId} onChange={(e) => setForm({ ...form, rescueTeamId: e.target.value })}>
                <MenuItem value="" disabled>{teams.isLoading ? "Đang tải đội cứu hộ..." : "Chọn đội cứu hộ"}</MenuItem>
                {(teams.data?.data ?? []).map((team) => <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>)}
              </TextField>
              <TextField select label="Mức ưu tiên" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {Object.values(PRIORITY).map((item) => <MenuItem key={item} value={item}><StatusChip value={item} /></MenuItem>)}
              </TextField>
              <Button variant="contained" startIcon={<AddIcon />} disabled={!form.emergencyCaseId || !form.rescueTeamId || create.isPending} onClick={() => create.mutate()}>
                Tạo nhiệm vụ
              </Button>
            </Stack>
          </SectionPaper>
        </Grid>
        <Grid size={{ xs: 12, lg: 8 }}>
          <QueryState isLoading={missions.isLoading} error={missions.error} empty={!missions.data?.data.length} refetch={missions.refetch}>
            <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Nhiệm vụ</TableCell><TableCell>Đội</TableCell><TableCell>Ưu tiên</TableCell><TableCell>Trạng thái</TableCell><TableCell>Cập nhật</TableCell></TableRow></TableHead><TableBody>
              {missions.data?.data.map((mission) => (
                <TableRow key={mission.id}>
                  <TableCell>{mission.code}</TableCell>
                  <TableCell>{mission.rescueTeamName}</TableCell>
                  <TableCell><StatusChip value={mission.priority} /></TableCell>
                  <TableCell><StatusChip value={mission.status} /></TableCell>
                  <TableCell>{formatDate(mission.completedAt ?? mission.assignedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody></Table></Paper>
          </QueryState>
        </Grid>
      </Grid>
    </>
  );
}

export function WarehousesPage() {
  const warehouses = useQuery({ queryKey: ["warehouses"], queryFn: inventoryApi.warehouses });
  const lowStock = useQuery({ queryKey: ["low-stock"], queryFn: inventoryApi.lowStock });
  return (
    <>
      <PageHeader title="Kho hàng và tồn kho" description="Theo dõi độ phủ kho hàng và rủi ro thiếu hàng." />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}><MetricCard label="Kho hàng" value={warehouses.data?.length ?? 0} /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><MetricCard label="Sắp hết hàng" value={lowStock.data?.length ?? 0} tone="red" /></Grid>
        <Grid size={{ xs: 12 }}><QueryState isLoading={warehouses.isLoading} error={warehouses.error} empty={!warehouses.data?.length} refetch={warehouses.refetch}>
          <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Tên kho</TableCell><TableCell>Địa chỉ</TableCell><TableCell>Quản lý</TableCell><TableCell>Trạng thái</TableCell></TableRow></TableHead><TableBody>
            {warehouses.data?.map((warehouse) => (
              <TableRow key={warehouse.id}><TableCell>{warehouse.name}</TableCell><TableCell>{warehouse.address}</TableCell><TableCell>{warehouse.managerName}</TableCell><TableCell><StatusChip value={warehouse.status} /></TableCell></TableRow>
            ))}
          </TableBody></Table></Paper>
        </QueryState></Grid>
      </Grid>
    </>
  );
}

export function InventoryPage() {
  const warehouses = useQuery({ queryKey: ["warehouses"], queryFn: inventoryApi.warehouses });
  const [warehouseId, setWarehouseId] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const selectedId = warehouseId || warehouses.data?.[0]?.id || "";
  const items = useQuery({ queryKey: ["warehouse-items", selectedId], queryFn: () => inventoryApi.warehouseItems(selectedId, { page: 1, limit: 50 }), enabled: Boolean(selectedId) });
  const selectedItem = items.data?.data.find((item) => item.id === selectedItemId) ?? items.data?.data[0];
  return (
    <>
      <PageHeader title="Mặt hàng tồn kho" description="Kiểm tra tồn kho, số lượng giữ chỗ và ngưỡng cảnh báo theo từng kho." />
      <Stack spacing={2}>
        <TextField select label="Kho hàng" value={selectedId} onChange={(event) => setWarehouseId(event.target.value)} sx={{ maxWidth: 420 }}>
          <MenuItem value="" disabled>{warehouses.isLoading ? "Đang tải kho hàng..." : "Chọn kho hàng"}</MenuItem>
          {(warehouses.data ?? []).map((warehouse) => <MenuItem key={warehouse.id} value={warehouse.id}>{warehouse.name}</MenuItem>)}
        </TextField>
        <QueryState isLoading={items.isLoading} error={items.error} empty={!items.data?.data.length} refetch={items.refetch}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Mặt hàng</TableCell><TableCell>Số lượng</TableCell><TableCell>Đã giữ chỗ</TableCell><TableCell>Tối thiểu</TableCell><TableCell>Trạng thái</TableCell></TableRow></TableHead><TableBody>
                {items.data?.data.map((item) => (
                  <TableRow key={item.id} hover selected={selectedItem?.id === item.id} onClick={() => setSelectedItemId(item.id)} sx={{ cursor: "pointer" }}><TableCell>{item.itemName}</TableCell><TableCell>{item.quantity} {item.unit}</TableCell><TableCell>{item.reservedQuantity}</TableCell><TableCell>{item.minQuantity}</TableCell><TableCell><StatusChip value={item.status} /></TableCell></TableRow>
                ))}
              </TableBody></Table></Paper>
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <SectionPaper>
                <Stack spacing={1.5}>
                  <Typography variant="h6" fontWeight={900}>{selectedItem?.itemName ?? "Chi tiết mặt hàng"}</Typography>
                  {selectedItem ? (
                    <>
                      <StatusChip value={selectedItem.status} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">Kho hàng</Typography>
                        <Typography fontWeight={800}>{selectedItem.warehouseName}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Danh mục</Typography>
                        <Typography fontWeight={800}>{selectedItem.categoryName ?? "Chưa phân loại"}</Typography>
                      </Box>
                      <Grid container spacing={1.5}>
                        <Grid size={6}>
                          <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 1.5 }}>
                            <Typography variant="caption" color="text.secondary">Có sẵn</Typography>
                            <Typography fontWeight={900}>{selectedItem.quantity} {selectedItem.unit}</Typography>
                          </Box>
                        </Grid>
                        <Grid size={6}>
                          <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 1.5 }}>
                            <Typography variant="caption" color="text.secondary">Đã giữ</Typography>
                            <Typography fontWeight={900}>{selectedItem.reservedQuantity}</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      <Typography variant="body2" color="text.secondary">Tồn tối thiểu: {selectedItem.minQuantity} {selectedItem.unit}</Typography>
                      <Typography variant="body2" color="text.secondary">Hạn dùng: {selectedItem.expiryDate ? formatDate(selectedItem.expiryDate) : "Không có hạn dùng"}</Typography>
                    </>
                  ) : (
                    <Typography color="text.secondary">Chọn một mặt hàng để xem chi tiết tồn kho.</Typography>
                  )}
                </Stack>
              </SectionPaper>
            </Grid>
          </Grid>
        </QueryState>
      </Stack>
    </>
  );
}

export function ShipmentsPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const [status, setStatus] = useState("");
  const shipments = useQuery({ queryKey: ["shipments", status], queryFn: () => inventoryApi.shipments({ status, page: 1, limit: 50 }), refetchInterval: 30000 });
  const update = useMutation({
    mutationFn: ({ id, next }: { id: string; next: string }) => inventoryApi.updateShipmentStatus(id, { status: next }),
    onSuccess: () => {
      showToast("Trạng thái vận chuyển đã được cập nhật.", "success");
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
    },
  });
  return (
    <>
      <PageHeader title="Quản lý vận chuyển" description="Theo dõi giao nhận và cập nhật trạng thái vận chuyển trong quy trình hậu cần." />
      <TextField select label="Trạng thái" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 220, mb: 2 }}>
        <MenuItem value="">Tất cả</MenuItem>{Object.values(SHIPMENT_STATUS).map((item) => <MenuItem key={item} value={item}><StatusChip value={item} /></MenuItem>)}
      </TextField>
      <QueryState isLoading={shipments.isLoading} error={shipments.error} empty={!shipments.data?.data.length} refetch={shipments.refetch}>
        <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Chuyến hàng</TableCell><TableCell>Xuất phát</TableCell><TableCell>Tài xế</TableCell><TableCell>Trạng thái</TableCell><TableCell sx={{ minWidth: 520 }}>Thao tác</TableCell></TableRow></TableHead><TableBody>
          {shipments.data?.data.map((shipment) => (
            <TableRow key={shipment.id}><TableCell>{shipment.emergencyCaseTitle ?? shipment.id}</TableCell><TableCell>{shipment.warehouseName}</TableCell><TableCell>{shipment.driverName}</TableCell><TableCell><StatusChip value={shipment.status} /></TableCell><TableCell sx={{ minWidth: 520, whiteSpace: "nowrap" }}>
              <Stack direction="row" spacing={1.5} flexWrap="nowrap" useFlexGap sx={{ alignItems: "center", overflowX: "auto", pb: .25 }}>
                {Object.values(SHIPMENT_STATUS).map((next) => {
                  const stepState = getShipmentStepState(shipment.status, next);
                  return (
                    <Button
                      key={next}
                      size="small"
                      disabled={stepState !== "next" || update.isPending}
                      sx={shipmentStepButtonSx(stepState)}
                      onClick={() => update.mutate({ id: shipment.id, next })}
                    >
                      {STATUS_LABELS[next]}
                    </Button>
                  );
                })}
              </Stack>
            </TableCell></TableRow>
          ))}
        </TableBody></Table></Paper>
      </QueryState>
    </>
  );
}

export function CampaignAdminPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const campaigns = useQuery({ queryKey: ["campaigns-admin"], queryFn: () => donationApi.campaigns({ page: 1, limit: 50 }) });
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => donationApi.updateCampaignStatus(id, status),
    onSuccess: () => {
      showToast("Trạng thái chiến dịch đã được cập nhật.", "success");
      queryClient.invalidateQueries({ queryKey: ["campaigns-admin"] });
    },
  });

  return (
    <>
      <PageHeader title="Quản trị chiến dịch" description="Theo dõi trạng thái chiến dịch và tiến độ quyên góp công khai." />
      <QueryState isLoading={campaigns.isLoading} error={campaigns.error} empty={!campaigns.data?.data.length} refetch={campaigns.refetch}>
        <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Tên chiến dịch</TableCell><TableCell>Đã quyên góp</TableCell><TableCell>Mục tiêu</TableCell><TableCell>Trạng thái</TableCell><TableCell>Khu vực</TableCell><TableCell>Thao tác</TableCell></TableRow></TableHead><TableBody>
          {campaigns.data?.data.map((campaign) => <TableRow key={campaign.id}><TableCell>{campaign.name}</TableCell><TableCell>{formatMoney(campaign.currentAmount)}</TableCell><TableCell>{formatMoney(campaign.targetAmount)}</TableCell><TableCell><StatusChip value={campaign.status} /></TableCell><TableCell>{campaign.affectedArea}</TableCell><TableCell><Stack direction="row" spacing={1}><Button size="small" disabled={campaign.status === CAMPAIGN_STATUS.active || updateStatus.isPending} onClick={() => updateStatus.mutate({ id: campaign.id, status: CAMPAIGN_STATUS.active })}>Kích hoạt</Button><Button size="small" disabled={campaign.status === CAMPAIGN_STATUS.paused || updateStatus.isPending} onClick={() => updateStatus.mutate({ id: campaign.id, status: CAMPAIGN_STATUS.paused })}>Tạm dừng</Button><Button size="small" color="error" disabled={campaign.status === CAMPAIGN_STATUS.closed || updateStatus.isPending} onClick={() => updateStatus.mutate({ id: campaign.id, status: CAMPAIGN_STATUS.closed })}>Đóng</Button></Stack></TableCell></TableRow>)}
        </TableBody></Table></Paper>
      </QueryState>
    </>
  );
}

export function ProcurementPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const procurements = useQuery({ queryKey: ["procurements"], queryFn: () => aidApi.procurements({ page: 1, limit: 50 }) });
  const action = useMutation({
    mutationFn: ({ id, type }: { id: string; type: "approve" | "pay" | "deliver" }) =>
      type === "approve" ? aidApi.approveProcurement(id) : type === "pay" ? aidApi.payProcurement(id, "BANK_TRANSFER") : aidApi.deliverProcurement(id),
    onSuccess: () => {
      showToast("Hồ sơ mua sắm đã được cập nhật.", "success");
      queryClient.invalidateQueries({ queryKey: ["procurements"] });
    },
  });
  return <WorkflowTable title="Mua sắm cứu trợ" rows={procurements.data?.data ?? []} loading={procurements.isLoading} error={procurements.error} refetch={procurements.refetch} actions={(row) => (
    <Stack direction="row" spacing={1}><Button size="small" onClick={() => action.mutate({ id: row.id, type: "approve" })}>Duyệt</Button><Button size="small" onClick={() => action.mutate({ id: row.id, type: "pay" })}>Thanh toán</Button><Button size="small" onClick={() => action.mutate({ id: row.id, type: "deliver" })}>Bàn giao</Button></Stack>
  )} />;
}

export function AllocationPlansPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const plans = useQuery({ queryKey: ["allocation-plans"], queryFn: () => aidApi.allocationPlans({ page: 1, limit: 50 }) });
  const action = useMutation({
    mutationFn: ({ id, type }: { id: string; type: "submit" | "approve" | "close" }) =>
      type === "submit" ? aidApi.submitAllocationPlan(id) : type === "approve" ? aidApi.approveAllocationPlan(id, { status: "APPROVED" }) : aidApi.closeAllocationPlan(id),
    onSuccess: () => {
      showToast("Kế hoạch phân bổ đã được cập nhật.", "success");
      queryClient.invalidateQueries({ queryKey: ["allocation-plans"] });
    },
  });
  return <WorkflowTable title="Kế hoạch phân bổ" rows={plans.data?.data ?? []} loading={plans.isLoading} error={plans.error} refetch={plans.refetch} actions={(row) => (
    <Stack direction="row" spacing={1}><Button size="small" onClick={() => action.mutate({ id: row.id, type: "submit" })}>Gửi duyệt</Button><Button size="small" onClick={() => action.mutate({ id: row.id, type: "approve" })}>Duyệt</Button><Button size="small" onClick={() => action.mutate({ id: row.id, type: "close" })}>Đóng</Button></Stack>
  )} />;
}

export function DisbursementsPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const rows = useQuery({ queryKey: ["disbursements"], queryFn: () => aidApi.disbursements({ page: 1, limit: 50 }) });
  const execute = useMutation({
    mutationFn: (id: string) => aidApi.executeDisbursement(id, { invoiceUrl: "https://example.com/invoice-placeholder.png", actualAmount: 0 }),
    onSuccess: () => {
      showToast("Yêu cầu giải ngân đã được gửi.", "success");
      queryClient.invalidateQueries({ queryKey: ["disbursements"] });
    },
  });
  return <WorkflowTable title="Giải ngân" rows={rows.data?.data ?? []} loading={rows.isLoading} error={rows.error} refetch={rows.refetch} actions={(row) => <Button size="small" onClick={() => execute.mutate(row.id)}>Thực hiện</Button>} />;
}

interface WorkflowRow {
  id: string;
  campaignName?: string | null;
  areaName?: string | null;
  itemName?: string;
  totalAmount?: number;
  totalPlannedAmount?: number;
  amount?: number;
  status: string;
  createdAt: string;
}

function WorkflowTable({ title, rows, loading, error, refetch, actions }: { title: string; rows: WorkflowRow[]; loading: boolean; error: unknown; refetch: () => void; actions: (row: WorkflowRow) => React.ReactNode }) {
  return (
    <>
      <PageHeader title={title} description="Hồ sơ tài chính và cứu trợ được đồng bộ từ hệ thống vận hành Tâm Lũ." />
      <QueryState isLoading={loading} error={error} empty={!rows.length} refetch={refetch}>
        <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Bản ghi</TableCell><TableCell>Số tiền</TableCell><TableCell>Trạng thái</TableCell><TableCell>Ngày tạo</TableCell><TableCell>Thao tác</TableCell></TableRow></TableHead><TableBody>
          {rows.map((row) => <TableRow key={row.id}><TableCell>{row.campaignName ?? row.areaName ?? row.itemName ?? row.id}</TableCell><TableCell>{formatMoney(row.totalAmount ?? row.totalPlannedAmount ?? row.amount ?? 0)}</TableCell><TableCell><StatusChip value={row.status} /></TableCell><TableCell>{formatDate(row.createdAt)}</TableCell><TableCell>{actions(row)}</TableCell></TableRow>)}
        </TableBody></Table></Paper>
      </QueryState>
    </>
  );
}

export function UsersPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const [role, setRole] = useState("");
  const users = useQuery({ queryKey: ["admin-users", role], queryFn: () => adminApi.users({ role, page: 1, limit: 50 }) });
  const approve = useMutation({
    mutationFn: ({ id, isApproved }: { id: string; isApproved: boolean }) => adminApi.approveUser(id, isApproved),
    onSuccess: () => {
      showToast("Phê duyệt người dùng đã được cập nhật.", "success");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
  return (
    <>
      <PageHeader title="Quản lý người dùng" description="Phê duyệt tài khoản vận hành và kiểm tra quyền truy cập theo vai trò." />
      <TextField select label="Vai trò" value={role} onChange={(e) => setRole(e.target.value)} sx={{ minWidth: 240, mb: 2 }}>
        <MenuItem value="">Tất cả</MenuItem>{Object.values(ROLES).map((item) => <MenuItem key={item} value={item}>{ROLE_LABELS[item]}</MenuItem>)}
      </TextField>
      <QueryState isLoading={users.isLoading} error={users.error} empty={!users.data?.data.length} refetch={users.refetch}>
        <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Họ tên</TableCell><TableCell>Email</TableCell><TableCell>Số điện thoại</TableCell><TableCell>Trạng thái</TableCell><TableCell>Thao tác</TableCell></TableRow></TableHead><TableBody>
          {users.data?.data.map((user) => <TableRow key={user.id}><TableCell>{user.fullName}</TableCell><TableCell>{user.email}</TableCell><TableCell>{user.phone}</TableCell><TableCell><StatusChip value={user.status} /></TableCell><TableCell><Stack direction="row" spacing={1}><Button size="small" onClick={() => approve.mutate({ id: user.id, isApproved: true })}>Duyệt</Button><Button size="small" color="error" onClick={() => approve.mutate({ id: user.id, isApproved: false })}>Từ chối</Button></Stack></TableCell></TableRow>)}
        </TableBody></Table></Paper>
      </QueryState>
      <Alert severity="info" sx={{ mt: 2 }}>Mã vai trò: {Object.entries(ROLE_IDS).map(([key, value]) => `${key}=${value}`).join(", ")}</Alert>
    </>
  );
}

export function VolunteersPage() {
  const rows = useQuery({ queryKey: ["volunteers"], queryFn: () => volunteerApi.coordinatorList({ page: 1, limit: 50 }) });
  return <SimpleObjectList title="Tình nguyện viên" description="Danh sách kỹ năng, khu vực hỗ trợ và trạng thái phân công của tình nguyện viên." query={rows} primaryKey="skills" />;
}

export function OrganizationsPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const rows = useQuery({ queryKey: ["organizations"], queryFn: organizationApi.list });
  const list = Array.isArray(rows.data) ? rows.data : rows.data?.data;
  const verify = useMutation({
    mutationFn: ({ id, isVerified }: { id: string; isVerified: boolean }) => organizationApi.verify(id, isVerified),
    onSuccess: () => {
      showToast("Trạng thái xác minh tổ chức đã được cập nhật.", "success");
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  return (
    <>
      <PageHeader title="Tổ chức đối tác" description="Rà soát hồ sơ tổ chức phối hợp và trạng thái xác minh." />
      <QueryState isLoading={rows.isLoading} error={rows.error} empty={!list?.length} refetch={rows.refetch}>
        <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Tên tổ chức</TableCell><TableCell>Loại hình</TableCell><TableCell>Điểm tin cậy</TableCell><TableCell>Trạng thái</TableCell><TableCell>Thao tác</TableCell></TableRow></TableHead><TableBody>
          {(list ?? []).map((org) => <TableRow key={org.id}><TableCell>{org.name}</TableCell><TableCell>{org.type}</TableCell><TableCell>{org.trustScore}</TableCell><TableCell><Stack direction="row" spacing={1}><StatusChip value={org.status} /><StatusChip value={org.isVerified ? "VERIFIED" : "PENDING"} /></Stack></TableCell><TableCell><Stack direction="row" spacing={1}><Button size="small" disabled={verify.isPending || org.isVerified} onClick={() => verify.mutate({ id: org.id, isVerified: true })}>Duyệt</Button><Button size="small" color="error" disabled={verify.isPending || !org.isVerified} onClick={() => verify.mutate({ id: org.id, isVerified: false })}>Hủy xác minh</Button></Stack></TableCell></TableRow>)}
        </TableBody></Table></Paper>
      </QueryState>
    </>
  );
}

export function ComplaintsPage() {
  const rows = useQuery({ queryKey: ["admin-complaints"], queryFn: () => monitoringApi.adminComplaints({ page: 1, limit: 50 }) });
  return <SimpleObjectList title="Khiếu nại" description="Theo dõi phản ánh của cộng đồng và các vấn đề cần điều phối xử lý." query={rows} primaryKey="title" />;
}

export function FraudPage() {
  const rows = useQuery({ queryKey: ["fraud-cases"], queryFn: () => monitoringApi.fraudCases({ page: 1, limit: 50 }) });
  return <SimpleObjectList title="Nghi vấn gian lận" description="Rà soát các tín hiệu bất thường trong chiến dịch, quyên góp và vận hành cứu trợ." query={rows} primaryKey="description" />;
}

export function AuditLogsPage() {
  const rows = useQuery({ queryKey: ["audit-logs"], queryFn: () => adminApi.auditLogs({ page: 1, limit: 50 }) });
  return <SimpleObjectList title="Nhật ký kiểm toán" description="Lịch sử thao tác hệ thống phục vụ minh bạch và truy vết trách nhiệm." query={rows} primaryKey="action" />;
}

function SimpleObjectList({ title, description, query, primaryKey }: { title: string; description?: string; query: { isLoading: boolean; error: unknown; data?: { data: unknown[] }; refetch: () => void }; primaryKey: string }) {
  return <SimpleStaticList title={title} description={description} rows={query.data?.data ?? []} loading={query.isLoading} error={query.error} refetch={query.refetch} primaryKey={primaryKey} />;
}

function SimpleStaticList({ title, description = "Dữ liệu vận hành từ phân hệ tương ứng của hệ thống.", rows, loading = false, error, refetch, primaryKey = "name" }: { title: string; description?: string; rows: unknown[]; loading?: boolean; error?: unknown; refetch?: () => void; primaryKey?: string }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <QueryState isLoading={loading} error={error} empty={!rows.length} refetch={refetch}>
        <Grid container spacing={2} alignItems="stretch">
          {rows.map((row, index) => {
            const record = row as Record<string, unknown>;
            return (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={String(record.id ?? index)}>
                <SectionPaper sx={{ height: "100%" }}>
                  <Stack spacing={1.5} sx={{ minHeight: 88, height: "100%", justifyContent: "space-between" }}>
                    <Typography fontWeight={900} sx={{ lineHeight: 1.45 }}>
                      {String(record[primaryKey] ?? record.name ?? record.id ?? "Bản ghi")}
                    </Typography>
                    {record.status ? (
                      <Box sx={{ width: "100%", "& .MuiChip-root": { width: "100%", justifyContent: "center" } }}>
                        <StatusChip value={String(record.status)} />
                      </Box>
                    ) : null}
                    <Typography variant="body2" color="text.secondary">{String(record.email ?? record.description ?? record.notes ?? "")}</Typography>
                  </Stack>
                </SectionPaper>
              </Grid>
            );
          })}
        </Grid>
      </QueryState>
    </>
  );
}
