import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { DeleteButton } from "@/components/ui/DeleteButton";

export default async function AdminBatchesPage() {
  const batches = await prisma.batch.findMany({
    orderBy: { createdAt: "desc" },
    include: { course: true, teacher: { include: { user: true } }, _count: { select: { students: true } } }
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Batches</h1>
          <p className="mt-1 text-sm text-slate-500">Manage class batches for each course.</p>
        </div>
        <Link href="/admin/batches/new">
          <Button>Add Batch</Button>
        </Link>
      </div>

      <div className="mt-6">
        {batches.length === 0 ? (
          <EmptyState title="No batches yet" description="Add your first batch to get started." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Name</Th>
                <Th>Course</Th>
                <Th>Teacher</Th>
                <Th>Schedule</Th>
                <Th>Students</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </Thead>
            <tbody>
              {batches.map((b) => (
                <Tr key={b.id}>
                  <Td className="font-medium text-slate-900">{b.name}</Td>
                  <Td>{b.course.nameEn}</Td>
                  <Td>{b.teacher?.user.name ?? "—"}</Td>
                  <Td>
                    {b.daysText} {b.startTime && `· ${b.startTime}-${b.endTime}`}
                  </Td>
                  <Td>
                    {b._count.students}
                    {b.maxStudents ? ` / ${b.maxStudents}` : ""}
                  </Td>
                  <Td>
                    <Badge tone={b.status === "ACTIVE" ? "green" : b.status === "COMPLETED" ? "blue" : "slate"}>
                      {b.status}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/batches/${b.id}`} className="text-sm font-medium text-brand-600 hover:underline">
                        Edit
                      </Link>
                      <DeleteButton endpoint={`/api/batches/${b.id}`} confirmText="Delete this batch?" />
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </div>
  );
}
