import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NoticeForm } from "@/components/dashboard/NoticeForm";

export default async function EditNoticePage({ params }: { params: { id: string } }) {
  const notice = await prisma.notice.findUnique({ where: { id: params.id } });
  if (!notice) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Edit Notice</h1>
      <div className="mt-6">
        <NoticeForm notice={{ ...notice, publishDate: notice.publishDate.toISOString() }} />
      </div>
    </div>
  );
}
