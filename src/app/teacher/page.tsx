import { getCurrentTeacherProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";

export default async function TeacherDashboardPage() {
  const teacher = await getCurrentTeacherProfile();

  const [batches, studentCount, upcomingExams, notices] = await Promise.all([
    prisma.batch.findMany({ where: { teacherId: teacher.id }, include: { course: true } }),
    prisma.studentProfile.count({ where: { batch: { teacherId: teacher.id } } }),
    prisma.exam.count({ where: { batch: { teacherId: teacher.id }, examDate: { gte: new Date() } } }),
    prisma.notice.count({ where: { published: true } })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {teacher.user.name}</h1>
        <p className="text-sm text-slate-500">{teacher.subjectSpecialization}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><p className="text-sm text-slate-500">My Batches</p><p className="text-2xl font-bold text-slate-900">{batches.length}</p></Card>
        <Card><p className="text-sm text-slate-500">My Students</p><p className="text-2xl font-bold text-slate-900">{studentCount}</p></Card>
        <Card><p className="text-sm text-slate-500">Upcoming Exams</p><p className="text-2xl font-bold text-slate-900">{upcomingExams}</p></Card>
        <Card><p className="text-sm text-slate-500">Active Notices</p><p className="text-2xl font-bold text-slate-900">{notices}</p></Card>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">My Batches</h2>
        {batches.length === 0 ? (
          <p className="text-sm text-slate-400">No batches assigned to you yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {batches.map((b) => (
              <li key={b.id} className="flex justify-between py-2 text-sm">
                <span className="font-medium text-slate-800">{b.name}</span>
                <span className="text-slate-500">{b.course.nameEn}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
