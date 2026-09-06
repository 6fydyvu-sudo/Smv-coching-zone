import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CourseForm } from "@/components/dashboard/CourseForm";

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  const [course, teachers, subjects] = await Promise.all([
    prisma.course.findUnique({ where: { id: params.id }, include: { subjectLinks: true } }),
    prisma.teacherProfile.findMany({ where: { isActive: true }, include: { user: true } }),
    prisma.subject.findMany({ orderBy: { nameEn: "asc" } })
  ]);

  if (!course) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Edit Course</h1>
      <div className="mt-6">
        <CourseForm
          course={{
            id: course.id,
            nameEn: course.nameEn,
            nameBn: course.nameBn,
            descriptionEn: course.descriptionEn,
            descriptionBn: course.descriptionBn,
            classGrade: course.classGrade,
            imageUrl: course.imageUrl,
            primaryTeacherId: course.primaryTeacherId,
            durationText: course.durationText,
            monthlyFee: Number(course.monthlyFee),
            admissionFee: Number(course.admissionFee),
            seatLimit: course.seatLimit,
            startDate: course.startDate?.toISOString() ?? null,
            endDate: course.endDate?.toISOString() ?? null,
            scheduleText: course.scheduleText,
            published: course.published,
            featured: course.featured,
            subjectIds: course.subjectLinks.map((sl) => sl.subjectId)
          }}
          teachers={teachers}
          subjects={subjects}
        />
      </div>
    </div>
  );
}
