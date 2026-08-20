import { useState } from "react";
import type { ReactNode } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import CrisisAlertOutlinedIcon from "@mui/icons-material/CrisisAlertOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { useAuthStore } from "@/features/auth/store";
import { ROLES } from "@/shared/constants/roles";
import { Button } from "@/components/Button";

interface DashboardNavItem {
  label: string;
  to: string;
  roles?: string[];
  icon: ReactNode;
  badge?: number;
}

const financialRoleAliases = [ROLES.financialOfficer, "FINANCE", "FINANCIAL", "ACCOUNTANT", "ACCOUNTING", "KE_TOAN", "KETOAN"];
const coordinatorRoleAliases = [ROLES.admin, ROLES.coordinator];
const erpRoleAliases = [ROLES.admin, ROLES.coordinator, ...financialRoleAliases];
const donationRoleAliases = [ROLES.donor, ROLES.citizen, ROLES.volunteer, ROLES.rescueTeam, ROLES.admin, ROLES.coordinator, ...financialRoleAliases];
const complaintRoleAliases = [ROLES.citizen];

const dashboardNav: DashboardNavItem[] = [
  { label: "Trang chủ", to: "/", icon: <DashboardOutlinedIcon fontSize="small" /> },
  { label: "Tổng quan", to: "/dashboard", icon: <DashboardOutlinedIcon fontSize="small" /> },
  { label: "SOS của tôi", to: "/citizen/sos", roles: [ROLES.citizen, ROLES.volunteer], icon: <CrisisAlertOutlinedIcon fontSize="small" /> },
  { label: "Lịch sử quyên góp", to: "/donor/donations", roles: donationRoleAliases, icon: <AccountBalanceWalletOutlinedIcon fontSize="small" /> },
  { label: "Chiến dịch", to: "/donor/campaigns", roles: [ROLES.donor], icon: <CampaignOutlinedIcon fontSize="small" /> },
  { label: "Hồ sơ", to: "/profile", icon: <PersonOutlineOutlinedIcon fontSize="small" /> },
  { label: "Phản ánh", to: "/citizen/complaints", roles: complaintRoleAliases, icon: <CrisisAlertOutlinedIcon fontSize="small" /> },
  { label: "Yêu cầu cứu trợ", to: "/ops/sos", roles: [ROLES.coordinator], icon: <CrisisAlertOutlinedIcon fontSize="small" /> },
  { label: "Phân công cứu hộ", to: "/ops/missions", roles: coordinatorRoleAliases, icon: <MapOutlinedIcon fontSize="small" /> },
  { label: "Duyệt khảo sát", to: "/ops/area-assessments", roles: coordinatorRoleAliases, icon: <FactCheckOutlinedIcon fontSize="small" /> },
  { label: "Chiến dịch", to: "/ops/campaigns", roles: coordinatorRoleAliases, icon: <CampaignOutlinedIcon fontSize="small" /> },
  { label: "Mua sắm", to: "/ops/procurements", roles: erpRoleAliases, icon: <AccountBalanceWalletOutlinedIcon fontSize="small" /> },
  { label: "Kế hoạch phân bổ", to: "/ops/allocation-plans", roles: erpRoleAliases, icon: <FactCheckOutlinedIcon fontSize="small" /> },
  { label: "Kho hàng", to: "/ops/warehouses", roles: coordinatorRoleAliases, icon: <Inventory2OutlinedIcon fontSize="small" /> },
  { label: "Tồn kho vật tư", to: "/ops/inventory", roles: coordinatorRoleAliases, icon: <Inventory2OutlinedIcon fontSize="small" /> },
  { label: "Quản lý phương tiện", to: "/ops/vehicles", roles: coordinatorRoleAliases, icon: <LocalShippingOutlinedIcon fontSize="small" /> },
  { label: "Vận chuyển", to: "/ops/shipments", roles: coordinatorRoleAliases, icon: <LocalShippingOutlinedIcon fontSize="small" /> },
  { label: "Tài chính", to: "/ops/disbursements", roles: erpRoleAliases, icon: <AccountBalanceWalletOutlinedIcon fontSize="small" /> },
  { label: "Điểm trú tạm", to: "/citizen/shelters", roles: [ROLES.admin, ROLES.coordinator, ROLES.citizen, ROLES.volunteer], icon: <MapOutlinedIcon fontSize="small" /> },
  { label: "Tình nguyện hỗ trợ", to: "/ops/volunteers", roles: coordinatorRoleAliases, icon: <GroupsOutlinedIcon fontSize="small" /> },
  { label: "Tổ chức", to: "/ops/organizations", roles: [ROLES.admin], icon: <BusinessOutlinedIcon fontSize="small" /> },
  { label: "Đơn vị hỗ trợ ngoài", to: "/organizations", icon: <BusinessOutlinedIcon fontSize="small" /> },
  { label: "Người dùng", to: "/ops/users", roles: [ROLES.admin], icon: <GroupsOutlinedIcon fontSize="small" /> },
  { label: "Phản ánh", to: "/ops/complaints", roles: [ROLES.admin], icon: <CrisisAlertOutlinedIcon fontSize="small" /> },
  { label: "Hồ sơ gian lận", to: "/ops/fraud", roles: [ROLES.admin], icon: <FactCheckOutlinedIcon fontSize="small" /> },
  { label: "Nhật ký hệ thống", to: "/ops/audit-logs", roles: [ROLES.admin], icon: <FactCheckOutlinedIcon fontSize="small" /> },
  { label: "Nhiệm vụ đội cứu hộ", to: "/team/missions", roles: [ROLES.rescueTeam], icon: <MapOutlinedIcon fontSize="small" /> },
  { label: "Chuyến hàng đội", to: "/team/shipments", roles: [ROLES.rescueTeam], icon: <LocalShippingOutlinedIcon fontSize="small" /> },
  { label: "Đánh giá khu vực", to: "/team/area-assessments", roles: [ROLES.rescueTeam], icon: <FactCheckOutlinedIcon fontSize="small" /> },
  { label: "Minh chứng", to: "/team/proofs", roles: [ROLES.rescueTeam], icon: <FactCheckOutlinedIcon fontSize="small" /> },
  { label: "Thông tin đội của tôi", to: "/team/my-team", roles: [ROLES.rescueTeam], icon: <PersonOutlineOutlinedIcon fontSize="small" /> },
];

