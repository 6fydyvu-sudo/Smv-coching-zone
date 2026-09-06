"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function RecordPaymentForm({ invoiceId, dueAmount }: { invoiceId: string; dueAmount: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      invoiceId,
      amount: Number(form.get("amount")),
      method: form.get("method"),
      referenceNo: form.get("referenceNo") || null
    };

    const res = await fetch("/api/fees/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to record payment.");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  if (dueAmount <= 0) {
    return <span className="text-xs text-emerald-600">Fully paid</span>;
  }

  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Record Payment
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      {error && <div className="w-full"><Alert tone="error">{error}</Alert></div>}
      <Input name="amount" type="number" min={0.01} max={dueAmount} step="0.01" label="Amount" className="w-28" required />
      <Select name="method" label="Method" className="w-32">
        <option value="CASH">Cash</option>
        <option value="BKASH">bKash</option>
        <option value="NAGAD">Nagad</option>
        <option value="BANK">Bank</option>
        <option value="OTHER">Other</option>
      </Select>
      <Input name="referenceNo" label="Reference No" className="w-32" />
      <Button type="submit" size="sm" loading={submitting}>Save</Button>
      <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
    </form>
  );
}
