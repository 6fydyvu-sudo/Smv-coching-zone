"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Select, Checkbox } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { EmptyState } from "@/components/ui/EmptyState";

const CATEGORIES = ["Classes", "Exams", "Events", "Prize Giving", "Teachers", "Students", "Other"];

interface Image { id: string; imageUrl: string; caption: string | null; }
interface Album { id: string; titleBn: string; titleEn: string; category: string; published: boolean; images: Image[]; }

export function GalleryManager({ albums }: { albums: Album[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCreateAlbum(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/gallery/albums", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titleEn: form.get("titleEn"),
        titleBn: form.get("titleBn"),
        category: form.get("category"),
        published: true
      })
    });
    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to create album.");
      return;
    }
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreateAlbum} className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-4">
        {error && (
          <div className="sm:col-span-4">
            <Alert tone="error">{error}</Alert>
          </div>
        )}
        <Input name="titleEn" placeholder="Album Title (English)" required />
        <Input name="titleBn" placeholder="Album Title (বাংলা)" required />
        <Select name="category" defaultValue="Classes">
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Button type="submit" loading={submitting}>Create Album</Button>
      </form>

      {albums.length === 0 ? (
        <EmptyState title="No albums yet" />
      ) : (
        <div className="space-y-6">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      )}
    </div>
  );
}

function AlbumCard({ album }: { album: Album }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "gallery");
    const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) {
      setUploading(false);
      setError(uploadData.error ?? "Upload failed.");
      return;
    }
    await fetch("/api/gallery/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ albumId: album.id, imageUrl: uploadData.url })
    });
    setUploading(false);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{album.titleEn}</p>
          <p className="text-xs text-slate-400">{album.category}</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="file" accept="image/*" onChange={handleUpload} className="text-xs" />
          <DeleteButton endpoint={`/api/gallery/albums/${album.id}`} confirmText="Delete this album and all its images?" />
        </div>
      </div>
      {uploading && <p className="mt-2 text-xs text-slate-400">Uploading...</p>}
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      {album.images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {album.images.map((img) => (
            <div key={img.id} className="group relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.imageUrl} alt="" className="h-20 w-full rounded-lg object-cover" />
              <div className="absolute inset-0 hidden items-center justify-center bg-black/40 group-hover:flex">
                <DeleteButton endpoint={`/api/gallery/images/${img.id}`} label="✕" confirmText="Delete this image?" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
