import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";
import { useAuthStore } from "@/features/auth/store";
import { Button } from "@/components/Button";

const publicLinks = [
  { label: "Home", to: "/" },
  { label: "Campaigns", to: "/campaigns" },
  { label: "SOS", to: "/sos" },
  { label: "Volunteer", to: "/citizen/volunteer-profile" },
];

export function MainLayout() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main navigation">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-water-600 text-lg font-black text-white shadow-soft">TL</span>
            <span>
              <span className="block text-base font-black leading-5 text-water-700">Tam Lu</span>
              <span className="block text-xs font-medium text-slate-500">Flood relief transparency</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {publicLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    "rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-water-700",
                    isActive && "bg-water-50 text-water-700",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-2 md:flex">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="rounded-full bg-slate-100 px-3 py-2 text-sm font-bold text-slate-700">
                  {user?.fullName ?? "Dashboard"}
                </Link>
                <Button variant="ghost" className="min-h-10" onClick={logout}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100">
                  Login
                </Link>
                <Link to="/register">
                  <Button className="min-h-10">Register</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 md:hidden"
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
          >
            Menu
          </button>
        </nav>

        {open ? (
          <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
            <div className="flex flex-col gap-2">
              {publicLinks.map((item) => (
                <NavLink key={item.to} to={item.to} className="rounded-lg px-3 py-2 text-sm font-bold text-slate-700" onClick={() => setOpen(false)}>
                  {item.label}
                </NavLink>
              ))}
              {isAuthenticated ? (
                <Button variant="outline" onClick={logout}>
                  Sign out
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)}>
                    <Button className="w-full">Register</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="font-semibold text-slate-700">Tam Lu protects public trust through visible rescue, aid, and donation records.</p>
          <p>Built for humanitarian coordination.</p>
        </div>
      </footer>
    </div>
  );
}
