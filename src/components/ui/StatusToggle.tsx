"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";

/** Click-to-toggle a boolean field (e.g. published/pinned) via PATCH. */
export function StatusToggle({
  endpoint,
  field,
  value,
  trueLabel,
  falseLabel
}: {
  endpoint: string;
  field: string;
  value: boolean;
  trueLabel: string;
  falseLabel: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !value })
      });
      router.refresh();
    });
  }

  return (
    <button type="button" onClick={toggle} disabled={isPending} className="disabled:opacity-50">
      <Badge tone={value ? "green" : "slate"}>{value ? trueLabel : falseLabel}</Badge>
    </button>
  );
}
