import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  CalendarRange,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Wallet,
  FolderOpen,
  Bell,
  Image as ImageIcon,
  Award,
  MessageSquareQuote,
  Mail,
  Settings,
  KeyRound
} from "lucide-react";
import { getCurrentUser } from "@/lib/rbac";
import { getSiteContent } from "@/lib/settings";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/admissions", label: "Admissions", icon: ClipboardList },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/teachers", label: "Teachers", icon: GraduationCap },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/subjects", label: "Subjects", icon: Layers },
  { href: "/admin/batches", label: "Batches", icon: CalendarRange },
  { href: "/admin/routine", label: "Routine", icon: CalendarDays },
  { href: "/admin/attendance", label: "Attendance", icon: ClipboardCheck },
  { href: "/admin/results", label: "Exams & Results", icon: FileText },
  { href: "/admin/fees", label: "Fees & Payments", icon: Wallet },
  { href: "/admin/materials", label: "Study Materials", icon: FolderOpen },
  { href: "/admin/notices", label: "Notices", icon: Bell },
  { href: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/admin/achievements", label: "Achievements", icon: Award },
  { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote },
  { href: "/admin/messages", label: "Contact Messages", icon: Mail },
  { href: "/admin/settings", label: "Website Settings", icon: Settings },
  { href: "/admin/change-password", label: "Change Password", icon: KeyRound }
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
