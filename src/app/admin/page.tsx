import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const [
    totalStudents,
    activeStudents,
    totalTeachers,
    totalCourses,
    totalBatches,
    pendingAdmissions,
    invoices,
    upcomingExams,
    recentStudents,
    recentPayments,
    recentNotices
  ] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.studentProfile.count({ where: { status: "ACTIVE" } }),
    prisma.teacherProfile.count({ where: { isActive: true } }),
    prisma.course.count(),
    prisma.batch.count(),
    prisma.admission.count({ where: { status: "PENDING" } }),
    prisma.feeInvoice.findMany({ select: { paidAmount: true, dueAmount: true } }),
    prisma.exam.count({ where: { examDate: { gte: new Date() } } }),
    prisma.studentProfile.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { user: true } }),
    prisma.payment.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { invoice: { include: { student: { include: { user: true } } } } }
    }),
    prisma.notice.findMany({ take: 5, orderBy: { createdAt: "desc" } })
  ]);

  const totalCollected = invoices.reduce((sum, i) => sum + Number(i.paidAmount), 0);
  const totalDue = invoices.reduce((sum, i) => sum + Number(i.dueAmount), 0);

  const stats = [
    { label: "Total Students", value: totalStudents, href: "/admin/students" },
    { label: "Active Students", value: activeStudents, href: "/admin/students" },
    { label: "Teachers", value: totalTeachers, href: "/admin/teachers" },
    { label: "Courses", value: totalCourses, href: "/admin/courses" },
    { label: "Batches", value: totalBatches, href: "/admin/batches" },
    { label: "Pending Admissions", value: pendingAdmissions, href: "/admin/admissions?status=PENDING" },
    { label: "Upcoming Exams", value: upcomingExams, href: "/admin/results" },
    { label: "Fees Collected", value: formatCurrency(totalCollected), href: "/admin/fees" },
    { label: "Fees Due", value: formatCurrency(totalDue), href: "/admin/fees" }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-500">An overview of the whole institute.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition-shadow hover:shadow-lg">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Recent Registrations</h2>
          <ul className="space-y-2 text-sm">
            {recentStudents.map((s) => (
              <li key={s.id} className="flex justify-between text-slate-600">
                <span>{s.user.name}</span>
                <span className="text-slate-400">{s.studentCode}</span>
              </li>
            ))}
            {recentStudents.length === 0 && <p className="text-slate-400">No students yet.</p>}
          </ul>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Recent Payments</h2>
          <ul className="space-y-2 text-sm">
            {recentPayments.map((p) => (
              <li key={p.id} className="flex justify-between text-slate-600">
                <span>{p.invoice.student.user.name}</span>
                <span className="font-medium text-emerald-600">{formatCurrency(p.amount.toString())}</span>
              </li>
            ))}
            {recentPayments.length === 0 && <p className="text-slate-400">No payments recorded yet.</p>}
          </ul>
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Recent Notices</h2>
          <ul className="space-y-2 text-sm">
            {recentNotices.map((n) => (
              <li key={n.id} className="flex justify-between text-slate-600">
                <span className="truncate">{n.titleEn}</span>
                <span className="text-slate-400">{formatDate(n.createdAt)}</span>
              </li>
            ))}
            {recentNotices.length === 0 && <p className="text-slate-400">No notices yet.</p>}
          </ul>
        </Card>
      </div>
    </div>
  );
}
