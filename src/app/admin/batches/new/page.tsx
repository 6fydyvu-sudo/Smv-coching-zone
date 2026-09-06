import { prisma } from "@/lib/prisma";
import { BatchForm } from "@/components/dashboard/BatchForm";

export default async function NewBatchPage() {
  const [courses, teachers] = await Promise.all([
    prisma.course.findMany({ orderBy: { nameEn: "asc" } }),
    prisma.teacherProfile.findMany({ where: { isActive: true }, include: { user: true } })
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Add Batch</h1>
      <div className="mt-6">
        <BatchForm courses={courses} teachers={teachers} />
      </div>
    </div>
  );
}
