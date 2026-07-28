import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CampaignIcon from "@mui/icons-material/Campaign";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import MapIcon from "@mui/icons-material/Map";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PaidIcon from "@mui/icons-material/Paid";
import PeopleIcon from "@mui/icons-material/People";
import SosIcon from "@mui/icons-material/Sos";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import type { ComponentType } from "react";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import { useAuthStore } from "@/features/auth/store";
import { notificationApi } from "@/features/notifications/api";
import { ROLES } from "@/shared/constants/roles";

interface NavItem {
  label: string;
  to: string;
  icon: ComponentType<SvgIconProps>;
  roles?: string[];
}

const financialRoleAliases = [ROLES.financialOfficer, "FINANCE", "FINANCIAL", "ACCOUNTANT", "ACCOUNTING", "KE_TOAN", "KETOAN"];
const opsRoleAliases = [ROLES.admin, ROLES.coordinator, ...financialRoleAliases];
const complaintRoleAliases = [ROLES.citizen];

const navItems: NavItem[] = [
  { label: "Trang chủ", to: "/", icon: DashboardIcon },
  { label: "Chiến dịch", to: "/campaigns", icon: CampaignIcon },
  { label: "Bản đồ cứu trợ", to: "/relief-map", icon: MapIcon },
  { label: "Tạo SOS", to: "/sos/new", icon: SosIcon },
  { label: "SOS của tôi", to: "/citizen/sos", icon: FavoriteIcon, roles: [ROLES.citizen] },
  { label: "Lịch sử quyên góp", to: "/donor/donations", icon: PaidIcon, roles: [ROLES.donor, ROLES.citizen, ROLES.coordinator, ROLES.admin] },
  { label: "Chiến dịch", to: "/donor/campaigns", icon: CampaignIcon, roles: [ROLES.donor] },
  { label: "Yêu cầu cứu trợ", to: "/ops/sos", icon: SosIcon, roles: [ROLES.coordinator] },
  { label: "Phân công cứu hộ", to: "/ops/missions", icon: MapIcon, roles: [ROLES.coordinator] },
  { label: "Duyệt khảo sát", to: "/ops/area-assessments", icon: DashboardIcon, roles: [ROLES.admin, ROLES.coordinator] },
  { label: "Chiến dịch", to: "/ops/campaigns", icon: CampaignIcon, roles: opsRoleAliases },
  { label: "Mua sắm", to: "/ops/procurements", icon: PaidIcon, roles: opsRoleAliases },
  { label: "Kế hoạch phân bổ", to: "/ops/allocation-plans", icon: DashboardIcon, roles: opsRoleAliases },
  { label: "Kho hàng", to: "/ops/warehouses", icon: Inventory2Icon, roles: opsRoleAliases },
  { label: "Vận chuyển", to: "/ops/shipments", icon: LocalShippingIcon, roles: [ROLES.admin, ROLES.coordinator] },
  { label: "Tài chính", to: "/ops/disbursements", icon: PaidIcon, roles: opsRoleAliases },
  { label: "Điểm trú tạm", to: "/citizen/shelters", icon: MapIcon, roles: [ROLES.admin, ROLES.coordinator, ROLES.citizen] },
  { label: "Phản ánh", to: "/citizen/complaints", icon: SosIcon, roles: complaintRoleAliases },
  { label: "Tình nguyện hỗ trợ", to: "/ops/volunteers", icon: VolunteerActivismIcon, roles: [ROLES.coordinator] },
  { label: "Tổ chức", to: "/ops/organizations", icon: PeopleIcon, roles: [ROLES.admin] },
  { label: "Người dùng", to: "/ops/users", icon: PeopleIcon, roles: [ROLES.admin] },
  { label: "Phản ánh", to: "/ops/complaints", icon: SosIcon, roles: [ROLES.admin] },
  { label: "Kiểm toán", to: "/ops/audit-logs", icon: DashboardIcon, roles: [ROLES.admin] },
  { label: "Nhiệm vụ đội cứu hộ", to: "/team/missions", icon: VolunteerActivismIcon, roles: [ROLES.rescueTeam] },
  { label: "Chuyến hàng đội", to: "/team/shipments", icon: LocalShippingIcon, roles: [ROLES.rescueTeam] },
  { label: "Đánh giá khu vực", to: "/team/area-assessments", icon: DashboardIcon, roles: [ROLES.rescueTeam] },
  { label: "Minh chứng", to: "/team/proofs", icon: DashboardIcon, roles: [ROLES.rescueTeam] },
];

const drawerWidth = 270;

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 900px)");
  const { user, roles, isAuthenticated, logout, hasAnyRole } = useAuthStore();
  const { data: notifications } = useQuery({
    queryKey: ["notifications", "nav"],
    queryFn: () => notificationApi.list({ page: 1, limit: 10 }),
    enabled: isAuthenticated,
    refetchInterval: 60000,
  });

  const visibleItems = navItems.filter((item) => !item.roles || hasAnyRole(item.roles));
  const unread = notifications?.data.filter((item) => !item.isRead).length ?? 0;

  const drawer = (
    <Stack sx={{ height: "100%" }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" fontWeight={900} color="primary">
          Tâm Lũ
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Minh bạch cứu trợ lũ lụt
        </Typography>
      </Box>
      <Divider />
      <List sx={{ px: 1, flex: 1 }}>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                "&.active": { bgcolor: "primary.main", color: "primary.contrastText", "& .MuiListItemIcon-root": { color: "inherit" } },
              }}
            >
              <ListItemIcon>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
      <Divider />
      <Stack spacing={1.5} sx={{ p: 2 }}>
        {isAuthenticated ? (
          <>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ bgcolor: "secondary.main" }}>{user?.fullName?.charAt(0) ?? "U"}</Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography fontWeight={800} noWrap>
                  {user?.fullName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {roles.join(", ")}
                </Typography>
              </Box>
            </Stack>
            <Button color="inherit" variant="outlined" onClick={logout}>
              Đăng xuất
            </Button>
          </>
        ) : (
          <Button component={Link} to="/login" variant="contained">
            Đăng nhập
          </Button>
        )}
      </Stack>
    </Stack>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar position="fixed" color="inherit" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider", zIndex: 1300 }}>
        <Toolbar>
          {!isDesktop ? (
            <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          ) : null}
          <Typography component={Link} to="/" variant="h6" fontWeight={900} color="primary" sx={{ flex: 1 }}>
            Tâm Lũ
          </Typography>
          <IconButton component={Link} to="/notifications">
            <Badge color="secondary" badgeContent={unread}>
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton component={Link} to="/citizen/profile">
            <AccountCircleIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer variant={isDesktop ? "permanent" : "temporary"} open={isDesktop || mobileOpen} onClose={() => setMobileOpen(false)} sx={{ width: drawerWidth, "& .MuiDrawer-paper": { width: drawerWidth, pt: 8 } }}>
        {drawer}
      </Drawer>
      <Box component="main" sx={{ flex: 1, minWidth: 0, pt: 10, px: { xs: 2, md: 4 }, pb: 5, ml: { md: `${drawerWidth}px` } }}>
        <Outlet />
      </Box>
    </Box>
  );
}
