"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Badge } from "@/components/ui/Badge";

interface Notification {
  id: string;
  titleEn: string;
  bodyEn: string | null;
  isRead: boolean;
  createdAt: string;
  link: string | null;
}

export function NotificationList({ notifications }: { notifications: Notification[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function markRead(id: string) {
    startTransition(async () => {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true })
      });
      router.refresh();
    });
  }

  if (notifications.length === 0) {
    return <p className="text-sm text-slate-400">No notifications yet.</p>;
  }

  return (
    <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
      {notifications.map((n) => (
        <li key={n.id} className="flex items-start justify-between gap-3 p-4">
          <div>
            <p className="font-medium text-slate-900">{n.titleEn}</p>
            {n.bodyEn && <p className="mt-1 text-sm text-slate-500">{n.bodyEn}</p>}
            <p className="mt-1 text-xs text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
          </div>
          {n.isRead ? (
            <Badge tone="slate">Read</Badge>
          ) : (
            <button
              type="button"
              onClick={() => markRead(n.id)}
              disabled={isPending}
              className="disabled:opacity-50"
            >
              <Badge tone="amber">Mark as read</Badge>
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
