"use client";

import { useEffect, useState } from "react";
import { Select, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { EmptyState } from "@/components/ui/EmptyState";

interface Course { id: string; nameEn: string; }
interface Batch { id: string; name: string; courseId: string; }
interface Student { id: string; user: { name: string }; studentCode: string; }

type Status = "PRESENT" | "ABSENT" | "LATE";

export function AttendanceMarker({ courses }: { courses: Course[] }) {
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [batchId, setBatchId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState<Student[]>([]);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    fetch(`/api/batches?courseId=${courseId}`)
      .then((r) => r.json())
      .then((data) => {
        setBatches(data);
        setBatchId(data[0]?.id ?? "");
      });
  }, [courseId]);

  useEffect(() => {
    if (!batchId) {
      setStudents([]);
      return;
    }
    setLoading(true);
    fetch(`/api/students?batchId=${batchId}`)
      .then((r) => r.json())
      .then((data: Student[]) => {
        setStudents(data);
        setStatuses(Object.fromEntries(data.map((s) => [s.id, "PRESENT" as Status])));
      })
      .finally(() => setLoading(false));
  }, [batchId]);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        courseId,
        batchId,
        records: students.map((s) => ({ studentId: s.id, status: statuses[s.id] ?? "PRESENT" }))
      })
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save attendance.");
      return;
    }

    setSuccess("Attendance saved for " + date);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-3">
        <Select label="Course" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
        </Select>
        <Select label="Batch" value={batchId} onChange={(e) => setBatchId(e.target.value)}>
          {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </Select>
        <Input type="date" label="Date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      {loading ? (
        <p className="text-sm text-slate-400">Loading students...</p>
      ) : students.length === 0 ? (
        <EmptyState title="No students in this batch" />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <ul className="divide-y divide-slate-100">
            {students.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">{s.user.name}</p>
                  <p className="font-mono text-xs text-slate-400">{s.studentCode}</p>
                </div>
                <div className="flex gap-2">
                  {(["PRESENT", "LATE", "ABSENT"] as Status[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatuses((prev) => ({ ...prev, [s.id]: st }))}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        statuses[s.id] === st
                          ? st === "PRESENT"
                            ? "bg-emerald-600 text-white"
                            : st === "LATE"
                            ? "bg-amber-500 text-white"
                            : "bg-red-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {st.charAt(0) + st.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
          <div className="border-t border-slate-100 p-4">
            <Button onClick={handleSubmit} loading={submitting}>
              Save Attendance
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
