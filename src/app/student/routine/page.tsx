import { getCurrentStudentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/prisma";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

const DAY_ORDER = ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

export default async function StudentRoutinePage() {
  const student = await getCurrentStudentProfile();

  const routines = student.batchId
    ? await prisma.routine.findMany({
        where: { batchId: student.batchId, published: true },
        include: { subject: true, teacher: { include: { user: true } } }
      })
    : [];

  const sorted = [...routines].sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">My Routine</h1>
      <div className="mt-6">
        {!student.batchId ? (
          <EmptyState title="You are not assigned to a batch yet" />
        ) : sorted.length === 0 ? (
          <EmptyState title="No routine published for your batch yet" />
        ) : (
          <Table>
            <Thead>
              <tr><Th>Day</Th><Th>Time</Th><Th>Subject</Th><Th>Teacher</Th></tr>
            </Thead>
            <tbody>
              {sorted.map((r) => (
                <Tr key={r.id}>
                  <Td className="capitalize">{r.day.toLowerCase()}</Td>
                  <Td>{r.startTime}–{r.endTime}</Td>
                  <Td>{r.subject?.nameEn ?? "—"}</Td>
                  <Td>{r.teacher?.user.name ?? "—"}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
