import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";
import { useAuthStore } from "@/features/auth/store";
import { ROLES } from "@/shared/constants/roles";
import { Button } from "@/components/Button";

interface DashboardNavItem {
  label: string;
  to: string;
  roles?: string[];
}

const dashboardNav: DashboardNavItem[] = [
  { label: "Overview", to: "/dashboard" },
  { label: "My SOS", to: "/citizen/sos", roles: [ROLES.citizen] },
  { label: "Donations", to: "/donor/donations", roles: [ROLES.donor, ROLES.citizen, ROLES.coordinator, ROLES.admin] },
  { label: "Profile", to: "/profile" },
  { label: "Operations", to: "/ops", roles: [ROLES.admin, ROLES.coordinator, ROLES.financialOfficer] },
  { label: "SOS Queue", to: "/ops/sos", roles: [ROLES.admin, ROLES.coordinator] },
  { label: "Missions", to: "/ops/missions", roles: [ROLES.admin, ROLES.coordinator] },
  { label: "Inventory", to: "/ops/inventory", roles: [ROLES.admin, ROLES.coordinator, ROLES.financialOfficer] },
  { label: "Shipments", to: "/ops/shipments", roles: [ROLES.admin, ROLES.coordinator, ROLES.rescueTeam] },
  { label: "Finance", to: "/ops/disbursements", roles: [ROLES.admin, ROLES.financialOfficer, ROLES.coordinator] },
  { label: "Volunteers", to: "/ops/volunteers", roles: [ROLES.admin, ROLES.coordinator] },
  { label: "Organizations", to: "/ops/organizations", roles: [ROLES.admin] },
  { label: "Users", to: "/ops/users", roles: [ROLES.admin] },
  { label: "Team Missions", to: "/team/missions", roles: [ROLES.rescueTeam] },
  { label: "Area Assessments", to: "/team/area-assessments", roles: [ROLES.rescueTeam] },
];

export function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const { user, roles, logout, hasAnyRole } = useAuthStore();
  const visibleItems = dashboardNav.filter((item) => !item.roles || hasAnyRole(item.roles));

  const sidebar = (
    <aside className="flex h-full flex-col border-r border-slate-200 bg-white">
      <Link to="/" className="border-b border-slate-200 p-5">
        <span className="block text-xl font-black text-water-700">Tam Lu</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Operations Console</span>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Dashboard navigation">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              clsx(
                "block rounded-lg px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-water-700",
                isActive && "bg-water-600 text-white shadow-soft hover:bg-water-700 hover:text-white",
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-rescue-500 text-sm font-black text-white">
            {(user?.fullName ?? "U").slice(0, 1)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-900">{user?.fullName ?? "Tam Lu user"}</p>
            <p className="truncate text-xs font-medium text-slate-500">{roles.join(", ") || "Authenticated"}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={logout}>
          Sign out
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="lg:hidden">
        <div className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4">
          <Link to="/" className="text-lg font-black text-water-700">
            Tam Lu
          </Link>
          <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold" type="button" onClick={() => setOpen((value) => !value)}>
            Menu
          </button>
        </div>
        {open ? <div className="fixed inset-0 z-50 bg-slate-950/40" onClick={() => setOpen(false)}>{sidebar}</div> : null}
      </div>

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72">{sidebar}</div>
      <main className="px-4 py-6 sm:px-6 lg:ml-72 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
