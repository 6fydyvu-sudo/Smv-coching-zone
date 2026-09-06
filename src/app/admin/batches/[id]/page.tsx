import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BatchForm } from "@/components/dashboard/BatchForm";

export default async function EditBatchPage({ params }: { params: { id: string } }) {
  const [batch, courses, teachers] = await Promise.all([
    prisma.batch.findUnique({ where: { id: params.id } }),
    prisma.course.findMany({ orderBy: { nameEn: "asc" } }),
    prisma.teacherProfile.findMany({ where: { isActive: true }, include: { user: true } })
  ]);

  if (!batch) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Edit Batch</h1>
      <div className="mt-6">
        <BatchForm batch={batch} courses={courses} teachers={teachers} />
      </div>
    </div>
  );
}
