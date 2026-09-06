import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerDictionary } from "@/lib/locale";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const course = await prisma.course.findUnique({ where: { id: params.id } });
  return { title: course?.nameEn ?? "Course" };
}

type CourseDetail = Prisma.CourseGetPayload<{
  include: {
    primaryTeacher: { include: { user: true } };
    subjectLinks: { include: { subject: true; teacher: { include: { user: true } } } };
    batches: true;
  };
}>;

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const { locale } = getServerDictionary();
  const course: CourseDetail | null = await prisma.course.findUnique({
    where: { id: params.id },
    include: {
      primaryTeacher: { include: { user: true } },
      subjectLinks: { include: { subject: true, teacher: { include: { user: true } } } },
      batches: true
    }
  });

  if (!course || !course.published) {
    notFound();
  }

  return (
    <div className="container-page py-14">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Badge tone="blue">{course.classGrade ?? "All Classes"}</Badge>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            {locale === "bn" ? course.nameBn : course.nameEn}
          </h1>
          <p className="mt-4 whitespace-pre-line text-slate-600">
            {locale === "bn" ? course.descriptionBn : course.descriptionEn}
          </p>

          {course.subjectLinks.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-slate-900">Subjects</h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {course.subjectLinks.map((sl: CourseDetail["subjectLinks"][number]) => (
                  <li key={sl.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    {locale === "bn" ? sl.subject.nameBn : sl.subject.nameEn}
                    {sl.teacher && (
                      <span className="text-slate-400"> · {sl.teacher.user.name}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {course.batches.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-slate-900">Available Batches</h2>
              <ul className="mt-3 space-y-2">
                {course.batches.map((b: CourseDetail["batches"][number]) => (
                  <li key={b.id} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    <span className="font-medium">{b.name}</span> — {b.daysText} ({b.startTime}–{b.endTime})
                    {b.room && <span className="text-slate-400"> · Room {b.room}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Card className="h-fit">
          <p className="text-sm text-slate-500">Monthly Fee</p>
          <p className="text-2xl font-bold text-brand-700">{formatCurrency(course.monthlyFee.toString())}</p>
          <p className="mt-3 text-sm text-slate-500">Admission Fee</p>
          <p className="font-semibold text-slate-900">{formatCurrency(course.admissionFee.toString())}</p>
          {course.durationText && (
            <>
              <p className="mt-3 text-sm text-slate-500">Duration</p>
              <p className="font-semibold text-slate-900">{course.durationText}</p>
            </>
          )}
          {course.startDate && (
            <>
              <p className="mt-3 text-sm text-slate-500">Starts</p>
              <p className="font-semibold text-slate-900">{formatDate(course.startDate, locale)}</p>
            </>
          )}
          {course.primaryTeacher && (
            <>
              <p className="mt-3 text-sm text-slate-500">Lead Teacher</p>
              <p className="font-semibold text-slate-900">{course.primaryTeacher.user.name}</p>
            </>
          )}
          <Link
            href={`/admission?courseId=${course.id}`}
            className="mt-6 block rounded-xl bg-brand-600 px-4 py-3 text-center font-semibold text-white hover:bg-brand-700"
          >
            Apply for Admission
          </Link>
        </Card>
      </div>
    </div>
  );
}
