import { getCurrentTeacherProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/prisma";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function TeacherStudentsPage() {
  const teacher = await getCurrentTeacherProfile();
  const students = await prisma.studentProfile.findMany({
    where: { batch: { teacherId: teacher.id } },
    include: { user: true, course: true, batch: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">My Students</h1>
      <p className="mt-1 text-sm text-slate-500">Students currently enrolled in your batches.</p>
      <div className="mt-6">
        {students.length === 0 ? (
          <EmptyState title="No students in your batches yet" />
        ) : (
          <Table>
            <Thead>
              <tr><Th>Student ID</Th><Th>Name</Th><Th>Course</Th><Th>Batch</Th></tr>
            </Thead>
            <tbody>
              {students.map((s) => (
                <Tr key={s.id}>
                  <Td className="font-mono text-xs">{s.studentCode}</Td>
                  <Td className="font-medium text-slate-900">{s.user.name}</Td>
                  <Td>{s.course?.nameEn ?? "—"}</Td>
                  <Td>{s.batch?.name ?? "—"}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
