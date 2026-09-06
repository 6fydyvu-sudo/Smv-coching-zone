import { getCurrentStudentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function StudentMaterialsPage() {
  const student = await getCurrentStudentProfile();

  // Visible to a student: materials with no batch restriction (general),
  // or explicitly restricted to their own batch.
  const materials = await prisma.studyMaterial.findMany({
    where: {
      published: true,
      OR: [{ batchId: null }, { batchId: student.batchId ?? undefined }]
    },
    include: { course: true, subject: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Study Materials</h1>
      <div className="mt-6">
        {materials.length === 0 ? (
          <EmptyState title="No study materials available yet" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {materials.map((m) => (
              <a
                key={m.id}
                href={m.fileUrl ?? m.externalUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-md"
              >
                <Badge tone="blue">{m.type.replace("_", " ")}</Badge>
                <p className="mt-2 font-semibold text-slate-900">{m.titleEn}</p>
                <p className="text-xs text-slate-400">
                  {m.course?.nameEn} {m.subject ? `· ${m.subject.nameEn}` : ""}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
