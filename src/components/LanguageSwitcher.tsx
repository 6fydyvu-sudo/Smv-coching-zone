"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALE_COOKIE, type Locale } from "@/i18n/dictionaries";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setLocale(locale: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`;
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-0.5 text-xs font-medium">
      <button
        type="button"
        onClick={() => setLocale("bn")}
        disabled={isPending}
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors",
          current === "bn" ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100"
        )}
      >
        বাংলা
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        disabled={isPending}
        className={cn(
          "rounded-full px-2.5 py-1 transition-colors",
          current === "en" ? "bg-brand-600 text-white" : "text-slate-600 hover:bg-slate-100"
        )}
      >
        English
      </button>
    </div>
  );
}
