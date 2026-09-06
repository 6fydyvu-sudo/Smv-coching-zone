"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { EmptyState } from "@/components/ui/EmptyState";

interface Subject {
  id: string;
  nameBn: string;
  nameEn: string;
  code: string | null;
}

export function SubjectManager({ subjects }: { subjects: Subject[] }) {
  const router = useRouter();
  const [nameBn, setNameBn] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nameBn, nameEn, code: code || null })
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to add subject.");
      return;
    }
    setNameBn("");
    setNameEn("");
    setCode("");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-4">
        <Input placeholder="Name (English)" value={nameEn} onChange={(e) => setNameEn(e.target.value)} required />
        <Input placeholder="Name (বাংলা)" value={nameBn} onChange={(e) => setNameBn(e.target.value)} required />
        <Input placeholder="Code (optional)" value={code} onChange={(e) => setCode(e.target.value)} />
        <Button type="submit" loading={submitting}>
          Add Subject
        </Button>
      </form>
      {error && <Alert tone="error">{error}</Alert>}

      {subjects.length === 0 ? (
        <EmptyState title="No subjects yet" description="Add your first subject above." />
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Name (EN)</Th>
              <Th>Name (BN)</Th>
              <Th>Code</Th>
              <Th>Actions</Th>
            </tr>
          </Thead>
          <tbody>
            {subjects.map((s) => (
              <Tr key={s.id}>
                <Td>{s.nameEn}</Td>
                <Td>{s.nameBn}</Td>
                <Td>{s.code ?? "—"}</Td>
                <Td>
                  <DeleteButton endpoint={`/api/subjects/${s.id}`} confirmText="Delete this subject?" />
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
