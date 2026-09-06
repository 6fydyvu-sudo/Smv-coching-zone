"use client";

import { useState } from "react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to send message.");
      return;
    }

    setSuccess(true);
    (e.target as HTMLFormElement).reset();
  }

  if (success) {
    return <Alert tone="success">Thank you! Your message has been sent.</Alert>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert tone="error">{error}</Alert>}
      <Input name="name" label="Name" required />
      <Input name="email" type="email" label="Email" />
      <Input name="phone" label="Phone" />
      <Input name="subject" label="Subject" />
      <Textarea name="message" label="Message" required />
      <Button type="submit" loading={submitting} className="w-full">
        Send Message
      </Button>
    </form>
  );
}
