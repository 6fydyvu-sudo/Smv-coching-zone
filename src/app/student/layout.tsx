import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/rbac";
import { getSiteContent } from "@/lib/settings";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";

const NAV_ITEMS: NavItem[] = [
  { href: "/student", label: "Dashboard" },
  { href: "/student/profile", label: "Profile" },
  { href: "/student/routine", label: "Routine" },
  { href: "/student/attendance", label: "Attendance" },
  { href: "/student/results", label: "Results" },
  { href: "/student/exams", label: "Exams" },
  { href: "/student/materials", label: "Study Materials" },
  { href: "/student/fees", label: "Fees" },
  { href: "/student/notices", label: "Notices" },
  { href: "/student/notifications", label: "Notifications" },
  { href: "/student/change-password", label: "Change Password" }
];

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    redirect("/403");
  }
  const content = await getSiteContent();

  return (
    <DashboardShell navItems={NAV_ITEMS} roleLabel="Student" userName={user.name} siteName={content.siteName}>
      {children}
    </DashboardShell>
  );
}
