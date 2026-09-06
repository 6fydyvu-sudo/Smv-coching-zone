import type { Metadata } from "next";
import { getServerDictionary } from "@/lib/locale";
import { getSiteContent } from "@/lib/settings";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const { locale, dict } = getServerDictionary();
  const content = await getSiteContent();

  const sections = [
    { title: locale === "bn" ? "আমাদের সম্পর্কে" : "About Us", bodyBn: content.aboutBn, bodyEn: content.aboutEn },
    { title: locale === "bn" ? "লক্ষ্য" : "Mission", bodyBn: content.missionBn, bodyEn: content.missionEn },
    { title: locale === "bn" ? "উদ্দেশ্য" : "Vision", bodyBn: content.visionBn, bodyEn: content.visionEn },
    { title: locale === "bn" ? "ইতিহাস" : "History", bodyBn: content.historyBn, bodyEn: content.historyEn }
  ].filter((s) => (locale === "bn" ? s.bodyBn : s.bodyEn));

  return (
    <div className="container-page py-14">
      <h1 className="text-3xl font-bold text-slate-900">{dict.nav.about}</h1>
      <p className="mt-2 max-w-2xl text-slate-500">{content.tagline}</p>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {sections.map((s) => (
          <Card key={s.title}>
            <h2 className="text-lg font-semibold text-slate-900">{s.title}</h2>
            <p className="mt-2 whitespace-pre-line text-slate-600">
              {locale === "bn" ? s.bodyBn : s.bodyEn}
            </p>
          </Card>
        ))}
      </div>

      {(content.founderNameEn || content.founderNameBn) && (
        <Card className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">
            {locale === "bn" ? "প্রতিষ্ঠাতার বার্তা" : "Message from the Founder"}
          </h2>
          <p className="mt-2 whitespace-pre-line text-slate-600">
            {locale === "bn" ? content.founderMessageBn : content.founderMessageEn}
          </p>
          <p className="mt-3 font-medium text-slate-900">
            — {locale === "bn" ? content.founderNameBn : content.founderNameEn}
          </p>
        </Card>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {content.whyChooseUs.map((f, i) => (
          <Card key={i}>
            <p className="font-semibold text-slate-900">{locale === "bn" ? f.titleBn : f.titleEn}</p>
            <p className="mt-1 text-sm text-slate-500">{locale === "bn" ? f.descBn : f.descEn}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
