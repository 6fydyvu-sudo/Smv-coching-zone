import { getCurrentStudentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/prisma";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function StudentResultsPage() {
  const student = await getCurrentStudentProfile();
  const entries = await prisma.resultEntry.findMany({
    where: { studentId: student.id, exam: { published: true } },
    include: { exam: { include: { subject: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">My Results</h1>
      <div className="mt-6">
        {entries.length === 0 ? (
          <EmptyState title="No results published yet" />
        ) : (
          <Table>
            <Thead>
              <tr><Th>Exam</Th><Th>Subject</Th><Th>Marks</Th><Th>Grade</Th><Th>GPA</Th></tr>
            </Thead>
            <tbody>
              {entries.map((e) => (
                <Tr key={e.id}>
                  <Td className="font-medium text-slate-900">{e.exam.titleEn}</Td>
                  <Td>{e.exam.subject.nameEn}</Td>
                  <Td>
                    {e.isAbsent ? (
                      <Badge tone="red">Absent</Badge>
                    ) : (
                      `${e.marksObtained} / ${e.exam.fullMarks}`
                    )}
                  </Td>
                  <Td>{e.grade ?? "—"}</Td>
                  <Td>{e.gpa?.toString() ?? "—"}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
