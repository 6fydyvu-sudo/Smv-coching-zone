"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface Course { id: string; nameEn: string; }
interface Batch { id: string; name: string; courseId: string; }
interface Subject { id: string; nameEn: string; }

export function ExamCreateForm({ courses, subjects }: { courses: Course[]; subjects: Subject[] }) {
  const router = useRouter();
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    fetch(`/api/batches?courseId=${courseId}`).then((r) => r.json()).then(setBatches);
  }, [courseId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      titleEn: form.get("titleEn"),
      titleBn: form.get("titleBn"),
      courseId,
      batchId: form.get("batchId"),
      subjectId: form.get("subjectId"),
      examDate: form.get("examDate"),
      fullMarks: Number(form.get("fullMarks")),
      passMarks: Number(form.get("passMarks")),
      published: false
    };

    const res = await fetch("/api/exams", {
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
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-3 lg:grid-cols-4">
      {error && (
        <div className="sm:col-span-3 lg:col-span-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
      <Input name="titleEn" label="Exam Title (English)" required />
      <Input name="titleBn" label="Exam Title (বাংলা)" required />
      <Select label="Course" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
        {courses.map((c) => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
      </Select>
      <Select name="batchId" label="Batch" required>
        {batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
      </Select>
      <Select name="subjectId" label="Subject" required>
        {subjects.map((s) => <option key={s.id} value={s.id}>{s.nameEn}</option>)}
      </Select>
      <Input name="examDate" type="date" label="Exam Date" required />
      <Input name="fullMarks" type="number" min={1} label="Full Marks" required />
      <Input name="passMarks" type="number" min={0} label="Pass Marks" required />
      <div className="flex items-end">
        <Button type="submit" loading={submitting} className="w-full">Create Exam</Button>
      </div>
    </form>
  );
}
