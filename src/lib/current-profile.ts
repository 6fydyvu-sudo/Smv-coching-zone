import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/rbac";

/**
 * Loads the TeacherProfile for the current session, redirecting to /403
 * if there isn't one (e.g. a TEACHER-role user whose profile row is
 * somehow missing — should not happen in normal operation, but this
 * keeps every teacher page from crashing if it ever does).
 */
export async function getCurrentTeacherProfile() {
  const user = await getCurrentUser();
  if (!user || user.role !== "TEACHER") redirect("/403");

  const profile = await prisma.teacherProfile.findUnique({
    where: { userId: user.id },
    include: { user: true }
  });
  if (!profile) redirect("/403");
  return profile;
}

export async function getCurrentStudentProfile() {
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") redirect("/403");

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: user.id },
    include: { user: true, course: true, batch: true }
  });
  if (!profile) redirect("/403");
  return profile;
}
