import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerDictionary } from "@/lib/locale";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Courses" };
// Rendered per-request: courses are edited live from Admin, and static
// generation would need a reachable DATABASE_URL at build time. This page
// also reads searchParams (q/class), which already makes it dynamic.
export const dynamic = "force-dynamic";

export default async function CoursesPage({
  searchParams
}: {
  searchParams: { q?: string; class?: string };
}) {
  const { locale, dict } = getServerDictionary();
  const q = searchParams.q?.trim();
  const classFilter = searchParams.class?.trim();

  type CourseWithRelations = Prisma.CourseGetPayload<{
    include: { primaryTeacher: { include: { user: true } }; batches: true };
  }>;

  const courses: CourseWithRelations[] = await prisma.course.findMany({
    where: {
      published: true,
      ...(classFilter ? { classGrade: classFilter } : {}),
      ...(q
        ? {
            OR: [
              { nameEn: { contains: q, mode: "insensitive" } },
              { nameBn: { contains: q, mode: "insensitive" } }
            ]
          }
        : {})
    },
    orderBy: { createdAt: "desc" },
    include: { primaryTeacher: { include: { user: true } }, batches: true }
  });

  type ClassGradeRow = Prisma.CourseGetPayload<{ select: { classGrade: true } }>;

  const classGrades: ClassGradeRow[] = await prisma.course.findMany({
    where: { published: true },
    distinct: ["classGrade"],
    select: { classGrade: true }
  });

  return (
    <div className="container-page py-14">
      <h1 className="text-3xl font-bold text-slate-900">{dict.nav.courses}</h1>

      <form className="mt-6 flex flex-wrap gap-3" method="GET">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder={dict.common.search}
          className="min-w-[220px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <select name="class" defaultValue={classFilter ?? ""} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">All Classes</option>
          {classGrades
            .filter((c: ClassGradeRow) => c.classGrade)
            .map((c: ClassGradeRow) => (
              <option key={c.classGrade} value={c.classGrade!}>
                {c.classGrade}
              </option>
            ))}
        </select>
        <button type="submit" className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white">
          {dict.common.search}
        </button>
      </form>

      <div className="mt-8">
        {courses.length === 0 ? (
          <EmptyState title={dict.common.noData} />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course: CourseWithRelations) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <Card className="h-full transition-shadow hover:shadow-lg">
                  <div className="mb-3 flex items-center justify-between">
                    <Badge tone="blue">{course.classGrade ?? "All Classes"}</Badge>
                    <span className="text-sm font-semibold text-brand-700">
                      {formatCurrency(course.monthlyFee.toString())}/mo
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900">
                    {locale === "bn" ? course.nameBn : course.nameEn}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                    {locale === "bn" ? course.descriptionBn : course.descriptionEn}
                  </p>
                  <p className="mt-3 text-xs text-slate-400">
                    {course.batches.length} batch(es) available
                    {course.primaryTeacher ? ` · ${course.primaryTeacher.user.name}` : ""}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
