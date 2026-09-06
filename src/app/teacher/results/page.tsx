import Link from "next/link";
import { getCurrentTeacherProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/prisma";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { StatusToggle } from "@/components/ui/StatusToggle";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExamCreateForm } from "@/components/dashboard/ExamCreateForm";
import { formatDate } from "@/lib/utils";

export default async function TeacherResultsPage() {
  const teacher = await getCurrentTeacherProfile();
  const [batches, subjects] = await Promise.all([
    prisma.batch.findMany({ where: { teacherId: teacher.id }, include: { course: true } }),
    prisma.subject.findMany({ orderBy: { nameEn: "asc" } })
  ]);
  const courseMap = new Map(batches.map((b) => [b.courseId, b.course]));
  const courses = Array.from(courseMap.values());

  const exams = await prisma.exam.findMany({
    where: { batchId: { in: batches.map((b) => b.id) } },
    include: { course: true, batch: true, subject: true, _count: { select: { resultEntries: true } } },
    orderBy: { examDate: "desc" }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Exams & Results</h1>
        <p className="mt-1 text-sm text-slate-500">Create exams and enter marks for your batches.</p>
      </div>

      {courses.length === 0 ? (
        <p className="text-sm text-slate-400">You have no batches assigned yet.</p>
      ) : (
        <ExamCreateForm courses={courses} subjects={subjects} />
      )}

      {exams.length === 0 ? (
        <EmptyState title="No exams created yet" />
      ) : (
        <Table>
          <Thead>
            <tr><Th>Exam</Th><Th>Batch</Th><Th>Subject</Th><Th>Date</Th><Th>Entries</Th><Th>Published</Th><Th>Actions</Th></tr>
          </Thead>
          <tbody>
            {exams.map((e) => (
              <Tr key={e.id}>
                <Td className="font-medium text-slate-900">{e.titleEn}</Td>
                <Td>{e.batch.name}</Td>
                <Td>{e.subject.nameEn}</Td>
                <Td>{formatDate(e.examDate)}</Td>
                <Td>{e._count.resultEntries}</Td>
                <Td>
                  <StatusToggle endpoint={`/api/exams/${e.id}`} field="published" value={e.published} trueLabel="Published" falseLabel="Draft" />
                </Td>
                <Td>
                  <Link href={`/teacher/results/${e.id}`} className="text-sm font-medium text-brand-600 hover:underline">
                    Enter Marks
                  </Link>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
