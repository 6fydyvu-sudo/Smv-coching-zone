import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Tone = "success" | "error" | "info" | "warning";

const toneClasses: Record<Tone, string> = {
  success: "bg-emerald-50 text-emerald-800 border-emerald-200",
  error: "bg-red-50 text-red-800 border-red-200",
  info: "bg-brand-50 text-brand-800 border-brand-200",
  warning: "bg-amber-50 text-amber-800 border-amber-200"
};

export function Alert({ tone = "info", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <div className={cn("rounded-xl border px-4 py-3 text-sm", toneClasses[tone])} role="alert">
      {children}
    </div>
  );
}
