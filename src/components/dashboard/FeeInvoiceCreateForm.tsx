"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface Student { id: string; user: { name: string }; studentCode: string; courseId: string | null; batchId: string | null; }

export function FeeInvoiceCreateForm() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/students").then((r) => r.json()).then(setStudents);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const studentId = form.get("studentId") as string;
    const student = students.find((s) => s.id === studentId);

    const payload = {
      studentId,
      courseId: student?.courseId ?? null,
      batchId: student?.batchId ?? null,
      feeType: form.get("feeType"),
      periodLabel: form.get("periodLabel") || null,
      amount: Number(form.get("amount"))
    };

    const res = await fetch("/api/fees/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }

    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-3 lg:grid-cols-5">
      {error && (
        <div className="sm:col-span-3 lg:col-span-5">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
      <Select name="studentId" label="Student" required defaultValue="">
        <option value="" disabled>Select student</option>
        {students.map((s) => (
          <option key={s.id} value={s.id}>{s.user.name} ({s.studentCode})</option>
        ))}
      </Select>
      <Select name="feeType" label="Fee Type" defaultValue="MONTHLY">
        <option value="ADMISSION">Admission</option>
        <option value="MONTHLY">Monthly</option>
        <option value="OTHER">Other</option>
      </Select>
      <Input name="periodLabel" label="Period" placeholder="e.g. January 2026" />
      <Input name="amount" type="number" min={0} step="0.01" label="Amount (৳)" required />
      <div className="flex items-end">
        <Button type="submit" loading={submitting} className="w-full">Create Invoice</Button>
      </div>
    </form>
  );
}
