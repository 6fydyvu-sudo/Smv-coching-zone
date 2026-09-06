"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea, Checkbox } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface TeacherData {
  id?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  nameBn?: string | null;
  photoUrl?: string | null;
  qualification?: string | null;
  experienceYears?: number | null;
  subjectSpecialization?: string | null;
  bio?: string | null;
  isActive?: boolean;
}

export function TeacherForm({ teacher }: { teacher?: TeacherData }) {
  const router = useRouter();
  const isEdit = !!teacher?.id;
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(teacher?.photoUrl ?? null);
  const [uploading, setUploading] = useState(false);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "avatars");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);
    if (res.ok) setPhotoUrl(data.url);
    else setError(data.error ?? "Photo upload failed.");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload: Record<string, unknown> = {
      name: form.get("name"),
      phone: form.get("phone") || null,
      nameBn: form.get("nameBn") || null,
      qualification: form.get("qualification") || null,
      experienceYears: form.get("experienceYears") ? Number(form.get("experienceYears")) : null,
      subjectSpecialization: form.get("subjectSpecialization") || null,
      bio: form.get("bio") || null,
      isActive: form.get("isActive") === "on",
      photoUrl
    };
    if (!isEdit) {
      // The email field is disabled (and therefore excluded from FormData)
      // once a teacher exists, since email changes aren't supported by the
      // update endpoint. Only send it on create.
      payload.email = form.get("email");
      payload.temporaryPassword = form.get("temporaryPassword");
    }

    const res = await fetch(isEdit ? `/api/teachers/${teacher!.id}` : "/api/teachers", {
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

    router.push("/admin/teachers");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="name" label="Full Name" defaultValue={teacher?.name} required />
        <Input name="nameBn" label="Name (বাংলা)" defaultValue={teacher?.nameBn ?? ""} />
        <Input name="email" type="email" label="Email" defaultValue={teacher?.email} required disabled={isEdit} />
        <Input name="phone" label="Phone" defaultValue={teacher?.phone ?? ""} />
        {!isEdit && (
          <Input name="temporaryPassword" type="text" label="Temporary Password" required minLength={6} />
        )}
        <Input name="qualification" label="Qualification" defaultValue={teacher?.qualification ?? ""} />
        <Input name="experienceYears" type="number" min={0} label="Experience (years)" defaultValue={teacher?.experienceYears ?? ""} />
        <Input name="subjectSpecialization" label="Subject Specialization" defaultValue={teacher?.subjectSpecialization ?? ""} />
      </div>

      <Textarea name="bio" label="Biography" defaultValue={teacher?.bio ?? ""} />

      <div>
        <label className="text-sm font-medium text-slate-700">Photo</label>
        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="mt-1.5 block text-sm" />
        {uploading && <p className="mt-1 text-xs text-slate-400">Uploading...</p>}
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="" className="mt-2 h-16 w-16 rounded-full object-cover" />
        )}
      </div>

      <Checkbox name="isActive" label="Active" defaultChecked={teacher?.isActive ?? true} />

      <Button type="submit" loading={submitting}>
        {isEdit ? "Save Changes" : "Create Teacher"}
      </Button>
    </form>
  );
}
