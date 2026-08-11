import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SearchIcon from "@mui/icons-material/Search";
import { Alert, Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, MenuItem, Paper, Stack, Tab, Table, TableBody, TableCell, TableHead, TableRow, Tabs, TextField, Typography } from "@mui/material";
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
import type { AreaAssessment, Complaint, EmergencyCase, Procurement, User } from "@/shared/api/domain";
import { getErrorMessage } from "@/shared/api/client";
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

const ROLE_ALIASES: Record<string, string[]> = {
  ADMIN: ["ADMIN", "QUAN_TRI", "QUAN_TRI_VIEN"],
  COORDINATOR: ["COORDINATOR", "DIEU_PHOI", "DIEU_PHOI_VIEN"],
  FINANCIAL_OFFICER: ["FINANCIAL_OFFICER", "FINANCE", "FINANCIAL", "ACCOUNTANT", "ACCOUNTING", "KE_TOAN", "KETOAN"],
};

function normalizeRole(value: string) {
  return value
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]+/g, "_");
}

function hasOperationalRole(roles: string[], role: keyof typeof ROLE_ALIASES) {
  const normalizedRoles = roles.map(normalizeRole);
  return ROLE_ALIASES[role].some((alias) => normalizedRoles.includes(alias));
}

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

const approvalRequiredRoles = new Set<string>([ROLES.coordinator, ROLES.rescueTeam]);
const approvalRequiredRoleHints = [
  "COORDINATOR",
  "RESCUE_TEAM",
  "RESCUETEAM",
  "RESCUE TEAM",
  "DIEU PHOI",
  "DIEU PHOI VIEN",
  "DOI CUU HO",
  "DOI CUUHO",
];

function userNeedsOperationalApproval(user: User, activeRoleFilter: string) {
  if (isOperationalRole(activeRoleFilter)) return true;

  const userRoles = getUserRoleValues(user);
  if (userRoles.some(isOperationalRole)) return true;

  const status = normalizeRoleValue(user.status);
  return userRoles.length === 0 && (status === "PENDING" || status === "WAITING_APPROVAL" || status === "AWAITING_APPROVAL");
}

function getUserRoleValues(user: User) {
  return [
    user.role,
    user.roleCode,
    user.roleName,
    ...(Array.isArray(user.roles) ? user.roles : []),
  ].filter(Boolean).map((value) => String(value).trim());
}

function isOperationalRole(value?: string | null) {
  if (!value) return false;
  const normalized = normalizeRoleValue(value).replace(/^ROLE_/, "");
  return approvalRequiredRoles.has(normalized) || approvalRequiredRoleHints.some((hint) => normalized.includes(hint));
}

function normalizeRoleValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

