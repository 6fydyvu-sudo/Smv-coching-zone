"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Checkbox } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface StudentRow {
  studentId: string;
  name: string;
  studentCode: string;
  existingMarks: number | null;
  existingAbsent: boolean;
}

export function MarksEntryForm({
  examId,
  fullMarks,
  students
}: {
  examId: string;
  fullMarks: number;
  students: StudentRow[];
}) {
  const router = useRouter();
  const [marks, setMarks] = useState<Record<string, string>>(
    Object.fromEntries(students.map((s) => [s.studentId, s.existingMarks?.toString() ?? ""]))
  );
  const [absent, setAbsent] = useState<Record<string, boolean>>(
    Object.fromEntries(students.map((s) => [s.studentId, s.existingAbsent]))
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const entries = students.map((s) => ({
      studentId: s.studentId,
      isAbsent: absent[s.studentId] ?? false,
      marksObtained: absent[s.studentId] ? null : marks[s.studentId] ? Number(marks[s.studentId]) : null
    }));

    const res = await fetch(`/api/exams/${examId}/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries })
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save marks.");
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">Marks saved and grades calculated.</Alert>}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <ul className="divide-y divide-slate-100">
          {students.map((s) => (
            <li key={s.studentId} className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-medium text-slate-900">{s.name}</p>
                <p className="font-mono text-xs text-slate-400">{s.studentCode}</p>
              </div>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min={0}
                  max={fullMarks}
                  placeholder={`/ ${fullMarks}`}
                  className="w-28"
                  disabled={absent[s.studentId]}
                  value={marks[s.studentId] ?? ""}
                  onChange={(e) => setMarks((prev) => ({ ...prev, [s.studentId]: e.target.value }))}
                />
                <Checkbox
                  label="Absent"
                  checked={absent[s.studentId] ?? false}
                  onChange={(e) => setAbsent((prev) => ({ ...prev, [s.studentId]: e.target.checked }))}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Button type="submit" loading={submitting}>
        Save Marks
      </Button>
    </form>
  );
}
