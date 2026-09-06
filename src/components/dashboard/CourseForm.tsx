"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea, Select, Checkbox } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface Teacher {
  id: string;
  user: { name: string };
}
interface Subject {
  id: string;
  nameEn: string;
}
interface CourseData {
  id?: string;
  nameBn?: string;
  nameEn?: string;
  descriptionBn?: string | null;
  descriptionEn?: string | null;
  classGrade?: string | null;
  imageUrl?: string | null;
  primaryTeacherId?: string | null;
  durationText?: string | null;
  monthlyFee?: number;
  admissionFee?: number;
  seatLimit?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  scheduleText?: string | null;
  published?: boolean;
  featured?: boolean;
  subjectIds?: string[];
}

export function CourseForm({
  course,
  teachers,
  subjects
}: {
  course?: CourseData;
  teachers: Teacher[];
  subjects: Subject[];
}) {
  const router = useRouter();
  const isEdit = !!course?.id;
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(course?.imageUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(course?.subjectIds ?? []);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "courses");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);
    if (res.ok) setImageUrl(data.url);
    else setError(data.error ?? "Image upload failed.");
  }

  function toggleSubject(id: string) {
    setSelectedSubjects((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      nameEn: form.get("nameEn"),
      nameBn: form.get("nameBn"),
      descriptionEn: form.get("descriptionEn") || null,
      descriptionBn: form.get("descriptionBn") || null,
      classGrade: form.get("classGrade") || null,
      imageUrl,
      primaryTeacherId: form.get("primaryTeacherId") || null,
      durationText: form.get("durationText") || null,
      monthlyFee: Number(form.get("monthlyFee")),
      admissionFee: Number(form.get("admissionFee") || 0),
      seatLimit: form.get("seatLimit") ? Number(form.get("seatLimit")) : null,
      startDate: form.get("startDate") || null,
      endDate: form.get("endDate") || null,
      scheduleText: form.get("scheduleText") || null,
      published: form.get("published") === "on",
      featured: form.get("featured") === "on",
      subjectIds: selectedSubjects
    };

    const res = await fetch(isEdit ? `/api/courses/${course!.id}` : "/api/courses", {
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

    router.push("/admin/courses");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="nameEn" label="Course Name (English)" defaultValue={course?.nameEn} required />
        <Input name="nameBn" label="Course Name (বাংলা)" defaultValue={course?.nameBn} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Textarea name="descriptionEn" label="Description (English)" defaultValue={course?.descriptionEn ?? ""} />
        <Textarea name="descriptionBn" label="Description (বাংলা)" defaultValue={course?.descriptionBn ?? ""} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Input name="classGrade" label="Class / Grade" defaultValue={course?.classGrade ?? ""} />
        <Select name="primaryTeacherId" label="Lead Teacher" defaultValue={course?.primaryTeacherId ?? ""}>
          <option value="">Not assigned</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.user.name}
            </option>
          ))}
        </Select>
        <Input name="durationText" label="Duration" placeholder="e.g. 6 months" defaultValue={course?.durationText ?? ""} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Input name="monthlyFee" type="number" min={0} step="0.01" label="Monthly Fee (৳)" defaultValue={course?.monthlyFee} required />
        <Input name="admissionFee" type="number" min={0} step="0.01" label="Admission Fee (৳)" defaultValue={course?.admissionFee ?? 0} />
        <Input name="seatLimit" type="number" min={1} label="Seat Limit" defaultValue={course?.seatLimit ?? ""} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Input name="startDate" type="date" label="Start Date" defaultValue={course?.startDate?.slice(0, 10) ?? ""} />
        <Input name="endDate" type="date" label="End Date" defaultValue={course?.endDate?.slice(0, 10) ?? ""} />
        <Input name="scheduleText" label="Schedule" placeholder="e.g. Sat, Mon, Wed 4-6pm" defaultValue={course?.scheduleText ?? ""} />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Subjects</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {subjects.map((s) => (
            <button
              type="button"
              key={s.id}
              onClick={() => toggleSubject(s.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
                selectedSubjects.includes(s.id)
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-slate-300 text-slate-600"
              }`}
            >
              {s.nameEn}
            </button>
          ))}
          {subjects.length === 0 && <p className="text-xs text-slate-400">Add subjects first.</p>}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Course Image</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1.5 block text-sm" />
        {uploading && <p className="mt-1 text-xs text-slate-400">Uploading...</p>}
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="mt-2 h-24 w-40 rounded-lg object-cover" />
        )}
      </div>

      <div className="flex gap-6">
        <Checkbox name="published" label="Published" defaultChecked={course?.published ?? false} />
        <Checkbox name="featured" label="Featured on Homepage" defaultChecked={course?.featured ?? false} />
      </div>

      <Button type="submit" loading={submitting}>
        {isEdit ? "Save Changes" : "Create Course"}
      </Button>
    </form>
  );
}
