import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { MobileSidebarToggle } from "@/components/dashboard/MobileSidebarToggle";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function DashboardShell({
  navItems,
  roleLabel,
  userName,
  siteName,
  children
}: {
  navItems: NavItem[];
  roleLabel: string;
  userName: string;
  siteName: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar: always fixed (both mobile and desktop). On mobile it's
          translated off-screen by default and toggled via the hamburger
          button; on desktop (lg:) it's permanently visible. Content below
          reserves space for it at the SAME breakpoint (lg:pl-64), so the
          two are always in sync and never overlap. */}
      <aside
        id="dashboard-sidebar"
        className="fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0"
      >
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
            SMV
          </span>
          <span className="truncate text-sm font-semibold text-slate-900">{siteName}</span>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700"
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Backdrop: only ever visible on mobile, only while the sidebar is
          open (toggled together with it). Tapping it closes the sidebar. */}
      <div
        id="dashboard-backdrop"
        className="fixed inset-0 z-30 hidden bg-slate-900/50 lg:hidden"
      />

      {/* Content column: lg:pl-64 permanently reserves the sidebar's width
          on desktop, at the same breakpoint the sidebar becomes visible. */}
      <div className="flex min-h-screen flex-col lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <MobileSidebarToggle />
            <div>
              <p className="text-sm font-semibold text-slate-900">{roleLabel}</p>
              <p className="text-xs text-slate-400">{userName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-slate-500 hover:text-brand-600">
              View Website
            </Link>
            <SignOutButton />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
