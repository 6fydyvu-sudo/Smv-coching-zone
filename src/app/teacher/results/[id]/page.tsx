import { notFound } from "next/navigation";
import { getCurrentTeacherProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/prisma";
import { MarksEntryForm } from "@/components/dashboard/MarksEntryForm";

export default async function TeacherExamMarksPage({ params }: { params: { id: string } }) {
  const teacher = await getCurrentTeacherProfile();
  const exam = await prisma.exam.findUnique({
    where: { id: params.id },
    include: {
      batch: { include: { students: { include: { user: true } } } },
      subject: true,
      resultEntries: true
    }
  });

  // Ownership check: a teacher may only enter marks for an exam tied to
  // one of their own batches.
  if (!exam || exam.batch.teacherId !== teacher.id) notFound();

  const resultMap = new Map(exam.resultEntries.map((r) => [r.studentId, r]));
  const students = exam.batch.students.map((s) => ({
    studentId: s.id,
    name: s.user.name,
    studentCode: s.studentCode,
    existingMarks: resultMap.get(s.id)?.marksObtained ? Number(resultMap.get(s.id)!.marksObtained) : null,
    existingAbsent: resultMap.get(s.id)?.isAbsent ?? false
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">{exam.titleEn}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {exam.subject.nameEn} · Full Marks: {exam.fullMarks.toString()} · Pass Marks: {exam.passMarks.toString()}
      </p>
      <div className="mt-6">
        <MarksEntryForm examId={exam.id} fullMarks={Number(exam.fullMarks)} students={students} />
      </div>
    </div>
  );
}
