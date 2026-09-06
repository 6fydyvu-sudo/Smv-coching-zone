import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

export default async function TeacherNoticesPage() {
  const notices = await prisma.notice.findMany({
    where: { published: true },
    orderBy: [{ pinned: "desc" }, { publishDate: "desc" }]
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Notices</h1>
      <div className="mt-6">
        {notices.length === 0 ? (
          <EmptyState title="No notices published yet" />
        ) : (
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
            {notices.map((n) => (
              <li key={n.id} className="flex items-start justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-slate-900">{n.titleEn}</p>
                  <p className="text-xs text-slate-400">{n.category ?? "General"} · {formatDate(n.publishDate)}</p>
                </div>
                {n.pinned && <Badge tone="amber">Pinned</Badge>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
