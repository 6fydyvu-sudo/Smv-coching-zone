import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/rbac";
import { getSiteContent } from "@/lib/settings";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";

const NAV_ITEMS: NavItem[] = [
  { href: "/teacher", label: "Dashboard" },
  { href: "/teacher/batches", label: "My Batches" },
  { href: "/teacher/students", label: "Students" },
  { href: "/teacher/routine", label: "My Routine" },
  { href: "/teacher/attendance", label: "Attendance" },
  { href: "/teacher/results", label: "Exams & Results" },
  { href: "/teacher/materials", label: "Study Materials" },
  { href: "/teacher/notices", label: "Notices" },
  { href: "/teacher/change-password", label: "Change Password" }
];

export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "TEACHER") {
    redirect("/403");
  }
  const content = await getSiteContent();

  return (
    <DashboardShell navItems={NAV_ITEMS} roleLabel="Teacher" userName={user.name} siteName={content.siteName}>
      {children}
    </DashboardShell>
  );
}
