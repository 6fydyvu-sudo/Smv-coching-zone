import { prisma } from "@/lib/prisma";
import { SubjectManager } from "@/components/dashboard/SubjectManager";

export default async function AdminSubjectsPage() {
  const subjects = await prisma.subject.findMany({ orderBy: { nameEn: "asc" } });
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Subjects</h1>
      <p className="mt-1 text-sm text-slate-500">Manage the master list of subjects offered.</p>
      <div className="mt-6">
        <SubjectManager subjects={subjects} />
      </div>
    </div>
  );
}
