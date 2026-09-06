"use client";

import { useState } from "react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import type { Locale } from "@/i18n/dictionaries";

export function MobileNav({
  links,
  locale,
  isLoggedIn,
  dashboardHref,
  loginLabel,
  dashboardLabel
}: {
  links: { href: string; label: string }[];
  locale: Locale;
  isLoggedIn: boolean;
  dashboardHref: string;
  loginLabel: string;
  dashboardLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-slate-200 bg-white px-4 pb-6 pt-2 shadow-lg">
          <div className="mb-3">
            <LanguageSwitcher current={locale} />
          </div>
          <nav className="flex flex-col divide-y divide-slate-100">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-3 text-sm font-medium text-slate-700"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <Link
            href={isLoggedIn ? dashboardHref : "/login"}
            onClick={() => setOpen(false)}
            className="mt-3 block rounded-lg bg-brand-600 px-4 py-2.5 text-center text-sm font-medium text-white"
          >
            {isLoggedIn ? dashboardLabel : loginLabel}
          </Link>
        </div>
      )}
    </div>
  );
}
