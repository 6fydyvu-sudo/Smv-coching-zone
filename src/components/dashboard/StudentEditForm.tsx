"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface Course {
  id: string;
  nameEn: string;
}
interface Batch {
  id: string;
  name: string;
  courseId: string;
}

export function StudentEditForm({
  student,
  courses,
  batches
}: {
  student: {
    id: string;
    fatherName: string;
    motherName: string;
    address: string;
    institution: string | null;
    courseId: string | null;
    batchId: string | null;
    status: string;
  };
  courses: Course[];
  batches: Batch[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [courseId, setCourseId] = useState(student.courseId ?? "");

  const filteredBatches = batches.filter((b) => b.courseId === courseId);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const form = new FormData(e.currentTarget);
    const payload = {
      fatherName: form.get("fatherName"),
      motherName: form.get("motherName"),
      address: form.get("address"),
      institution: form.get("institution") || null,
      courseId: courseId || null,
      batchId: form.get("batchId") || null,
      status: form.get("status")
    };

    const res = await fetch(`/api/students/${student.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">Student profile updated.</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="fatherName" label="Father's Name" defaultValue={student.fatherName} required />
        <Input name="motherName" label="Mother's Name" defaultValue={student.motherName} required />
      </div>
      <Textarea name="address" label="Address" defaultValue={student.address} required />
      <Input name="institution" label="School/Madrasa" defaultValue={student.institution ?? ""} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Select label="Course" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          <option value="">None</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.nameEn}</option>
          ))}
        </Select>
        <Select name="batchId" label="Batch" defaultValue={student.batchId ?? ""}>
          <option value="">None</option>
          {filteredBatches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </Select>
        <Select name="status" label="Status" defaultValue={student.status}>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="GRADUATED">Graduated</option>
        </Select>
      </div>

      <Button type="submit" loading={submitting}>
        Save Changes
      </Button>
    </form>
  );
}
