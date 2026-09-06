"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-4 text-center">
      <p className="text-5xl font-bold text-red-500">500</p>
      <h1 className="text-xl font-semibold text-slate-900">Something went wrong</h1>
      <p className="max-w-sm text-sm text-slate-500">
        An unexpected error occurred. Please try again, and contact support if the problem persists.
      </p>
      <button onClick={reset} className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white">
        Try again
      </button>
    </div>
  );
}
