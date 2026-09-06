"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea, Select, Checkbox } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface NoticeData {
  id?: string;
  titleBn?: string;
  titleEn?: string;
  bodyBn?: string | null;
  bodyEn?: string | null;
  category?: string | null;
  attachmentUrl?: string | null;
  priority?: string;
  published?: boolean;
  pinned?: boolean;
  publishDate?: string | null;
}

export function NoticeForm({ notice }: { notice?: NoticeData }) {
  const router = useRouter();
  const isEdit = !!notice?.id;
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(notice?.attachmentUrl ?? null);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "notices");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);
    if (res.ok) setAttachmentUrl(data.url);
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
      bodyEn: form.get("bodyEn") || null,
      bodyBn: form.get("bodyBn") || null,
      category: form.get("category") || null,
      attachmentUrl,
      priority: form.get("priority"),
      published: form.get("published") === "on",
      pinned: form.get("pinned") === "on",
      publishDate: form.get("publishDate") || undefined
    };

    const res = await fetch(isEdit ? `/api/notices/${notice!.id}` : "/api/notices", {
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

    router.push("/admin/notices");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="titleEn" label="Title (English)" defaultValue={notice?.titleEn} required />
        <Input name="titleBn" label="Title (বাংলা)" defaultValue={notice?.titleBn} required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Textarea name="bodyEn" label="Body (English)" defaultValue={notice?.bodyEn ?? ""} />
        <Textarea name="bodyBn" label="Body (বাংলা)" defaultValue={notice?.bodyBn ?? ""} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Input name="category" label="Category" defaultValue={notice?.category ?? ""} />
        <Select name="priority" label="Priority" defaultValue={notice?.priority ?? "MEDIUM"}>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </Select>
        <Input name="publishDate" type="date" label="Publish Date" defaultValue={notice?.publishDate?.slice(0, 10) ?? ""} />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Attachment (PDF/Image)</label>
        <input type="file" onChange={handleUpload} className="mt-1.5 block text-sm" />
        {uploading && <p className="mt-1 text-xs text-slate-400">Uploading...</p>}
        {attachmentUrl && <p className="mt-1 text-xs text-emerald-600">File attached ✓</p>}
      </div>

      <div className="flex gap-6">
        <Checkbox name="published" label="Published" defaultChecked={notice?.published ?? false} />
        <Checkbox name="pinned" label="Pinned" defaultChecked={notice?.pinned ?? false} />
      </div>

      <Button type="submit" loading={submitting}>
        {isEdit ? "Save Changes" : "Create Notice"}
      </Button>
    </form>
  );
}
