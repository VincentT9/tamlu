import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";
import { useAuthStore } from "@/features/auth/store";
import { Button } from "@/components/Button";

const publicLinks = [
  { label: "Trang chủ", to: "/", active: true },
  { label: "Về chúng tôi", to: "/#mission", active: false },
  { label: "Chiến dịch", to: "/campaigns", active: true },
  { label: "Bản đồ cứu trợ", to: "/relief-map", active: true },
  { label: "Biểu mẫu SOS", to: "/sos/new", active: true },
  { label: "Đồng hành", to: "/campaigns", active: false },
];

export function MainLayout() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <div className="min-h-[100dvh] bg-[var(--color-cream-50)] text-[var(--color-text)]">
      <header className="sticky top-0 z-40 bg-[var(--color-cream-50)]/90 px-2 py-2 backdrop-blur-xl md:px-4 md:py-3">
        <nav
          className="mx-auto flex h-16 max-w-[1500px] items-center justify-between rounded-[22px] border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 shadow-[var(--shadow-surface)] sm:px-4 lg:px-5"
          aria-label="Điều hướng chính"
        >
          <Link to="/" className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-green-600)] focus:ring-offset-2 focus:ring-offset-white">
            <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-2xl bg-white ring-1 ring-[var(--color-border)]">
              <img src="/images/tam-lu-logo.png" alt="Logo Tâm Lũ" className="h-10 w-10 object-contain" />
            </span>
            <span className="hidden sm:block">
              <span className="block text-base font-black leading-5 text-[var(--color-green-800)]">Tâm Lũ</span>
              <span className="block text-xs font-semibold text-[var(--color-text-muted)]">Kết nối yêu thương, cứu trợ lũ lụt</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 rounded-[18px] border border-[var(--color-border)] bg-[var(--color-green-50)] p-1 lg:flex">
            {publicLinks.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  clsx(
                    "rounded-[14px] px-2.5 py-2 text-sm font-bold text-[var(--color-text-muted)] transition hover:bg-[var(--color-bg-page)] hover:text-[var(--color-green-800)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green-600)] focus:ring-offset-2 focus:ring-offset-white xl:px-3.5",
                    item.active && isActive && "border border-[var(--color-border-strong)] bg-[var(--color-bg-page)] text-[var(--color-green-800)] hover:bg-[var(--color-bg-page)] hover:text-[var(--color-green-800)]",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-page)] px-3 py-2 text-sm font-bold text-[var(--color-green-800)] hover:bg-[var(--color-bg-card-strong)]">
                  {user?.fullName ?? "Bảng điều khiển"}
                </Link>
                <Button variant="ghost" className="min-h-10 px-4" onClick={logout}>
                  Đăng xuất
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-[14px] px-3 py-2 text-sm font-bold text-[var(--color-text-muted)] hover:bg-[var(--color-green-50)] hover:text-[var(--color-green-800)]">
                  Đăng nhập
                </Link>
                <Link to="/register">
                  <Button className="min-h-10 px-5">
                    Đăng ký
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="rounded-[14px] border border-[var(--color-green-700)] bg-[var(--color-green-700)] px-4 py-2 text-sm font-black text-white transition hover:bg-[var(--color-green-800)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green-600)] focus:ring-offset-2 focus:ring-offset-white lg:hidden"
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
          >
            Danh mục
          </button>
        </nav>

        {open ? (
          <div className="mx-auto mt-2 max-w-[1500px] rounded-[22px] border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3 shadow-[var(--shadow-surface)] lg:hidden">
            <div className="flex flex-col gap-2">
              {publicLinks.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className="rounded-[14px] px-3 py-3 text-sm font-bold text-[var(--color-green-800)] hover:bg-[var(--color-green-50)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green-600)]"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
              {isAuthenticated ? (
                <Button variant="outline" onClick={logout}>
                  Đăng xuất
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link to="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)}>
                    <Button className="w-full">Đăng ký</Button>
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

      <footer className="bg-[var(--color-cream-50)] px-2 pb-2 md:px-4 md:pb-4">
        <div className="mx-auto max-w-[1500px] rounded-[28px] border border-[var(--color-border)] bg-[var(--color-bg-card)] px-5 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-[1.3fr_.8fr_.8fr]">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-white ring-1 ring-[var(--color-border)]">
                  <img src="/images/tam-lu-logo.png" alt="Logo Tâm Lũ" className="h-12 w-12 object-contain" />
                </span>
                <div>
                  <p className="text-lg font-black">Tâm Lũ</p>
                  <p className="text-sm font-semibold text-[var(--color-text-muted)]">Kết nối yêu thương, cứu trợ lũ lụt</p>
                </div>
              </div>
              <p className="max-w-md text-sm leading-6 text-[var(--color-text-muted)]">
                Nền tảng cứu trợ cộng đồng phục vụ điều phối cứu hộ, chiến dịch minh bạch, công khai dòng tiền và phục hồi sau thiên tai.
              </p>
            </div>
            <div>
              <p className="mb-3 text-sm font-black text-[var(--color-green-800)]">Hỗ trợ</p>
              <div className="grid gap-2 text-sm font-semibold text-[var(--color-text-muted)]">
                <Link to="/campaigns" className="hover:text-[var(--color-green-800)]">Chiến dịch cứu trợ</Link>
                <Link to="/sos/new" className="hover:text-[var(--color-green-800)]">Yêu cầu cứu hộ khẩn cấp</Link>
                <Link to="/citizen/volunteer-profile" className="hover:text-[var(--color-green-800)]">Đăng ký tình nguyện</Link>
              </div>
            </div>
            <div>
              <p className="mb-3 text-sm font-black text-[var(--color-green-800)]">Minh bạch</p>
              <div className="grid gap-2 text-sm font-semibold text-[var(--color-text-muted)]">
                <Link to="/relief-map" className="hover:text-[var(--color-green-800)]">Bản đồ cứu trợ</Link>
                <Link to="/login" className="hover:text-[var(--color-green-800)]">Đăng nhập điều phối</Link>
                <Link to="/#contact" className="hover:text-[var(--color-green-800)]">Liên hệ</Link>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-col gap-2 border-t border-[var(--color-border)] pt-5 text-xs font-semibold text-[var(--color-text-muted)] md:flex-row md:items-center md:justify-between">
            <p>Xây dựng cho công tác điều phối nhân đạo.</p>
            <p>Ủng hộ, tình nguyện, xác minh và tái thiết bằng niềm tin công khai.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
