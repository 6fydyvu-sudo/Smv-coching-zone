"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea, Checkbox } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import type { SiteContent } from "@/lib/settings";

export function SiteSettingsForm({ initial }: { initial: SiteContent }) {
  const router = useRouter();
  const [content, setContent] = useState<SiteContent>(initial);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  function set<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setContent((prev) => ({ ...prev, [key]: value }));
  }

  function setFeature(index: number, field: "titleBn" | "titleEn" | "descBn" | "descEn", value: string) {
    setContent((prev) => {
      const next = [...prev.whyChooseUs];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, whyChooseUs: next };
    });
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "courses");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setUploadingLogo(false);
    if (res.ok) set("logoUrl", data.url);
    else setError(data.error ?? "Logo upload failed.");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(content)
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save settings.");
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <Alert tone="error">{error}</Alert>}
      {success && <Alert tone="success">Website settings saved.</Alert>}

      <Section title="General">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Site Name" value={content.siteName} onChange={(e) => set("siteName", e.target.value)} />
          <Input label="Tagline" value={content.tagline} onChange={(e) => set("tagline", e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Logo</label>
          <input type="file" accept="image/*" onChange={handleLogoUpload} className="mt-1.5 block text-sm" />
          {uploadingLogo && <p className="mt-1 text-xs text-slate-400">Uploading...</p>}
          {content.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={content.logoUrl} alt="Logo" className="mt-2 h-12 w-12 rounded-lg object-cover" />
          )}
        </div>
      </Section>

      <Section title="Hero Section">
        <div className="grid gap-4 sm:grid-cols-2">
          <Textarea label="Headline (English)" value={content.heroHeadlineEn} onChange={(e) => set("heroHeadlineEn", e.target.value)} />
          <Textarea label="Headline (বাংলা)" value={content.heroHeadlineBn} onChange={(e) => set("heroHeadlineBn", e.target.value)} />
          <Textarea label="Subtext (English)" value={content.heroSubtextEn} onChange={(e) => set("heroSubtextEn", e.target.value)} />
          <Textarea label="Subtext (বাংলা)" value={content.heroSubtextBn} onChange={(e) => set("heroSubtextBn", e.target.value)} />
        </div>
      </Section>

      <Section title="About / Mission / Vision">
        <div className="grid gap-4 sm:grid-cols-2">
          <Textarea label="About (English)" value={content.aboutEn} onChange={(e) => set("aboutEn", e.target.value)} />
          <Textarea label="About (বাংলা)" value={content.aboutBn} onChange={(e) => set("aboutBn", e.target.value)} />
          <Textarea label="Mission (English)" value={content.missionEn} onChange={(e) => set("missionEn", e.target.value)} />
          <Textarea label="Mission (বাংলা)" value={content.missionBn} onChange={(e) => set("missionBn", e.target.value)} />
          <Textarea label="Vision (English)" value={content.visionEn} onChange={(e) => set("visionEn", e.target.value)} />
          <Textarea label="Vision (বাংলা)" value={content.visionBn} onChange={(e) => set("visionBn", e.target.value)} />
          <Textarea label="History (English)" value={content.historyEn} onChange={(e) => set("historyEn", e.target.value)} />
          <Textarea label="History (বাংলা)" value={content.historyBn} onChange={(e) => set("historyBn", e.target.value)} />
        </div>
      </Section>

      <Section title="Founder / Director Message">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Founder Name (English)" value={content.founderNameEn} onChange={(e) => set("founderNameEn", e.target.value)} />
          <Input label="Founder Name (বাংলা)" value={content.founderNameBn} onChange={(e) => set("founderNameBn", e.target.value)} />
          <Textarea label="Message (English)" value={content.founderMessageEn} onChange={(e) => set("founderMessageEn", e.target.value)} />
          <Textarea label="Message (বাংলা)" value={content.founderMessageBn} onChange={(e) => set("founderMessageBn", e.target.value)} />
        </div>
      </Section>

      <Section title="Why Choose Us (4 cards)">
        <div className="space-y-4">
          {content.whyChooseUs.map((f, i) => (
            <div key={i} className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
              <Input label="Title (English)" value={f.titleEn} onChange={(e) => setFeature(i, "titleEn", e.target.value)} />
              <Input label="Title (বাংলা)" value={f.titleBn} onChange={(e) => setFeature(i, "titleBn", e.target.value)} />
              <Input label="Description (English)" value={f.descEn} onChange={(e) => setFeature(i, "descEn", e.target.value)} />
              <Input label="Description (বাংলা)" value={f.descBn} onChange={(e) => setFeature(i, "descBn", e.target.value)} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Contact & Social">
        <div className="grid gap-4 sm:grid-cols-2">
          <Textarea label="Address" value={content.address} onChange={(e) => set("address", e.target.value)} />
          <Input label="Phone" value={content.phone} onChange={(e) => set("phone", e.target.value)} />
          <Input label="WhatsApp" value={content.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
          <Input label="Email" value={content.email} onChange={(e) => set("email", e.target.value)} />
          <Input label="Facebook URL" value={content.facebookUrl} onChange={(e) => set("facebookUrl", e.target.value)} />
          <Input label="YouTube URL" value={content.youtubeUrl} onChange={(e) => set("youtubeUrl", e.target.value)} />
        </div>
        <Textarea label="Google Maps Embed URL" value={content.mapEmbedUrl} onChange={(e) => set("mapEmbedUrl", e.target.value)} />
      </Section>

      <Section title="Feature Toggles">
        <div className="flex flex-wrap gap-6">
          <Checkbox label="Admission Open" checked={content.admissionOpen} onChange={(e) => set("admissionOpen", e.target.checked)} />
          <Checkbox label="Registration Open" checked={content.registrationOpen} onChange={(e) => set("registrationOpen", e.target.checked)} />
          <Checkbox
            label="Public Result Search Enabled"
            checked={content.publicResultSearchEnabled}
            onChange={(e) => set("publicResultSearchEnabled", e.target.checked)}
          />
        </div>
      </Section>

      <Section title="SEO Defaults">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Default Page Title" value={content.seoDefaultTitle} onChange={(e) => set("seoDefaultTitle", e.target.value)} />
          <Textarea label="Default Meta Description" value={content.seoDefaultDescription} onChange={(e) => set("seoDefaultDescription", e.target.value)} />
        </div>
      </Section>

      <Button type="submit" size="lg" loading={submitting}>
        Save Website Settings
      </Button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-base font-semibold text-slate-900">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
