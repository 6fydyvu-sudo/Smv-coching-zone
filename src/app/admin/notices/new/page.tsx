import { NoticeForm } from "@/components/dashboard/NoticeForm";

export default function NewNoticePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Add Notice</h1>
      <div className="mt-6">
        <NoticeForm />
      </div>
    </div>
  );
}
