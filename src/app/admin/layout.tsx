import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/rbac";
import { getSiteContent } from "@/lib/settings";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/admissions", label: "Admissions" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/teachers", label: "Teachers" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/subjects", label: "Subjects" },
  { href: "/admin/batches", label: "Batches" },
  { href: "/admin/routine", label: "Routine" },
  { href: "/admin/attendance", label: "Attendance" },
  { href: "/admin/results", label: "Exams & Results" },
  { href: "/admin/fees", label: "Fees & Payments" },
  { href: "/admin/materials", label: "Study Materials" },
  { href: "/admin/notices", label: "Notices" },
  { href: "/admin/gallery", label: "Gallery" },
  { href: "/admin/achievements", label: "Achievements" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/messages", label: "Contact Messages" },
  { href: "/admin/settings", label: "Website Settings" },
  { href: "/admin/change-password", label: "Change Password" }
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    redirect("/403");
  }
  const content = await getSiteContent();

  return (
    <DashboardShell
      navItems={NAV_ITEMS}
      roleLabel={user.role === "SUPER_ADMIN" ? "Super Admin" : "Admin"}
      userName={user.name}
      siteName={content.siteName}
    >
      {children}
    </DashboardShell>
  );
}
