import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { courseSchema } from "@/lib/validations";
import { handleApiError, jsonOk } from "@/lib/api-utils";
import { requireRole, ADMIN_ROLES } from "@/lib/rbac";

export async function GET() {
  try {
    await requireRole(ADMIN_ROLES);
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: { primaryTeacher: { include: { user: true } }, batches: true, _count: { select: { students: true } } }
    });
    return jsonOk(courses);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(ADMIN_ROLES);
    const body = await req.json();
    const data = courseSchema.parse(body);
    const { subjectIds, ...courseData } = data;

    const course = await prisma.course.create({
      data: {
        ...courseData,
        startDate: courseData.startDate ? new Date(courseData.startDate) : null,
        endDate: courseData.endDate ? new Date(courseData.endDate) : null,
        subjectLinks: {
          create: subjectIds.map((subjectId) => ({ subjectId }))
        }
      }
    });

    return jsonOk(course, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
