import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusToggle } from "@/components/ui/StatusToggle";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { formatCurrency } from "@/lib/utils";

export default async function AdminCoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: { primaryTeacher: { include: { user: true } }, _count: { select: { students: true, batches: true } } }
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Courses</h1>
          <p className="mt-1 text-sm text-slate-500">Manage all courses offered by the institute.</p>
        </div>
        <Link href="/admin/courses/new">
          <Button>Add Course</Button>
        </Link>
      </div>

      <div className="mt-6">
        {courses.length === 0 ? (
          <EmptyState title="No courses yet" description="Add your first course to get started." />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Name</Th>
                <Th>Class</Th>
                <Th>Monthly Fee</Th>
                <Th>Batches</Th>
                <Th>Students</Th>
                <Th>Published</Th>
                <Th>Featured</Th>
                <Th>Actions</Th>
              </tr>
            </Thead>
            <tbody>
              {courses.map((c) => (
                <Tr key={c.id}>
                  <Td className="font-medium text-slate-900">{c.nameEn}</Td>
                  <Td>{c.classGrade ?? "—"}</Td>
                  <Td>{formatCurrency(c.monthlyFee.toString())}</Td>
                  <Td>{c._count.batches}</Td>
                  <Td>{c._count.students}</Td>
                  <Td>
                    <StatusToggle endpoint={`/api/courses/${c.id}`} field="published" value={c.published} trueLabel="Published" falseLabel="Draft" />
                  </Td>
                  <Td>
                    <StatusToggle endpoint={`/api/courses/${c.id}`} field="featured" value={c.featured} trueLabel="Featured" falseLabel="Not Featured" />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/courses/${c.id}`} className="text-sm font-medium text-brand-600 hover:underline">
                        Edit
                      </Link>
                      <DeleteButton endpoint={`/api/courses/${c.id}`} confirmText="Delete this course?" />
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
