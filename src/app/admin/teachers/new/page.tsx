import { TeacherForm } from "@/components/dashboard/TeacherForm";

export default function NewTeacherPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Add Teacher</h1>
      <div className="mt-6">
        <TeacherForm />
      </div>
    </div>
  );
}
