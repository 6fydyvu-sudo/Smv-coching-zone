import { getSiteContent } from "@/lib/settings";
import { SiteSettingsForm } from "@/components/dashboard/SiteSettingsForm";

export default async function AdminSettingsPage() {
  const content = await getSiteContent();
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Website Settings</h1>
      <p className="mt-1 text-sm text-slate-500">
        Edit public website content — no code changes required.
      </p>
      <div className="mt-6">
        <SiteSettingsForm initial={content} />
      </div>
    </div>
  );
}
