"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { StatusToggle } from "@/components/ui/StatusToggle";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";

interface Course { id: string; nameEn: string; }
interface Testimonial {
  id: string;
  name: string;
  message: string;
  rating: number;
  published: boolean;
  course: { nameEn: string } | null;
}

export function TestimonialManager({ testimonials, courses }: { testimonials: Testimonial[]; courses: Course[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      message: form.get("message"),
      courseId: form.get("courseId") || null,
      rating: Number(form.get("rating")),
      published: false
    };

    const res = await fetch("/api/testimonials", {
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
      <form onSubmit={handleSubmit} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
        {error && (
          <div className="sm:col-span-2 lg:col-span-4">
            <Alert tone="error">{error}</Alert>
          </div>
        )}
        <Input name="name" label="Name" required />
        <Select name="courseId" label="Course">
          <option value="">—</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.nameEn}</option>)}
        </Select>
        <Select name="rating" label="Rating" defaultValue="5">
          {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} Stars</option>)}
        </Select>
        <div className="flex items-end">
          <Button type="submit" loading={submitting} className="w-full">Add</Button>
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <Textarea name="message" label="Testimonial" required />
        </div>
      </form>

      {testimonials.length === 0 ? (
        <EmptyState title="No testimonials yet" />
      ) : (
        <Table>
          <Thead>
            <tr><Th>Name</Th><Th>Course</Th><Th>Rating</Th><Th>Message</Th><Th>Published</Th><Th>Actions</Th></tr>
          </Thead>
          <tbody>
            {testimonials.map((t) => (
              <Tr key={t.id}>
                <Td className="font-medium text-slate-900">{t.name}</Td>
                <Td>{t.course?.nameEn ?? "—"}</Td>
                <Td>{"★".repeat(t.rating)}</Td>
                <Td className="max-w-xs truncate">{t.message}</Td>
                <Td>
                  <StatusToggle endpoint={`/api/testimonials/${t.id}`} field="published" value={t.published} trueLabel="Published" falseLabel="Hidden" />
                </Td>
                <Td><DeleteButton endpoint={`/api/testimonials/${t.id}`} confirmText="Delete this testimonial?" /></Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
