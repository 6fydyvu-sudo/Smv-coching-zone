"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface Course {
  id: string;
  nameEn: string;
}
interface Teacher {
  id: string;
  user: { name: string };
}
interface BatchData {
  id?: string;
  name?: string;
  courseId?: string;
  teacherId?: string | null;
  room?: string | null;
  maxStudents?: number | null;
  startTime?: string | null;
  endTime?: string | null;
  daysText?: string | null;
  status?: string;
}

export function BatchForm({
  batch,
  courses,
  teachers
}: {
  batch?: BatchData;
  courses: Course[];
  teachers: Teacher[];
}) {
  const router = useRouter();
  const isEdit = !!batch?.id;
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      courseId: form.get("courseId"),
      teacherId: form.get("teacherId") || null,
      room: form.get("room") || null,
      maxStudents: form.get("maxStudents") ? Number(form.get("maxStudents")) : null,
      startTime: form.get("startTime") || null,
      endTime: form.get("endTime") || null,
      daysText: form.get("daysText") || null,
      status: form.get("status")
    };

    const res = await fetch(isEdit ? `/api/batches/${batch!.id}` : "/api/batches", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }

    router.push("/admin/batches");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="name" label="Batch Name" defaultValue={batch?.name} required />
        <Select name="courseId" label="Course" defaultValue={batch?.courseId ?? ""} required>
          <option value="" disabled>Select a course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.nameEn}</option>
          ))}
        </Select>
        <Select name="teacherId" label="Teacher" defaultValue={batch?.teacherId ?? ""}>
          <option value="">Not assigned</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>{t.user.name}</option>
          ))}
        </Select>
        <Input name="room" label="Room" defaultValue={batch?.room ?? ""} />
        <Input name="maxStudents" type="number" min={1} label="Max Students" defaultValue={batch?.maxStudents ?? ""} />
        <Select name="status" label="Status" defaultValue={batch?.status ?? "ACTIVE"}>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="COMPLETED">Completed</option>
        </Select>
        <Input name="startTime" label="Start Time" placeholder="e.g. 16:00" defaultValue={batch?.startTime ?? ""} />
        <Input name="endTime" label="End Time" placeholder="e.g. 18:00" defaultValue={batch?.endTime ?? ""} />
        <Input name="daysText" label="Days" placeholder="e.g. Sat, Mon, Wed" defaultValue={batch?.daysText ?? ""} />
      </div>

      <Button type="submit" loading={submitting}>
        {isEdit ? "Save Changes" : "Create Batch"}
      </Button>
    </form>
  );
}
