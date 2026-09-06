"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface Course {
  id: string;
  nameEn: string;
  classGrade: string | null;
}
interface Batch {
  id: string;
  name: string;
  courseId: string;
}

export function AdmissionForm({
  courses,
  batches,
  defaultCourseId
}: {
  courses: Course[];
  batches: Batch[];
  defaultCourseId?: string;
}) {
  const router = useRouter();
  const [courseId, setCourseId] = useState(defaultCourseId ?? "");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const filteredBatches = batches.filter((b) => b.courseId === courseId);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "admissions");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);
    if (res.ok) {
      setPhotoUrl(data.url);
    } else {
      setError(data.error ?? "Photo upload failed.");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      applicantNameEn: form.get("applicantNameEn"),
      applicantNameBn: form.get("applicantNameBn") || null,
      fatherName: form.get("fatherName"),
      motherName: form.get("motherName"),
      dob: form.get("dob"),
      gender: form.get("gender"),
      phone: form.get("phone"),
      email: form.get("email") || null,
      address: form.get("address"),
      institution: form.get("institution") || null,
      targetClass: form.get("targetClass"),
      courseId: courseId || null,
      batchPreferenceId: form.get("batchPreferenceId") || null,
      photoUrl,
      additionalInfo: form.get("additionalInfo") || null
    };

    const res = await fetch("/api/admissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please check the form and try again.");
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  if (success) {
    return (
      <Alert tone="success">
        Your admission application has been submitted successfully. Our team will review it and
        contact you soon.
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="applicantNameEn" label="Student Name (English)" required />
        <Input name="applicantNameBn" label="Student Name (বাংলা)" />
        <Input name="fatherName" label="Father's Name" required />
        <Input name="motherName" label="Mother's Name" required />
        <Input name="dob" type="date" label="Date of Birth" required />
        <Select name="gender" label="Gender" required defaultValue="">
          <option value="" disabled>Select</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </Select>
        <Input name="phone" label="Phone" required />
        <Input name="email" type="email" label="Email" />
      </div>

      <Textarea name="address" label="Address" required />
      <Input name="institution" label="School / Madrasa" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="targetClass" label="Class Applying For" required />
        <Select label="Course" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          <option value="">No specific course</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameEn} {c.classGrade ? `(${c.classGrade})` : ""}
            </option>
          ))}
        </Select>
      </div>

      {filteredBatches.length > 0 && (
        <Select name="batchPreferenceId" label="Preferred Batch">
          <option value="">No preference</option>
          {filteredBatches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Select>
      )}

      <div>
        <label className="text-sm font-medium text-slate-700">Student Photo</label>
        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="mt-1.5 block text-sm" />
        {uploading && <p className="mt-1 text-xs text-slate-400">Uploading...</p>}
        {photoUrl && <p className="mt-1 text-xs text-emerald-600">Photo uploaded ✓</p>}
      </div>

      <Textarea name="additionalInfo" label="Additional Information" />

      <Button type="submit" size="lg" className="w-full" loading={submitting}>
        Submit Application
      </Button>
    </form>
  );
}
