"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface Course { id: string; nameEn: string; }
interface Subject { id: string; nameEn: string; }
interface Batch { id: string; name: string; courseId: string; }

export function MaterialUploadForm({ courses, subjects, batches }: { courses: Course[]; subjects: Subject[]; batches: Batch[] }) {
  const router = useRouter();
  const [type, setType] = useState("PDF");
  const [courseId, setCourseId] = useState("");
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const filteredBatches = batches.filter((b) => b.courseId === courseId);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "materials");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);
    if (res.ok) setFileUrl(data.url);
    else setError(data.error ?? "Upload failed.");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      titleEn: form.get("titleEn"),
      titleBn: form.get("titleBn"),
      type,
      fileUrl: type === "VIDEO_LINK" ? null : fileUrl,
      externalUrl: type === "VIDEO_LINK" ? form.get("externalUrl") : null,
      courseId: courseId || null,
      subjectId: form.get("subjectId") || null,
      batchId: form.get("batchId") || null,
      published: true
    };

    const res = await fetch("/api/materials", {
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
    setFileUrl(null);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-3 lg:grid-cols-4">
      {error && (
        <div className="sm:col-span-3 lg:col-span-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}
      <Input name="titleEn" label="Title (English)" required />
      <Input name="titleBn" label="Title (বাংলা)" required />
      <Select label="Type" value={type} onChange={(e) => setType(e.target.value)}>
        <option value="PDF">PDF</option>
        <option value="DOCUMENT">Document</option>
        <option value="IMAGE">Image</option>
        <option value="VIDEO_LINK">Video Link</option>
        <option value="NOTE">Note</option>
      </Select>
      <Select label="Course" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
        <option value="">General (no course)</option>
        {courses.map((c) => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
      </Select>
      <Select name="subjectId" label="Subject">
        <option value="">—</option>
        {subjects.map((s) => <option key={s.id} value={s.id}>{s.nameEn}</option>)}
      </Select>
      <Select name="batchId" label="Restrict to Batch (optional)">
        <option value="">All students (public)</option>
        {filteredBatches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
      </Select>

      {type === "VIDEO_LINK" ? (
        <Input name="externalUrl" label="Video URL" type="url" required />
      ) : (
        <div>
          <label className="text-sm font-medium text-slate-700">File</label>
          <input type="file" onChange={handleUpload} className="mt-1.5 block text-sm" />
          {uploading && <p className="mt-1 text-xs text-slate-400">Uploading...</p>}
          {fileUrl && <p className="mt-1 text-xs text-emerald-600">Uploaded ✓</p>}
        </div>
      )}

      <div className="flex items-end">
        <Button type="submit" loading={submitting} className="w-full">Add Material</Button>
      </div>
    </form>
  );
}
