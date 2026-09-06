import { getCurrentTeacherProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/prisma";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { StatusToggle } from "@/components/ui/StatusToggle";
import { EmptyState } from "@/components/ui/EmptyState";
import { MaterialUploadForm } from "@/components/dashboard/MaterialUploadForm";

export default async function TeacherMaterialsPage() {
  const teacher = await getCurrentTeacherProfile();
  const [batches, subjects] = await Promise.all([
    prisma.batch.findMany({ where: { teacherId: teacher.id }, include: { course: true } }),
    prisma.subject.findMany({ orderBy: { nameEn: "asc" } })
  ]);
  const courseMap = new Map(batches.map((b) => [b.courseId, b.course]));
  const courses = Array.from(courseMap.values());

  const materials = await prisma.studyMaterial.findMany({
    where: { uploadedById: teacher.userId },
    include: { course: true, subject: true, batch: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Study Materials</h1>
        <p className="mt-1 text-sm text-slate-500">Upload notes and resources for your batches.</p>
      </div>

      {courses.length === 0 ? (
        <p className="text-sm text-slate-400">You have no batches assigned yet.</p>
      ) : (
        <MaterialUploadForm courses={courses} subjects={subjects} batches={batches} />
      )}

      {materials.length === 0 ? (
        <EmptyState title="You haven't uploaded any materials yet" />
      ) : (
        <Table>
          <Thead>
            <tr><Th>Title</Th><Th>Type</Th><Th>Course</Th><Th>Batch</Th><Th>Published</Th><Th>Actions</Th></tr>
          </Thead>
          <tbody>
            {materials.map((m) => (
              <Tr key={m.id}>
                <Td className="font-medium text-slate-900">{m.titleEn}</Td>
                <Td><Badge tone="blue">{m.type.replace("_", " ")}</Badge></Td>
                <Td>{m.course?.nameEn ?? "General"}</Td>
                <Td>{m.batch?.name ?? "All"}</Td>
                <Td>
                  <StatusToggle endpoint={`/api/materials/${m.id}`} field="published" value={m.published} trueLabel="Published" falseLabel="Hidden" />
                </Td>
                <Td><DeleteButton endpoint={`/api/materials/${m.id}`} confirmText="Delete this material?" /></Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
