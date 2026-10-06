"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import type { AuthUser } from "@/lib/auth";
import { AuthUserProvider } from "@/lib/auth-context";
import { notifyToast } from "@/lib/toast";
import { EntrySplash } from "@/components/ui/entry-splash";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    label: "Inicio",
    href: "/",
    exact: true,
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Streams",
    href: "/streams",
    exact: false,
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "Clips",
    href: "/clips",
    exact: false,
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
    ),
  },
  {
    label: "Etiquetas",
    href: "/tags",
    exact: false,
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
] satisfies Array<{
  label: string;
  href: string;
  exact: boolean;
  icon: ReactNode;
  adminOnly?: boolean;
}>;

const adminNavItems = [
  {
    label: "Usuarios",
    href: "/usuarios",
    exact: false,
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 9V6a3 3 0 00-3-3H9a3 3 0 00-3 3v3m6 0h6m-6 0l2 2m-2-2l-2 2" />
      </svg>
    ),
    adminOnly: true,
  },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showWorkspaceSplash, setShowWorkspaceSplash] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (window.sessionStorage.getItem("cm:workspace-entry") !== "1") return;
    window.sessionStorage.removeItem("cm:workspace-entry");
    const frame = window.requestAnimationFrame(() => setShowWorkspaceSplash(true));
    const timeout = window.setTimeout(() => setShowWorkspaceSplash(false), 1100);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed");
      notifyToast("Sesión cerrada.");
      router.replace("/login");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
    }
  }

  const isCurrentActive = (item: { href: string; exact: boolean }) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  const visibleAdminNavItems = user?.role === "ADMIN" ? adminNavItems : [];
  const allNavItems = [...navItems, ...visibleAdminNavItems];

  const currentTitle = allNavItems.find(isCurrentActive)?.label ?? "Clip Manager";

  function renderNavItem(item: (typeof navItems)[number]) {
    const active = isCurrentActive(item);
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={`group relative flex items-center gap-3 rounded-lg py-2 pl-3.5 pr-3 text-xs font-medium transition-colors duration-150 ${
          active
            ? "bg-[#151515] text-[#F5F5F5]"
            : "text-[#A3A3A3] hover:bg-[#111111] hover:text-[#F5F5F5]"
        }`}
      >
        {active && (
          <span
            className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-[#E50914]"
            aria-hidden="true"
          />
        )}
        <span className={active ? "text-[#E50914]" : "text-[#737373] transition-colors group-hover:text-[#D4D4D4]"}>
          {item.icon}
        </span>
        <span className="truncate">{item.label}</span>
      </Link>
    );
  }

  return (
    <AuthUserProvider user={user}>
    <>
    {showWorkspaceSplash && <EntrySplash label="Abriendo tu workspace" />}
    <div className="min-h-screen w-full bg-[#050505] text-[#F5F5F5]">
      <div className="flex min-h-screen w-full">
        {/* Desktop Sidebar */}
        <aside className="hidden w-[15rem] shrink-0 border-r border-[#242424] bg-[#080808] lg:flex lg:flex-col lg:justify-between">
          <div>
            {/* Logo */}
            <div className="flex h-[4.25rem] items-center border-b border-[#242424] px-6">
              <Link href="/" className="group flex items-center gap-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/1.2.png"
                  alt="Clip Manager"
                  className="h-7 w-auto transition-transform duration-200 group-hover:scale-105"
                />
                <span className="text-sm font-bold tracking-tight text-white">Clip Manager</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="px-3 py-5" aria-label="Navegación principal">
              <div className="space-y-1">{navItems.slice(0, 1).map(renderNavItem)}</div>

              <p className="mb-2 mt-7 px-3.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#525252]">
                Contenido
              </p>
              <div className="space-y-1">{navItems.slice(1).map(renderNavItem)}</div>

              {visibleAdminNavItems.length > 0 && (
                <>
                  <p className="mb-2 mt-7 px-3.5 text-[9px] font-bold uppercase tracking-[0.2em] text-[#525252]">
                    Administración
                  </p>
                  <div className="space-y-1">{visibleAdminNavItems.map(renderNavItem)}</div>
                </>
              )}
            </nav>
          </div>

          {/* User profile & Logout */}
          <div className="border-t border-[#242424] bg-[#080808] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#242424] bg-[#111111] text-[11px] font-bold text-[#D4D4D4]">
                  {(user?.name ?? "?").trim().charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-[#F5F5F5]">
                    {user?.name ?? "Cargando..."}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        user?.role === "ADMIN" ? "bg-[#E50914]" : "bg-[#22C55E]"
                      }`}
                    />
                    <span className="truncate text-[9px] font-semibold uppercase tracking-wider text-[#737373]">
                      {user?.role === "ADMIN" ? "Administrador" : "Moderador"}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={isLoggingOut}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[#242424] bg-[#111111] text-[#737373] transition-colors hover:border-[#7F1D1D] hover:bg-[#EF4444]/10 hover:text-[#F87171] focus:outline-none focus:ring-1 focus:ring-[#E50914] disabled:opacity-50"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="flex h-[4.25rem] shrink-0 items-center justify-between gap-4 border-b border-[#242424] bg-[#050505]/90 px-4 backdrop-blur-md sm:px-8">
            <div className="flex min-w-0 items-center gap-2 text-xs">
              <span className="hidden shrink-0 font-medium uppercase tracking-[0.14em] text-[#525252] sm:inline">
                Clip Manager
              </span>
              <span className="hidden text-[#303030] sm:inline" aria-hidden="true">
                /
              </span>
              <h1 className="truncate font-semibold text-[#F5F5F5]">{currentTitle}</h1>
            </div>

            {/* Right side status / user */}
            <div className="flex shrink-0 items-center gap-3">
              {user && (
                <>
                  <div className="hidden text-right sm:block">
                    <p className="truncate text-xs font-medium text-[#F5F5F5]">{user.name}</p>
                    <p className="text-[9px] font-semibold uppercase tracking-wider text-[#737373]">
                      {user.role === "ADMIN" ? "Administrador" : "Moderador"}
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => void handleLogout()}
                    disabled={isLoggingOut}
                    isLoading={isLoggingOut}
                    loadingLabel="Cerrando..."
                  >
                    Cerrar sesión
                  </Button>
                </>
              )}
            </div>
          </header>

          {/* Page body */}
          <div className="flex-1 bg-[#050505]">{children}</div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Navegación móvil"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-[#242424] bg-[#080808]/95 px-3 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-lg lg:hidden"
      >
        <div className={`grid ${user?.role === "ADMIN" ? "grid-cols-5" : "grid-cols-4"} gap-1`}>
          {allNavItems.map((item) => {
            const active = isCurrentActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-1 rounded-lg py-2 text-[10px] font-medium transition-colors ${
                  active
                    ? "bg-[#151515] text-[#E50914]"
                    : "text-[#737373] hover:text-[#F5F5F5]"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
    </>
    </AuthUserProvider>
  );
}
