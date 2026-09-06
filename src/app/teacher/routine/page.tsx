import { getCurrentTeacherProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/prisma";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

const DAY_ORDER = ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

export default async function TeacherRoutinePage() {
  const teacher = await getCurrentTeacherProfile();
  const routines = await prisma.routine.findMany({
    where: { teacherId: teacher.id },
    include: { course: true, subject: true, batch: true }
  });
  const sorted = [...routines].sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">My Routine</h1>
      <div className="mt-6">
        {sorted.length === 0 ? (
          <EmptyState title="No routine entries assigned to you yet" />
        ) : (
          <Table>
            <Thead>
              <tr><Th>Day</Th><Th>Time</Th><Th>Course</Th><Th>Subject</Th><Th>Batch</Th><Th>Room</Th></tr>
            </Thead>
            <tbody>
              {sorted.map((r) => (
                <Tr key={r.id}>
                  <Td className="capitalize">{r.day.toLowerCase()}</Td>
                  <Td>{r.startTime}–{r.endTime}</Td>
                  <Td>{r.course.nameEn}</Td>
                  <Td>{r.subject?.nameEn ?? "—"}</Td>
                  <Td>{r.batch.name}</Td>
                  <Td>{r.room ?? "—"}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
