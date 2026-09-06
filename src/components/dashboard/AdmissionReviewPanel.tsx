"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea, Select, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

interface Batch {
  id: string;
  name: string;
  courseId: string;
}

export function AdmissionReviewPanel({
  admissionId,
  currentStatus,
  reviewNote,
  courseId,
  batches,
  alreadyConverted
}: {
  admissionId: string;
  currentStatus: string;
  reviewNote: string | null;
  courseId: string | null;
  batches: Batch[];
  alreadyConverted: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState(reviewNote ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Convert-to-student form state
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [batchId, setBatchId] = useState(batches[0]?.id ?? "");
  const [converting, setConverting] = useState(false);

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    const res = await fetch(`/api/admissions/${admissionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reviewNote: note })
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to update.");
      return;
    }
    setSuccess("Application updated.");
    router.refresh();
  }

  async function handleConvert(e: React.FormEvent) {
    e.preventDefault();
    setConverting(true);
    setError(null);
    setSuccess(null);
    const res = await fetch(`/api/admissions/${admissionId}/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, temporaryPassword: tempPassword, courseId, batchId })
    });
    const data = await res.json();
    setConverting(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to convert to student.");
      return;
    }
    setSuccess(`Student account created! Student ID: ${data.studentCode}, Email: ${data.email}`);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">{success}</Alert>}

      <form onSubmit={handleReviewSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Review Decision</h2>
        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </Select>
        <Textarea label="Review Note" value={note} onChange={(e) => setNote(e.target.value)} />
        <Button type="submit" loading={submitting}>
          Save Decision
        </Button>
      </form>

      {status === "APPROVED" && !alreadyConverted && (
        <form onSubmit={handleConvert} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-900">Convert to Student Account</h2>
          <Input
            label="Login Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Temporary Password"
            type="text"
            required
            minLength={6}
            value={tempPassword}
            onChange={(e) => setTempPassword(e.target.value)}
          />
          <Select label="Batch" value={batchId} onChange={(e) => setBatchId(e.target.value)} required>
            <option value="" disabled>Select a batch</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </Select>
          {batches.length === 0 && (
            <p className="text-xs text-red-500">
              No batches exist for the selected course yet. Create one under Batches first.
            </p>
          )}
          <Button type="submit" loading={converting} disabled={batches.length === 0}>
            Create Student Account
          </Button>
        </form>
      )}

      {alreadyConverted && <Alert tone="info">This application has already been converted to a student account.</Alert>}
    </div>
  );
}
