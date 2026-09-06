import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { courseSchema } from "@/lib/validations";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: { subjectLinks: { include: { subject: true } }, batches: true }
    });
    if (!course) return jsonOk({ error: "Not found" }, 404);
    return jsonOk(course);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(ADMIN_ROLES);
    const body = await req.json();

    // Partial update: only validate/apply fields actually present, except
    // when the full course form is submitted (has nameEn), in which case
    // run the full schema so subjectIds sync correctly.
    if (body.nameEn !== undefined) {
      const data = courseSchema.parse(body);
      const { subjectIds, ...courseData } = data;

      const course = await prisma.$transaction(async (tx) => {
        await tx.courseSubject.deleteMany({ where: { courseId: params.id } });
        return tx.course.update({
          where: { id: params.id },
          data: {
            ...courseData,
            startDate: courseData.startDate ? new Date(courseData.startDate) : null,
            endDate: courseData.endDate ? new Date(courseData.endDate) : null,
            subjectLinks: { create: subjectIds.map((subjectId) => ({ subjectId })) }
          }
        });
      });

      return jsonOk(course);
    }

    // Simple toggle updates (published/featured) from the list view.
    const course = await prisma.course.update({ where: { id: params.id }, data: body });
    return jsonOk(course);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(ADMIN_ROLES);
    await prisma.course.delete({ where: { id: params.id } });
    return jsonOk({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
