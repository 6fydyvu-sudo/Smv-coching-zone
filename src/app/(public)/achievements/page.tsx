import type { Metadata } from "next";
import type { Achievement } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerDictionary } from "@/lib/locale";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Achievements" };
// Rendered per-request rather than statically at build time: this content
// is edited live from the Admin panel, and static generation would
// require a reachable DATABASE_URL during `next build` (not available on
// hosts like Netlify's drop-deploy unless explicitly configured).
export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  const { dict } = getServerDictionary();
  const achievements: Achievement[] = await prisma.achievement.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="container-page py-14">
      <h1 className="text-3xl font-bold text-slate-900">{dict.nav.achievements}</h1>
      <div className="mt-8">
        {achievements.length === 0 ? (
          <EmptyState title={dict.common.noData} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((a: Achievement) => (
              <Card key={a.id}>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-100">
                    {a.photoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.photoUrl} alt={a.studentName} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{a.studentName}</p>
                    <p className="text-sm text-slate-500">{a.courseOrClass}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium text-brand-700">{a.examName}</p>
                <p className="text-sm text-slate-600">{a.resultText}</p>
                {a.description && <p className="mt-2 text-sm text-slate-500">{a.description}</p>}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

