import Link from "next/link";
import { getCurrentStudentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";

// Maps JS Date#getDay() (0 = Sunday ... 6 = Saturday) to our WeekDay enum.
const JS_DAY_TO_WEEKDAY = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY"
] as const;

export default async function StudentDashboardPage() {
  const student = await getCurrentStudentProfile();
  const today = JS_DAY_TO_WEEKDAY[new Date().getDay()];

  const [todayRoutine, attendanceRecords, latestResult, feeInvoices, notices, upcomingExams] = await Promise.all([
    student.batchId
      ? prisma.routine.findMany({
          where: { batchId: student.batchId, published: true, day: today },
          include: { subject: true }
        })
      : Promise.resolve([]),
    prisma.attendanceRecord.findMany({ where: { studentId: student.id } }),
    prisma.resultEntry.findFirst({
      where: { studentId: student.id, exam: { published: true } },
      orderBy: { createdAt: "desc" },
      include: { exam: { include: { subject: true } } }
    }),
    prisma.feeInvoice.findMany({ where: { studentId: student.id } }),
    prisma.notice.findMany({ where: { published: true }, take: 3, orderBy: { publishDate: "desc" } }),
    prisma.exam.findMany({
      where: { batchId: student.batchId ?? undefined, published: true, examDate: { gte: new Date() } },
      take: 3,
      orderBy: { examDate: "asc" },
      include: { subject: true }
    })
  ]);

  const totalClasses = attendanceRecords.length;
  const presentCount = attendanceRecords.filter((r) => r.status === "PRESENT").length;
  const attendancePercent = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : null;
  const totalDue = feeInvoices.reduce((sum, i) => sum + Number(i.dueAmount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {student.user.name}</h1>
        <p className="font-mono text-sm text-slate-500">{student.studentCode}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-slate-500">Course</p>
          <p className="text-lg font-semibold text-slate-900">{student.course?.nameEn ?? "Not assigned"}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Batch</p>
          <p className="text-lg font-semibold text-slate-900">{student.batch?.name ?? "Not assigned"}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Attendance</p>
          <p className="text-lg font-semibold text-slate-900">{attendancePercent != null ? `${attendancePercent}%` : "—"}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Fee Due</p>
          <p className="text-lg font-semibold text-slate-900">{formatCurrency(totalDue)}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Today&apos;s Classes</h2>
          {todayRoutine.length === 0 ? (
            <p className="text-sm text-slate-400">No classes scheduled today.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {todayRoutine.map((r) => (
                <li key={r.id} className="flex justify-between">
                  <span>{r.subject?.nameEn ?? "Class"}</span>
                  <span className="text-slate-400">{r.startTime}–{r.endTime}</span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/student/routine" className="mt-3 inline-block text-sm text-brand-600 hover:underline">
            View full routine →
          </Link>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Latest Result</h2>
          {latestResult ? (
            <div className="text-sm">
              <p className="font-medium text-slate-900">{latestResult.exam.titleEn}</p>
              <p className="text-slate-500">{latestResult.exam.subject.nameEn}</p>
              <p className="mt-1">
                {latestResult.isAbsent ? "Absent" : `${latestResult.marksObtained} / ${latestResult.exam.fullMarks}`}
                {latestResult.grade && <Badge tone="blue">{latestResult.grade}</Badge>}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No results published yet.</p>
          )}
          <Link href="/student/results" className="mt-3 inline-block text-sm text-brand-600 hover:underline">
            View all results →
          </Link>
        </Card>

        <CaClasses       <h2 className="mb-3 text-sm font-semibold text-slate-900">Upcoming Exams</h2>
          {upcomingExams.length === 0 ? (
            <p className="text-sm text-slate-400">No upcoming exams.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {upcomingExams.map((e) => (
                <li key={e.id} className="flex justify-between">
                  <span>{e.titleEn}</span>
                  <span className="text-slate-400">{formatDate(e.examDate)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Latest Notices</h2>
        {notices.length === 0 ? (
          <p className="text-sm text-slate-400">No notices published yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notices.map((n) => (
              <li key={n.id} className="py-2 text-sm">
                <p className="font-medium text-slate-800">{n.titleEn}</p>
                <p className="text-xs text-slate-400">{formatDate(n.publishDate)}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
