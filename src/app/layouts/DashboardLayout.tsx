import { useState } from "react";
import type { ReactNode } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import CrisisAlertOutlinedIcon from "@mui/icons-material/CrisisAlertOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
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

const dashboardNav: DashboardNavItem[] = [
  { label: "Tổng quan", to: "/dashboard", icon: <DashboardOutlinedIcon fontSize="small" /> },
  { label: "SOS của tôi", to: "/citizen/sos", roles: [ROLES.citizen], icon: <CrisisAlertOutlinedIcon fontSize="small" />, badge: 4 },
  { label: "Ủng hộ", to: "/donor/donations", roles: [ROLES.donor, ROLES.citizen, ROLES.coordinator, ROLES.admin], icon: <CampaignOutlinedIcon fontSize="small" /> },
  { label: "Hồ sơ", to: "/profile", icon: <PersonOutlineOutlinedIcon fontSize="small" /> },
  { label: "Vận hành", to: "/ops", roles: [ROLES.admin, ROLES.coordinator, ROLES.financialOfficer], icon: <DashboardOutlinedIcon fontSize="small" /> },
  { label: "Nhiệm vụ", to: "/ops/missions", roles: [ROLES.admin, ROLES.coordinator], icon: <AssignmentOutlinedIcon fontSize="small" /> },
  { label: "Kho hàng", to: "/ops/inventory", roles: [ROLES.admin, ROLES.coordinator, ROLES.financialOfficer], icon: <Inventory2OutlinedIcon fontSize="small" />, badge: 3 },
  { label: "Vận chuyển", to: "/ops/shipments", roles: [ROLES.admin, ROLES.coordinator, ROLES.rescueTeam], icon: <LocalShippingOutlinedIcon fontSize="small" /> },
  { label: "Tài chính", to: "/ops/disbursements", roles: [ROLES.admin, ROLES.financialOfficer, ROLES.coordinator], icon: <AccountBalanceWalletOutlinedIcon fontSize="small" /> },
  { label: "Tổ chức", to: "/ops/organizations", roles: [ROLES.admin], icon: <BusinessOutlinedIcon fontSize="small" /> },
  { label: "Người dùng", to: "/ops/users", roles: [ROLES.admin], icon: <GroupsOutlinedIcon fontSize="small" />, badge: 1 },
  { label: "Nhiệm vụ đội cứu hộ", to: "/team/missions", roles: [ROLES.rescueTeam], icon: <MapOutlinedIcon fontSize="small" /> },
  { label: "Đánh giá khu vực", to: "/team/area-assessments", roles: [ROLES.rescueTeam], icon: <FactCheckOutlinedIcon fontSize="small" /> },
];

export function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const { user, roles, logout, hasAnyRole } = useAuthStore();
  const visibleItems = dashboardNav.filter((item) => !item.roles || hasAnyRole(item.roles));

  const sidebar = (
    <aside className="flex h-full w-80 max-w-[86vw] flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text)] shadow-none lg:w-full lg:max-w-none">
      <Link to="/" className="border-b border-[var(--color-border)] p-5">
        <span className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-[14px] bg-white ring-1 ring-[var(--color-border)]">
            <img src="/images/tam-lu-logo.png" alt="Logo Tâm Lũ" className="h-11 w-11 object-contain" />
          </span>
          <span>
            <span className="block text-xl font-black leading-5 text-[var(--color-green-800)]">Tâm Lũ</span>
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Bảng điều phối</span>
          </span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Điều hướng bảng điều phối">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3.5 py-3 text-sm font-bold text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-page)] hover:text-[var(--color-green-800)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green-600)]",
                isActive && "bg-[var(--color-green-700)] text-white hover:bg-[var(--color-green-800)] hover:text-white",
              )
            }
          >
            <span className="grid h-5 w-5 shrink-0 place-items-center">{item.icon}</span>
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.badge ? (
              <span className={clsx("grid h-5 min-w-5 place-items-center px-1.5 text-[11px] font-black", "bg-white text-[var(--color-green-800)]")}>
                {item.badge}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center bg-[var(--color-green-700)] text-sm font-black text-white">
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
        <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 shadow-[var(--shadow-surface)]">
          <Link to="/" className="text-lg font-black text-[var(--color-green-800)]">
            Tâm Lũ
          </Link>
          <button className="border border-[var(--color-green-700)] bg-[var(--color-green-700)] px-4 py-2 text-sm font-black text-white" type="button" onClick={() => setOpen((value) => !value)}>
            Danh mục
          </button>
        </div>
        {open ? <div className="fixed inset-0 z-50 bg-[rgba(246,248,232,.72)] backdrop-blur-sm" onClick={() => setOpen(false)}>{sidebar}</div> : null}
      </div>

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72">{sidebar}</div>
      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:ml-72 lg:px-9 lg:py-7 xl:px-10">
        <Outlet />
      </main>
    </div>
  );
}
