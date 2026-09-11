import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  CalendarRange,
  Users,
  CalendarDays,
  ClipboardCheck,
  FileText,
  FolderOpen,
  Bell,
  KeyRound
} from "lucide-react";
import { getCurrentUser } from "@/lib/rbac";
import { getSiteContent } from "@/lib/settings";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";

const NAV_ITEMS: NavItem[] = [
  { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teacher/batches", label: "My Batches", icon: CalendarRange },
  { href: "/teacher/students", label: "Students", icon: Users },
  { href: "/teacher/routine", label: "My Routine", icon: CalendarDays },
  { href: "/teacher/attendance", label: "Attendance", icon: ClipboardCheck },
  { href: "/teacher/results", label: "Exams & Results", icon: FileText },
  { href: "/teacher/materials", label: "Study Materials", icon: FolderOpen },
  { href: "/teacher/notices", label: "Notices", icon: Bell },
  { href: "/teacher/change-password", label: "Change Password", icon: KeyRound }
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
