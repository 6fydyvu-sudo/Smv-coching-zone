import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <p className="text-6xl font-bold text-red-500">403</p>
      <h1 className="text-xl font-semibold text-slate-900">Access denied</h1>
      <p className="max-w-sm text-sm text-slate-500">
        You don't have permission to view this page with your current account.
      </p>
      <Link href="/" className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white">
        Go back home
      </Link>
    </div>
  );
}
