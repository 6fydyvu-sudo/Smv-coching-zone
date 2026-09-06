import { prisma } from "@/lib/prisma";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { FeeInvoiceCreateForm } from "@/components/dashboard/FeeInvoiceCreateForm";
import { RecordPaymentForm } from "@/components/dashboard/RecordPaymentForm";
import { formatCurrency } from "@/lib/utils";

const TONE: Record<string, "green" | "amber" | "red"> = { PAID: "green", PARTIAL: "amber", DUE: "red" };

export default async function AdminFeesPage() {
  const invoices = await prisma.feeInvoice.findMany({
    orderBy: { createdAt: "desc" },
    include: { student: { include: { user: true } } }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Fees & Payments</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create fee invoices and record payments. Manual entry only — see README for bKash/Nagad
          gateway integration requirements.
        </p>
      </div>

      <FeeInvoiceCreateForm />

      {invoices.length === 0 ? (
        <EmptyState title="No invoices yet" />
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Student</Th><Th>Type</Th><Th>Period</Th><Th>Amount</Th><Th>Paid</Th><Th>Due</Th><Th>Status</Th><Th>Action</Th>
            </tr>
          </Thead>
          <tbody>
            {invoices.map((inv) => (
              <Tr key={inv.id}>
                <Td className="font-medium text-slate-900">{inv.student.user.name}</Td>
                <Td>{inv.feeType}</Td>
                <Td>{inv.periodLabel ?? "—"}</Td>
                <Td>{formatCurrency(inv.amount.toString())}</Td>
                <Td>{formatCurrency(inv.paidAmount.toString())}</Td>
                <Td>{formatCurrency(inv.dueAmount.toString())}</Td>
                <Td><Badge tone={TONE[inv.status]}>{inv.status}</Badge></Td>
                <Td><RecordPaymentForm invoiceId={inv.id} dueAmount={Number(inv.dueAmount)} /></Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
