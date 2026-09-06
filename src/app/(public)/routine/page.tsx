import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerDictionary } from "@/lib/locale";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Routine" };
// Rendered per-request: the routine is edited live from Admin, and
// static generation would need a reachable DATABASE_URL at build time.
export const dynamic = "force-dynamic";

const DAY_ORDER = ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

type RoutineWithRelations = Prisma.RoutineGetPayload<{
  include: { course: true; subject: true; teacher: { include: { user: true } }; batch: true };
}>;

export default async function RoutinePage() {
  const { dict } = getServerDictionary();
  const routines: RoutineWithRelations[] = await prisma.routine.findMany({
    where: { published: true },
    include: { course: true, subject: true, teacher: { include: { user: true } }, batch: true }
  });

  const sorted = [...routines].sort(
    (a: RoutineWithRelations, b: RoutineWithRelations) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
  );

  return (
    <div className="container-page py-14">
      <h1 className="text-3xl font-bold text-slate-900">{dict.nav.routine}</h1>
      <div className="mt-8">
        {sorted.length === 0 ? (
          <EmptyState title={dict.common.noData} description="Published class routines will appear here." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Day</Th>
                <Th>Time</Th>
                <Th>Course</Th>
                <Th>Subject</Th>
                <Th>Batch</Th>
                <Th>Teacher</Th>
                <Th>Room</Th>
              </tr>
            </Thead>
            <tbody>
              {sorted.map((r: RoutineWithRelations) => (
                <Tr key={r.id}>
                  <Td className="capitalize">{r.day.toLowerCase()}</Td>
                  <Td>{r.startTime} – {r.endTime}</Td>
                  <Td>{r.course.nameEn}</Td>
                  <Td>{r.subject?.nameEn ?? "—"}</Td>
                  <Td>{r.batch.name}</Td>
                  <Td>{r.teacher?.user.name ?? "—"}</Td>
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
