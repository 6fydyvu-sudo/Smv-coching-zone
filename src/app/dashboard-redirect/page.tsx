import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

// Small server-side redirector so the login form doesn't need to guess the
// role before the session cookie is available.
export default async function DashboardRedirectPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login");
  }
  const role = session.user.role;
  if (role === "SUPER_ADMIN" || role === "ADMIN") redirect("/admin");
  if (role === "TEACHER") redirect("/teacher");
  if (role === "STUDENT") redirect("/student");
  redirect("/");
}
