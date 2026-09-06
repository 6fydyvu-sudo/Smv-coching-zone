import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

const TONE: Record<string, "amber" | "green" | "red"> = {
  PENDING: "amber",
  APPROVED: "green",
  REJECTED: "red"
};

export default async function AdminAdmissionsPage({
  searchParams
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status;
  const admissions = await prisma.admission.findMany({
    where: status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : undefined,
    orderBy: { createdAt: "desc" },
    include: { course: true }
  });

  const filters = [
    { label: "All", href: "/admin/admissions" },
    { label: "Pending", href: "/admin/admissions?status=PENDING" },
    { label: "Approved", href: "/admin/admissions?status=APPROVED" },
    { label: "Rejected", href: "/admin/admissions?status=REJECTED" }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Admissions</h1>
      <p className="mt-1 text-sm text-slate-500">Review and process admission applications.</p>

      <div className="mt-4 flex gap-2">
        {filters.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              (status ?? "") === (f.href.split("status=")[1] ?? "")
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : "border-slate-300 text-slate-600"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="mt-6">
        {admissions.length === 0 ? (
          <EmptyState title="No applications found" />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Applicant</Th>
                <Th>Phone</Th>
                <Th>Course</Th>
                <Th>Applied</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </tr>
            </Thead>
            <tbody>
              {admissions.map((a) => (
                <Tr key={a.id}>
                  <Td className="font-medium text-slate-900">{a.applicantNameEn}</Td>
                  <Td>{a.phone}</Td>
                  <Td>{a.course?.nameEn ?? "—"}</Td>
                  <Td>{formatDate(a.createdAt)}</Td>
                  <Td>
                    <Badge tone={TONE[a.status]}>{a.status}</Badge>
                  </Td>
                  <Td>
                    <Link href={`/admin/admissions/${a.id}`} className="text-sm font-medium text-brand-600 hover:underline">
                      Review
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
