import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  UserCircle,
  CalendarDays,
  ClipboardCheck,
  FileText,
  ClipboardList,
  FolderOpen,
  Wallet,
  Bell,
  BellRing,
  KeyRound
} from "lucide-react";
import { getCurrentUser } from "@/lib/rbac";
import { getSiteContent } from "@/lib/settings";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";

const NAV_ITEMS: NavItem[] = [
  { href: "/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/profile", label: "Profile", icon: UserCircle },
  { href: "/student/routine", label: "Routine", icon: CalendarDays },
  { href: "/student/attendance", label: "Attendance", icon: ClipboardCheck },
  { href: "/student/results", label: "Results", icon: FileText },
  { href: "/student/exams", label: "Exams", icon: ClipboardList },
  { href: "/student/materials", label: "Study Materials", icon: FolderOpen },
  { href: "/student/fees", label: "Fees", icon: Wallet },
  { href: "/student/notices", label: "Notices", icon: Bell },
  { href: "/student/notifications", label: "Notifications", icon: BellRing },
  { href: "/student/change-password", label: "Change Password", icon: KeyRound }
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
