import { ChangePasswordForm } from "@/components/dashboard/ChangePasswordForm";

export default function TeacherChangePasswordPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Change Password</h1>
      <div className="mt-6">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
