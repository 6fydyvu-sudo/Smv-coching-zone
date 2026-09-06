"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { StatusToggle } from "@/components/ui/StatusToggle";
import { EmptyState } from "@/components/ui/EmptyState";

const DAYS = ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

interface Course { id: string; nameEn: string; }
interface Subject { id: string; nameEn: string; }
interface Teacher { id: string; user: { name: string }; }
interface Batch { id: string; name: string; courseId: string; }
interface Routine {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string | null;
  published: boolean;
  course: { nameEn: string };
  subject: { nameEn: string } | null;
  teacher: { user: { name: string } } | null;
  batch: { name: string };
}

export function RoutineManager({
  routines,
  courses,
  subjects,
  teachers,
  batches
}: {
  routines: Routine[];
  courses: Course[];
  subjects: Subject[];
  teachers: Teacher[];
  batches: Batch[];
}) {
  const router = useRouter();
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filteredBatches = batches.filter((b) => b.courseId === courseId);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      day: form.get("day"),
      startTime: form.get("startTime"),
      endTime: form.get("endTime"),
      courseId,
      subjectId: form.get("subjectId") || null,
      teacherId: form.get("teacherId") || null,
      batchId: form.get("batchId"),
      room: form.get("room") || null,
      published: false
    };

    const res = await fetch("/api/routines", {
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
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-3 lg:grid-cols-4">
        {error && (
          <div className="sm:col-span-3 lg:col-span-4">
            <Alert tone="error">{error}</Alert>
          </div>
        )}
        <Select label="Day" name="day" defaultValue="SATURDAY" required>
          {DAYS.map((d) => (
            <option key={d} value={d}>{d.charAt(0) + d.slice(1).toLowerCase()}</option>
          ))}
        </Select>
        <Input name="startTime" label="Start Time" placeholder="16:00" required />
        <Input name="endTime" label="End Time" placeholder="17:30" required />
        <Select label="Course" value={courseId} onChange={(e) => setCourseId(e.target.value)} required>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
        </Select>
        <Select name="batchId" label="Batch" required>
          {filteredBatches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </Select>
        <Select name="subjectId" label="Subject">
          <option value="">—</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.nameEn}</option>)}
        </Select>
        <Select name="teacherId" label="Teacher">
          <option value="">—</option>
          {teachers.map((t) => <option key={t.id} value={t.id}>{t.user.name}</option>)}
        </Select>
        <Input name="room" label="Room" />
        <div className="flex items-end">
          <Button type="submit" loading={submitting} className="w-full">Add to Routine</Button>
        </div>
      </form>

      {routines.length === 0 ? (
        <EmptyState title="No routine entries yet" />
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Day</Th><Th>Time</Th><Th>Course</Th><Th>Batch</Th><Th>Subject</Th><Th>Teacher</Th><Th>Room</Th><Th>Published</Th><Th>Actions</Th>
            </tr>
          </Thead>
          <tbody>
            {routines.map((r) => (
              <Tr key={r.id}>
                <Td className="capitalize">{r.day.toLowerCase()}</Td>
                <Td>{r.startTime}–{r.endTime}</Td>
                <Td>{r.course.nameEn}</Td>
                <Td>{r.batch.name}</Td>
                <Td>{r.subject?.nameEn ?? "—"}</Td>
                <Td>{r.teacher?.user.name ?? "—"}</Td>
                <Td>{r.room ?? "—"}</Td>
                <Td>
                  <StatusToggle endpoint={`/api/routines/${r.id}`} field="published" value={r.published} trueLabel="Published" falseLabel="Draft" />
                </Td>
                <Td><DeleteButton endpoint={`/api/routines/${r.id}`} confirmText="Delete this routine entry?" /></Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
