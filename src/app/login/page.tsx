import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginForm } from "@/components/site/LoginForm";
import Link from "next/link";
import { getSiteContent } from "@/lib/settings";

export const metadata: Metadata = { title: "Login" };

function roleHome(role?: string) {
  if (role === "SUPER_ADMIN" || role === "ADMIN") return "/admin";
  if (role === "TEACHER") return "/teacher";
  if (role === "STUDENT") return "/student";
  return "/";
}

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session?.user) {
    redirect(roleHome(session.user.role));
  }
  const content = await getSiteContent();

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link href="/" className="text-xl font-bold text-brand-700">
            {content.siteName}
          </Link>
          <p className="mt-1 text-sm text-slate-500">Sign in to your account</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
          <LoginForm />
        </div>
        <p className="mt-4 text-center text-sm text-slate-500">
          <Link href="/" className="hover:underline">
            ← Back to website
          </Link>
        </p>
      </div>
    </div>
  );
}
