import { notFound } from "next/navigation";
import { getCurrentStudentProfile } from "@/lib/current-profile";
import { prisma } from "@/lib/prisma";
import { getSiteContent } from "@/lib/settings";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PrintButton } from "@/components/dashboard/PrintButton";

export default async function ReceiptPage({ params }: { params: { paymentId: string } }) {
  const student = await getCurrentStudentProfile();
  const payment = await prisma.payment.findUnique({
    where: { id: params.paymentId },
    include: { invoice: { include: { student: { include: { user: true } } } } }
  });

  // A student may only ever view a receipt for their own payment.
  if (!payment || payment.invoice.studentId !== student.id) notFound();

  const content = await getSiteContent();

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-4 flex justify-end print:hidden">
        <PrintButton />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">{content.siteName}</p>
          <p className="text-sm text-slate-500">Payment Receipt</p>
        </div>
        <hr className="my-6 border-slate-200" />
        <dl className="space-y-3 text-sm">
          <Row label="Receipt No." value={payment.id.slice(-10).toUpperCase()} />
          <Row label="Student Name" value={payment.invoice.student.user.name} />
          <Row label="Student ID" value={payment.invoice.student.studentCode} />
          <Row label="Fee Type" value={payment.invoice.feeType} />
          <Row label="Period" value={payment.invoice.periodLabel ?? "—"} />
          <Row label="Amount Paid" value={formatCurrency(payment.amount.toString())} />
          <Row label="Payment Method" value={payment.method} />
          <Row label="Reference No." value={payment.referenceNo ?? "—"} />
          <Row label="Payment Date" value={formatDate(payment.paidAt)} />
        </dl>
        <hr className="my-6 border-slate-200" />
        <p className="text-center text-xs text-slate-400">
          This is a system-generated receipt from {content.siteName}.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-900">{value}</dd>
    </div>
  );
}
