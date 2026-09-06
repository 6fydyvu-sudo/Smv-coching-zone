import Link from "next/link";
import { getCurrentStudentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";

const TONE: Record<string, "green" | "amber" | "red"> = { PAID: "green", PARTIAL: "amber", DUE: "red" };

export default async function StudentFeesPage() {
  const student = await getCurrentStudentProfile();
  const invoices = await prisma.feeInvoice.findMany({
    where: { studentId: student.id },
    include: { payments: true },
    orderBy: { createdAt: "desc" }
  });

  const totalDue = invoices.reduce((sum, i) => sum + Number(i.dueAmount), 0);
  const totalPaid = invoices.reduce((sum, i) => sum + Number(i.paidAmount), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">My Fees</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card><p className="text-sm text-slate-500">Total Paid</p><p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</p></Card>
        <Card><p className="text-sm text-slate-500">Total Due</p><p className="text-2xl font-bold text-red-600">{formatCurrency(totalDue)}</p></Card>
      </div>

      <div className="mt-6">
        {invoices.length === 0 ? (
          <EmptyState title="No fee invoices yet" />
        ) : (
          <Table>
            <Thead>
              <tr><Th>Type</Th><Th>Period</Th><Th>Amount</Th><Th>Paid</Th><Th>Due</Th><Th>Status</Th><Th>Receipts</Th></tr>
            </Thead>
            <tbody>
              {invoices.map((inv) => (
                <Tr key={inv.id}>
                  <Td>{inv.feeType}</Td>
                  <Td>{inv.periodLabel ?? "—"}</Td>
                  <Td>{formatCurrency(inv.amount.toString())}</Td>
                  <Td>{formatCurrency(inv.paidAmount.toString())}</Td>
                  <Td>{formatCurrency(inv.dueAmount.toString())}</Td>
                  <Td><Badge tone={TONE[inv.status]}>{inv.status}</Badge></Td>
                  <Td>
                    {inv.payments.length === 0 ? (
                      "—"
                    ) : (
                      <div className="flex flex-col gap-1">
                        {inv.payments.map((p) => (
                          <Link key={p.id} href={`/student/fees/receipt/${p.id}`} className="text-xs text-brand-600 hover:underline">
                            Receipt · {formatDate(p.paidAt)}
                          </Link>
                        ))}
                      </div>
                    )}
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
