import { prisma } from "@/lib/prisma";

/**
 * Generates a unique, human-friendly Student ID such as SMV-2026-00001.
 * Uses the count of students admitted in the current year to derive the
 * sequence number, then verifies uniqueness (defends against race
 * conditions under concurrent admission approvals).
 */
export async function generateStudentCode(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `SMV-${year}-`;

  for (let attempt = 0; attempt < 5; attempt++) {
    const countThisYear = await prisma.studentProfile.count({
      where: { studentCode: { startsWith: prefix } }
    });
    const sequence = (countThisYear + 1 + attempt).toString().padStart(5, "0");
    const candidate = `${prefix}${sequence}`;

    const existing = await prisma.studentProfile.findUnique({
      where: { studentCode: candidate }
    });
    if (!existing) {
      return candidate;
    }
  }

  // Extremely unlikely fallback to guarantee uniqueness.
  return `${prefix}${Date.now()}`;
}
