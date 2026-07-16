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
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
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
  { label: "Overview", to: "/dashboard", icon: <DashboardOutlinedIcon fontSize="small" /> },
  { label: "My SOS", to: "/citizen/sos", roles: [ROLES.citizen], icon: <CrisisAlertOutlinedIcon fontSize="small" />, badge: 4 },
  { label: "Donations", to: "/donor/donations", roles: [ROLES.donor, ROLES.citizen, ROLES.coordinator, ROLES.admin], icon: <CampaignOutlinedIcon fontSize="small" /> },
  { label: "Profile", to: "/profile", icon: <PersonOutlineOutlinedIcon fontSize="small" /> },
  { label: "Operations", to: "/ops", roles: [ROLES.admin, ROLES.coordinator, ROLES.financialOfficer], icon: <DashboardOutlinedIcon fontSize="small" /> },
  { label: "SOS Queue", to: "/ops/sos", roles: [ROLES.admin, ROLES.coordinator], icon: <NotificationsNoneOutlinedIcon fontSize="small" />, badge: 4 },
  { label: "Missions", to: "/ops/missions", roles: [ROLES.admin, ROLES.coordinator], icon: <AssignmentOutlinedIcon fontSize="small" /> },
  { label: "Inventory", to: "/ops/inventory", roles: [ROLES.admin, ROLES.coordinator, ROLES.financialOfficer], icon: <Inventory2OutlinedIcon fontSize="small" />, badge: 3 },
  { label: "Shipments", to: "/ops/shipments", roles: [ROLES.admin, ROLES.coordinator, ROLES.rescueTeam], icon: <LocalShippingOutlinedIcon fontSize="small" /> },
  { label: "Finance", to: "/ops/disbursements", roles: [ROLES.admin, ROLES.financialOfficer, ROLES.coordinator], icon: <AccountBalanceWalletOutlinedIcon fontSize="small" /> },
  { label: "Volunteers", to: "/ops/volunteers", roles: [ROLES.admin, ROLES.coordinator], icon: <GroupsOutlinedIcon fontSize="small" /> },
  { label: "Organizations", to: "/ops/organizations", roles: [ROLES.admin], icon: <BusinessOutlinedIcon fontSize="small" /> },
  { label: "Users", to: "/ops/users", roles: [ROLES.admin], icon: <GroupsOutlinedIcon fontSize="small" />, badge: 1 },
  { label: "Team Missions", to: "/team/missions", roles: [ROLES.rescueTeam], icon: <MapOutlinedIcon fontSize="small" /> },
  { label: "Area Assessments", to: "/team/area-assessments", roles: [ROLES.rescueTeam], icon: <FactCheckOutlinedIcon fontSize="small" /> },
];

export function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const { user, roles, logout, hasAnyRole } = useAuthStore();
  const visibleItems = dashboardNav.filter((item) => !item.roles || hasAnyRole(item.roles));

  const sidebar = (
    <aside className="flex h-full w-80 max-w-[86vw] flex-col border-r border-cyan-200/10 bg-[#041419] text-white shadow-[24px_0_80px_rgba(0,0,0,.36)] lg:w-full lg:max-w-none">
      <Link to="/" className="border-b border-cyan-200/10 p-5">
        <span className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[#2dd4bf] text-sm font-black text-[#031014] shadow-[0_18px_42px_rgba(45,212,191,.26)] ring-4 ring-white/10">TL</span>
          <span>
            <span className="block text-xl font-black leading-5 text-white">Tam Lu Relief</span>
            <span className="text-xs font-semibold uppercase tracking-wide text-cyan-100/62">Operations Console</span>
          </span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Dashboard navigation">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold text-cyan-50/68 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#67e8f9]",
                isActive && "bg-[#2dd4bf] text-[#031014] shadow-[0_18px_44px_rgba(45,212,191,.20)] hover:bg-[#67e8f9] hover:text-[#031014]",
              )
            }
          >
            <span className="grid h-5 w-5 shrink-0 place-items-center">{item.icon}</span>
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            {item.badge ? (
              <span className={clsx("grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-black", "bg-[#f5b85b] text-[#102126]")}>
                {item.badge}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-cyan-200/10 bg-white/[0.035] p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#f5b85b] text-sm font-black text-[#102126] shadow-[0_14px_34px_rgba(245,184,91,.22)]">
            {(user?.fullName ?? "U").slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white">{user?.fullName ?? "Tam Lu user"}</p>
            <p className="truncate text-xs font-medium text-cyan-100/60">{roles.join(", ") || "Authenticated"}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full border-white/15 bg-white/[0.06] text-white hover:bg-white/10 hover:text-white" onClick={logout}>
          Sign out
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(circle_at_18%_-12%,rgba(45,212,191,.16),transparent_34%),radial-gradient(circle_at_88%_0%,rgba(245,184,91,.10),transparent_28%),linear-gradient(180deg,#031014_0%,#04181d_48%,#031014_100%)] text-white">
      <div className="lg:hidden">
        <div className="flex h-16 items-center justify-between border-b border-cyan-200/10 bg-[#041419] px-4 shadow-[0_10px_30px_rgba(0,0,0,.28)]">
          <Link to="/" className="text-lg font-black text-white">
            Tam Lu Relief
          </Link>
          <button className="rounded-full border border-white/15 bg-[#f5b85b] px-4 py-2 text-sm font-black text-[#102126]" type="button" onClick={() => setOpen((value) => !value)}>
            Menu
          </button>
        </div>
        {open ? <div className="fixed inset-0 z-50 bg-[#031014]/72 backdrop-blur-sm" onClick={() => setOpen(false)}>{sidebar}</div> : null}
      </div>

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72">{sidebar}</div>
      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:ml-72 lg:px-9 lg:py-7 xl:px-10">
        <Outlet />
      </main>
    </div>
  );
}
