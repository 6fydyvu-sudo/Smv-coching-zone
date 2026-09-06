"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea, Checkbox } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { StatusToggle } from "@/components/ui/StatusToggle";
import { EmptyState } from "@/components/ui/EmptyState";

interface Achievement {
  id: string;
  studentName: string;
  photoUrl: string | null;
  courseOrClass: string | null;
  examName: string | null;
  resultText: string | null;
  description: string | null;
  published: boolean;
}

export function AchievementManager({ achievements }: { achievements: Achievement[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "achievements");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);
    if (res.ok) setPhotoUrl(data.url);
    else setError(data.error ?? "Upload failed.");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      studentName: form.get("studentName"),
      photoUrl,
      courseOrClass: form.get("courseOrClass") || null,
      examName: form.get("examName") || null,
      resultText: form.get("resultText") || null,
      description: form.get("description") || null,
      published: form.get("published") === "on"
    };

    const res = await fetch("/api/achievements", {
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
    setPhotoUrl(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        {error && <Alert tone="error">{error}</Alert>}
        <div className="grid gap-3 sm:grid-cols-3">
          <Input name="studentName" label="Student Name" required />
          <Input name="courseOrClass" label="Course / Class" />
          <Input name="examName" label="Exam Name" />
        </div>
        <Input name="resultText" label="Result" placeholder="e.g. GPA 5.00" />
        <Textarea name="description" label="Description" />
        <div>
          <label className="text-sm font-medium text-slate-700">Photo</label>
          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="mt-1.5 block text-sm" />
          {uploading && <p className="mt-1 text-xs text-slate-400">Uploading...</p>}
        </div>
        <Checkbox name="published" label="Published" defaultChecked />
        <Button type="submit" loading={submitting}>Add Achievement</Button>
      </form>

      {achievements.length === 0 ? (
        <EmptyState title="No achievements yet" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a) => (
            <div key={a.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                {a.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.photoUrl} alt={a.studentName} className="h-12 w-12 rounded-full object-cover" />
                )}
                <div>
                  <p className="font-medium text-slate-900">{a.studentName}</p>
                  <p className="text-xs text-slate-400">{a.courseOrClass}</p>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-600">{a.examName} — {a.resultText}</p>
              <div className="mt-3 flex items-center justify-between">
                <StatusToggle endpoint={`/api/achievements/${a.id}`} field="published" value={a.published} trueLabel="Published" falseLabel="Hidden" />
                <DeleteButton endpoint={`/api/achievements/${a.id}`} confirmText="Delete this achievement?" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
