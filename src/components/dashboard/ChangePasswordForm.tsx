"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function ChangePasswordForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const res = await fetch("/api/account/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to change password.");
      return;
    }

    setSuccess(true);
    (e.target as HTMLFormElement).reset();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">Password changed successfully.</Alert>}
      <Input name="currentPassword" type="password" label="Current Password" required />
      <Input name="newPassword" type="password" label="New Password" required minLength={6} />
      <Input name="confirmPassword" type="password" label="Confirm New Password" required minLength={6} />
      <Button type="submit" loading={submitting}>
        Update Password
      </Button>
    </form>
  );
}
