import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { StatusToggle } from "@/components/ui/StatusToggle";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExamCreateForm } from "@/components/dashboard/ExamCreateForm";
import { formatDate } from "@/lib/utils";

export default async function AdminResultsPage() {
  const [exams, courses, subjects] = await Promise.all([
    prisma.exam.findMany({
      include: { course: true, batch: true, subject: true, _count: { select: { resultEntries: true } } },
      orderBy: { examDate: "desc" }
    }),
    prisma.course.findMany({ orderBy: { nameEn: "asc" } }),
    prisma.subject.findMany({ orderBy: { nameEn: "asc" } })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Exams & Results</h1>
        <p className="mt-1 text-sm text-slate-500">Create exams and enter marks for each batch.</p>
      </div>

      <ExamCreateForm courses={courses} subjects={subjects} />

      {exams.length === 0 ? (
        <EmptyState title="No exams created yet" />
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Exam</Th><Th>Course</Th><Th>Batch</Th><Th>Subject</Th><Th>Date</Th><Th>Entries</Th><Th>Published</Th><Th>Actions</Th>
            </tr>
          </Thead>
          <tbody>
            {exams.map((e) => (
              <Tr key={e.id}>
                <Td className="font-medium text-slate-900">{e.titleEn}</Td>
                <Td>{e.course.nameEn}</Td>
                <Td>{e.batch.name}</Td>
                <Td>{e.subject.nameEn}</Td>
                <Td>{formatDate(e.examDate)}</Td>
                <Td>{e._count.resultEntries}</Td>
                <Td>
                  <StatusToggle endpoint={`/api/exams/${e.id}`} field="published" value={e.published} trueLabel="Published" falseLabel="Draft" />
                </Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/results/${e.id}`} className="text-sm font-medium text-brand-600 hover:underline">
                      Enter Marks
                    </Link>
                    <DeleteButton endpoint={`/api/exams/${e.id}`} confirmText="Delete this exam and all its results?" />
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
