import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/EmptyState";
import { MessageMarkReadButton } from "@/components/dashboard/MessageMarkReadButton";
import { formatDate } from "@/lib/utils";

export default async function AdminMessagesPage() {
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Contact Messages</h1>
      <p className="mt-1 text-sm text-slate-500">Messages submitted through the public contact form.</p>

      <div className="mt-6">
        {messages.length === 0 ? (
          <EmptyState title="No messages yet" />
        ) : (
          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{m.name}</p>
                    <p className="text-xs text-slate-400">
                      {m.email ?? "No email"} {m.phone ? `· ${m.phone}` : ""} · {formatDate(m.createdAt)}
                    </p>
                  </div>
                  <MessageMarkReadButton id={m.id} isRead={m.isRead} />
                </div>
                {m.subject && <p className="mt-2 text-sm font-medium text-slate-700">{m.subject}</p>}
                <p className="mt-1 text-sm text-slate-600">{m.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
