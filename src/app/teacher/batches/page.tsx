import { getCurrentTeacherProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/prisma";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function TeacherBatchesPage() {
  const teacher = await getCurrentTeacherProfile();
  const batches = await prisma.batch.findMany({
    where: { teacherId: teacher.id },
    include: { course: true, _count: { select: { students: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">My Batches</h1>
      <div className="mt-6">
        {batches.length === 0 ? (
          <EmptyState title="No batches assigned yet" />
        ) : (
          <Table>
            <Thead>
              <tr><Th>Name</Th><Th>Course</Th><Th>Schedule</Th><Th>Students</Th><Th>Status</Th></tr>
            </Thead>
            <tbody>
              {batches.map((b) => (
                <Tr key={b.id}>
                  <Td className="font-medium text-slate-900">{b.name}</Td>
                  <Td>{b.course.nameEn}</Td>
                  <Td>{b.daysText} {b.startTime && `· ${b.startTime}-${b.endTime}`}</Td>
                  <Td>{b._count.students}</Td>
                  <Td><Badge tone={b.status === "ACTIVE" ? "green" : "slate"}>{b.status}</Badge></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
