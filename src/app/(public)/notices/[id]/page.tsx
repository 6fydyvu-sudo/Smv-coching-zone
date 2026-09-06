import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerDictionary } from "@/lib/locale";
import { formatDate } from "@/lib/utils";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const notice = await prisma.notice.findUnique({ where: { id: params.id } });
  return { title: notice?.titleEn ?? "Notice" };
}

export default async function NoticeDetailPage({ params }: { params: { id: string } }) {
  const { locale } = getServerDictionary();
  const notice = await prisma.notice.findUnique({ where: { id: params.id } });

  if (!notice || !notice.published) {
    notFound();
  }

  return (
    <div className="container-page max-w-3xl py-14">
      <p className="text-xs text-slate-400">{formatDate(notice.publishDate, locale)}</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">
        {locale === "bn" ? notice.titleBn : notice.titleEn}
      </h1>
      <div className="prose mt-6 whitespace-pre-line text-slate-700">
        {locale === "bn" ? notice.bodyBn : notice.bodyEn}
      </div>
      {notice.attachmentUrl && (
        <a
          href={notice.attachmentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white"
        >
          Download Attachment
        </a>
      )}
    </div>
  );
}
