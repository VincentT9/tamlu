import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuthStore } from "@/features/auth/store";
import { Button } from "@/components/Button";

const publicLinks = [
  { label: "Trang chủ", to: "/", hash: "" },
  { label: "Quy trình", to: "/#mission", hash: "#mission" },
  { label: "Hỗ trợ", to: "/#our-work", hash: "#our-work" },
  { label: "Chiến dịch", to: "/#campaigns-preview", hash: "#campaigns-preview" },
];

type PublicLink = (typeof publicLinks)[number];

function preferredScrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

export function MainLayout() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToLandingTarget = useCallback((hash: string, behavior: ScrollBehavior) => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior });
      return true;
    }

    const target = document.getElementById(hash.slice(1));
    if (!target) return false;

    target.scrollIntoView({ behavior, block: "start" });
    return true;
  }, []);

  const fallbackToLandingTop = useCallback((hash: string) => {
    console.warn(`[Tâm Lũ] Không tìm thấy điểm cuộn ${hash || "đầu trang"}; đã đưa người dùng về đầu trang.`);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    if (location.pathname !== "/") return;

    let frameId = 0;
    let attempts = 0;
    const maxAttempts = 12;

    const attemptScroll = () => {
      if (scrollToLandingTarget(location.hash, preferredScrollBehavior())) return;

      attempts += 1;
      if (attempts >= maxAttempts) {
        fallbackToLandingTop(location.hash);
        return;
      }

      frameId = window.requestAnimationFrame(attemptScroll);
    };

    frameId = window.requestAnimationFrame(attemptScroll);
    return () => window.cancelAnimationFrame(frameId);
  }, [fallbackToLandingTop, location.hash, location.pathname, scrollToLandingTarget]);

  const handlePublicNavClick = (event: MouseEvent<HTMLAnchorElement>, item: PublicLink) => {
    event.preventDefault();
    setOpen(false);

    if (location.pathname === "/") {
      navigate(item.to, { replace: true });
      if (!scrollToLandingTarget(item.hash, preferredScrollBehavior())) {
        fallbackToLandingTop(item.hash);
      }
      return;
    }

    navigate(item.to);
  };

  const isPublicLinkActive = (item: PublicLink) =>
    location.pathname === "/" && location.hash === item.hash;

  return (
    <div className="min-h-[100dvh] bg-[var(--color-cream-50)] text-[var(--color-text)]">
      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-cream-50)]/95 px-3 py-2 backdrop-blur-xl md:px-5">
        <nav
          className="mx-auto flex h-16 max-w-[1440px] items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 shadow-[var(--shadow-surface)] sm:px-4 lg:px-5"
          aria-label="Điều hướng chính"
        >
          <Link to="/" className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-[var(--color-green-600)] focus:ring-offset-2 focus:ring-offset-white">
            <img src="/images/tam-lu-logo-transparent.png" alt="Logo Tâm Lũ" className="h-14 w-14 object-contain" />
            <span className="hidden sm:block">
              <span className="block text-base font-black leading-5 text-[var(--color-green-800)]">Tâm Lũ</span>
              <span className="block text-xs font-semibold text-[var(--color-text-muted)]">Kết nối yêu thương, cứu trợ lũ lụt</span>
            </span>
          </Link>

          <div className="hidden items-center gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-green-50)] p-1 lg:flex">
            {publicLinks.map((item) => {
              const isActive = isPublicLinkActive(item);
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  aria-current={isActive ? "page" : undefined}
                  onClick={(event) => handlePublicNavClick(event, item)}
                  className={clsx(
                    "rounded-lg px-2.5 py-2 text-sm font-bold text-[var(--color-text-muted)] transition hover:bg-white hover:text-[var(--color-green-800)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green-600)] focus:ring-offset-2 focus:ring-offset-white xl:px-3.5",
                    isActive && "bg-white text-[var(--color-green-800)] shadow-sm hover:bg-white hover:text-[var(--color-green-800)]",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  aria-label="Mở bảng điều hướng"
                  title="Mở bảng điều hướng"
                  className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-page)] text-[var(--color-green-800)] transition hover:bg-[var(--color-green-50)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green-600)] focus:ring-offset-2 focus:ring-offset-white"
                >
                  <MenuIcon fontSize="small" />
                </Link>
                <details className="group relative">
                  <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-page)] px-3 py-2 text-sm font-bold text-[var(--color-green-800)] transition hover:bg-[var(--color-bg-card-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green-600)] [&::-webkit-details-marker]:hidden">
                    <span className="max-w-44 truncate">{user?.fullName ?? "Tài khoản"}</span>
                    <KeyboardArrowDownIcon aria-hidden="true" fontSize="small" className="transition group-open:rotate-180" />
                  </summary>
                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-56 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-2 shadow-[var(--shadow-surface)]">
                    <div className="border-b border-[var(--color-border)] px-3 py-2">
                      <p className="truncate text-sm font-black text-[var(--color-green-800)]">{user?.fullName ?? "Người dùng Tâm Lũ"}</p>
                      <p className="truncate text-xs text-[var(--color-text-muted)]">{user?.email ?? "Tài khoản đã xác thực"}</p>
                    </div>
                    <Link to="/profile" className="mt-1 block rounded-lg px-3 py-2.5 text-sm font-bold text-[var(--color-text-muted)] hover:bg-[var(--color-green-50)] hover:text-[var(--color-green-800)]">
                      Thông tin cá nhân
                    </Link>
                    <button type="button" onClick={logout} className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-bold text-[var(--color-text-muted)] hover:bg-[var(--color-green-50)] hover:text-[var(--color-green-800)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green-600)]">
                      Đăng xuất
                    </button>
                  </div>
                </details>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-xl px-3 py-2 text-sm font-bold text-[var(--color-text-muted)] hover:bg-[var(--color-green-50)] hover:text-[var(--color-green-800)]">
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
            className="rounded-xl border border-[var(--color-green-700)] bg-[var(--color-green-700)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--color-green-800)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green-600)] focus:ring-offset-2 focus:ring-offset-white lg:hidden"
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
          >
            Danh mục
          </button>
        </nav>

        {open ? (
          <div className="mx-auto mt-2 max-w-[1440px] rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3 shadow-[var(--shadow-surface)] lg:hidden">
            <div className="flex flex-col gap-2">
              {publicLinks.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  aria-current={isPublicLinkActive(item) ? "page" : undefined}
                  className={clsx(
                    "rounded-xl px-3 py-3 text-sm font-bold text-[var(--color-green-800)] hover:bg-[var(--color-green-50)] focus:outline-none focus:ring-2 focus:ring-[var(--color-green-600)]",
                    isPublicLinkActive(item) && "bg-[var(--color-green-50)]",
                  )}
                  onClick={(event) => handlePublicNavClick(event, item)}
                >
                  {item.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link to="/profile" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Thông tin cá nhân
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={logout}>
                    Đăng xuất
                  </Button>
                </>
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

      <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-10 md:px-6">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-8 md:grid-cols-[1.35fr_.75fr_.75fr] md:items-start">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <img src="/images/tam-lu-logo-transparent.png" alt="Logo Tâm Lũ" className="h-20 w-20 object-contain" />
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
