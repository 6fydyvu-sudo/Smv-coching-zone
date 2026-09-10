 import type { ReactNode } from "react";
import Link from "next/link";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { MobileSidebarToggle } from "@/components/dashboard/MobileSidebarToggle";

export interface NavItem {
  href: string;
  label: string;
  icon?: string;
}

function MenuIcon({ href }: { href: string }) {
  const iconClass = "h-5 w-5 shrink-0";

  if (href === "/admin" || href === "/student" || href === "/teacher") {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5M9 21v-6h6v6" />
      </svg>
    );
  }

  if (href.includes("students") || href.includes("profile")) {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 21c.7-4 3.1-6 7-6s6.3 2 7 6" />
      </svg>
    );
  }

  if (href.includes("teachers")) {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M3.5 20c.6-3.5 2.4-5.5 5.5-5.5s4.9 2 5.5 5.5M14 15c3.2-.2 5.2 1.4 6 5" />
      </svg>
    );
  }

  if (href.includes("courses") || href.includes("subjects") || href.includes("materials")) {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" />
        <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" />
      </svg>
    );
  }

  if (href.includes("batches")) {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </svg>
    );
  }

  if (href.includes("routine")) {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16M8 14h3M8 17h5" />
      </svg>
    );
  }

  if (href.includes("attendance")) {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="8.5" />
        <path d="m8 12 2.5 2.5L16 9" />
      </svg>
    );
  }

  if (href.includes("results") || href.includes("exams")) {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 3h12v18H6z" />
        <path d="M9 7h6M9 11h6M9 15h3" />
      </svg>
    );
  }

  if (href.includes("fees")) {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18M8 15h3" />
      </svg>
    );
  }

  if (href.includes("notices") || href.includes("notifications")) {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
        <path d="M10 21h4" />
      </svg>
    );
  }

  if (href.includes("gallery")) {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8" cy="9" r="1.5" />
        <path d="m4 17 5-5 3 3 2-2 6 5" />
      </svg>
    );
  }

  if (href.includes("achievements")) {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" />
        <path d="M8 6H5v2a3 3 0 0 0 3 3M16 6h3v2a3 3 0 0 1-3 3M12 13v5M8 21h8M9 18h6" />
      </svg>
    );
  }

  if (href.includes("testimonials") || href.includes("messages")) {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M4 5h16v11H8l-4 4V5Z" />
        <path d="M8 9h8M8 12h5" />
      </svg>
    );
  }

  if (href.includes("settings")) {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 1.7-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20h-2.4v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.7-1.7.1-.1A1.7 1.7 0 0 0 8.4 15a1.7 1.7 0 0 0-1.5-1H6v-2.4h.9a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L8 8.6l1.7-1.7.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.4v.8a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.7 1.7-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.9V14h-.9a1.7 1.7 0 0 0-1.5 1Z" />
      </svg>
    );
  }

  if (href.includes("change-password")) {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
      </svg>
    );
  }

  if (href.includes("admissions")) {
    return (
      <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 3v14M7 8l5-5 5 5" />
        <path d="M5 12v7h14v-7" />
      </svg>
    );
  }

  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
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
    <div className="flex min-h-screen min-w-0 bg-slate-50">
      <div
        id="dashboard-backdrop"
        className="fixed inset-0 z-30 hidden bg-slate-900/30 lg:hidden"
        aria-hidden="true"
      />

      <aside
        id="dashboard-sidebar"
        className="fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col border-r border-slate-200 bg-white shadow-xl transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shadow-none"
      >
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-200 px-5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
            SMV
          </span>

          <span className="truncate text-sm font-semibold text-slate-900">
            {siteName}
          </span>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                document
                  .getElementById("dashboard-sidebar")
                  ?.classList.add("-translate-x-full");

                document
                  .getElementById("dashboard-backdrop")
                  ?.classList.add("hidden");
              }}
              className="flex min-h-10 shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              <MenuIcon href={item.href} />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <MobileSidebarToggle />

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {roleLabel}
              </p>
              <p className="truncate text-xs text-slate-400">{userName}</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Link
              href="/"
              className="hidden text-sm text-slate-500 hover:text-brand-600 sm:block"
            >
              View Website
            </Link>

            <SignOutButton />
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
      }
