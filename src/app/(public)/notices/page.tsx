import type { Metadata } from "next";
import Link from "next/link";
import type { Notice } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerDictionary } from "@/lib/locale";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Notices" };
// Rendered per-request: notices are edited live from Admin, and static
// generation would need a reachable DATABASE_URL at build time.
export const dynamic = "force-dynamic";

export default async function NoticesPage() {
  const { locale, dict } = getServerDictionary();
  const notices: Notice[] = await prisma.notice.findMany({
    where: { published: true },
    orderBy: [{ pinned: "desc" }, { publishDate: "desc" }]
  });

  return (
    <div className="container-page py-14">
      <h1 className="text-3xl font-bold text-slate-900">{dict.nav.notices}</h1>
      <div className="mt-8">
        {notices.length === 0 ? (
          <EmptyState title={dict.common.noData} />
        ) : (
          <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
            {notices.map((n: Notice) => (
              <li key={n.id}>
                <Link href={`/notices/${n.id}`} className="flex items-start justify-between gap-3 p-5 hover:bg-slate-50">
                  <div>
                    <p className="font-semibold text-slate-900">{locale === "bn" ? n.titleBn : n.titleEn}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {n.category ?? "General"} · {formatDate(n.publishDate, locale)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {n.pinned && <Badge tone="amber">Pinned</Badge>}
                    {n.priority === "HIGH" && <Badge tone="red">High Priority</Badge>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
