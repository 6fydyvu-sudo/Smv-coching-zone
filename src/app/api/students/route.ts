import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, ADMIN_ROLES, STAFF_ROLES } from "@/lib/rbac";

// Students are created via Admission -> Convert (see /api/admissions/[id]/convert)
// rather than directly here, so every student has a paper trail back to an
// application. This route supports listing/search/filter for staff.
export async function GET(req: NextRequest) {
  try {
    await requireRole(STAFF_ROLES);

    const q = req.nextUrl.searchParams.get("q")?.trim();
    const courseId = req.nextUrl.searchParams.get("courseId");
    const batchId = req.nextUrl.searchParams.get("batchId");
    const status = req.nextUrl.searchParams.get("status");

    const students = await prisma.studentProfile.findMany({
      where: {
        ...(courseId ? { courseId } : {}),
        ...(batchId ? { batchId } : {}),
        ...(status ? { status: status as "ACTIVE" | "INACTIVE" | "GRADUATED" } : {}),
        ...(q
          ? {
              OR: [
                { studentCode: { contains: q, mode: "insensitive" } },
                { user: { name: { contains: q, mode: "insensitive" } } },
                { user: { email: { contains: q, mode: "insensitive" } } }
              ]
            }
          : {})
      },
      orderBy: { createdAt: "desc" },
      include: { user: true, course: true, batch: true }
    });

    return jsonOk(students);
  } catch (error) {
    return handleApiError(error);
  }
}
