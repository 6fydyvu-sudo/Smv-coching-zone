"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function DeleteButton({
  endpoint,
  confirmText = "Are you sure you want to delete this? This cannot be undone.",
  label = "Delete"
}: {
  endpoint: string;
  confirmText?: string;
  label?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!window.confirm(confirmText)) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to delete.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="inline-flex items-center gap-2">
      <Button type="button" variant="danger" size="sm" onClick={handleDelete} loading={isPending}>
        {label}
      </Button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
