import { prisma } from "@/lib/prisma";
import { RoutineManager } from "@/components/dashboard/RoutineManager";

export default async function AdminRoutinePage() {
  const [routines, courses, subjects, teachers, batches] = await Promise.all([
    prisma.routine.findMany({
      include: { course: true, subject: true, teacher: { include: { user: true } }, batch: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.course.findMany({ orderBy: { nameEn: "asc" } }),
    prisma.subject.findMany({ orderBy: { nameEn: "asc" } }),
    prisma.teacherProfile.findMany({ where: { isActive: true }, include: { user: true } }),
    prisma.batch.findMany()
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Routine</h1>
      <p className="mt-1 text-sm text-slate-500">Build the class routine for each batch.</p>
      <div className="mt-6">
        <RoutineManager routines={routines} courses={courses} subjects={subjects} teachers={teachers} batches={batches} />
      </div>
    </div>
  );
}
