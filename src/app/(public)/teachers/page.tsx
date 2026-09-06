import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerDictionary } from "@/lib/locale";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Teachers" };
// Rendered per-request: teacher profiles are edited live from Admin, and
// static generation would need a reachable DATABASE_URL at build time.
export const dynamic = "force-dynamic";

type TeacherWithRelations = Prisma.TeacherProfileGetPayload<{
  include: { user: true; coursesTeaching: true };
}>;

export default async function TeachersPage() {
  const { dict } = getServerDictionary();
  const teachers: TeacherWithRelations[] = await prisma.teacherProfile.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    include: { user: true, coursesTeaching: true }
  });

  return (
    <div className="container-page py-14">
      <h1 className="text-3xl font-bold text-slate-900">{dict.nav.teachers}</h1>
      <div className="mt-8">
        {teachers.length === 0 ? (
          <EmptyState title={dict.common.noData} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((t: TeacherWithRelations) => (
              <Card key={t.id}>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-100">
                    {t.photoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={t.photoUrl} alt={t.user.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{t.user.name}</p>
                    <p className="text-sm text-slate-500">{t.subjectSpecialization}</p>
                    <p className="text-xs text-slate-400">{t.qualification}</p>
                  </div>
                </div>
                {t.bio && <p className="mt-3 text-sm text-slate-600">{t.bio}</p>}
                {t.experienceYears != null && (
                  <p className="mt-2 text-xs text-slate-400">{t.experienceYears} years of experience</p>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
