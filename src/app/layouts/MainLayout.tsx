import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";
import { useAuthStore } from "@/features/auth/store";
import { Button } from "@/components/Button";

const publicLinks = [
  { label: "Home", to: "/" },
  { label: "Our Work", to: "/campaigns" },
  { label: "Relief Areas", to: "/relief-map" },
  { label: "Donate", to: "/campaigns" },
  { label: "Contact", to: "/#contact" },
];

export function MainLayout() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <div className="min-h-[100dvh] bg-[#031014] text-white">
      <header className="sticky top-0 z-40 bg-[#031014]/88 px-2 py-2 backdrop-blur-xl md:px-4 md:py-3">
        <nav
          className="mx-auto flex h-16 max-w-[1500px] items-center justify-between rounded-[28px] border border-[rgba(45,212,191,.34)] bg-[#061a22]/94 px-3 shadow-[0_22px_70px_rgba(0,0,0,0.36)] ring-1 ring-white/[0.04] sm:px-4 lg:px-5"
          aria-label="Main navigation"
        >
          <Link to="/" className="flex items-center gap-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#67e8f9] focus:ring-offset-2 focus:ring-offset-[#031014]">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#2dd4bf] text-sm font-black text-[#031014] shadow-[0_14px_34px_rgba(45,212,191,.26)]">TL</span>
            <span className="hidden sm:block">
              <span className="block text-base font-black leading-5 text-white">Tam Lu Relief</span>
              <span className="block text-xs font-semibold text-white/52">Flood rescue and recovery</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.045] p-1 md:flex">
            {publicLinks.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    "rounded-full px-3 py-2 text-sm font-bold text-white/66 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#67e8f9] focus:ring-offset-2 focus:ring-offset-[#061a22] lg:px-4",
                    item.label !== "Donate" && item.label !== "Contact" && isActive && "bg-[#2dd4bf] text-[#031014] shadow-[0_10px_30px_rgba(45,212,191,.25)] hover:bg-[#67e8f9] hover:text-[#031014]",
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
                <Link to="/dashboard" className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-bold text-white/82 hover:bg-white/10 hover:text-white">
                  {user?.fullName ?? "Dashboard"}
                </Link>
                <Button variant="ghost" className="min-h-10 rounded-full px-4 text-white/76 hover:bg-white/10 hover:text-white focus:ring-[#67e8f9] focus:ring-offset-[#031014]" onClick={logout}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-full px-3 py-2 text-sm font-bold text-white/68 hover:bg-white/10 hover:text-white">
                  Login
                </Link>
                <Link to="/register">
                  <Button className="min-h-10 rounded-full !bg-[#f5b85b] px-5 !text-[#102126] shadow-[0_14px_34px_rgba(245,184,91,.24)] hover:!bg-[#ffd07a] focus:ring-[#f5b85b] focus:ring-offset-[#031014]">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="rounded-full border border-white/12 bg-[#f5b85b] px-4 py-2 text-sm font-black text-[#102126] shadow-[0_12px_28px_rgba(245,184,91,.22)] transition hover:bg-[#ffd07a] focus:outline-none focus:ring-2 focus:ring-[#f5b85b] focus:ring-offset-2 focus:ring-offset-[#031014] md:hidden"
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
          >
            Menu
          </button>
        </nav>

        {open ? (
          <div className="mx-auto mt-2 max-w-[1500px] rounded-[28px] border border-[rgba(45,212,191,.34)] bg-[#061a22] px-4 py-3 shadow-[0_28px_80px_rgba(0,0,0,.42)] ring-1 ring-white/[0.04] md:hidden">
            <div className="flex flex-col gap-2">
              {publicLinks.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className="rounded-2xl px-3 py-3 text-sm font-bold text-white/78 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#67e8f9]"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
              {isAuthenticated ? (
                <Button variant="outline" className="border-white/14 bg-white/[0.06] text-white hover:bg-white/10 hover:text-white focus:ring-[#67e8f9] focus:ring-offset-[#031014]" onClick={logout}>
                  Sign out
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link to="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full border-white/14 bg-white/[0.06] text-white hover:bg-white/10 hover:text-white focus:ring-[#67e8f9] focus:ring-offset-[#031014]">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)}>
                    <Button className="w-full !bg-[#f5b85b] !text-[#102126] hover:!bg-[#ffd07a] focus:ring-[#f5b85b] focus:ring-offset-[#031014]">Register</Button>
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

      <footer className="bg-[#031014] px-2 pb-2 md:px-4 md:pb-4">
        <div className="mx-auto max-w-[1500px] rounded-[32px] border border-white/10 bg-[#061a22] px-5 py-10 ring-1 ring-[#2dd4bf]/20 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-[1.3fr_.8fr_.8fr]">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#2dd4bf] text-sm font-black text-[#031014]">TL</span>
                <div>
                  <p className="text-lg font-black">Tam Lu Relief</p>
                  <p className="text-sm font-semibold text-white/50">Transparent flood rescue and recovery</p>
                </div>
              </div>
              <p className="max-w-md text-sm leading-6 text-white/58">
                A public relief platform for rescue coordination, verified campaigns, donor transparency, and community recovery after floods.
              </p>
            </div>
            <div>
              <p className="mb-3 text-sm font-black text-[#67e8f9]">Support</p>
              <div className="grid gap-2 text-sm font-semibold text-white/58">
                <Link to="/campaigns" className="hover:text-white">Campaigns</Link>
                <Link to="/sos/new" className="hover:text-white">Emergency SOS</Link>
                <Link to="/citizen/volunteer-profile" className="hover:text-white">Volunteer</Link>
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-black text-[#67e8f9]">Trust</p>
              <div className="grid gap-2 text-sm font-semibold text-white/58">
                <Link to="/relief-map" className="hover:text-white">Relief areas</Link>
                <Link to="/login" className="hover:text-white">Coordinator login</Link>
                <Link to="/#contact" className="hover:text-white">Contact</Link>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-2 border-t border-white/10 pt-5 text-xs font-semibold text-white/42 md:flex-row md:items-center md:justify-between">
            <p>Built for humanitarian coordination.</p>
            <p>Donate, volunteer, verify, and rebuild with public trust.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
