"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";

export function MessageMarkReadButton({ id, isRead }: { id: string; isRead: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await fetch(`/api/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: !isRead })
      });
      router.refresh();
    });
  }

  return (
    <button type="button" onClick={toggle} disabled={isPending} className="disabled:opacity-50">
      <Badge tone={isRead ? "slate" : "amber"}>{isRead ? "Read" : "New"}</Badge>
    </button>
  );
}
