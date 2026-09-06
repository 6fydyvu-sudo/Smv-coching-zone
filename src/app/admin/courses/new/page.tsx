import { prisma } from "@/lib/prisma";
import { CourseForm } from "@/components/dashboard/CourseForm";

export default async function NewCoursePage() {
  const [teachers, subjects] = await Promise.all([
    prisma.teacherProfile.findMany({ where: { isActive: true }, include: { user: true } }),
    prisma.subject.findMany({ orderBy: { nameEn: "asc" } })
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Add Course</h1>
      <div className="mt-6">
        <CourseForm teachers={teachers} subjects={subjects} />
      </div>
    </div>
  );
}
