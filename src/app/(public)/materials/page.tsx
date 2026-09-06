import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerDictionary } from "@/lib/locale";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Alert } from "@/components/ui/Alert";

export const metadata: Metadata = { title: "Study Materials" };
// Rendered per-request: materials are managed live from Admin/Teacher
// dashboards, and static generation would need a reachable DATABASE_URL
// at build time.
export const dynamic = "force-dynamic";

// Public page shows only materials that are (a) published and (b) not tied
// to a specific batch — i.e. general/free resources. Batch-restricted
// materials are only visible to enrolled students via the Student Dashboard.
type MaterialWithRelations = Prisma.StudyMaterialGetPayload<{
  include: { course: true; subject: true };
}>;

export default async function PublicMaterialsPage() {
  const { locale, dict } = getServerDictionary();
  const materials: MaterialWithRelations[] = await prisma.studyMaterial.findMany({
    where: { published: true, batchId: null },
    orderBy: { createdAt: "desc" },
    include: { course: true, subject: true }
  });

  return (
    <div className="container-page py-14">
      <h1 className="text-3xl font-bold text-slate-900">{dict.nav.materials}</h1>
      <div className="mt-4">
        <Alert tone="info">
          Materials assigned to a specific batch are only visible to enrolled students after login.
        </Alert>
      </div>
      <div className="mt-8">
        {materials.length === 0 ? (
          <EmptyState title={dict.common.noData} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {materials.map((m: MaterialWithRelations) => (
              <a
                key={m.id}
                href={m.fileUrl ?? m.externalUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-md"
              >
                <Badge tone="blue">{m.type.replace("_", " ")}</Badge>
                <p className="mt-2 font-semibold text-slate-900">
                  {locale === "bn" ? m.titleBn : m.titleEn}
                </p>
                <p className="text-xs text-slate-400">
                  {m.course?.nameEn} {m.subject ? `· ${m.subject.nameEn}` : ""}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