export function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const { user, roles, logout, hasAnyRole } = useAuthStore();
  const visibleItems = dashboardNav.filter((item) => !item.roles || hasAnyRole(item.roles));

  const sidebar = (
    <aside className="flex h-full w-80 max-w-[86vw] flex-col border-r border-[var(--color-border)] bg-[var(--color-green-50)] text-[var(--color-text)] lg:w-full lg:max-w-none">
      <Link to="/" className="border-b border-[var(--color-border)] px-5 py-4">
        <span className="flex items-center gap-3">
          <img src="/images/tam-lu-logo-transparent.png" alt="Logo Tâm Lũ" className="h-14 w-14 object-contain" />
          <span>
            <span className="block text-xl font-extrabold leading-5 text-[var(--color-green-800)]">Tâm Lũ</span>
            <span className="text-xs font-semibold text-[var(--color-text-muted)]">Bảng điều phối</span>
          </span>
        </span>
      </Link>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4" aria-label="Điều hướng bảng điều phối">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              clsx(
                "relative flex min-h-11 items-center gap-3 rounded-[10px] px-3.5 py-2.5 text-sm font-bold text-[var(--color-text-muted)] transition hover:bg-white hover:text-[var(--color-green-800)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green-600)]",
                isActive && "bg-white text-[var(--color-green-900)] shadow-[0_1px_2px_rgba(32,51,17,.05)] before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:bg-[var(--color-green-700)] hover:bg-white",
              )
            }
          >
            <span className="grid h-5 w-5 shrink-0 place-items-center">{item.icon}</span>
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.badge ? (
              <span className={clsx("grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-black", "bg-white text-[var(--color-green-800)]")}>
                {item.badge}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-[var(--color-border)] bg-[var(--color-green-50)] p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-[var(--color-green-700)] text-sm font-black text-white">
            {(user?.fullName ?? "U").slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-[var(--color-green-800)]">{user?.fullName ?? "Người dùng Tâm Lũ"}</p>
            <p className="truncate text-xs font-medium text-[var(--color-text-muted)]">{roles.join(", ") || "Đã xác thực"}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={logout}>
          Đăng xuất
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-[100dvh] bg-[var(--color-cream-50)] text-[var(--color-text)]">
      <div className="lg:hidden">
        <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[rgba(255,255,255,.92)] px-4 backdrop-blur-xl">
          <Link to="/" className="flex items-center gap-2 text-lg font-black text-[var(--color-green-800)]">
            <img src="/images/tam-lu-logo-transparent.png" alt="" className="h-10 w-10 object-contain" />
            <span>Tâm Lũ</span>
          </Link>
          <button className="grid h-11 w-11 place-items-center rounded-[10px] border border-[var(--color-border-strong)] bg-white text-[var(--color-green-800)]" type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? "Đóng danh mục" : "Mở danh mục"}>
            {open ? <CloseRoundedIcon /> : <MenuRoundedIcon />}
          </button>
        </div>
        {open ? <div className="fixed inset-0 z-50 bg-[rgba(246,248,232,.72)] backdrop-blur-sm" onClick={() => setOpen(false)}>{sidebar}</div> : null}
      </div>

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72">{sidebar}</div>
      <main id="main-content" className="mx-auto max-w-[1540px] px-4 py-6 sm:px-6 lg:ml-72 lg:px-8 lg:py-8 xl:px-10">
        <Outlet />
      </main>
    </div>
  );
}


