import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "@/components/dashboard/SignOutButton";

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
      {/* Sidebar: ALWAYS visible, on every screen size — never hidden,
          never toggled, never overlays content. On narrow (phone) screens
          it's a compact icon-only rail (w-16); at the lg: breakpoint it
          expands to show labels too (w-64). The content column below
          reserves the exact matching width at each size (pl-16 / lg:pl-64),
          so the two are always in sync and can never overlap or cover
          each other. */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-16 flex-col border-r border-slate-200 bg-white lg:w-64">
        <div className="flex h-16 shrink-0 items-center justify-center gap-2 border-b border-slate-200 px-2 lg:justify-start lg:px-5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
            SMV
          </span>
          <span className="hidden truncate text-sm font-semibold text-slate-900 lg:inline">
            {siteName}
          </span>
        </div>
        <nav className="flex flex-1 flex-col items-center gap-0.5 overflow-y-auto p-2 lg:items-stretch lg:p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className="flex items-center justify-center gap-3 rounded-lg px-0 py-2.5 text-sm font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700 lg:justify-start lg:px-3 lg:py-2"
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                <span className="hidden truncate lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Content column: pl-16 (mobile) / lg:pl-64 (desktop) permanently
          reserves the sidebar's current width at every screen size. */}
      <div className="flex min-h-screen flex-col pl-16 lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-3 sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{roleLabel}</p>
            <p className="truncate text-xs text-slate-400">{userName}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="hidden text-sm text-slate-500 hover:text-brand-600 sm:inline"
            >
              View Website
            </Link>
            <SignOutButton />
          </div>
        </header>
        <main className="flex-1 p-3 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
