import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdminStudentsPage({
  searchParams
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q?.trim();
  const students = await prisma.studentProfile.findMany({
    where: q
      ? {
          OR: [
            { studentCode: { contains: q, mode: "insensitive" } },
            { user: { name: { contains: q, mode: "insensitive" } } }
          ]
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    include: { user: true, course: true, batch: true }
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="mt-1 text-sm text-slate-500">
            Students are created by approving and converting an admission application.
          </p>
        </div>
        <Link href="/admin/admissions" className="text-sm font-medium text-brand-600 hover:underline">
          Go to Admissions →
        </Link>
      </div>

      <form method="GET" className="mt-4">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by name or Student ID"
          className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </form>

      <div className="mt-6">
        {students.length === 0 ? (
          <EmptyState title="No students found" />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Student ID</Th>
                <Th>Name</Th>
                <Th>Course</Th>
                <Th>Batch</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </Thead>
            <tbody>
              {students.map((s) => (
                <Tr key={s.id}>
                  <Td className="font-mono text-xs">{s.studentCode}</Td>
                  <Td className="font-medium text-slate-900">{s.user.name}</Td>
                  <Td>{s.course?.nameEn ?? "—"}</Td>
                  <Td>{s.batch?.name ?? "—"}</Td>
                  <Td>
                    <Badge tone={s.status === "ACTIVE" ? "green" : s.status === "GRADUATED" ? "blue" : "slate"}>
                      {s.status}
                    </Badge>
                  </Td>
                  <Td>
                    <Link href={`/admin/students/${s.id}`} className="text-sm font-medium text-brand-600 hover:underline">
                      View / Edit
                    </Link>
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
