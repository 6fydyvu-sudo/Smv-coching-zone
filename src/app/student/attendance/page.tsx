import { getCurrentStudentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

const TONE: Record<string, "green" | "amber" | "red"> = { PRESENT: "green", LATE: "amber", ABSENT: "red" };

export default async function StudentAttendancePage() {
  const student = await getCurrentStudentProfile();
  const records = await prisma.attendanceRecord.findMany({
    where: { studentId: student.id },
    include: { session: { include: { subject: true } } },
    orderBy: { session: { date: "desc" } }
  });

  const total = records.length;
  const present = records.filter((r) => r.status === "PRESENT").length;
  const percent = total > 0 ? Math.round((present / total) * 100) : null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">My Attendance</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card><p className="text-sm text-slate-500">Total Classes</p><p className="text-2xl font-bold text-slate-900">{total}</p></Card>
        <Card><p className="text-sm text-slate-500">Present</p><p className="text-2xl font-bold text-emerald-600">{present}</p></Card>
        <Card><p className="text-sm text-slate-500">Attendance %</p><p className="text-2xl font-bold text-slate-900">{percent != null ? `${percent}%` : "—"}</p></Card>
      </div>

      <div className="mt-6">
        {records.length === 0 ? (
          <EmptyState title="No attendance records yet" />
        ) : (
          <Table>
            <Thead><tr><Th>Date</Th><Th>Subject</Th><Th>Status</Th></tr></Thead>
            <tbody>
              {records.map((r) => (
                <Tr key={r.id}>
                  <Td>{formatDate(r.session.date)}</Td>
                  <Td>{r.session.subject?.nameEn ?? "—"}</Td>
                  <Td><Badge tone={TONE[r.status]}>{r.status}</Badge></Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
