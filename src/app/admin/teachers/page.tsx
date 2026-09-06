import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function AdminTeachersPage() {
  const teachers = await prisma.teacherProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, coursesTeaching: true, batchesTeaching: true }
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Teachers</h1>
          <p className="mt-1 text-sm text-slate-500">Manage teacher accounts and assignments.</p>
        </div>
        <Link href="/admin/teachers/new">
          <Button>Add Teacher</Button>
        </Link>
      </div>

      <div className="mt-6">
        {teachers.length === 0 ? (
          <EmptyState title="No teachers yet" description="Add your first teacher to get started." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Specialization</Th>
                <Th>Courses</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </Thead>
            <tbody>
              {teachers.map((t) => (
                <Tr key={t.id}>
                  <Td className="font-medium text-slate-900">{t.user.name}</Td>
                  <Td>{t.user.email}</Td>
                  <Td>{t.subjectSpecialization ?? "—"}</Td>
                  <Td>{t.coursesTeaching.length}</Td>
                  <Td>
                    <Badge tone={t.isActive ? "green" : "slate"}>{t.isActive ? "Active" : "Inactive"}</Badge>
                  </Td>
                  <Td>
                    <Link href={`/admin/teachers/${t.id}`} className="text-sm font-medium text-brand-600 hover:underline">
                      Edit
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
