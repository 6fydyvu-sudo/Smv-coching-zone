import { getCurrentStudentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/prisma";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

export default async function StudentExamsPage() {
  const student = await getCurrentStudentProfile();
  const exams = student.batchId
    ? await prisma.exam.findMany({
        where: { batchId: student.batchId, published: true },
        include: { subject: true },
        orderBy: { examDate: "desc" }
      })
    : [];

  const now = new Date();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Exams</h1>
      <p className="mt-1 text-sm text-slate-500">Exam schedule for your batch.</p>
      <div className="mt-6">
        {exams.length === 0 ? (
          <EmptyState title="No exams scheduled yet" />
        ) : (
          <Table>
            <Thead><tr><Th>Exam</Th><Th>Subject</Th><Th>Date</Th><Th>Full Marks</Th><Th>Status</Th></tr></Thead>
            <tbody>
              {exams.map((e) => (
                <Tr key={e.id}>
                  <Td className="font-medium text-slate-900">{e.titleEn}</Td>
                  <Td>{e.subject.nameEn}</Td>
                  <Td>{formatDate(e.examDate)}</Td>
                  <Td>{e.fullMarks.toString()}</Td>
                  <Td>
                    <Badge tone={e.examDate > now ? "amber" : "green"}>
                      {e.examDate > now ? "Upcoming" : "Completed"}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
