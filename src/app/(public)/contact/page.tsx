import type { Metadata } from "next";
import { getServerDictionary } from "@/lib/locale";
import { getSiteContent } from "@/lib/settings";
import { ContactForm } from "@/components/site/ContactForm";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const { dict } = getServerDictionary();
  const content = await getSiteContent();

  return (
    <div className="container-page py-14">
      <h1 className="text-3xl font-bold text-slate-900">{dict.nav.contact}</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Get in Touch</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            {content.address && <li><strong>Address:</strong> {content.address}</li>}
            {content.phone && <li><strong>Phone:</strong> {content.phone}</li>}
            {content.whatsapp && <li><strong>WhatsApp:</strong> {content.whatsapp}</li>}
            {content.email && <li><strong>Email:</strong> {content.email}</li>}
          </ul>
          {content.mapEmbedUrl && (
            <div className="mt-6 aspect-video overflow-hidden rounded-xl border border-slate-200">
              <iframe src={content.mapEmbedUrl} className="h-full w-full" loading="lazy" title="Location map" />
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-900">Send a Message</h2>
          <div className="mt-4">
            <ContactForm />
          </div>
        </Card>
      </div>
    </div>
  );
}
