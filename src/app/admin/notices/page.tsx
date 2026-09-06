import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusToggle } from "@/components/ui/StatusToggle";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

export default async function AdminNoticesPage() {
  const notices = await prisma.notice.findMany({
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }]
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notices</h1>
          <p className="mt-1 text-sm text-slate-500">Publish announcements to the public website.</p>
        </div>
        <Link href="/admin/notices/new">
          <Button>Add Notice</Button>
        </Link>
      </div>

      <div className="mt-6">
        {notices.length === 0 ? (
          <EmptyState title="No notices yet" />
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Title</Th>
                <Th>Category</Th>
                <Th>Priority</Th>
                <Th>Date</Th>
                <Th>Published</Th>
                <Th>Pinned</Th>
                <Th>Actions</Th>
              </tr>
            </Thead>
            <tbody>
              {notices.map((n) => (
                <Tr key={n.id}>
                  <Td className="font-medium text-slate-900">{n.titleEn}</Td>
                  <Td>{n.category ?? "—"}</Td>
                  <Td>
                    <Badge tone={n.priority === "HIGH" ? "red" : n.priority === "MEDIUM" ? "amber" : "slate"}>
                      {n.priority}
                    </Badge>
                  </Td>
                  <Td>{formatDate(n.publishDate)}</Td>
                  <Td>
                    <StatusToggle endpoint={`/api/notices/${n.id}`} field="published" value={n.published} trueLabel="Published" falseLabel="Draft" />
                  </Td>
                  <Td>
                    <StatusToggle endpoint={`/api/notices/${n.id}`} field="pinned" value={n.pinned} trueLabel="Pinned" falseLabel="Unpinned" />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/notices/${n.id}`} className="text-sm font-medium text-brand-600 hover:underline">
                        Edit
                      </Link>
                      <DeleteButton endpoint={`/api/notices/${n.id}`} confirmText="Delete this notice?" />
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
