import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, ADMIN_ROLES, STAFF_ROLES } from "@/lib/rbac";
import { z } from "zod";

const updateSchema = z.object({
  fatherName: z.string().min(1).optional(),
  motherName: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  institution: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  courseId: z.string().optional().nullable(),
  batchId: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "GRADUATED"]).optional()
});

// :id here is the StudentProfile id.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(STAFF_ROLES);
    const student = await prisma.studentProfile.findUnique({
      where: { id: params.id },
      include: { user: true, course: true, batch: true, enrollments: { include: { batch: true, course: true } } }
    });
    if (!student) return jsonOk({ error: "Not found" }, 404);
    return jsonOk(student);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(ADMIN_ROLES);
    const body = await req.json();
    const data = updateSchema.parse(body);

    const student = await prisma.studentProfile.update({ where: { id: params.id }, data });

    // Keep an Enrollment row in sync when the student's batch is changed
    // from the admin edit screen, so batch-scoped features (routine,
    // attendance, materials) still resolve correctly.
    if (data.batchId && data.courseId) {
      await prisma.enrollment.upsert({
        where: { studentId_batchId: { studentId: params.id, batchId: data.batchId } },
        create: { studentId: params.id, batchId: data.batchId, courseId: data.courseId },
        update: {}
      });
    }

    return jsonOk(student);
  } catch (error) {
    return handleApiError(error);
  }
}

// Deactivate rather than hard-delete, to preserve attendance/result/fee history.
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(ADMIN_ROLES);
    await prisma.studentProfile.update({ where: { id: params.id }, data: { status: "INACTIVE" } });
    return jsonOk({ success: true, note: "Student marked inactive (historical records preserved)." });
  } catch (error) {
    return handleApiError(error);
  }
}
