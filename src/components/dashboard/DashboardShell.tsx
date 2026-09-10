import type { ReactNode } from "react";
import Link from "next/link";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { MobileSidebarToggle } from "@/components/dashboard/MobileSidebarToggle";

export interface NavItem {
  href: string;
  label: string;
  icon?: string;
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
    <div className="flex min-h-screen bg-slate-50">
      <aside
        id="dashboard-sidebar"
        className="fixed inset-y-0 left-0 z-30 w-64 -translate-x-full border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0"
      >
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
            SMV
          </span>
          <span className="text-sm font-semibold text-slate-900">{siteName}</span>
        </div>
        <nav className="flex flex-col gap-0.5 p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col lg:pl-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
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