function getUserRoleLabel(user: User) {
  const values = getUserRoleValues(user);
  if (!values.length) return "Chưa xác định";

  return values
    .map((value) => {
      const normalized = normalizeRoleValue(value).replace(/^ROLE_/, "");
      if (normalized in ROLE_LABELS) return ROLE_LABELS[normalized as keyof typeof ROLE_LABELS];
      if (isOperationalRole(value)) return normalized.includes("RESCUE") || normalized.includes("DOI CUU") ? "Đội cứu hộ" : "Điều phối viên";
      return value;
    })
    .join(", ");
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
  const totalWork = Math.max(pending + missions + stock, 1);
  const readiness = Math.max(18, Math.min(100, Math.round(((missions + 1) / Math.max(totalWork + 1, 1)) * 100)));
  const statusCards = [
    { label: "SOS chờ xử lý", value: pending, color: "#c94f4f", helper: "cần phân loại" },
    { label: "Nhiệm vụ", value: missions, color: "var(--color-green-700)", helper: "đang triển khai" },
    { label: "Rủi ro kho", value: stock, color: "var(--color-green-600)", helper: "cần theo dõi" },
  ];

  return (
    <Box sx={{ height: "100%", minHeight: 228, maxWidth: "100%", borderRadius: 0, bgcolor: "var(--color-surface-muted)", p: 2, position: "relative", overflow: "hidden", border: "1px solid var(--color-border)", boxSizing: "border-box" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography sx={{ color: "var(--color-green-800)", fontSize: 13, fontWeight: 950 }}>Tiến độ cứu trợ</Typography>
          <Typography sx={miniLabelSx}>Các điểm nghẽn cần điều phối trong tuần</Typography>
        </Box>
        <PercentTag tone="cyan">{readiness}%</PercentTag>
      </Stack>

      <Box sx={{ mt: 1.5, display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 1 }}>
        {statusCards.map((item) => (
          <Stack key={item.label} spacing={1} sx={{ border: "1px solid var(--color-border)", bgcolor: "#ffffff", px: 1.25, py: 1.1, minWidth: 0 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
              <Typography sx={{ color: "var(--color-green-800)", fontSize: 12, lineHeight: 1.2, fontWeight: 900 }}>{item.label}</Typography>
              <Typography sx={{ color: "var(--color-green-800)", fontSize: 22, lineHeight: 1, fontWeight: 950 }}>{item.value}</Typography>
            </Stack>
            <Box sx={{ height: 8, bgcolor: "var(--color-green-100)", overflow: "hidden" }}>
              <Box sx={{ height: "100%", width: `${Math.min(100, Math.max(8, (item.value / totalWork) * 100))}%`, bgcolor: item.color }} />
            </Box>
            <Typography sx={miniLabelSx}>{item.helper}</Typography>
          </Stack>
        ))}
      </Box>
    </Box>
  );
}
export function OpsSosPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const [status, setStatus] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const cases = useQuery({ queryKey: ["ops-sos", status], queryFn: () => sosApi.coordinatorList({ status, page: 1, limit: 50 }), refetchInterval: 30000 });
  const sortedCases = [...(cases.data?.data ?? [])].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const filteredCases = sortedCases.filter((item) => matchesSosSearch(item, search));
  const verify = useMutation({
    mutationFn: ({ id, result }: { id: string; result: "APPROVED" | "REJECTED" }) => sosApi.verify(id, { result }),
    onSuccess: () => {
      showToast("Trạng thái xác minh SOS đã được cập nhật.", "success");
      queryClient.invalidateQueries({ queryKey: ["ops-sos"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });

  return (
    <>
      <PageHeader title="Quản lý SOS" description="Xác minh yêu cầu khẩn cấp và cập nhật trạng thái xử lý cứu hộ." />
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField select label="Trạng thái" value={status} onChange={(event) => setStatus(event.target.value)} sx={{ minWidth: 220 }}>
          <MenuItem value="">Tất cả</MenuItem>
          {Object.values(SOS_STATUS).map((item) => <MenuItem key={item} value={item}><StatusChip value={item} /></MenuItem>)}
        </TextField>
        <TextField
          label="Tìm theo tiêu đề, mã yêu cầu, SĐT..."
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") setSearch(searchInput.trim());
          }}
          sx={{ minWidth: { md: 360 }, flex: { md: 1 } }}
        />
        <Button variant="contained" startIcon={<SearchIcon />} onClick={() => setSearch(searchInput.trim())}>
          Tìm kiếm
        </Button>
        {search ? (
          <Button variant="outlined" onClick={() => {
            setSearch("");
            setSearchInput("");
          }}>
            Xóa lọc
          </Button>
        ) : null}
      </Stack>
      <QueryState isLoading={cases.isLoading} error={cases.error} empty={!cases.data?.data.length} refetch={cases.refetch}>
        <Paper variant="outlined" sx={{ overflowX: "auto" }}><Table size="small" sx={{ minWidth: 980 }}><TableHead><TableRow><TableCell>Mã yêu cầu</TableCell><TableCell>Yêu cầu</TableCell><TableCell>Số người</TableCell><TableCell>Ưu tiên</TableCell><TableCell>Trạng thái</TableCell><TableCell>Thao tác</TableCell></TableRow></TableHead><TableBody>
          {filteredCases.length ? filteredCases.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Typography fontWeight={900} sx={{ color: "var(--color-green-800)", whiteSpace: "nowrap" }}>
                  {getSosRequestCode(item)}
                </Typography>
              </TableCell>
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
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button size="small" component={Link} to={`/citizen/sos/${item.id}`}>
                    Xem chi tiết
                  </Button>
                  {isPendingSosStatus(item.status) ? (
                    <>
                      <Button size="small" startIcon={<CheckIcon />} onClick={() => verify.mutate({ id: item.id, result: "APPROVED" })}>Xác minh</Button>
                      <Button size="small" color="error" startIcon={<CloseIcon />} onClick={() => verify.mutate({ id: item.id, result: "REJECTED" })}>Từ chối</Button>
                    </>
                  ) : null}
                </Stack>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={6}>
                <Typography color="text.secondary">
                  Không tìm thấy yêu cầu SOS phù hợp với từ khóa “{search}”.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody></Table></Paper>
      </QueryState>
    </>
  );
}

export function OpsMissionsPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const [showAllMissions, setShowAllMissions] = useState(false);
  const [showMissionForm, setShowMissionForm] = useState(false);
  const [form, setForm] = useState<{ emergencyCaseId: string; rescueTeamId: string; priority: string; title: string; volunteerProfileIds: string[] }>({
    emergencyCaseId: "",
    rescueTeamId: "",
    priority: PRIORITY.high,
    title: "",
    volunteerProfileIds: [],
  });
  const missions = useQuery({ queryKey: ["ops-missions"], queryFn: () => missionApi.coordinatorList({ page: 1, limit: 50 }), refetchInterval: 30000 });
  const verifiedCases = useQuery({ queryKey: ["ops-sos", SOS_STATUS.verified, "mission-select"], queryFn: () => sosApi.coordinatorList({ status: SOS_STATUS.verified, page: 1, limit: 50 }), refetchInterval: 30000 });
  const teams = useQuery({ queryKey: ["rescue-teams"], queryFn: () => missionApi.rescueTeams({ page: 1, limit: 50 }) });
  const volunteers = useQuery({ queryKey: ["coordinator-volunteers", "mission-select"], queryFn: () => volunteerApi.coordinatorList({ page: 1, limit: 50 }) });
  const availableTeams = (teams.data?.data ?? []).filter((team) => isReadyRescueTeamStatus(team.status));
  const verifiedVolunteers = (volunteers.data?.data ?? []).filter((volunteer) => volunteer.idVerified || volunteer.status?.toUpperCase() === "VERIFIED");
  const latestMissions = [...(missions.data?.data ?? [])].sort((a, b) => new Date(b.assignedAt ?? b.completedAt ?? 0).getTime() - new Date(a.assignedAt ?? a.completedAt ?? 0).getTime());
  const visibleMissions = showAllMissions ? latestMissions : latestMissions.slice(0, 4);
  const create = useMutation({
    mutationFn: () => missionApi.create({ ...form, vehicleIds: [] }),
    onSuccess: () => {
      showToast("Nhiệm vụ đã được tạo.", "success");
      setForm({ emergencyCaseId: "", rescueTeamId: "", priority: PRIORITY.high, title: "", volunteerProfileIds: [] });
      setShowMissionForm(false);
      queryClient.invalidateQueries({ queryKey: ["ops-missions"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });

  return (
    <>
      <PageHeader title="Phân công nhiệm vụ" description="Tạo nhiệm vụ cứu hộ từ SOS đã xác minh và theo dõi tiến độ nhiệm vụ." />
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setShowMissionForm((value) => !value)}
        sx={{ mb: 2, alignSelf: { xs: "stretch", md: "flex-start" } }}
      >
        {showMissionForm ? "Ẩn form phân công" : "Phân công nhiệm vụ"}
      </Button>
      <Grid container spacing={2.5}>
        {showMissionForm ? (
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
                {availableTeams.length ? availableTeams.map((team) => <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>) : (
                  <MenuItem disabled>{teams.isLoading ? "Đang tải đội cứu hộ..." : "Không có đội cứu hộ khả dụng"}</MenuItem>
                )}
              </TextField>
              <TextField
                select
                label="Tình nguyện viên hỗ trợ"
                value={form.volunteerProfileIds}
                onChange={(e) => {
                  const value = e.target.value;
                  setForm({ ...form, volunteerProfileIds: typeof value === "string" ? value.split(",") : value });
                }}
                SelectProps={{ multiple: true }}
                helperText="Chỉ hiển thị hồ sơ tình nguyện đã xác minh."
              >
                {verifiedVolunteers.length ? verifiedVolunteers.map((volunteer) => (
                  <MenuItem key={volunteer.id} value={volunteer.id}>
                    {volunteer.skills} {volunteer.availableAreas ? `- ${volunteer.availableAreas}` : ""}
                  </MenuItem>
                )) : (
                  <MenuItem disabled>Chưa có tình nguyện viên đã xác minh</MenuItem>
                )}
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
        ) : null}
        <Grid size={{ xs: 12, lg: showMissionForm ? 8 : 12 }}>
          <QueryState isLoading={missions.isLoading} error={missions.error} empty={!missions.data?.data.length} refetch={missions.refetch}>
            <Paper variant="outlined">
              <Table size="small">
                <TableHead><TableRow><TableCell>Nhiệm vụ</TableCell><TableCell>Đội</TableCell><TableCell>Ưu tiên</TableCell><TableCell>Trạng thái</TableCell><TableCell>Cập nhật</TableCell></TableRow></TableHead>
                <TableBody>
                  {visibleMissions.map((mission) => (
                    <TableRow key={mission.id}>
                      <TableCell>{mission.code}</TableCell>
                      <TableCell>{mission.rescueTeamName}</TableCell>
                      <TableCell><StatusChip value={mission.priority} /></TableCell>
                      <TableCell><StatusChip value={mission.status} /></TableCell>
                      <TableCell>{formatDate(mission.completedAt ?? mission.assignedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
            {latestMissions.length > 4 ? (
              <Box sx={{ mt: 1.5, textAlign: "right" }}>
                <Button size="small" onClick={() => setShowAllMissions((value) => !value)}>
                  {showAllMissions ? "Thu gọn" : "Hiển thị thêm"}
                </Button>
              </Box>
            ) : null}
          </QueryState>
        </Grid>
      </Grid>
    </>
  );
}

type EmergencyCaseWithCode = EmergencyCase & {
  code?: string | null;
  caseCode?: string | null;
  requestCode?: string | null;
  emergencyCode?: string | null;
};

function getSosRequestCode(item: EmergencyCaseWithCode) {
  return item.code ?? item.caseCode ?? item.requestCode ?? item.emergencyCode ?? item.id.slice(0, 8).toUpperCase();
}

function matchesSosSearch(item: EmergencyCase, keyword: string) {
  const normalizedKeyword = normalizeSearchText(keyword);
  if (!normalizedKeyword) return true;
  const searchable = [
    getSosRequestCode(item),
    item.id,
    item.title,
    item.description,
    item.contactName,
    item.contactPhone,
    item.address,
    item.emergencyType,
    item.priorityLevel,
    item.status,
  ];
  return normalizeSearchText(searchable.filter(Boolean).join(" ")).includes(normalizedKeyword);
}

function normalizeSearchText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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

export function WarehousesPage() {
  return <InventoryPage />;
}

export function ShipmentsPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const [status, setStatus] = useState("");
  const [showShipmentForm, setShowShipmentForm] = useState(false);
  const [shipmentForm, setShipmentForm] = useState({
    warehouseId: "",
    targetWarehouseId: "",
    aidAllocationPlanId: "",
    vehicleId: "",
    items: [{ inventoryItemId: "", quantity: 1 }],
  });
  const shipments = useQuery({ queryKey: ["shipments", status], queryFn: () => inventoryApi.shipments({ status, page: 1, limit: 50 }), refetchInterval: 30000 });
  const warehouses = useQuery({ queryKey: ["warehouses", "shipment-form"], queryFn: inventoryApi.warehouses });
  const sourceWarehouseId = shipmentForm.warehouseId || warehouses.data?.[0]?.id || "";
  const warehouseItems = useQuery({
    queryKey: ["warehouse-items", sourceWarehouseId, "shipment-form"],
    queryFn: () => inventoryApi.warehouseItems(sourceWarehouseId, { page: 1, limit: 50 }),
    enabled: Boolean(sourceWarehouseId),
  });
  const allocationPlans = useQuery({ queryKey: ["allocation-plans", "shipment-form"], queryFn: () => aidApi.allocationPlans({ page: 1, limit: 50 }) });
  const vehicles = useQuery({ queryKey: ["vehicles", "shipment-form"], queryFn: () => missionApi.vehicles({ page: 1, limit: 50 }) });
  const readyVehicles = (vehicles.data?.data ?? []).filter((vehicle) => isReadyVehicleStatus(vehicle.status));
  const selectedVehicle = readyVehicles.find((vehicle) => vehicle.id === shipmentForm.vehicleId);
  const hasValidShipmentItems = shipmentForm.items.every((item) => item.inventoryItemId && Number(item.quantity) > 0);
  const createShipment = useMutation({
    mutationFn: () => inventoryApi.createShipment({
      warehouseId: sourceWarehouseId,
      targetWarehouseId: shipmentForm.targetWarehouseId || null,
      aidAllocationPlanId: shipmentForm.aidAllocationPlanId || null,
      vehicleId: shipmentForm.vehicleId || null,
      items: shipmentForm.items.map((item) => ({ inventoryItemId: item.inventoryItemId, quantity: Number(item.quantity) })),
    }),
    onSuccess: () => {
      showToast("Chuyến hàng đã được lập từ kho nguồn đến kho tiền phương.", "success");
      setShipmentForm({ warehouseId: "", targetWarehouseId: "", aidAllocationPlanId: "", vehicleId: "", items: [{ inventoryItemId: "", quantity: 1 }] });
      setShowShipmentForm(false);
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      queryClient.invalidateQueries({ queryKey: ["warehouse-items"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });
  const update = useMutation({
    mutationFn: ({ id, next }: { id: string; next: string }) => inventoryApi.updateShipmentStatus(id, { status: next }),
    onSuccess: () => {
      showToast("Trạng thái vận chuyển đã được cập nhật.", "success");
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });
  return (
    <>
      <PageHeader title="Quản lý vận chuyển" description="Theo dõi giao nhận và cập nhật trạng thái vận chuyển trong quy trình hậu cần." />
      <Stack spacing={2.5} sx={{ mb: 2 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowShipmentForm((value) => !value)} sx={{ alignSelf: { xs: "stretch", md: "flex-start" } }}>
            {showShipmentForm ? "Ẩn form lập chuyến" : "Lập chuyến hàng"}
          </Button>
          <TextField select label="Trạng thái" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 220 }}>
            <MenuItem value="">Tất cả</MenuItem>{Object.values(SHIPMENT_STATUS).map((item) => <MenuItem key={item} value={item}><StatusChip value={item} /></MenuItem>)}
          </TextField>
        </Stack>
        {showShipmentForm ? (
          <SectionPaper>
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" fontWeight={900}>Lập chuyến về Kho Tiền Phương</Typography>
                <Typography variant="body2" color="text.secondary">
                  Điều phối viên chọn hàng từ Kho Tổng, chuyển về kho tiền phương gần vùng lũ hoặc theo kế hoạch phân bổ đã duyệt.
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField fullWidth select label="Kho nguồn" value={sourceWarehouseId} onChange={(event) => setShipmentForm({ ...shipmentForm, warehouseId: event.target.value, items: [{ inventoryItemId: "", quantity: 1 }] })}>
                    <MenuItem value="" disabled>{warehouses.isLoading ? "Đang tải kho..." : "Chọn kho nguồn"}</MenuItem>
                    {(warehouses.data ?? []).map((warehouse) => <MenuItem key={warehouse.id} value={warehouse.id}>{warehouse.name}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField fullWidth select label="Kho tiền phương" value={shipmentForm.targetWarehouseId} onChange={(event) => setShipmentForm({ ...shipmentForm, targetWarehouseId: event.target.value })}>
                    <MenuItem value="">Không chọn</MenuItem>
                    {(warehouses.data ?? []).filter((warehouse) => warehouse.id !== sourceWarehouseId).map((warehouse) => <MenuItem key={warehouse.id} value={warehouse.id}>{warehouse.name}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField fullWidth select label="Kế hoạch phân bổ" value={shipmentForm.aidAllocationPlanId} onChange={(event) => setShipmentForm({ ...shipmentForm, aidAllocationPlanId: event.target.value })}>
                    <MenuItem value="">Không gắn kế hoạch</MenuItem>
                    {(allocationPlans.data?.data ?? []).map((plan) => <MenuItem key={plan.id} value={plan.id}>{plan.areaName ?? plan.campaignName ?? plan.id}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <TextField fullWidth select label="Phương tiện" value={shipmentForm.vehicleId} onChange={(event) => setShipmentForm({ ...shipmentForm, vehicleId: event.target.value })}>
                    <MenuItem value="">Chưa chỉ định</MenuItem>
                    {readyVehicles.length ? readyVehicles.map((vehicle) => (
                      <MenuItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.vehicleName}
                      </MenuItem>
                    )) : (
                      <MenuItem disabled>{vehicles.isLoading ? "Đang tải phương tiện..." : "Không có phương tiện sẵn sàng"}</MenuItem>
                    )}
                  </TextField>
                </Grid>
              </Grid>
              {selectedVehicle ? (
                <Alert severity="info">
                  Tài xế/phương tiện: <strong>{selectedVehicle.driverName ?? selectedVehicle.assignedDriverName ?? "Chưa có tên tài xế"}</strong>
                  {(selectedVehicle.driverPhone ?? selectedVehicle.assignedDriverPhone) ? ` - ${selectedVehicle.driverPhone ?? selectedVehicle.assignedDriverPhone}` : ""}
                  {selectedVehicle.licensePlate ? ` - Biển số ${selectedVehicle.licensePlate}` : ""}
                </Alert>
              ) : null}
              <Stack spacing={1.5}>
                {shipmentForm.items.map((item, index) => (
                  <Grid container spacing={1.5} alignItems="center" key={index}>
                    <Grid size={{ xs: 12, md: 7 }}>
                      <TextField fullWidth select label="Mặt hàng từ kho nguồn" value={item.inventoryItemId} onChange={(event) => {
                        const items = [...shipmentForm.items];
                        items[index] = { ...item, inventoryItemId: event.target.value };
                        setShipmentForm({ ...shipmentForm, items });
                      }}>
                        <MenuItem value="" disabled>{warehouseItems.isLoading ? "Đang tải tồn kho..." : "Chọn mặt hàng"}</MenuItem>
                        {(warehouseItems.data?.data ?? []).map((inventoryItem) => (
                          <MenuItem key={inventoryItem.id} value={inventoryItem.id}>
                            {inventoryItem.itemName} - còn {inventoryItem.quantity - inventoryItem.reservedQuantity} {inventoryItem.unit}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField fullWidth label="Số lượng chuyển" type="number" value={item.quantity} onChange={(event) => {
                        const items = [...shipmentForm.items];
                        items[index] = { ...item, quantity: Number(event.target.value) };
                        setShipmentForm({ ...shipmentForm, items });
                      }} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                      <Button fullWidth size="small" color="error" disabled={shipmentForm.items.length === 1} onClick={() => setShipmentForm({ ...shipmentForm, items: shipmentForm.items.filter((_, itemIndex) => itemIndex !== index) })}>
                        Xóa
                      </Button>
                    </Grid>
                  </Grid>
                ))}
              </Stack>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setShipmentForm({ ...shipmentForm, items: [...shipmentForm.items, { inventoryItemId: "", quantity: 1 }] })}>
                  Thêm mặt hàng
                </Button>
                <Button variant="contained" disabled={!sourceWarehouseId || !hasValidShipmentItems || createShipment.isPending} onClick={() => createShipment.mutate()}>
                  Tạo chuyến hàng
                </Button>
              </Stack>
            </Stack>
          </SectionPaper>
        ) : null}
      </Stack>
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

export function AreaAssessmentsPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const [status, setStatus] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState<AreaAssessment | null>(null);
  const assessments = useQuery({ queryKey: ["area-assessments", status], queryFn: () => aidApi.areaAssessments({ status, page: 1, limit: 50 }), refetchInterval: 30000 });
  const verify = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: "VERIFIED" | "REJECTED" }) =>
      aidApi.verifyAreaAssessment(id, { status: nextStatus, notes: nextStatus === "VERIFIED" ? "Điều phối viên đã xác minh nhu cầu thực địa." : "Báo cáo cần rà soát lại." }),
    onSuccess: () => {
      showToast("Trạng thái khảo sát thực địa đã được cập nhật.", "success");
      queryClient.invalidateQueries({ queryKey: ["area-assessments"] });
    },
  });

  return (
    <>
      <PageHeader title="Duyệt khảo sát nhu cầu" description="Xác minh báo cáo thiệt hại và nhu cầu khẩn cấp do đội cứu hộ gửi từ hiện trường." />
      <TextField select label="Trạng thái" value={status} onChange={(event) => setStatus(event.target.value)} sx={{ minWidth: 240, mb: 2 }}>
        <MenuItem value="">Tất cả</MenuItem>
        {["PENDING", "VERIFIED", "REJECTED"].map((item) => <MenuItem key={item} value={item}><StatusChip value={item} /></MenuItem>)}
      </TextField>
      <QueryState isLoading={assessments.isLoading} error={assessments.error} empty={!assessments.data?.data.length} refetch={assessments.refetch}>
        <Paper variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Khu vực</TableCell>
                <TableCell>Hộ ảnh hưởng</TableCell>
                <TableCell>Nhu cầu</TableCell>
                <TableCell>Ưu tiên</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assessments.data?.data.map((assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell>
                    <Typography fontWeight={900}>{assessment.areaName}</Typography>
                    <Typography variant="body2" color="text.secondary">{assessment.ward}, {assessment.district}, {assessment.province}</Typography>
                  </TableCell>
                  <TableCell>{assessment.householdsAffected}</TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      {assessment.needs.length ? assessment.needs.map((need) => (
                        <Typography key={need.id} variant="body2">{need.itemType}: {need.quantity} {need.unit}</Typography>
                      )) : <Typography variant="body2" color="text.secondary">Chưa nhập nhu cầu chi tiết</Typography>}
                    </Stack>
                  </TableCell>
                  <TableCell><StatusChip value={assessment.priorityLevel} /></TableCell>
                  <TableCell><StatusChip value={assessment.status} /></TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" onClick={() => setSelectedAssessment(assessment)}>Xem chi tiết</Button>
                      <Button size="small" disabled={assessment.status === "VERIFIED" || verify.isPending} onClick={() => verify.mutate({ id: assessment.id, nextStatus: "VERIFIED" })}>Xác minh</Button>
                      <Button size="small" color="error" disabled={assessment.status === "REJECTED" || verify.isPending} onClick={() => verify.mutate({ id: assessment.id, nextStatus: "REJECTED" })}>Từ chối</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </QueryState>
      <Dialog open={Boolean(selectedAssessment)} onClose={() => setSelectedAssessment(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 900, color: "var(--color-green-800)" }}>Chi tiết khảo sát nhu cầu</DialogTitle>
        <DialogContent>
          {selectedAssessment ? (
            <Stack spacing={2}>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <MetricCard label="Khu vực" value={selectedAssessment.areaName} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <MetricCard label="Số hộ bị ảnh hưởng" value={String(selectedAssessment.householdsAffected)} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <MetricCard label="Trạng thái" value={STATUS_LABELS[selectedAssessment.status] ?? selectedAssessment.status} />
                </Grid>
              </Grid>
              <SectionPaper>
                <Stack spacing={0.75}>
                  <Typography fontWeight={900}>Địa bàn</Typography>
                  <Typography color="text.secondary">
                    {selectedAssessment.ward}, {selectedAssessment.district}, {selectedAssessment.province}
                  </Typography>
                  <Typography fontWeight={900}>Mức ngập / ưu tiên</Typography>
                  <Stack direction="row" spacing={1}>
                    <StatusChip value={selectedAssessment.floodSeverity} />
                    <StatusChip value={selectedAssessment.priorityLevel} />
                  </Stack>
                  {selectedAssessment.notes ? <Typography color="text.secondary">{selectedAssessment.notes}</Typography> : null}
                </Stack>
              </SectionPaper>
              <Paper variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nhu cầu</TableCell>
                      <TableCell>Số lượng</TableCell>
                      <TableCell>Đơn vị</TableCell>
                      <TableCell>Ghi chú</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedAssessment.needs.length ? selectedAssessment.needs.map((need) => (
                      <TableRow key={need.id}>
                        <TableCell>{need.itemType}</TableCell>
                        <TableCell>{need.quantity}</TableCell>
                        <TableCell>{need.unit}</TableCell>
                        <TableCell>{need.notes ?? "-"}</TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4}>Chưa có nhu cầu chi tiết.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Paper>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedAssessment(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function CampaignAdminPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const roles = useAuthStore((state) => state.roles);
  const isAdmin = roles.includes(ROLES.admin);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    description: "",
    targetAmount: 100000000,
    affectedArea: "",
    startDate: toDateInputValue(new Date()),
    endDate: toDateInputValue(addDays(new Date(), 30)),
    coverImageUrl: "",
  });
  const campaigns = useQuery({ queryKey: ["campaigns-admin"], queryFn: () => donationApi.campaigns({ page: 1, limit: 50 }) });
  const createCampaign = useMutation({
    mutationFn: async () => {
      const coverImageUrl = campaignForm.coverImageUrl.trim();
      const created = await donationApi.createCampaign({
        ...campaignForm,
        coverImageUrl: isInlineImageDataUrl(coverImageUrl) ? "" : coverImageUrl,
        targetAmount: Number(campaignForm.targetAmount),
      });
      if (isAdmin && created.status !== CAMPAIGN_STATUS.active) {
        try {
          return await donationApi.updateCampaignStatus(created.id, CAMPAIGN_STATUS.active);
        } catch {
          showToast("Chiến dịch đã được tạo nhưng chưa kích hoạt được. Vui lòng dùng nút Kích hoạt trong danh sách.", "warning");
        }
      }
      return created;
    },
    onSuccess: () => {
      showToast(isAdmin ? "Chiến dịch đã được tạo và kích hoạt." : "Chiến dịch đã được tạo, đang chờ admin duyệt.", "success");
      setCampaignForm({
        name: "",
        description: "",
        targetAmount: 100000000,
        affectedArea: "",
        startDate: toDateInputValue(new Date()),
        endDate: toDateInputValue(addDays(new Date(), 30)),
        coverImageUrl: "",
      });
      setShowCampaignForm(false);
      queryClient.invalidateQueries({ queryKey: ["campaigns-admin"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => donationApi.updateCampaignStatus(id, status),
    onSuccess: () => {
      showToast("Trạng thái chiến dịch đã được cập nhật.", "success");
      queryClient.invalidateQueries({ queryKey: ["campaigns-admin"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });

  return (
    <>
      <PageHeader title="Quản trị chiến dịch" description="Điều phối viên tạo chiến dịch gây quỹ ở dạng bản nháp. Admin xét duyệt và kích hoạt trước khi công khai." />
      <Stack spacing={2.5}>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => setShowCampaignForm((value) => !value)}
        sx={{ alignSelf: { xs: "stretch", md: "flex-start" } }}
      >
        {showCampaignForm ? "Ẩn form tạo chiến dịch" : "Tạo chiến dịch gây quỹ"}
      </Button>
      {showCampaignForm ? (
      <SectionPaper>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={900}>Tạo chiến dịch gây quỹ</Typography>
            <Typography variant="body2" color="text.secondary">
              {isAdmin ? "Admin tạo chiến dịch sẽ kích hoạt ngay." : "Chiến dịch do điều phối viên tạo sẽ chuyển sang trạng thái bản nháp để admin duyệt."}
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Tên chiến dịch" value={campaignForm.name} onChange={(event) => setCampaignForm({ ...campaignForm, name: event.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Mục tiêu quyên góp" type="number" value={campaignForm.targetAmount} onChange={(event) => setCampaignForm({ ...campaignForm, targetAmount: Number(event.target.value) })} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Khu vực ảnh hưởng" value={campaignForm.affectedArea} onChange={(event) => setCampaignForm({ ...campaignForm, affectedArea: event.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Ngày bắt đầu" type="date" value={campaignForm.startDate} onChange={(event) => setCampaignForm({ ...campaignForm, startDate: event.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth label="Ngày kết thúc" type="date" value={campaignForm.endDate} onChange={(event) => setCampaignForm({ ...campaignForm, endDate: event.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={1}>
                <Button component="label" variant="outlined" startIcon={<AddIcon />} sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}>
                  Chọn ảnh bìa chiến dịch
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      showToast("Backend hiện chỉ nhận URL ảnh bìa. Vui lòng nhập URL ảnh; chiến dịch vẫn có thể tạo không cần ảnh bìa.", "warning");
                      event.currentTarget.value = "";
                    }}
                  />
                </Button>
                <TextField fullWidth label="Hoặc nhập URL ảnh bìa" value={campaignForm.coverImageUrl} onChange={(event) => setCampaignForm({ ...campaignForm, coverImageUrl: event.target.value })} placeholder="https://..." />
              </Stack>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth multiline minRows={3} label="Mô tả chiến dịch" value={campaignForm.description} onChange={(event) => setCampaignForm({ ...campaignForm, description: event.target.value })} />
            </Grid>
          </Grid>
          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              disabled={!campaignForm.name || !campaignForm.affectedArea || createCampaign.isPending}
              onClick={() => {
                if (isInlineImageDataUrl(campaignForm.coverImageUrl)) {
                  showToast("Ảnh dạng base64 không được gửi lên backend. Chiến dịch sẽ được tạo không kèm ảnh bìa.", "warning");
                }
                createCampaign.mutate();
              }}
            >
              {isAdmin ? "Tạo và kích hoạt" : "Tạo bản nháp chờ duyệt"}
            </Button>
          </Box>
        </Stack>
      </SectionPaper>
      ) : null}
      <QueryState isLoading={campaigns.isLoading} error={campaigns.error} empty={!campaigns.data?.data.length} refetch={campaigns.refetch}>
        <Paper variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Tên chiến dịch</TableCell>
                <TableCell>Đã quyên góp</TableCell>
                <TableCell>Mục tiêu</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Khu vực</TableCell>
                <TableCell>Chi tiết</TableCell>
                {isAdmin ? <TableCell>Thao tác</TableCell> : null}
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.data?.data.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>{campaign.name}</TableCell>
                  <TableCell>{formatMoney(campaign.currentAmount)}</TableCell>
                  <TableCell>{formatMoney(campaign.targetAmount)}</TableCell>
                  <TableCell><StatusChip value={campaign.status} /></TableCell>
                  <TableCell>{campaign.affectedArea}</TableCell>
                  <TableCell>
                    <Button component={Link} to={`/campaigns/${campaign.id}`} size="small">
                      Xem chi tiết
                    </Button>
                  </TableCell>
                  {isAdmin ? (
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" disabled={campaign.status === CAMPAIGN_STATUS.active || updateStatus.isPending} onClick={() => updateStatus.mutate({ id: campaign.id, status: CAMPAIGN_STATUS.active })}>Kích hoạt</Button>
                        <Button size="small" disabled={campaign.status === CAMPAIGN_STATUS.paused || updateStatus.isPending} onClick={() => updateStatus.mutate({ id: campaign.id, status: CAMPAIGN_STATUS.paused })}>Tạm dừng</Button>
                        <Button size="small" color="error" disabled={campaign.status === CAMPAIGN_STATUS.closed || updateStatus.isPending} onClick={() => updateStatus.mutate({ id: campaign.id, status: CAMPAIGN_STATUS.closed })}>Đóng</Button>
                      </Stack>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </QueryState>
      </Stack>
    </>
  );
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isInlineImageDataUrl(value?: string | null) {
  return /^data:image\/[a-z0-9.+-]+;base64,/i.test(value?.trim() ?? "");
}

function isReadyVehicleStatus(status?: string | null) {
  if (!status) return false;
  return ["AVAILABLE", "READY", "ACTIVE", "IDLE", "SAN_SANG"].includes(normalizeWorkflowStatus(status));
}

function isReadyRescueTeamStatus(status?: string | null) {
  if (!status) return false;
  return ["AVAILABLE", "READY", "ACTIVE", "IDLE", "SAN_SANG"].includes(normalizeWorkflowStatus(status));
}

export function ProcurementPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const roles = useAuthStore((state) => state.roles);
  const canCreateProcurement = hasOperationalRole(roles, "ADMIN") || hasOperationalRole(roles, "COORDINATOR");
  const canReviewProcurement = hasOperationalRole(roles, "ADMIN") || hasOperationalRole(roles, "FINANCIAL_OFFICER");
  const [showProcurementForm, setShowProcurementForm] = useState(false);
  const [selectedProcurement, setSelectedProcurement] = useState<Procurement | null>(null);
  const [payingProcurement, setPayingProcurement] = useState<Procurement | null>(null);
  const [procurementPaymentReceiptUrl, setProcurementPaymentReceiptUrl] = useState("");
  const [procurementForm, setProcurementForm] = useState({
    campaignId: "",
    supplierId: "",
    warehouseId: "",
    items: [{ itemName: "Gạo", quantity: 100, unit: "kg", pricePerUnit: 15000 }],
  });
  const procurements = useQuery({ queryKey: ["procurements"], queryFn: () => aidApi.procurements({ page: 1, limit: 50 }) });
  const campaigns = useQuery({ queryKey: ["campaigns-admin", "procurement-select"], queryFn: () => donationApi.campaigns({ page: 1, limit: 50 }), enabled: canCreateProcurement });
  const suppliers = useQuery({ queryKey: ["suppliers"], queryFn: aidApi.suppliers, enabled: canCreateProcurement });
  const warehouses = useQuery({ queryKey: ["warehouses"], queryFn: inventoryApi.warehouses, enabled: canCreateProcurement });
  const selectedProcurementDetail = useQuery({
    queryKey: ["procurement-detail", selectedProcurement?.id],
    queryFn: () => aidApi.procurement(selectedProcurement?.id ?? ""),
    enabled: Boolean(selectedProcurement?.id),
  });
  const procurementForDialog = selectedProcurementDetail.data ?? selectedProcurement;
  const procurementItemsForDialog = getProcurementItems(procurementForDialog);
  const procurementTotal = procurementForm.items.reduce(
    (total, item) => total + Number(item.quantity) * Number(item.pricePerUnit),
    0,
  );
  const createProcurement = useMutation({
    mutationFn: () => aidApi.createProcurement({
      campaignId: procurementForm.campaignId,
      supplierId: procurementForm.supplierId,
      warehouseId: procurementForm.warehouseId,
      items: procurementForm.items.map((item) => ({
        itemName: item.itemName,
        quantity: Number(item.quantity),
        unit: item.unit,
        pricePerUnit: Number(item.pricePerUnit),
      })),
    }),
    onSuccess: () => {
      showToast("Đề xuất mua vật tư đã được gửi cho kế toán duyệt.", "success");
      setProcurementForm({
        campaignId: "",
        supplierId: "",
        warehouseId: "",
        items: [{ itemName: "Gạo", quantity: 100, unit: "kg", pricePerUnit: 15000 }],
      });
      setShowProcurementForm(false);
      queryClient.invalidateQueries({ queryKey: ["procurements"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });
  const hasValidProcurementItems = procurementForm.items.every((item) => item.itemName && Number(item.quantity) > 0 && item.unit && Number(item.pricePerUnit) > 0);
  const action = useMutation({
    mutationFn: ({ id, type, receiptUrl }: { id: string; type: "approve" | "pay" | "deliver"; receiptUrl?: string }) =>
      type === "approve" ? aidApi.approveProcurement(id) : type === "pay" ? aidApi.payProcurement(id, "BANK_TRANSFER", receiptUrl) : aidApi.deliverProcurement(id),
    onSuccess: () => {
      showToast("Hồ sơ mua sắm đã được cập nhật. Ngân sách được khóa giữ sau khi duyệt.", "success");
      setPayingProcurement(null);
      setProcurementPaymentReceiptUrl("");
      queryClient.invalidateQueries({ queryKey: ["procurements"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });
  return (
    <Stack spacing={2.5}>
      {canCreateProcurement ? (
        <Stack spacing={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowProcurementForm((value) => !value)}
              sx={{ alignSelf: { xs: "stretch", md: "flex-start" } }}
            >
              {showProcurementForm ? "Ẩn form đề xuất" : "Đề xuất vật tư"}
            </Button>
          {showProcurementForm ? (
            <SectionPaper>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6" fontWeight={900}>Đề xuất mua vật tư</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Điều phối viên lập đơn mua nhiều vật tư từ nhà cung cấp về Kho Tổng. Kế toán duyệt để hệ thống khóa giữ ngân sách, tránh chi tiêu vượt quỹ.
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      select
                      label="Chiến dịch sử dụng ngân sách"
                      value={procurementForm.campaignId}
                      onChange={(event) => setProcurementForm({ ...procurementForm, campaignId: event.target.value })}
                    >
                      <MenuItem value="" disabled>{campaigns.isLoading ? "Đang tải chiến dịch..." : "Chọn chiến dịch"}</MenuItem>
                      {(campaigns.data?.data ?? []).map((campaign) => <MenuItem key={campaign.id} value={campaign.id}>{campaign.name}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      select
                      label="Nhà cung cấp"
                      value={procurementForm.supplierId}
                      onChange={(event) => setProcurementForm({ ...procurementForm, supplierId: event.target.value })}
                    >
                      <MenuItem value="" disabled>{suppliers.isLoading ? "Đang tải nhà cung cấp..." : "Chọn nhà cung cấp"}</MenuItem>
                      {(suppliers.data ?? []).map((supplier) => <MenuItem key={supplier.id} value={supplier.id}>{supplier.name}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      fullWidth
                      select
                      label="Kho nhận"
                      value={procurementForm.warehouseId}
                      onChange={(event) => setProcurementForm({ ...procurementForm, warehouseId: event.target.value })}
                    >
                      <MenuItem value="" disabled>{warehouses.isLoading ? "Đang tải kho..." : "Chọn Kho Tổng"}</MenuItem>
                      {(warehouses.data ?? []).map((warehouse) => <MenuItem key={warehouse.id} value={warehouse.id}>{warehouse.name}</MenuItem>)}
                    </TextField>
                  </Grid>
                </Grid>
                <Stack spacing={1.5}>
                  {procurementForm.items.map((item, index) => (
                    <Grid container spacing={1.5} alignItems="center" key={index}>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                          fullWidth
                          label="Tên vật tư"
                          value={item.itemName}
                          onChange={(event) => {
                            const items = [...procurementForm.items];
                            items[index] = { ...item, itemName: event.target.value };
                            setProcurementForm({ ...procurementForm, items });
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                        <TextField
                          fullWidth
                          label="Số lượng"
                          type="number"
                          value={item.quantity}
                          onChange={(event) => {
                            const items = [...procurementForm.items];
                            items[index] = { ...item, quantity: Number(event.target.value) };
                            setProcurementForm({ ...procurementForm, items });
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                        <TextField
                          fullWidth
                          label="Đơn vị"
                          value={item.unit}
                          onChange={(event) => {
                            const items = [...procurementForm.items];
                            items[index] = { ...item, unit: event.target.value };
                            setProcurementForm({ ...procurementForm, items });
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                        <TextField
                          fullWidth
                          label="Đơn giá"
                          type="number"
                          value={item.pricePerUnit}
                          onChange={(event) => {
                            const items = [...procurementForm.items];
                            items[index] = { ...item, pricePerUnit: Number(event.target.value) };
                            setProcurementForm({ ...procurementForm, items });
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <Typography fontWeight={900} sx={{ color: "var(--color-green-800)" }}>
                          {formatMoney(Number(item.quantity) * Number(item.pricePerUnit))}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 1 }}>
                        <Button
                          fullWidth
                          size="small"
                          color="error"
                          disabled={procurementForm.items.length === 1}
                          onClick={() => setProcurementForm({ ...procurementForm, items: procurementForm.items.filter((_, itemIndex) => itemIndex !== index) })}
                        >
                          Xóa
                        </Button>
                      </Grid>
                    </Grid>
                  ))}
                </Stack>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between">
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setProcurementForm({
                      ...procurementForm,
                      items: [...procurementForm.items, { itemName: "", quantity: 1, unit: "kg", pricePerUnit: 0 }],
                    })}
                  >
                    Thêm vật tư
                  </Button>
                  <MetricCard label="Tổng tạm tính" value={formatMoney(Number.isFinite(procurementTotal) ? procurementTotal : 0)} />
                </Stack>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  disabled={!procurementForm.campaignId || !procurementForm.supplierId || !procurementForm.warehouseId || !hasValidProcurementItems || createProcurement.isPending}
                  onClick={() => createProcurement.mutate()}
                  sx={{ alignSelf: { xs: "stretch", md: "flex-start" } }}
                >
                  Gửi đề xuất mua vật tư
                </Button>
              </Stack>
            </SectionPaper>
          ) : null}
        </Stack>
      ) : null}
      <WorkflowTable title="Danh sách đề xuất mua vật tư" rows={procurements.data?.data ?? []} loading={procurements.isLoading} error={procurements.error} refetch={procurements.refetch} actions={(row) => (
        canReviewProcurement ? (
          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={() => setSelectedProcurement(row as Procurement)}>Xem</Button>
            <Button size="small" disabled={!canRunProcurementAction(row.status, "approve") || action.isPending} onClick={() => action.mutate({ id: row.id, type: "approve" })}>Duyệt và khóa ngân sách</Button>
            <Button size="small" disabled={!canRunProcurementAction(row.status, "pay") || action.isPending} onClick={() => setPayingProcurement(row as Procurement)}>Thanh toán</Button>
            <Button size="small" disabled={!canRunProcurementAction(row.status, "deliver") || action.isPending} onClick={() => action.mutate({ id: row.id, type: "deliver" })}>Nhập kho</Button>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">Chờ kế toán duyệt</Typography>
        )
      )} />
      <Dialog open={Boolean(selectedProcurement)} onClose={() => setSelectedProcurement(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 900, color: "var(--color-green-800)" }}>Danh sách vật tư đề xuất</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, md: 4 }}>
                <MetricCard label="Chiến dịch" value={procurementForDialog?.campaignName ?? "Chưa có thông tin"} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <MetricCard label="Nhà cung cấp" value={procurementForDialog?.supplierName ?? "Chưa có thông tin"} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <MetricCard label="Kho nhận" value={procurementForDialog?.warehouseName ?? "Chưa có thông tin"} />
              </Grid>
            </Grid>
            {selectedProcurementDetail.isLoading ? (
              <Typography variant="body2" color="text.secondary">Đang tải danh sách vật tư...</Typography>
            ) : null}
            <Paper variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Vật tư</TableCell>
                    <TableCell>Số lượng</TableCell>
                    <TableCell>Đơn vị</TableCell>
                    <TableCell>Đơn giá</TableCell>
                    <TableCell>Thành tiền</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {procurementItemsForDialog.length ? procurementItemsForDialog.map((item, index) => {
                    const quantity = Number(item.quantity ?? 1);
                    const pricePerUnit = item.pricePerUnit ?? item.unitPrice ?? (quantity > 0 ? (item.totalAmount ?? item.amount ?? 0) / quantity : 0);
                    const lineTotal = item.totalAmount ?? item.amount ?? quantity * pricePerUnit;
                    return (
                    <TableRow key={item.id ?? index}>
                      <TableCell>{item.itemName ?? item.name ?? item.itemType ?? "Vật tư"}</TableCell>
                      <TableCell>{quantity}</TableCell>
                      <TableCell>{item.unit ?? "-"}</TableCell>
                      <TableCell>{formatMoney(pricePerUnit)}</TableCell>
                      <TableCell>{formatMoney(lineTotal)}</TableCell>
                    </TableRow>
                    );
                  }) : (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography color="text.secondary">Chưa có dữ liệu vật tư trong đề xuất này.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
            <MetricCard label="Tổng đề xuất" value={formatMoney(procurementForDialog?.totalAmount ?? 0)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedProcurement(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={Boolean(payingProcurement)} onClose={() => setPayingProcurement(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 900, color: "var(--color-green-800)" }}>Xác nhận thanh toán mua sắm</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Alert severity="info">Nhập URL hóa đơn/biên lai chuyển khoản để lưu minh chứng thanh toán trước khi nhập kho.</Alert>
            <MetricCard label="Đề xuất" value={payingProcurement?.campaignName ?? payingProcurement?.id ?? "Đề xuất mua sắm"} />
            <TextField
              label="URL hóa đơn hoặc biên lai"
              value={procurementPaymentReceiptUrl}
              onChange={(event) => setProcurementPaymentReceiptUrl(event.target.value)}
              placeholder="https://..."
              autoFocus
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayingProcurement(null)}>Hủy</Button>
          <Button
            variant="contained"
            disabled={!payingProcurement || !procurementPaymentReceiptUrl.trim() || action.isPending}
            onClick={() => payingProcurement ? action.mutate({ id: payingProcurement.id, type: "pay", receiptUrl: procurementPaymentReceiptUrl.trim() }) : undefined}
          >
            Xác nhận thanh toán
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export function AllocationPlansPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const roles = useAuthStore((state) => state.roles);
  const canCreateAllocation = hasOperationalRole(roles, "ADMIN") || hasOperationalRole(roles, "COORDINATOR");
  const canApproveAllocation = hasOperationalRole(roles, "ADMIN") || hasOperationalRole(roles, "FINANCIAL_OFFICER");
  const [showAllocationForm, setShowAllocationForm] = useState(false);
  const [allocationForm, setAllocationForm] = useState({
    campaignId: "",
    areaAssessmentId: "",
    items: [{ itemType: "Gạo", quantity: 100, approvedAmount: 0 }],
  });
  const plans = useQuery({ queryKey: ["allocation-plans"], queryFn: () => aidApi.allocationPlans({ page: 1, limit: 50 }) });
  const campaigns = useQuery({ queryKey: ["campaigns-admin", "allocation-select"], queryFn: () => donationApi.campaigns({ page: 1, limit: 50 }), enabled: canCreateAllocation });
  const assessments = useQuery({ queryKey: ["area-assessments", "allocation-select"], queryFn: () => aidApi.areaAssessments({ page: 1, limit: 100 }), enabled: canCreateAllocation });
  const verifiedAssessments = (assessments.data?.data ?? []).filter((assessment) => isVerifiedAssessmentStatus(assessment.status));
  const allocationTotal = allocationForm.items.reduce((total, item) => total + Number(item.approvedAmount), 0);
  const hasValidAllocationItems = allocationForm.items.every((item) => item.itemType && Number(item.quantity) > 0 && Number(item.approvedAmount) >= 0);
  const createPlan = useMutation({
    mutationFn: () => aidApi.createAllocationPlan({
      campaignId: allocationForm.campaignId,
      areaAssessmentId: allocationForm.areaAssessmentId || null,
      items: allocationForm.items.map((item) => ({
        itemType: item.itemType,
        quantity: Number(item.quantity),
        approvedAmount: Number(item.approvedAmount),
      })),
    }),
    onSuccess: () => {
      showToast("Kế hoạch phân bổ đã được tạo. Điều phối viên có thể trình duyệt khi sẵn sàng.", "success");
      setAllocationForm({ campaignId: "", areaAssessmentId: "", items: [{ itemType: "Gạo", quantity: 100, approvedAmount: 0 }] });
      setShowAllocationForm(false);
      queryClient.invalidateQueries({ queryKey: ["allocation-plans"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });
  const action = useMutation({
    mutationFn: ({ id, type }: { id: string; type: "submit" | "approve" | "close" }) =>
      type === "submit" ? aidApi.submitAllocationPlan(id) : type === "approve" ? aidApi.approveAllocationPlan(id, { status: "APPROVED" }) : aidApi.closeAllocationPlan(id),
    onSuccess: () => {
      showToast("Kế hoạch phân bổ đã được cập nhật. Khi phê duyệt, hệ thống khóa giữ tiền và hàng theo kế hoạch.", "success");
      queryClient.invalidateQueries({ queryKey: ["allocation-plans"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });
  return (
    <Stack spacing={2.5}>
      {canCreateAllocation ? (
        <Stack spacing={2}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowAllocationForm((value) => !value)} sx={{ alignSelf: { xs: "stretch", md: "flex-start" } }}>
            {showAllocationForm ? "Ẩn form kế hoạch" : "Lập kế hoạch phân bổ"}
          </Button>
          {showAllocationForm ? (
            <SectionPaper>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6" fontWeight={900}>Lập phương án cấp phát</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Chọn chiến dịch, báo cáo nhu cầu đã xác minh và khai báo lượng hàng/tiền cần giữ chỗ trước khi trình kế toán duyệt.
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth select label="Chiến dịch" value={allocationForm.campaignId} onChange={(event) => setAllocationForm({ ...allocationForm, campaignId: event.target.value })}>
                      <MenuItem value="" disabled>{campaigns.isLoading ? "Đang tải chiến dịch..." : "Chọn chiến dịch"}</MenuItem>
                      {(campaigns.data?.data ?? []).map((campaign) => <MenuItem key={campaign.id} value={campaign.id}>{campaign.name}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField fullWidth select label="Báo cáo nhu cầu đã xác minh" value={allocationForm.areaAssessmentId} onChange={(event) => setAllocationForm({ ...allocationForm, areaAssessmentId: event.target.value })}>
                      <MenuItem value="">Không gắn báo cáo</MenuItem>
                      {verifiedAssessments.length ? verifiedAssessments.map((assessment) => <MenuItem key={assessment.id} value={assessment.id}>{assessment.areaName} - {assessment.householdsAffected} hộ</MenuItem>) : (
                        <MenuItem disabled>{assessments.isLoading ? "Đang tải báo cáo..." : "Chưa có báo cáo đã xác minh"}</MenuItem>
                      )}
                    </TextField>
                  </Grid>
                </Grid>
                <Stack spacing={1.5}>
                  {allocationForm.items.map((item, index) => (
                    <Grid container spacing={1.5} alignItems="center" key={index}>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <TextField fullWidth label="Loại vật tư/tiền mặt" value={item.itemType} onChange={(event) => {
                          const items = [...allocationForm.items];
                          items[index] = { ...item, itemType: event.target.value };
                          setAllocationForm({ ...allocationForm, items });
                        }} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField fullWidth label="Số lượng cấp phát" type="number" value={item.quantity} onChange={(event) => {
                          const items = [...allocationForm.items];
                          items[index] = { ...item, quantity: Number(event.target.value) };
                          setAllocationForm({ ...allocationForm, items });
                        }} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 3 }}>
                        <TextField fullWidth label="Tiền mặt dự kiến" type="number" value={item.approvedAmount} onChange={(event) => {
                          const items = [...allocationForm.items];
                          items[index] = { ...item, approvedAmount: Number(event.target.value) };
                          setAllocationForm({ ...allocationForm, items });
                        }} />
                      </Grid>
                      <Grid size={{ xs: 12, md: 2 }}>
                        <Button fullWidth size="small" color="error" disabled={allocationForm.items.length === 1} onClick={() => setAllocationForm({ ...allocationForm, items: allocationForm.items.filter((_, itemIndex) => itemIndex !== index) })}>Xóa</Button>
                      </Grid>
                    </Grid>
                  ))}
                </Stack>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between">
                  <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setAllocationForm({ ...allocationForm, items: [...allocationForm.items, { itemType: "", quantity: 1, approvedAmount: 0 }] })}>
                    Thêm dòng cấp phát
                  </Button>
                  <MetricCard label="Tổng tiền giữ chỗ" value={formatMoney(allocationTotal)} />
                </Stack>
                <Button variant="contained" disabled={!hasValidAllocationItems || createPlan.isPending} onClick={() => createPlan.mutate()} sx={{ alignSelf: { xs: "stretch", md: "flex-start" } }}>
                  Tạo kế hoạch phân bổ
                </Button>
              </Stack>
            </SectionPaper>
          ) : null}
        </Stack>
      ) : null}
      <WorkflowTable title="Kế hoạch phân bổ" rows={plans.data?.data ?? []} loading={plans.isLoading} error={plans.error} refetch={plans.refetch} actions={(row) => (
        <Stack direction="row" spacing={1}>
          {canCreateAllocation ? <Button size="small" disabled={!canRunAllocationAction(row.status, "submit") || action.isPending} onClick={() => action.mutate({ id: row.id, type: "submit" })}>Trình duyệt</Button> : null}
          {canApproveAllocation ? <Button size="small" disabled={!canRunAllocationAction(row.status, "approve") || action.isPending} onClick={() => action.mutate({ id: row.id, type: "approve" })}>Phê duyệt và khóa giữ</Button> : null}
          {canCreateAllocation ? <Button size="small" disabled={!canRunAllocationAction(row.status, "close") || action.isPending} onClick={() => action.mutate({ id: row.id, type: "close" })}>Đóng kế hoạch</Button> : null}
        </Stack>
      )} />
    </Stack>
  );
}

function normalizeWorkflowStatus(status: string) {
  return normalizeRole(status);
}

function isPendingSosStatus(status?: string | null) {
  return normalizeWorkflowStatus(status ?? "") === "PENDING";
}

function isVerifiedSosStatus(status?: string | null) {
  return ["VERIFIED", "APPROVED", "CONFIRMED"].includes(normalizeWorkflowStatus(status ?? ""));
}

function isVerifiedAssessmentStatus(status?: string | null) {
  return ["VERIFIED", "APPROVED", "CONFIRMED"].includes(normalizeWorkflowStatus(status ?? ""));
}

function canRunProcurementAction(status: string, action: "approve" | "pay" | "deliver") {
  const normalized = normalizeWorkflowStatus(status);
  const allowed: Record<typeof action, string[]> = {
    approve: ["DRAFT", "PENDING", "SUBMITTED", "PENDING_APPROVAL", "UNDER_REVIEW"],
    pay: ["APPROVED", "HELD", "BUDGET_HELD", "BUDGET_LOCKED"],
    deliver: ["PAID", "PAYMENT_COMPLETED", "EXECUTED"],
  };
  return allowed[action].includes(normalized);
}

function canRunAllocationAction(status: string, action: "submit" | "approve" | "close") {
  const normalized = normalizeWorkflowStatus(status);
  const allowed: Record<typeof action, string[]> = {
    submit: ["DRAFT", "PENDING"],
    approve: ["SUBMITTED", "PENDING_APPROVAL", "UNDER_REVIEW"],
    close: ["APPROVED", "HELD", "BUDGET_HELD", "IN_PROGRESS", "DISTRIBUTING"],
  };
  return allowed[action].includes(normalized);
}

export function DisbursementsPage() {
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const roles = useAuthStore((state) => state.roles);
  const canCreateDisbursement = hasOperationalRole(roles, "ADMIN") || hasOperationalRole(roles, "COORDINATOR");
  const canExecuteDisbursement = hasOperationalRole(roles, "ADMIN") || hasOperationalRole(roles, "FINANCIAL_OFFICER");
  const [showDisbursementForm, setShowDisbursementForm] = useState(false);
  const [selectedDisbursement, setSelectedDisbursement] = useState<WorkflowRow | null>(null);
  const [disbursementForm, setDisbursementForm] = useState({ allocationPlanId: "", expenseCategory: "DIRECT_AID", itemName: "Hỗ trợ tiền mặt", type: "BANK_TRANSFER", method: "BANK_TRANSFER", amount: 0 });
  const [executeForm, setExecuteForm] = useState({ invoiceUrl: "", actualAmount: 0 });
  const rows = useQuery({ queryKey: ["disbursements"], queryFn: () => aidApi.disbursements({ page: 1, limit: 50 }) });
  const plans = useQuery({ queryKey: ["allocation-plans", "disbursement-select"], queryFn: () => aidApi.allocationPlans({ page: 1, limit: 50 }), enabled: canCreateDisbursement });
  const create = useMutation({
    mutationFn: () => aidApi.createDisbursement({
      allocationPlanId: disbursementForm.allocationPlanId || null,
      expenseCategory: disbursementForm.expenseCategory,
      itemName: disbursementForm.itemName,
      type: disbursementForm.type,
      method: disbursementForm.method,
      amount: Number(disbursementForm.amount),
    }),
    onSuccess: () => {
      showToast("Đề xuất giải ngân đã được tạo và chờ kế toán xử lý.", "success");
      setDisbursementForm({ allocationPlanId: "", expenseCategory: "DIRECT_AID", itemName: "Hỗ trợ tiền mặt", type: "BANK_TRANSFER", method: "BANK_TRANSFER", amount: 0 });
      setShowDisbursementForm(false);
      queryClient.invalidateQueries({ queryKey: ["disbursements"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });
  const execute = useMutation({
    mutationFn: (id: string) => aidApi.executeDisbursement(id, { invoiceUrl: executeForm.invoiceUrl, actualAmount: Number(executeForm.actualAmount) }),
    onSuccess: () => {
      showToast("Giải ngân đã được thực hiện và ghi nhận lên sổ cái công khai.", "success");
      setSelectedDisbursement(null);
      setExecuteForm({ invoiceUrl: "", actualAmount: 0 });
      queryClient.invalidateQueries({ queryKey: ["disbursements"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });
  return (
    <Stack spacing={2.5}>
      {canCreateDisbursement ? (
        <Stack spacing={2}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowDisbursementForm((value) => !value)} sx={{ alignSelf: { xs: "stretch", md: "flex-start" } }}>
            {showDisbursementForm ? "Ẩn form giải ngân" : "Đề xuất giải ngân"}
          </Button>
          {showDisbursementForm ? (
            <SectionPaper>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h6" fontWeight={900}>Đề xuất chi hỗ trợ</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Điều phối viên tạo khoản chi, kế toán thực hiện chuyển khoản và tải biên lai để ghi chi phí trực tiếp lên sổ cái công khai.
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth select label="Kế hoạch phân bổ" value={disbursementForm.allocationPlanId} onChange={(event) => setDisbursementForm({ ...disbursementForm, allocationPlanId: event.target.value })}>
                      <MenuItem value="">Không gắn kế hoạch</MenuItem>
                      {(plans.data?.data ?? []).map((plan) => <MenuItem key={plan.id} value={plan.id}>{plan.areaName ?? plan.campaignName ?? plan.id}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth label="Nội dung chi" value={disbursementForm.itemName} onChange={(event) => setDisbursementForm({ ...disbursementForm, itemName: event.target.value })} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth label="Số tiền đề xuất" type="number" value={disbursementForm.amount} onChange={(event) => setDisbursementForm({ ...disbursementForm, amount: Number(event.target.value) })} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth label="Loại chi phí" value={disbursementForm.expenseCategory} onChange={(event) => setDisbursementForm({ ...disbursementForm, expenseCategory: event.target.value })} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth label="Loại giao dịch" value={disbursementForm.type} onChange={(event) => setDisbursementForm({ ...disbursementForm, type: event.target.value })} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField fullWidth label="Phương thức" value={disbursementForm.method} onChange={(event) => setDisbursementForm({ ...disbursementForm, method: event.target.value })} />
                  </Grid>
                </Grid>
                <Button variant="contained" disabled={!disbursementForm.itemName || Number(disbursementForm.amount) <= 0 || create.isPending} onClick={() => create.mutate()} sx={{ alignSelf: { xs: "stretch", md: "flex-start" } }}>
                  Gửi đề xuất chi
                </Button>
              </Stack>
            </SectionPaper>
          ) : null}
        </Stack>
      ) : null}
      <WorkflowTable title="Giải ngân" rows={rows.data?.data ?? []} loading={rows.isLoading} error={rows.error} refetch={rows.refetch} actions={(row) => (
        canExecuteDisbursement ? <Button size="small" onClick={() => {
          setSelectedDisbursement(row);
          setExecuteForm({ invoiceUrl: "", actualAmount: row.amount ?? row.totalAmount ?? 0 });
        }}>Thực hiện</Button> : <Typography variant="body2" color="text.secondary">Chờ kế toán chuyển khoản</Typography>
      )} />
      <Dialog open={Boolean(selectedDisbursement)} onClose={() => setSelectedDisbursement(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 900, color: "var(--color-green-800)" }}>Thực hiện giải ngân</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <MetricCard label="Khoản chi" value={selectedDisbursement?.itemName ?? selectedDisbursement?.campaignName ?? selectedDisbursement?.id ?? "-"} />
            <TextField label="Số tiền thực chuyển" type="number" value={executeForm.actualAmount} onChange={(event) => setExecuteForm({ ...executeForm, actualAmount: Number(event.target.value) })} />
            <TextField label="URL biên lai chuyển khoản" value={executeForm.invoiceUrl} onChange={(event) => setExecuteForm({ ...executeForm, invoiceUrl: event.target.value })} placeholder="https://..." />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedDisbursement(null)}>Hủy</Button>
          <Button variant="contained" disabled={!selectedDisbursement || !executeForm.invoiceUrl || Number(executeForm.actualAmount) <= 0 || execute.isPending} onClick={() => selectedDisbursement ? execute.mutate(selectedDisbursement.id) : undefined}>
            Xác nhận chuyển khoản
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
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

interface ProcurementItemView {
  id?: string;
  itemName?: string;
  name?: string;
  itemType?: string;
  quantity?: number;
  unit?: string;
  pricePerUnit?: number;
  unitPrice?: number;
  totalAmount?: number;
  amount?: number;
}

function getProcurementItems(procurement?: Procurement | null): ProcurementItemView[] {
  if (!procurement) return [];
  const source = procurement as Procurement & {
    procurementItems?: ProcurementItemView[];
    orderItems?: ProcurementItemView[];
    procurementOrderItems?: ProcurementItemView[];
    procurementOrderDetails?: ProcurementItemView[];
    purchaseItems?: ProcurementItemView[];
    purchaseOrderItems?: ProcurementItemView[];
    lineItems?: ProcurementItemView[];
    orderLines?: ProcurementItemView[];
    details?: ProcurementItemView[];
    lines?: ProcurementItemView[];
    itemName?: string;
    itemType?: string;
    name?: string;
    quantity?: number;
    unit?: string;
    pricePerUnit?: number;
    unitPrice?: number;
    amount?: number;
  };
  const items = source.items?.length
    ? source.items
    : source.procurementItems?.length
      ? source.procurementItems
      : source.orderItems?.length
        ? source.orderItems
        : source.procurementOrderItems?.length
          ? source.procurementOrderItems
          : source.procurementOrderDetails?.length
            ? source.procurementOrderDetails
            : source.purchaseItems?.length
              ? source.purchaseItems
              : source.purchaseOrderItems?.length
                ? source.purchaseOrderItems
                : source.lineItems?.length
                  ? source.lineItems
                  : source.orderLines?.length
                    ? source.orderLines
                    : source.details?.length
                      ? source.details
                      : source.lines ?? [];

  if (items.length) return items;
  if (source.itemName || source.itemType || source.name) {
    return [{
      id: source.id,
      itemName: source.itemName,
      itemType: source.itemType,
      name: source.name,
      quantity: source.quantity ?? 1,
      unit: source.unit,
      pricePerUnit: source.pricePerUnit,
      unitPrice: source.unitPrice,
      totalAmount: source.totalAmount,
      amount: source.amount,
    }];
  }
  return [];
}

function getVolunteerDisplayName(volunteer: { id: string; skills?: string | null; availableAreas?: string | null; userName?: string | null; fullName?: string | null; name?: string | null; phone?: string | null }) {
  const name = volunteer.fullName ?? volunteer.userName ?? volunteer.name ?? volunteer.phone ?? `Tình nguyện viên ${volunteer.id.slice(0, 8)}`;
  const area = volunteer.availableAreas ? ` - ${volunteer.availableAreas}` : "";
  return `${name}${area}`;
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
        <Paper variant="outlined"><Table size="small"><TableHead><TableRow><TableCell>Họ tên</TableCell><TableCell>Email</TableCell><TableCell>Số điện thoại</TableCell><TableCell>Vai trò</TableCell><TableCell>Trạng thái</TableCell><TableCell>Thao tác</TableCell></TableRow></TableHead><TableBody>
          {users.data?.data.map((user) => {
            const needsApproval = userNeedsOperationalApproval(user, role);
            return (
              <TableRow key={user.id}>
                <TableCell>{user.fullName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: "var(--color-green-800)", fontWeight: 800 }}>
                    {getUserRoleLabel(user)}
                  </Typography>
                </TableCell>
                <TableCell><StatusChip value={user.status} /></TableCell>
                <TableCell>
                  {needsApproval ? (
                    <Stack direction="row" spacing={1}>
                      <Button size="small" disabled={approve.isPending} onClick={() => approve.mutate({ id: user.id, isApproved: true })}>Duyệt</Button>
                      <Button size="small" color="error" disabled={approve.isPending} onClick={() => approve.mutate({ id: user.id, isApproved: false })}>Từ chối</Button>
                    </Stack>
                  ) : (
                    <Typography variant="body2" sx={{ color: "var(--color-text-muted)", fontWeight: 800 }}>
                      Không cần duyệt
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
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
  const queryClient = useQueryClient();
  const showToast = useToast((state) => state.showToast);
  const rows = useQuery({ queryKey: ["admin-complaints"], queryFn: () => monitoringApi.adminComplaints({ page: 1, limit: 50 }) });
  const update = useMutation({
    mutationFn: ({ id, status, resolution }: { id: string; status: "INVESTIGATING" | "RESOLVED" | "REJECTED"; resolution: string }) => monitoringApi.updateComplaint(id, { status, resolution }),
    onSuccess: (updatedComplaint) => {
      showToast("Trạng thái phản ánh đã được cập nhật.", "success");
      queryClient.setQueryData<PaginatedResult<Complaint>>(["admin-complaints"], (current) => current
        ? { ...current, data: current.data.map((item) => item.id === updatedComplaint.id ? { ...item, ...updatedComplaint } : item) }
        : current,
      );
      queryClient.invalidateQueries({ queryKey: ["admin-complaints"] });
    },
    onError: (error) => showToast(getErrorMessage(error), "error"),
  });

  return (
    <>
      <PageHeader title="Phản ánh người dùng" description="Theo dõi phản ánh của cộng đồng, phân loại vấn đề và cập nhật trạng thái xử lý." />
      <QueryState isLoading={rows.isLoading} error={rows.error} empty={!rows.data?.data.length} refetch={rows.refetch}>
        <Paper variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Phản ánh</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.data?.data.map((item: Complaint) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Typography fontWeight={900}>{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                  </TableCell>
                  <TableCell>{getComplaintTypeLabel(item.complaintType)}</TableCell>
                  <TableCell><StatusChip value={normalizeComplaintStatus(item.status)} /></TableCell>
                  <TableCell>{formatDate(item.createdAt)}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {normalizeComplaintStatus(item.status) === "PROCESSING" ? (
                        <Button size="small" disabled={update.isPending} onClick={() => update.mutate({ id: item.id, status: "INVESTIGATING", resolution: "Phản ánh đang được xác minh." })}>Bắt đầu xử lý</Button>
                      ) : null}
                      <Button size="small" disabled={update.isPending || normalizeComplaintStatus(item.status) !== "INVESTIGATING"} onClick={() => update.mutate({ id: item.id, status: "RESOLVED", resolution: "Phản ánh đã được xử lý." })}>Đã xử lý</Button>
                      <Button size="small" color="error" disabled={update.isPending || ["RESOLVED", "REJECTED"].includes(normalizeComplaintStatus(item.status))} onClick={() => update.mutate({ id: item.id, status: "REJECTED", resolution: "Phản ánh không đủ căn cứ xử lý." })}>Từ chối</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </QueryState>
    </>
  );
}

export function FraudPage() {
  const rows = useQuery({ queryKey: ["fraud-cases"], queryFn: () => monitoringApi.fraudCases({ page: 1, limit: 50 }) });
  return <SimpleObjectList title="Nghi vấn gian lận" description="Rà soát các tín hiệu bất thường trong chiến dịch, quyên góp và vận hành cứu trợ." query={rows} primaryKey="description" />;
}

export function AuditLogsPage() {
  const [keyword, setKeyword] = useState("");
  const [actionType, setActionType] = useState("");
  const rows = useQuery({ queryKey: ["audit-logs"], queryFn: () => adminApi.auditLogs({ page: 1, limit: 50 }) });
  const filteredRows = (rows.data?.data ?? []).filter((row) => {
    const record = row as Record<string, unknown>;
    const action = String(record.action ?? record.actionType ?? "");
    const normalized = normalizeSearchText(Object.values(record).join(" "));
    const matchesKeyword = normalizeSearchText(keyword) ? normalized.includes(normalizeSearchText(keyword)) : true;
    const matchesAction = actionType ? normalizeWorkflowStatus(action).includes(actionType) : true;
    return matchesKeyword && matchesAction;
  });

  return (
    <>
      <PageHeader title="Nhật ký kiểm toán" description="Lịch sử thao tác hệ thống phục vụ minh bạch, truy vết trách nhiệm và rà soát rủi ro." />
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField label="Tìm theo hành động, người thao tác, mô tả..." value={keyword} onChange={(event) => setKeyword(event.target.value)} sx={{ flex: 1 }} />
        <TextField select label="Nhóm hành động" value={actionType} onChange={(event) => setActionType(event.target.value)} sx={{ minWidth: 220 }}>
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="CREATE">Tạo mới</MenuItem>
          <MenuItem value="UPDATE">Cập nhật</MenuItem>
          <MenuItem value="APPROVE">Duyệt/xác minh</MenuItem>
          <MenuItem value="REJECT">Từ chối</MenuItem>
          <MenuItem value="PAY">Thanh toán</MenuItem>
        </TextField>
      </Stack>
      <QueryState isLoading={rows.isLoading} error={rows.error} empty={!filteredRows.length} refetch={rows.refetch}>
        <Paper variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Hành động</TableCell>
                <TableCell>Người thao tác</TableCell>
                <TableCell>Đối tượng</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell>Thời gian</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.map((row, index) => {
                const record = row as Record<string, unknown>;
                const action = String(record.action ?? record.actionType ?? "SYSTEM");
                return (
                  <TableRow key={String(record.id ?? index)}>
                    <TableCell>
                      <Chip label={action} size="small" sx={auditActionChipSx(action)} />
                    </TableCell>
                    <TableCell>{formatAuditValue(record.userName ?? record.actorName ?? record.performedBy ?? getAuditActor(record) ?? record.userId)}</TableCell>
                    <TableCell>{getAuditEntityLabel(record)}</TableCell>
                    <TableCell>{getAuditDescription(record)}</TableCell>
                    <TableCell>{formatDate(String(record.createdAt ?? record.timestamp ?? record.entryDate ?? ""))}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      </QueryState>
    </>
  );
}

const adminComplaintTypeLabels: Record<string, string> = {
  FRAUD: "Gian lận",
  MISSING_AID: "Thiếu hàng cứu trợ",
  DELAY: "Chậm trễ",
  QUALITY: "Chất lượng hỗ trợ",
  APP: "Ứng dụng",
  RESCUE_TEAM: "Đội cứu hộ",
  COORDINATION: "Điều phối cứu trợ",
  CAMPAIGN: "Chiến dịch cứu trợ",
  EMERGENCY_CASE: "Yêu cầu SOS",
  DONATION: "Quyên góp",
  OTHER: "Khác",
};

function getComplaintTypeLabel(value?: string | null) {
  return adminComplaintTypeLabels[value ?? ""] ?? value ?? "Khác";
}

function normalizeComplaintStatus(status?: string | null) {
  const normalized = normalizeRole(String(status ?? ""));
  if (["OPEN", "PENDING", "IN_REVIEW", "PROCESSING"].includes(normalized)) return "PROCESSING";
  return normalized || "PROCESSING";
}

function auditActionChipSx(action: string) {
  const normalized = normalizeWorkflowStatus(action);
  const color = normalized.includes("REJECT") || normalized.includes("DELETE")
    ? "#b42318"
    : normalized.includes("APPROVE") || normalized.includes("VERIFY") || normalized.includes("PAY")
      ? "var(--color-green-700)"
      : normalized.includes("CREATE")
        ? "var(--color-green-600)"
        : "var(--color-text-muted)";

  return {
    borderRadius: 0,
    border: `1px solid ${color}`,
    color,
    bgcolor: "rgba(255,255,255,.48)",
    fontWeight: 900,
  };
}

function getAuditEntityLabel(record: Record<string, unknown>) {
  const entityName = formatAuditValue(record.entityName ?? record.entityType ?? record.module ?? record.referenceType);
  const entityId = formatAuditValue(record.entityId ?? record.referenceId);
  if (entityName !== "-" && entityId !== "-") return `${entityName} (${entityId})`;
  if (entityName !== "-") return entityName;
  return entityId;
}

function getAuditActor(record: Record<string, unknown>) {
  const user = record.user;
  if (!user || typeof user !== "object") return undefined;
  const value = user as Record<string, unknown>;
  return value.fullName ?? value.email ?? value.id;
}

function getAuditDescription(record: Record<string, unknown>) {
  const detail = formatAuditValue(record.description ?? record.message ?? record.details ?? record.newValue ?? record.oldValue);
  if (detail !== "-") return detail;

  const action = String(record.action ?? record.actionType ?? "SYSTEM").toUpperCase();
  const entity = getAuditEntityLabel(record);
  const labels: Record<string, string> = {
    CREATE: "Đã tạo mới",
    UPDATE: "Đã cập nhật",
    DELETE: "Đã xóa",
    LOGIN: "Đã đăng nhập",
    LOGOUT: "Đã đăng xuất",
    APPROVE: "Đã phê duyệt",
    REJECT: "Đã từ chối",
  };
  return `${labels[action] ?? `Đã thực hiện ${action.toLowerCase()}`}${entity !== "-" ? `: ${entity}` : ""}.`;
}

function formatAuditValue(value: unknown) {
  if (value === undefined || value === null || value === "") return "-";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
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



