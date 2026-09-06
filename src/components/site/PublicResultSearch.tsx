"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/Table";

interface ResultRow {
  examTitle: string;
  subject: string;
  fullMarks: string;
  marksObtained: string | null;
  isAbsent: boolean;
  grade: string | null;
}

export function PublicResultSearch() {
  const [studentCode, setStudentCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<ResultRow[] | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRows(null);
    try {
      const res = await fetch(`/api/public-results?studentCode=${encodeURIComponent(studentCode)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not fetch results.");
        return;
      }
      setRows(data.results);
      setStudentName(data.studentName);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-3">
        <Input
          placeholder="e.g. SMV-2026-00001"
          value={studentCode}
          onChange={(e) => setStudentCode(e.target.value)}
          required
        />
        <Button type="submit" loading={loading}>
          Search
        </Button>
      </form>

      {error && (
        <div className="mt-4">
          <Alert tone="error">{error}</Alert>
        </div>
      )}

      {rows && (
        <div className="mt-6">
          <p className="mb-3 font-medium text-slate-700">Results for {studentName}</p>
          {rows.length === 0 ? (
            <Alert tone="info">No published results found for this Student ID.</Alert>
          ) : (
            <Table>
              <Thead>
                <tr>
                  <Th>Exam</Th>
                  <Th>Subject</Th>
                  <Th>Marks</Th>
                  <Th>Grade</Th>
                </tr>
              </Thead>
              <tbody>
                {rows.map((r, i) => (
                  <Tr key={i}>
                    <Td>{r.examTitle}</Td>
                    <Td>{r.subject}</Td>
                    <Td>{r.isAbsent ? "Absent" : `${r.marksObtained} / ${r.fullMarks}`}</Td>
                    <Td>{r.grade ?? "—"}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
}
