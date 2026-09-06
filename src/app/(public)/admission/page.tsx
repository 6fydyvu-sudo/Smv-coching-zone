import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getServerDictionary } from "@/lib/locale";
import { getSiteContent } from "@/lib/settings";
import { AdmissionForm } from "@/components/site/AdmissionForm";
import { Alert } from "@/components/ui/Alert";

export const metadata: Metadata = { title: "Admission" };

export default async function AdmissionPage({
  searchParams
}: {
  searchParams: { courseId?: string };
}) {
  const { dict } = getServerDictionary();
  const content = await getSiteContent();
  const courses = await prisma.course.findMany({
    where: { published: true },
    select: { id: true, nameEn: true, classGrade: true },
    orderBy: { nameEn: "asc" }
  });
  const batches = await prisma.batch.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true, courseId: true }
  });

  return (
    <div className="container-page max-w-3xl py-14">
      <h1 className="text-3xl font-bold text-slate-900">{dict.nav.admission}</h1>
      <p className="mt-2 text-slate-500">Fill in the form below to apply for admission.</p>

      <div className="mt-6">
        {!content.admissionOpen ? (
          <Alert tone="warning">
            Online admission is currently closed. Please contact the institute directly for
            admission inquiries.
          </Alert>
        ) : (
          <AdmissionForm courses={courses} batches={batches} defaultCourseId={searchParams.courseId} />
        )}
      </div>
    </div>
  );
}
